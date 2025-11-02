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
  PaginatedTransactionResponseSchema,
  EarningsTrendResponseSchema,
  RevenueBreakdownResponseSchema,
  TransactionSummaryResponseSchema,
  type Wallet,
  type BalanceResponse,
  type Transaction,
  type Payout,
  type PayoutLimits,
  type PayoutEligibility,
  type TransactionFilter,
  type PaginatedTransactionResponse,
  type EarningsTrendResponse,
  type RevenueBreakdownResponse,
  type TransactionSummaryResponse,
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
 * Get filtered transaction history with advanced filters
 * GET /api/v1/wallet/transactions/filtered
 *
 * @param {TransactionFilter} filter - Filter parameters
 * @returns {Promise<PaginatedTransactionResponse>} Paginated transactions
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {ValidationError} Invalid response format
 */
export async function getFilteredTransactions(
  filter: TransactionFilter
): Promise<PaginatedTransactionResponse> {
  const params = new URLSearchParams();
  params.append('page', filter.page?.toString() || '0');
  params.append('size', filter.size?.toString() || '20');

  if (filter.type) params.append('type', filter.type);
  if (filter.startDate) params.append('startDate', filter.startDate);
  if (filter.endDate) params.append('endDate', filter.endDate);
  if (filter.minAmount !== undefined)
    params.append('minAmount', filter.minAmount.toString());
  if (filter.maxAmount !== undefined)
    params.append('maxAmount', filter.maxAmount.toString());
  if (filter.search) params.append('search', filter.search);

  const response = await apiClient.get<PaginatedTransactionResponse>(
    `/wallet/transactions/filtered?${params.toString()}`
  );

  return validateResponse(
    PaginatedTransactionResponseSchema,
    response,
    'PaginatedTransactionResponse'
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

/**
 * Check if user has sufficient balance
 * GET /api/v1/wallet/check-balance
 *
 * @param {number} amount - Amount to check
 * @returns {Promise<boolean>} True if sufficient balance
 *
 * @throws {AuthenticationError} Not authenticated
 */
export async function checkBalance(amount: number): Promise<boolean> {
  const response = await apiClient.get<boolean>(
    `/wallet/check-balance?amount=${amount}`
  );
  return response;
}

/**
 * Credit wallet balance (add funds)
 * POST /api/v1/wallet/credit
 *
 * @param {Object} request - Credit request
 * @param {number} request.amount - Amount to credit
 * @param {string} request.description - Transaction description
 * @returns {Promise<Wallet>} Updated wallet
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {ValidationError} Invalid amount
 */
export async function creditBalance(request: {
  amount: number;
  description: string;
}): Promise<Wallet> {
  const response = await apiClient.post<Wallet>('/wallet/credit', request);
  return validateResponse(WalletSchema, response, 'Wallet');
}

/**
 * Debit wallet balance (deduct funds)
 * POST /api/v1/wallet/debit
 *
 * @param {Object} request - Debit request
 * @param {number} request.amount - Amount to debit
 * @param {string} request.description - Transaction description
 * @returns {Promise<Wallet>} Updated wallet
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {ValidationError} Invalid amount
 * @throws {InsufficientBalanceError} Insufficient balance
 */
export async function debitBalance(request: {
  amount: number;
  description: string;
}): Promise<Wallet> {
  const response = await apiClient.post<Wallet>('/wallet/debit', request);
  return validateResponse(WalletSchema, response, 'Wallet');
}

// ============================================================================
// Wallet Analytics
// ============================================================================

/**
 * Get earnings trend over a period
 * GET /api/v1/wallet/analytics/earnings-trend
 *
 * @param {string} startDate - Start date (ISO format)
 * @param {string} endDate - End date (ISO format)
 * @returns {Promise<EarningsTrendResponse>} Earnings trend data
 *
 * @throws {AuthenticationError} Not authenticated
 */
export async function getEarningsTrend(
  startDate?: string,
  endDate?: string
): Promise<EarningsTrendResponse> {
  let url = '/wallet/analytics/earnings-trend';
  const params = new URLSearchParams();

  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await apiClient.get<EarningsTrendResponse>(url);
  return validateResponse(
    EarningsTrendResponseSchema,
    response,
    'EarningsTrendResponse'
  );
}

/**
 * Get revenue breakdown by category
 * GET /api/v1/wallet/analytics/revenue-breakdown
 *
 * @param {string} startDate - Start date (ISO format)
 * @param {string} endDate - End date (ISO format)
 * @returns {Promise<RevenueBreakdownResponse>} Revenue breakdown data
 *
 * @throws {AuthenticationError} Not authenticated
 */
export async function getRevenueBreakdown(
  startDate?: string,
  endDate?: string
): Promise<RevenueBreakdownResponse> {
  let url = '/wallet/analytics/revenue-breakdown';
  const params = new URLSearchParams();

  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await apiClient.get<RevenueBreakdownResponse>(url);
  return validateResponse(
    RevenueBreakdownResponseSchema,
    response,
    'RevenueBreakdownResponse'
  );
}

/**
 * Get transaction summary with income vs expenses
 * GET /api/v1/wallet/analytics/transaction-summary
 *
 * @param {string} startDate - Start date (ISO format)
 * @param {string} endDate - End date (ISO format)
 * @returns {Promise<TransactionSummaryResponse>} Transaction summary data
 *
 * @throws {AuthenticationError} Not authenticated
 */
export async function getTransactionSummary(
  startDate?: string,
  endDate?: string
): Promise<TransactionSummaryResponse> {
  let url = '/wallet/analytics/transaction-summary';
  const params = new URLSearchParams();

  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await apiClient.get<TransactionSummaryResponse>(url);
  return validateResponse(
    TransactionSummaryResponseSchema,
    response,
    'TransactionSummaryResponse'
  );
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
  method: 'BANK_TRANSFER' | 'IYZICO_PAYOUT';
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
 * @returns {Promise<PayoutEligibility>} Eligibility status with requirements
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
// Escrow Operations
// ============================================================================

/**
 * Get escrow payment details
 * GET /api/v1/wallet/escrow/{orderId}
 *
 * @param {string} orderId - Order ID
 * @returns {Promise<EscrowPaymentDetails>} Escrow payment details with history
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {NotFoundError} Escrow payment not found
 */
export async function getEscrowPaymentDetails(
  orderId: string
): Promise<import('@/types/business/features/wallet').EscrowPaymentDetails> {
  const response = await apiClient.get<
    import('@/types/business/features/wallet').EscrowPaymentDetails
  >(`/wallet/escrow/${orderId}`);
  return response;
}

/**
 * Release escrow payment
 * POST /api/v1/wallet/escrow/{paymentId}/release
 *
 * @param {string} paymentId - Payment ID
 * @returns {Promise<void>}
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {NotFoundError} Payment not found
 * @throws {BusinessRuleViolation} Cannot release payment
 */
export async function releaseEscrowPayment(paymentId: string): Promise<void> {
  await apiClient.post(`/wallet/escrow/${paymentId}/release`);
}

/**
 * Raise dispute for escrow payment
 * POST /api/v1/wallet/escrow/{paymentId}/dispute
 *
 * @param {string} paymentId - Payment ID
 * @param {object} data - Dispute data
 * @returns {Promise<string>} Dispute ID
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {NotFoundError} Payment not found
 * @throws {BusinessRuleViolation} Cannot raise dispute
 */
export async function raiseEscrowDispute(
  paymentId: string,
  data: {
    reason: string;
    description: string;
  }
): Promise<string> {
  const response = await apiClient.post<{ disputeId: string }>(
    `/wallet/escrow/${paymentId}/dispute`,
    data
  );
  return response.disputeId;
}

// ============================================================================
// Export API Object
// ============================================================================

export const walletApi = {
  // Wallet
  getWallet,
  getBalance,
  getTransactions,
  getFilteredTransactions,
  exportTransactions,
  getWalletStats,
  checkBalance,
  creditBalance,
  debitBalance,
  // Analytics
  getEarningsTrend,
  getRevenueBreakdown,
  getTransactionSummary,
  // Payouts
  requestPayout,
  getPayout,
  getPayoutHistory,
  getPendingPayouts,
  cancelPayout,
  getPayoutLimits,
  checkPayoutEligibility,
  // Escrow
  getEscrowPaymentDetails,
  releaseEscrowPayment,
  raiseEscrowDispute,
};

export default walletApi;
