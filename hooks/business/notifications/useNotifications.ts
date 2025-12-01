/**
 * useNotifications Hook
 *
 * Comprehensive notification management with real-time updates,
 * push notifications, and preference management.
 *
 * Features:
 * - Real-time notifications via WebSocket
 * - Push notification support (FCM/VAPID)
 * - Notification preferences management
 * - Mark as read/unread
 * - Pagination and filtering
 * - Toast integration
 * - Sound alerts
 *
 * @sprint Sprint 3 - Messaging & Notifications
 * @author MarifetBul Development Team
 */

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import useSWR from 'swr';
import type { NotificationFilters } from '@/lib/api/notifications';
import { getWebSocketService } from '@/lib/infrastructure/websocket/WebSocketService';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
  getUnreadCount,
  NotificationPriority,
  type NotificationResponse as Notification,
  type NotificationPreferencesResponse,
  type PaginatedNotifications,
  type UpdateNotificationPreferencesRequest,
} from '@/lib/api/notifications';
import { useToast } from '@/hooks/core/useToast';
import logger from '@/lib/infrastructure/monitoring/logger';

// ==================== TYPES ====================

export interface UseNotificationsOptions {
  /** Auto-fetch on mount */
  autoLoad?: boolean;
  /** Page size */
  pageSize?: number;
  /** Initial filters */
  filters?: NotificationFilters;
  /** Enable WebSocket real-time updates */
  enableRealtime?: boolean;
  /** Enable push notifications */
  enablePush?: boolean;
  /** Enable sound alerts */
  enableSound?: boolean;
  /** Enable toast notifications */
  enableToast?: boolean;
  /** Auto-mark as read after viewing */
  autoMarkAsRead?: boolean;
}

export interface NotificationState {
  /** Notification list */
  notifications: Notification[];
  /** Unread count */
  unreadCount: number;
  /** User preferences */
  preferences: NotificationPreferencesResponse | null;
  /** Loading states */
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  /** Pagination */
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  /** Filters */
  filters: NotificationFilters;
  hasMore: boolean;
  /** Push notification state */
  pushSupported: boolean;
  pushPermission: NotificationPermission | null;
}

export interface NotificationActions {
  /** Refresh notifications */
  refresh: () => Promise<void>;
  /** Load more notifications */
  loadMore: () => Promise<void>;
  /** Mark single notification as read */
  markAsRead: (notificationId: string) => Promise<void>;
  /** Mark all notifications as read */
  markAllAsRead: () => Promise<void>;
  /** Set filters */
  setFilters: (filters: NotificationFilters) => void;
  /** Clear filters */
  clearFilters: () => void;
  /** Update preferences */
  updatePreferences: (
    preferences: Partial<NotificationPreferencesResponse>
  ) => Promise<void>;
  /** Request push notification permission */
  requestPushPermission: () => Promise<NotificationPermission>;
  /** Play notification sound */
  playSound: () => void;
  /** Clear error */
  clearError: () => void;
}

export interface UseNotificationsReturn {
  state: NotificationState;
  actions: NotificationActions;
}

// ==================== CACHE KEYS ====================

const CACHE_KEYS = {
  notifications: (page: number, filters?: NotificationFilters) =>
    `/api/v1/notifications?page=${page}${filters ? `&filters=${JSON.stringify(filters)}` : ''}`,
  unreadCount: '/api/v1/notifications/unread-count',
  preferences: '/api/v1/notifications/preferences',
};

// ==================== HOOK ====================

/**
 * useNotifications Hook
 *
 * @param options Configuration options
 * @returns Notification state and actions
 *
 * @example
 * ```tsx
 * const { state, actions } = useNotifications({
 *   autoLoad: true,
 *   pageSize: 20,
 *   enableRealtime: true,
 *   enableToast: true,
 * });
 *
 * // Access state
 * console.log(state.notifications, state.unreadCount);
 *
 * // Perform actions
 * await actions.markAsRead(notificationId);
 * await actions.loadMore();
 * ```
 */
