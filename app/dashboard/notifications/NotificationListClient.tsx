/**
 * ================================================
 * NOTIFICATION LIST CLIENT COMPONENT
 * ================================================
 * Displays user notifications with filtering and actions
 *
 * Features:
 * - Real-time notification updates
 * - Filter by all/unread
 * - Mark all as read
 * - Notification preferences link
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 4: Settings System Refactor
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Filter, Settings, AlertCircle } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import Link from 'next/link';
import {
  getNotifications,
  getUnreadNotifications,
  markAllAsRead,
} from '@/lib/api/notification';
import { logger } from '@/lib/shared/utils/logger';
import type { Notification } from '@/types/core/notification';

export default function NotificationListClient() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response =
        filter === 'unread'
          ? await getUnreadNotifications()
          : await getNotifications();

      setNotifications(response.content || []);
      logger.info('Notifications fetched', {
        count: response.content?.length,
        filter,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bildirimler yüklenemedi';
      setError(errorMessage);
      logger.error(
        'Failed to fetch notifications',
        err instanceof Error ? err : new Error(String(err))
      );
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    try {
      setError(null);
      const count = await markAllAsRead();
      logger.info('All notifications marked as read', { count });
      fetchNotifications();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bildirimler güncellenemedi';
      setError(errorMessage);
      logger.error(
        'Failed to mark all as read',
        err instanceof Error ? err : new Error(String(err))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

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
            onClick={handleMarkAllAsRead}
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
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="bg-muted h-5 w-3/4 animate-pulse rounded" />
                      <div className="bg-muted h-4 w-full animate-pulse rounded" />
                      <div className="bg-muted h-3 w-24 animate-pulse rounded" />
                    </div>
                    <div className="bg-muted h-2 w-2 animate-pulse rounded-full" />
                  </div>
                </div>
              ))}
            </div>
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
