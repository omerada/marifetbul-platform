/**
 * ================================================
 * MODERATOR ACTIVITY TIMELINE COMPONENT
 * ================================================
 * Displays chronological timeline of moderator actions
 *
 * Features:
 * - Chronological activity feed
 * - Action type icons and colors
 * - Target type badges
 * - Relative timestamps
 * - Expandable details
 * - Real-time auto-refresh (60s default)
 * - Error handling with retry
 * - Empty states
 *
 * Sprint 2 - Task 2.3: Activity Timeline
 * Sprint 3 - Task 3.1: Performance Optimization
 * Sprint 3 - Task 3.2: Error Handling & User Feedback
 *
 * @author MarifetBul Development Team
 * @version 4.0.0
 * @updated November 4, 2025
 *
 * Changes (v4.0.0 - Sprint 3 Task 3.2):
 * - Added error state with retry mechanism
 * - Enhanced empty state UI
 * - Improved loading skeleton
 * - Added error logging
 *
 * Previous Changes (v3.0.0):
 * - Added React.memo for component memoization
 * - Memoized helper functions with useCallback
 * - Optimized activity item rendering
 * - Added display name for debugging
 */

'use client';

import { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  Flag,
  Shield,
  Ban,
  MessageSquare,
  Star,
  HeadphonesIcon,
  User,
  Clock,
  ChevronRight,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Card, Badge, UnifiedButton } from '@/components/ui';
import { useRecentActivities } from '@/hooks/business/useModeration';
import type {
  ModeratorActivity,
  ActionType,
} from '@/types/business/moderation';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

type TargetType = 'COMMENT' | 'REVIEW' | 'REPORT' | 'TICKET' | 'USER';

// ============================================================================
// HELPERS
// ============================================================================

const getActionIcon = (actionType: ActionType) => {
  switch (actionType) {
    case 'APPROVE':
    case 'BULK_APPROVE':
      return <CheckCircle className="h-5 w-5" />;
    case 'REJECT':
    case 'BULK_REJECT':
      return <XCircle className="h-5 w-5" />;
    case 'SPAM':
    case 'BULK_SPAM':
      return <Flag className="h-5 w-5" />;
    case 'RESOLVE':
      return <CheckCircle className="h-5 w-5" />;
    case 'CLOSE':
      return <XCircle className="h-5 w-5" />;
    case 'WARN':
      return <AlertTriangle className="h-5 w-5" />;
    case 'BAN':
      return <Ban className="h-5 w-5" />;
  }
};

const getActionColor = (actionType: ActionType) => {
  switch (actionType) {
    case 'APPROVE':
    case 'BULK_APPROVE':
    case 'RESOLVE':
      return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    case 'REJECT':
    case 'BULK_REJECT':
    case 'CLOSE':
      return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    case 'SPAM':
    case 'BULK_SPAM':
      return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
    case 'WARN':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    case 'BAN':
      return 'text-red-700 bg-red-200 dark:bg-red-900/50';
  }
};

const getActionLabel = (actionType: ActionType) => {
  const labels: Record<ActionType, string> = {
    APPROVE: 'Onaylandı',
    REJECT: 'Reddedildi',
    SPAM: 'Spam İşaretlendi',
    RESOLVE: 'Çözüldü',
    CLOSE: 'Kapatıldı',
    WARN: 'Uyarıldı',
    BAN: 'Yasaklandı',
    BULK_APPROVE: 'Toplu Onay',
    BULK_REJECT: 'Toplu Red',
    BULK_SPAM: 'Toplu Spam',
  };
  return labels[actionType];
};

const getTargetIcon = (targetType: TargetType) => {
  switch (targetType) {
    case 'COMMENT':
      return <MessageSquare className="h-4 w-4" />;
    case 'REVIEW':
      return <Star className="h-4 w-4" />;
    case 'REPORT':
      return <Flag className="h-4 w-4" />;
    case 'TICKET':
      return <HeadphonesIcon className="h-4 w-4" />;
    case 'USER':
      return <User className="h-4 w-4" />;
  }
};

const getTargetLabel = (targetType: TargetType) => {
  const labels: Record<TargetType, string> = {
    COMMENT: 'Yorum',
    REVIEW: 'Değerlendirme',
    REPORT: 'Rapor',
    TICKET: 'Destek',
    USER: 'Kullanıcı',
  };
  return labels[targetType];
};

const getTargetColor = (targetType: TargetType) => {
  const colors: Record<TargetType, string> = {
    COMMENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    REVIEW:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    REPORT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    TICKET:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    USER: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  };
  return colors[targetType];
};

