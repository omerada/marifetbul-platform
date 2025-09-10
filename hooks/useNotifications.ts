'use client';

import { useState } from 'react';
import { Notification } from '@/types';
import { apiClient } from '@/lib/api/client';
import useSWR from 'swr';

// Hook to fetch notifications
export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: Notification[];
  }>('/api/notifications', apiClient.get);

  return {
    notifications: data?.data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook to get unread notification count
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
