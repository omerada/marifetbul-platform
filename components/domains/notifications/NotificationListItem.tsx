'use client';

import React from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Notification } from '@/types/domains/notification';
import {
  Check,
  Archive,
  Trash2,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  getNotificationIcon,
  getNotificationBadge,
  getBadgeVariant,
  formatTimeAgo,
} from './notificationHelpers';

interface NotificationListItemProps {
  notification: Notification;
  onClick?: () => void;
  onMarkAsRead?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onExpand?: () => void; // Sprint 6 - Story 6.6: Expand grouped notification
  showActions?: boolean;
  layout?: 'list' | 'card';
  className?: string;
}

export const NotificationListItem: React.FC<NotificationListItemProps> = ({
  notification,
  onClick,
  onMarkAsRead,
  onArchive,
  onDelete,
  onExpand, // Sprint 6 - Story 6.6
  showActions = true,
  layout = 'list',
  className = '',
}) => {
  // Check if notification is grouped (Sprint 6 - Story 6.6)
  const isGrouped = notification.groupedCount && notification.groupedCount > 1;

  if (layout === 'card') {
    return (
      <div
        className={`group cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md ${
          !notification.isRead
            ? 'border-blue-200 bg-blue-50'
            : 'border-gray-200 bg-white'
        } ${className}`}
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={getBadgeVariant(notification.type)} size="sm">
                    {getNotificationBadge(notification.type)}
                  </Badge>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  )}
                  {/* Sprint 6 - Story 6.6: Grouped notification indicator */}
                  {isGrouped && (
                    <Badge
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Layers className="h-3 w-3" />
                      {notification.groupedCount}
                    </Badge>
                  )}
                </div>
                <h4
                  className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}
                >
                  {notification.title}
                </h4>
              </div>
              <span className="flex flex-shrink-0 items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(notification.createdAt)}
              </span>
            </div>

            <p className="mb-3 text-sm text-gray-600">{notification.content}</p>

            {showActions && (
              <div className="flex items-center gap-2">
                {/* Sprint 6 - Story 6.6: Expand grouped notification */}
                {isGrouped && onExpand && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExpand();
                    }}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    <ChevronRight className="mr-1 h-3 w-3" />
                    {notification.groupedCount} Bildirimi Gör
                  </Button>
                )}
                {!notification.isRead && onMarkAsRead && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead();
                    }}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Okundu İşaretle
                  </Button>
                )}
                {onArchive && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive();
                    }}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    <Archive className="mr-1 h-3 w-3" />
                    Arşivle
                  </Button>
                )}
                {onDelete && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    size="sm"
                    variant="outline"
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Sil
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all hover:bg-gray-50 ${
        !notification.isRead ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        {getNotificationIcon(notification.type)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={getBadgeVariant(notification.type)} size="sm">
                {getNotificationBadge(notification.type)}
              </Badge>
              {!notification.isRead && (
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
              )}
              {/* Sprint 6 - Story 6.6: Grouped notification indicator */}
              {isGrouped && (
                <Badge
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Layers className="h-3 w-3" />
                  {notification.groupedCount}
                </Badge>
              )}
            </div>
            <h4
              className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}
            >
              {notification.title}
            </h4>
            <p className="line-clamp-2 text-xs text-gray-600">
              {notification.content}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(notification.createdAt)}
            </span>
            {showActions && (
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {/* Sprint 6 - Story 6.6: Expand grouped notification */}
                {isGrouped && onExpand && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExpand();
                    }}
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    title={`${notification.groupedCount} bildirimi gör`}
                  >
                    <Layers className="mr-1 h-3 w-3" />
                    {notification.groupedCount}
                  </Button>
                )}
                {!notification.isRead && onMarkAsRead && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead();
                    }}
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    title="Okundu işaretle"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
                {onArchive && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive();
                    }}
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    title="Arşivle"
                  >
                    <Archive className="h-3 w-3" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    title="Sil"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
