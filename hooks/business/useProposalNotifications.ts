'use client';

/**
 * ================================================
 * USE PROPOSAL NOTIFICATIONS HOOK
 * ================================================
 * Manages proposal-related notifications
 * Fetches, displays, and marks notifications as read
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Proposal System Sprint - Day 7-8
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';

/**
 * Proposal notification types
 */
export type ProposalNotificationType =
  | 'PROPOSAL_SUBMITTED' // Freelancer sent a proposal
  | 'PROPOSAL_VIEWED' // Employer viewed your proposal
  | 'PROPOSAL_ACCEPTED' // Employer accepted your proposal
  | 'PROPOSAL_REJECTED' // Employer rejected your proposal
  | 'NEW_PROPOSAL' // New proposal received on your job
  | 'PROPOSAL_WITHDRAWN' // Freelancer withdrew their proposal
  | 'PROPOSAL_REMINDER'; // Reminder to review pending proposals

/**
 * Proposal notification data structure
 */
export interface ProposalNotificationData {
  id: string;
  type: ProposalNotificationType;
  title: string;
  message: string;
  proposalId?: string;
  jobId?: string;
  jobTitle?: string;
  freelancerName?: string;
  employerName?: string;
  proposedBudget?: number;
  createdAt: Date;
  read: boolean;
  actionUrl?: string;
}

interface UseProposalNotificationsParams {
  autoFetch?: boolean;
  pollingInterval?: number; // In milliseconds
}

interface UseProposalNotificationsReturn {
  notifications: ProposalNotificationData[];
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
      proposalId?: string;
      jobId?: string;
      jobTitle?: string;
      freelancerName?: string;
      employerName?: string;
      proposedBudget?: number;
      createdAt: string;
      read: boolean;
      actionUrl?: string;
    }>;
    unreadCount: number;
  };
}

/**
 * Hook for managing proposal notifications
 *
 * @example
 * ```tsx
 * const {
 *   notifications,
 *   unreadCount,
 *   loading,
 *   markAsRead,
 * } = useProposalNotifications({ autoFetch: true });
 *
 * return (
 *   <Badge count={unreadCount}>
 *     {notifications.map(notif => (
 *       <NotificationItem key={notif.id} notification={notif} />
 *     ))}
 *   </Badge>
 * );
 * ```
 */
export function useProposalNotifications({
  autoFetch = true,
  pollingInterval = 60000, // 1 minute
}: UseProposalNotificationsParams = {}): UseProposalNotificationsReturn {
  const [notifications, setNotifications] = useState<
    ProposalNotificationData[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch proposal notifications from API
   */
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/proposals`,
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
      const transformedNotifications: ProposalNotificationData[] =
        result.data.notifications.map((notif) => ({
          id: notif.id,
          type: notif.type as ProposalNotificationType,
          title: notif.title,
          message: notif.message,
          proposalId: notif.proposalId,
          jobId: notif.jobId,
          jobTitle: notif.jobTitle,
          freelancerName: notif.freelancerName,
          employerName: notif.employerName,
          proposedBudget: notif.proposedBudget,
          createdAt: new Date(notif.createdAt),
          read: notif.read,
          actionUrl: notif.actionUrl,
        }));

      setNotifications(transformedNotifications);
      setUnreadCount(result.data.unreadCount);

      logger.info('useProposalNotifications: Notifications fetched', {
        count: transformedNotifications.length,
        unreadCount: result.data.unreadCount,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMessage);
      logger.error(
        'useProposalNotifications: Error fetching notifications',
        err as Error,
        {
          hook: 'useProposalNotifications',
        }
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mark a single notification as read
   */
  const markAsRead = useCallback(
    async (notificationId: string) => {
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

        // Optimistic update
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));

        logger.info('useProposalNotifications: Notification marked as read', {
          notificationId,
        });
      } catch (err) {
        logger.error(
          'useProposalNotifications: Error marking as read',
          err as Error,
          {
            hook: 'useProposalNotifications',
            notificationId,
          }
        );
        // Revert optimistic update on error
        await fetchNotifications();
      }
    },
    [fetchNotifications]
  );

  /**
   * Mark all proposal notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/proposals/read-all`,
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

      // Optimistic update
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);

      logger.info('useProposalNotifications: All notifications marked as read');
    } catch (err) {
      logger.error(
        'useProposalNotifications: Error marking all as read',
        err as Error,
        {
          hook: 'useProposalNotifications',
        }
      );
      // Revert on error
      await fetchNotifications();
    }
  }, [fetchNotifications]);

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
