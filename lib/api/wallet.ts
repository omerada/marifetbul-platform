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
  type Wallet,
  type BalanceResponse,
  type Transaction,
} from './validators';

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
// Export API Object
// ============================================================================

export const walletApi = {
  getWallet,
  getBalance,
  getTransactions,
  exportTransactions,
  getWalletStats,
};

export default walletApi;
