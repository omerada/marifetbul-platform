'use client';

/**
 * ================================================
 * USE PUSH NOTIFICATIONS HOOK
 * ================================================
 * Production-ready hook for Firebase push notifications
 *
 * Features:
 * - Automatic token registration
 * - Permission management
 * - Foreground notification handling
 * - Device subscription status
 * - Testing utilities
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Production Ready
 * @since Sprint: Push Notification System
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isDeviceSubscribed,
  isPushNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  setupForegroundMessageListener,
  sendTestNotification as sendTestNotificationService,
  getDiagnostics,
} from '@/lib/infrastructure/services/push-notification.service';
import logger from '@/lib/infrastructure/monitoring/logger';
import { toast } from 'sonner';
import type { MessagePayload } from 'firebase/messaging';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UsePushNotificationsReturn {
  // State
  isSubscribed: boolean;
  isSupported: boolean;
  permission: NotificationPermission;
  isLoading: boolean;
  error: string | null;

  // Actions
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  requestPermission: () => Promise<NotificationPermission>;
  sendTestNotification: () => Promise<void>;
  refreshStatus: () => Promise<void>;

  // Diagnostics
  getDiagnosticInfo: () => Promise<unknown>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function usePushNotifications(): UsePushNotificationsReturn {
  // State
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported] = useState(() => isPushNotificationSupported());
  const [permission, setPermission] =
    useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Foreground listener cleanup
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // ============================================================================
  // PERMISSION MANAGEMENT
  // ============================================================================

  /**
   * Request notification permission
   */
  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (!isSupported) {
        toast.error('Tarayıcınız push bildirimleri desteklemiyor');
        return 'denied';
      }

      setIsLoading(true);
      setError(null);

      try {
        const newPermission = await requestNotificationPermission();
        setPermission(newPermission);

        if (newPermission === 'granted') {
          toast.success('Bildirim izni verildi');
        } else if (newPermission === 'denied') {
          toast.error('Bildirim izni reddedildi');
        }

        return newPermission;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'İzin isteği başarısız';
        setError(errorMessage);
        logger.error(
          'Permission request failed',
          err instanceof Error ? err : undefined
        );
        return 'denied';
      } finally {
        setIsLoading(false);
      }
    }, [isSupported]);

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  /**
   * Subscribe to push notifications
   */
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Push bildirimleri desteklenmiyor');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await subscribeToPushNotifications();

      if (result.success) {
        setIsSubscribed(true);
        logger.info('Successfully subscribed to push notifications', {
          deviceId: result.deviceId,
        });
        return true;
      } else {
        setError(result.error || 'Abonelik başarısız');
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Abonelik hatası';
      setError(errorMessage);
      logger.error('Subscribe failed', err instanceof Error ? err : undefined);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await unsubscribeFromPushNotifications();

      if (result.success) {
        setIsSubscribed(false);
        logger.info('Successfully unsubscribed from push notifications');
        return true;
      } else {
        setError(result.error || 'Abonelik iptali başarısız');
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Abonelik iptali hatası';
      setError(errorMessage);
      logger.error(
        'Unsubscribe failed',
        err instanceof Error ? err : undefined
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================================
  // STATUS MANAGEMENT
  // ============================================================================

  /**
   * Refresh subscription status
   */
  const refreshStatus = useCallback(async () => {
    if (!isSupported) {
      return;
    }

    try {
      const [subscribed, currentPermission] = await Promise.all([
        isDeviceSubscribed(),
        Promise.resolve(getNotificationPermission()),
      ]);

      setIsSubscribed(subscribed);
      setPermission(currentPermission);

      logger.debug('Push notification status refreshed', {
        isSubscribed: subscribed,
        permission: currentPermission,
      });
    } catch (err) {
      logger.error(
        'Failed to refresh status',
        err instanceof Error ? err : undefined
      );
    }
  }, [isSupported]);

  // ============================================================================
  // TESTING & DIAGNOSTICS
  // ============================================================================

  /**
   * Send test notification
   */
  const sendTestNotification = useCallback(async () => {
    if (!isSubscribed) {
      toast.error('Önce push bildirimlere abone olmalısınız');
      return;
    }

    setIsLoading(true);
    try {
      await sendTestNotificationService();
    } catch (err) {
      logger.error(
        'Test notification failed',
        err instanceof Error ? err : undefined
      );
    } finally {
      setIsLoading(false);
    }
  }, [isSubscribed]);

  /**
   * Get diagnostic information
   */
  const getDiagnosticInfo = useCallback(async () => {
    try {
      const diagnostics = await getDiagnostics();
      logger.info('Push notification diagnostics', diagnostics);
      return diagnostics;
    } catch (err) {
      logger.error(
        'Failed to get diagnostics',
        err instanceof Error ? err : undefined
      );
      return null;
    }
  }, []);

  // ============================================================================
  // FOREGROUND NOTIFICATION HANDLER
  // ============================================================================

  /**
   * Handle foreground notifications
   */
  const handleForegroundMessage = useCallback((payload: MessagePayload) => {
    logger.info('Foreground notification received in hook', {
      title: payload.notification?.title,
    });

    // Custom handling can be added here
    // The service already shows toast notifications
  }, []);

  // ============================================================================
  // LIFECYCLE & INITIALIZATION
  // ============================================================================

  /**
   * Initialize on mount
   */
  useEffect(() => {
    if (!isSupported) {
      logger.warn('Push notifications not supported');
      return;
    }

    // Initial status check
    refreshStatus();

    // Setup foreground listener if subscribed
    if (isSubscribed && !unsubscribeRef.current) {
      unsubscribeRef.current = setupForegroundMessageListener(
        handleForegroundMessage
      );
      logger.info('Foreground message listener initialized');
    }

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        logger.info('Foreground message listener cleaned up');
      }
    };
  }, [isSupported, isSubscribed, handleForegroundMessage, refreshStatus]);

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // State
    isSubscribed,
    isSupported,
    permission,
    isLoading,
    error,

    // Actions
    subscribe,
    unsubscribe,
    requestPermission,
    sendTestNotification,
    refreshStatus,

    // Diagnostics
    getDiagnosticInfo,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default usePushNotifications;
