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
export { RevenueBreakdownWidget } from './RevenueBreakdownWidget';
export { RevenueForecastChart } from './RevenueForecastChart';
export { RevenueComparisonWidget } from './RevenueComparisonWidget';

// Category Analytics Components
export { CategoryAnalyticsWidget } from './CategoryAnalyticsWidget';
export { CategoryGrowthTrends } from './CategoryGrowthTrends';
export { CategoryPerformanceSummary } from './CategoryPerformanceSummary';

// Package Analytics Components
export { PackagePerformanceWidget } from './PackagePerformanceWidget';
export { PackageTrendChart } from './PackageTrendChart';

// Admin Dashboard Sub-components
export * from './admin-dashboard/components';
export * from './admin-dashboard/types/adminDashboardTypes';
