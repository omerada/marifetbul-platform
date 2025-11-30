'use client';

import { useEffect, useState, useCallback } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import {
  getRecentNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '@/lib/api/notifications';
import { subscribeToNotifications } from '@/lib/infrastructure/websocket/notificationWebSocket';
import { getUnifiedNotificationHandler } from '@/lib/infrastructure/notification/UnifiedNotificationHandler';
import logger from '@/lib/infrastructure/monitoring/logger';
import { useNotificationPreferences } from './useNotificationPreferences';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import type { Notification } from '@/types/domains/notification';

// Simple converter for notification API responses
function convertToNotifications(data: unknown[]): Notification[] {
  return data as Notification[];
}

/**
 * Fetcher function for SWR
 */
async function fetchRecentNotifications(): Promise<Notification[]> {
  const data = await getRecentNotifications(5);
  return convertToNotifications(data);
}

/**
 * Custom hook for notifications with real-time WebSocket updates
 *
 * Features:
 * - Fetches recent unread notifications
 * - Real-time updates via WebSocket
 * - Unread count tracking
 * - Mark as read functionality
 * - Toast notifications for new events
 *
 * @example
 * ```tsx
 * const { notifications, unreadCount, markNotificationAsRead, refetch } = useNotifications();
 * ```
 */
export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<
    Notification[]
  >([]);

  // Get auth user
  const { user } = useAuthStore();

  // Get notification preferences for sound/vibration
  const { preferences } = useNotificationPreferences();

  // Fetch recent notifications (latest 5)
  const { data: notifications, mutate } = useSWR<Notification[]>(
    '/api/notifications/recent',
    fetchRecentNotifications,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  // Fetch unread count
  const { data: count, mutate: mutateCount } = useSWR<number>(
    '/api/notifications/unread-count',
    getUnreadCount,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  // Update state when data changes
  useEffect(() => {
    if (notifications) {
      setRecentNotifications(notifications);
    }
  }, [notifications]);

  useEffect(() => {
    if (count !== undefined) {
      setUnreadCount(count);
    }
  }, [count]);

  // WebSocket listener for real-time notifications
  // Sprint 6 - Story 6.5: Using UnifiedNotificationHandler to prevent duplicates
  useEffect(() => {
    if (!user?.id) {
      logger.warn('Skipping WebSocket subscription - no user ID', {
        hasUser: !!user,
      });
      return;
    }

    logger.info(
      'Setting up WebSocket notification listener with UnifiedHandler',
      {
        userId: user.id,
      }
    );

    // Get unified notification handler
    const unifiedHandler = getUnifiedNotificationHandler({
      enableDeduplication: true,
      deduplicationWindow: 5000, // 5 seconds
      enableAlerts: true,
      enableToasts: true,
    });

    // Register callbacks for processed notifications
    unifiedHandler.setCallbacks({
      onNotificationProcessed: (processedNotification) => {
        logger.debug('Notification processed', {
          id: processedNotification.id,
          source: processedNotification.source,
        });

        // Update recent notifications list (add to beginning)
        setRecentNotifications((prev) => [
          processedNotification,
          ...prev.slice(0, 4),
        ]);

        // Increment unread count
        setUnreadCount((prev) => prev + 1);

        // Revalidate data
        mutate();
        mutateCount();
      },
      onNotificationDeduplicated: (notificationId) => {
        logger.info('Duplicate notification prevented', { notificationId });
      },
      // Sprint 6 - Story 6.1: Batch notification handler
      onBatchProcessed: (batch) => {
        logger.info('Batch notification processed', {
          batchId: batch.id,
          itemCount: batch.itemCount,
        });

        // Increment unread count by batch item count
        setUnreadCount((prev) => prev + batch.itemCount);

        // Revalidate data to fetch new notifications
        mutate();
        mutateCount();
      },
      onError: (error, notification) => {
        logger.error('Notification processing error', error instanceof Error ? error : new Error(String(error)), {
          notificationId: notification?.id,
        });
      },
    });

    try {
      // Subscribe to WebSocket notifications
      const unsubscribe = subscribeToNotifications(user.id, {
        onNotification: (notification) => {
          // Process notification through unified handler
          unifiedHandler.processNotification(
            notification,
            'websocket',
            preferences || undefined
          );
        },
        // Sprint 6 - Story 6.1: Batch notification handler
        onBatchNotification: (batch) => {
          logger.info('Batch notification received from WebSocket', {
            batchId: batch.id,
            itemCount: batch.itemCount,
          });
          // Process batch through unified handler
          unifiedHandler.processBatchNotification(
            batch,
            preferences || undefined
          );
        },
        onError: (error) => {
          logger.error('useNotifications: WebSocket notification error', error);
        },
      });

      logger.info('WebSocket subscription successful');

      // Cleanup on unmount
      return () => {
        logger.info('Cleaning up WebSocket subscription');
        unsubscribe();
      };
    } catch (error) {
      logger.error('Failed to setup WebSocket subscription', error);
    }
  }, [user, preferences, mutate, mutateCount]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await markAsRead(notificationId);

        // Update local state optimistically
        setRecentNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );

        // Decrement unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));

        // Revalidate data
        mutate();
        mutateCount();
      } catch (error) {
        logger.error('Failed to mark notification as read:', error);
        toast.error('Bildirim okundu olarak işaretlenemedi');
      }
    },
    [mutate, mutateCount]
  );

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      const updatedCount = await markAllAsRead();

      // Update local state
      setRecentNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);

      // Revalidate data
      mutate();
      mutateCount();

      toast.success(`${updatedCount} bildirim okundu olarak işaretlendi`);
    } catch (error) {
      logger.error('Failed to mark all as read:', error);
      toast.error('Bildirimler işaretlenemedi');
    }
  }, [mutate, mutateCount]);

  // Manual refresh
  const refetch = useCallback(() => {
    mutate();
    mutateCount();
  }, [mutate, mutateCount]);

  return {
    notifications: recentNotifications,
    unreadCount,
    isLoading: !notifications && !count,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    refetch,
  };
}
