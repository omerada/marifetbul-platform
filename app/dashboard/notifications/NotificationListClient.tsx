'use client';

/**
 * NOTIFICATION LIST CLIENT COMPONENT
 * Sprint 1 - Route Cleanup
 *
 * Displays user notifications with filtering and actions
 */

import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Filter, Settings } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import Link from 'next/link';

export default function NotificationListClient() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filter === 'unread') {
        params.append('isRead', 'false');
      }

      const response = await fetch(`/api/v1/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/v1/notifications/mark-all-read', {
        method: 'POST',
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-orange-600" />
          <h1 className="text-2xl font-bold text-gray-900">Bildirimler</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Tümünü Okundu İşaretle
          </Button>

          <Link href="/dashboard/settings/notifications">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Settings className="h-5 w-5" />
              Ayarlar
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Tümü
        </Button>
        <Button
          variant={filter === 'unread' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          <Filter className="mr-1 h-4 w-4" />
          Okunmamış
        </Button>
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Yükleniyor...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-lg bg-gray-50 py-12 text-center">
            <Bell className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-gray-600">
              {filter === 'unread'
                ? 'Okunmamış bildirim yok'
                : 'Henüz bildirim yok'}
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg border p-4 transition-colors hover:bg-gray-50 ${
                !notification.isRead ? 'border-blue-200 bg-blue-50' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {notification.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {notification.message}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(notification.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>

                {!notification.isRead && (
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
        <p className="text-sm text-orange-800">
          💡 <strong>İpucu:</strong> Bildirim tercihlerinizi{' '}
          <Link
            href="/dashboard/settings/notifications"
            className="font-semibold underline hover:text-orange-900"
          >
            ayarlar
          </Link>{' '}
          sayfasından özelleştirebilirsiniz.
        </p>
      </div>
    </div>
  );
}
