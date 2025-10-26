'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import useSWRInfinite from 'swr/infinite';
import { Bell, CheckCheck, Filter, Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks';
import { getNotifications } from '@/lib/api/notification';
import type { Notification, NotificationType } from '@/types/core/notification';

type FilterType = 'ALL' | NotificationType;

const ITEMS_PER_PAGE = 20;

export function NotificationListClient() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');
  const { unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // SWR Infinite ile sayfalama
  const getKey = (
    pageIndex: number,
    previousPageData: Notification[] | null
  ) => {
    if (previousPageData && previousPageData.length === 0) return null;
    return `/notifications?page=${pageIndex}&size=${ITEMS_PER_PAGE}&type=${selectedFilter}`;
  };

  const {
    data: pages,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
    mutate,
  } = useSWRInfinite(
    getKey,
    async (key: string) => {
      const url = new URL(key, window.location.origin);
      const page = parseInt(url.searchParams.get('page') || '0');
      const pageSize = parseInt(url.searchParams.get('size') || '20');
      const type = url.searchParams.get('type') || 'ALL';

      const response = await getNotifications({
        page,
        size: pageSize,
        type: type !== 'ALL' ? (type as NotificationType) : undefined,
      });

      return response.content || [];
    },
    {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
    }
  );

  const notifications = useMemo(() => pages?.flat() || [], [pages]);
  const isLoadingMore =
    isValidating && size > 0 && pages && typeof pages[size - 1] !== 'undefined';
  const isEmpty = pages?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (pages && pages[pages.length - 1]?.length < ITEMS_PER_PAGE);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
      mutate();
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    mutate();
  };

  const handleFilterChange = (filter: FilterType) => {
    setSelectedFilter(filter);
    setSize(1);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'ORDER':
        return '📦';
      case 'PAYMENT':
        return '💰';
      case 'REVIEW':
        return '⭐';
      case 'FOLLOW':
        return '👤';
      case 'MESSAGE':
        return '💬';
      case 'JOB':
        return '💼';
      case 'PROPOSAL':
        return '📝';
      case 'SYSTEM':
        return '⚙️';
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
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'ALL', label: 'Tümü' },
    { value: 'ORDER', label: 'Siparişler' },
    { value: 'PAYMENT', label: 'Ödemeler' },
    { value: 'REVIEW', label: 'Değerlendirmeler' },
    { value: 'FOLLOW', label: 'Takipler' },
    { value: 'MESSAGE', label: 'Mesajlar' },
    { value: 'JOB', label: 'İşler' },
    { value: 'PROPOSAL', label: 'Teklifler' },
    { value: 'SYSTEM', label: 'Sistem' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bildirimler</h1>
              <p className="mt-1 text-sm text-gray-600">
                Tüm bildirimlerinizi buradan yönetebilirsiniz
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
              >
                <CheckCheck className="h-5 w-5" />
                Tümünü Okundu İşaretle ({unreadCount})
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="h-5 w-5 flex-shrink-0 text-gray-500" />
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === option.value
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="px-4 py-16 text-center">
              <p className="mb-2 font-medium text-red-600">
                Bildirimler yüklenirken bir hata oluştu
              </p>
              <p className="text-sm text-gray-500">{error.message}</p>
            </div>
          ) : isEmpty ? (
            <div className="px-4 py-16 text-center">
              <Bell className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <p className="mb-2 font-medium text-gray-600">
                Henüz bildiriminiz yok
              </p>
              <p className="text-sm text-gray-500">
                {selectedFilter !== 'ALL'
                  ? 'Bu kategoride bildirim bulunmuyor'
                  : 'Yeni bildirimler geldiğinde burada görünecek'}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`cursor-pointer p-6 transition-colors hover:bg-gray-50 ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 text-3xl">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-start justify-between gap-4">
                          <h3 className="text-base font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="mb-3 text-sm text-gray-600">
                          {notification.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.createdAt)}
                          </span>
                          {notification.actionUrl && (
                            <Link
                              href={notification.actionUrl}
                              className="text-sm font-medium text-blue-600 hover:text-blue-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Görüntüle →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {!isReachingEnd && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <button
                    onClick={() => setSize(size + 1)}
                    disabled={isLoadingMore}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Yükleniyor...
                      </>
                    ) : (
                      'Daha Fazla Yükle'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stats */}
        {!isEmpty && !isLoading && (
          <div className="mt-4 text-center text-sm text-gray-500">
            {notifications.length} bildirim gösteriliyor
            {isReachingEnd && ' (Tümü yüklendi)'}
          </div>
        )}
      </div>
    </div>
  );
}
