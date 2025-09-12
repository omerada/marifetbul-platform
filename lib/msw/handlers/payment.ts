import { http, HttpResponse } from 'msw';
import {
  Payment,
  PaymentHistory,
  CreatePaymentRequest,
  CreatePaymentResponse,
  InvoiceDetails,
  EscrowDetails,
  PaymentMethod,
  Order,
  User,
} from '@/types';

// Mock data generators
const generatePaymentId = () =>
  `pay_${Math.random().toString(36).substr(2, 9)}`;
const generateInvoiceId = () =>
  `inv_${Math.random().toString(36).substr(2, 9)}`;

// Mock payment methods
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'credit_card',
    name: 'Visa ****1234',
    cardNumber: '**** **** **** 1234',
    expiryDate: '12/25',
    cardHolderName: 'John Doe',
    isDefault: true,
    isValid: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'pm_2',
    type: 'credit_card',
    name: 'Mastercard ****5678',
    cardNumber: '**** **** **** 5678',
    expiryDate: '03/26',
    cardHolderName: 'Jane Smith',
    isDefault: false,
    isValid: true,
    createdAt: '2024-02-10T14:30:00Z',
    updatedAt: '2024-02-10T14:30:00Z',
  },
];

// Mock payments
const mockPayments: Payment[] = [
  {
    id: 'payment_1',
    paymentId: 'pay_abc123',
    orderId: 'order_1',
    userId: 'user_1',
    amount: 1500,
    currency: 'TRY',
    method: 'credit_card',
    status: 'completed',
    transactionId: 'txn_xyz789',
    gatewayReference: 'gw_ref_001',
    paymentMethodDetails: {
      type: 'credit_card',
      last4: '1234',
      brand: 'Visa',
      holderName: 'John Doe',
      expiryMonth: '12',
      expiryYear: '25',
    },
    escrowStatus: 'released',
    escrowReleaseDate: '2024-09-10T10:00:00Z',
    fees: {
      platformFee: 75,
      processingFee: 30,
      total: 105,
    },
    invoiceUrl: '/api/v1/invoices/inv_abc123/download',
    receiptUrl: '/api/v1/payments/pay_abc123/receipt',
    refundableAmount: 0,
    metadata: {
      orderType: 'package',
      packageTitle: 'Web Tasarım Hizmeti',
    },
    createdAt: '2024-09-05T10:00:00Z',
    updatedAt: '2024-09-10T10:00:00Z',
    completedAt: '2024-09-05T10:05:00Z',
  },
  {
    id: 'payment_2',
    paymentId: 'pay_def456',
    orderId: 'order_2',
    userId: 'user_1',
    amount: 2500,
    currency: 'TRY',
    method: 'bank_transfer',
    status: 'pending',
    paymentMethodDetails: {
      type: 'bank_transfer',
      bankName: 'Garanti BBVA',
      accountNumber: '****123456',
      holderName: 'John Doe',
    },
    escrowStatus: 'held',
    fees: {
      platformFee: 125,
      processingFee: 0,
      total: 125,
    },
    refundableAmount: 2500,
    metadata: {
      orderType: 'job',
      jobTitle: 'Mobil Uygulama Geliştirme',
    },
    createdAt: '2024-09-12T08:30:00Z',
    updatedAt: '2024-09-12T08:30:00Z',
  },
];

