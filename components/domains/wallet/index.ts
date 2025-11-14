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
  QuickStatsGrid,
  PayoutRequestForm,
  PayoutEligibilityWidget,
  UnifiedTransactionFilters,
  TransactionExportModal,
  TransactionExportButtons,
} from './core';
export type {
  BankAccountFormData,
  BankAccountFormProps,
  BankAccountListProps,
  PayoutRequestFormProps,
  TransactionExportButtonsProps,
  UnifiedTransactionFiltersProps,
  FilterVariant,
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

export { EscrowStatisticsWidget } from './EscrowStatisticsWidget';
export type {
  EscrowStatisticsWidgetProps,
  EscrowStats,
} from './EscrowStatisticsWidget';

export { EscrowTimelineChart } from './EscrowTimelineChart';
export type {
  EscrowTimelineChartProps,
  EscrowTimelineData,
  StatusDistribution,
} from './EscrowTimelineChart';

// ================================================
// SPRINT 2 CLEANUP - UNUSED ESCROW COMPONENTS ✅
// ================================================
// EscrowQuickActions.tsx (327 lines) - DELETED
//   - Never used in production
//   - Bulk actions available through EscrowActions
//   - Removed: 2025-11-14
//
// EscrowViewer.tsx (511 lines) - DELETED
//   - Duplicate functionality of EscrowList
//   - Never imported anywhere
//   - Removed: 2025-11-14
//
// Total reduction: 838 lines of unused code
// ================================================

// Sprint 1 - Epic 1.3 - Payout System (Days 6-7)
export { PayoutRequestFlow } from './PayoutRequestFlow';
export type { PayoutRequestFlowProps } from './PayoutRequestFlow';

// Sprint 1.3: Unified Payout History Component
// Replaces: components/wallet/PayoutTable.tsx, components/wallet/PayoutHistoryTable.tsx, PayoutHistory.tsx
export { UnifiedPayoutHistory } from './core/UnifiedPayoutHistory';
export type {
  UnifiedPayoutHistoryProps,
  PayoutHistoryVariant,
  PayoutFilters as UnifiedPayoutFilters,
} from './core/UnifiedPayoutHistory';

// ================================================
// DEPRECATED - REMOVED IN SPRINT 1 DAY 2
// ================================================
// BankAccountManager.tsx - DELETED
// Replaced by: BankAccountForm + BankAccountList (in ./core/)
// Migration complete: 2025-11-06
// ================================================

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

export { TransactionDetailsModal } from './TransactionDetailsModal';
export type { TransactionDetailsModalProps } from './TransactionDetailsModal';

// ================================================
// SPRINT 1 CLEANUP COMPLETED ✅
// ================================================
// Successfully removed duplicate transaction filter components:
// ✅ TransactionFilters.tsx (183 lines) - DELETED
// ✅ TransactionFiltersPanel.tsx (412 lines) - DELETED
// ✅ AdvancedTransactionFilters.tsx (408 lines) - DELETED
// ✅ TransactionDisplay/Filters.tsx (proxy) - DELETED
//
// Replacement: UnifiedTransactionFilters (370 lines)
// - Supports variant="simple" and variant="advanced"
// - Single source of truth for all transaction filtering
// - Type-safe with TransactionFilters interface
//
// Migration complete: 2025-11-14
// Code reduction: 1,191 lines → 370 lines (69% reduction)
// ================================================
