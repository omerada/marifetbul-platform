/**
 * ================================================
 * WALLET HOOKS - PUBLIC EXPORTS
 * ================================================
 * Central export point for all wallet-related hooks
 *
 * @author MarifetBul Development Team
 * @version 1.2.0 - Sprint 1 Story 2.2: Added useWalletConfig & useBankAccounts (v2)
 */

// Sprint 1 - Story 2.2 - Configuration & Bank Accounts
export { useWalletConfig } from './useWalletConfig';
export type { UseWalletConfigReturn, WalletConfig } from './useWalletConfig';

export { useBankAccounts } from './useBankAccounts';
export type {
  UseBankAccountsReturn,
  BankAccount,
  BankAccountStatus,
  AddBankAccountRequest,
} from './useBankAccounts';

// Sprint 1 - Epic 1.1 - NEW Hook
export { useWalletData } from './useWalletData';
export type { UseWalletDataReturn } from './useWalletData';

// Sprint 1 - Day 2 - Escrow List Hook
export { useEscrowList } from './useEscrowList';
export type {
  UseEscrowListOptions,
  UseEscrowListReturn,
} from './useEscrowList';

// Sprint 1 - Story 2.1 - Escrow Details Hook
export { useEscrowDetails } from './useEscrowDetails';
export type { UseEscrowDetailsReturn } from './useEscrowDetails';

// Sprint 1 - Story 1.4 - Upcoming Escrow Releases Hook
export { useUpcomingEscrowReleases } from './useUpcomingEscrowReleases';
export type {
  UpcomingReleaseItem,
  UseUpcomingEscrowReleasesReturn,
} from './useUpcomingEscrowReleases';

export { useWebSocketWallet } from './useWebSocketWallet';
export type {
  UseWebSocketWalletReturn,
  UseWebSocketWalletOptions,
  WebSocketWalletMessage,
  WalletUpdateData,
  BalanceUpdateData,
  TransactionUpdateData,
} from './useWebSocketWallet';

// Main hooks (Active - in production use)
export { useTransactions } from './useTransactions';
export type { UseTransactionsReturn } from './useTransactions';

export { usePayouts } from './usePayouts';
export type { UsePayoutsReturn } from './usePayouts';

// ================================================
// CLEANUP NOTE - Sprint 3
// ================================================
// Deleted unused hooks (4 files, ~800 lines):
// - useWallet.ts - Never used (replaced by useWalletData)
// - useBalance.ts - Never used (replaced by useWalletData)
// - usePaymentMethods.ts - Never used (256 lines)
// - useWalletPolling.ts - Never used (252 lines)
//
// Canonical wallet hooks:
// - useWalletData (comprehensive wallet + balance)
// - useTransactions (transaction management)
// - usePayouts (payout operations)
// - useBankAccounts (bank account management)
// - useEscrowList (escrow operations)
// ================================================
