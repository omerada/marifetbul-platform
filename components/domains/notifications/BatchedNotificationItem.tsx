'use client';

import React, { useState } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import {
  Check,
  Trash2,
  Clock,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';
import {
  getNotificationIcon,
  getNotificationBadge,
  getBadgeVariant,
  formatTimeAgo,
} from './notificationHelpers';
import { NotificationListItem } from './NotificationListItem';
import type {
  NotificationResponse as Notification,
  NotificationType,
} from '@/lib/api/notifications';

/**
 * ================================================
 * BATCHED NOTIFICATION ITEM COMPONENT
 * ================================================
 * Sprint 6 - Story 6.1: Notification Batching Service
 *
 * Displays a batched notification with expandable list of items.
 *
 * Features:
 * - Collapsible notification list (expandable)
 * - Batch title and summary ("5 new messages from 3 conversations")
 * - Batch actions (mark all read, delete all)
 * - Individual notification rendering within batch
 * - Visual indicator for batch status
 *
 * Example:
 *   "You have 5 new messages from 3 conversations"
 *   [Click to expand]
 *   - New message from John
 *   - New message from Jane
 *   - New message from Bob
 *   ...
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 6
 */

// ==================== TYPES ====================

/**
 * Batch Type (aligned with backend NotificationBatchType)
 */
export type NotificationBatchType =
  | 'MESSAGE'
  | 'PROPOSAL'
  | 'ORDER'
  | 'PAYMENT'
  | 'REVIEW'
  | 'SYSTEM';

/**
 * Notification Batch Data Structure
 * Maps to backend NotificationBatch entity
 */
export interface NotificationBatchData {
  id: string;
  batchType: NotificationBatchType;
  title: string;
  message: string;
  itemCount: number;
  items: Notification[];
  createdAt: string;
  sentAt?: string;
  isExpanded?: boolean;
}

// ==================== COMPONENT ====================

interface BatchedNotificationItemProps {
  batch: NotificationBatchData;
  onMarkAllAsRead?: () => void;
  onDeleteAll?: () => void;
  onItemClick?: (notification: Notification) => void;
  onItemMarkAsRead?: (notificationId: string) => void;
  onItemDelete?: (notificationId: string) => void;
  showActions?: boolean;
  className?: string;
}

export const BatchedNotificationItem: React.FC<
  BatchedNotificationItemProps
> = ({
  batch,
  onMarkAllAsRead,
  onDeleteAll,
  onItemClick,
  onItemMarkAsRead,
  onItemDelete,
  showActions = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate unread count
  const unreadCount = batch.items.filter((item) => !item.isRead).length;
  const hasUnread = unreadCount > 0;

  // Get batch icon based on type
  const getBatchIcon = () => {
    switch (batch.batchType) {
      case 'MESSAGE':
        return getNotificationIcon('MESSAGE');
      case 'PROPOSAL':
        return getNotificationIcon('PROPOSAL');
      case 'ORDER':
        return getNotificationIcon('ORDER');
      case 'PAYMENT':
        return getNotificationIcon('PAYMENT');
      case 'REVIEW':
        return getNotificationIcon('REVIEW');
      default:
        return getNotificationIcon('SYSTEM');
    }
  };

  // Get batch badge variant
  const getBatchBadgeVariant = () => {
    // Cast to compatible NotificationType
    const notifType = batch.batchType === 'SYSTEM' ? 'SYSTEM' : batch.batchType;
    return getBadgeVariant(notifType);
  };

  // Get batch display text
  const getBatchBadgeText = () => {
    // Cast to compatible NotificationType
    const notifType = batch.batchType === 'SYSTEM' ? 'SYSTEM' : batch.batchType;
    return getNotificationBadge(notifType);
  };

  return (
    <div
      className={`group rounded-lg border transition-all ${
        hasUnread ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
      } ${className}`}
    >
      {/* Batch Header */}
      <div
        className="cursor-pointer p-4 hover:bg-gray-50/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          {/* Batch Icon with Layer Indicator */}
          <div className="relative flex-shrink-0">
            {getBatchIcon()}
            <div className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
              <Layers className="h-2.5 w-2.5" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            {/* Header Row: Badge, Title, Time */}
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={getBatchBadgeVariant()} size="sm">
                    {getBatchBadgeText()}
                  </Badge>
                  {hasUnread && (
                    <Badge variant="destructive" size="sm">
                      {unreadCount} okunmamış
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    <Layers className="h-3 w-3" />
                    <span>{batch.itemCount} bildirim</span>
                  </div>
                </div>

                {/* Batch Title */}
                <h4
                  className={`text-sm ${hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}
                >
                  {batch.title}
                </h4>
              </div>

              {/* Time & Expand/Collapse Icon */}
              <div className="flex flex-shrink-0 items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(batch.createdAt)}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Batch Message */}
            <p className="mb-2 text-sm text-gray-600">{batch.message}</p>

            {/* Batch Actions */}
            {showActions && !isExpanded && (
              <div className="flex items-center gap-2">
                {hasUnread && onMarkAllAsRead && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAllAsRead();
                    }}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Tümünü Okundu İşaretle ({unreadCount})
                  </Button>
                )}
                {onDeleteAll && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAll();
                    }}
                    size="sm"
                    variant="outline"
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Tümünü Sil ({batch.itemCount})
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Notification List */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-white">
          {/* Expanded Actions */}
          {showActions && (
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2">
              <span className="text-xs font-medium text-gray-600">
                Toplam {batch.itemCount} bildirim
                {hasUnread && ` • ${unreadCount} okunmamış`}
              </span>
              <div className="flex gap-2">
                {hasUnread && onMarkAllAsRead && (
                  <Button
                    onClick={onMarkAllAsRead}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Tümünü Okundu İşaretle
                  </Button>
                )}
                {onDeleteAll && (
                  <Button
                    onClick={onDeleteAll}
                    size="sm"
                    variant="outline"
                    className="text-xs text-red-600"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Tümünü Sil
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Individual Notification Items */}
          <div className="divide-y divide-gray-100">
            {batch.items.map((notification, index) => (
              <div
                key={notification.id}
                className={`transition-all ${index === 0 ? '' : ''}`}
              >
                <NotificationListItem
                  notification={notification}
                  onClick={() => onItemClick?.(notification)}
                  onMarkAsRead={() => onItemMarkAsRead?.(notification.id)}
                  onDelete={() => onItemDelete?.(notification.id)}
                  showActions={showActions}
                  layout="list"
                  className="rounded-none border-0 hover:bg-gray-50"
                />
              </div>
            ))}
          </div>

          {/* Collapse Button */}
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
            <Button
              onClick={() => setIsExpanded(false)}
              size="sm"
              variant="outline"
              className="w-full text-xs"
            >
              <ChevronUp className="mr-1 h-3 w-3" />
              Daralt
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== BATCH UTILITIES ====================

/**
 * Check if notifications should be batched together
 *
 * @param notifications List of notifications
 * @returns Map of batch type to notifications
 */
export const groupNotificationsByBatchType = (
  notifications: Notification[]
): Map<NotificationBatchType, Notification[]> => {
  const batches = new Map<NotificationBatchType, Notification[]>();

  notifications.forEach((notification) => {
    const batchType = mapNotificationTypeToBatchType(notification.type);
    if (batchType) {
      const batch = batches.get(batchType) || [];
      batch.push(notification);
      batches.set(batchType, batch);
    }
  });

  return batches;
};

/**
 * Map NotificationType to NotificationBatchType
 */
const mapNotificationTypeToBatchType = (
  type: Notification['type']
): NotificationBatchType | null => {
  switch (type) {
    case 'MESSAGE':
      return 'MESSAGE';
    case 'PROPOSAL':
      return 'PROPOSAL';
    case 'ORDER':
      return 'ORDER';
    case 'PAYMENT':
    case 'PAYMENT_DISPUTE' as NotificationType:
      return 'PAYMENT';
    case 'REVIEW':
      return 'REVIEW';
    case 'JOB':
    case 'FOLLOW':
    case 'PAYOUT_REQUESTED' as NotificationType:
    case 'PAYOUT_PROCESSING' as NotificationType:
    case 'PAYOUT_COMPLETED' as NotificationType:
    case 'PAYOUT_REJECTED' as NotificationType:
    case 'SYSTEM':
      return 'SYSTEM';
    default:
      return null;
  }
};

/**
 * Generate batch title based on type and count
 */
export const generateBatchTitle = (
  batchType: NotificationBatchType,
  count: number
): string => {
  switch (batchType) {
    case 'MESSAGE':
      return count === 1 ? 'Yeni mesaj' : `${count} yeni mesaj`;
    case 'PROPOSAL':
      return count === 1 ? 'Yeni teklif' : `${count} yeni teklif`;
    case 'ORDER':
      return count === 1
        ? 'Sipariş güncellendi'
        : `${count} sipariş güncellendi`;
    case 'PAYMENT':
      return count === 1 ? 'Yeni ödeme' : `${count} yeni ödeme`;
    case 'REVIEW':
      return count === 1 ? 'Yeni değerlendirme' : `${count} yeni değerlendirme`;
    default:
      return `${count} yeni bildirim`;
  }
};

/**
 * Generate batch message (summary)
 */
export const generateBatchMessage = (
  batchType: NotificationBatchType,
  items: Notification[]
): string => {
  switch (batchType) {
    case 'MESSAGE': {
      // Extract unique conversation IDs from metadata
      const conversationIds = new Set(
        items.map((item) => item.relatedEntityId).filter(Boolean)
      );
      const conversationCount = conversationIds.size;

      return conversationCount > 1
        ? `${conversationCount} farklı konuşmadan yeni mesajlar`
        : 'Yeni mesajlarınız var';
    }
    case 'PROPOSAL':
      return 'Tekliflerinizi kontrol edin';
    case 'ORDER':
      return 'Siparişlerinizde güncellemeler var';
    case 'PAYMENT':
      return 'Ödeme işlemleriniz tamamlandı';
    case 'REVIEW':
      return 'Yeni değerlendirmeler aldınız';
    default:
      return 'Yeni bildirimleriniz var';
  }
};

/**
 * Create a batch from notifications
 */
export const createBatchFromNotifications = (
  notifications: Notification[],
  batchType: NotificationBatchType
): NotificationBatchData => {
  const sortedItems = notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    id: `batch-${batchType}-${Date.now()}`,
    batchType,
    title: generateBatchTitle(batchType, notifications.length),
    message: generateBatchMessage(batchType, notifications),
    itemCount: notifications.length,
    items: sortedItems,
    createdAt: sortedItems[0].createdAt,
    isExpanded: false,
  };
};
