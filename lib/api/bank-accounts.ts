/**
 * ================================================
 * BANK ACCOUNT API CLIENT
 * ================================================
 * API client for bank account management
 *
 * Sprint: Wallet System Completion
 * Story: Bank Account Management API
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created November 3, 2025
 *
 * Handles:
 * - Add bank account with IBAN validation
 * - List user's bank accounts
 * - Set default bank account
 * - Remove bank account
 * - Get verification status
 */

import { apiClient } from '../infrastructure/api/client';

// Sprint 2: Removed unused import - validateTurkishIBAN (use directly from @/lib/utils/iban-validator where needed)

// ================================================
// TYPES
// ================================================

export enum BankAccountStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export interface AddBankAccountRequest {
  iban: string; // Turkish IBAN (TR + 24 digits)
  accountHolder: string; // Account holder full name
  bankName?: string; // Optional: Auto-detected from IBAN
  bankCode?: string; // Optional: Auto-detected from IBAN
}

export interface BankAccountResponse {
  id: string;
  userId: string;
  iban: string; // Full IBAN
  maskedIban: string; // Masked for display (e.g., "TR33 **** 1326")
  bankCode: string; // 5-digit bank code
  bankName: string; // Bank name (e.g., "Garanti BBVA")
  accountHolder: string; // Account holder name
  isDefault: boolean;
  status: BankAccountStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ================================================
// USER OPERATIONS
// ================================================

/**
 * Add a new bank account
 *
 * POST /api/v1/wallet/bank-accounts
 *
 * Validates IBAN format and checksum
 * Auto-detects Turkish bank from IBAN
 * Requires admin verification before first payout
 *
 * @param request Bank account details
 * @returns Created bank account (PENDING status)
 */
export async function addBankAccount(
  request: AddBankAccountRequest
): Promise<BankAccountResponse> {
  return apiClient.post<BankAccountResponse>(
    '/v1/wallet/bank-accounts',
    request
  );
}

/**
 * Get all bank accounts for current user
 *
 * GET /api/v1/wallet/bank-accounts
 *
 * Returns only active (non-archived) accounts
 * Sorted by: default first, then creation date
 *
 * @returns List of bank accounts
 */
export async function getBankAccounts(): Promise<BankAccountResponse[]> {
  return apiClient.get<BankAccountResponse[]>('/v1/wallet/bank-accounts');
}

/**
 * Get verified bank accounts only
 *
 * GET /api/v1/wallet/bank-accounts/verified
 *
 * @returns List of verified bank accounts
 */
export async function getVerifiedBankAccounts(): Promise<
  BankAccountResponse[]
> {
  return apiClient.get<BankAccountResponse[]>(
    '/v1/wallet/bank-accounts/verified'
  );
}

/**
 * Get default bank account
 *
 * GET /api/v1/wallet/bank-accounts/default
 *
 * @returns Default bank account or null
 */
export async function getDefaultBankAccount(): Promise<BankAccountResponse | null> {
  try {
    return await apiClient.get<BankAccountResponse>(
      '/v1/wallet/bank-accounts/default'
    );
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      error.status === 404
    ) {
      return null;
    }
    throw error;
  }
}

/**
 * Set bank account as default
 *
 * PUT /api/v1/wallet/bank-accounts/{id}/set-default
 *
 * Unsets previous default account automatically
 *
 * @param id Bank account ID
 * @returns Updated bank account
 */
export async function setDefaultBankAccount(
  id: string
): Promise<BankAccountResponse> {
  return apiClient.put<BankAccountResponse>(
    `/v1/wallet/bank-accounts/${id}/set-default`,
    {}
  );
}

/**
 * Remove (archive) bank account
 *
 * DELETE /api/v1/wallet/bank-accounts/{id}
 *
 * Soft delete: Account is archived, not permanently deleted
 * Cannot remove account with pending payouts
 *
 * @param id Bank account ID
 */
export async function removeBankAccount(id: string): Promise<void> {
  await apiClient.delete(`/v1/wallet/bank-accounts/${id}`);
}

// ================================================
// ADMIN OPERATIONS
// ================================================

