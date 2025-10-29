/**
 * AdminDashboard Component - Production Ready
 *
 * Fully integrated admin dashboard with real backend data.
 * No mock/demo data - 100% production-ready implementation.
 *
 * @module AdminDashboard
 * @refactored 2025-10-18
 * @production-ready true
 */

'use client';

import { useAdminDashboard } from '@/hooks';
import { buildStatCards } from './admin-dashboard/utils/dashboardHelpers';
import {
  DashboardLoadingState,
  DashboardErrorState,
  DashboardHeader,
  SystemHealthAlert,
  StatsGrid,
  PerformanceSection,
  RecentActivityCard,
  SystemHealthCard,
  PendingTasksCard,
  DisputeStatsCard,
} from './admin-dashboard/components';
import { SearchAnalyticsWidget } from '@/components/admin/dashboard/SearchAnalyticsWidget';

/**
 * AdminDashboard - Main component
 *
 * Displays comprehensive admin dashboard with:
 * - Real-time system health monitoring
 * - Key performance metrics from backend
 * - Activity feed and trends
 * - System health indicators
 * - Performance analytics
 */
export function AdminDashboard() {
  // Fetch dashboard data from backend
  const { stats, systemHealth, trends, isLoading, error, refresh } =
    useAdminDashboard();

  // Loading state
  if (isLoading) {
    return <DashboardLoadingState />;
  }

  // Error state
  if (error) {
    return <DashboardErrorState error={error} onRetry={refresh} />;
  }

  // Transform stats for display
  const statCards = buildStatCards(stats || null);

  // Render main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      <div className="mx-auto space-y-6">
        {/* Header Section */}
        <DashboardHeader
          isLoading={isLoading}
          onRefresh={refresh}
          lastUpdated={new Date()}
        />

        {/* System Health Alert (Conditional) */}
        <SystemHealthAlert systemHealth={systemHealth} />

        {/* Stats Grid */}
        <StatsGrid stats={statCards} />

        {/* Performance Monitor - only show if trends data available */}
        {trends && <PerformanceSection trends={trends} />}

        {/* Content Grid: Activity, System Health */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Column 1-2: Recent Activity */}
          <div className="space-y-6 lg:col-span-2">
            {/* Recent Activity */}
            <RecentActivityCard />

            {/* Search Analytics Widget */}
            <SearchAnalyticsWidget days={30} refreshInterval={300000} />
          </div>

          {/* Column 3: System Health, Disputes & Pending Tasks */}
          <div className="space-y-6">
            {/* System Health Widget */}
            <SystemHealthCard systemHealth={systemHealth} />

            {/* Dispute Stats */}
            <DisputeStatsCard />

            {/* Pending Tasks */}
            <PendingTasksCard />
          </div>
        </div>

        {/* Footer Spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}

export default AdminDashboard;
