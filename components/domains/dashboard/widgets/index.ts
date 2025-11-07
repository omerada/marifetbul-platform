/**
 * @fileoverview Dashboard Widgets - Main Index
 * @module components/domains/dashboard/widgets
 *
 * Shared widget components used across all dashboard views.
 * These components are role-agnostic and reusable.
 *
 * @created 2025-11-01
 * @sprint Sprint 1 - Task 1.4
 */

// Stats components
export { StatsCard, StatsCardCompact } from './StatsCard';
export { StatsGrid, StatsGridCompact, StatsGridRow } from './StatsGrid';

// Activity components
export { ActivityTimeline } from './ActivityTimeline';
// export { ActivityItem } from './ActivityItem';

// Action components
export { QuickActions, QuickActionsCompact } from './QuickActions';
// export { QuickActionButton } from './QuickActionButton';

// Wallet components
export { WalletBalanceWidget } from './WalletBalanceWidget';

// Chart components
export { ChartWidget } from './ChartWidget';

// Layout components
export { DashboardHeader } from './DashboardHeader';
export { DashboardSection } from './DashboardSection';

// State components
export { EmptyState } from './EmptyState';
export { ErrorState } from './ErrorState';
export {
  LoadingState as DashboardLoadingState,
  CardLoadingSkeleton,
} from './LoadingState';

// ============================================================================
// STATUS: 9/9 widgets complete (100% - Day 4 DONE!)
// ALL WIDGETS COMPLETE! ✅
// ============================================================================
