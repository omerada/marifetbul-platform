// Consolidated payment types
import { Currency } from './orders';

export type PaymentMethodType =
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'digital_wallet'
  | 'crypto';
export type PaymentTransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

// Additional types needed by stores
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: Currency;
  status: PaymentTransactionStatus;
  method: PaymentMethodType;
  createdAt: string;
  processedAt?: string;
}

export interface PaymentHistory {
  transactions: PaymentTransaction[];
  totalAmount: number;
  totalTransactions: number;
  currency: Currency;
}

export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  currency: Currency;
  method: PaymentMethodType;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentResponse {
  payment: Payment;
  clientSecret?: string;
  redirectUrl?: string;
}

export interface PaymentFilters {
  status?: PaymentTransactionStatus[];
  method?: PaymentMethodType[];
  dateRange?: {
    from: string;
    to: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
}

export interface PaymentCard {
  number: string;
  expiryMonth: number;
  expiryYear: number;
  cvc: string;
  name: string;
}

export interface PaymentError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface InvoiceDetails {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: Currency;
}

export interface EscrowDetails {
  id: string;
  orderId: string;
  amount: number;
  currency: Currency;
  status: 'held' | 'released' | 'refunded';
  heldAt: string;
  releaseDate?: string;
}

export interface PaymentMethod {
  id: string;
  type:
    | 'credit_card'
    | 'debit_card'
    | 'bank_transfer'
    | 'digital_wallet'
    | 'crypto';
  name: string;
  details: PaymentMethodDetails;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface PaymentMethodDetails {
  cardNumber?: string; // Masked: **** **** **** 1234
  expiryDate?: string;
  holderName?: string;
  bankName?: string;
  accountNumber?: string; // Masked
  walletAddress?: string;
  walletType?: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  amount: number;
  currency: Currency;
  type: 'payment' | 'refund' | 'partial_refund';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: PaymentMethod;
  gatewayTransactionId?: string;
  gatewayResponse?: Record<string, unknown>;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
}

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'stripe' | 'paypal' | 'iyzico' | 'payu' | 'bank';
  isActive: boolean;
  supportedCurrencies: Currency[];
  supportedMethods: PaymentMethod['type'][];
  fees: PaymentFee[];
  config: Record<string, unknown>;
}

export interface PaymentFee {
  type: 'fixed' | 'percentage';
  amount: number;
  currency?: Currency;
  description: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  number: string;
  issueDate: string;
  dueDate?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  currency: Currency;
  items: InvoiceItem[];
  billTo: BillingAddress;
  notes?: string;
  paidAt?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface BillingAddress {
  name: string;
  email: string;
  company?: string;
  address: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  taxId?: string;
}

export interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  successRate: number;
  averageOrderValue: number;
  refundRate: number;
  currency: Currency;
  period: {
    start: string;
    end: string;
  };
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: Currency;
  orderId: string;
  clientSecret?: string;
  status:
    | 'requires_payment_method'
    | 'requires_confirmation'
    | 'requires_action'
    | 'processing'
    | 'succeeded'
    | 'cancelled';
  createdAt: string;
  stripePaymentIntentId?: string;
}

// ================================================
// STRIPE-SPECIFIC TYPES
// ================================================

export interface StripePaymentIntentRequest {
  orderId: string;
  amount: number;
  currency: Currency;
  metadata?: Record<string, string>;
}

export interface StripePaymentIntentResponse {
  paymentId: string;
  clientSecret: string;
  amount: number;
  currency: Currency;
  status: PaymentIntent['status'];
}

export interface StripeCardElementOptions {
  hidePostalCode?: boolean;
  iconStyle?: 'default' | 'solid';
  style?: {
    base?: Record<string, string>;
    invalid?: Record<string, string>;
  };
}

export interface StripePaymentError {
  type:
    | 'card_error'
    | 'validation_error'
    | 'api_error'
    | 'authentication_error';
  code?: string;
  message: string;
  param?: string;
  decline_code?: string;
}

export interface StripePaymentResult {
  success: boolean;
  paymentIntent?: {
    id: string;
    status: string;
    amount: number;
    currency: string;
  };
  error?: StripePaymentError;
}

// ================================================
// PAYMENT HOOKS RETURN TYPES
// ================================================

export interface UsePaymentIntentReturn {
  createIntent: (
    orderId: string,
    amount: number
  ) => Promise<StripePaymentIntentResponse>;
  isCreating: boolean;
  error: string | null;
  clearError: () => void;
}

export interface UseStripeCheckoutReturn {
  processPayment: (clientSecret: string) => Promise<StripePaymentResult>;
  isProcessing: boolean;
  error: string | null;
  clearError: () => void;
}

export interface UseRefundReturn {
  requestRefund: (
    paymentId: string,
    amount?: number,
    reason?: string
  ) => Promise<boolean>;
  isRefunding: boolean;
  error: string | null;
  clearError: () => void;
}

// ================================================
// CHECKOUT TYPES
// ================================================

export interface CheckoutSession {
  orderId: string;
  packageId?: string;
  amount: number;
  currency: Currency;
  deliveryDate: string;
  requirements?: string;
  notes?: string;
  paymentIntentId?: string;
  clientSecret?: string;
}

export interface OrderSummary {
  packageTitle: string;
  packagePrice: number;
  platformFee: number;
  total: number;
  currency: Currency;
  deliveryDays: number;
  sellerName: string;
  sellerRating: number;
}

export interface PaymentConfirmation {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: Currency;
  paymentIntentId: string;
  status: 'succeeded' | 'processing' | 'requires_action';
  nextSteps: string[];
}
