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

// ==================== STATS CARD ====================

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'orange';
  loading?: boolean;
  previousValue?: number;
}

function StatsCard({
  title,
  value,
  icon,
  color,
  loading,
  previousValue,
}: StatsCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
  };

  // Animate value changes
  useEffect(() => {
    if (previousValue !== undefined && previousValue !== value) {
      setIsAnimating(true);

      // Animate number count
      const duration = 500;
      const steps = 20;
      const increment = (value - previousValue) / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayValue(value);
          clearInterval(timer);
          setTimeout(() => setIsAnimating(false), 300);
        } else {
          setDisplayValue(Math.round(previousValue + increment * currentStep));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, previousValue]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-8 w-16 rounded bg-gray-200" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`p-6 transition-all duration-300 hover:shadow-lg ${
        isAnimating ? 'scale-105 ring-2 ring-blue-400' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p
            className={`mt-2 text-3xl font-bold text-gray-900 transition-all duration-300 ${
              isAnimating ? 'scale-110 text-blue-600' : ''
            }`}
          >
            {displayValue}
          </p>
        </div>
        <div
          className={`rounded-lg p-3 ${colorClasses[color]} text-white ${
            isAnimating ? 'animate-pulse' : ''
          }`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

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
      logger.debug('BlogModerationDashboard', { data });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'İstatistikler yüklenemedi';
      setStatsError(errorMessage);
      logger.error('BlogModerationDashboard', 'Failed to fetch stats', err);
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

      logger.debug('BlogModerationDashboard', { activityData });
    } catch (err) {
      logger.error('BlogModerationDashboard', 'Failed to fetch analytics', err);
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
        logger.debug('BlogModerationDashboard', 'Auto-refresh triggered');
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
      logger.debug(
        'BlogModerationDashboard',
        'Refresh triggered by WebSocket event'
      );
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
            actionUrl: '/admin/moderation/comments',
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
            actionUrl: '/admin/moderation/comments',
            data: { commentId: payload.commentId, urgent: true },
          });
        }
      },
    },
  });

  // Manual refresh
  const handleRefresh = useCallback(() => {
    logger.info('BlogModerationDashboard', 'Manual refresh triggered');
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
      logger.debug('BlogModerationDashboard', { range, startDate, endDate,  });
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
                title="Bekleyen"
                value={statsData.pending}
                previousValue={previousStats.pending}
                icon={<MessageSquare className="h-5 w-5" />}
                color="blue"
                loading={statsLoading}
              />
              <StatsCard
                title="Onaylanan"
                value={statsData.approved}
                previousValue={previousStats.approved}
                icon={<CheckCircle className="h-5 w-5" />}
                color="green"
                loading={statsLoading}
              />
              <StatsCard
                title="Reddedilen"
                value={statsData.rejected}
                previousValue={previousStats.rejected}
                icon={<XCircle className="h-5 w-5" />}
                color="red"
                loading={statsLoading}
              />
              <StatsCard
                title="Toplam İşlem (Bugün)"
                value={statsData.total}
                previousValue={previousStats.total}
                icon={<Shield className="h-5 w-5" />}
                color="orange"
                loading={statsLoading}
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
