'use client';

import { useState } from 'react';
import { CheckCheck, Filter, Settings } from 'lucide-react';
import { NotificationsList } from '@/components/notifications';
import { NotificationPreferences } from '@/components/notifications';
import {
  NotificationType,
  markAllAsRead,
  getUnreadCount,
} from '@/lib/api/notifications';
import { logger } from '@/lib/shared/utils/logger';

type FilterType = 'ALL' | 'UNREAD' | NotificationType;
type ViewMode = 'list' | 'preferences';

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'UNREAD', label: 'Okunmamış' },
  { value: NotificationType.ORDER, label: 'Siparişler' },
  { value: NotificationType.PAYMENT, label: 'Ödemeler' },
  { value: NotificationType.REVIEW, label: 'Değerlendirmeler' },
  { value: NotificationType.FOLLOW, label: 'Takipler' },
  { value: NotificationType.MESSAGE, label: 'Mesajlar' },
  { value: NotificationType.JOB, label: 'İşler' },
  { value: NotificationType.PROPOSAL, label: 'Teklifler' },
  { value: NotificationType.SYSTEM, label: 'Sistem' },
];

export function NotificationListClient() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);

  // Fetch unread count on mount
  useState(() => {
    getUnreadCount()
      .then(setUnreadCount)
      .catch((err) =>
        logger.error('NotificationListClient', 'Failed to fetch unread count', {
          err,
        })
      );
  });

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllAsRead(true);
      const count = await markAllAsRead();
      setUnreadCount(0);

      logger.info(
        'NotificationListClient',
        `Marked ${count} notifications as read`
      );

      // Trigger re-fetch of notifications list
      window.location.reload();
    } catch (err) {
      logger.error('NotificationListClient', 'Failed to mark all as read', {
        err,
      });
      alert('Tüm bildirimler okundu olarak işaretlenirken bir hata oluştu.');
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bildirimler</h1>
              <p className="mt-1 text-sm text-gray-600">
                {viewMode === 'list'
                  ? 'Tüm bildirimlerinizi buradan yönetebilirsiniz'
                  : 'Bildirim tercihlerinizi özelleştirin'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {viewMode === 'list' && unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markingAllAsRead}
                  className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors disabled:opacity-50"
                >
                  <CheckCheck className="h-5 w-5" />
                  Tümünü Okundu İşaretle ({unreadCount})
                </button>
              )}

              <button
                onClick={() =>
                  setViewMode(viewMode === 'list' ? 'preferences' : 'list')
                }
                className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
                  viewMode === 'preferences'
                    ? 'bg-primary-600 text-white'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                } `}
              >
                <Settings className="h-5 w-5" />
                {viewMode === 'preferences' ? 'Bildirimlere Dön' : 'Tercihler'}
              </button>
            </div>
          </div>

          {/* Filters (only in list mode) */}
          {viewMode === 'list' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Filter className="h-5 w-5 flex-shrink-0 text-gray-500" />
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedFilter(option.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedFilter === option.value
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                  } `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {viewMode === 'list' ? (
            <div className="p-6">
              <NotificationsList
                unreadOnly={selectedFilter === 'UNREAD'}
                filterType={
                  selectedFilter !== 'ALL' && selectedFilter !== 'UNREAD'
                    ? (selectedFilter as NotificationType)
                    : undefined
                }
                infiniteScroll={true}
                pageSize={20}
              />
            </div>
          ) : (
            <div className="p-6">
              <NotificationPreferences />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
