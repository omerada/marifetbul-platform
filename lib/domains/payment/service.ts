import {
  BaseService,
  ServiceResult,
  ServiceOptions,
  createSuccessResult,
  createErrorResult,
} from '../../infrastructure/services/base';
import { apiClient } from '../../infrastructure/api/client';
import API_ENDPOINTS from '../../api/endpoints';

export interface PaymentData {
  orderId: string;
  amount: number;
  currency: string;
  method: 'credit_card' | 'bank_transfer' | 'wallet';
  description?: string;
}

export interface RefundData {
  paymentId: string;
  amount?: number; // Partial refund if less than full amount
  reason: string;
}

export interface EscrowReleaseData {
  paymentId: string;
  reason?: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  status:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'refunded';
  description?: string;
  createdAt: string;
  updatedAt: string;
  escrowStatus: 'held' | 'released' | 'refunded';
  feeAmount: number;
  netAmount: number;
}

export interface InvoiceRecord {
  id: string;
  paymentId: string;
  orderId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  downloadUrl: string;
}

export class PaymentService extends BaseService {
  private static instance: PaymentService;

  constructor() {
    super('PaymentService');
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Create a new payment
   */
  async createPayment(
    data: PaymentData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serviceOptions?: ServiceOptions
  ): Promise<ServiceResult<PaymentRecord>> {
    try {
      // Validate input
      if (!data.orderId || !data.amount || !data.currency || !data.method) {
        return createErrorResult('Gerekli ödeme bilgileri eksik');
      }

      if (data.amount <= 0) {
        return createErrorResult("Ödeme tutarı 0'dan büyük olmalı");
      }

      // Real API call
      const payment = await apiClient.post<PaymentRecord>(
        API_ENDPOINTS.PAYMENT.CREATE_INTENT,
        {
          orderId: data.orderId,
          amount: data.amount,
          currency: data.currency,
          method: data.method,
          description: data.description,
        }
      );

      return createSuccessResult(payment);
    } catch (error) {
      return createErrorResult(
        `Ödeme oluşturulurken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );
    }
  }

  /**
   * Fetch payment by ID
   */
  async fetchPaymentById(
    paymentId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serviceOptions?: ServiceOptions
  ): Promise<ServiceResult<PaymentRecord | null>> {
    try {
      if (!paymentId) {
        return createErrorResult('Ödeme ID gerekli');
      }

      const payment = await apiClient.get<PaymentRecord>(
        API_ENDPOINTS.PAYMENT.GET_BY_ID(paymentId)
      );

      return createSuccessResult(payment);
    } catch (error) {
      // If 404, return null instead of error
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        error.status === 404
      ) {
        return createSuccessResult(null);
      }
      return createErrorResult(
        `Ödeme bilgileri alınırken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );
    }
  }

  /**
   * Fetch payment history
   */
  async fetchPaymentHistory(
    filters: {
      status?: string[];
      method?: string[];
      dateFrom?: string;
      dateTo?: string;
      orderId?: string;
    } = {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serviceOptions?: ServiceOptions
  ): Promise<ServiceResult<PaymentRecord[]>> {
    try {
      const queryParams: Record<string, string> = {};

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            queryParams[key] = value.join(',');
          } else {
            queryParams[key] = value;
          }
        }
      });

      const payments = await apiClient.get<PaymentRecord[]>(
        API_ENDPOINTS.PAYMENT.GET_HISTORY,
        queryParams
      );

      return createSuccessResult(payments);
    } catch (error) {
      return createErrorResult(
        `Ödeme geçmişi alınırken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );
    }
  }

  /**
   * Process refund
   */
  async processRefund(
    data: RefundData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serviceOptions?: ServiceOptions
  ): Promise<ServiceResult<PaymentRecord>> {
    try {
      if (!data.paymentId || !data.reason) {
        return createErrorResult('Ödeme ID ve iade nedeni gerekli');
      }

      const payment = await apiClient.post<PaymentRecord>(
        API_ENDPOINTS.PAYMENT.REFUND(data.paymentId),
        {
          amount: data.amount,
          reason: data.reason,
        }
      );

      return createSuccessResult(payment);
    } catch (error) {
      return createErrorResult(
        `İade işlemi sırasında hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );
    }
  }

  /**
   * Release escrow
   */
  async releaseEscrow(
    data: EscrowReleaseData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serviceOptions?: ServiceOptions
  ): Promise<ServiceResult<PaymentRecord>> {
    try {
      if (!data.paymentId) {
        return createErrorResult('Ödeme ID gerekli');
      }

      // Backend should have this endpoint for escrow release
      const payment = await apiClient.post<PaymentRecord>(
        `/payments/${data.paymentId}/escrow/release`,
        {
          reason: data.reason,
        }
      );

      return createSuccessResult(payment);
    } catch (error) {
      return createErrorResult(
        `Escrow serbest bırakılırken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );
    }
  }

  /**
   * Generate invoice
   */
  async generateInvoice(
    paymentId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serviceOptions?: ServiceOptions
  ): Promise<ServiceResult<InvoiceRecord>> {
    try {
      if (!paymentId) {
        return createErrorResult('Ödeme ID gerekli');
      }

      // Backend should have an invoice generation endpoint
      const invoice = await apiClient.post<InvoiceRecord>(`/invoices`, {
        paymentId,
      });

      return createSuccessResult(invoice);
    } catch (error) {
      return createErrorResult(
        `Fatura oluşturulurken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );
    }
  }
}

export default PaymentService;
