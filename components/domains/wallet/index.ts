/**
 * ================================================
 * WALLET COMPONENTS - PUBLIC EXPORTS
 * ================================================
 * Central export point for all wallet UI components
 *
 * @author MarifetBul Development Team
 * @version 3.0.0 - Sprint 1: Consolidated & Standardized
 */

// ================================================
// CORE COMPONENTS (Bank Account Management)
// ================================================
// Migration: Sprint 1 - Moved from components/wallet/
export {
  BankAccountForm,
  BankAccountList,
  BankAccountVerificationForm,
  IBANInput,
  BankSelector,
  BankVerificationStatus,
  WalletCard,
  QuickStatsGrid,
  PayoutRequestForm,
  PayoutEligibilityWidget,
  AdvancedTransactionFilters,
  TransactionExportModal,
  TransactionExportButtons,
} from './core';
export type {
  BankAccountFormData,
  BankAccountFormProps,
  BankAccountListProps,
  WalletCardProps,
  PayoutRequestFormProps,
  TransactionExportButtonsProps,
} from './core';

// ================================================
// MAIN DASHBOARD
// ================================================

/** Main wallet dashboard - Unified component */
export { WalletDashboard } from './WalletDashboard';
export type { WalletDashboardProps } from './WalletDashboard';

// ================================================
// CARD COMPONENTS - Standardized
// ================================================

/** Balance display card - Active, Standardized */
export { BalanceCard } from './BalanceCard';
export type { BalanceCardProps } from './BalanceCard';

export { CommissionSummaryCard } from './CommissionSummaryCard';
export type {
  CommissionSummaryCardProps,
  CommissionData,
} from './CommissionSummaryCard';

// ================================================
// ANALYTICS & CHARTS
// ================================================

export { WalletAnalytics } from './WalletAnalytics';
export type { WalletAnalyticsProps, AnalyticsPeriod } from './WalletAnalytics';

export { CommissionChart } from './CommissionChart';
export type {
  CommissionChartProps,
  MonthlyCommissionData,
  ChartType,
  ChartPeriod as CommissionChartPeriod,
} from './CommissionChart';

// ================================================
// ESCROW MANAGEMENT
// ================================================

export { EscrowList } from './EscrowList';
export type { EscrowListProps, EscrowItem, EscrowStatus } from './EscrowList';

export { EscrowDetailsModal } from './EscrowDetailsModal';
export type { EscrowDetailsModalProps } from './EscrowDetailsModal';

export { ReleaseEscrowFlow } from './ReleaseEscrowFlow';
export type { ReleaseEscrowFlowProps } from './ReleaseEscrowFlow';

export { DisputeEscrowModal } from './DisputeEscrowModal';
export type { DisputeEscrowModalProps } from './DisputeEscrowModal';
// Note: DisputeReason is imported from @/types/dispute in DisputeEscrowModal

export { EscrowTimeline } from './EscrowTimeline';
export type {
  EscrowTimelineProps,
  EscrowTimelineEvent,
  EscrowEventType,
} from './EscrowTimeline';
export { createEscrowTimelineEvent } from './EscrowTimeline';

export { EscrowCard, EscrowCardSkeleton } from './EscrowCard';
export type { EscrowCardProps, EscrowCardData } from './EscrowCard';

export { EscrowActions, EscrowActionPermissions } from './EscrowActions';
export type { EscrowActionsProps } from './EscrowActions';

// Sprint 1 - Epic 1.3 - Payout System (Days 6-7)
export { PayoutRequestFlow } from './PayoutRequestFlow';
export type { PayoutRequestFlowProps } from './PayoutRequestFlow';

// Sprint 1.3: Unified Payout History Component
// Replaces: components/wallet/PayoutTable.tsx, components/wallet/PayoutHistoryTable.tsx
export { UnifiedPayoutHistory } from './core/UnifiedPayoutHistory';
export type {
  UnifiedPayoutHistoryProps,
  PayoutHistoryVariant,
  PayoutFilters as UnifiedPayoutFilters,
} from './core/UnifiedPayoutHistory';

// Legacy PayoutHistory - Consider migrating to UnifiedPayoutHistory
export { PayoutHistory } from './PayoutHistory';
export type { PayoutHistoryProps, PayoutFilters } from './PayoutHistory';

export { BankAccountManager } from './BankAccountManager';
export type {
  BankAccountManagerProps,
  BankAccount,
} from './BankAccountManager';

export { PayoutDashboard } from './PayoutDashboard';
export type { PayoutDashboardProps } from './PayoutDashboard';

// ================================================
// CHARTS & WIDGETS
// ================================================

export { EarningsChart } from './EarningsChart';
export type { EarningsChartProps, ChartPeriod } from './EarningsChart';

export { RecentTransactionsWidget } from './RecentTransactionsWidget';
export type { RecentTransactionsWidgetProps } from './RecentTransactionsWidget';

// ================================================
// TRANSACTION COMPONENTS
// ================================================

export { TransactionFilters } from './TransactionFilters';
export type { TransactionFiltersProps } from './TransactionFilters';

export { TransactionList } from './TransactionList';
export type {
  TransactionListProps,
  SortField,
  SortDirection,
} from './TransactionList';

export { TransactionDetailsModal } from './TransactionDetailsModal';
export type { TransactionDetailsModalProps } from './TransactionDetailsModal';

// Unified payout request modal (consolidated from 3 versions)
export { PayoutRequestModal } from './PayoutRequestModal';
export type { PayoutRequestModalProps } from './PayoutRequestModal';

// Bank account management
export { AddBankAccountModal } from './AddBankAccountModal';
export type { AddBankAccountModalProps } from './AddBankAccountModal';

export { TransactionFiltersPanel } from './TransactionFiltersPanel';
export type { TransactionFilters as TransactionFilterValues } from './TransactionFiltersPanel';
