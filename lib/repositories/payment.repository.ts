/**
 * Payment Repository
 * Handles all payment-related API calls with caching and error handling
 */

import { BaseRepository, PaginatedResult } from './BaseRepository';
import { ApiResponse } from '../api/UnifiedApiClient';
import type {
  Payment,
  PaymentHistory,
  CreatePaymentResponse,
  PaymentFilters,
  InvoiceDetails,
  EscrowDetails,
  PaymentMethod,
} from '../../types';
import type { PaginationOptions } from '../services/base';

export interface PaymentData {
  orderId: string;
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  paymentMethodId: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface RefundData {
  paymentId: string;
  amount?: number; // Partial refund if specified
  reason: string;
  description?: string;
}

export interface EscrowReleaseData {
  paymentId: string;
  milestoneId?: string;
  amount?: number; // Partial release if specified
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface InvoiceRecord {
  id: string;
  paymentId: string;
  amount: number;
  tax: number;
  total: number;
  items: Array<{
    description: string;
    amount: number;
    quantity: number;
  }>;
  dueDate: string;
  createdAt: string;
}

export class PaymentRepository extends BaseRepository {
  constructor() {
    super('/api/v1');
  }

  /**
   * Fetch payment history with pagination and filtering
   */
  async fetchPaymentHistory(
    options: PaginationOptions = { page: 1, limit: 20 },
    filters: PaymentFilters = {}
  ): Promise<ApiResponse<PaymentHistory>> {
    const params = {
      page: (options.page || 1).toString(),
      limit: (options.limit || 20).toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined)
      ),
    };

    return this.get<PaymentHistory>('/payments', params, {
      cache: {
        enabled: true,
        ttl: 60000, // 1 minute
      },
      retries: 2,
    });
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string): Promise<ApiResponse<Payment>> {
    return this.get<Payment>(`/payments/${paymentId}`, undefined, {
      cache: {
        enabled: true,
        ttl: 30000, // 30 seconds
      },
    });
  }

  /**
   * Create a new payment
   */
  async createPayment(
    data: PaymentData
  ): Promise<ApiResponse<CreatePaymentResponse>> {
    return this.post<CreatePaymentResponse>('/payments', data);
  }

  /**
   * Process payment refund
   */
  async processRefund(data: RefundData): Promise<ApiResponse<Payment>> {
    const response = await this.post<Payment>('/payments/refund', data);

    // Clear payment cache
    this.clearCache('/payments');

    return response;
  }

  /**
   * Release payment from escrow
   */
  async releaseEscrow(data: EscrowReleaseData): Promise<ApiResponse<Payment>> {
    const response = await this.post<Payment>('/payments/escrow/release', data);

    // Clear payment cache
    this.clearCache('/payments');

    return response;
  }

  /**
   * Get escrow details
   */
  async getEscrowDetails(
    paymentId: string
  ): Promise<ApiResponse<EscrowDetails>> {
    return this.get<EscrowDetails>(`/payments/${paymentId}/escrow`, undefined, {
      cache: {
        enabled: true,
        ttl: 60000, // 1 minute
      },
    });
  }

  /**
   * Generate invoice for payment
   */
  async generateInvoice(
    paymentId: string
  ): Promise<ApiResponse<InvoiceRecord>> {
    return this.post<InvoiceRecord>(`/payments/${paymentId}/invoice`);
  }

