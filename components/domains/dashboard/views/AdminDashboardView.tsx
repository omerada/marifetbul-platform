/**
 * @fileoverview Admin Dashboard View Component
 * @module components/domains/dashboard/views
 *
 * Complete dashboard view for ADMIN role with:
 * - Platform-wide statistics
 * - System health monitoring
 * - User and revenue analytics
 * - Search metrics
 * - Top performing packages
 *
 * @created 2025-11-02
 * @sprint Sprint 1 - Day 7
 */

import { memo } from 'react';
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Activity,
  Server,
  Search,
  Award,
  Settings,
  Database,
  Cpu,
  HardDrive,
  Wifi,
} from 'lucide-react';

// Hooks
import { useDashboardPermissions } from '../hooks';

// Widgets
import {
  DashboardHeader,
  DashboardSection,
  StatsGrid,
  ChartWidget,
  ActivityTimeline,
  QuickActions,
} from '../widgets';

// Types
import type { AdminDashboard, StatCardData } from '../types/dashboard.types';

// Utils
import {
  formatCurrency,
  formatCompactNumber,
  formatPercentage,
} from '../utils';

// ============================================================================
// TYPES
// ============================================================================

/**
 * AdminDashboardView component props
 */
export interface AdminDashboardViewProps {
  /** Admin dashboard data */
  data: AdminDashboard | null;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Refresh callback */
  onRefresh?: () => void;
  /** Custom className */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Prepare stats cards for admin dashboard
 */
function prepareStatsCards(data: AdminDashboard): StatCardData[] {
  return [
    {
      id: 'total-users',
      title: 'Total Users',
      value: formatCompactNumber(data.stats.users.total),
      trend: data.stats.users.trend,
      icon: Users,
      subtitle: `${data.stats.users.active} active users`,
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'active-packages',
      title: 'Active Packages',
      value: formatCompactNumber(data.stats.packages.active),
      trend: data.stats.packages.trend,
      icon: Package,
      subtitle: `${data.stats.packages.total} total packages`,
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'total-orders',
      title: 'Total Orders',
      value: formatCompactNumber(data.stats.orders.total),
      trend: data.stats.orders.trend,
      icon: ShoppingCart,
      subtitle: `${data.stats.orders.completed} completed`,
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      id: 'platform-revenue',
      title: 'Platform Revenue',
      value: formatCurrency(
        data.stats.revenue.total,
        data.stats.revenue.currency
      ),
      trend: data.stats.revenue.trend,
      icon: TrendingUp,
      subtitle: `${formatCurrency(data.stats.revenue.commission, data.stats.revenue.currency)} commission`,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ];
}

/**
 * Prepare system health cards
 */
function prepareSystemHealthCards(data: AdminDashboard): StatCardData[] {
  const health = data.systemHealth;

  return [
    {
      id: 'cpu-usage',
      title: 'CPU Usage',
      value: formatPercentage(health.cpu / 100),
      icon: Cpu,
      subtitle: health.status,
      iconColor:
        health.cpu > 80
          ? 'text-red-600 dark:text-red-400'
          : 'text-green-600 dark:text-green-400',
    },
    {
      id: 'memory-usage',
      title: 'Memory Usage',
      value: formatPercentage(health.memory / 100),
      icon: Database,
      subtitle: `${health.activeConnections} connections`,
      iconColor:
        health.memory > 80
          ? 'text-red-600 dark:text-red-400'
          : 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'storage-usage',
      title: 'Storage',
      value: formatPercentage(health.storage / 100),
      icon: HardDrive,
      subtitle: 'Available space',
      iconColor:
        health.storage > 90
          ? 'text-red-600 dark:text-red-400'
          : 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'cache-hit-rate',
      title: 'Cache Hit Rate',
      value: formatPercentage(health.cacheHitRate / 100),
      icon: Wifi,
      subtitle: 'Cache performance',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
    },
  ];
}

/**
 * Prepare quick actions for admin
 */
function prepareQuickActions() {
  return [
    {
      id: 'user-management',
      label: 'User Management',
      description: 'Manage users',
      icon: Users,
      onClick: () => (window.location.href = '/admin/users'),
      variant: 'primary' as const,
    },
    {
      id: 'package-management',
      label: 'Package Management',
      description: 'Manage packages',
      icon: Package,
      onClick: () => (window.location.href = '/admin/packages'),
      variant: 'default' as const,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      description: 'View analytics',
      icon: Activity,
      onClick: () => (window.location.href = '/admin/analytics'),
      variant: 'default' as const,
    },
    {
      id: 'settings',
      label: 'System Settings',
      description: 'Configure system',
      icon: Settings,
      onClick: () => (window.location.href = '/admin/settings'),
      variant: 'default' as const,
    },
  ];
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * AdminDashboardView Component
 *
 * Complete dashboard view for admin users with platform statistics,
 * system health monitoring, analytics, and management tools.
 *
 * @example
 * ```tsx
 * <AdminDashboardView
 *   data={adminData}
 *   isLoading={false}
 *   onRefresh={handleRefresh}
 * />
 * ```
 */
export const AdminDashboardView = memo<AdminDashboardViewProps>(
  ({ data, isLoading = false, error, className }) => {
    const { canViewFinancials, canViewCharts, canViewSystemHealth } =
      useDashboardPermissions();

    // Loading state
    if (isLoading || !data) {
      return (
        <div className={className}>
          <DashboardHeader
            title="Admin Dashboard"
            subtitle="Loading platform statistics..."
            role="ADMIN"
          />
          <div className="animate-pulse space-y-6">
            <div className="bg-muted h-32 rounded-lg" />
            <div className="bg-muted h-64 rounded-lg" />
          </div>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className={className}>
          <DashboardHeader
            title="Admin Dashboard"
            subtitle="Error loading dashboard"
            role="ADMIN"
          />
          <div className="bg-destructive/10 border-destructive rounded-lg border p-4">
            <p className="text-destructive">{error.message}</p>
          </div>
        </div>
      );
    }

    const statsCards = prepareStatsCards(data);
    const healthCards = prepareSystemHealthCards(data);
    const quickActions = prepareQuickActions();

    return (
      <div className={className}>
        {/* Header */}
        <DashboardHeader
          title="Admin Dashboard"
          subtitle={`Platform overview for last ${data.period.days} days`}
          role="ADMIN"
        />

        {/* Platform Statistics */}
        <DashboardSection
          title="Platform Statistics"
          subtitle="Overview of platform-wide metrics"
          icon={TrendingUp}
        >
          <StatsGrid
            stats={statsCards}
            isLoading={isLoading}
            config={{
              columns: {
                mobile: 2,
                tablet: 2,
                desktop: 4,
              },
              gap: 'md',
            }}
          />
        </DashboardSection>

        {/* System Health */}
        {canViewSystemHealth && (
          <DashboardSection
            title="System Health"
            subtitle="Real-time system monitoring"
            icon={Server}
          >
            <StatsGrid
              stats={healthCards}
              isLoading={isLoading}
              config={{
                columns: {
                  mobile: 2,
                  tablet: 2,
                  desktop: 4,
                },
                gap: 'md',
              }}
            />
            <div className="bg-muted/50 mt-4 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">System Status</p>
                  <p className="text-muted-foreground text-xs">
                    Last checked:{' '}
                    {new Date(data.systemHealth.lastChecked).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium capitalize">
                    {data.systemHealth.status}
                  </span>
                </div>
              </div>
            </div>
          </DashboardSection>
        )}

        {/* Analytics Charts */}
        {canViewCharts && (
          <DashboardSection
            title="Analytics"
            subtitle="Platform growth and performance"
            icon={Activity}
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {canViewFinancials && (
                <ChartWidget data={data.charts.revenue} isLoading={isLoading} />
              )}
              <ChartWidget
                data={data.charts.userGrowth}
                isLoading={isLoading}
              />
              <ChartWidget data={data.charts.orders} isLoading={isLoading} />
              <ChartWidget
                data={data.charts.searchAnalytics}
                isLoading={isLoading}
              />
            </div>
          </DashboardSection>
        )}

        {/* Search Metrics */}
        <DashboardSection
          title="Search Analytics"
          subtitle="Platform search performance"
          icon={Search}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-card rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">Total Searches</p>
              <p className="mt-1 text-2xl font-bold">
                {formatCompactNumber(data.searchMetrics.totalSearches)}
              </p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">Avg Results</p>
              <p className="mt-1 text-2xl font-bold">
                {data.searchMetrics.avgResultsPerSearch.toFixed(1)}
              </p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">No Results</p>
              <p className="mt-1 text-2xl font-bold">
                {formatCompactNumber(data.searchMetrics.noResultsCount)}
              </p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">Success Rate</p>
              <p className="mt-1 text-2xl font-bold">
                {formatPercentage(
                  1 -
                    data.searchMetrics.noResultsCount /
                      data.searchMetrics.totalSearches
                )}
              </p>
            </div>
          </div>

          {/* Top Search Terms */}
          {data.searchMetrics.topSearchTerms.length > 0 && (
            <div className="bg-muted/50 mt-4 rounded-lg p-4">
              <h4 className="mb-3 text-sm font-medium">Top Search Terms</h4>
              <div className="space-y-2">
                {data.searchMetrics.topSearchTerms
                  .slice(0, 5)
                  .map((term, index) => (
                    <div
                      key={term.term}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-6 text-xs font-medium">
                          #{index + 1}
                        </span>
                        <span className="text-sm">{term.term}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCompactNumber(term.count)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </DashboardSection>

        {/* Top Packages */}
        {canViewFinancials && data.topPackages.length > 0 && (
          <DashboardSection
            title="Top Performing Packages"
            subtitle="Highest revenue generators"
            icon={Award}
          >
            <div className="space-y-3">
              {data.topPackages.slice(0, 5).map((pkg, index) => (
                <div
                  key={pkg.id}
                  className="bg-card hover:border-primary/50 rounded-lg border p-4 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-1 items-start gap-3">
                      <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{pkg.title}</h4>
                        <p className="text-muted-foreground text-sm">
                          by {pkg.seller}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            {formatCompactNumber(pkg.orders)} orders
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-primary text-lg font-bold">
                        {formatCurrency(
                          pkg.revenue,
                          data.stats.revenue.currency
                        )}
                      </p>
                      <p className="text-muted-foreground text-xs">Revenue</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DashboardSection>
        )}

        {/* Quick Actions */}
        <DashboardSection
          title="Management Tools"
          subtitle="Quick access to admin functions"
        >
          <QuickActions
            actions={quickActions}
            config={{
              columns: {
                mobile: 2,
                tablet: 3,
                desktop: 4,
              },
            }}
          />
        </DashboardSection>

        {/* Activity Timeline */}
        <DashboardSection
          title="Recent Activity"
          subtitle="Latest platform events"
          icon={Activity}
        >
          <ActivityTimeline
            activities={data.recentActivities}
            config={{
              groupByDate: true,
              maxItems: 10,
            }}
          />
        </DashboardSection>
      </div>
    );
  }
);

AdminDashboardView.displayName = 'AdminDashboardView';

export default AdminDashboardView;
