'use client';

/**
 * Notifications List Component
 *
 * Displays paginated list of notifications with:
 * - Read/unread states
 * - Type-specific icons
 * - Priority indicators
 * - Mark as read/unread actions
 * - Delete functionality
 * - Click to navigate to related entity
 * - Infinite scroll support
 *
 * @sprint Sprint 4 - Notifications System
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  BellOff,
  MessageCircle,
  Briefcase,
  FileText,
  ShoppingCart,
  CreditCard,
  Star,
  UserPlus,
  Info,
  Check,
  Trash2,
  Circle,
} from 'lucide-react';
import {
  NotificationResponse,
  NotificationType,
  NotificationPriority,
  PaginatedNotifications,
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAsUnread,
  deleteNotification,
  formatNotificationTime,
  getNotificationColor,
  isNotificationExpired,
} from '@/lib/api/notifications';
import logger from '@/lib/infrastructure/monitoring/logger';

// ==================== TYPES ====================

interface NotificationsListProps {
  /** Show only unread notifications */
  unreadOnly?: boolean;
  /** Filter by notification type */
  filterType?: NotificationType;
  /** Enable infinite scroll */
  infiniteScroll?: boolean;
  /** Items per page */
  pageSize?: number;
  /** Callback when notification is clicked */
  onNotificationClick?: (notification: NotificationResponse) => void;
}

// ==================== HELPERS ====================

/**
 * Get icon component for notification type
 */
function getNotificationIconComponent(type: NotificationType) {
  switch (type) {
    case NotificationType.MESSAGE:
      return MessageCircle;
    case NotificationType.JOB:
      return Briefcase;
    case NotificationType.PROPOSAL:
      return FileText;
    case NotificationType.ORDER:
      return ShoppingCart;
    case NotificationType.PAYMENT:
      return CreditCard;
    case NotificationType.REVIEW:
      return Star;
    case NotificationType.FOLLOW:
      return UserPlus;
    case NotificationType.SYSTEM:
      return Info;
    default:
      return Bell;
  }
}

/**
 * Get background color for priority
 */
function getPriorityBgColor(priority: NotificationPriority): string {
  switch (priority) {
    case NotificationPriority.HIGH:
      return 'bg-red-50 border-red-200';
    case NotificationPriority.MEDIUM:
      return 'bg-yellow-50 border-yellow-200';
    case NotificationPriority.LOW:
      return 'bg-gray-50 border-gray-200';
    default:
      return 'bg-white border-gray-200';
  }
}

// ==================== COMPONENT ====================

