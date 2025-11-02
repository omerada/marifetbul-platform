/**
 * ================================================
 * WALLET COMPONENTS - PUBLIC EXPORTS
 * ================================================
 * Central export point for all wallet UI components
 *
 * @author MarifetBul Development Team
 * @version 2.2.0 - Sprint Day 5: Added Commission Tracking Components
 */

// Sprint 1 - Epic 1.1 - NEW Components
export { WalletDashboard } from './WalletDashboard';
export type { WalletDashboardProps } from './WalletDashboard';

export { BalanceCard } from './BalanceCard';
export type { BalanceCardProps } from './BalanceCard';

export { WalletAnalytics } from './WalletAnalytics';
export type { WalletAnalyticsProps, AnalyticsPeriod } from './WalletAnalytics';

// Sprint Day 5 - Commission Tracking UI
export { CommissionSummaryCard } from './CommissionSummaryCard';
export type {
  CommissionSummaryCardProps,
  CommissionData,
} from './CommissionSummaryCard';

export { CommissionChart } from './CommissionChart';
export type {
  CommissionChartProps,
  MonthlyCommissionData,
  ChartType,
  ChartPeriod as CommissionChartPeriod,
} from './CommissionChart';

// Sprint 1 - Epic 1.2 - Escrow Management (Days 4-5)
export { EscrowList } from './EscrowList';
export type { EscrowListProps, EscrowItem, EscrowStatus } from './EscrowList';

export { EscrowDetailsModal } from './EscrowDetailsModal';
export type { EscrowDetailsModalProps } from './EscrowDetailsModal';

export { ReleaseEscrowFlow } from './ReleaseEscrowFlow';
export type { ReleaseEscrowFlowProps } from './ReleaseEscrowFlow';

export { DisputeEscrowModal } from './DisputeEscrowModal';
export type {
  DisputeEscrowModalProps,
  DisputeReason,
} from './DisputeEscrowModal';

// Sprint 1 - New Escrow UI Components
export { EscrowStatusBadge } from './EscrowStatusBadge';
export type { EscrowStatusBadgeProps } from './EscrowStatusBadge';

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

export { PayoutStatusBadge } from './PayoutStatusBadge';
export type { PayoutStatusBadgeProps } from './PayoutStatusBadge';
export {
  getPayoutStatusColor,
  getPayoutStatusDescription,
  isPayoutStatusFinal,
  isPayoutStatusInProgress,
} from './PayoutStatusBadge';

// Sprint 1 - Epic 1.3 - Payout System (Days 6-7)
export { PayoutRequestFlow } from './PayoutRequestFlow';
export type { PayoutRequestFlowProps } from './PayoutRequestFlow';

export { PayoutHistory } from './PayoutHistory';
export type { PayoutHistoryProps, PayoutFilters } from './PayoutHistory';

export { BankAccountManager } from './BankAccountManager';
export type {
  BankAccountManagerProps,
  BankAccount,
} from './BankAccountManager';

export { PayoutDashboard } from './PayoutDashboard';
export type { PayoutDashboardProps } from './PayoutDashboard';

// Main components
export { WalletBalanceCard } from './WalletBalanceCard';
export type { WalletBalanceCardProps } from './WalletBalanceCard';

export { EarningsChart } from './EarningsChart';
export type { EarningsChartProps, ChartPeriod } from './EarningsChart';

export { RecentTransactionsWidget } from './RecentTransactionsWidget';
export type { RecentTransactionsWidgetProps } from './RecentTransactionsWidget';

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

export { BankAccountManagement } from './BankAccountManagement';

export { TransactionFiltersPanel } from './TransactionFiltersPanel';
export type { TransactionFilters as TransactionFilterValues } from './TransactionFiltersPanel';
