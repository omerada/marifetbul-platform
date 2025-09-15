import {
  BaseService,
  ServiceResult,
  ServiceOptions,
  createSuccessResult,
  createErrorResult,
} from '../../infrastructure/services/base';

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

      // API call simulation
      const paymentResponse = await this.simulateApiCall('/api/payments', {
        method: 'POST',
        body: {
          orderId: data.orderId,
          amount: data.amount,
          currency: data.currency,
          method: data.method,
          description: data.description,
        },
      });

      const payment: PaymentRecord = {
        id: (paymentResponse.id as string) || `pay-${Date.now()}`,
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        method: data.method,
        status: 'pending',
        description: data.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        escrowStatus: 'held',
        feeAmount: Math.round(data.amount * 0.03), // 3% platform fee
        netAmount: Math.round(data.amount * 0.97),
      };

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

      const paymentResponse = await this.simulateApiCall(
        `/api/payments/${paymentId}`
      );

      if (!paymentResponse) {
        return createSuccessResult(null);
      }

      const payment: PaymentRecord = {
        id: paymentId,
        orderId: (paymentResponse.orderId as string) || 'order-123',
        amount: (paymentResponse.amount as number) || 1500,
        currency: (paymentResponse.currency as string) || 'TRY',
        method: (paymentResponse.method as string) || 'credit_card',
        status:
          (paymentResponse.status as PaymentRecord['status']) || 'completed',
        description: (paymentResponse.description as string) || 'Test payment',
        createdAt:
          (paymentResponse.createdAt as string) || new Date().toISOString(),
        updatedAt:
          (paymentResponse.updatedAt as string) || new Date().toISOString(),
        escrowStatus:
          (paymentResponse.escrowStatus as PaymentRecord['escrowStatus']) ||
          'held',
        feeAmount: (paymentResponse.feeAmount as number) || 45,
        netAmount: (paymentResponse.netAmount as number) || 1455,
      };

      return createSuccessResult(payment);
    } catch (error) {
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
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => queryParams.append(key, v));
          } else {
            queryParams.append(key, value);
          }
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const paymentsResponse = await this.simulateApiCall(
        `/api/payments?${queryParams.toString()}`
      );

      // Mock payment history
      const payments: PaymentRecord[] = [
        {
          id: 'pay-1',
          orderId: 'order-123',
          amount: 1500,
          currency: 'TRY',
          method: 'credit_card',
          status: 'completed',
          description: 'Logo tasarımı',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          escrowStatus: 'released',
          feeAmount: 45,
          netAmount: 1455,
        },
        {
          id: 'pay-2',
          orderId: 'order-124',
          amount: 2500,
          currency: 'TRY',
          method: 'bank_transfer',
          status: 'pending',
          description: 'Web sitesi geliştirme',
          createdAt: new Date(Date.now() - 43200000).toISOString(),
          updatedAt: new Date(Date.now() - 43200000).toISOString(),
          escrowStatus: 'held',
          feeAmount: 75,
          netAmount: 2425,
        },
      ];

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

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const refundResponse = await this.simulateApiCall(
        '/api/payments/refund',
        {
          method: 'POST',
          body: {
            paymentId: data.paymentId,
            amount: data.amount,
            reason: data.reason,
          },
        }
      );

      const payment: PaymentRecord = {
        id: data.paymentId,
        orderId: 'order-123',
        amount: data.amount || 1500,
        currency: 'TRY',
        method: 'credit_card',
        status: 'refunded',
        description: `İade: ${data.reason}`,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        escrowStatus: 'refunded',
        feeAmount: 45,
        netAmount: (data.amount || 1500) - 45,
      };

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

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const releaseResponse = await this.simulateApiCall(
        '/api/payments/escrow/release',
        {
          method: 'POST',
          body: {
            paymentId: data.paymentId,
            reason: data.reason,
          },
        }
      );

      const payment: PaymentRecord = {
        id: data.paymentId,
        orderId: 'order-123',
        amount: 1500,
        currency: 'TRY',
        method: 'credit_card',
        status: 'completed',
        description: 'Escrow serbest bırakıldı',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        escrowStatus: 'released',
        feeAmount: 45,
        netAmount: 1455,
      };

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

      const invoiceResponse = await this.simulateApiCall('/api/invoices', {
        method: 'POST',
        body: { paymentId },
      });

      const invoice: InvoiceRecord = {
        id: (invoiceResponse.id as string) || `inv-${Date.now()}`,
        paymentId,
        orderId: 'order-123',
        invoiceNumber: `INV-${Date.now()}`,
        amount: 1500,
        currency: 'TRY',
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        downloadUrl: `/api/invoices/${invoiceResponse.id || `inv-${Date.now()}`}/download`,
      };

      return createSuccessResult(invoice);
    } catch (error) {
      return createErrorResult(
        `Fatura oluşturulurken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );
    }
  }
}

export default PaymentService;
