/**
 * ================================================
 * NOTIFICATIONS LIST ENHANCED
 * ================================================
 * Sprint DAY 3 - Task 9: Notification System Enhancement
 *
 * Enhanced with:
 * - Bulk actions (select all, mark as read/unread, delete)
 * - Date range filtering
 * - Read/unread filtering
 * - WebSocket connection status
 * - Export notifications
 * - Improved UX with selection mode
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Enhanced
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
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
  CheckCheck,
  Trash2,
  Circle,
  Download,
  Filter,
  X,
  Wifi,
  WifiOff,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  type Notification,
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAsUnread,
  markMultipleAsRead,
  deleteNotification,
  deleteMultipleNotifications,
} from '@/lib/api/notification';
import type {
  NotificationType,
  NotificationPriority,
} from '@/types/core/notification';
import { formatRelativeTime, formatDate } from '@/lib/utils';
import { logger } from '@/lib/shared/utils/logger';
import { getWebSocketClient } from '@/lib/infrastructure/websocket/client';

// ==================== TYPES ====================

interface NotificationsListEnhancedProps {
  unreadOnly?: boolean;
  filterType?: NotificationType;
  infiniteScroll?: boolean;
  pageSize?: number;
  onNotificationClick?: (notification: Notification) => void;
}

interface DateFilter {
  startDate?: string;
  endDate?: string;
}

// ==================== HELPERS ====================

function getNotificationIconComponent(type: NotificationType) {
  switch (type) {
    case 'MESSAGE':
      return MessageCircle;
    case 'JOB':
      return Briefcase;
    case 'PROPOSAL':
      return FileText;
    case 'ORDER':
      return ShoppingCart;
    case 'PAYMENT':
      return CreditCard;
    case 'REVIEW':
      return Star;
    case 'FOLLOW':
      return UserPlus;
    case 'SYSTEM':
      return Info;
    default:
      return Bell;
  }
}

function getPriorityBgColor(priority: NotificationPriority): string {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-50 border-red-200';
    case 'MEDIUM':
      return 'bg-yellow-50 border-yellow-200';
    case 'LOW':
      return 'bg-gray-50 border-gray-200';
    default:
      return 'bg-white border-gray-200';
  }
}

function getPriorityTextColor(priority: NotificationPriority): string {
  switch (priority) {
    case 'HIGH':
      return 'text-red-600';
    case 'MEDIUM':
      return 'text-yellow-600';
    case 'LOW':
      return 'text-gray-600';
    default:
      return 'text-blue-600';
  }
}

// ==================== COMPONENT ====================

export default function NotificationsListEnhanced({
  unreadOnly = false,
  filterType,
  infiniteScroll = false,
  pageSize = 20,
  onNotificationClick,
}: NotificationsListEnhancedProps) {
  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>({});
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>(
    'all'
  );

  // WebSocket connection state
  const [wsConnected, setWsConnected] = useState(false);

  // ==================== WEBSOCKET ====================

  useEffect(() => {
    const wsClient = getWebSocketClient();

    // Check initial connection status
    setWsConnected(wsClient.isConnected());

    // Listen for connection changes
    const handleConnect = () => {
      setWsConnected(true);
      logger.info('NotificationsListEnhanced', 'WebSocket connected');
    };

    const handleDisconnect = () => {
      setWsConnected(false);
      logger.warn('NotificationsListEnhanced', 'WebSocket disconnected');
    };

    // Subscribe to connection events
    const unsubscribe = wsClient.subscribe(
      '/user/queue/notifications',
      (message) => {
        logger.debug(
          'NotificationsListEnhanced',
          'Received notification via WebSocket',
          { message }
        );
        // Refresh notifications when new one arrives
        fetchNotifications(0, false);
      }
    );

    // Cleanup
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // ==================== FETCH NOTIFICATIONS ====================

  const fetchNotifications = async (
    pageNumber: number,
    append: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);

      logger.debug('NotificationsListEnhanced', `Fetching page ${pageNumber}`);

      // Build query params
      const params: any = {
        page: pageNumber,
        size: pageSize,
      };

      if (dateFilter.startDate) params.startDate = dateFilter.startDate;
      if (dateFilter.endDate) params.endDate = dateFilter.endDate;
      if (filterType) params.type = filterType;

      const response = unreadOnly
        ? await getUnreadNotifications(params)
        : await getNotifications(params);

      // Apply read filter locally
      let filteredContent = response.content;
      if (readFilter === 'read') {
        filteredContent = filteredContent.filter((n) => n.isRead);
      } else if (readFilter === 'unread') {
        filteredContent = filteredContent.filter((n) => !n.isRead);
      }

      if (append) {
        setNotifications((prev) => [...prev, ...filteredContent]);
      } else {
        setNotifications(filteredContent);
      }

      setHasMore(!response.last);
      setTotalElements(response.totalElements);
      setPage(pageNumber);
    } catch (err) {
      logger.error(
        'NotificationsListEnhanced',
        'Failed to fetch notifications',
        { err }
      );
      setError('Bildirimler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(0);
  }, [unreadOnly, filterType, dateFilter, readFilter]);

  // ==================== SELECTION HANDLERS ====================

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    setSelectedIds(new Set(notifications.map((n) => n.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      deselectAll();
    }
  };

  // ==================== BULK ACTIONS ====================

  const handleBulkMarkAsRead = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    try {
      await markMultipleAsRead(ids);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          selectedIds.has(n.id)
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );

      deselectAll();
      logger.info(
        'NotificationsListEnhanced',
        `Marked ${ids.length} notifications as read`
      );
    } catch (err) {
      logger.error('NotificationsListEnhanced', 'Bulk mark as read failed', {
        err,
      });
      alert('Toplu işlem başarısız oldu.');
    }
  };

  const handleBulkMarkAsUnread = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    try {
      // Note: Backend needs bulk markAsUnread endpoint
      await Promise.all(ids.map((id) => markAsUnread(id)));

      setNotifications((prev) =>
        prev.map((n) =>
          selectedIds.has(n.id) ? { ...n, isRead: false, readAt: null } : n
        )
      );

      deselectAll();
      logger.info(
        'NotificationsListEnhanced',
        `Marked ${ids.length} notifications as unread`
      );
    } catch (err) {
      logger.error('NotificationsListEnhanced', 'Bulk mark as unread failed', {
        err,
      });
      alert('Toplu işlem başarısız oldu.');
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    if (
      !confirm(`${ids.length} bildirimi silmek istediğinizden emin misiniz?`)
    ) {
      return;
    }

    try {
      await deleteMultipleNotifications(ids);

      setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
      setTotalElements((prev) => prev - ids.length);
      deselectAll();

      logger.info(
        'NotificationsListEnhanced',
        `Deleted ${ids.length} notifications`
      );
    } catch (err) {
      logger.error('NotificationsListEnhanced', 'Bulk delete failed', { err });
      alert('Toplu silme işlemi başarısız oldu.');
    }
  };

  // ==================== EXPORT ====================

  const handleExport = () => {
    const csv = [
      ['Tarih', 'Başlık', 'İçerik', 'Tür', 'Durum', 'Öncelik'].join(','),
      ...notifications.map((n) =>
        [
          formatDate(n.createdAt),
          `"${n.title}"`,
          `"${n.message}"`,
          n.type,
          n.isRead ? 'Okundu' : 'Okunmadı',
          n.priority || 'NORMAL',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bildirimler-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    logger.info(
      'NotificationsListEnhanced',
      `Exported ${notifications.length} notifications`
    );
  };

  // ==================== SINGLE ACTIONS ====================

  const handleMarkAsRead = async (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );
    } catch (err) {
      logger.error('NotificationsListEnhanced', 'Failed to mark as read', {
        err,
      });
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
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: false, readAt: null } : n
        )
      );
    } catch (err) {
      logger.error('NotificationsListEnhanced', 'Failed to mark as unread', {
        err,
      });
    }
  };

  const handleDelete = async (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) return;

    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setTotalElements((prev) => prev - 1);
    } catch (err) {
      logger.error(
        'NotificationsListEnhanced',
        'Failed to delete notification',
        { err }
      );
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (selectionMode) {
      toggleSelection(notification.id);
      return;
    }

    if (!notification.isRead) {
      markAsRead(notification.id).catch((err) =>
        logger.error('NotificationsListEnhanced', 'Auto mark as read failed', {
          err,
        })
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );
    }

    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  // ==================== COMPUTED VALUES ====================

  const selectedCount = selectedIds.size;
  const allSelected =
    selectedCount === notifications.length && notifications.length > 0;

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
        <Button onClick={() => fetchNotifications(0)} className="mt-4">
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-gray-50 p-4">
        <div className="flex items-center gap-3">
          {/* WebSocket Status */}
          <div className="flex items-center gap-2 text-sm">
            {wsConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-green-700">Canlı</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-600" />
                <span className="text-red-700">Çevrimdışı</span>
              </>
            )}
          </div>

          <div className="h-4 w-px bg-gray-300" />

          {/* Selection Mode Toggle */}
          <Button
            variant={selectionMode ? 'primary' : 'outline'}
            size="sm"
            onClick={toggleSelectionMode}
          >
            {selectionMode ? 'Seçimi İptal' : 'Çoklu Seç'}
          </Button>

          {selectionMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={allSelected ? deselectAll : selectAll}
              >
                {allSelected ? 'Tümünü Kaldır' : 'Tümünü Seç'}
              </Button>

              {selectedCount > 0 && (
                <Badge variant="primary">{selectedCount} seçili</Badge>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk Actions */}
          {selectionMode && selectedCount > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkMarkAsRead}
              >
                <CheckCheck className="mr-1 h-4 w-4" />
                Okundu İşaretle
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkMarkAsUnread}
              >
                <BellOff className="mr-1 h-4 w-4" />
                Okunmadı İşaretle
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Sil
              </Button>
            </>
          )}

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-1 h-4 w-4" />
            Filtrele
          </Button>

          {/* Export */}
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-1 h-4 w-4" />
              Dışa Aktar
            </Button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Filtreler</h3>
            <button onClick={() => setShowFilters(false)}>
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Read Status Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Durum
              </label>
              <select
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="all">Tümü</option>
                <option value="unread">Okunmamış</option>
                <option value="read">Okunmuş</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <Calendar className="mr-1 inline h-4 w-4" />
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={dateFilter.startDate || ''}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, startDate: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <Calendar className="mr-1 inline h-4 w-4" />
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={dateFilter.endDate || ''}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, endDate: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDateFilter({});
                setReadFilter('all');
              }}
            >
              Temizle
            </Button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      {notifications.length === 0 ? (
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
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = getNotificationIconComponent(notification.type);
            const priorityBg = getPriorityBgColor(notification.priority);
            const textColor = getPriorityTextColor(notification.priority);
            const isSelected = selectedIds.has(notification.id);

            return (
              <div
                key={notification.id}
                className={`relative rounded-lg border p-4 transition-all hover:shadow-md ${notification.isRead ? 'bg-white' : priorityBg} ${isSelected ? 'ring-2 ring-blue-500' : ''} cursor-pointer`}
                onClick={() => handleNotificationClick(notification)}
              >
                {/* Selection Checkbox */}
                {selectionMode && (
                  <div className="absolute top-4 left-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(notification.id)}
                      className="h-5 w-5 rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}

                {/* Unread Indicator */}
                {!notification.isRead && !selectionMode && (
                  <div className="absolute top-4 left-1 h-2 w-2">
                    <Circle className="h-2 w-2 fill-blue-600 text-blue-600" />
                  </div>
                )}

                <div className={`flex gap-4 ${selectionMode ? 'ml-8' : ''}`}>
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
                          {notification.message}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      {!selectionMode && (
                        <div className="flex flex-shrink-0 items-center gap-1">
                          {notification.isRead ? (
                            <button
                              onClick={(e) =>
                                handleMarkAsUnread(notification.id, e)
                              }
                              className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                              title="Okunmadı olarak işaretle"
                            >
                              <BellOff className="h-4 w-4 text-gray-500" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) =>
                                handleMarkAsRead(notification.id, e)
                              }
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
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatRelativeTime(notification.createdAt)}</span>

                      {notification.priority === NotificationPriority.HIGH && (
                        <Badge variant="destructive" size="sm">
                          Yüksek Öncelik
                        </Badge>
                      )}

                      {notification.actionUrl && (
                        <Link
                          href={notification.actionUrl}
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary-600 hover:text-primary-700 font-medium underline"
                        >
                          Görüntüle
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="py-4 text-center">
          <Button
            onClick={() => fetchNotifications(page + 1, true)}
            disabled={loading}
            variant="outline"
          >
            {loading
              ? 'Yükleniyor...'
              : `Daha Fazla Göster (${totalElements - notifications.length} kaldı)`}
          </Button>
        </div>
      )}

      {/* Total Count */}
      {!hasMore && notifications.length > 0 && (
        <div className="py-4 text-center text-sm text-gray-500">
          {notifications.length} bildirim gösteriliyor
        </div>
      )}
    </div>
  );
}
