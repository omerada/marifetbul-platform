'use client';

/**
 * ================================================
 * USE REVIEW NOTIFICATIONS HOOK
 * ================================================
 * Manages review-related notifications
 * Fetches, displays, and marks notifications as read
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint - Day 7-8
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { ReviewNotificationData } from '@/components/domains/reviews/ReviewNotificationItem';

interface UseReviewNotificationsParams {
  autoFetch?: boolean;
  pollingInterval?: number; // In milliseconds
}

interface UseReviewNotificationsReturn {
  notifications: ReviewNotificationData[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearError: () => void;
}

interface NotificationsResponse {
  success: boolean;
  message?: string;
  data: {
    notifications: Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      reviewId?: string;
      orderId?: string;
      packageTitle?: string;
      sellerName?: string;
      createdAt: string;
      read: boolean;
      actionUrl?: string;
    }>;
    unreadCount: number;
  };
}

export function useReviewNotifications({
  autoFetch = true,
  pollingInterval = 60000, // 1 minute
}: UseReviewNotificationsParams = {}): UseReviewNotificationsReturn {
  const [notifications, setNotifications] = useState<ReviewNotificationData[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch review notifications
   */
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/reviews`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated, silently return
          setNotifications([]);
          setUnreadCount(0);
          return;
        }
        throw new Error('Bildirimler yüklenirken bir hata oluştu');
      }

      const result: NotificationsResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'İşlem başarısız');
      }

      // Transform API data to component format
      const transformedNotifications: ReviewNotificationData[] =
        result.data.notifications.map((notif) => ({
          id: notif.id,
          type: notif.type as ReviewNotificationData['type'],
          title: notif.title,
          message: notif.message,
          reviewId: notif.reviewId,
          orderId: notif.orderId,
          packageTitle: notif.packageTitle,
          sellerName: notif.sellerName,
          createdAt: new Date(notif.createdAt),
          read: notif.read,
          actionUrl: notif.actionUrl,
        }));

      setNotifications(transformedNotifications);
      setUnreadCount(result.data.unreadCount);

      logger.info('useReviewNotifications: Notifications fetched', {
        count: transformedNotifications.length,
        unreadCount: result.data.unreadCount,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMessage);
      logger.error(
        'useReviewNotifications: Error fetching notifications',
        err as Error,
        {
          hook: 'useReviewNotifications',
        }
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mark a single notification as read
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/${notificationId}/read`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Bildirim işaretlenirken bir hata oluştu');
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));

      logger.info('useReviewNotifications: Notification marked as read', {
        notificationId,
      });
    } catch (err) {
      logger.error(
        'useReviewNotifications: Error marking as read',
        err as Error,
        {
          hook: 'useReviewNotifications',
          notificationId,
        }
      );
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/reviews/read-all`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Bildirimler işaretlenirken bir hata oluştu');
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);

      logger.info('useReviewNotifications: All notifications marked as read');
    } catch (err) {
      logger.error(
        'useReviewNotifications: Error marking all as read',
        err as Error,
        {
          hook: 'useReviewNotifications',
        }
      );
    }
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Auto-fetch notifications on mount
   */
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
    }
  }, [autoFetch, fetchNotifications]);

  /**
   * Set up polling for new notifications
   */
  useEffect(() => {
    if (!autoFetch || !pollingInterval) return;

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, pollingInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [autoFetch, pollingInterval, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearError,
  };
}