  /**
   * Get invoice details
   */
  async getInvoice(invoiceId: string): Promise<ApiResponse<InvoiceDetails>> {
    return this.get<InvoiceDetails>(`/invoices/${invoiceId}`, undefined, {
      cache: {
        enabled: true,
        ttl: 300000, // 5 minutes
      },
    });
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoice(
    invoiceId: string
  ): Promise<ApiResponse<{ url: string }>> {
    return this.get<{ url: string }>(`/invoices/${invoiceId}/download`);
  }

  /**
   * Get payment methods for user
   */
  async getPaymentMethods(): Promise<
    ApiResponse<{ methods: PaymentMethod[] }>
  > {
    return this.get<{ methods: PaymentMethod[] }>(
      '/payments/methods',
      undefined,
      {
        cache: {
          enabled: true,
          ttl: 300000, // 5 minutes
        },
      }
    );
  }

  /**
   * Add new payment method
   */
  async addPaymentMethod(
    method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<PaymentMethod>> {
    const response = await this.post<PaymentMethod>(
      '/payments/methods',
      method
    );

    // Clear payment methods cache
    this.clearCache('/payments/methods');

    return response;
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(
    methodId: string,
    updates: Partial<PaymentMethod>
  ): Promise<ApiResponse<PaymentMethod>> {
    const response = await this.patch<PaymentMethod>(
      `/payments/methods/${methodId}`,
      updates
    );

    // Clear payment methods cache
    this.clearCache('/payments/methods');

    return response;
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(methodId: string): Promise<ApiResponse<void>> {
    const response = await this.delete<void>(`/payments/methods/${methodId}`);

    // Clear payment methods cache
    this.clearCache('/payments/methods');

    return response;
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(
    methodId: string
  ): Promise<ApiResponse<PaymentMethod>> {
    const response = await this.patch<PaymentMethod>(
      `/payments/methods/${methodId}/default`
    );

    // Clear payment methods cache
    this.clearCache('/payments/methods');

    return response;
  }

  /**
   * Verify payment status
   */
  async verifyPayment(paymentId: string): Promise<ApiResponse<Payment>> {
    return this.post<Payment>(`/payments/${paymentId}/verify`);
  }

  /**
   * Cancel pending payment
   */
  async cancelPayment(
    paymentId: string,
    reason?: string
  ): Promise<ApiResponse<Payment>> {
    const response = await this.post<Payment>(`/payments/${paymentId}/cancel`, {
      reason,
    });

    // Clear payment cache
    this.clearCache('/payments');

    return response;
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<
    ApiResponse<{
      totalAmount: number;
      totalTransactions: number;
      successRate: number;
      averageAmount: number;
      currency: string;
      byStatus: Record<string, number>;
      byMethod: Record<string, number>;
      timeline: Array<{
        date: string;
        amount: number;
        count: number;
      }>;
    }>
  > {
    return this.get(
      '/payments/analytics',
      { period },
      {
        cache: {
          enabled: true,
          ttl: 300000, // 5 minutes
        },
      }
    );
  }

  /**
   * Validate payment data before processing
   */
  async validatePayment(data: PaymentData): Promise<
    ApiResponse<{
      valid: boolean;
      errors?: string[];
      warnings?: string[];
    }>
  > {
    return this.post<{
      valid: boolean;
      errors?: string[];
      warnings?: string[];
    }>('/payments/validate', data);
  }

  /**
   * Calculate payment fees
   */
  async calculateFees(
    amount: number,
    currency: string,
    paymentMethod: string
  ): Promise<
    ApiResponse<{
      amount: number;
      platformFee: number;
      processingFee: number;
      total: number;
      breakdown: Record<string, number>;
    }>
  > {
    return this.get(
      '/payments/fees',
      {
        amount: amount.toString(),
        currency,
        paymentMethod,
      },
      {
        cache: {
          enabled: true,
          ttl: 60000, // 1 minute
        },
      }
    );
  }

  /**
   * Request payment dispute
   */
  async createDispute(
    paymentId: string,
    reason: string,
    description: string,
    evidence?: Array<{
      type: string;
      url: string;
      description?: string;
    }>
  ): Promise<
    ApiResponse<{
      id: string;
      status: string;
      createdAt: string;
    }>
  > {
    return this.post(`/payments/${paymentId}/dispute`, {
      reason,
      description,
      evidence,
    });
  }

  /**
   * Get dispute details
   */
  async getDispute(disputeId: string): Promise<
    ApiResponse<{
      id: string;
      paymentId: string;
      status: string;
      reason: string;
      description: string;
      evidence: Array<{
        type: string;
        url: string;
        description?: string;
      }>;
      createdAt: string;
      resolvedAt?: string;
    }>
  > {
    return this.get<{
      id: string;
      paymentId: string;
      status: string;
      reason: string;
      description: string;
      evidence: Array<{
        type: string;
        url: string;
        description?: string;
      }>;
      createdAt: string;
      resolvedAt?: string;
    }>(`/payments/disputes/${disputeId}`);
  }

  /**
   * Setup recurring payment
   */
  async setupRecurringPayment(
    data: PaymentData & {
      interval: 'weekly' | 'monthly' | 'yearly';
      startDate: string;
      endDate?: string;
    }
  ): Promise<
    ApiResponse<{
      id: string;
      status: string;
      nextPaymentDate: string;
    }>
  > {
    return this.post('/payments/recurring', data);
  }

  /**
   * Cancel recurring payment
   */
  async cancelRecurringPayment(
    recurringId: string
  ): Promise<ApiResponse<{ cancelled: boolean }>> {
    const response = await this.delete<{ cancelled: boolean }>(
      `/payments/recurring/${recurringId}`
    );

    // Clear payment cache
    this.clearCache('/payments');

    return response;
  }
}
