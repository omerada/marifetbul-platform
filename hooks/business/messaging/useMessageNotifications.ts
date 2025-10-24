'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { logger } from '@/lib/shared/utils/logger';

export interface MessageNotification {
  type: string;
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  messagePreview: string;
  timestamp: string;
  contextType?: string;
  contextId?: string;
  hasAttachment: boolean;
  unreadCount: number;
}

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

export interface UseNotificationOptions {
  /**
   * Whether to request permission automatically on mount
   */
  autoRequestPermission?: boolean;

  /**
   * Whether to show browser notifications
   */
  enableBrowserNotifications?: boolean;

  /**
   * Whether to show in-app toast notifications
   */
  enableToastNotifications?: boolean;

  /**
   * Callback when a notification is clicked
   */
  onNotificationClick?: (notification: MessageNotification) => void;

  /**
   * Callback when a new notification is received
   */
  onNotificationReceived?: (notification: MessageNotification) => void;
}

/**
 * Hook for managing message notifications.
 * Handles browser notification permissions and in-app notifications.
 */
export function useMessageNotifications(options: UseNotificationOptions = {}) {
  const {
    autoRequestPermission = false,
    enableBrowserNotifications = true,
    onNotificationClick,
    onNotificationReceived,
  } = options;

  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    prompt: true,
  });

  const [notifications, setNotifications] = useState<MessageNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const activeNotifications = useRef<Map<string, Notification>>(new Map());

  /**
   * Update permission state from browser
   */
  const updatePermissionState = useCallback(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    const browserPermission = Notification.permission;
    setPermission({
      granted: browserPermission === 'granted',
      denied: browserPermission === 'denied',
      prompt: browserPermission === 'default',
    });
  }, []);

  /**
   * Request browser notification permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      logger.warn('Browser notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      logger.warn('Notification permission denied');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      updatePermissionState();

      if (result === 'granted') {
        logger.info('Notification permission granted');
        return true;
      } else {
        logger.warn('Notification permission denied by user');
        return false;
      }
    } catch (error) {
      logger.error('Error requesting notification permission:', error);
      return false;
    }
  }, [updatePermissionState]);

  // Check initial permission state
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      logger.warn('Browser notifications not supported');
      return;
    }

    updatePermissionState();

    if (autoRequestPermission && Notification.permission === 'default') {
      requestPermission();
    }
  }, [autoRequestPermission, updatePermissionState, requestPermission]);

  /**
   * Show a browser notification
   */
  const showBrowserNotification = useCallback(
    (notification: MessageNotification) => {
      if (
        !enableBrowserNotifications ||
        !permission.granted ||
        typeof window === 'undefined'
      ) {
        return;
      }

      try {
        const options: NotificationOptions = {
          body: notification.messagePreview,
          icon: notification.senderAvatar || '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: notification.conversationId,
          requireInteraction: false,
          silent: false,
          data: notification,
        };

        // Close previous notification for this conversation
        const existingNotification = activeNotifications.current.get(
          notification.conversationId
        );
        if (existingNotification) {
          existingNotification.close();
        }

        const browserNotification = new Notification(
          `${notification.senderName}`,
          options
        );

        // Store notification reference
        activeNotifications.current.set(
          notification.conversationId,
          browserNotification
        );

        // Handle click
        browserNotification.onclick = () => {
          window.focus();
          onNotificationClick?.(notification);
          browserNotification.close();
        };

        // Clean up on close
        browserNotification.onclose = () => {
          activeNotifications.current.delete(notification.conversationId);
        };

        // Auto-close after 5 seconds
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      } catch (error) {
        logger.error('Error showing browser notification:', error);
      }
    },
    [enableBrowserNotifications, permission.granted, onNotificationClick]
  );

  /**
   * Handle incoming notification
   */
  const handleNotification = useCallback(
    (notification: MessageNotification) => {
      logger.debug('Received notification:', notification);

      // Add to notifications list
      setNotifications((prev) => [notification, ...prev.slice(0, 9)]);

      // Update unread count
      setUnreadCount(notification.unreadCount);

      // Show browser notification
      if (enableBrowserNotifications && permission.granted) {
        showBrowserNotification(notification);
      }

      // Callback
      onNotificationReceived?.(notification);
    },
    [
      enableBrowserNotifications,
      permission.granted,
      showBrowserNotification,
      onNotificationReceived,
    ]
  );

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);

    // Close all browser notifications
    activeNotifications.current.forEach((notification) => {
      notification.close();
    });
    activeNotifications.current.clear();
  }, []);

  /**
   * Remove a specific notification
   */
  const removeNotification = useCallback((conversationId: string) => {
    setNotifications((prev) =>
      prev.filter((n) => n.conversationId !== conversationId)
    );

    // Close browser notification if exists
    const notification = activeNotifications.current.get(conversationId);
    if (notification) {
      notification.close();
      activeNotifications.current.delete(conversationId);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const notificationsRef = activeNotifications.current;
    return () => {
      notificationsRef.forEach((notification) => {
        notification.close();
      });
      notificationsRef.clear();
    };
  }, []);

  return {
    permission,
    requestPermission,
    notifications,
    unreadCount,
    setUnreadCount,
    handleNotification,
    clearNotifications,
    removeNotification,
    showBrowserNotification,
  };
}