export function useNotifications(
  options?: UseNotificationsOptions
): UseNotificationsReturn {
  const {
    autoLoad = true,
    pageSize = 20,
    filters: initialFilters,
    enableRealtime = true,
    enablePush: _enablePush = false,
    enableSound = true,
    enableToast = true,
    autoMarkAsRead = false,
  } = options || {};

  // ==================== STATE ====================

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<NotificationFilters>(
    initialFilters || {}
  );
  const [hasMore, setHasMore] = useState(true);
  const [pushPermission, setPushPermission] =
    useState<NotificationPermission | null>(null);

  const toast = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wsSubscriptionIdRef = useRef<string | null>(null);

  // ==================== SWR DATA FETCHING ====================

  // Fetch notifications with pagination
  const {
    data: notificationsData,
    error: notificationsError,
    isLoading: notificationsLoading,
    mutate: mutateNotifications,
  } = useSWR<PaginatedNotifications>(
    autoLoad ? CACHE_KEYS.notifications(currentPage, filters) : null,
    async () => {
      const response = await getNotifications(currentPage - 1, pageSize);
      return response;
    }
  );

  // Fetch unread count
  const { data: unreadCount = 0, mutate: mutateUnreadCount } = useSWR<number>(
    CACHE_KEYS.unreadCount,
    () => getUnreadCount(),
    {
      refreshInterval: 30000, // Refresh every 30s
    }
  );

  // Fetch preferences
  const {
    data: preferences,
    error: preferencesError,
    isLoading: preferencesLoading,
    mutate: mutatePreferences,
  } = useSWR<NotificationPreferencesResponse>(CACHE_KEYS.preferences, () =>
    getNotificationPreferences()
  );

  // ==================== COMPUTED STATE ====================

  const error = useMemo(
    () => notificationsError || preferencesError,
    [notificationsError, preferencesError]
  );

  const isError = useMemo(() => !!error, [error]);

  // Update hasMore based on pagination data
  useEffect(() => {
    if (notificationsData) {
      setHasMore(!notificationsData.last);
    }
  }, [notificationsData]);

  // ==================== PUSH NOTIFICATIONS ====================

  // Check push notification support
  const pushSupported = useMemo(() => {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }, []);

  // Check push permission on mount
  useEffect(() => {
    if (pushSupported) {
      setPushPermission(Notification.permission);
    }
  }, [pushSupported]);

  // ==================== AUDIO ====================

  // Initialize audio for notification sound
  useEffect(() => {
    if (enableSound && typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.volume = 0.5;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [enableSound]);

  const playSound = useCallback(() => {
    if (enableSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        logger.warn('Failed to play notification sound:', err);
      });
    }
  }, [enableSound]);

  // ==================== ACTIONS ====================

  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      try {
        // Optimistic update
        await mutateNotifications((current) => {
          if (!current) return current;

          return {
            ...current,
            content: current.content.map((n) =>
              n.id === notificationId ? { ...n, isRead: true } : n
            ),
          };
        }, false);

        // API call
        await markAsRead(notificationId);

        // Update unread count
        await mutateUnreadCount();

        // Revalidate
        await mutateNotifications();
      } catch (err) {
        logger.error(
          `useNotifications: Failed to mark notification ${notificationId} as read`,
          err as Error
        );
        // Revert optimistic update
        await mutateNotifications();
        throw err;
      }
    },
    [mutateNotifications, mutateUnreadCount]
  );

  // ==================== WEBSOCKET REAL-TIME ====================

  useEffect(() => {
    if (!enableRealtime) return;

    const ws = getWebSocketService();

    // Subscribe to notifications
    const unsubscribe = ws.subscribe(
      '/user/queue/notifications',
      (data: unknown) => {
        const notification = data as Notification;

        // Update SWR cache with new notification
        mutateNotifications((current) => {
          if (!current) return current;

          // Check if notification already exists
          const exists = current.content.some((n) => n.id === notification.id);
          if (exists) {
            return current;
          }

          return {
            ...current,
            content: [notification, ...current.content],
            totalElements: current.totalElements + 1,
          };
        }, false);

        // Update unread count
        mutateUnreadCount((count) => (count || 0) + 1, false);

        // Show toast notification
        if (enableToast) {
          const priorityVariant =
            notification.priority === NotificationPriority.HIGH
              ? 'error'
              : notification.priority === NotificationPriority.MEDIUM
                ? 'warning'
                : 'info';

          if (priorityVariant === 'error') {
            toast.error(notification.content);
          } else if (priorityVariant === 'warning') {
            toast.warning(notification.content);
          } else {
            toast.info(notification.content);
          }
        }

        // Play sound
        if (enableSound) {
          playSound();
        }

        // Auto-mark as read
        if (autoMarkAsRead) {
          setTimeout(() => {
            handleMarkAsRead(notification.id);
          }, 2000);
        }
      }
    );

    wsSubscriptionIdRef.current = unsubscribe;

    return () => {
      if (wsSubscriptionIdRef.current) {
        ws.unsubscribe(wsSubscriptionIdRef.current);
        wsSubscriptionIdRef.current = null;
      }
    };
  }, [
    enableRealtime,
    enableToast,
    enableSound,
    autoMarkAsRead,
    toast,
    playSound,
    handleMarkAsRead,
    mutateNotifications,
    mutateUnreadCount,
  ]);

  // ==================== ACTION CALLBACKS ====================

  const refresh = useCallback(async () => {
    await mutateNotifications();
    await mutateUnreadCount();
    await mutatePreferences();
  }, [mutateNotifications, mutateUnreadCount, mutatePreferences]);

  const loadMore = useCallback(async () => {
    if (!hasMore || notificationsLoading) return;

    try {
      const nextPage = currentPage + 1;
      const response = await getNotifications(nextPage - 1, pageSize);

      // Merge with existing data
      await mutateNotifications((current) => {
        if (!current || !response) return current;

        return {
          ...response,
          content: [...(current.content || []), ...(response.content || [])],
        };
      }, false);

      setCurrentPage(nextPage);
    } catch (err) {
      logger.error(
        'useNotifications: Failed to load more notifications',
        err as Error
      );
      throw err;
    }
  }, [
    hasMore,
    notificationsLoading,
    currentPage,
    pageSize,
    mutateNotifications,
  ]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      await mutateNotifications((current) => {
        if (!current) return current;

        return {
          ...current,
          content: current.content.map((n) => ({ ...n, isRead: true })),
        };
      }, false);

      // API call
      await markAllAsRead();

      // Update unread count
      await mutateUnreadCount(0, false);

      // Revalidate
      await mutateNotifications();

      toast.success('All notifications marked as read');
    } catch (err) {
      logger.error(
        'useNotifications: Failed to mark all as read',
        err as Error
      );
      // Revert optimistic update
      await mutateNotifications();
      await mutateUnreadCount();
      throw err;
    }
  }, [mutateNotifications, mutateUnreadCount, toast]);

  const handleSetFilters = useCallback((newFilters: NotificationFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const clearFiltersAction = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  const handleUpdatePreferences = useCallback(
    async (newPreferences: Partial<NotificationPreferencesResponse>) => {
      try {
        const updated = await updateNotificationPreferences(
          newPreferences as UpdateNotificationPreferencesRequest
        );

        await mutatePreferences(updated, false);

        toast.success('Notification preferences updated');
      } catch (err) {
        logger.error(
          'useNotifications: Failed to update preferences',
          err as Error
        );
        throw err;
      }
    },
    [mutatePreferences, toast]
  );

  const requestPushPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (!pushSupported) {
        throw new Error('Push notifications not supported');
      }

      try {
        const permission = await Notification.requestPermission();
        setPushPermission(permission);

        if (permission === 'granted') {
          toast.success('Push notifications enabled');
        } else if (permission === 'denied') {
          toast.error('Push notifications blocked');
        }

        return permission;
      } catch (err) {
        logger.error(
          'useNotifications: Failed to request push permission',
          err as Error
        );
        throw err;
      }
    }, [pushSupported, toast]);

  const clearErrorAction = useCallback(() => {
    mutateNotifications(undefined, false);
  }, [mutateNotifications]);

  // ==================== RETURN ====================

  const state: NotificationState = {
    notifications: notificationsData?.content || [],
    unreadCount,
    preferences: preferences || null,
    isLoading: notificationsLoading || preferencesLoading,
    isError,
    error: error || null,
    pagination: notificationsData
      ? {
          page: notificationsData.number + 1,
          pageSize: notificationsData.size,
          total: notificationsData.totalElements,
          totalPages: notificationsData.totalPages,
          hasNext: !notificationsData.last,
          hasPrev: !notificationsData.first,
        }
      : null,
    filters,
    hasMore,
    pushSupported,
    pushPermission,
  };

  const actions: NotificationActions = {
    refresh,
    loadMore,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    setFilters: handleSetFilters,
    clearFilters: clearFiltersAction,
    updatePreferences: handleUpdatePreferences,
    requestPushPermission,
    playSound,
    clearError: clearErrorAction,
  };

  return { state, actions };
}
