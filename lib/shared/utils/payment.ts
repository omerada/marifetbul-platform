// Payment utilities
import { formatCurrency as formatCurrencyCanonical } from '@/lib/shared/formatters';
import { isValidCreditCard } from '@/lib/shared/utils/validation';

// ============================================================================
// Sprint 8: Import canonical types from business domain
// ============================================================================
import type {
  PaymentMethod,
  PaymentTransaction,
  PaymentMethodDetails,
} from '@/types/business/features/payments';

// Re-export for backward compatibility
export type { PaymentMethod, PaymentTransaction, PaymentMethodDetails };

export interface PaymentOptions {
  currency?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  returnUrl?: string;
  cancelUrl?: string;
}

export const calculateFee = (
  amount: number,
  feePercentage: number = 0.029
): number => {
  return amount * feePercentage;
};

export const calculateTotal = (amount: number, fee?: number): number => {
  const calculatedFee = fee ?? calculateFee(amount);
  return amount + calculatedFee;
};

export const formatPrice = (
  price: number,
  currency: string = 'USD'
): string => {
  return formatCurrencyCanonical(price, currency);
};

/**
 * Validate payment amount (business rule: 0 < amount <= 999,999,999)
 * Business-specific validation, not duplicate of canonical
 */
export const validatePaymentAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 999999999; // Max amount validation
};

export const getPaymentMethodIcon = (type: PaymentMethod['type']): string => {
  const icons: Record<PaymentMethod['type'], string> = {
    credit_card: '💳',
    debit_card: '💳',
    bank_transfer: '🏦',
    digital_wallet: '👛',
    crypto: '₿',
  };
  return icons[type] || '💳';
};

export const maskCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  const last4 = cleaned.slice(-4);
  return `**** **** **** ${last4}`;
};

/**
 * Validate card number using Luhn algorithm
 * @deprecated Sprint 7 - Use isValidCreditCard from @/lib/shared/utils/validation
 */
export const validateCardNumber = (cardNumber: string): boolean => {
  return isValidCreditCard(cardNumber);
};

export const getCardBrand = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');

  // Visa
  if (/^4/.test(cleaned)) {
    return 'visa';
  }

  // Mastercard
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
    return 'mastercard';
  }

  // American Express
  if (/^3[47]/.test(cleaned)) {
    return 'amex';
  }

  // Discover
  if (/^6/.test(cleaned)) {
    return 'discover';
  }

  return 'unknown';
};

export const calculateTransactionFee = (
  amount: number,
  feePercentage: number = 2.9
): number => {
  const baseFee = 30; // 30 cents base fee
  const percentageFee = Math.round(amount * (feePercentage / 100));
  return baseFee + percentageFee;
};

export const getTransactionStatusColor = (
  status: PaymentTransaction['status']
): string => {
  const colors: Record<PaymentTransaction['status'], string> = {
    pending: '#FFA500',
    processing: '#3B82F6', // Blue for processing
    completed: '#28A745',
    failed: '#DC3545',
    cancelled: '#6C757D',
  };
  return colors[status] || '#6C757D';
};

export const isPaymentMethodExpired = (
  expiryMonth?: number,
  expiryYear?: number
): boolean => {
  if (!expiryMonth || !expiryYear) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (expiryYear < currentYear) return true;
  if (expiryYear === currentYear && expiryMonth < currentMonth) return true;

  return false;
};
