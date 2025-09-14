import { Payment } from '@/lib/types';

export interface CreatePaymentRequest {
  userId: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'fee';
  method: 'credit_card' | 'paypal' | 'bank_transfer' | 'crypto';
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
  private baseUrl = '/api/payments';

  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async createPayment(request: CreatePaymentRequest): Promise<Payment> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment');
    }

    const data = await response.json();
    return data.payment;
  }

  async getPayment(paymentId: string): Promise<Payment> {
    const response = await fetch(`${this.baseUrl}/${paymentId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch payment');
    }

    const data = await response.json();
    return data.payment;
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

    const response = await fetch(
      `${this.baseUrl}/history/${userId}?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }

    const data = await response.json();
    return data.payments || [];
  }

  async requestRefund(refundRequest: RefundRequest): Promise<Payment> {
    const response = await fetch(
      `${this.baseUrl}/${refundRequest.paymentId}/refund`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: refundRequest.amount,
          reason: refundRequest.reason,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to request refund');
    }

    const data = await response.json();
    return data.payment;
  }

  async releaseEscrow(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<Payment> {
    const response = await fetch(
      `${this.baseUrl}/${paymentId}/release-escrow`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, reason }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to release escrow');
    }

    const data = await response.json();
    return data.payment;
  }

  async generateInvoice(orderId: string, paymentId: string): Promise<Invoice> {
    const response = await fetch(`${this.baseUrl}/${paymentId}/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate invoice');
    }

    const data = await response.json();
    return data.invoice;
  }

  async cancelPayment(paymentId: string, reason: string): Promise<Payment> {
    const response = await fetch(`${this.baseUrl}/${paymentId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel payment');
    }

    const data = await response.json();
    return data.payment;
  }
}
