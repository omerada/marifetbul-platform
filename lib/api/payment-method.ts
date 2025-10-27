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
  accountHolderName?: string;
  iban?: string;
  isDefault: boolean;
  isVerified: boolean;
  nickname?: string;
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
  accountHolderName: z.string().optional(),
  iban: z.string().optional(),
  isDefault: z.boolean(),
  isVerified: z.boolean(),
  nickname: z.string().optional(),
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
 * PUT /api/v1/payment-methods/{id}/default
 *
 * @param {string} paymentMethodId - Payment method UUID
 * @returns {Promise<PaymentMethod>} Updated payment method
 */
export async function setPaymentMethodAsDefault(
  paymentMethodId: string
): Promise<PaymentMethod> {
  const response = await apiClient.put<PaymentMethod>(
    `/payment-methods/${paymentMethodId}/default`
  );
  return PaymentMethodSchema.parse(response);
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
 * Validate Turkish IBAN
 */
export function validateIBAN(iban: string): boolean {
  const cleanIBAN = iban.replace(/\s/g, '');
  return /^TR\d{2}[A-Z0-9]{22}$/.test(cleanIBAN);
}

/**
 * Format IBAN for display
 */
export function formatIBAN(iban: string): string {
  const cleanIBAN = iban.replace(/\s/g, '');
  return cleanIBAN.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Mask IBAN for display
 */
export function maskIBAN(iban: string): string {
  if (!iban || iban.length < 8) return '****';
  const cleanIBAN = iban.replace(/\s/g, '');
  const lastFour = cleanIBAN.slice(-4);
  return `TR** **** **** **** **** **** ${lastFour}`;
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

  // Validation helpers
  validateIBAN,
  formatIBAN,
  maskIBAN,
};

export default paymentMethodApi;
