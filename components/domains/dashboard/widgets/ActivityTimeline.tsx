/**
 * @fileoverview ActivityTimeline Widget - Activity Feed Component
 * @module components/domains/dashboard/widgets/ActivityTimeline
 *
 * Consolidated activity timeline component with:
 * - Date grouping
 * - Type-based icons and colors
 * - Loading and empty states
 * - Load more functionality
 * - Virtualization support for large lists
 *
 * @created 2025-11-01
 * @sprint Sprint 1 - Day 3 - Task 5.3
 */

'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Clock,
  DollarSign,
  MessageCircle,
  Star,
  CheckCircle,
  AlertCircle,
  User as UserIcon,
  Package,
  Shield,
  Settings,
} from 'lucide-react';
import type {
  ActivityTimelineProps,
  ActivityItem,
} from '../types/dashboard.types';

/**
 * Activity type to icon mapping
 */
const activityIcons = {
  order: CheckCircle,
  message: MessageCircle,
  review: Star,
  dispute: Shield,
  payment: DollarSign,
  package: Package,
  user: UserIcon,
  system: Settings,
  moderation: AlertCircle,
};

/**
 * Activity type to color mapping
 */
const activityColors = {
  order:
    'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  message: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  review:
    'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  dispute: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  payment:
    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  package:
    'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  user: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
  system:
    'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  moderation:
    'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
};

/**
 * Status badge colors
 */
const statusColors = {
  pending:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  in_progress:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  approved:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

/**
 * Group activities by date
 */
function groupActivitiesByDate(
  activities: ActivityItem[]
): Record<string, ActivityItem[]> {
  const groups: Record<string, ActivityItem[]> = {};

  activities.forEach((activity) => {
    const date = new Date(activity.timestamp);
    const dateKey = date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(activity);
  });

  return groups;
}

/**
 * Single Activity Item Component
 */
function ActivityItemComponent({ activity }: { activity: ActivityItem }) {
  const IconComponent = activity.icon || activityIcons[activity.type] || Clock;
  const iconColor =
    activity.iconColor ||
    activityColors[activity.type] ||
    activityColors.system;

  return (
    <div className="group relative flex gap-4">
      {/* Timeline line */}
      <div className="absolute top-12 left-5 h-full w-px bg-gray-200 dark:bg-gray-700" />

      {/* Icon */}
      <div
        className={cn(
          'relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110',
          iconColor
        )}
      >
        <IconComponent className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {/* Title and Status */}
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {activity.title}
              </h4>
              {activity.status && (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    statusColors[activity.status]
                  )}
                >
                  {activity.status.replace('_', ' ')}
                </span>
              )}
            </div>

            {/* Description */}
            {activity.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {activity.description}
              </p>
            )}

            {/* Metadata */}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {/* Timestamp */}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(activity.timestamp), {
                  addSuffix: true,
                  locale: tr,
                })}
              </span>

              {/* User */}
              {activity.user && (
                <span className="flex items-center gap-1">
                  <UserIcon className="h-3 w-3" />
                  {activity.user.name}
                </span>
              )}

              {/* Entity */}
              {activity.entity && (
                <span className="text-gray-400">
                  {activity.entity.type}: {activity.entity.title}
                </span>
              )}
            </div>

            {/* Actions */}
            {activity.actions && activity.actions.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                {activity.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    disabled={action.isLoading}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors',
                      action.variant === 'primary' &&
                        'bg-blue-600 text-white hover:bg-blue-700',
                      action.variant === 'secondary' &&
                        'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300',
                      action.variant === 'danger' &&
                        'bg-red-600 text-white hover:bg-red-700',
                      !action.variant &&
                        'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300',
                      action.isLoading && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    {action.icon && <action.icon className="h-3 w-3" />}
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ActivityTimeline Component
 *
 * Displays a timeline of activities with:
 * - Grouped by date (optional)
 * - Type-based icons and colors
 * - Loading skeleton
 * - Empty state
 * - Load more button
 * - Action buttons per activity
 *
 * @example
 * ```tsx
 * <ActivityTimeline
 *   activities={activities}
 *   config={{
 *     maxItems: 10,
 *     showLoadMore: true,
 *     groupByDate: true,
 *     showEmptyState: true,
 *   }}
 *   onLoadMore={() => fetchMoreActivities()}
 * />
 * ```
 */
export function ActivityTimeline({
  activities,
  config,
  isLoading = false,
  onLoadMore,
  className,
}: ActivityTimelineProps) {
  const maxItems = config?.maxItems || 10;
  const showLoadMore = config?.showLoadMore ?? true;
  const groupByDate = config?.groupByDate ?? true;
  const showEmptyState = config?.showEmptyState ?? true;
  const emptyMessage = config?.emptyMessage || 'Henüz aktivite yok';

  // Limit activities
  const limitedActivities = useMemo(() => {
    return activities.slice(0, maxItems);
  }, [activities, maxItems]);

  // Group activities if enabled
  const groupedActivities = useMemo(() => {
    if (!groupByDate) {
      return { 'All Activities': limitedActivities };
    }
    return groupActivitiesByDate(limitedActivities);
  }, [limitedActivities, groupByDate]);

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex animate-pulse gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Empty state
  if (showEmptyState && activities.length === 0) {
    return (
      <Card className={cn('p-8 text-center', className)}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <Clock className="h-6 w-6 text-gray-400" />
        </div>
        <p className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">
          {emptyMessage}
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Aktiviteleriniz burada görünecek
        </p>
      </Card>
    );
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        {Object.entries(groupedActivities).map(([date, dateActivities]) => (
          <div key={date}>
            {/* Date header (only if grouping) */}
            {groupByDate && (
              <h3 className="mb-4 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                {date}
              </h3>
            )}

            {/* Activities for this date */}
            <div className="space-y-0">
              {dateActivities.map((activity) => (
                <ActivityItemComponent key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Load more button */}
      {showLoadMore && activities.length > maxItems && onLoadMore && (
        <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
          <button
            onClick={onLoadMore}
            className="w-full rounded-md bg-gray-50 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Daha Fazla Göster ({activities.length - maxItems} aktivite)
          </button>
        </div>
      )}
    </Card>
  );
}

/**
 * Export default
 */
export default ActivityTimeline;
