/**
 * Unified Notification Hook - Optimized for Performance
 * Single source of truth for all notification operations
 */
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotificationStore } from '@/lib/core/store/notification';
import type {
  EnhancedNotification,
  NotificationPreferences,
  NotificationFilters,
} from '@/types';

export type NotificationType =
  | 'job_application'
  | 'job_accepted'
  | 'job_completed'
  | 'payment_received'
  | 'message_received'
  | 'review_received'
  | 'system_update'
  | 'promotion'
  | 'reminder';

export interface UseNotificationOptions {
  autoFetch?: boolean;
  realtime?: boolean;
  pageSize?: number;
  filters?: NotificationFilters;
}

export interface UseNotificationReturn {
  // State
  notifications: EnhancedNotification[];
  unreadCount: number;
  totalCount: number;
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  error: string | null;

  // Core operations
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;

  // Preferences
  fetchPreferences: () => Promise<void>;
  updatePreferences: (
    preferences: Partial<NotificationPreferences>
  ) => Promise<void>;

  // Real-time
  enableRealtime: () => void;
  disableRealtime: () => void;

  // Utilities
  clearError: () => void;
  refresh: () => Promise<void>;
  reset: () => void;

  // Filters
  applyFilters: (filters: NotificationFilters) => void;
  resetFilters: () => void;
}

export function useNotification(
  options: UseNotificationOptions = {}
): UseNotificationReturn {
  const {
    autoFetch = true,
    realtime = false,
    filters: initialFilters = {},
  } = options;

  const store = useNotificationStore();
  const [localLoading, setLocalLoading] = useState(false);
  const [appliedFilters, setAppliedFilters] =
    useState<NotificationFilters>(initialFilters);

  // Memoized computed values
  const unreadCount = useMemo(() => {
    return store.notifications.filter((n) => !n.isRead).length;
  }, [store.notifications]);

  const filteredNotifications = useMemo(() => {
    let filtered = store.notifications;

    if (appliedFilters.type?.length) {
      filtered = filtered.filter((n) =>
        appliedFilters.type!.includes(n.type as NotificationType)
      );
    }

    if (appliedFilters.isRead !== undefined) {
      filtered = filtered.filter((n) => n.isRead === appliedFilters.isRead);
    }

    if (appliedFilters.dateRange) {
      const fromDate = new Date(appliedFilters.dateRange.start);
      const toDate = new Date(appliedFilters.dateRange.end);
      filtered = filtered.filter((n) => {
        const notificationDate = new Date(n.createdAt);
        return notificationDate >= fromDate && notificationDate <= toDate;
      });
    }

    return filtered;
  }, [store.notifications, appliedFilters]);

  // Optimized fetch with error handling
  const fetchNotifications = useCallback(
    async (newFilters?: NotificationFilters) => {
      if (newFilters) {
        setAppliedFilters(newFilters);
      }

      setLocalLoading(true);
      try {
        await store.fetchNotifications(newFilters || appliedFilters);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLocalLoading(false);
      }
    },
    [store, appliedFilters]
  );

  // Memoized actions
  const markAsRead = useCallback(
    async (notificationIds: string[]) => {
      try {
        await store.markAsRead(notificationIds);
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    },
    [store]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await store.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [store]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await store.deleteNotifications([notificationId]);
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    },
    [store]
  );

  const deleteAllRead = useCallback(async () => {
    try {
      const readNotificationIds = store.notifications
        .filter((n) => n.isRead)
        .map((n) => n.id);

      if (readNotificationIds.length > 0) {
        await store.deleteNotifications(readNotificationIds);
      }
    } catch (error) {
      console.error('Failed to delete read notifications:', error);
    }
  }, [store]);

  const fetchPreferences = useCallback(async () => {
    try {
      await store.fetchPreferences();
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    }
  }, [store]);

  const updatePreferences = useCallback(
    async (preferences: Partial<NotificationPreferences>) => {
      try {
        await store.updatePreferences(preferences);
      } catch (error) {
        console.error('Failed to update preferences:', error);
      }
    },
    [store]
  );

  const enableRealtime = useCallback(() => {
    store.startRealtimeConnection();
  }, [store]);

  const disableRealtime = useCallback(() => {
    store.stopRealtimeConnection();
  }, [store]);

  const refresh = useCallback(async () => {
    await fetchNotifications(appliedFilters);
  }, [fetchNotifications, appliedFilters]);

  const reset = useCallback(() => {
    store.reset();
    setAppliedFilters(initialFilters);
  }, [store, initialFilters]);

  const applyFilters = useCallback((filters: NotificationFilters) => {
    setAppliedFilters(filters);
  }, []);

  const resetFilters = useCallback(() => {
    setAppliedFilters(initialFilters);
  }, [initialFilters]);

  const clearError = useCallback(() => {
    store.clearError();
  }, [store]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]); // fetchNotifications intentionally omitted to prevent infinite loop

  // Real-time connection management
  useEffect(() => {
    if (realtime) {
      enableRealtime();
      return disableRealtime;
    }
  }, [realtime, enableRealtime, disableRealtime]);

  // Memoized return value
  return useMemo(
    () => ({
      // State
      notifications: filteredNotifications,
      unreadCount,
      totalCount: store.notifications.length,
      preferences: store.preferences,
      isLoading: store.isLoading || localLoading,
      error: store.error?.message || store.lastError,

      // Core operations
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      deleteAllRead,

      // Preferences
      fetchPreferences,
      updatePreferences,

      // Real-time
      enableRealtime,
      disableRealtime,

      // Utilities
      clearError,
      refresh,
      reset,

      // Filters
      applyFilters,
      resetFilters,
    }),
    [
      filteredNotifications,
      unreadCount,
      store.notifications.length,
      store.preferences,
      store.isLoading,
      localLoading,
      store.error,
      store.lastError,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      deleteAllRead,
      fetchPreferences,
      updatePreferences,
      enableRealtime,
      disableRealtime,
      clearError,
      refresh,
      reset,
      applyFilters,
      resetFilters,
    ]
  );
}

export default useNotification;
