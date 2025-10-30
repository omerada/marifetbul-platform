import { Payment } from '@/types';
import type { ApiResponse } from '@/types/shared/api';
import { apiClient } from '@/lib/infrastructure/api/client';

export interface CreatePaymentRequest {
  userId: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'fee';
  method: 'credit_card' | 'bank_transfer' | 'crypto';
  entityType?: 'job' | 'package';
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentFilters {
  type?: string[];
  status?: string[];
  method?: string[];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
}

export interface Invoice {
  id: string;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  invoiceNumber: string;
  issuedAt: string;
  dueAt: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  downloadUrl: string;
}

export class PaymentService {
  private static instance: PaymentService;

  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async createPayment(request: CreatePaymentRequest): Promise<Payment> {
    const response = await apiClient.post<ApiResponse<{ payment: Payment }>>(
      '/payments',
      request
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create payment');
    }

    return response.data.payment;
  }

  async getPayment(paymentId: string): Promise<Payment> {
    const response = await apiClient.get<ApiResponse<{ payment: Payment }>>(
      `/payments/${paymentId}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch payment');
    }

    return response.data.payment;
  }

  async getPaymentHistory(
    userId: string,
    filters?: PaymentFilters
  ): Promise<Payment[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type.join(','));
    if (filters?.status) params.append('status', filters.status.join(','));
    if (filters?.method) params.append('method', filters.method.join(','));
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.minAmount)
      params.append('minAmount', String(filters.minAmount));
    if (filters?.maxAmount)
      params.append('maxAmount', String(filters.maxAmount));

    const response = await apiClient.get<ApiResponse<{ payments: Payment[] }>>(
      `/payments/history/${userId}?${params.toString()}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch payment history');
    }

    return response.data.payments || [];
  }

  async requestRefund(refundRequest: RefundRequest): Promise<Payment> {
    const response = await apiClient.post<ApiResponse<{ payment: Payment }>>(
      `/payments/${refundRequest.paymentId}/refund`,
      {
        amount: refundRequest.amount,
        reason: refundRequest.reason,
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to request refund');
    }

    return response.data.payment;
  }

  async releaseEscrow(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<Payment> {
    const response = await apiClient.post<ApiResponse<{ payment: Payment }>>(
      `/payments/${paymentId}/release-escrow`,
      { amount, reason }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to release escrow');
    }

    return response.data.payment;
  }

  async generateInvoice(orderId: string, paymentId: string): Promise<Invoice> {
    const response = await apiClient.post<ApiResponse<{ invoice: Invoice }>>(
      `/payments/${paymentId}/invoice`,
      { orderId }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to generate invoice');
    }

    return response.data.invoice;
  }

  async cancelPayment(paymentId: string, reason: string): Promise<Payment> {
    const response = await apiClient.post<ApiResponse<{ payment: Payment }>>(
      `/payments/${paymentId}/cancel`,
      { reason }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to cancel payment');
    }

    return response.data.payment;
  }
}
