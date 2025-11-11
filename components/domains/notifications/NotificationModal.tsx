'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import logger from '@/lib/infrastructure/monitoring/logger';
import { Notification } from '@/types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

interface NotificationItem extends Notification {
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export function NotificationModal({
  isOpen,
  onClose,
  userId,
}: NotificationModalProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadNotifications = useCallback(
    async (pageNum = 1) => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: '10',
          ...(filter !== 'all' && { type: filter }),
        });

        // Production note: Auth token retrieved from cookie (auth_token). Future integration with useAuth for SSR/CSR consistency.
        const authHeader = document.cookie
          .split('; ')
          .find((row) => row.startsWith('auth_token='))
          ?.split('=')[1];

        const response = await fetch(`/api/notifications?${params}`, {
          headers: {
            ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const data = await response.json();

        if (data.success) {
          const newNotifications = data.data.notifications;

          if (pageNum === 1) {
            setNotifications(newNotifications);
          } else {
            setNotifications((prev) => [...prev, ...newNotifications]);
          }

          setHasMore(data.data.pagination.hasNext);
          setPage(pageNum);
        }
      } catch (error) {
        logger.error(
          'Bildirimler yüklenemedi:',
          error
        );
      } finally {
        setIsLoading(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    if (isOpen && userId) {
      loadNotifications();
    }
  }, [isOpen, userId, filter, loadNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      // Production note: Auth token retrieved from cookie (auth_token).
      const authHeader = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1];

      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (error) {
      logger.error(
        'Bildirim okundu olarak işaretlenemedi:',
        error
      );
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      loadNotifications(page + 1);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_application':
        return '💼';
      case 'message_received':
        return '💬';
      case 'payment_received':
        return '💰';
      case 'order_update':
        return '📦';
      case 'system_announcement':
        return '📢';
      default:
        return '🔔';
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;

    return date.toLocaleDateString('tr-TR');
  };

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="flex max-h-[80vh] w-full max-w-md flex-col rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold text-gray-900">Bildirimler</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b">
          {[
            { key: 'all', label: 'Tümü' },
            { key: 'job_application', label: 'İş' },
            { key: 'message_received', label: 'Mesaj' },
            { key: 'payment_received', label: 'Ödeme' },
            { key: 'order_update', label: 'Sipariş' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setFilter(tab.key);
                setPage(1);
              }}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              } `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <svg
                className="mb-4 h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5-5-5h5v-6a4 4 0 00-8 0v6h5l-5 5-5-5h5v-6a8 8 0 0116 0v6z"
                />
              </svg>
              <p>Henüz bildirim yok</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`cursor-pointer p-4 transition-colors hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''} `}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="ml-2 h-2 w-2 rounded-full bg-blue-600"></div>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs text-gray-400">
                        {getRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && notifications.length > 0 && (
            <div className="border-t p-4">
              <Button
                onClick={loadMore}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? 'Yükleniyor...' : 'Daha Fazla Göster'}
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4">
          <Button onClick={onClose} variant="outline" className="w-full">
            Kapat
          </Button>
        </div>
      </div>
    </div>
  );
}
