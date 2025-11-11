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
import logger from '@/lib/infrastructure/monitoring/logger';
import { playNotificationAlert } from '@/lib/utils/notificationSound';
import { useNotificationPreferences } from './useNotificationPreferences';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
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
  useEffect(() => {
    if (!user?.id) {
      logger.warn('Skipping WebSocket subscription - no user ID', {
        hasUser: !!user,
      });
      return;
    }

    logger.info('Setting up WebSocket notification listener', {
      userId: user.id,
    });

    try {
      const unsubscribe = subscribeToNotifications(user.id, {
        onNotification: (notification) => {
          logger.debug('useNotifications', { notification });

          // Update recent notifications list (add to beginning)
          setRecentNotifications((prev) => [notification, ...prev.slice(0, 4)]);

          // Increment unread count
          setUnreadCount((prev) => prev + 1);

          // Revalidate data
          mutate();
          mutateCount();

          // Play sound and vibration if push notifications are enabled
          // Check multiple push flags to ensure sound plays
          const shouldPlayAlert =
            preferences &&
            (preferences.messagePush ||
              preferences.jobPush ||
              preferences.proposalPush ||
              preferences.orderPush ||
              preferences.paymentPush ||
              preferences.reviewPush ||
              preferences.systemPush ||
              preferences.followPush);

          if (shouldPlayAlert) {
            playNotificationAlert({
              sound: true,
              vibration: true,
              doNotDisturb: preferences.doNotDisturb,
              dndStartTime: preferences.dndStartTime,
              dndEndTime: preferences.dndEndTime,
            });
          }

          // Show toast notification
          toast.success(notification.title, {
            description: notification.content,
            action: notification.actionUrl
              ? {
                  label: 'Görüntüle',
                  onClick: () => {
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                    }
                  },
                }
              : undefined,
            duration: 5000,
          });
        },
        onError: (error) => {
          logger.error(
            'useNotifications: WebSocket notification error',
            undefined,
            {
              error,
            }
          );
        },
      });

      logger.info('WebSocket subscription successful');

      // Cleanup on unmount
      return () => {
        logger.info('Cleaning up WebSocket subscription');
        unsubscribe();
      };
    } catch (error) {
      logger.error(
        'Failed to setup WebSocket subscription',
        error
      );
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
        logger.error(
          'Failed to mark notification as read:',
          error
        );
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
      logger.error(
        'Failed to mark all as read:',
        error
      );
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
