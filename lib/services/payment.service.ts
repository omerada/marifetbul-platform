import {
  BaseService,
  ServiceResult,
  ServiceOptions,
  createSuccessResult,
  createErrorResult,
} from './base';

export interface PaymentData {
  orderId: string;
  amount: number;
  currency: string;
  method: 'credit_card' | 'bank_transfer' | 'wallet';
  description?: string;
}

export interface RefundData {
  paymentId: string;
  amount: number;
  reason: string;
}

export interface EscrowReleaseData {
  paymentId: string;
  amount?: number;
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
  escrowStatus?: 'held' | 'released' | 'disputed';
  feeAmount?: number;
  netAmount?: number;
}

export interface InvoiceRecord {
  id: string;
  paymentId: string;
  orderId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
  downloadUrl?: string;
}

/**
 * Payment Service
 * Handles all payment-related business logic
 * Extracted from usePayment hook for better separation of concerns
 */
export class PaymentService extends BaseService {
  constructor() {
    super('PaymentService');
  }

  /**
   * Create a new payment
   */
  async createPayment(
    data: PaymentData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serviceOptions?: ServiceOptions
  ): Promise<ServiceResult<PaymentRecord>> {
    return this.executeOperation('createPayment', async () => {
      // Validate input
      if (!data.orderId || !data.amount || !data.currency || !data.method) {
        return createErrorResult('Gerekli ödeme bilgileri eksik');
      }

      if (data.amount <= 0) {
        return createErrorResult("Ödeme tutarı 0'dan büyük olmalı");
      }

      // API call simulation with proper error handling
      try {
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
          `Ödeme oluşturulamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
        );
      }
    });
  }

  /**
   * Fetch payment by ID
   */
  async fetchPaymentById(
    paymentId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serviceOptions?: ServiceOptions
  ): Promise<ServiceResult<PaymentRecord | null>> {
    return this.executeOperation('fetchPaymentById', async () => {
      if (!paymentId) {
        return createErrorResult('Ödeme ID gereklidir');
      }

      // API call to fetch payment by ID
      try {
        const paymentResponse = await this.simulateApiCall(
          `/api/payments/${paymentId}`,
          {
            method: 'GET',
          }
        );

        // In a real implementation, this would come from the API response
        const mockPayment: PaymentRecord = {
          id: paymentId,
          orderId: (paymentResponse.orderId as string) || 'order-123',
          amount: (paymentResponse.amount as number) || 1500,
          currency: (paymentResponse.currency as string) || 'TRY',
          method: (paymentResponse.method as string) || 'credit_card',
          status:
            (paymentResponse.status as PaymentRecord['status']) || 'completed',
          description:
            (paymentResponse.description as string) ||
            'Web sitesi tasarımı projesi',
          createdAt:
            (paymentResponse.createdAt as string) ||
            new Date(Date.now() - 86400000).toISOString(),
          updatedAt:
            (paymentResponse.updatedAt as string) || new Date().toISOString(),
          escrowStatus:
            (paymentResponse.escrowStatus as PaymentRecord['escrowStatus']) ||
            'released',
          feeAmount: (paymentResponse.feeAmount as number) || 45,
          netAmount: (paymentResponse.netAmount as number) || 1455,
        };

        return createSuccessResult(mockPayment);
      } catch (error) {
        return createErrorResult(
          `Ödeme bulunamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
        );
      }
    });
  }

  /**
   * Fetch payment history with filters
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
    return this.executeOperation('fetchPaymentHistory', async () => {
      // API call to fetch payment history with filters
      try {
        const queryParams = new URLSearchParams();
        if (filters.status?.length)
          queryParams.append('status', filters.status.join(','));
        if (filters.method?.length)
          queryParams.append('method', filters.method.join(','));
        if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
        if (filters.orderId) queryParams.append('orderId', filters.orderId);

        await this.simulateApiCall(`/api/payments?${queryParams.toString()}`, {
          method: 'GET',
        });

        // Mock payment data - in real implementation, this would come from API
        const mockPayments: PaymentRecord[] = [
          {
            id: 'pay-1',
            orderId: 'order-123',
            amount: 1500,
            currency: 'TRY',
            method: 'credit_card',
            status: 'completed',
            description: 'Web sitesi tasarımı projesi',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date().toISOString(),
            escrowStatus: 'released',
            feeAmount: 45,
            netAmount: 1455,
          },
          {
            id: 'pay-2',
            orderId: 'order-124',
            amount: 2000,
            currency: 'TRY',
            method: 'bank_transfer',
            status: 'pending',
            description: 'E-ticaret platformu geliştirme',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 172800000).toISOString(),
            escrowStatus: 'held',
            feeAmount: 60,
            netAmount: 1940,
          },
        ];

        // Apply filters
        let filteredPayments = mockPayments;

        if (filters.status?.length) {
          filteredPayments = filteredPayments.filter((p) =>
            filters.status!.includes(p.status)
          );
        }

        if (filters.method?.length) {
          filteredPayments = filteredPayments.filter((p) =>
            filters.method!.includes(p.method)
          );
        }

        if (filters.dateFrom) {
          filteredPayments = filteredPayments.filter(
            (p) => new Date(p.createdAt) >= new Date(filters.dateFrom!)
          );
        }

        if (filters.dateTo) {
          filteredPayments = filteredPayments.filter(
            (p) => new Date(p.createdAt) <= new Date(filters.dateTo!)
          );
        }

        if (filters.orderId) {
          filteredPayments = filteredPayments.filter(
            (p) => p.orderId === filters.orderId
          );
        }

        return createSuccessResult(filteredPayments);
      } catch (error) {
        return createErrorResult(
          `Ödeme geçmişi alınamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
        );
      }
    });
  }

  /**
   * Process refund
   */
  async processRefund(
    data: RefundData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serviceOptions?: ServiceOptions
  ): Promise<ServiceResult<PaymentRecord>> {
    return this.executeOperation('processRefund', async () => {
      // Validate input
      if (!data.paymentId || !data.amount || !data.reason) {
        return createErrorResult('Gerekli iade bilgileri eksik');
      }

      if (data.amount <= 0) {
        return createErrorResult("İade tutarı 0'dan büyük olmalı");
      }

      // API call to process refund
      try {
        await this.simulateApiCall(`/api/payments/${data.paymentId}/refund`, {
          method: 'POST',
          body: {
            amount: data.amount,
            reason: data.reason,
          },
        });

        const refundedPayment: PaymentRecord = {
          id: data.paymentId,
          orderId: 'order-123',
          amount: 1500,
          currency: 'TRY',
          method: 'credit_card',
          status: 'refunded',
          description: `İade: ${data.reason}`,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          escrowStatus: 'released',
          feeAmount: 45,
          netAmount: 1455,
        };

        return createSuccessResult(refundedPayment);
      } catch (error) {
        return createErrorResult(
          `İade işlemi başarısız: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
        );
      }
    });
  }

  /**
   * Release escrow funds
   */
  async releaseEscrow(
    data: EscrowReleaseData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serviceOptions?: ServiceOptions
  ): Promise<ServiceResult<PaymentRecord>> {
    return this.executeOperation('releaseEscrow', async () => {
      // Validate input
      if (!data.paymentId) {
        return createErrorResult('Ödeme ID gereklidir');
      }

      // API call to release escrow
      try {
        await this.simulateApiCall(
          `/api/payments/${data.paymentId}/escrow/release`,
          {
            method: 'POST',
            body: {
              amount: data.amount,
              reason: data.reason,
            },
          }
        );

        const updatedPayment: PaymentRecord = {
          id: data.paymentId,
          orderId: 'order-123',
          amount: 1500,
          currency: 'TRY',
          method: 'credit_card',
          status: 'completed',
          description: data.reason || 'Escrow serbest bırakıldı',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          escrowStatus: 'released',
          feeAmount: 45,
          netAmount: 1455,
        };

        return createSuccessResult(updatedPayment);
      } catch (error) {
        return createErrorResult(
          `Escrow serbest bırakılamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
        );
      }
    });
  }

  /**
   * Generate invoice
   */
  async generateInvoice(
    orderId: string,
    paymentId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serviceOptions?: ServiceOptions
  ): Promise<ServiceResult<InvoiceRecord>> {
    return this.executeOperation('generateInvoice', async () => {
      // Validate input
      if (!orderId || !paymentId) {
        return createErrorResult('Sipariş ID ve ödeme ID gereklidir');
      }

      // API call to generate invoice
      try {
        const invoiceResponse = await this.simulateApiCall('/api/invoices', {
          method: 'POST',
          body: {
            paymentId,
            orderId,
          },
        });

        const invoice: InvoiceRecord = {
          id: (invoiceResponse.id as string) || `inv-${Date.now()}`,
          paymentId,
          orderId,
          invoiceNumber: `INV-${Date.now()}`,
          amount: 1500,
          currency: 'TRY',
          status: 'sent',
          issuedAt: new Date().toISOString(),
          dueAt: new Date(Date.now() + 2592000000).toISOString(), // 30 days
          downloadUrl: `/api/invoices/${invoiceResponse.id || `inv-${Date.now()}`}/download`,
        };

        return createSuccessResult(invoice);
      } catch (error) {
        return createErrorResult(
          `Fatura oluşturulamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
        );
      }
    });
  }

  /**
   * Validate payment form data
   */
  validatePaymentForm(data: Record<string, unknown>): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    // Validate orderId
    if (!data.orderId || typeof data.orderId !== 'string') {
      errors.orderId = 'Sipariş ID gereklidir';
    }

    // Validate amount
    if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
      errors.amount = 'Geçerli bir tutar giriniz';
    }

    // Validate currency
    if (!data.currency || typeof data.currency !== 'string') {
      errors.currency = 'Para birimi gereklidir';
    }

    // Validate method
    const validMethods = ['credit_card', 'bank_transfer', 'wallet'];
    if (!data.method || !validMethods.includes(data.method as string)) {
      errors.method = 'Geçerli bir ödeme yöntemi seçiniz';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate card details
   */
  validateCardDetails(cardData: Record<string, unknown>): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    // Validate card number
    if (!cardData.cardNumber || typeof cardData.cardNumber !== 'string') {
      errors.cardNumber = 'Kart numarası gereklidir';
    } else {
      const cardNumber = cardData.cardNumber.replace(/\s/g, '');
      if (!/^\d{16}$/.test(cardNumber)) {
        errors.cardNumber = 'Geçerli bir kart numarası giriniz';
      }
    }

    // Validate expiry date
    if (!cardData.expiryDate || typeof cardData.expiryDate !== 'string') {
      errors.expiryDate = 'Son kullanma tarihi gereklidir';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardData.expiryDate)) {
      errors.expiryDate = 'Geçerli bir tarih giriniz (MM/YY)';
    }

    // Validate CVV
    if (!cardData.cvv || typeof cardData.cvv !== 'string') {
      errors.cvv = 'CVV gereklidir';
    } else if (!/^\d{3,4}$/.test(cardData.cvv)) {
      errors.cvv = 'Geçerli bir CVV giriniz';
    }

    // Validate cardholder name
    if (
      !cardData.cardholderName ||
      typeof cardData.cardholderName !== 'string'
    ) {
      errors.cardholderName = 'Kart sahibinin adı gereklidir';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Format payment amount with currency
   */
  formatPaymentAmount(amount: number, currency = 'TRY'): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Get payment status color for UI
   */
  getPaymentStatusColor(status: PaymentRecord['status']): string {
    const statusColors = {
      pending: 'yellow',
      processing: 'blue',
      completed: 'green',
      failed: 'red',
      cancelled: 'gray',
      refunded: 'orange',
    };

    return statusColors[status] || 'gray';
  }

  /**
   * Get escrow status text
   */
  getEscrowStatusText(status: PaymentRecord['escrowStatus']): string {
    const statusTexts = {
      held: 'Emanette',
      released: 'Serbest Bırakıldı',
      disputed: 'İhtilafta',
    };

    return statusTexts[status || 'held'] || 'Bilinmiyor';
  }

  /**
   * Get payment method icon
   */
  getPaymentMethodIcon(method: string): string {
    const methodIcons: Record<string, string> = {
      credit_card: '💳',
      bank_transfer: '🏦',
      wallet: '👛',
    };

    return methodIcons[method] || '💰';
  }
}
