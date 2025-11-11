import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { getWebSocketManager } from '@/lib/infrastructure/services';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  EnhancedNotification,
  NotificationCenterState,
  NotificationPreferences,
  NotificationFilters,
  NotificationError,
  PushSubscriptionData,
  NotificationBatch,
} from '@/types/domains/notification';

// Extended PushSubscriptionData for store
interface ExtendedPushSubscriptionData extends PushSubscriptionData {
  id?: string;
  userId?: string;
  deviceType?: 'mobile' | 'desktop';
  isActive?: boolean;
  failureCount?: number;
  updatedAt?: string;
}

interface NotificationState {
  // Notification data
  notifications: EnhancedNotification[];
  notificationCenter: NotificationCenterState | null;

  // Preferences
  preferences: NotificationPreferences | null;

  // Push notification data
  pushSubscription: ExtendedPushSubscriptionData | null;
  isPushSupported: boolean;
  pushPermission: NotificationPermission;

  // Batches and scheduling
  notificationBatches: NotificationBatch[];

  // Real-time updates
  isConnected: boolean;
  lastActivity: string | null;

  // Loading states
  isLoading: boolean;
  isFetchingNotifications: boolean;
  isFetchingPreferences: boolean;
  isUpdatingPreferences: boolean;
  isMarkingAsRead: boolean;
  isSubscribingToPush: boolean;

  // Error states
  error: NotificationError | null;
  lastError: string | null;

  // Filters and pagination
  filters: NotificationFilters;
  currentPage: number;
  totalPages: number;

  // UI states
  isNotificationPanelOpen: boolean;
  selectedNotification: EnhancedNotification | null;
  unreadCount: number;
}

interface NotificationActions {
  // Notification operations
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markAsUnread: (notificationIds: string[]) => Promise<void>;
  deleteNotifications: (notificationIds: string[]) => Promise<void>;
  archiveNotifications: (notificationIds: string[]) => Promise<void>;

  // Preferences operations
  fetchPreferences: () => Promise<void>;
  updatePreferences: (
    preferences: Partial<NotificationPreferences>
  ) => Promise<void>;

  // Push notification operations
  checkPushSupport: () => boolean;
  requestPushPermission: () => Promise<boolean>;
  subscribeToPush: () => Promise<PushSubscriptionData | null>;
  unsubscribeFromPush: () => Promise<void>;
  testPushNotification: () => Promise<void>;

  // Real-time operations
  startRealtimeConnection: () => void;
  stopRealtimeConnection: () => void;
  handleRealtimeNotification: (notification: EnhancedNotification) => void;

  // Filter and pagination
  setFilters: (filters: Partial<NotificationFilters>) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;

  // UI operations
  openNotificationPanel: () => void;
  closeNotificationPanel: () => void;
  selectNotification: (notification: EnhancedNotification | null) => void;

  // State management
  clearError: () => void;
  updateUnreadCount: () => void;
  reset: () => void;
}

type NotificationStore = NotificationState & NotificationActions;

