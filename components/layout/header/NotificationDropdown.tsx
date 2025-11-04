'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { useNotifications } from '@/hooks';
import type { Notification } from '@/types/core/notification';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } =
    useNotifications();

  // Dropdown dışına tıklayınca kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'job_application':
      case 'job_accepted':
      case 'job_completed':
        return '�';
      case 'payment_received':
        return '💰';
      case 'review_received':
        return '⭐';
      case 'message_received':
        return '💬';
      case 'system_update':
        return '⚙️';
      case 'promotion':
        return '🎁';
      case 'reminder':
        return '⏰';
      default:
        return '🔔';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Az önce';
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} dakika önce`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} gün önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        aria-label="Bildirimler"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-red-500 px-2 py-1 text-xs leading-none font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 flex max-h-[600px] w-96 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900">Bildirimler</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium"
              >
                <CheckCheck className="h-4 w-4" />
                Tümünü Okundu İşaretle
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
            ) : notifications && notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`cursor-pointer p-4 transition-colors hover:bg-gray-50 ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.createdAt)}
                          </span>
                          {notification.actionUrl && (
                            <Link
                              href={notification.actionUrl}
                              className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-xs font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Görüntüle
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p>Henüz bildiriminiz yok</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 p-3">
            <Link
              href="/notifications"
              className="text-primary-600 hover:text-primary-700 block w-full py-2 text-center text-sm font-medium"
              onClick={() => setIsOpen(false)}
            >
              Tüm Bildirimleri Gör
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
