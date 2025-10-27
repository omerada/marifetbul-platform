/**
 * Notification Bell Component
 *
 * Header notification bell with:
 * - Unread count badge
 * - Dropdown with recent notifications
 * - Real-time updates (polling every 30s)
 * - Mark all as read
 * - Navigate to full notifications page
 *
 * @sprint Sprint 4 - Notifications System
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, BellRing, Check, Eye } from 'lucide-react';
import {
  NotificationResponse,
  getRecentNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  formatNotificationTime,
  isNotificationExpired,
} from '@/lib/api/notifications';
import { logger } from '@/lib/shared/utils/logger';

// ==================== TYPES ====================

interface NotificationBellProps {
  /** Polling interval in milliseconds (default: 30000 = 30s) */
  pollingInterval?: number;
  /** Maximum notifications to show in dropdown */
  maxNotifications?: number;
  /** Enable auto-refresh on window focus */
  autoRefresh?: boolean;
}

// ==================== COMPONENT ====================

export default function NotificationBell({
  pollingInterval = 30000,
  maxNotifications = 5,
  autoRefresh = true,
}: NotificationBellProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<
    NotificationResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== FETCH DATA ====================

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      logger.error('NotificationBell', 'Failed to fetch unread count', { err });
    }
  };

  const fetchRecentNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const notifications = await getRecentNotifications(maxNotifications);
      setRecentNotifications(notifications);

      // Also update unread count
      const count = notifications.filter((n) => !n.isRead).length;
      if (count > 0) {
        setUnreadCount(count);
      }
    } catch (err) {
      logger.error('NotificationBell', 'Failed to fetch recent notifications', {
        err,
      });
    } finally {
      setLoading(false);
    }
  }, [maxNotifications]);

  // ==================== EFFECTS ====================

  // Initial fetch
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Polling for unread count
  useEffect(() => {
    if (pollingInterval > 0) {
      pollingRef.current = setInterval(() => {
        fetchUnreadCount();
      }, pollingInterval);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      };
    }
  }, [pollingInterval]);

  // Auto-refresh on window focus
  useEffect(() => {
    if (!autoRefresh) return;

    const handleFocus = () => {
      fetchUnreadCount();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [autoRefresh]);

  // Fetch recent notifications when dropdown opens
  useEffect(() => {
    if (isOpen && recentNotifications.length === 0) {
      fetchRecentNotifications();
    }
  }, [isOpen, fetchRecentNotifications, recentNotifications.length]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // ==================== ACTIONS ====================

  const handleBellClick = () => {
    setIsOpen(!isOpen);

    // Fetch fresh data when opening
    if (!isOpen) {
      fetchRecentNotifications();
    }
  };

  const handleMarkAsRead = async (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await markAsRead(notificationId);

      // Update local state
      setRecentNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );

      // Decrease unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));

      logger.info(
        'NotificationBell',
        `Marked notification ${notificationId} as read`
      );
    } catch (err) {
      logger.error('NotificationBell', 'Failed to mark as read', { err });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const count = await markAllAsRead();

      // Update local state
      setRecentNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      );
      setUnreadCount(0);

      logger.info('NotificationBell', `Marked ${count} notifications as read`);
    } catch (err) {
      logger.error('NotificationBell', 'Failed to mark all as read', { err });
    }
  };

  const handleNotificationClick = (notification: NotificationResponse) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead(notification.id).catch((err) =>
        logger.error('NotificationBell', 'Auto mark as read failed', { err })
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    // Navigate to action URL or notification details
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }

    // Close dropdown
    setIsOpen(false);
  };

  const handleViewAll = () => {
    router.push('/notifications');
    setIsOpen(false);
  };

  // ==================== RENDER ====================

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        aria-label="Bildirimler"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-6 w-6" />
        ) : (
          <Bell className="h-6 w-6" />
        )}

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-96 rounded-lg border border-gray-200 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h3 className="font-semibold text-gray-900">Bildirimler</h3>
              {unreadCount > 0 && (
                <p className="mt-0.5 text-xs text-gray-500">
                  {unreadCount} okunmamış bildirim
                </p>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium"
                title="Tümünü okundu olarak işaretle"
              >
                <Check className="h-4 w-4" />
                Tümünü Oku
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading && recentNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="border-primary-600 mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                <p className="mt-4 text-sm text-gray-500">Yükleniyor...</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p className="text-sm text-gray-500">Bildirim yok</p>
              </div>
            ) : (
              <div className="divide-y">
                {recentNotifications.map((notification) => {
                  const isExpired = isNotificationExpired(notification);

                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`relative cursor-pointer p-4 transition-colors hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''} ${isExpired ? 'opacity-60' : ''} `}
                    >
                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="absolute top-4 left-2 h-2 w-2 rounded-full bg-blue-600" />
                      )}

                      <div className="ml-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="line-clamp-1 text-sm font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                              {notification.content}
                            </p>
                          </div>

                          {/* Mark as Read Button */}
                          {!notification.isRead && (
                            <button
                              onClick={(e) =>
                                handleMarkAsRead(notification.id, e)
                              }
                              className="flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-white"
                              title="Okundu olarak işaretle"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </button>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatNotificationTime(notification.createdAt)}
                          </span>

                          {isExpired && (
                            <span className="text-xs text-gray-500">
                              (Süresi Doldu)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-3">
            <button
              onClick={handleViewAll}
              className="text-primary-600 hover:text-primary-700 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors hover:bg-white"
            >
              <Eye className="h-4 w-4" />
              Tüm Bildirimleri Gör
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
