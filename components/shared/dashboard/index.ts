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

/**
 * @deprecated Use StatsCard from '@/components/domains/dashboard/widgets/StatsCard' instead
 *
 * MetricCard is deprecated and will be removed in a future version.
 * Please migrate to StatsCard for better features and consistency.
 *
 * @example
 * // Instead of:
 * // import { MetricCard } from '@/components/shared/dashboard';
 *
 * // Use:
 * import { StatsCard } from '@/components/domains/dashboard/widgets/StatsCard';
 */
export { MetricCard, formatCurrency, formatPercentage } from './MetricCard';
export type { MetricCardProps } from './MetricCard';

export { WidgetHeader } from './WidgetHeader';
export type { WidgetHeaderProps } from './WidgetHeader';

export { NetworkStatusIndicator } from './NetworkStatusIndicator';
export type { NetworkStatusIndicatorProps } from './NetworkStatusIndicator';