export default function NotificationsList({
  unreadOnly = false,
  filterType,
  infiniteScroll = false,
  pageSize = 20,
  onNotificationClick,
}: NotificationsListProps) {
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // ==================== FETCH NOTIFICATIONS ====================

  const fetchNotifications = async (
    pageNumber: number,
    append: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);

      logger.debug('NotificationsList', `Fetching page ${pageNumber}`);

      const response: PaginatedNotifications = unreadOnly
        ? await getUnreadNotifications(pageNumber, pageSize)
        : await getNotifications(pageNumber, pageSize);

      if (append) {
        setNotifications((prev) => [...prev, ...response.content]);
      } else {
        setNotifications(response.content);
      }

      setHasMore(!response.last);
      setTotalElements(response.totalElements);
      setPage(pageNumber);
    } catch (err) {
      logger.error('NotificationsList: Failed to fetch notifications', undefined, {
        err,
      });
      setError('Bildirimler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNotifications(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadOnly, filterType]);

  // ==================== ACTIONS ====================

  const handleMarkAsRead = async (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await markAsRead(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );

      logger.info(
        'NotificationsList',
        `Marked notification ${notificationId} as read`
      );
    } catch (err) {
      logger.error('NotificationsList: Failed to mark as read', undefined, { err });
    }
  };

  const handleMarkAsUnread = async (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await markAsUnread(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: false, readAt: null } : n
        )
      );

      logger.info(
        'NotificationsList',
        `Marked notification ${notificationId} as unread`
      );
    } catch (err) {
      logger.error('NotificationsList: Failed to mark as unread', undefined, { err });
    }
  };

  const handleDelete = async (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deleteNotification(notificationId);

      // Remove from local state
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setTotalElements((prev) => prev - 1);

      logger.info(
        'NotificationsList',
        `Deleted notification ${notificationId}`
      );
    } catch (err) {
      logger.error('NotificationsList: Failed to delete notification', undefined, {
        err,
      });
    }
  };

  const handleNotificationClick = (notification: NotificationResponse) => {
    // Mark as read automatically
    if (!notification.isRead) {
      markAsRead(notification.id).catch((err) =>
        logger.error('NotificationsList: Auto mark as read failed', undefined, { err })
      );

      // Update local state optimistically
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );
    }

    // Call custom handler if provided
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1, true);
    }
  };

  // ==================== RENDER ====================

  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex animate-pulse gap-4 rounded-lg border bg-gray-50 p-4"
          >
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <BellOff className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="font-medium text-red-600">{error}</p>
        <button
          onClick={() => fetchNotifications(0)}
          className="bg-primary-600 hover:bg-primary-700 mt-4 rounded-lg px-4 py-2 text-white"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="py-12 text-center">
        <Bell className="mx-auto mb-4 h-16 w-16 text-gray-300" />
        <h3 className="mb-2 text-lg font-semibold text-gray-700">
          {unreadOnly ? 'Okunmamış bildirim yok' : 'Bildirim yok'}
        </h3>
        <p className="text-gray-500">
          {unreadOnly
            ? 'Tüm bildirimlerinizi okudunuz.'
            : 'Henüz bir bildiriminiz bulunmuyor.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const Icon = getNotificationIconComponent(notification.type);
        const isExpired = isNotificationExpired(notification);
        const priorityBg = getPriorityBgColor(notification.priority);
        const textColor = getNotificationColor(notification.priority);

        return (
          <div
            key={notification.id}
            className={`relative rounded-lg border p-4 transition-all hover:shadow-md ${notification.isRead ? 'bg-white' : priorityBg} ${isExpired ? 'opacity-60' : ''} cursor-pointer`}
            onClick={() => handleNotificationClick(notification)}
          >
            {/* Unread Indicator */}
            {!notification.isRead && (
              <div className="absolute top-4 left-1 h-2 w-2">
                <Circle className="h-2 w-2 fill-blue-600 text-blue-600" />
              </div>
            )}

            <div className="flex gap-4">
              {/* Icon */}
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${textColor} border-2 bg-white`}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="mb-1 font-semibold text-gray-900">
                      {notification.title}
                    </h4>
                    <p className="line-clamp-2 text-sm text-gray-600">
                      {notification.content}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-shrink-0 items-center gap-1">
                    {notification.isRead ? (
                      <button
                        onClick={(e) => handleMarkAsUnread(notification.id, e)}
                        className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                        title="Okunmadı olarak işaretle"
                      >
                        <BellOff className="h-4 w-4 text-gray-500" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                        title="Okundu olarak işaretle"
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDelete(notification.id, e)}
                      className="rounded-lg p-1.5 transition-colors hover:bg-red-50"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                  <span>{formatNotificationTime(notification.createdAt)}</span>

                  {notification.priority === NotificationPriority.HIGH && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700">
                      Yüksek Öncelik
                    </span>
                  )}

                  {isExpired && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                      Süresi Doldu
                    </span>
                  )}

                  {notification.actionLabel && notification.actionUrl && (
                    <Link
                      href={notification.actionUrl}
                      onClick={(e) => e.stopPropagation()}
                      className="text-primary-600 hover:text-primary-700 font-medium underline"
                    >
                      {notification.actionLabel}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Load More / Infinite Scroll */}
      {hasMore && (
        <div className="py-4 text-center">
          {infiniteScroll ? (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="rounded-lg bg-gray-100 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              {loading ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
            </button>
          ) : (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 rounded-lg px-6 py-2 text-white transition-colors disabled:opacity-50"
            >
              {loading
                ? 'Yükleniyor...'
                : `Daha Fazla Göster (${totalElements - notifications.length} kaldı)`}
            </button>
          )}
        </div>
      )}

      {/* Total count */}
      {!hasMore && notifications.length > 0 && (
        <div className="py-4 text-center text-sm text-gray-500">
          {notifications.length} bildirim gösteriliyor
        </div>
      )}
    </div>
  );
}
