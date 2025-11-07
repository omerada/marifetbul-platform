// Payment utilities
export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'crypto';
  name: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  isDefault: boolean;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethodId: string;
  description: string;
  createdAt: Date;
  completedAt?: Date;
  failureReason?: string;
}

export interface PaymentOptions {
  currency?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  returnUrl?: string;
  cancelUrl?: string;
}

/**
 * @deprecated Since Sprint 3 Phase 3B (Nov 2025) - Use @/lib/shared/formatters instead
 *
 * **Replaced by:** formatCurrency from lib/shared/formatters.ts
 *
 * **Migration:**
 * ```ts
 * // ❌ OLD
 * import { formatCurrency } from '@/lib/shared/utils/payment';
 *
 * // ✅ NEW
 * import { formatCurrency } from '@/lib/shared/formatters';
 * ```
 *
 * **Timeline:** Will be removed in Sprint 4 (Dec 2025)
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD'
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

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
  return formatCurrency(price, currency);
};

export const validatePaymentAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 999999999; // Max amount validation
};

export const getPaymentMethodIcon = (type: PaymentMethod['type']): string => {
  const icons = {
    credit_card: '💳',
    debit_card: '💳',
    bank_transfer: '🏦',
    crypto: '₿',
  };
  return icons[type] || '💳';
};

export const maskCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  const last4 = cleaned.slice(-4);
  return `**** **** **** ${last4}`;
};

export const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\D/g, '');

  // Basic length validation
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
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
  const colors = {
    pending: '#FFA500',
    completed: '#28A745',
    failed: '#DC3545',
    cancelled: '#6C757D',
    refunded: '#17A2B8',
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
