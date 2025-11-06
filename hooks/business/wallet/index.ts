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

export { useWebSocketWallet } from './useWebSocketWallet';
export type {
  UseWebSocketWalletReturn,
  UseWebSocketWalletOptions,
  WebSocketWalletMessage,
  WalletUpdateData,
  BalanceUpdateData,
  TransactionUpdateData,
} from './useWebSocketWallet';

// Main hooks
export { useWallet } from './useWallet';
export type { UseWalletReturn } from './useWallet';

export { useBalance } from './useBalance';
export type { UseBalanceReturn } from './useBalance';

export { useTransactions } from './useTransactions';
export type { UseTransactionsReturn } from './useTransactions';

export { usePayouts } from './usePayouts';
export type { UsePayoutsReturn } from './usePayouts';

// Real-time polling hook
export { useWalletPolling } from './useWalletPolling';
export type {
  UseWalletPollingReturn,
  UseWalletPollingOptions,
} from './useWalletPolling';

// Payment methods hook
export { usePaymentMethods, useBankAccounts } from './usePaymentMethods';
export type {
  UsePaymentMethodsReturn,
  UseBankAccountsReturn,
} from './usePaymentMethods';
