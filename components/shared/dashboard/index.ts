/**
 * ================================================
 * DASHBOARD SHARED COMPONENTS - Index
 * ================================================
 * Exports all shared dashboard components
 *
 * @module components/shared/dashboard
 * @since Sprint 1 - Story 4
 */

// Core Components
export { DashboardWidgetCard } from './DashboardWidgetCard';
export type { DashboardWidgetProps } from './DashboardWidgetCard';

export { MetricCard, formatCurrency, formatPercentage } from './MetricCard';
export type { MetricCardProps } from './MetricCard';
// NOTE: MetricCard kept for SearchAnalyticsWidget compatibility
// TODO Day 4: Refactor SearchAnalyticsWidget to use StatsCard, then deprecate MetricCard

export { WidgetHeader } from './WidgetHeader';
export type { WidgetHeaderProps } from './WidgetHeader';

export { NetworkStatusIndicator } from './NetworkStatusIndicator';
export type { NetworkStatusIndicatorProps } from './NetworkStatusIndicator';
