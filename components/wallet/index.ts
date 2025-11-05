/**
 * Wallet Components (Legacy Location)
 *
 * ⚠️ DEPRECATED: This location is being phased out
 * Use @/components/domains/wallet for all wallet components
 *
 * Sprint 1.3: PayoutTable and PayoutHistoryTable removed
 * Use UnifiedPayoutHistory from @/components/domains/wallet instead
 *
 * @version 3.0.0 - Sprint 1: Component Consolidation & Standardization
 */

// ================================================
// CARD COMPONENTS
// ================================================

/** Generic metric display card - Standardized v2.0 */
export { WalletCard } from './WalletCard';
export type { WalletCardProps } from './WalletCard';

// ================================================
// UI COMPONENTS
// ================================================

export { QuickStatsGrid } from './QuickStatsGrid';

// ⚠️ MIGRATION NOTES (Sprint 1.3):
// - PayoutTable.tsx REMOVED (261 lines)
// - PayoutHistoryTable.tsx REMOVED (256 lines)
//
// Replace with:
// import { UnifiedPayoutHistory } from '@/components/domains/wallet';
//
// Simple variant (replaces PayoutTable):
// <UnifiedPayoutHistory variant="simple" payouts={data} onCancelPayout={handleCancel} />
//
// Advanced variant (replaces PayoutHistoryTable):
// <UnifiedPayoutHistory variant="advanced" payouts={data} onViewDetails={handleView} onExport={handleExport} />

// ================================================
// FEATURE COMPONENTS
// ================================================

// Transaction & Export components
export { TransactionExportModal } from './TransactionExportModal';
export { PayoutEligibilityWidget } from './PayoutEligibilityWidget';
export { AdvancedTransactionFilters } from './AdvancedTransactionFilters';

// Bank Account components
export { IBANInput } from './IBANInput';
export { BankSelector } from './BankSelector';
export { BankAccountForm } from './BankAccountForm';
export { BankAccountList } from './BankAccountList';
export { BankAccountVerificationForm } from './BankAccountVerificationForm';
export { BankVerificationStatus } from './BankVerificationStatus';

// Payout components
export { PayoutRequestForm } from './PayoutRequestForm';
