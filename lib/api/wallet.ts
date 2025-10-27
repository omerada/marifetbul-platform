/**
 * ================================================
 * WALLET API CLIENT
 * ================================================
 * Handles wallet balance, transactions, and escrow operations
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import {
  validateResponse,
  WalletSchema,
  BalanceResponseSchema,
  TransactionSchema,
  PayoutSchema,
  PayoutLimitsSchema,
  PayoutEligibilitySchema,
  type Wallet,
  type BalanceResponse,
  type Transaction,
  type Payout,
  type PayoutLimits,
  type PayoutEligibility,
} from '@/lib/api/validators';

// ============================================================================
// Wallet Operations
// ============================================================================

/**
 * Get user wallet
 * GET /api/v1/wallet
 *
 * @returns {Promise<Wallet>} User wallet details
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {NotFoundError} Wallet not found
 * @throws {ValidationError} Invalid response format
 */
export async function getWallet(): Promise<Wallet> {
  const response = await apiClient.get<Wallet>('/wallet');
  return validateResponse(WalletSchema, response, 'Wallet');
}

/**
 * Get wallet balance summary
 * GET /api/v1/wallet/balance
 *
 * @returns {Promise<BalanceResponse>} Balance summary with earnings and payouts
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {ValidationError} Invalid response format
 */
export async function getBalance(): Promise<BalanceResponse> {
  const response = await apiClient.get<BalanceResponse>('/wallet/balance');
  return validateResponse(BalanceResponseSchema, response, 'Balance');
}

// ============================================================================
// Transaction History
// ============================================================================

/**
 * Get transaction history with pagination
 * GET /api/v1/wallet/transactions
 *
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size
 * @returns {Promise<Transaction[]>} List of transactions
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {ValidationError} Invalid response format
 */
export async function getTransactions(
  page: number = 0,
  size: number = 20
): Promise<Transaction[]> {
  const response = await apiClient.get<Transaction[]>(
    `/wallet/transactions?page=${page}&size=${size}`
  );

  // Validate each transaction
  return response.map((transaction) =>
    validateResponse(TransactionSchema, transaction, 'Transaction')
  );
}

/**
 * Export transaction history
 * GET /api/v1/wallet/transactions/export
 *
 * @param {('csv'|'pdf')} format - Export format
 * @returns {Promise<Blob>} Exported file as blob
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {ServerError} Export generation failed
 */
export async function exportTransactions(
  format: 'csv' | 'pdf' = 'csv'
): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    `/wallet/transactions/export?format=${format}`
  );

  return response;
}

// ============================================================================
// Wallet Statistics
// ============================================================================

/**
 * Get wallet statistics (helper function)
 * Combines wallet and balance data for dashboard
 *
 * @returns {Promise<{wallet: Wallet, balance: BalanceResponse}>}
 */
export async function getWalletStats(): Promise<{
  wallet: Wallet;
  balance: BalanceResponse;
}> {
  const [wallet, balance] = await Promise.all([getWallet(), getBalance()]);

  return { wallet, balance };
}

// ============================================================================
// Payout Operations
// ============================================================================

/**
 * Request a payout (withdrawal)
 * POST /api/v1/payouts
 *
 * @param {PayoutRequest} request - Payout request details
 * @returns {Promise<Payout>} Created payout
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {ValidationError} Invalid request data
 * @throws {InsufficientBalanceError} Insufficient balance
 * @throws {BusinessError} Cannot request payout (eligibility check failed)
 */
export async function requestPayout(request: {
  amount: number;
  method: 'BANK_TRANSFER' | 'STRIPE_PAYOUT';
  bankAccountInfo?: string;
}): Promise<Payout> {
  const response = await apiClient.post<Payout>('/payouts', request);
  return validateResponse(PayoutSchema, response, 'Payout');
}

/**
 * Get payout by ID
 * GET /api/v1/payouts/{id}
 *
 * @param {string} payoutId - Payout ID
 * @returns {Promise<Payout>} Payout details
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {NotFoundError} Payout not found
 * @throws {ForbiddenError} Not authorized to view this payout
 */
export async function getPayout(payoutId: string): Promise<Payout> {
  const response = await apiClient.get<Payout>(`/payouts/${payoutId}`);
  return validateResponse(PayoutSchema, response, 'Payout');
}

/**
 * Get payout history
 * GET /api/v1/payouts/history
 *
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size
 * @returns {Promise<Payout[]>} List of payouts
 *
 * @throws {AuthenticationError} Not authenticated
 */
export async function getPayoutHistory(
  page: number = 0,
  size: number = 20
): Promise<Payout[]> {
  const response = await apiClient.get<Payout[]>(
    `/payouts/history?page=${page}&size=${size}`
  );
  return response.map((payout) =>
    validateResponse(PayoutSchema, payout, 'Payout')
  );
}

/**
 * Get pending payouts
 * GET /api/v1/payouts/pending
 *
 * @returns {Promise<Payout[]>} List of pending payouts
 *
 * @throws {AuthenticationError} Not authenticated
 */
export async function getPendingPayouts(): Promise<Payout[]> {
  const response = await apiClient.get<Payout[]>('/payouts/pending');
  return response.map((payout) =>
    validateResponse(PayoutSchema, payout, 'Payout')
  );
}

/**
 * Cancel payout
 * POST /api/v1/payouts/{id}/cancel
 *
 * @param {string} payoutId - Payout ID
 * @param {string} reason - Cancellation reason (optional)
 * @returns {Promise<Payout>} Cancelled payout
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {NotFoundError} Payout not found
 * @throws {BusinessError} Cannot cancel payout (wrong status)
 */
export async function cancelPayout(
  payoutId: string,
  reason?: string
): Promise<Payout> {
  const url = `/payouts/${payoutId}/cancel${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`;
  const response = await apiClient.post<Payout>(url);
  return validateResponse(PayoutSchema, response, 'Payout');
}

/**
 * Get payout limits
 * GET /api/v1/payouts/limits
 *
 * @returns {Promise<PayoutLimits>} Payout limits
 *
 * @throws {AuthenticationError} Not authenticated
 */
export async function getPayoutLimits(): Promise<PayoutLimits> {
  const response = await apiClient.get<PayoutLimits>('/payouts/limits');
  return validateResponse(PayoutLimitsSchema, response, 'PayoutLimits');
}

/**
 * Check payout eligibility
 * GET /api/v1/payouts/eligibility
 *
 * @returns {Promise<PayoutEligibility>} Eligibility status with details
 *
 * @throws {AuthenticationError} Not authenticated
 */
export async function checkPayoutEligibility(): Promise<PayoutEligibility> {
  const response = await apiClient.get<PayoutEligibility>(
    '/payouts/eligibility'
  );
  return validateResponse(
    PayoutEligibilitySchema,
    response,
    'PayoutEligibility'
  );
}

// ============================================================================
// Export API Object
// ============================================================================

export const walletApi = {
  // Wallet
  getWallet,
  getBalance,
  getTransactions,
  exportTransactions,
  getWalletStats,
  // Payouts
  requestPayout,
  getPayout,
  getPayoutHistory,
  getPendingPayouts,
  cancelPayout,
  getPayoutLimits,
  checkPayoutEligibility,
};

export default walletApi;