// Mock invoices
const mockInvoices: InvoiceDetails[] = [
  {
    id: 'invoice_1',
    orderId: 'order_1',
    order: {
      id: 'order_1',
      title: 'Web Tasarım Hizmeti',
      amount: 1500,
      status: 'completed',
      userId: 'user_1',
      user: {
        id: 'user_1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        userType: 'employer',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      } as User,
      packageId: 'package_1',
      subtotal: 1500,
      tax: 270,
      discount: 0,
      total: 1770,
      currency: 'TRY',
      paymentStatus: 'paid',
      createdAt: '2024-09-05T10:00:00Z',
      updatedAt: '2024-09-05T10:00:00Z',
    } as Order,
    invoiceNumber: 'INV-2024-001',
    issueDate: '2024-09-05',
    dueDate: '2024-09-05',
    amount: 1500,
    tax: 270,
    totalAmount: 1770,
    currency: 'TRY',
    status: 'paid',
    billingAddress: {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+90 555 123 4567',
      addressLine1: 'Test Mahallesi Test Caddesi No:1',
      city: 'İstanbul',
      state: 'İstanbul',
      postalCode: '34000',
      country: 'Türkiye',
    },
    items: [
      {
        id: 'item_1',
        description: 'Web Tasarım Hizmeti',
        quantity: 1,
        unitPrice: 1500,
        totalPrice: 1500,
      },
    ],
    notes: 'Web sitesi tasarım ve geliştirme hizmeti',
    createdAt: '2024-09-05T10:00:00Z',
    updatedAt: '2024-09-05T10:00:00Z',
    escrowInfo: {
      amount: 1500,
      status: 'released',
      releaseDate: '2024-09-10T10:00:00Z',
    },
    paymentBreakdown: {
      subtotal: 1500,
      platformFee: 75,
      processingFee: 30,
      tax: 270,
      discount: 0,
      total: 1770,
    },
    downloadUrls: {
      pdf: '/api/v1/invoices/invoice_1/download?format=pdf',
      xml: '/api/v1/invoices/invoice_1/download?format=xml',
      print: '/api/v1/invoices/invoice_1/print',
    },
    emailStatus: {
      sent: true,
      sentAt: '2024-09-05T10:05:00Z',
      recipientEmail: 'john@example.com',
    },
  },
];

// Mock escrow details
const mockEscrowDetails: EscrowDetails[] = [
  {
    id: 'escrow_1',
    paymentId: 'pay_abc123',
    amount: 1500,
    currency: 'TRY',
    status: 'released',
    holdStartDate: '2024-09-05T10:00:00Z',
    releaseDate: '2024-09-10T10:00:00Z',
    releaseTrigger: 'manual',
    releaseConditions: ['Order completed', 'No disputes'],
    fees: {
      escrowFee: 15,
      platformFee: 75,
    },
    metadata: {
      releaseReason: 'Order successfully completed',
      approvedBy: 'user_1',
    },
    createdAt: '2024-09-05T10:00:00Z',
    updatedAt: '2024-09-10T10:00:00Z',
  },
];

export const paymentHandlers = [
  // Create payment
  http.post('/api/v1/payments', async ({ request }) => {
    const body = (await request.json()) as CreatePaymentRequest;

    // Validate request
    if (!body.orderId || !body.method || !body.amount) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Eksik ödeme bilgileri',
        },
        { status: 400 }
      );
    }

    // Simulate different payment scenarios
    const shouldFail = Math.random() < 0.1; // 10% failure rate

    if (shouldFail) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Ödeme işlemi başarısız oldu',
        },
        { status: 400 }
      );
    }

    const paymentId = generatePaymentId();
    const isInstantPayment = body.method === 'credit_card';

    const response: CreatePaymentResponse = {
      success: true,
      data: {
        paymentId,
        status: isInstantPayment ? 'completed' : 'pending',
        paymentUrl:
          body.method === 'bank_transfer' ? `/payment/${paymentId}` : undefined,
        invoiceUrl: isInstantPayment
          ? `/api/v1/invoices/${generateInvoiceId()}/download`
          : undefined,
        redirectUrl:
          body.method === 'credit_card' ? '/payment/success' : undefined,
        estimatedCompletionTime: isInstantPayment ? undefined : '1-2 iş günü',
      },
    };

    return HttpResponse.json(response);
  }),

  // Get payment history
  http.get('/api/v1/payments/history', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.getAll('status');
    const method = url.searchParams.getAll('method');

    let filteredPayments = [...mockPayments];

    // Apply filters
    if (status.length > 0) {
      filteredPayments = filteredPayments.filter((p) =>
        status.includes(p.status)
      );
    }
    if (method.length > 0) {
      filteredPayments = filteredPayments.filter((p) =>
        method.includes(p.method)
      );
    }

    const total = filteredPayments.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

    const paymentHistory: PaymentHistory = {
      payments: paginatedPayments,
      summary: {
        totalPayments: mockPayments.length,
        totalAmount: mockPayments.reduce((sum, p) => sum + p.amount, 0),
        successfulPayments: mockPayments.filter((p) => p.status === 'completed')
          .length,
        failedPayments: mockPayments.filter((p) => p.status === 'failed')
          .length,
        refundedAmount: 0,
        escrowAmount: mockPayments
          .filter((p) => p.escrowStatus === 'held')
          .reduce((sum, p) => sum + p.amount, 0),
      },
      pagination: {
        page,
        pageSize: limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    return HttpResponse.json({
      success: true,
      data: paymentHistory,
    });
  }),

  // Get payment by ID
  http.get('/api/v1/payments/:paymentId', ({ params }) => {
    const { paymentId } = params;
    const payment = mockPayments.find((p) => p.paymentId === paymentId);

    if (!payment) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Ödeme bulunamadı',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: payment,
    });
  }),

  // Get payment methods
  http.get('/api/v1/payment-methods', () => {
    return HttpResponse.json({
      success: true,
      data: mockPaymentMethods,
    });
  }),

  // Add payment method
  http.post('/api/v1/payment-methods', async ({ request }) => {
    const body = (await request.json()) as Omit<
      PaymentMethod,
      'id' | 'createdAt' | 'updatedAt'
    >;

    const newMethod: PaymentMethod = {
      ...body,
      id: `pm_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPaymentMethods.push(newMethod);

    return HttpResponse.json({
      success: true,
      data: newMethod,
    });
  }),

  // Delete payment method
  http.delete('/api/v1/payment-methods/:methodId', ({ params }) => {
    const { methodId } = params;
    const index = mockPaymentMethods.findIndex((m) => m.id === methodId);

    if (index === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Ödeme yöntemi bulunamadı',
        },
        { status: 404 }
      );
    }

    mockPaymentMethods.splice(index, 1);

    return HttpResponse.json({
      success: true,
      message: 'Ödeme yöntemi silindi',
    });
  }),

  // Set default payment method
  http.put('/api/v1/payment-methods/:methodId/default', ({ params }) => {
    const { methodId } = params;
    const method = mockPaymentMethods.find((m) => m.id === methodId);

    if (!method) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Ödeme yöntemi bulunamadı',
        },
        { status: 404 }
      );
    }

    // Reset all to non-default
    mockPaymentMethods.forEach((m) => (m.isDefault = false));
    // Set the selected one as default
    method.isDefault = true;

    return HttpResponse.json({
      success: true,
      data: method,
    });
  }),

  // Get invoices
  http.get('/api/v1/invoices', ({ request }) => {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId');
    const paymentId = url.searchParams.get('paymentId');

    let filteredInvoices = [...mockInvoices];

    if (orderId) {
      filteredInvoices = filteredInvoices.filter((i) => i.orderId === orderId);
    }
    if (paymentId) {
      // Find payment and get its invoice
      const payment = mockPayments.find((p) => p.paymentId === paymentId);
      if (payment) {
        filteredInvoices = filteredInvoices.filter(
          (i) => i.orderId === payment.orderId
        );
      }
    }

    return HttpResponse.json({
      success: true,
      data: filteredInvoices,
    });
  }),

  // Generate invoice
  http.post('/api/v1/invoices/generate', async ({ request }) => {
    const body = (await request.json()) as {
      orderId: string;
      paymentId: string;
    };

    const newInvoice: InvoiceDetails = {
      ...mockInvoices[0], // Use first invoice as template
      id: generateInvoiceId(),
      orderId: body.orderId,
      invoiceNumber: `INV-2024-${String(Date.now()).slice(-3)}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      data: newInvoice,
    });
  }),

  // Download invoice
  http.get('/api/v1/invoices/:invoiceId/download', ({ params, request }) => {
    const { invoiceId } = params;
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'pdf';

    const invoice = mockInvoices.find((i) => i.id === invoiceId);

    if (!invoice) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Fatura bulunamadı',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        downloadUrl: `/downloads/invoice_${invoiceId}.${format}`,
        filename: `fatura_${invoice.invoiceNumber}.${format}`,
        contentType: format === 'pdf' ? 'application/pdf' : 'application/xml',
      },
    });
  }),

  // Get escrow details
  http.get('/api/v1/payments/:paymentId/escrow', ({ params }) => {
    const { paymentId } = params;
    const escrow = mockEscrowDetails.find((e) => e.paymentId === paymentId);

    if (!escrow) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Escrow bilgisi bulunamadı',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: escrow,
    });
  }),

  // Release escrow
  http.post(
    '/api/v1/payments/:paymentId/escrow/release',
    async ({ params, request }) => {
      const { paymentId } = params;
      const body = (await request.json()) as {
        amount?: number;
        reason?: string;
      };

      const escrow = mockEscrowDetails.find((e) => e.paymentId === paymentId);

      if (!escrow) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Escrow bulunamadı',
          },
          { status: 404 }
        );
      }

      if (escrow.status !== 'held') {
        return HttpResponse.json(
          {
            success: false,
            error: 'Escrow zaten serbest bırakılmış',
          },
          { status: 400 }
        );
      }

      // Update escrow status
      escrow.status = 'released';
      escrow.releaseDate = new Date().toISOString();
      escrow.metadata = {
        ...escrow.metadata,
        releaseReason: body.reason || 'Manual release',
      };

      return HttpResponse.json({
        success: true,
        data: escrow,
      });
    }
  ),

  // Request refund
  http.post(
    '/api/v1/payments/:paymentId/refund',
    async ({ params, request }) => {
      const { paymentId } = params;
      const body = (await request.json()) as { amount: number; reason: string };

      const payment = mockPayments.find((p) => p.paymentId === paymentId);

      if (!payment) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Ödeme bulunamadı',
          },
          { status: 404 }
        );
      }

      if (payment.status !== 'completed') {
        return HttpResponse.json(
          {
            success: false,
            error: 'Sadece tamamlanmış ödemeler iade edilebilir',
          },
          { status: 400 }
        );
      }

      // Create refund (in real app, this would create a separate refund record)
      payment.status = 'refunded';
      payment.refundableAmount = 0;
      payment.updatedAt = new Date().toISOString();

      return HttpResponse.json({
        success: true,
        message: 'İade işlemi başlatıldı',
        data: {
          refundId: `ref_${Date.now()}`,
          amount: body.amount,
          status: 'processing',
          estimatedCompletion: '3-5 iş günü',
        },
      });
    }
  ),
];
