'use client';

/**
 * ================================================
 * BROWSER NOTIFICATIONS HOOK
 * ================================================
 * Manages browser/desktop notifications using the Notification API
 *
 * Features:
 * - Permission request & management
 * - Desktop notifications for moderation events
 * - Notification click handling (focus window/navigate)
 * - Fallback for unsupported browsers
 * - Notification preferences persistence
 *
 * Sprint 2 - Day 3 Story 3.2
 * @author MarifetBul Development Team
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';

// ==================== TYPES ====================

/**
 * Browser notification permission state
 */
export type NotificationPermission = 'default' | 'granted' | 'denied';

/**
 * Notification options
 */
export interface BrowserNotificationOptions {
  /** Notification title */
  title: string;
  /** Notification body */
  body?: string;
  /** Icon URL */
  icon?: string;
  /** Badge URL (for Android) */
  badge?: string;
  /** Tag to replace existing notifications */
  tag?: string;
  /** Data to attach to notification */
  data?: Record<string, unknown>;
  /** Require interaction (won't auto-close) */
  requireInteraction?: boolean;
  /** Silent notification */
  silent?: boolean;
  /** Vibration pattern (for mobile) */
  vibrate?: number[];
  /** URL to navigate on click */
  actionUrl?: string;
}

/**
 * Hook options
 */
export interface UseBrowserNotificationsOptions {
  /** Auto-request permission on mount (default: false) */
  autoRequestPermission?: boolean;
  /** Default icon for notifications */
  defaultIcon?: string;
  /** Default badge for notifications */
  defaultBadge?: string;
  /** Callback when notification is clicked */
  onNotificationClick?: (data?: Record<string, unknown>) => void;
  /** Callback when notification is closed */
  onNotificationClose?: () => void;
  /** Enable in development (default: true) */
  enableInDev?: boolean;
}

/**
 * Hook return type
 */
export interface UseBrowserNotificationsReturn {
  /** Current permission state */
  permission: NotificationPermission;
  /** Is permission granted */
  isGranted: boolean;
  /** Is permission denied */
  isDenied: boolean;
  /** Is API supported */
  isSupported: boolean;
  /** Request permission */
  requestPermission: () => Promise<NotificationPermission>;
  /** Show a notification */
  showNotification: (options: BrowserNotificationOptions) => Promise<void>;
  /** Clear all notifications with tag */
  clearNotifications: (tag?: string) => void;
}

// ==================== CONSTANTS ====================

const NOTIFICATION_DEFAULTS = {
  icon: '/icons/icon-192x192.png',
  badge: '/icons/icon-72x72.png',
  vibrate: [200, 100, 200],
};

// ==================== HOOK ====================

/**
 * useBrowserNotifications Hook
 *
 * Manage browser desktop notifications
 *
 * @example
 * ```tsx
 * const { isGranted, requestPermission, showNotification } = useBrowserNotifications({
 *   defaultIcon: '/logo.png',
 *   onNotificationClick: (data) => {
 *     router.push(data?.url as string);
 *   },
 * });
 *
 * // Request permission
 * await requestPermission();
 *
 * // Show notification
 * await showNotification({
 *   title: 'New Comment',
 *   body: 'You have a new comment to moderate',
 *   tag: 'moderation',
 *   actionUrl: '/admin/moderation',
 * });
 * ```
 */
