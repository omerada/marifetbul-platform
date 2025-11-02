import { useEffect, useState, useCallback } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import {
  getRecentNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '@/lib/api/notification';
import { subscribeToNotifications } from '@/lib/infrastructure/websocket/notificationWebSocket';
import { logger } from '@/lib/shared/utils/logger';
import { playNotificationAlert } from '@/lib/utils/notificationSound';
import { useNotificationPreferences } from './useNotificationPreferences';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import type { Notification as BackendNotification } from '@/types/core/notification';
import type { InAppNotification } from '@/types/business/features/notifications';

/**
 * Transform backend notification to frontend format
 */
function transformNotification(
  notification: BackendNotification
): InAppNotification {
  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type.toLowerCase() as InAppNotification['type'],
    title: notification.title,
    message: notification.content, // Backend uses 'content', frontend uses 'message'
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    readAt: notification.readAt,
    actionUrl: notification.actionUrl,
    priority:
      notification.priority.toLowerCase() as InAppNotification['priority'],
    data: notification.relatedEntityId
      ? {
          relatedEntityType: notification.relatedEntityType,
          relatedEntityId: notification.relatedEntityId,
        }
      : undefined,
  };
}

/**
 * Fetcher function for SWR
 */
async function fetchRecentNotifications(): Promise<InAppNotification[]> {
  const data = await getRecentNotifications(5);
  return data.map(transformNotification);
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
    InAppNotification[]
  >([]);

  // Get auth user
  const { user } = useAuthStore();

  // Get notification preferences for sound/vibration
  const { preferences } = useNotificationPreferences();

  // Fetch recent notifications (latest 5)
  const { data: notifications, mutate } = useSWR<InAppNotification[]>(
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
      logger.warn(
        'useNotifications',
        'No user ID, skipping WebSocket subscription'
      );
      return;
    }

    logger.info('useNotifications', 'Setting up WebSocket subscription', {
      userId: user.id,
    });

    try {
      const unsubscribe = subscribeToNotifications(user.id, {
        onNotification: (notification) => {
          logger.debug(
            'useNotifications',
            'Received notification via WebSocket',
            {
              notification,
            }
          );

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
            description: notification.message,
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
          logger.error('useNotifications', 'WebSocket notification error', {
            error,
          });
        },
      });

      logger.info('useNotifications', 'WebSocket subscription successful');

      // Cleanup on unmount
      return () => {
        logger.info('useNotifications', 'Cleaning up WebSocket subscription');
        unsubscribe();
      };
    } catch (error) {
      logger.error(
        'useNotifications',
        'Failed to setup WebSocket subscription',
        {
          error,
        }
      );
    }
  }, [user?.id, preferences, mutate, mutateCount]);

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
