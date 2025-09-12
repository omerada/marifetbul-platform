import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Notification {
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
}

export interface NotificationPreferences {
  reviewNotifications: {
    newReview: boolean;
    reviewReply: boolean;
    ratingChange: boolean;
  };
  analyticsNotifications: {
    weeklyReport: boolean;
    performanceAlert: boolean;
    insightUpdate: boolean;
  };
  reputationNotifications: {
    scoreChange: boolean;
    badgeEarned: boolean;
    rankingUpdate: boolean;
  };
  securityNotifications: {
    securityAlert: boolean;
    verificationUpdate: boolean;
    suspiciousActivity: boolean;
  };
  deliveryMethods: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    sms: boolean;
  };
}

interface NotificationStore {
  // State
  notifications: Notification[];
  preferences: NotificationPreferences;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  lastFetch: string | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  pinNotification: (notificationId: string) => Promise<void>;
  unpinNotification: (notificationId: string) => Promise<void>;
  updatePreferences: (
    preferences: Partial<NotificationPreferences>
  ) => Promise<void>;
  createNotification: (
    notification: Omit<
      Notification,
      'id' | 'isRead' | 'isPinned' | 'createdAt' | 'updatedAt'
    >
  ) => Promise<void>;

  // Computed getters
  getUnreadNotifications: () => Notification[];
  getNotificationsByType: (type: Notification['type']) => Notification[];
  getPinnedNotifications: () => Notification[];
  getRecentNotifications: (limit?: number) => Notification[];
}

const defaultPreferences: NotificationPreferences = {
  reviewNotifications: {
    newReview: true,
    reviewReply: true,
    ratingChange: true,
  },
  analyticsNotifications: {
    weeklyReport: true,
    performanceAlert: true,
    insightUpdate: false,
  },
  reputationNotifications: {
    scoreChange: true,
    badgeEarned: true,
    rankingUpdate: false,
  },
  securityNotifications: {
    securityAlert: true,
    verificationUpdate: true,
    suspiciousActivity: true,
  },
  deliveryMethods: {
    email: true,
    push: true,
    inApp: true,
    sms: false,
  },
};

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      notifications: [],
      preferences: defaultPreferences,
      unreadCount: 0,
      isLoading: false,
      error: null,
      lastFetch: null,

      // Actions
      fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/notifications');
          if (!response.ok) {
            throw new Error('Failed to fetch notifications');
          }
          const data = await response.json();

          if (data.success) {
            const notifications = data.data.notifications;
            const unreadCount = notifications.filter(
              (n: Notification) => !n.isRead
            ).length;

            set({
              notifications,
              unreadCount,
              lastFetch: new Date().toISOString(),
              isLoading: false,
            });
          } else {
            throw new Error(data.error || 'Failed to fetch notifications');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      markAsRead: async (notificationId: string) => {
        try {
          const response = await fetch(`/api/notifications/${notificationId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isRead: true }),
          });

          if (!response.ok) {
            throw new Error('Failed to mark notification as read');
          }

          const data = await response.json();
          if (data.success) {
            set((state) => ({
              notifications: state.notifications.map((n) =>
                n.id === notificationId
                  ? { ...n, isRead: true, updatedAt: new Date().toISOString() }
                  : n
              ),
              unreadCount: Math.max(0, state.unreadCount - 1),
            }));
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },

      markAllAsRead: async () => {
        try {
          const response = await fetch('/api/notifications/mark-all-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!response.ok) {
            throw new Error('Failed to mark all notifications as read');
          }

          const data = await response.json();
          if (data.success) {
            set((state) => ({
              notifications: state.notifications.map((n) => ({
                ...n,
                isRead: true,
                updatedAt: new Date().toISOString(),
              })),
              unreadCount: 0,
            }));
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },

      deleteNotification: async (notificationId: string) => {
        try {
          const response = await fetch(`/api/notifications/${notificationId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete notification');
          }

          const data = await response.json();
          if (data.success) {
            set((state) => {
              const notification = state.notifications.find(
                (n) => n.id === notificationId
              );
              const unreadCountChange =
                notification && !notification.isRead ? 1 : 0;

              return {
                notifications: state.notifications.filter(
                  (n) => n.id !== notificationId
                ),
                unreadCount: Math.max(0, state.unreadCount - unreadCountChange),
              };
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },

      deleteAllRead: async () => {
        try {
          const response = await fetch('/api/notifications/delete-read', {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete read notifications');
          }

          const data = await response.json();
          if (data.success) {
            set((state) => ({
              notifications: state.notifications.filter((n) => !n.isRead),
            }));
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },

      pinNotification: async (notificationId: string) => {
        try {
          const response = await fetch(`/api/notifications/${notificationId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPinned: true }),
          });

          if (!response.ok) {
            throw new Error('Failed to pin notification');
          }

          const data = await response.json();
          if (data.success) {
            set((state) => ({
              notifications: state.notifications.map((n) =>
                n.id === notificationId
                  ? {
                      ...n,
                      isPinned: true,
                      updatedAt: new Date().toISOString(),
                    }
                  : n
              ),
            }));
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },

      unpinNotification: async (notificationId: string) => {
        try {
          const response = await fetch(`/api/notifications/${notificationId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPinned: false }),
          });

          if (!response.ok) {
            throw new Error('Failed to unpin notification');
          }

          const data = await response.json();
          if (data.success) {
            set((state) => ({
              notifications: state.notifications.map((n) =>
                n.id === notificationId
                  ? {
                      ...n,
                      isPinned: false,
                      updatedAt: new Date().toISOString(),
                    }
                  : n
              ),
            }));
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },

      updatePreferences: async (
        newPreferences: Partial<NotificationPreferences>
      ) => {
        try {
          const response = await fetch('/api/notifications/preferences', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPreferences),
          });

          if (!response.ok) {
            throw new Error('Failed to update notification preferences');
          }

          const data = await response.json();
          if (data.success) {
            set((state) => ({
              preferences: { ...state.preferences, ...newPreferences },
            }));
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },

      createNotification: async (notificationData) => {
        try {
          const response = await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notificationData),
          });

          if (!response.ok) {
            throw new Error('Failed to create notification');
          }

          const data = await response.json();
          if (data.success) {
            const newNotification = data.data;
            set((state) => ({
              notifications: [newNotification, ...state.notifications],
              unreadCount: state.unreadCount + 1,
            }));
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },

      // Computed getters
      getUnreadNotifications: () => {
        return get().notifications.filter((n) => !n.isRead);
      },

      getNotificationsByType: (type: Notification['type']) => {
        return get().notifications.filter((n) => n.type === type);
      },

      getPinnedNotifications: () => {
        return get().notifications.filter((n) => n.isPinned);
      },

      getRecentNotifications: (limit = 10) => {
        return get()
          .notifications.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, limit);
      },
    }),
    {
      name: 'notification-store',
    }
  )
);