/**
 * Get pending bank accounts for verification (Admin only)
 *
 * GET /api/v1/bank-accounts/admin/pending
 *
 * @param params Pagination and sorting parameters
 * @returns Paginated pending accounts
 */
export async function getPendingBankAccounts(params?: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}): Promise<{
  content: BankAccountResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}> {
  const {
    page = 0,
    size = 20,
    sortBy = 'createdAt',
    sortDirection = 'ASC',
  } = params || {};

  return apiClient.get<{
    content: BankAccountResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }>('/v1/bank-accounts/admin/pending', {
    page: page.toString(),
    size: size.toString(),
    sortBy,
    sortDirection,
  });
}

/**
 * Verify bank account (Admin only)
 *
 * PUT /api/v1/bank-accounts/admin/{id}/verify
 *
 * @param id Bank account ID
 * @param notes Optional admin notes
 * @returns Verified bank account
 */
export async function verifyBankAccount(
  id: string,
  notes?: string
): Promise<BankAccountResponse> {
  const url = notes
    ? `/v1/bank-accounts/admin/${id}/verify?notes=${encodeURIComponent(notes)}`
    : `/v1/bank-accounts/admin/${id}/verify`;
  return apiClient.put<BankAccountResponse>(url, {});
}

/**
 * Reject bank account (Admin only)
 *
 * PUT /api/v1/bank-accounts/admin/{id}/reject
 *
 * @param id Bank account ID
 * @param reason Rejection reason
 * @returns Rejected bank account
 */
export async function rejectBankAccount(
  id: string,
  reason: string
): Promise<BankAccountResponse> {
  return apiClient.put<BankAccountResponse>(
    `/v1/bank-accounts/admin/${id}/reject?reason=${encodeURIComponent(reason)}`,
    {}
  );
}

// ================================================
// HELPERS
// ================================================

// Sprint 2: Removed deprecated wrappers:
// - isValidTurkishIban → use validateTurkishIBAN from @/lib/utils/iban-validator
// - formatIban → use formatIBAN from @/lib/shared/formatters

/**
 * Mask IBAN for security
 * TR33 **** **** **** **** **** 26
 *
 * @param iban IBAN to mask
 * @returns Masked IBAN
 */
export function maskIban(iban: string): string {
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  if (cleanIban.length !== 26) return iban;

  // Show first 4 (TR + 2 check digits) and last 2 digits
  const first = cleanIban.substring(0, 4);
  const last = cleanIban.substring(24, 26);
  return `${first} **** **** **** **** **** ${last}`;
}

/**
 * Extract bank code from IBAN
 * Positions 4-8 after TR and check digits
 *
 * @param iban Turkish IBAN
 * @returns 5-digit bank code or null
 */
export function extractBankCode(iban: string): string | null {
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  if (!cleanIban.startsWith('TR') || cleanIban.length !== 26) {
    return null;
  }
  return cleanIban.substring(4, 9);
}

/**
 * Get status badge color
 */
export function getBankAccountStatusColor(status: BankAccountStatus): string {
  switch (status) {
    case BankAccountStatus.VERIFIED:
      return 'success';
    case BankAccountStatus.PENDING:
      return 'warning';
    case BankAccountStatus.REJECTED:
      return 'error';
    default:
      return 'default';
  }
}

/**
 * Get status display name in Turkish
 */
export function getBankAccountStatusLabel(status: BankAccountStatus): string {
  switch (status) {
    case BankAccountStatus.PENDING:
      return 'Beklemede';
    case BankAccountStatus.VERIFIED:
      return 'Doğrulandı';
    case BankAccountStatus.REJECTED:
      return 'Reddedildi';
    default:
      return status;
  }
}

/**
 * Check if bank account can be used for payouts
 */
export function canUseForPayout(account: BankAccountResponse): boolean {
  return account.status === BankAccountStatus.VERIFIED;
}

/**
 * Get bank account statistics (Admin only)
 *
 * GET /api/v1/bank-accounts/admin/statistics
 *
 * @returns Statistics about bank accounts by status
 */
export async function getBankAccountStatistics(): Promise<{
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}> {
  return apiClient.get<{
    total: number;
    pending: number;
    verified: number;
    rejected: number;
  }>('/v1/bank-accounts/admin/statistics');
}
