import { useState, useEffect, useCallback } from 'react';
import { PushNotificationManager } from '@/lib/domains/notification/push-notifications';
import { logger } from '@/lib/shared/utils/logger';
import { Notification, NotificationSettings } from '@/types';

interface UsePushNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  settings: NotificationSettings | null;
  // Notification actions
  loadNotifications: (page?: number) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  // Settings actions
  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
  // Push notification actions
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
}

export function usePushNotifications(
  userId?: string
): UsePushNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load notifications from API
  const loadNotifications = useCallback(
    async (page = 1) => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        // API client handles authentication via httpOnly cookies automatically
        const response = await fetch(
          `/api/notifications?page=${page}&limit=20`,
          {
            credentials: 'include', // Include cookies for authentication
          }
        );

        const data = await response.json();

        if (data.success) {
          const notificationList = data.data.notifications;
          setNotifications((prev) =>
            page === 1 ? notificationList : [...prev, ...notificationList]
          );

          // Update unread count
          const unread = notificationList.filter(
            (n: Notification) => !n.isRead
          ).length;
          setUnreadCount(unread);
        } else {
          throw new Error(data.message || 'Bildirimler yüklenemedi');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Bilinmeyen hata';
        setError(errorMessage);
        logger.error('Bildirimler yüklenemedi:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId) return;

      try {
        const response = await fetch(
          `/api/notifications/${notificationId}/read`,
          {
            method: 'PATCH',
            credentials: 'include', // Include cookies for authentication
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === notificationId ? { ...notif, isRead: true } : notif
            )
          );

          setUnreadCount((prev) => Math.max(0, prev - 1));
        } else {
          throw new Error(data.message || 'Bildirim güncellenemedi');
        }
      } catch (err) {
        logger.error('Bildirim okundu olarak işaretlenemedi:', err);
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      }
    },
    [userId]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      // Mark all unread notifications as read locally first for immediate feedback
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);

      // Update on server
      await Promise.all(
        unreadNotifications.map((notif) =>
          fetch(`/api/notifications/${notif.id}/read`, {
            method: 'PATCH',
            credentials: 'include', // Include cookies for authentication
            headers: {
              'Content-Type': 'application/json',
            },
          })
        )
      );
    } catch (err) {
      logger.error('Tüm bildirimler okundu olarak işaretlenemedi:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      // Reload notifications to restore correct state
      loadNotifications();
    }
  }, [userId, notifications, loadNotifications]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!userId) return;

      try {
        // Remove from local state immediately for better UX
        const notification = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        // Note: Delete endpoint not implemented in MSW handlers yet
        // This would be a DELETE request to /api/notifications/:id
        // Notification deleted successfully
      } catch (err) {
        logger.error('Bildirim silinemedi:', err);
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
        // Reload notifications to restore correct state
        loadNotifications();
      }
    },
    [userId, notifications, loadNotifications]
  );

  // Load notification settings
  const loadSettings = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch('/api/notifications/settings', {
        credentials: 'include', // Include cookies for authentication
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
      } else {
        throw new Error(data.message || 'Ayarlar yüklenemedi');
      }
    } catch (err) {
      logger.error('Bildirim ayarları yüklenemedi:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    }
  }, [userId]);

  // Update notification settings
  const updateSettings = useCallback(
    async (newSettings: Partial<NotificationSettings>) => {
      if (!userId) return;

      try {
        const response = await fetch('/api/notifications/settings', {
          method: 'PATCH',
          credentials: 'include', // Include cookies for authentication
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newSettings),
        });

        const data = await response.json();

        if (data.success) {
          setSettings((prev) => (prev ? { ...prev, ...newSettings } : null));
        } else {
          throw new Error(data.message || 'Ayarlar güncellenemedi');
        }
      } catch (err) {
        logger.error('Bildirim ayarları güncellenemedi:', err);
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      }
    },
    [userId]
  );

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      const permission = await PushNotificationManager.requestPermission();

      if (permission !== 'granted') {
        throw new Error('Bildirim izni verilmedi');
      }

      const subscription = await PushNotificationManager.subscribe(userId);

      if (subscription) {
        // Send subscription to server
        const response = await fetch('/api/push/subscribe', {
          method: 'POST',
          credentials: 'include', // Include cookies for authentication
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription),
        });

        const data = await response.json();

        if (data.success) {
          return true;
        } else {
          throw new Error(data.message || 'Abonelik kaydedilemedi');
        }
      }

      return false;
    } catch (err) {
      logger.error('Push notification aboneliği başarısız:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Push notification aboneliği başarısız'
      );
      return false;
    }
  }, [userId]);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      const success = await PushNotificationManager.unsubscribe(userId);

      if (success) {
        // Notify server about unsubscription
        const response = await fetch('/api/push/unsubscribe', {
          method: 'DELETE',
          credentials: 'include', // Include cookies for authentication
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscriptionId: 'current-subscription-id',
          }),
        });

        const data = await response.json();
        return data.success;
      }

      return false;
    } catch (err) {
      logger.error('Push notification abonelikten çıkma başarısız:', err);
      setError(
        err instanceof Error ? err.message : 'Abonelikten çıkma başarısız'
      );
      return false;
    }
  }, [userId]);

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Bildirimi',
          message:
            'Bu bir test bildirimidir. Push notification sistemi çalışıyor!',
          icon: '/icons/notification-icon.png',
          badge: '/icons/badge-icon.png',
          url: window.location.origin,
          actions: [
            {
              action: 'view',
              title: 'Görüntüle',
            },
            {
              action: 'dismiss',
              title: 'Kapat',
            },
          ],
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Test bildirimi gönderilemedi');
      }
    } catch (err) {
      logger.error('Test bildirimi başarısız:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Test bildirimi gönderilirken hata oluştu'
      );
    }
  }, [userId]);

  // Load initial data
  useEffect(() => {
    if (userId) {
      loadNotifications();
      loadSettings();
    }
  }, [userId, loadNotifications, loadSettings]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    settings,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadSettings,
    updateSettings,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
  };
}
