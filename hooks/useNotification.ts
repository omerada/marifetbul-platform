import type { Notification, NotificationSettings } from '@/types';
import { useState, useCallback, useEffect } from 'react';
import { useAsyncOperation, useAsyncAction } from './useAsyncOperation';

export interface UseNotificationReturn {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  updatePreferences: (
    preferences: Partial<NotificationSettings>
  ) => Promise<void>;
  showToast: (
    message: string,
    type?: 'info' | 'success' | 'warning' | 'error'
  ) => void;
}

export const useNotifications = (): UseNotificationReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationSettings | null>(
    null
  );

  // Use the new async operation hooks
  const fetchOperation = useAsyncOperation<Notification[]>();
  const markAsReadAction = useAsyncAction();
  const markAllAsReadAction = useAsyncAction();
  const deleteAction = useAsyncAction();
  const updatePreferencesAction = useAsyncAction();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    await fetchOperation.execute(async () => {
      // Mock fetch notifications
      const mockNotifications: Notification[] = [
        {
          id: '1',
          userId: 'current-user',
          title: 'New Message',
          message: 'You have received a new message from a client',
          type: 'message',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          userId: 'current-user',
          title: 'Payment Received',
          message: 'Payment of $500 has been received',
          type: 'payment',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ];

      setNotifications(mockNotifications);
      return mockNotifications;
    });
  }, [fetchOperation]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      await markAsReadAction.execute(async () => {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
      });
    },
    [markAsReadAction]
  );

  const markAllAsRead = useCallback(async () => {
    await markAllAsReadAction.execute(async () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    });
  }, [markAllAsReadAction]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      await deleteAction.execute(async () => {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      });
    },
    [deleteAction]
  );

  const updatePreferences = useCallback(
    async (newPreferences: Partial<NotificationSettings>) => {
      await updatePreferencesAction.execute(async () => {
        setPreferences((prev) =>
          prev ? { ...prev, ...newPreferences } : null
        );
      });
    },
    [updatePreferencesAction]
  );

  const showToast = useCallback(
    (
      message: string,
      type: 'info' | 'success' | 'warning' | 'error' = 'info'
    ) => {
      const toastNotification: Notification = {
        id: `toast-${Date.now()}`,
        userId: 'current-user',
        title: type.charAt(0).toUpperCase() + type.slice(1),
        message,
        type: 'system',
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => [toastNotification, ...prev]);

      // Auto-remove toast after 5 seconds
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== toastNotification.id)
        );
      }, 5000);
    },
    []
  );

  // Load initial data
  useEffect(() => {
    fetchNotifications();

    // Load preferences
    const mockPreferences: NotificationSettings = {
      push: true,
      email: true,
      sms: false,
      inApp: true,
      marketing: false,
      updates: true,
      reminders: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
      browser: {
        enabled: true,
      },
    };
    setPreferences(mockPreferences);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    preferences,
    isLoading:
      fetchOperation.isLoading ||
      markAsReadAction.isLoading ||
      markAllAsReadAction.isLoading ||
      deleteAction.isLoading ||
      updatePreferencesAction.isLoading,
    error:
      fetchOperation.error ||
      markAsReadAction.error ||
      markAllAsReadAction.error ||
      deleteAction.error ||
      updatePreferencesAction.error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    showToast,
  };
};

export default useNotifications;
