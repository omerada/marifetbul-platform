/**
 * ================================================
 * ADMIN DASHBOARD COMPONENTS - CANONICAL LOCATION
 * ================================================
 * Central export hub for all admin dashboard components
 * This is the CANONICAL location - all imports should come from here
 *
 * @module components/domains/admin/dashboard
 * @since Sprint 1
 * @updated Sprint 2.1 - Dashboard Consolidation
 * @updated Sprint 1.2 - Removed deprecated AdminDashboard
 */

// Main Dashboard Components
// ⚠️ REMOVED: AdminDashboard (deprecated since Sprint 2.1)
// Use AdminDashboardView from @/components/domains/dashboard/views instead:
// import { AdminDashboardView } from '@/components/domains/dashboard/views';

export { AdminAnalytics } from './AdminAnalytics';
export { AdminReports } from './AdminReports';
export { SystemHealthWidget } from './SystemHealthWidget';
export { default as SystemHealthWidgetCompat } from './SystemHealthWidget'; // Backward compatibility

// Comment Moderation Components
export * from './comments';

// Analytics Widgets
export { CommentModerationSummary } from './CommentModerationSummary';
export { SearchAnalyticsWidget } from './SearchAnalyticsWidget';
export { OrderAnalyticsWidget } from './OrderAnalyticsWidget';
export { UserGrowthWidget } from './UserGrowthWidget';

// Revenue Analytics Components
// ⚠️ UPDATED Sprint 2.2: All revenue widgets consolidated to ./widgets/
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
} from './widgets'; // Category Analytics Components
export { CategoryAnalyticsWidget } from './CategoryAnalyticsWidget';
export { CategoryGrowthTrends } from './CategoryGrowthTrends';
export { CategoryPerformanceSummary } from './CategoryPerformanceSummary';

// Package Analytics Components
export { PackagePerformanceWidget } from './PackagePerformanceWidget';
export { PackageTrendChart } from './PackageTrendChart';

/**
 * ================================================
 * SPRINT 1 DAY 3 - CLEANUP COMPLETED
 * ================================================
 * REMOVED: ./admin-dashboard/components (duplicate, unused)
 * REMOVED: ./admin-dashboard/types/adminDashboardTypes (duplicate)
 *
 * Reason: These components were duplicate implementations that
 * were never used in production. Unified dashboard widgets are
 * now in @/components/domains/dashboard/widgets
 *
 * Migration: No migration needed - components were unused
 * @removed 2025-11-13
 */
