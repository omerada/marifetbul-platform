/**
 * ================================================
 * ADMIN DASHBOARD COMPONENTS
 * ================================================
 * Analytics and reporting widgets for admin panel
 *
 * For unified admin dashboard view, use:
 * @see @/components/domains/dashboard/views/AdminDashboardView
 *
 * @module components/domains/admin/dashboard
 * @version 2.0.0
 * @production-ready ✅
 */

export { AdminAnalytics } from './AdminAnalytics';
export { AdminReports } from './AdminReports';
export { SystemHealthWidget } from './SystemHealthWidget';
export { default as SystemHealthWidgetCompat } from './SystemHealthWidget';

// Comment Moderation Components
export * from './comments';

// Analytics Widgets
export { CommentModerationSummary } from './CommentModerationSummary';
export { SearchAnalyticsWidget } from './SearchAnalyticsWidget';
export { OrderAnalyticsWidget } from './OrderAnalyticsWidget';
export { UserGrowthWidget } from './UserGrowthWidget';

// Revenue Analytics Components
export {
  RevenueBreakdownWidget,
  RevenueBreakdownContainer,
  RevenueComparisonWidget,
  RevenueComparisonContainer,
  RevenueForecastWidget,
  RevenueForecastContainer,
  type RevenueBreakdownWidgetProps,
  type RevenueBreakdownDto,
  type RevenueComparisonWidgetProps,
  type RevenueComparisonDto,
  type RevenueForecastWidgetProps,
  type RevenueForecastDto,
} from './widgets';

// Category Analytics Components
export { CategoryAnalyticsWidget } from './CategoryAnalyticsWidget';
export { CategoryGrowthTrends } from './CategoryGrowthTrends';
export { CategoryPerformanceSummary } from './CategoryPerformanceSummary';

// Package Analytics Components
export { PackagePerformanceWidget } from './PackagePerformanceWidget';
export { PackageTrendChart } from './PackageTrendChart';
