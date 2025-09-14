// Unified Notification Hook - consolidating useNotification and useNotifications
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotificationStore } from '@/lib/store/notification';
import type {
  InAppNotification,
  NotificationPreferences,
} from '@/types/features/notifications';

type NotificationType =
  | 'job_application'
  | 'job_accepted'
  | 'job_completed'
  | 'payment_received'
  | 'message_received'
  | 'review_received'
  | 'system_update'
  | 'promotion'
  | 'reminder';

interface NotificationFilters {
  type?: NotificationType[];
  isRead?: boolean;
  priority?: ('low' | 'medium' | 'high' | 'urgent')[];
  dateFrom?: string;
  dateTo?: string;
}

interface UseUnifiedNotificationOptions {
  autoFetch?: boolean;
  realtime?: boolean;
  pageSize?: number;
}

interface UseUnifiedNotificationReturn {
  // State
  notifications: InAppNotification[];
  unreadCount: number;
  totalCount: number;
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  error: string | null;

  // Notification operations
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;

  // Preferences management
  fetchPreferences: () => Promise<void>;
  updatePreferences: (
    preferences: Partial<NotificationPreferences>
  ) => Promise<void>;

  // Real-time operations
  enableRealtime: () => void;
  disableRealtime: () => void;

  // Utilities
  clearError: () => void;
  refresh: () => Promise<void>;
  reset: () => void;
}

export function useUnifiedNotification(
  options: UseUnifiedNotificationOptions = {}
): UseUnifiedNotificationReturn {
  const { autoFetch = true, realtime = false, pageSize = 20 } = options;

  const store = useNotificationStore();
  const [localLoading, setLocalLoading] = useState(false);
  const [filters, setFilters] = useState<NotificationFilters>({});

  // Computed values
  const unreadCount = useMemo(() => {
    return store.notifications.filter((n) => !n.isRead).length;
  }, [store.notifications]);

  // Fetch notifications with filters
  const fetchNotifications = useCallback(
    async (newFilters?: NotificationFilters) => {
      setLocalLoading(true);
      try {
        const filterParams = newFilters || filters;
        setFilters(filterParams);

        // Build query parameters
        const params = new URLSearchParams();
        if (filterParams.type?.length) {
          params.append('type', filterParams.type.join(','));
        }
        if (filterParams.isRead !== undefined) {
          params.append('isRead', String(filterParams.isRead));
        }
        if (filterParams.priority?.length) {
          params.append('priority', filterParams.priority.join(','));
        }
        if (filterParams.dateFrom) {
          params.append('dateFrom', filterParams.dateFrom);
        }
        if (filterParams.dateTo) {
          params.append('dateTo', filterParams.dateTo);
        }
        params.append('limit', String(pageSize));

        const response = await fetch(`/api/notifications?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        // Store'un kendi fetchNotifications method'unu çağır
        await store.fetchNotifications(filterParams);
      } catch (error) {
        // Store'da lastError property'si var
        console.error('Fetch notifications failed:', error);
      } finally {
        setLocalLoading(false);
      }
    },
    [store, filters, pageSize]
  );

  // Mark notifications as read
  const markAsRead = useCallback(
    async (notificationIds: string[]) => {
      try {
        await store.markAsRead(notificationIds);
      } catch (error) {
        console.error('Mark as read failed:', error);
      }
    },
    [store]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await store.markAllAsRead();
    } catch (error) {
      console.error('Mark all as read failed:', error);
    }
  }, [store]);

  // Delete a notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await store.deleteNotifications([notificationId]);
      } catch (error) {
        console.error('Delete notification failed:', error);
      }
    },
    [store]
  );

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    try {
      // Find all read notification IDs
      const readNotificationIds = store.notifications
        .filter((n) => n.isRead)
        .map((n) => n.id);

      if (readNotificationIds.length > 0) {
        await store.deleteNotifications(readNotificationIds);
      }
    } catch (error) {
      console.error('Delete read notifications failed:', error);
    }
  }, [store]);

  // Fetch notification preferences
  const fetchPreferences = useCallback(async () => {
    try {
      await store.fetchPreferences();
    } catch (error) {
      console.error('Fetch preferences failed:', error);
    }
  }, [store]);

  // Update notification preferences
  const updatePreferences = useCallback(
    async (preferences: Partial<NotificationPreferences>) => {
      try {
        await store.updatePreferences(preferences);
      } catch (error) {
        console.error('Update preferences failed:', error);
      }
    },
    [store]
  );

  // Enable real-time notifications
  const enableRealtime = useCallback(() => {
    if (typeof window !== 'undefined' && 'WebSocket' in window) {
      // Implement WebSocket connection for real-time notifications
      console.log('Real-time notifications enabled');
    }
  }, []);

  // Disable real-time notifications
  const disableRealtime = useCallback(() => {
    console.log('Real-time notifications disabled');
  }, []);

  // Refresh notifications
  const refresh = useCallback(async () => {
    await fetchNotifications(filters);
  }, [fetchNotifications, filters]);

  // Reset state
  const reset = useCallback(() => {
    store.reset();
  }, [store]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
    }
  }, [autoFetch, fetchNotifications]);

  // Enable real-time if requested
  useEffect(() => {
    if (realtime) {
      enableRealtime();
      return disableRealtime;
    }
  }, [realtime, enableRealtime, disableRealtime]);

  return {
    // State
    notifications: store.notifications as InAppNotification[], // Type assertion for compatibility
    unreadCount,
    totalCount: store.notifications.length,
    preferences: store.preferences as NotificationPreferences | null, // Type assertion for compatibility
    isLoading: store.isLoading || localLoading,
    error: store.error?.message || store.lastError,

    // Notification operations
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,

    // Preferences management
    fetchPreferences,
    updatePreferences,

    // Real-time operations
    enableRealtime,
    disableRealtime,

    // Utilities
    clearError: store.clearError,
    refresh,
    reset,
  };
}

export default useUnifiedNotification;
