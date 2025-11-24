/**
 * ================================================
 * WALLET CORE COMPONENTS - EXPORTS
 * ================================================
 * Core wallet components moved from legacy components/wallet
 *
 * Migration: Sprint 1 - Wallet System Consolidation
 * @version 2.0.0
 * @created November 6, 2025
 */

// ================================================
// BANK ACCOUNT MANAGEMENT
// ================================================

export { BankAccountForm } from './BankAccountForm';
export type {
  BankAccountFormData,
  BankAccountFormProps,
} from './BankAccountForm';

export { BankAccountList } from './BankAccountList';
export type { BankAccountListProps } from './BankAccountList';

export { BankAccountVerificationForm } from './BankAccountVerificationForm';

export { IBANInput } from './IBANInput';
export { BankSelector } from './BankSelector';
export { BankVerificationStatus } from './BankVerificationStatus';

// ================================================
// WALLET DISPLAY
// ================================================

// Sprint 1 Cleanup: WalletCard removed (unused - 192 lines)
// Use BalanceCard for wallet balance display

export { QuickStatsGrid } from './QuickStatsGrid';

// ================================================
// PAYOUT & TRANSACTION
// ================================================

export { PayoutRequestForm } from './PayoutRequestForm';
export type { PayoutRequestFormProps } from './PayoutRequestForm';

export { PayoutEligibilityWidget } from './PayoutEligibilityWidget';

// ================================================
// TRANSACTION FILTERS - UNIFIED
// ================================================

export { UnifiedTransactionFilters } from './UnifiedTransactionFilters';
export type {
  UnifiedTransactionFiltersProps,
  FilterVariant,
} from './UnifiedTransactionFilters';

export { TransactionExportModal } from './TransactionExportModal';
export { default as TransactionExportButtons } from './TransactionExportButtons';
export type { TransactionExportButtonsProps } from './TransactionExportButtons';

// ================================================
// PAYOUT EXPORT - Sprint 1 Story 1.5
// ================================================

export { default as PayoutExportButtons } from './PayoutExportButtons';
export type { PayoutExportButtonsProps } from './PayoutExportButtons';

// ================================================
// UNIFIED COMPONENTS
// ================================================

export { UnifiedPayoutHistory } from './UnifiedPayoutHistory';
export type {
  UnifiedPayoutHistoryProps,
  PayoutHistoryVariant,
  PayoutFilters as UnifiedPayoutFilters,
} from './UnifiedPayoutHistory';
