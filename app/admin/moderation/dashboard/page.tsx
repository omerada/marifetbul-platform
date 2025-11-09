/**
 * ================================================
 * BLOG MODERATION DASHBOARD PAGE
 * ================================================
 * Comprehensive blog comment moderation dashboard
 * with real-time notifications, stats, and activity log
 *
 * Sprint 2 - Day 4: Admin Moderation Dashboard
 * @author MarifetBul Development Team
 * @version 2.0.0 - Enhanced with real-time features
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Shield,
  RefreshCw,
  Settings,
  Bell,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { UnifiedButton } from '@/components/ui';
import { UnifiedErrorBoundary } from '@/components/ui/UnifiedErrorBoundary';
import {
  ActivityLogViewer,
  NotificationPreferences,
  PerformanceCharts,
  ModeratorLeaderboard,
  TimeRangeFilter,
} from '@/components/domains/moderation';
import type { TimeRange } from '@/components/domains/moderation';
import { useModerationNotifications } from '@/hooks/business/useModerationNotifications';
import { useBrowserNotifications } from '@/hooks/shared/useBrowserNotifications';
import { getModerationStats } from '@/lib/api/moderation';
import { getActivityStatistics } from '@/lib/api/moderation-activity';
import type { ModerationStats } from '@/types/business/moderation';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  PerformanceData,
  ModeratorStats as ModeratorStatsType,
} from '@/components/domains/moderation';
import { StatsCard } from '@/components/domains/dashboard/widgets/StatsCard';

// ==================== MAIN COMPONENT ====================

export default function BlogModerationDashboard() {
  const [showPreferences, setShowPreferences] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({
    enableWebSocket: true,
    enableBrowser: false,
    enableSound: false,
    showToasts: true,
  });

  // Time range filter
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [customStartDate, setCustomStartDate] = useState<string>();
  const [customEndDate, setCustomEndDate] = useState<string>();

  // Stats state
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Previous stats for animation
  const [previousStats, setPreviousStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  // Performance & Activity state
  const [performanceData, setPerformanceData] =
    useState<PerformanceData | null>(null);
  const [moderatorStats, setModeratorStats] = useState<ModeratorStatsType[]>(
    []
  );
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Fetch stats function
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const data = await getModerationStats();

      // Save previous stats for animation
      if (stats) {
        setPreviousStats({
          pending: stats.pendingComments || 0,
          approved: stats.commentsApprovedToday || 0,
          rejected: stats.commentsRejectedToday || 0,
          total:
            (stats.pendingComments || 0) +
            (stats.commentsApprovedToday || 0) +
            (stats.commentsRejectedToday || 0),
        });
      }

      setStats(data);
      setLastUpdated(new Date());
      logger.info('BlogModerationDashboard', {
        context: 'Refresh triggered by WebSocket event',
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'İstatistikler yüklenemedi';
      setStatsError(errorMessage);
      logger.error(
        'Failed to fetch stats',
        err instanceof Error ? err : new Error(String(err)),
        {
          component: 'BlogModerationDashboard',
        }
      );
    } finally {
      setStatsLoading(false);
    }
  }, [stats]);

  // Fetch analytics function
  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);

      // Calculate date range based on selected filter
      const endDate = new Date().toISOString().split('T')[0];
      let startDate = endDate;

      if (timeRange === 'today') {
        startDate = endDate;
      } else if (timeRange === 'week') {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        startDate = date.toISOString().split('T')[0];
      } else if (timeRange === 'month') {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        startDate = date.toISOString().split('T')[0];
      } else if (timeRange === 'custom' && customStartDate && customEndDate) {
        startDate = customStartDate;
      }

      const activityData = await getActivityStatistics(startDate, endDate);

      // Transform to PerformanceData
      const totalApproves =
        (activityData.actionsByType['APPROVE'] || 0) +
        (activityData.actionsByType['BULK_APPROVE'] || 0);
      const totalRejects =
        (activityData.actionsByType['REJECT'] || 0) +
        (activityData.actionsByType['BULK_REJECT'] || 0);
      const totalActions = totalApproves + totalRejects;
      const approvalRate =
        totalActions > 0 ? Math.round((totalApproves / totalActions) * 100) : 0;

      setPerformanceData({
        approvalRate,
        averageResponseTime: stats?.averageResponseTimeMinutes || 0,
        totalActions: activityData.totalActions,
        actionsByType: activityData.actionsByType,
        trend:
          approvalRate >= 70 ? 'up' : approvalRate >= 50 ? 'stable' : 'down',
      });

      setModeratorStats(activityData.topModerators);

      logger.debug('Analytics fetched successfully', { activityData });
    } catch (err) {
      logger.error(
        'Failed to fetch analytics',
        err instanceof Error ? err : new Error(String(err)),
        {
          component: 'BlogModerationDashboard',
        }
      );
    } finally {
      setAnalyticsLoading(false);
    }
  }, [
    timeRange,
    customStartDate,
    customEndDate,
    stats?.averageResponseTimeMinutes,
  ]);

  // Load stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Load analytics when filters change
  useEffect(() => {
    if (stats) {
      fetchAnalytics();
    }
  }, [stats, fetchAnalytics]);

  // Auto-refresh stats every 30 seconds (optional, can be disabled)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!statsLoading) {
        logger.debug('Auto-refresh triggered', {
          component: 'BlogModerationDashboard',
        });
        fetchStats();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchStats, statsLoading]);

  // Browser notifications
  const browserNotifications = useBrowserNotifications({
    defaultIcon: '/icons/icon-192x192.png',
    onNotificationClick: (data) => {
      if (data?.url) {
        window.location.href = data.url as string;
      }
    },
  });

  // WebSocket notifications with handlers
  const {
    isConnected,
    lastEvent,
    refresh: refreshWebSocket,
  } = useModerationNotifications({
    enabled: notificationPrefs.enableWebSocket,
    showToasts: notificationPrefs.showToasts,
    enableSound: notificationPrefs.enableSound,
    onRefreshNeeded: () => {
      logger.info('Refresh triggered by WebSocket event', {
        component: 'BlogModerationDashboard',
      });
      fetchStats();
    },
    handlers: {
      onNewComment: async (payload) => {
        // Show browser notification for new comments
        if (notificationPrefs.enableBrowser && browserNotifications.isGranted) {
          await browserNotifications.showNotification({
            title: 'Yeni Yorum',
            body: `${payload.authorName || 'Bilinmeyen'} yeni yorum gönderdi: "${payload.postTitle}"`,
            tag: 'new-comment',
            requireInteraction: false,
            actionUrl: '/moderator/comments',
            data: { commentId: payload.commentId },
          });
        }
      },
      onCommentFlagged: async (payload) => {
        // Show urgent browser notification for flagged content
        if (notificationPrefs.enableBrowser && browserNotifications.isGranted) {
          await browserNotifications.showNotification({
            title: '⚠️ Acil: Yorum Bildirildi',
            body: 'Bir yorum kullanıcı tarafından bildirildi. Acil inceleme gerekiyor.',
            tag: 'flagged-comment',
            requireInteraction: true,
            actionUrl: '/moderator/comments',
            data: { commentId: payload.commentId, urgent: true },
          });
        }
      },
    },
  });

  // Manual refresh
  const handleRefresh = useCallback(() => {
    logger.info('Manual refresh triggered', {
      component: 'BlogModerationDashboard',
    });
    fetchStats();
    fetchAnalytics();
    refreshWebSocket();
  }, [fetchStats, fetchAnalytics, refreshWebSocket]);

  // Handle time range change
  const handleTimeRangeChange = useCallback(
    (range: TimeRange, startDate?: string, endDate?: string) => {
      setTimeRange(range);
      if (range === 'custom' && startDate && endDate) {
        setCustomStartDate(startDate);
        setCustomEndDate(endDate);
      }
      logger.debug('BlogModerationDashboard', { range, startDate, endDate });
    },
    []
  );

  // Extract stats values
  const statsData = {
    pending: stats?.pendingComments || 0,
    approved: stats?.commentsApprovedToday || 0,
    rejected: stats?.commentsRejectedToday || 0,
    total:
      (stats?.pendingComments || 0) +
      (stats?.commentsApprovedToday || 0) +
      (stats?.commentsRejectedToday || 0),
  };

  return (
    <UnifiedErrorBoundary level="page">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-blue-600 p-3 text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Blog Moderasyon Paneli
                  </h1>
                  <p className="mt-1 text-gray-600">
                    Yorum denetimi ve aktivite takibi
                  </p>
                </div>
              </div>

              {/* Connection Status & Actions */}
              <div className="flex items-center gap-3">
                {/* WebSocket Status */}
                <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {isConnected ? 'Bağlı' : 'Bağlantı Yok'}
                  </span>
                </div>

                {/* Browser Notifications Status */}
                {browserNotifications.isGranted && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
                    <Bell className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Bildirimler Aktif
                    </span>
                  </div>
                )}

                {/* Refresh Button */}
                <UnifiedButton
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={statsLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`}
                  />
                  Yenile
                </UnifiedButton>

                {/* Settings Button */}
                <UnifiedButton
                  onClick={() => setShowPreferences(!showPreferences)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Ayarlar
                </UnifiedButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
          {/* Error Alert */}
          {statsError && (
            <Card className="border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">{statsError}</span>
              </div>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="space-y-4">
            {/* Last Updated Info */}
            {lastUpdated && (
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  <span>Canlı güncelleniyor</span>
                </div>
                <span>
                  Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                data={{
                  id: 'pending-comments',
                  title: 'Bekleyen',
                  value: statsData.pending,
                  icon: MessageSquare,
                  iconColor: 'blue',
                  trend: previousStats.pending
                    ? {
                        percentage:
                          ((statsData.pending - previousStats.pending) /
                            previousStats.pending) *
                          100,
                        direction:
                          statsData.pending > previousStats.pending
                            ? 'up'
                            : statsData.pending < previousStats.pending
                              ? 'down'
                              : 'neutral',
                        isPositive: statsData.pending < previousStats.pending,
                      }
                    : undefined,
                }}
                isLoading={statsLoading}
              />
              <StatsCard
                data={{
                  id: 'approved-comments',
                  title: 'Onaylanan',
                  value: statsData.approved,
                  icon: CheckCircle,
                  iconColor: 'green',
                  trend: previousStats.approved
                    ? {
                        percentage:
                          ((statsData.approved - previousStats.approved) /
                            previousStats.approved) *
                          100,
                        direction:
                          statsData.approved > previousStats.approved
                            ? 'up'
                            : statsData.approved < previousStats.approved
                              ? 'down'
                              : 'neutral',
                        isPositive: statsData.approved > previousStats.approved,
                      }
                    : undefined,
                }}
                isLoading={statsLoading}
              />
              <StatsCard
                data={{
                  id: 'rejected-comments',
                  title: 'Reddedilen',
                  value: statsData.rejected,
                  icon: XCircle,
                  iconColor: 'red',
                  trend: previousStats.rejected
                    ? {
                        percentage:
                          ((statsData.rejected - previousStats.rejected) /
                            previousStats.rejected) *
                          100,
                        direction:
                          statsData.rejected > previousStats.rejected
                            ? 'up'
                            : statsData.rejected < previousStats.rejected
                              ? 'down'
                              : 'neutral',
                        isPositive: statsData.rejected < previousStats.rejected,
                      }
                    : undefined,
                }}
                isLoading={statsLoading}
              />
              <StatsCard
                data={{
                  id: 'total-comments',
                  title: 'Toplam İşlem (Bugün)',
                  value: statsData.total,
                  icon: Shield,
                  iconColor: 'orange',
                  trend: previousStats.total
                    ? {
                        percentage:
                          ((statsData.total - previousStats.total) /
                            previousStats.total) *
                          100,
                        direction:
                          statsData.total > previousStats.total
                            ? 'up'
                            : statsData.total < previousStats.total
                              ? 'down'
                              : 'neutral',
                        isPositive: statsData.total > previousStats.total,
                      }
                    : undefined,
                }}
                isLoading={statsLoading}
              />
            </div>
          </div>

          {/* Notification Preferences */}
          {showPreferences && (
            <div className="animate-in fade-in duration-200">
              <NotificationPreferences
                initialPreferences={notificationPrefs}
                onChange={(prefs) => {
                  setNotificationPrefs(prefs);
                  logger.debug('BlogModerationDashboard', { prefs });
                }}
                showSaveButton={false}
              />
            </div>
          )}

          {/* Time Range Filter */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Performans Analizi
            </h2>
            <TimeRangeFilter
              value={timeRange}
              onChange={handleTimeRangeChange}
            />
          </div>

          {/* Performance Charts */}
          <PerformanceCharts
            data={performanceData}
            loading={analyticsLoading}
          />

          {/* Moderator Leaderboard */}
          <ModeratorLeaderboard
            moderators={moderatorStats}
            loading={analyticsLoading}
            maxDisplay={10}
          />

          {/* Activity Log */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Aktivite Geçmişi
              </h2>
              {lastEvent && (
                <div className="text-sm text-gray-600">
                  Son Olay:{' '}
                  <span className="font-medium">{lastEvent.type}</span>
                </div>
              )}
            </div>

            <ActivityLogViewer showFilters={true} pageSize={20} />
          </div>

          {/* Info Card */}
          <Card className="border-blue-200 bg-blue-50 p-6">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">
                  Gerçek Zamanlı Bildirimler
                </h3>
                <p className="mt-1 text-sm text-blue-800">
                  Yeni yorumlar ve bildirilenler otomatik olarak bu panele
                  düşer. WebSocket bağlantısı aktif olduğunda anlık
                  güncellemeler alırsınız.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </UnifiedErrorBoundary>
  );
}
