/**
 * @fileoverview Moderator Dashboard View Component
 * @module components/domains/dashboard/views
 *
 * Complete dashboard view for MODERATOR role with:
 * - Moderation queue management
 * - Content statistics
 * - Response time tracking
 * - Priority-based organization
 * - Quick moderation actions
 *
 * @created 2025-11-02
 * @sprint Sprint 1 - Day 7
 */

import { memo } from 'react';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Flag,
  MessageSquare,
  Package,
  User,
  FileText,
  Activity,
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
import type {
  ModeratorDashboard,
  ModerationItem,
  StatCardData,
} from '../types/dashboard.types';

// Utils
import { formatCompactNumber } from '../utils';

// ============================================================================
// TYPES
// ============================================================================

/**
 * ModeratorDashboardView component props
 */
export interface ModeratorDashboardViewProps {
  /** Moderator dashboard data */
  data: ModeratorDashboard | null;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Refresh callback */
  onRefresh?: () => void;
  /** Moderation action callback */
  onModerate?: (itemId: string, action: 'approve' | 'reject' | 'spam') => void;
  /** Custom className */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Prepare stats cards for moderator dashboard
 */
function prepareStatsCards(data: ModeratorDashboard): StatCardData[] {
  return [
    {
      id: 'pending-items',
      title: 'Bekleyen İçerik',
      value: formatCompactNumber(data.stats.pendingItems),
      icon: Clock,
      subtitle: 'Onay bekliyor',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      id: 'approved-today',
      title: 'Bugün Onaylanan',
      value: formatCompactNumber(data.stats.approvedToday),
      icon: CheckCircle,
      subtitle: 'Başarıyla onaylandı',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      id: 'rejected-today',
      title: 'Bugün Reddedilen',
      value: formatCompactNumber(data.stats.rejectedToday),
      icon: XCircle,
      subtitle: 'Reddedildi',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      id: 'spam-detected',
      title: 'Spam Tespit',
      value: formatCompactNumber(data.stats.spamDetected),
      icon: AlertTriangle,
      subtitle: 'Spam olarak işaretlendi',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
  ];
}

/**
 * Prepare quick actions for moderator
 */
function prepareQuickActions() {
  return [
    {
      id: 'review-queue',
      label: 'Moderation Kuyruğu',
      description: 'Bekleyen içerikleri incele',
      icon: Shield,
      onClick: () => (window.location.href = '/moderator/queue'),
      variant: 'primary' as const,
    },
    {
      id: 'reports',
      label: 'Raporlar',
      description: 'Kullanıcı raporları',
      icon: Flag,
      onClick: () => (window.location.href = '/moderator/reports'),
      variant: 'default' as const,
    },
    {
      id: 'statistics',
      label: 'İstatistikler',
      description: 'Moderasyon istatistikleri',
      icon: Activity,
      onClick: () => (window.location.href = '/moderator/statistics'),
      variant: 'default' as const,
    },
  ];
}

/**
 * Get priority badge color
 */
function getPriorityColor(priority: ModerationItem['priority']): string {
  const colors = {
    low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };
  return colors[priority];
}

/**
 * Get item type icon
 */
function getItemTypeIcon(type: ModerationItem['type']) {
  const icons = {
    package: Package,
    comment: MessageSquare,
    dispute: AlertTriangle,
    report: Flag,
    user: User,
  };
  return icons[type] || FileText;
}

/**
 * Get status badge color
 */
function getStatusColor(status: ModerationItem['status']): string {
  const colors = {
    pending:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    approved:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    spam: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  };
  return colors[status];
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ModeratorDashboardView Component
 *
 * Complete dashboard view for moderator users with moderation queue,
 * statistics, and quick action tools.
 *
 * @example
 * ```tsx
 * <ModeratorDashboardView
 *   data={moderatorData}
 *   isLoading={false}
 *   onModerate={handleModeration}
 * />
 * ```
 */
export const ModeratorDashboardView = memo<ModeratorDashboardViewProps>(
  ({ data, isLoading = false, error, onModerate, className }) => {
    const { canViewCharts } = useDashboardPermissions();

    // Loading state
    if (isLoading || !data) {
      return (
        <div className={className}>
          <DashboardHeader
            title="Moderator Dashboard"
            subtitle="Loading moderation data..."
            role="MODERATOR"
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
            title="Moderator Dashboard"
            subtitle="Error loading dashboard"
            role="MODERATOR"
          />
          <div className="bg-destructive/10 border-destructive rounded-lg border p-4">
            <p className="text-destructive">{error.message}</p>
          </div>
        </div>
      );
    }

    const statsCards = prepareStatsCards(data);
    const quickActions = prepareQuickActions();

    return (
      <div className={className}>
        {/* Header */}
        <DashboardHeader
          title="Moderator Dashboard"
          subtitle={`Moderation overview for last ${data.period.days} days`}
          role="MODERATOR"
        />

        {/* Moderation Statistics */}
        <DashboardSection
          title="Moderation Statistics"
          subtitle="Overview of moderation activities"
          icon={Shield}
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

          {/* Response Time Metric */}
          <div className="bg-muted/50 mt-4 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Average Response Time</p>
                <p className="text-muted-foreground text-xs">
                  Time to moderate items
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-lg font-bold">
                  {data.stats.avgResponseTime} min
                </span>
              </div>
            </div>
          </div>
        </DashboardSection>

        {/* Moderation Charts */}
        {canViewCharts && (
          <DashboardSection
            title="Moderation Analytics"
            subtitle="Volume and response time trends"
            icon={Activity}
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartWidget
                data={data.charts.moderationVolume}
                isLoading={isLoading}
              />
              <ChartWidget
                data={data.charts.responseTime}
                isLoading={isLoading}
              />
            </div>
          </DashboardSection>
        )}

        {/* Moderation Queue */}
        <DashboardSection
          title="Moderation Queue"
          subtitle={`${data.queue.total} items pending review`}
          icon={Shield}
        >
          {data.queue.items.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              <CheckCircle className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>No items in moderation queue</p>
              <p className="mt-1 text-sm">Great job! Everything is reviewed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.queue.items.map((item) => {
                const TypeIcon = getItemTypeIcon(item.type);

                return (
                  <div
                    key={item.id}
                    className="bg-card hover:border-primary/50 rounded-lg border p-4 transition-colors"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex flex-1 items-start gap-3">
                        <div className="bg-muted rounded-lg p-2">
                          <TypeIcon className="text-muted-foreground h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h4 className="font-medium">{item.title}</h4>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(
                                item.priority
                              )}`}
                            >
                              {item.priority}
                            </span>
                            {item.flagsCount && item.flagsCount > 0 && (
                              <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                <Flag className="h-3 w-3" />
                                {item.flagsCount}
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground line-clamp-2 text-sm">
                            {item.content}
                          </p>
                          <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
                            <span className="capitalize">{item.type}</span>
                            <span>•</span>
                            <span>by {item.submittedBy.name}</span>
                            <span>•</span>
                            <span>
                              {new Date(item.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Moderation Actions */}
                    {item.status === 'pending' && onModerate && (
                      <div className="flex items-center gap-2 border-t pt-3">
                        <button
                          onClick={() => onModerate(item.id, 'approve')}
                          className="flex items-center gap-1 rounded-md bg-green-50 px-3 py-1.5 text-sm text-green-700 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Onayla
                        </button>
                        <button
                          onClick={() => onModerate(item.id, 'reject')}
                          className="flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-700 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
                        >
                          <XCircle className="h-4 w-4" />
                          Reddet
                        </button>
                        <button
                          onClick={() => onModerate(item.id, 'spam')}
                          className="flex items-center gap-1 rounded-md bg-yellow-50 px-3 py-1.5 text-sm text-yellow-700 transition-colors hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300 dark:hover:bg-yellow-900/30"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Spam
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Info */}
          {data.queue.total > data.queue.pageSize && (
            <div className="text-muted-foreground mt-4 text-center text-sm">
              Showing {data.queue.items.length} of {data.queue.total} items
            </div>
          )}
        </DashboardSection>

        {/* Quick Actions */}
        <DashboardSection
          title="Moderation Tools"
          subtitle="Quick access to moderation functions"
        >
          <QuickActions
            actions={quickActions}
            config={{
              columns: {
                mobile: 2,
                tablet: 3,
                desktop: 3,
              },
            }}
          />
        </DashboardSection>

        {/* Activity Timeline */}
        <DashboardSection
          title="Recent Activity"
          subtitle="Latest moderation events"
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

ModeratorDashboardView.displayName = 'ModeratorDashboardView';

export default ModeratorDashboardView;
