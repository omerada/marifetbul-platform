/**
 * ================================================
 * REVIEW NOTIFICATION ITEM
 * ================================================
 * Notification item component for review-related notifications
 * Handles review reminders, seller responses, and vote notifications
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint
 */

'use client';

import { Star, MessageSquare, ThumbsUp, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Badge } from '@/components/ui/Badge';

export type ReviewNotificationType =
  | 'REVIEW_REMINDER'
  | 'SELLER_RESPONSE'
  | 'HELPFUL_VOTE'
  | 'REVIEW_FLAGGED'
  | 'REVIEW_APPROVED'
  | 'REVIEW_REJECTED';

export interface ReviewNotificationData {
  id: string;
  type: ReviewNotificationType;
  title: string;
  message: string;
  reviewId?: string;
  orderId?: string;
  packageTitle?: string;
  sellerName?: string;
  createdAt: Date;
  read: boolean;
  actionUrl?: string;
}

interface ReviewNotificationItemProps {
  notification: ReviewNotificationData;
  onClick?: () => void;
  onMarkAsRead?: () => void;
}

export function ReviewNotificationItem({
  notification,
  onClick,
  onMarkAsRead,
}: ReviewNotificationItemProps) {
  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'REVIEW_REMINDER':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'SELLER_RESPONSE':
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'HELPFUL_VOTE':
        return <ThumbsUp className="w-5 h-5 text-purple-600" />;
      case 'REVIEW_FLAGGED':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'REVIEW_APPROVED':
        return <Star className="w-5 h-5 text-green-600" />;
      case 'REVIEW_REJECTED':
        return <Star className="w-5 h-5 text-red-600" />;
      default:
        return <Star className="w-5 h-5 text-gray-600" />;
    }
  };

  // Get background color based on notification type
  const getBgColor = () => {
    if (notification.read) return 'bg-white';
    switch (notification.type) {
      case 'REVIEW_REMINDER':
        return 'bg-blue-50';
      case 'SELLER_RESPONSE':
        return 'bg-green-50';
      case 'HELPFUL_VOTE':
        return 'bg-purple-50';
      case 'REVIEW_FLAGGED':
        return 'bg-red-50';
      case 'REVIEW_APPROVED':
        return 'bg-green-50';
      case 'REVIEW_REJECTED':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  // Get type label
  const getTypeLabel = () => {
    switch (notification.type) {
      case 'REVIEW_REMINDER':
        return 'Değerlendirme Hatırlatması';
      case 'SELLER_RESPONSE':
        return 'Satıcı Yanıtı';
      case 'HELPFUL_VOTE':
        return 'Yardımcı Oy';
      case 'REVIEW_FLAGGED':
        return 'Şikayet';
      case 'REVIEW_APPROVED':
        return 'Onaylandı';
      case 'REVIEW_REJECTED':
        return 'Reddedildi';
      default:
        return 'Bildirim';
    }
  };

  // Format time ago
  const timeAgo = formatDistanceToNow(notification.createdAt, {
    addSuffix: true,
    locale: tr,
  });

  // Handle click
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead?.();
    }
    onClick?.();
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${getBgColor()}`}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-1">{getIcon()}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {notification.title}
          </h4>
          {!notification.read && (
            <Badge variant="default" className="flex-shrink-0 h-5 px-2 text-xs">
              Yeni
            </Badge>
          )}
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {notification.message}
        </p>

        {notification.packageTitle && (
          <p className="text-xs text-gray-500 truncate mb-1">
            Paket: <span className="font-medium">{notification.packageTitle}</span>
          </p>
        )}

        {notification.sellerName && (
          <p className="text-xs text-gray-500 truncate mb-1">
            Satıcı: <span className="font-medium">{notification.sellerName}</span>
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">{timeAgo}</span>
          <span className="text-xs text-gray-400">{getTypeLabel()}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Review Notification Badge - Shows count of unread review notifications
 */
interface ReviewNotificationBadgeProps {
  count: number;
  onClick?: () => void;
}

export function ReviewNotificationBadge({
  count,
  onClick,
}: ReviewNotificationBadgeProps) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      aria-label={`${count} yeni değerlendirme bildirimi`}
    >
      <Star className="w-5 h-5 text-gray-600" />
      {count > 0 && (
        <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}

/**
 * Review Notification List - Container for multiple review notifications
 */
interface ReviewNotificationListProps {
  notifications: ReviewNotificationData[];
  onNotificationClick?: (notification: ReviewNotificationData) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
}

export function ReviewNotificationList({
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
}: ReviewNotificationListProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-600">Henüz bildiriminiz yok</p>
      </div>
    );
  }

  return (
    <div className="max-h-[600px] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Değerlendirme Bildirimleri</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">
              {unreadCount} okunmamış bildirim
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      {/* Notification Items */}
      <div>
        {notifications.map((notification) => (
          <ReviewNotificationItem
            key={notification.id}
            notification={notification}
            onClick={() => onNotificationClick?.(notification)}
            onMarkAsRead={() => onMarkAsRead?.(notification.id)}
          />
        ))}
      </div>
    </div>
  );
}
