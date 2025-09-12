import { useState, useEffect, useCallback } from 'react';
import { useNotificationStore } from '@/lib/store/notification';
import {
  EnhancedNotification,
  NotificationPreferences,
  NotificationFilters,
} from '@/types';
import {
  notificationPreferencesSchema,
  notificationFiltersSchema,
  quietHoursSchema,
} from '@/lib/validations/notification';
import { useToast } from '@/hooks/useToast';
import { ZodError } from 'zod';

type NotificationType =
  | 'order'
  | 'message'
  | 'payment'
  | 'system'
  | 'marketing'
  | 'security';
type NotificationChannel = 'browser' | 'email' | 'sms' | 'push';

interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
}

interface UseNotificationReturn {
  // State
  notifications: EnhancedNotification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  loading: boolean;
  error: string | null;

  // Notification operations
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
  deleteAllRead: () => Promise<boolean>;

  // Preferences management
  fetchPreferences: () => Promise<void>;
  updatePreferences: (
    preferences: Partial<NotificationPreferences>
  ) => Promise<boolean>;
  updateQuietHours: (quietHours: QuietHours) => Promise<boolean>;

  // Push notification management
  requestPermission: () => Promise<boolean>;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
  testPushNotification: () => Promise<boolean>;

  // Form helpers
  validatePreferences: (data: Record<string, unknown>) => {
    isValid: boolean;
    errors: Record<string, string>;
  };
  validateQuietHours: (data: Record<string, unknown>) => {
    isValid: boolean;
    errors: Record<string, string>;
  };

  // UI helpers
  formatNotificationTime: (timestamp: string) => string;
  getNotificationIcon: (type: NotificationType) => string;
  getNotificationColor: (type: NotificationType) => string;
  isNotificationMuted: (
    type: NotificationType,
    channel: NotificationChannel
  ) => boolean;

  // Filters and search
  applyFilters: (filters: NotificationFilters) => void;
  clearFilters: () => void;
  searchNotifications: (query: string) => EnhancedNotification[];

  // Permission helpers
  hasNotificationPermission: () => boolean;
  isPushSupported: () => boolean;
  isInQuietHours: () => boolean;
}