const initialState: NotificationState = {
  // Notification data
  notifications: [],
  notificationCenter: null,

  // Preferences
  preferences: null,

  // Push notification data
  pushSubscription: null,
  isPushSupported: false,
  pushPermission: 'default',

  // Batches and scheduling
  notificationBatches: [],

  // Real-time updates
  isConnected: false,
  lastActivity: null,

  // Loading states
  isLoading: false,
  isFetchingNotifications: false,
  isFetchingPreferences: false,
  isUpdatingPreferences: false,
  isMarkingAsRead: false,
  isSubscribingToPush: false,

  // Error states
  error: null,
  lastError: null,

  // Filters and pagination
  filters: {},
  currentPage: 1,
  totalPages: 1,

  // UI states
  isNotificationPanelOpen: false,
  selectedNotification: null,
  unreadCount: 0,
};

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // Notification operations
      fetchNotifications: async (
        filters?: NotificationFilters
      ): Promise<void> => {
        set({ isFetchingNotifications: true, error: null });

        try {
          const queryParams = new URLSearchParams();
          const currentFilters = { ...get().filters, ...filters };

          // Build query parameters
          Object.entries(currentFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (Array.isArray(value)) {
                value.forEach((v) => queryParams.append(key, v.toString()));
              } else {
                queryParams.append(key, value.toString());
              }
            }
          });

          queryParams.append('page', get().currentPage.toString());

          const response = await fetch(
            `/api/v1/notifications?${queryParams.toString()}`
          );
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || 'Bildirimler alınamadı');
          }

          set({
            notificationCenter: result.data,
            notifications: result.data.notifications,
            filters: currentFilters,
            totalPages: result.data.pagination?.totalPages || 1,
            unreadCount: result.data.summary.unread,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Bildirimler yüklenemedi';
          set({ lastError: errorMessage });
        } finally {
          set({ isFetchingNotifications: false });
        }
      },

      markAsRead: async (notificationIds: string[]): Promise<void> => {
        set({ isMarkingAsRead: true });

        try {
          const response = await fetch('/api/v1/notifications/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationIds }),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(
              result.error || 'Bildirimler okundu olarak işaretlenemedi'
            );
          }

          // Update local state
          set((state) => ({
            notifications: state.notifications.map((notification) =>
              notificationIds.includes(notification.id)
                ? {
                    ...notification,
                    isRead: true,
                    readAt: new Date().toISOString(),
                  }
                : notification
            ),
          }));

          // Update unread count
          get().updateUnreadCount();
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Bildirimler işaretlenemedi';
          set({ lastError: errorMessage });
        } finally {
          set({ isMarkingAsRead: false });
        }
      },

      markAllAsRead: async (): Promise<void> => {
        set({ isMarkingAsRead: true });

        try {
          const response = await fetch('/api/v1/notifications/mark-all-read', {
            method: 'POST',
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(
              result.error || 'Tüm bildirimler okundu olarak işaretlenemedi'
            );
          }

          // Update local state
          set((state) => ({
            notifications: state.notifications.map((notification) => ({
              ...notification,
              isRead: true,
              readAt: new Date().toISOString(),
            })),
            unreadCount: 0,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Bildirimler işaretlenemedi';
          set({ lastError: errorMessage });
        } finally {
          set({ isMarkingAsRead: false });
        }
      },

      markAsUnread: async (notificationIds: string[]): Promise<void> => {
        set({ isLoading: true });

        try {
          const response = await fetch('/api/v1/notifications/mark-unread', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationIds }),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(
              result.error || 'Bildirimler okunmadı olarak işaretlenemedi'
            );
          }

          // Update local state
          set((state) => ({
            notifications: state.notifications.map((notification) =>
              notificationIds.includes(notification.id)
                ? { ...notification, isRead: false, readAt: undefined }
                : notification
            ),
          }));

          get().updateUnreadCount();
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Bildirimler işaretlenemedi';
          set({ lastError: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      deleteNotifications: async (notificationIds: string[]): Promise<void> => {
        set({ isLoading: true });

        try {
          const response = await fetch('/api/v1/notifications/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationIds }),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || 'Bildirimler silinemedi');
          }

          // Remove from local state
          set((state) => ({
            notifications: state.notifications.filter(
              (notification) => !notificationIds.includes(notification.id)
            ),
          }));

          get().updateUnreadCount();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Bildirimler silinemedi';
          set({ lastError: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      archiveNotifications: async (
        notificationIds: string[]
      ): Promise<void> => {
        set({ isLoading: true });

        try {
          const response = await fetch('/api/v1/notifications/archive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationIds }),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || 'Bildirimler arşivlenemedi');
          }

          // Remove from local state (archived notifications don't show in main list)
          set((state) => ({
            notifications: state.notifications.filter(
              (notification) => !notificationIds.includes(notification.id)
            ),
          }));

          get().updateUnreadCount();
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Bildirimler arşivlenemedi';
          set({ lastError: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      // Preferences operations
      fetchPreferences: async (): Promise<void> => {
        set({ isFetchingPreferences: true });

        try {
          const response = await fetch('/api/v1/notifications/preferences');
          const result = await response.json();

          if (result.success) {
            set({ preferences: result.data });
          } else {
            throw new Error(result.error || 'Bildirim tercihleri alınamadı');
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Bildirim tercihleri yüklenemedi';
          set({ lastError: errorMessage });
        } finally {
          set({ isFetchingPreferences: false });
        }
      },

      updatePreferences: async (
        preferences: Partial<NotificationPreferences>
      ): Promise<void> => {
        set({ isUpdatingPreferences: true });

        try {
          const response = await fetch('/api/v1/notifications/preferences', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(preferences),
          });

          const result = await response.json();

          if (result.success) {
            set((state) => ({
              preferences: {
                ...state.preferences,
                ...result.data,
              } as NotificationPreferences,
            }));
          } else {
            throw new Error(
              result.error || 'Bildirim tercihleri güncellenemedi'
            );
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Bildirim tercihleri güncellenemedi';
          set({ lastError: errorMessage });
        } finally {
          set({ isUpdatingPreferences: false });
        }
      },

      // Push notification operations
      checkPushSupport: (): boolean => {
        const isSupported =
          'serviceWorker' in navigator && 'PushManager' in window;
        set({ isPushSupported: isSupported });
        return isSupported;
      },

      requestPushPermission: async (): Promise<boolean> => {
        try {
          const permission = await Notification.requestPermission();
          set({ pushPermission: permission });
          return permission === 'granted';
        } catch {
          set({ lastError: 'Push notification izni alınamadı' });
          return false;
        }
      },

      subscribeToPush:
        async (): Promise<ExtendedPushSubscriptionData | null> => {
          set({ isSubscribingToPush: true });

          try {
            if (!get().isPushSupported) {
              throw new Error('Push notification desteklenmiyor');
            }

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            });

            const subscriptionData: Omit<
              ExtendedPushSubscriptionData,
              'id' | 'userId' | 'createdAt' | 'updatedAt'
            > = {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: btoa(
                  String.fromCharCode(
                    ...new Uint8Array(subscription.getKey('p256dh')!)
                  )
                ),
                auth: btoa(
                  String.fromCharCode(
                    ...new Uint8Array(subscription.getKey('auth')!)
                  )
                ),
              },
              userAgent: navigator.userAgent,
              deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
                ? 'mobile'
                : 'desktop',
              isActive: true,
              failureCount: 0,
            };

            // Send subscription to server
            const response = await fetch(
              '/api/v1/notifications/push/subscribe',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscriptionData),
              }
            );

            const result = await response.json();

            if (result.success) {
              set({ pushSubscription: result.data });
              return result.data;
            } else {
              throw new Error(
                result.error || 'Push notification aboneliği oluşturulamadı'
              );
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Push notification aboneliği başarısız';
            set({ lastError: errorMessage });
            return null;
          } finally {
            set({ isSubscribingToPush: false });
          }
        },

      unsubscribeFromPush: async (): Promise<void> => {
        set({ isLoading: true });

        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();

          if (subscription) {
            await subscription.unsubscribe();
          }

          // Remove subscription from server
          await fetch('/api/v1/notifications/push/unsubscribe', {
            method: 'POST',
          });

          set({ pushSubscription: null });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Push notification aboneliği iptal edilemedi';
          set({ lastError: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      testPushNotification: async (): Promise<void> => {
        try {
          const response = await fetch('/api/v1/notifications/push/test', {
            method: 'POST',
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || 'Test bildirimi gönderilemedi');
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Test bildirimi gönderilemedi';
          set({ lastError: errorMessage });
        }
      },

      // Real-time operations
      startRealtimeConnection: (): void => {
        try {
          const wsManager = getWebSocketManager();

          // Subscribe to notification events
          wsManager.on('notification', (data: unknown) => {
            get().handleRealtimeNotification(
              data as unknown as EnhancedNotification
            );
          });

          // Connect to WebSocket
          wsManager
            .connect()
            .then(() => {
              set({ isConnected: true });
            })
            .catch((error: unknown) => {
              logger.error(
                'Failed to establish real-time connection',
                error
              );
              set({ isConnected: false });
            });
        } catch (error) {
          logger.error(
            'Error starting real-time connection',
            error
          );
          set({ isConnected: false });
        }
      },

      stopRealtimeConnection: (): void => {
        try {
          const wsManager = getWebSocketManager();
          wsManager.disconnect();
          set({ isConnected: false });
        } catch (error) {
          logger.error(
            'Error stopping real-time connection',
            error
          );
        }
      },

      handleRealtimeNotification: (
        notification: EnhancedNotification
      ): void => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
          lastActivity: new Date().toISOString(),
        }));
      },

      // Filter and pagination
      setFilters: (filters: Partial<NotificationFilters>): void => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
          currentPage: 1, // Reset to first page when filters change
        }));
      },

      clearFilters: (): void => {
        set({ filters: {}, currentPage: 1 });
      },

      setPage: (page: number): void => {
        set({ currentPage: page });
      },

      // UI operations
      openNotificationPanel: (): void => {
        set({ isNotificationPanelOpen: true });
      },

      closeNotificationPanel: (): void => {
        set({ isNotificationPanelOpen: false, selectedNotification: null });
      },

      selectNotification: (notification: EnhancedNotification | null): void => {
        set({ selectedNotification: notification });

        // Mark as read when selected
        if (notification && !notification.isRead) {
          get().markAsRead([notification.id]);
        }
      },

      // State management
      clearError: (): void => {
        set({ error: null, lastError: null });
      },

      updateUnreadCount: (): void => {
        const unreadCount = get().notifications.filter((n) => !n.isRead).length;
        set({ unreadCount });
      },

      reset: (): void => {
        set(initialState);
      },
    })),
    {
      name: 'notification-store',
    }
  )
);

// ================================
// CLEANUP AND MEMORY MANAGEMENT
// ================================

// Track subscriptions for cleanup
const subscriptionCleanups: Array<() => void> = [];

// Subscribe to notification changes to update unread count with cleanup
const unsubscribeFromNotifications = useNotificationStore.subscribe(
  (state) => state.notifications,
  (notifications) => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    useNotificationStore.setState({ unreadCount });
  }
);

subscriptionCleanups.push(unsubscribeFromNotifications);

// Cleanup on page unload to prevent memory leaks
if (typeof window !== 'undefined') {
  const cleanup = () => {
    subscriptionCleanups.forEach((unsubscribe) => unsubscribe());

    // Stop WebSocket connections
    try {
      const store = useNotificationStore.getState();
      if (store.isConnected) {
        store.stopRealtimeConnection();
      }
    } catch (error) {
      logger.warn('Error during notification store cleanup', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  window.addEventListener('beforeunload', cleanup);

  // Also cleanup on visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cleanup();
    }
  });
}

// Selectors for easy access to computed values
export const useNotificationSelectors = () => {
  const store = useNotificationStore();

  return {
    // Computed values
    hasNotifications: store.notifications.length > 0,
    hasUnreadNotifications: store.unreadCount > 0,
    unreadNotificationsByCategory: store.notifications
      .filter((n) => !n.isRead)
      .reduce(
        (acc, notification) => {
          if (notification.category) {
            acc[notification.category] = (acc[notification.category] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>
      ),

    // Permission states
    canUsePush: store.isPushSupported && store.pushPermission === 'granted',
    needsPushPermission:
      store.isPushSupported && store.pushPermission === 'default',
    pushDenied: store.pushPermission === 'denied',

    // Loading states
    isAnyLoading:
      store.isLoading ||
      store.isFetchingNotifications ||
      store.isFetchingPreferences ||
      store.isUpdatingPreferences,

    // Error states
    hasError: !!store.error || !!store.lastError,
    errorMessage: store.error?.message || store.lastError,

    // Filters
    hasActiveFilters: Object.keys(store.filters).length > 0,

    // Pagination
    isFirstPage: store.currentPage === 1,
    isLastPage: store.currentPage >= store.totalPages,

    // Real-time status
    isRealTimeEnabled: store.isConnected,
    lastActivityTime: store.lastActivity,
  };
};
