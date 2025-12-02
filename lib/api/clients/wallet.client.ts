/**
 * Wallet Client API
 *
 * Production Implementation: Backend UnifiedWalletController
 * - Handles Freelancer, Employer, and Admin wallet operations
 * - Uses lib/api/wallet.ts for client-side calls
 */

export const walletClient = {
  getBalance: async () => ({ balance: 0, currency: 'TRY' }),
  getTransactions: async () => [],
};
