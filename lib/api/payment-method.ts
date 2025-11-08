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

// Sprint 2: Removed unused canonical imports - use directly from @/lib/shared/utils/validation where needed

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export enum PaymentMethodType {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

// ============================================================================
// Sprint 8: Backend API PaymentMethod (adapter type)
// ============================================================================
// Note: Backend API uses different structure than domain PaymentMethod

/**
 * Backend API Payment Method response structure
 * Different from domain PaymentMethod in types/business/features/payments.ts
 */
export interface ApiPaymentMethod {
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

/**
 * @deprecated Sprint 8 - Use ApiPaymentMethod for backend API
 * Type alias for backward compatibility
 */
export type PaymentMethod = ApiPaymentMethod;

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

export interface AttachIyzicoPaymentMethodRequest {
  iyzicoPaymentCardKey: string;
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
// IYZICO INTEGRATION
// ============================================================================

/**
 * Attach Iyzico payment method
 * POST /api/v1/payment-methods/iyzico/attach
 *
 * @param {AttachIyzicoPaymentMethodRequest} data - Iyzico payment method data
 * @returns {Promise<PaymentMethod>} Created payment method
 */
export async function attachIyzicoPaymentMethod(
  data: AttachIyzicoPaymentMethodRequest
): Promise<PaymentMethod> {
  const response = await apiClient.post<PaymentMethod>(
    '/payment-methods/iyzico/attach',
    data
  );
  return PaymentMethodSchema.parse(response);
}

/**
 * Detach Iyzico payment method
 * DELETE /api/v1/payment-methods/iyzico/{id}
 *
 * @param {string} paymentMethodId - Payment method UUID
 * @returns {Promise<void>}
 */
export async function detachIyzicoPaymentMethod(
  paymentMethodId: string
): Promise<void> {
  await apiClient.delete(`/payment-methods/iyzico/${paymentMethodId}`);
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
// Sprint 2: Deprecated validation wrappers removed
// Use functions directly from @/lib/shared/utils/validation:
// - isValidCreditCard (was: validateCreditCard)
// - getCreditCardType (was: detectCardBrand)
// - isValidIBAN (was: validateIBAN)

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

// Sprint 2: validateIBAN wrapper removed - use isValidIBAN from @/lib/shared/utils/validation directly

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

  // Validation helpers (non-deprecated)
  validateCardExpiry,
  validateCVV,

  // Sprint 2: Removed deprecated exports:
  // - validateCreditCard → use isValidCreditCard from @/lib/shared/utils/validation
  // - detectCardBrand → use getCreditCardType from @/lib/shared/utils/validation
  // - validateIBAN → use isValidIBAN from @/lib/shared/utils/validation
};

export default paymentMethodApi;
