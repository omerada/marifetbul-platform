/**
 * AdminDashboard Component (Refactored)
 *
 * Main admin dashboard interface with comprehensive metrics,
 * activity monitoring, and security alerts. This is a modular
 * refactored version composed of specialized sub-components.
 *
 * @module AdminDashboard
 * @refactored Sprint 4 Day 7
 * @reduction 735 lines → ~180 lines (-75.5%)
 */

'use client';

import { useAdminDashboard } from '@/hooks';
import { buildStatCards } from './admin-dashboard/utils/dashboardHelpers';
import {
  DashboardLoadingState,
  DashboardErrorState,
  DashboardHeader,
  DemoInfoCard,
  SystemHealthAlert,
  StatsGrid,
  PerformanceSection,
  RecentActivityCard,
  SecurityAlertsCard,
  SystemHealthCard,
  PendingTasksCard,
} from './admin-dashboard/components';

/**
 * AdminDashboard - Main component
 *
 * Displays comprehensive admin dashboard with:
 * - System health monitoring
 * - Key performance metrics
 * - Recent activity feed
 * - Security alerts
 * - Pending tasks
 */
export function AdminDashboard() {
  // Fetch dashboard data
  const {
    stats,
    alerts,
    systemHealth,
    isLoading,
    error,
    refresh,
    alertAction,
  } = useAdminDashboard();

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

        {/* Demo Info Card */}
        <DemoInfoCard />

        {/* System Health Alert (Conditional) */}
        <SystemHealthAlert systemHealth={systemHealth} />

        {/* Stats Grid */}
        <StatsGrid stats={statCards} />

        {/* Performance Monitor */}
        <PerformanceSection />

        {/* Content Grid: Activity, Alerts, Health, Tasks */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Column 1-2: Recent Activity & Security Alerts */}
          <div className="space-y-6 lg:col-span-2">
            {/* Recent Activity */}
            <RecentActivityCard />

            {/* Security Alerts */}
            <SecurityAlertsCard
              alerts={alerts || []}
              onAlertAction={alertAction}
            />
          </div>

          {/* Column 3: System Health & Pending Tasks */}
          <div className="space-y-6">
            {/* System Health Widget */}
            <SystemHealthCard systemHealth={systemHealth} />

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