const getTargetUrl = (
  targetType: TargetType,
  targetId: string
): string | null => {
  switch (targetType) {
    case 'COMMENT':
      return `/moderator/comments?id=${targetId}`;
    case 'REVIEW':
      return `/moderator/reviews?id=${targetId}`;
    case 'REPORT':
      return `/moderator/reports?id=${targetId}`;
    case 'TICKET':
      return `/moderator/tickets?id=${targetId}`;
    case 'USER':
      return `/moderator/users/${targetId}`;
    default:
      return null;
  }
};

const formatRelativeTime = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dakika önce`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} saat önce`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;

  // Format as date
  return time.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ============================================================================
// ACTIVITY ITEM COMPONENT (Memoized for performance)
// ============================================================================

interface ActivityItemProps {
  activity: ModeratorActivity;
  isLast: boolean;
}

const ActivityItem = memo(function ActivityItem({
  activity,
  isLast,
}: ActivityItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Type assertion for targetType since backend returns string
  const targetType = activity.targetType as TargetType;

  // Get target URL for linking (memoized)
  const targetUrl = getTargetUrl(targetType, activity.targetId);

  // Toggle expanded state with useCallback
  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <div className="relative pb-8" role="listitem">
      {/* Timeline line */}
      {!isLast && (
        <span
          className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
          aria-hidden="true"
        />
      )}

      <div className="relative flex items-start space-x-3">
        {/* Icon */}
        <div
          className={cn(
            'relative flex h-10 w-10 items-center justify-center rounded-full',
            getActionColor(activity.actionType)
          )}
          aria-hidden="true"
        >
          {getActionIcon(activity.actionType)}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <Card
            className="p-4"
            role="article"
            aria-labelledby={`activity-${activity.activityId}-desc`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {/* Action & Target */}
                <div
                  className="mb-2 flex items-center gap-2"
                  role="group"
                  aria-label="İşlem türü ve hedef"
                >
                  <Badge
                    className={cn(
                      'inline-flex items-center gap-1',
                      getActionColor(activity.actionType)
                    )}
                    aria-label={`İşlem: ${getActionLabel(activity.actionType)}`}
                  >
                    {getActionIcon(activity.actionType)}
                    {getActionLabel(activity.actionType)}
                  </Badge>
                  <Badge
                    className={cn(
                      'inline-flex items-center gap-1',
                      getTargetColor(targetType)
                    )}
                    aria-label={`Hedef: ${getTargetLabel(targetType)}`}
                  >
                    {getTargetIcon(targetType)}
                    {getTargetLabel(targetType)}
                  </Badge>
                </div>

                {/* Description */}
                <p
                  id={`activity-${activity.activityId}-desc`}
                  className="text-foreground mb-1 text-sm"
                >
                  {activity.description}
                </p>

                {/* Meta info */}
                <div
                  className="text-muted-foreground flex items-center gap-3 text-xs"
                  role="group"
                  aria-label="Aktivite detayları"
                >
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    <time
                      dateTime={activity.timestamp}
                      aria-label={`Zaman: ${formatRelativeTime(activity.timestamp)}`}
                    >
                      {formatRelativeTime(activity.timestamp)}
                    </time>
                  </span>
                  {activity.affectedUserName && (
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3 w-3" aria-hidden="true" />
                      <span
                        aria-label={`Etkilenen kullanıcı: ${activity.affectedUserName}`}
                      >
                        {activity.affectedUserName}
                      </span>
                    </span>
                  )}
                </div>

                {/* Expandable reason */}
                {activity.reason && (
                  <div className="mt-2">
                    {isExpanded ? (
                      <div
                        className="bg-muted rounded p-2 text-sm"
                        role="region"
                        aria-label="İşlem nedeni"
                      >
                        <p className="mb-1 font-medium">Neden:</p>
                        <p>{activity.reason}</p>
                        <UnifiedButton
                          variant="ghost"
                          size="sm"
                          onClick={toggleExpanded}
                          className="mt-2 h-auto p-0 text-xs"
                          aria-label="Nedeni gizle"
                          aria-expanded={isExpanded}
                        >
                          Gizle
                          <ChevronRight
                            className={cn(
                              'ml-1 h-3 w-3 transition-transform',
                              isExpanded && 'rotate-90'
                            )}
                            aria-hidden="true"
                          />
                        </UnifiedButton>
                      </div>
                    ) : (
                      <UnifiedButton
                        variant="ghost"
                        size="sm"
                        onClick={toggleExpanded}
                        className="h-auto p-0 text-xs"
                        aria-label="İşlem nedenini göster"
                        aria-expanded={isExpanded}
                      >
                        Nedeni Gör
                        <ChevronRight
                          className="ml-1 h-3 w-3"
                          aria-hidden="true"
                        />
                      </UnifiedButton>
                    )}
                  </div>
                )}

                {/* View target link */}
                {targetUrl && (
                  <div className="mt-2">
                    <Link
                      href={targetUrl}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
                      aria-label={`${getTargetLabel(targetType)} içeriğini görüntüle`}
                    >
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      İçeriği Görüntüle
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
});

// Display name for debugging
ActivityItem.displayName = 'ActivityItem';

// ============================================================================
// MAIN COMPONENT (Memoized)
// ============================================================================

export interface ModeratorActivityTimelineProps {
  /**
   * Number of activities to display (default: 50)
   */
  limit?: number;
  /**
   * Page number for pagination (default: 1)
   */
  page?: number;
  /**
   * Auto-refresh interval in milliseconds (default: 60000 = 60s)
   */
  refreshInterval?: number;
}

export const ModeratorActivityTimeline = memo(
  function ModeratorActivityTimeline({
    limit = 50,
    page = 1,
    refreshInterval = 60000,
  }: ModeratorActivityTimelineProps) {
    const {
      activities,
      isLoading,
      error,
      refresh: refreshData,
    } = useRecentActivities(page, limit, refreshInterval);

    // Handle refresh button click with useCallback
    const handleRefresh = useCallback(() => {
      refreshData();
    }, [refreshData]);

    // ============================================================================
    // ERROR STATE
    // ============================================================================

    if (error) {
      return (
        <Card
          className="border-red-200 bg-red-50 p-8"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex flex-col items-center text-center">
            <div
              className="mb-4 rounded-full bg-red-100 p-3"
              aria-hidden="true"
            >
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-red-900">
              Aktiviteler Yüklenemedi
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Son aktiviteler yüklenirken bir hata oluştu. Lütfen tekrar
              deneyin.
            </p>
            <UnifiedButton
              onClick={handleRefresh}
              variant="primary"
              size="md"
              className="bg-red-600 hover:bg-red-700"
              aria-label="Aktiviteleri yeniden yükle"
            >
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Tekrar Dene
            </UnifiedButton>
          </div>
        </Card>
      );
    }

    // ============================================================================
    // LOADING STATE
    // ============================================================================

    if (isLoading) {
      return (
        <div
          className="space-y-4"
          role="status"
          aria-live="polite"
          aria-label="Aktiviteler yükleniyor"
        >
          <div className="flex items-center justify-between">
            <div className="h-7 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-9 w-24 animate-pulse rounded bg-gray-200" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
              <Card className="flex-1 p-4">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
                  </div>
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                </div>
              </Card>
            </div>
          ))}
          <span className="sr-only">Aktiviteler yükleniyor...</span>
        </div>
      );
    }

    // ============================================================================
    // EMPTY STATE
    // ============================================================================

    if (!activities || activities.length === 0) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 id="timeline-heading" className="text-lg font-semibold">
              Son Aktiviteler
            </h3>
            <UnifiedButton
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              aria-label="Aktiviteleri yenile"
            >
              <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
              Yenile
            </UnifiedButton>
          </div>
          <Card className="p-12" role="status">
            <div className="text-muted-foreground flex flex-col items-center text-center">
              <div
                className="mb-4 rounded-full bg-gray-100 p-4"
                aria-hidden="true"
              >
                <Clock className="h-12 w-12 text-gray-400" />
              </div>
              <h4 className="mb-2 text-base font-semibold text-gray-900">
                Henüz Aktivite Yok
              </h4>
              <p className="text-sm">
                Moderasyon işlemleriniz burada görünecek
              </p>
            </div>
          </Card>
        </div>
      );
    }

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
      <div
        className="space-y-4"
        role="region"
        aria-labelledby="timeline-heading"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 id="timeline-heading" className="text-lg font-semibold">
            Son Aktiviteler
          </h3>
          <UnifiedButton
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            aria-label="Aktiviteleri yenile"
          >
            <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
            Yenile
          </UnifiedButton>
        </div>

        {/* Timeline */}
        <div className="flow-root">
          <ul
            className="-mb-8"
            role="list"
            aria-label="Moderasyon aktivite zaman çizelgesi"
          >
            {activities.map((activity: ModeratorActivity, idx: number) => (
              <li key={activity.activityId}>
                <ActivityItem
                  activity={activity}
                  isLast={idx === activities.length - 1}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
);

// Display name for debugging
ModeratorActivityTimeline.displayName = 'ModeratorActivityTimeline';
