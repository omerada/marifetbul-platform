'use client';

import { useState, useEffect } from 'react';
import { useNotificationStore } from '@/lib/store/notificationStore';
import { apiClient } from '@/lib/api/client';
import useSWR from 'swr';

// Enhanced hook to fetch notifications with store integration
export function useNotifications() {
  const store = useNotificationStore();

  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: {
      notifications: Array<{
        id: string;
        type: 'review' | 'analytics' | 'reputation' | 'security' | 'system';
        category: 'success' | 'info' | 'warning' | 'error';
        title: string;
        message: string;
        metadata?: Record<string, unknown>;
        actionLabel?: string;
        actionUrl?: string;
        isRead: boolean;
        isPinned: boolean;
        expiresAt?: string;
        createdAt: string;
        updatedAt: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
      summary: {
        total: number;
        unread: number;
        pinned: number;
      };
    };
  }>('/api/notifications', apiClient.get);

  // Auto-fetch on mount if not fetched before
  useEffect(() => {
    if (!store.lastFetch) {
      mutate();
    }
  }, [store.lastFetch, mutate]);

  return {
    notifications: data?.data.notifications || store.notifications,
    unreadCount: data?.data.summary?.unread || store.unreadCount,
    isLoading: isLoading || store.isLoading,
    error: error || store.error,
    refresh: mutate,
    // Add store methods
    markAsRead: store.markAsRead,
    markAllAsRead: store.markAllAsRead,
    deleteNotification: store.deleteNotification,
    pinNotification: store.pinNotification,
    unpinNotification: store.unpinNotification,
  };
}

// Sprint 8 integration helpers
export function useNotificationIntegration() {
  const { notifications, markAsRead, refresh } = useNotifications();
  const store = useNotificationStore();

  // Create Sprint 8 specific notifications
  const createReviewNotification = async (reviewData: {
    reviewId: string;
    rating: number;
    projectId: string;
    reviewerName: string;
  }) => {
    return store.createNotification({
      type: 'review',
      category: 'success',
      title: 'New Review Received',
      message: `${reviewData.reviewerName} left you a ${reviewData.rating}-star review.`,
      metadata: {
        reviewId: reviewData.reviewId,
        rating: reviewData.rating.toString(),
        projectId: reviewData.projectId,
      },
      actionLabel: 'View Review',
      actionUrl: `/reviews/${reviewData.reviewId}`,
    });
  };

  const createAnalyticsNotification = async (analyticsData: {
    period: string;
    projectCount: number;
    earnings: number;
    rating: number;
  }) => {
    return store.createNotification({
      type: 'analytics',
      category: 'info',
      title: `${analyticsData.period} Performance Report`,
      message: `You completed ${analyticsData.projectCount} projects this ${analyticsData.period.toLowerCase()}.`,
      metadata: {
        period: analyticsData.period,
        projectCount: analyticsData.projectCount.toString(),
        earnings: analyticsData.earnings.toString(),
        rating: analyticsData.rating.toString(),
      },
      actionLabel: 'View Report',
      actionUrl: '/analytics',
    });
  };

  const createReputationNotification = async (reputationData: {
    badgeId?: string;
    badgeName?: string;
    previousScore: number;
    newScore: number;
    change: number;
  }) => {
    const isBadgeEarned = reputationData.badgeId && reputationData.badgeName;

    return store.createNotification({
      type: 'reputation',
      category: 'success',
      title: isBadgeEarned ? 'New Badge Earned!' : 'Reputation Updated',
      message: isBadgeEarned
        ? `Congratulations! You earned the "${reputationData.badgeName}" badge.`
        : `Your reputation score ${reputationData.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(reputationData.change)} points.`,
      metadata: {
        badgeId: reputationData.badgeId || '',
        previousScore: reputationData.previousScore.toString(),
        newScore: reputationData.newScore.toString(),
        change: reputationData.change.toString(),
      },
      actionLabel: isBadgeEarned ? 'View Badge' : 'View Profile',
      actionUrl: isBadgeEarned ? '/profile/badges' : '/profile',
    });
  };

  const createSecurityNotification = async (securityData: {
    type: 'login' | 'verification' | 'suspicious';
    location?: string;
    device?: string;
    ip?: string;
  }) => {
    const titles = {
      login: 'Login from New Device',
      verification: 'Verification Status Updated',
      suspicious: 'Suspicious Activity Detected',
    };

    const messages = {
      login: `New login detected from ${securityData.location || 'unknown location'}.`,
      verification: 'Your account verification status has been updated.',
      suspicious: 'We detected unusual activity on your account.',
    };

    return store.createNotification({
      type: 'security',
      category: securityData.type === 'verification' ? 'info' : 'warning',
      title: titles[securityData.type],
      message: messages[securityData.type],
      metadata: {
        securityType: securityData.type,
        location: securityData.location || '',
        device: securityData.device || '',
        ip: securityData.ip || '',
      },
      actionLabel: 'Review Activity',
      actionUrl: '/security/activity',
    });
  };

  // Get notifications by Sprint 8 feature types
  const getReviewNotifications = () => store.getNotificationsByType('review');
  const getAnalyticsNotifications = () =>
    store.getNotificationsByType('analytics');
  const getReputationNotifications = () =>
    store.getNotificationsByType('reputation');
  const getSecurityNotifications = () =>
    store.getNotificationsByType('security');

  return {
    // Basic notification data
    notifications,
    markAsRead,
    refresh,

    // Creation helpers
    createReviewNotification,
    createAnalyticsNotification,
    createReputationNotification,
    createSecurityNotification,

    // Getters by type
    getReviewNotifications,
    getAnalyticsNotifications,
    getReputationNotifications,
    getSecurityNotifications,
  };
}
export function useUnreadNotifications() {
  const { notifications } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return unreadCount;
}

// Hook for notification actions
export function useNotificationActions() {
  const [isLoading, setIsLoading] = useState(false);

  const markAsRead = async (notificationId: string) => {
    setIsLoading(true);
    try {
      await apiClient.patch(`/api/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    setIsLoading(true);
    try {
      await apiClient.patch('/api/notifications/mark-all-read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    setIsLoading(true);
    try {
      await apiClient.delete(`/api/notifications/${notificationId}`);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading,
  };
}

// In-app notification toast hook
export function useToast() {
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      type: 'success' | 'error' | 'warning' | 'info';
      title: string;
      message?: string;
      duration?: number;
    }>
  >([]);

  const showToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message?: string,
    duration = 5000
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setToasts((prev) => [...prev, { id, type, title, message, duration }]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
    success: (title: string, message?: string) =>
      showToast('success', title, message),
    error: (title: string, message?: string) =>
      showToast('error', title, message),
    warning: (title: string, message?: string) =>
      showToast('warning', title, message),
    info: (title: string, message?: string) =>
      showToast('info', title, message),
  };
}
