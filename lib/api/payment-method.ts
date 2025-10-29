/**
 * ================================================
 * PAYMENT METHOD API CLIENT
 * ================================================
 * Handles payment methods (credit cards, bank accounts) management
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { z } from 'zod';
import {
  formatCardNumber as formatCardNumberUtil,
  formatIBAN as formatIBANUtil,
} from '@/lib/shared/formatters';

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export enum PaymentMethodType {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  maskedIdentifier: string;
  cardBrand?: string;
  cardLastFour?: string;
  cardExpiryMonth?: number;
  cardExpiryYear?: number;
  bankName?: string;
  accountLastFour?: string;
  isDefault: boolean;
  isVerified: boolean;
  isExpired?: boolean;
  nickname?: string;
  gateway?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddPaymentMethodRequest {
  type: PaymentMethodType;
  // Card fields
  cardLastFour?: string;
  cardBrand?: string;
  cardExpiryMonth?: number;
  cardExpiryYear?: number;
  cardHolderName?: string;
  // Bank fields
  bankName?: string;
  iban?: string;
  accountHolderName?: string;
  // Common fields
  nickname?: string;
  isDefault?: boolean;
  gateway?: string;
  gatewayPaymentMethodId?: string;
}

export interface UpdatePaymentMethodRequest {
  nickname?: string;
  isDefault?: boolean;
}

export interface AttachStripePaymentMethodRequest {
  stripePaymentMethodId: string;
  nickname?: string;
}

// Schema for validation
const PaymentMethodSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(PaymentMethodType),
  maskedIdentifier: z.string(),
  cardBrand: z.string().optional(),
  cardLastFour: z.string().optional(),
  cardExpiryMonth: z.number().optional(),
  cardExpiryYear: z.number().optional(),
  bankName: z.string().optional(),
  accountLastFour: z.string().optional(),
  isDefault: z.boolean(),
  isVerified: z.boolean(),
  isExpired: z.boolean().optional(),
  nickname: z.string().optional(),
  gateway: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================================================
// PAYMENT METHOD OPERATIONS
// ============================================================================

/**
 * Get all payment methods for current user
 * GET /api/v1/payment-methods
 *
 * @returns {Promise<PaymentMethod[]>} List of payment methods
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const response = await apiClient.get<PaymentMethod[]>('/payment-methods');
  return response.map((pm) => PaymentMethodSchema.parse(pm));
}

/**
 * Get paginated payment methods
 * GET /api/v1/payment-methods?page={page}&size={size}
 *
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size
 * @returns {Promise<PaymentMethod[]>} List of payment methods
 */
export async function getPaymentMethodsPaginated(
  page: number = 0,
  size: number = 20
): Promise<PaymentMethod[]> {
  const response = await apiClient.get<PaymentMethod[]>(
    `/payment-methods?page=${page}&size=${size}`
  );
  return response.map((pm) => PaymentMethodSchema.parse(pm));
}

/**
 * Get payment method by ID
 * GET /api/v1/payment-methods/{id}
 *
 * @param {string} paymentMethodId - Payment method UUID
 * @returns {Promise<PaymentMethod>} Payment method details
 */
export async function getPaymentMethod(
  paymentMethodId: string
): Promise<PaymentMethod> {
  const response = await apiClient.get<PaymentMethod>(
    `/payment-methods/${paymentMethodId}`
  );
  return PaymentMethodSchema.parse(response);
}

/**
 * Add new payment method
 * POST /api/v1/payment-methods
 *
 * @param {AddPaymentMethodRequest} data - Payment method data
 * @returns {Promise<PaymentMethod>} Created payment method
 */
export async function addPaymentMethod(
  data: AddPaymentMethodRequest
): Promise<PaymentMethod> {
  const response = await apiClient.post<PaymentMethod>(
    '/payment-methods',
    data
  );
  return PaymentMethodSchema.parse(response);
}

/**
 * Update payment method
 * PUT /api/v1/payment-methods/{id}
 *
 * @param {string} paymentMethodId - Payment method UUID
 * @param {UpdatePaymentMethodRequest} data - Update data
 * @returns {Promise<PaymentMethod>} Updated payment method
 */
export async function updatePaymentMethod(
  paymentMethodId: string,
  data: UpdatePaymentMethodRequest
): Promise<PaymentMethod> {
  const response = await apiClient.put<PaymentMethod>(
    `/payment-methods/${paymentMethodId}`,
    data
  );
  return PaymentMethodSchema.parse(response);
}

/**
 * Delete payment method
 * DELETE /api/v1/payment-methods/{id}
 *
 * @param {string} paymentMethodId - Payment method UUID
 * @returns {Promise<void>}
 */
export async function deletePaymentMethod(
  paymentMethodId: string
): Promise<void> {
  await apiClient.delete(`/payment-methods/${paymentMethodId}`);
}

/**
 * Set payment method as default
 * POST /api/v1/payment-methods/{id}/set-default
 *
 * @param {string} paymentMethodId - Payment method UUID
 * @returns {Promise<PaymentMethod>} Updated payment method
 */
export async function setPaymentMethodAsDefault(
  paymentMethodId: string
): Promise<PaymentMethod> {
  const response = await apiClient.post<PaymentMethod>(
    `/payment-methods/${paymentMethodId}/set-default`,
    {}
  );
  return PaymentMethodSchema.parse(response);
}

// ============================================================================
// STRIPE INTEGRATION
// ============================================================================

/**
 * Attach Stripe payment method
 * POST /api/v1/payment-methods/stripe/attach
 *
 * @param {AttachStripePaymentMethodRequest} data - Stripe payment method data
 * @returns {Promise<PaymentMethod>} Created payment method
 */
