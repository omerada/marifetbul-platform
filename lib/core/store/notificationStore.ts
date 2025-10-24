'use client';

import { create } from 'zustand';
import type { MessageNotification } from '@/hooks/business/messaging';

interface NotificationState {
  notifications: MessageNotification[];
  unreadCount: number;
  addNotification: (notification: MessageNotification) => void;
  removeNotification: (conversationId: string) => void;
  clearNotifications: () => void;
  setUnreadCount: (count: number) => void;
}

/**
 * Zustand store for managing in-app notifications.
 * Separate from browser notifications - tracks notification history.
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications.slice(0, 19)], // Keep last 20
      unreadCount: notification.unreadCount,
    })),

  removeNotification: (conversationId) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (n) => n.conversationId !== conversationId
      ),
    })),

  clearNotifications: () =>
    set({
      notifications: [],
    }),

  setUnreadCount: (count) =>
    set({
      unreadCount: count,
    }),
}));