export const useNotification = (): UseNotificationReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showToast } = useToast();

  const {
    notifications,
    unreadCount,
    preferences,
    fetchNotifications: storeFetchNotifications,
    markAsRead: storeMarkAsRead,
    markAllAsRead: storeMarkAllAsRead,
    deleteNotifications: storeDeleteNotifications,
    fetchPreferences: storeFetchPreferences,
    updatePreferences: storeUpdatePreferences,
    subscribeToPush: storeSubscribeToPush,
    unsubscribeFromPush: storeUnsubscribeFromPush,
    testPushNotification: storeTestPushNotification,
    setFilters,
    clearFilters: storeClearFilters,
  } = useNotificationStore();

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleError = useCallback(
    (error: Error | unknown, defaultMessage: string) => {
      console.error('Notification operation error:', error);
      const message = error instanceof Error ? error.message : defaultMessage;
      setError(message);
      showToast(message, 'error');
    },
    [showToast]
  );

  const fetchNotifications = useCallback(
    async (filters?: NotificationFilters): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        await storeFetchNotifications(filters);
      } catch (error) {
        handleError(error, 'Bildirimler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    },
    [storeFetchNotifications, handleError]
  );

  const markAsRead = useCallback(
    async (notificationIds: string[]): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await storeMarkAsRead(notificationIds);
        return true;
      } catch (error) {
        handleError(
          error,
          'Bildirimler okundu olarak işaretlenirken bir hata oluştu'
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [storeMarkAsRead, handleError]
  );

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await storeMarkAllAsRead();
      showToast('Tüm bildirimler okundu olarak işaretlendi.', 'success');
      return true;
    } catch (error) {
      handleError(error, 'Bildirimler işaretlenirken bir hata oluştu');
      return false;
    } finally {
      setLoading(false);
    }
  }, [storeMarkAllAsRead, handleError, showToast]);

  const deleteNotification = useCallback(
    async (notificationId: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await storeDeleteNotifications([notificationId]);
        showToast('Bildirim silindi.', 'success');
        return true;
      } catch (error) {
        handleError(error, 'Bildirim silinirken bir hata oluştu');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [storeDeleteNotifications, handleError, showToast]
  );

  const deleteAllRead = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Get all read notification IDs
      const readNotificationIds = notifications
        .filter((notification) => notification.isRead)
        .map((notification) => notification.id);

      if (readNotificationIds.length === 0) {
        showToast('Silinecek okunmuş bildirim bulunamadı.', 'info');
        return true;
      }

      await storeDeleteNotifications(readNotificationIds);
      showToast('Okunan bildirimler silindi.', 'success');
      return true;
    } catch (error) {
      handleError(error, 'Bildirimler silinirken bir hata oluştu');
      return false;
    } finally {
      setLoading(false);
    }
  }, [storeDeleteNotifications, notifications, handleError, showToast]);

  const fetchPreferences = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await storeFetchPreferences();
    } catch (error) {
      handleError(error, 'Bildirim tercihleri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [storeFetchPreferences, handleError]);

  const updatePreferences = useCallback(
    async (
      newPreferences: Partial<NotificationPreferences>
    ): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await storeUpdatePreferences(newPreferences);
        showToast('Bildirim tercihleri güncellendi.', 'success');
        return true;
      } catch (error) {
        handleError(
          error,
          'Bildirim tercihleri güncellenirken bir hata oluştu'
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [storeUpdatePreferences, handleError, showToast]
  );

  const updateQuietHours = useCallback(
    async (quietHours: QuietHours): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        // Update preferences with new quiet hours including required fields
        const updatedQuietHours = {
          ...quietHours,
          timezone: preferences?.quietHours?.timezone || 'Europe/Istanbul',
          daysOfWeek: preferences?.quietHours?.daysOfWeek || [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
          ],
        };

        await storeUpdatePreferences({ quietHours: updatedQuietHours });
        showToast('Sessiz saatler güncellendi.', 'success');
        return true;
      } catch (error) {
        handleError(error, 'Sessiz saatler güncellenirken bir hata oluştu');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [storeUpdatePreferences, preferences, handleError, showToast]
  );

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (!('Notification' in window)) {
        throw new Error('Bu tarayıcı bildirim özelliğini desteklemiyor');
      }

      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        showToast('Bildirim izni verildi.', 'success');
        return true;
      } else {
        throw new Error('Bildirim izni reddedildi');
      }
    } catch (error) {
      handleError(error, 'Bildirim izni alınırken bir hata oluştu');
      return false;
    }
  }, [handleError, showToast]);

  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // First request permission
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        return false;
      }

      await storeSubscribeToPush();
      showToast('Push bildirimleri aktif edildi.', 'success');
      return true;
    } catch (error) {
      handleError(
        error,
        'Push bildirim aboneliği oluşturulurken bir hata oluştu'
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, [storeSubscribeToPush, requestPermission, handleError, showToast]);

  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await storeUnsubscribeFromPush();
      showToast('Push bildirimleri deaktif edildi.', 'success');
      return true;
    } catch (error) {
      handleError(
        error,
        'Push bildirim aboneliği iptal edilirken bir hata oluştu'
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, [storeUnsubscribeFromPush, handleError, showToast]);

  const testPushNotification = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await storeTestPushNotification();
      showToast('Test bildirimi gönderildi.', 'success');
      return true;
    } catch (error) {
      handleError(error, 'Test bildirimi gönderilirken bir hata oluştu');
      return false;
    } finally {
      setLoading(false);
    }
  }, [storeTestPushNotification, handleError, showToast]);

  const validatePreferences = useCallback(
    (
      data: Record<string, unknown>
    ): { isValid: boolean; errors: Record<string, string> } => {
      try {
        notificationPreferencesSchema.parse(data);
        return { isValid: true, errors: {} };
      } catch (error) {
        if (error instanceof ZodError) {
          const errors: Record<string, string> = {};
          error.issues.forEach((issue) => {
            const path = issue.path.join('.');
            errors[path] = issue.message;
          });
          return { isValid: false, errors };
        }
        return {
          isValid: false,
          errors: { general: 'Doğrulama hatası oluştu' },
        };
      }
    },
    []
  );

  const validateQuietHours = useCallback(
    (
      data: Record<string, unknown>
    ): { isValid: boolean; errors: Record<string, string> } => {
      try {
        quietHoursSchema.parse(data);
        return { isValid: true, errors: {} };
      } catch (error) {
        if (error instanceof ZodError) {
          const errors: Record<string, string> = {};
          error.issues.forEach((issue) => {
            const path = issue.path.join('.');
            errors[path] = issue.message;
          });
          return { isValid: false, errors };
        }
        return {
          isValid: false,
          errors: { general: 'Sessiz saatler doğrulama hatası' },
        };
      }
    },
    []
  );

  const formatNotificationTime = useCallback((timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;

    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    }).format(date);
  }, []);

  const getNotificationIcon = useCallback((type: NotificationType): string => {
    const typeIcons: Record<NotificationType, string> = {
      order: '📦',
      message: '💬',
      payment: '💳',
      system: '⚙️',
      marketing: '📢',
      security: '🔒',
    };
    return typeIcons[type] || '📢';
  }, []);

  const getNotificationColor = useCallback((type: NotificationType): string => {
    const typeColors: Record<NotificationType, string> = {
      order: 'text-blue-600 bg-blue-50',
      message: 'text-green-600 bg-green-50',
      payment: 'text-purple-600 bg-purple-50',
      system: 'text-gray-600 bg-gray-50',
      marketing: 'text-orange-600 bg-orange-50',
      security: 'text-red-600 bg-red-50',
    };
    return typeColors[type] || 'text-gray-600 bg-gray-50';
  }, []);

  const isNotificationMuted = useCallback(
    (type: NotificationType, channel: NotificationChannel): boolean => {
      if (!preferences) return false;

      // Check if the specific channel is enabled for the notification type
      switch (channel) {
        case 'browser':
          return (
            !preferences.browser.enabled ||
            !preferences.browser[type as keyof typeof preferences.browser]
          );
        case 'email':
          return (
            !preferences.email.enabled ||
            !preferences.email[type as keyof typeof preferences.email]
          );
        case 'sms':
          return !preferences.sms.enabled;
        case 'push':
          return (
            !preferences.push.enabled ||
            !preferences.push[type as keyof typeof preferences.push]
          );
        default:
          return false;
      }
    },
    [preferences]
  );

  const applyFilters = useCallback(
    (filters: NotificationFilters): void => {
      try {
        // Parse and validate filters
        const validFilters = notificationFiltersSchema.parse(
          filters
        ) as NotificationFilters;
        setFilters(validFilters);
        fetchNotifications(validFilters);
      } catch (error) {
        handleError(error, 'Filtre uygulanırken bir hata oluştu');
      }
    },
    [setFilters, fetchNotifications, handleError]
  );

  const clearFilters = useCallback((): void => {
    storeClearFilters();
    fetchNotifications();
  }, [storeClearFilters, fetchNotifications]);

  const searchNotifications = useCallback(
    (query: string): EnhancedNotification[] => {
      if (!query.trim()) return notifications;

      const lowerQuery = query.toLowerCase();
      return notifications.filter(
        (notification) =>
          notification.title.toLowerCase().includes(lowerQuery) ||
          notification.message.toLowerCase().includes(lowerQuery) ||
          notification.type.toLowerCase().includes(lowerQuery)
      );
    },
    [notifications]
  );

  const hasNotificationPermission = useCallback((): boolean => {
    return 'Notification' in window && Notification.permission === 'granted';
  }, []);

  const isPushSupported = useCallback((): boolean => {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }, []);

  const isInQuietHours = useCallback((): boolean => {
    if (!preferences?.quietHours?.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime =
      (parseInt(preferences.quietHours.start.replace(':', '')) * 60) / 100;
    const endTime =
      (parseInt(preferences.quietHours.end.replace(':', '')) * 60) / 100;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight quiet hours (e.g., 22:00 to 08:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }, [preferences]);

  return {
    // State
    notifications,
    unreadCount,
    preferences,
    loading,
    error,

    // Notification operations
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,

    // Preferences management
    fetchPreferences,
    updatePreferences,
    updateQuietHours,

    // Push notification management
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    testPushNotification,

    // Form helpers
    validatePreferences,
    validateQuietHours,

    // UI helpers
    formatNotificationTime,
    getNotificationIcon,
    getNotificationColor,
    isNotificationMuted,

    // Filters and search
    applyFilters,
    clearFilters,
    searchNotifications,

    // Permission helpers
    hasNotificationPermission,
    isPushSupported,
    isInQuietHours,
  };
};

export default useNotification;