export async function attachStripePaymentMethod(
  data: AttachStripePaymentMethodRequest
): Promise<PaymentMethod> {
  const response = await apiClient.post<PaymentMethod>(
    '/payment-methods/stripe/attach',
    data
  );
  return PaymentMethodSchema.parse(response);
}

/**
 * Detach Stripe payment method
 * DELETE /api/v1/payment-methods/stripe/{id}
 *
 * @param {string} paymentMethodId - Payment method UUID
 * @returns {Promise<void>}
 */
export async function detachStripePaymentMethod(
  paymentMethodId: string
): Promise<void> {
  await apiClient.delete(`/payment-methods/stripe/${paymentMethodId}`);
}

// ============================================================================
// BANK ACCOUNT HELPERS
// ============================================================================

/**
 * Get only bank accounts
 */
export async function getBankAccounts(): Promise<PaymentMethod[]> {
  const allMethods = await getPaymentMethods();
  return allMethods.filter((pm) => pm.type === PaymentMethodType.BANK_TRANSFER);
}

/**
 * Get default bank account
 */
export async function getDefaultBankAccount(): Promise<
  PaymentMethod | undefined
> {
  const bankAccounts = await getBankAccounts();
  return bankAccounts.find((ba) => ba.isDefault);
}

/**
 * Add bank account (helper)
 */
export async function addBankAccount(data: {
  bankName: string;
  iban: string;
  accountHolderName: string;
  nickname?: string;
  isDefault?: boolean;
}): Promise<PaymentMethod> {
  return addPaymentMethod({
    type: PaymentMethodType.BANK_TRANSFER,
    ...data,
  });
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Luhn Algorithm for credit card validation
 * https://en.wikipedia.org/wiki/Luhn_algorithm
 */
export function validateCreditCard(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\D/g, '');

  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);

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
}

/**
 * Detect card brand from card number
 */
export function detectCardBrand(cardNumber: string): string | null {
  const cleanNumber = cardNumber.replace(/\D/g, '');

  // Visa: starts with 4
  if (/^4/.test(cleanNumber)) {
    return 'Visa';
  }

  // Mastercard: starts with 51-55 or 2221-2720
  if (
    /^5[1-5]/.test(cleanNumber) ||
    /^222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720/.test(cleanNumber)
  ) {
    return 'Mastercard';
  }

  // American Express: starts with 34 or 37
  if (/^3[47]/.test(cleanNumber)) {
    return 'American Express';
  }

  // Discover: starts with 6011, 622126-622925, 644-649, 65
  if (
    /^6(?:011|5[0-9]{2}|4[4-9][0-9]|22(?:12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[01][0-9]|92[0-5]))/.test(
      cleanNumber
    )
  ) {
    return 'Discover';
  }

  // Troy (Turkey): starts with 9792
  if (/^9792/.test(cleanNumber)) {
    return 'Troy';
  }

  return null;
}

/**
 * Format card number for display
 * @deprecated Use formatCardNumber from @/lib/shared/formatters instead
 */
export function formatCardNumber(cardNumber: string): string {
  return formatCardNumberUtil(cardNumber, false);
}

/**
 * Mask card number for display
 * @deprecated Use formatCardNumber(cardNumber, true) from @/lib/shared/formatters instead
 */
export function maskCardNumber(cardNumber: string): string {
  return formatCardNumberUtil(cardNumber, true);
}

/**
 * Validate card expiry date
 */
export function validateCardExpiry(month: number, year: number): boolean {
  if (month < 1 || month > 12) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Convert 2-digit year to 4-digit
  const fullYear = year < 100 ? 2000 + year : year;

  if (fullYear < currentYear) {
    return false;
  }

  if (fullYear === currentYear && month < currentMonth) {
    return false;
  }

  return true;
}

/**
 * Validate CVV
 */
export function validateCVV(cvv: string, cardType?: string): boolean {
  const cleanCVV = cvv.replace(/\D/g, '');

  // American Express uses 4-digit CVV
  if (cardType === 'American Express') {
    return cleanCVV.length === 4;
  }

  // Most cards use 3-digit CVV
  return cleanCVV.length === 3;
}

/**
 * Validate Turkish IBAN
 */
export function validateIBAN(iban: string): boolean {
  const cleanIBAN = iban.replace(/\s/g, '');
  return /^TR\d{2}[A-Z0-9]{22}$/.test(cleanIBAN);
}

/**
 * Format IBAN for display
 * @deprecated Use formatIBAN from @/lib/shared/formatters instead
 */
export function formatIBAN(iban: string): string {
  return formatIBANUtil(iban, false);
}

/**
 * Mask IBAN for display
 * @deprecated Use formatIBAN(iban, true) from @/lib/shared/formatters instead
 */
export function maskIBAN(iban: string): string {
  return formatIBANUtil(iban, true);
}

// ============================================================================
// EXPORT API OBJECT
// ============================================================================

export const paymentMethodApi = {
  // CRUD operations
  getPaymentMethods,
  getPaymentMethodsPaginated,
  getPaymentMethod,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setPaymentMethodAsDefault,

  // Bank account helpers
  getBankAccounts,
  getDefaultBankAccount,
  addBankAccount,

  // Card validation helpers
  validateCreditCard,
  detectCardBrand,
  formatCardNumber,
  maskCardNumber,
  validateCardExpiry,
  validateCVV,

  // IBAN validation helpers
  validateIBAN,
  formatIBAN,
  maskIBAN,
};

export default paymentMethodApi;
