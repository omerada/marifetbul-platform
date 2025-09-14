/**
 * Payment utility functions
 * Mock payment processing and validation
 */

import { PaymentCard, BillingAddress } from '@/types';

// Currency formatting
export const formatCurrency = (
  amount: number,
  currency: 'TRY' | 'USD' | 'EUR' = 'TRY'
): string => {
  const currencySymbols = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
  };

  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace(currency, currencySymbols[currency]);
};

// Card number formatting and validation
export const formatCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  return formatted.substring(0, 19); // Max 16 digits + 3 spaces
};

export const maskCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 4) return cardNumber;

  const last4 = cleaned.slice(-4);
  const masked = '**** **** **** ' + last4;
  return masked;
};

// Card validation
export const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\D/g, '');

  // Basic length check
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

export const validateExpiryDate = (month: string, year: string): boolean => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const expMonth = parseInt(month);
  const expYear = parseInt(year);

  if (expMonth < 1 || expMonth > 12) {
    return false;
  }

  if (expYear < currentYear) {
    return false;
  }

  if (expYear === currentYear && expMonth < currentMonth) {
    return false;
  }

  return true;
};

export const validateCVV = (cvv: string, cardType?: string): boolean => {
  const cleaned = cvv.replace(/\D/g, '');

  // American Express uses 4 digits, others use 3
  if (cardType === 'amex') {
    return cleaned.length === 4;
  }

  return cleaned.length === 3;
};

// Card type detection
export const getCardType = (cardNumber: string): string => {
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

// Card brand icons
export const getCardIcon = (cardType: string): string => {
  const icons: Record<string, string> = {
    visa: '💳',
    mastercard: '💳',
    amex: '💳',
    discover: '💳',
    unknown: '💳',
  };

  return icons[cardType] || icons.unknown;
};

// Payment validation
export const validatePaymentCard = (
  card: PaymentCard
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Card number validation
  if (!card.cardNumber || !validateCardNumber(card.cardNumber)) {
    errors.push('Geçersiz kart numarası');
  }

  // Expiry date validation
  if (
    !card.expiryMonth ||
    !card.expiryYear ||
    !validateExpiryDate(String(card.expiryMonth), String(card.expiryYear))
  ) {
    errors.push('Geçersiz son kullanma tarihi');
  }

  // CVV validation
  const cardType = getCardType(card.cardNumber || '');
  if (!card.cvv || !validateCVV(card.cvv, cardType)) {
    errors.push('Geçersiz CVV kodu');
  }

  // Cardholder name validation
  if (!card.cardHolderName || card.cardHolderName.trim().length < 2) {
    errors.push('Kart sahibi adı gerekli');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Billing address validation
export const validateBillingAddress = (
  address: BillingAddress
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!address.fullName || address.fullName.trim().length < 2) {
    errors.push('Ad soyad gerekli');
  }

  if (!address.addressLine1 || address.addressLine1.trim().length < 5) {
    errors.push('Adres gerekli');
  }

  if (!address.city || address.city.trim().length < 2) {
    errors.push('Şehir gerekli');
  }

  if (!address.state || address.state.trim().length < 2) {
    errors.push('İl/Bölge gerekli');
  }

  if (!address.postalCode || address.postalCode.trim().length < 5) {
    errors.push('Posta kodu gerekli');
  }

  if (!address.country || address.country.trim().length < 2) {
    errors.push('Ülke gerekli');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Mock payment processing
export const processPayment = async (
  amount: number,
  currency: string,
  card: PaymentCard
): Promise<{
  success: boolean;
  transactionId?: string;
  error?: string;
}> => {
  // Simulate processing delay
  await new Promise((resolve) =>
    setTimeout(resolve, 2000 + Math.random() * 3000)
  );

  // Basic validation
  const cardValidation = validateCardNumber(card.cardNumber || '');
  if (!cardValidation) {
    return {
      success: false,
      error: 'Geçersiz kart numarası',
    };
  }

  // Simulate random failures (10% chance)
  if (Math.random() < 0.1) {
    const errors = [
      'Yetersiz bakiye',
      'Kart reddedildi',
      'Banka hatası',
      'Geçersiz işlem',
      'Kart limiti aşıldı',
    ];

    return {
      success: false,
      error: errors[Math.floor(Math.random() * errors.length)],
    };
  }

  // Success case with transaction ID based on amount and currency
  return {
    success: true,
    transactionId: `${currency.toLowerCase()}_${amount}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
};

// Generate invoice number
export const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();

  return `INV-${year}${month}-${random}`;
};

// Calculate order total with tax and discount
export const calculateOrderTotal = (
  subtotal: number,
  tax: number,
  discount: number = 0
): number => {
  return subtotal + tax - discount;
};

export const formatExpiryDate = (value: string): string => {
  // Remove non-digits
  const cleaned = value.replace(/\D/g, '');

  // Add slash after month
  if (cleaned.length >= 2) {
    return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
  }

  return cleaned;
};

// Calculate tax
export const calculateTax = (
  amount: number,
  taxRate: number = 0.18
): number => {
  return Math.round(amount * taxRate * 100) / 100;
};

// Calculate total with tax
export const calculateTotalWithTax = (
  amount: number,
  taxRate: number = 0.18
): number => {
  return amount + calculateTax(amount, taxRate);
};

// Payment status colors and labels
export const getPaymentStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'text-yellow-600 bg-yellow-100',
    processing: 'text-blue-600 bg-blue-100',
    succeeded: 'text-green-600 bg-green-100',
    completed: 'text-green-600 bg-green-100',
    failed: 'text-red-600 bg-red-100',
    canceled: 'text-gray-600 bg-gray-100',
    refunded: 'text-purple-600 bg-purple-100',
  };

  return colors[status] || colors.pending;
};

export const getPaymentStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Beklemede',
    processing: 'İşleniyor',
    succeeded: 'Başarılı',
    completed: 'Tamamlandı',
    failed: 'Başarısız',
    canceled: 'İptal',
    refunded: 'İade',
  };

  return labels[status] || status;
};
