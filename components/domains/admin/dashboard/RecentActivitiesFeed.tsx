/**
 * ================================================
 * RECENT ACTIVITIES FEED COMPONENT
 * ================================================
 * Display recent system activities
 *
 * Sprint 3.2: Admin Dashboard Enhancement
 * @version 1.0.0
 */

'use client';

import {
  UserPlus,
  ShoppingBag,
  CheckCircle,
  DollarSign,
  Ban,
  AlertTriangle,
  CreditCard,
  Package,
  Flag,
} from 'lucide-react';
import type {
  RecentActivity,
  ActivityType,
} from '@/types/business/admin-dashboard';

interface RecentActivitiesFeedProps {
  activities: RecentActivity[];
  isLoading?: boolean;
}

export function RecentActivitiesFeed({
  activities,
  isLoading,
}: RecentActivitiesFeedProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Recent Activities
        </h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="h-5 w-5" />;
      case 'order_placed':
        return <ShoppingBag className="h-5 w-5" />;
      case 'order_completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'refund_approved':
        return <DollarSign className="h-5 w-5" />;
      case 'user_banned':
        return <Ban className="h-5 w-5" />;
      case 'dispute_created':
        return <AlertTriangle className="h-5 w-5" />;
      case 'payment_received':
        return <CreditCard className="h-5 w-5" />;
      case 'package_created':
        return <Package className="h-5 w-5" />;
      case 'review_flagged':
        return <Flag className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'user_registration':
      case 'package_created':
        return 'bg-blue-100 text-blue-600';
      case 'order_completed':
      case 'payment_received':
        return 'bg-green-100 text-green-600';
      case 'refund_approved':
      case 'order_placed':
        return 'bg-purple-100 text-purple-600';
      case 'user_banned':
      case 'review_flagged':
        return 'bg-red-100 text-red-600';
      case 'dispute_created':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString('tr-TR');
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Activities
        </h2>
        <span className="text-sm text-gray-500">
          {activities.length} activities
        </span>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-2 rounded-full bg-gray-100 p-4">
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">No recent activities</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="group flex gap-4 rounded-lg border border-transparent p-3 transition-all hover:border-gray-200 hover:bg-gray-50"
            >
              {/* Icon */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getActivityColor(activity.type)}`}
              >
                {getActivityIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                    {activity.title}
                  </h3>
                  <span className="shrink-0 text-xs text-gray-500">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {activity.description}
                </p>
                {activity.userName && (
                  <p className="mt-1 text-xs text-gray-500">
                    by <span className="font-medium">{activity.userName}</span>
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-4 text-center">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View All Activities
          </button>
        </div>
      )}
    </div>
  );
}