export function useBrowserNotifications(
  options: UseBrowserNotificationsOptions = {}
): UseBrowserNotificationsReturn {
  const {
    autoRequestPermission = false,
    defaultIcon = NOTIFICATION_DEFAULTS.icon,
    defaultBadge = NOTIFICATION_DEFAULTS.badge,
    onNotificationClick,
    onNotificationClose,
    enableInDev = true,
  } = options;

  const [permission, setPermission] =
    useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const activeNotificationsRef = useRef<Map<string, Notification>>(new Map());

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    // Check if Notification API is supported
    if (typeof window === 'undefined' || !('Notification' in window)) {
      logger.warn('useBrowserNotifications', 'Notification API not supported');
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    // Get current permission
    const currentPermission = Notification.permission;
    setPermission(currentPermission as NotificationPermission);

    logger.info('useBrowserNotifications', {
      permission: currentPermission,
      supported: true,
    });

    // Auto-request permission if enabled
    if (
      autoRequestPermission &&
      currentPermission === 'default' &&
      (process.env.NODE_ENV === 'production' || enableInDev)
    ) {
      Notification.requestPermission().then((result) => {
        setPermission(result as NotificationPermission);
        logger.info('useBrowserNotifications', { result });
      });
    }
  }, [autoRequestPermission, enableInDev]);

  // ==================== CLEANUP ====================

  useEffect(() => {
    const notificationsMap = activeNotificationsRef.current;
    return () => {
      // Close all active notifications on unmount
      notificationsMap.forEach((notification) => {
        notification.close();
      });
      notificationsMap.clear();
    };
  }, []);

  // ==================== PERMISSION ====================

  /**
   * Request notification permission
   */
  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (!isSupported) {
        logger.warn(
          'useBrowserNotifications',
          'Cannot request permission: API not supported'
        );
        return 'denied';
      }

      if (permission === 'granted') {
        logger.debug('useBrowserNotifications', 'Permission already granted');
        return 'granted';
      }

      if (permission === 'denied') {
        logger.warn(
          'useBrowserNotifications',
          'Permission already denied by user'
        );
        return 'denied';
      }

      try {
        const result = await Notification.requestPermission();
        setPermission(result as NotificationPermission);

        logger.info('useBrowserNotifications', { result });

        return result as NotificationPermission;
      } catch (error) {
        logger.error(
          'useBrowserNotifications: Failed to request permission',
          undefined,
          { error }
        );
        return 'denied';
      }
    }, [isSupported, permission]);

  // ==================== SHOW NOTIFICATION ====================

  /**
   * Show a browser notification
   */
  const showNotification = useCallback(
    async (opts: BrowserNotificationOptions): Promise<void> => {
      // Check support
      if (!isSupported) {
        logger.warn(
          'useBrowserNotifications',
          'Cannot show notification: API not supported'
        );
        return;
      }

      // Check permission
      if (permission !== 'granted') {
        logger.warn('useBrowserNotifications', { permission });
        return;
      }

      // Skip in development unless enabled
      if (process.env.NODE_ENV === 'development' && !enableInDev) {
        logger.debug('useBrowserNotifications', { opts });
        return;
      }

      try {
        // Create notification options
        const notificationOptions: NotificationOptions = {
          body: opts.body,
          icon: opts.icon || defaultIcon,
          badge: opts.badge || defaultBadge,
          tag: opts.tag,
          data: opts.data,
          requireInteraction: opts.requireInteraction ?? false,
          silent: opts.silent ?? false,
        };

        // Add vibrate only if supported (TypeScript doesn't include it in types but it exists)
        if (opts.vibrate) {
          (notificationOptions as Record<string, unknown>).vibrate =
            opts.vibrate;
        } else {
          (notificationOptions as Record<string, unknown>).vibrate =
            NOTIFICATION_DEFAULTS.vibrate;
        }

        // Create notification
        const notification = new Notification(opts.title, notificationOptions);

        // Store reference
        const key = opts.tag || `notification_${Date.now()}`;
        activeNotificationsRef.current.set(key, notification);

        // Handle click
        notification.onclick = (event) => {
          event.preventDefault();
          logger.info('useBrowserNotifications', { tagoptstag, dataoptsdata });

          // Focus window
          if (typeof window !== 'undefined') {
            window.focus();
          }

          // Navigate to action URL
          if (opts.actionUrl && typeof window !== 'undefined') {
            window.location.href = opts.actionUrl;
          }

          // Custom callback
          onNotificationClick?.(opts.data);

          // Close notification
          notification.close();
        };

        // Handle close
        notification.onclose = () => {
          logger.debug('useBrowserNotifications', { tagoptstag });
          activeNotificationsRef.current.delete(key);
          onNotificationClose?.();
        };

        // Handle error
        notification.onerror = (error) => {
          logger.error(
            'useBrowserNotifications: Notification error',
            undefined,
            {
              error,
              tag: opts.tag,
            }
          );
          activeNotificationsRef.current.delete(key);
        };

        logger.info('useBrowserNotifications', { titleoptstitle, tagoptstag });
      } catch (error) {
        logger.error(
          'useBrowserNotifications: Failed to show notification',
          undefined,
          {
            error,
            options: opts,
          }
        );
      }
    },
    [
      isSupported,
      permission,
      enableInDev,
      defaultIcon,
      defaultBadge,
      onNotificationClick,
      onNotificationClose,
    ]
  );

  // ==================== CLEAR NOTIFICATIONS ====================

  /**
   * Clear notifications by tag
   */
  const clearNotifications = useCallback((tag?: string) => {
    if (tag) {
      // Clear specific tag
      const notification = activeNotificationsRef.current.get(tag);
      if (notification) {
        notification.close();
        activeNotificationsRef.current.delete(tag);
        logger.debug('useBrowserNotifications', { tag });
      }
    } else {
      // Clear all
      activeNotificationsRef.current.forEach((notification, key) => {
        notification.close();
        activeNotificationsRef.current.delete(key);
      });
      logger.debug('useBrowserNotifications', 'All notifications cleared');
    }
  }, []);

  // ==================== RETURN ====================

  return {
    permission,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    isSupported,
    requestPermission,
    showNotification,
    clearNotifications,
  };
}

export default useBrowserNotifications;
