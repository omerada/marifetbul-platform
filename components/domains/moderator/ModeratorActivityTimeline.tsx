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
 *
 * Sprint 2 - Story 2.3: Activity Timeline
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 3, 2025
 */

'use client';

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
} from 'lucide-react';
import { Card, Badge, UnifiedButton } from '@/components/ui';
import {
  useModeratorActivity,
  type ActionType,
  type TargetType,
  type ActivityLog,
} from '@/hooks/business/moderation/useModeratorActivity';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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
// ACTIVITY ITEM COMPONENT
// ============================================================================

interface ActivityItemProps {
  activity: ActivityLog;
  isLast: boolean;
}

function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative pb-8">
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
        >
          {getActionIcon(activity.actionType)}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <Card className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {/* Action & Target */}
                <div className="mb-2 flex items-center gap-2">
                  <Badge
                    className={cn(
                      'inline-flex items-center gap-1',
                      getActionColor(activity.actionType)
                    )}
                  >
                    {getActionIcon(activity.actionType)}
                    {getActionLabel(activity.actionType)}
                  </Badge>
                  <Badge
                    className={cn(
                      'inline-flex items-center gap-1',
                      getTargetColor(activity.targetType)
                    )}
                  >
                    {getTargetIcon(activity.targetType)}
                    {getTargetLabel(activity.targetType)}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-foreground mb-1 text-sm">
                  {activity.description}
                </p>

                {/* Meta info */}
                <div className="text-muted-foreground flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                  {activity.affectedUserName && (
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {activity.affectedUserName}
                    </span>
                  )}
                </div>

                {/* Expandable reason */}
                {activity.reason && (
                  <div className="mt-2">
                    {isExpanded ? (
                      <div className="bg-muted rounded p-2 text-sm">
                        <p className="mb-1 font-medium">Neden:</p>
                        <p>{activity.reason}</p>
                      </div>
                    ) : (
                      <UnifiedButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(true)}
                        className="h-auto p-0 text-xs"
                      >
                        Nedeni Gör
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </UnifiedButton>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface ModeratorActivityTimelineProps {
  limit?: number;
}

export function ModeratorActivityTimeline({
  limit = 50,
}: ModeratorActivityTimelineProps) {
  const { activities, isLoading, refresh } = useModeratorActivity({
    autoFetch: true,
    limit,
    refreshInterval: 60000,
  });

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start space-x-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
            <Card className="flex-1 p-4">
              <div className="space-y-2">
                <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Son Aktiviteler</h3>
        <UnifiedButton
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
        >
          <Shield className="mr-2 h-4 w-4" />
          Yenile
        </UnifiedButton>
      </div>

      {/* Timeline */}
      {activities.length === 0 ? (
        <Card className="p-12">
          <div className="text-muted-foreground text-center">
            <Clock className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>Henüz aktivite bulunmuyor</p>
          </div>
        </Card>
      ) : (
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, idx) => (
              <li key={activity.activityId}>
                <ActivityItem
                  activity={activity}
                  isLast={idx === activities.length - 1}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
