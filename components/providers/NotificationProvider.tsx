'use client';

/**
 * ================================================
 * NOTIFICATION PROVIDER
 * ================================================
 * Firebase Cloud Messaging Provider Component
 *
 * Features:
 * - Automatic Firebase initialization
 * - Token subscription on user authentication
 * - Foreground message handler
 * - Permission state management
 * - Error handling with Sentry
 * - User-friendly toast notifications
 *
 * Sprint: Push Notification System - Phase 1
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 12, 2025
 */

import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  setupForegroundMessageListener,
  isPushNotificationSupported,
  getNotificationPermission,
} from '@/lib/infrastructure/services/push-notification.service';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { MessagePayload } from 'firebase/messaging';

// ============================================================================
// TYPES
// ============================================================================

export interface NotificationProviderProps {
  children: React.ReactNode;
  /** Auto-subscribe on mount (default: false, manual via modal) */
  autoSubscribe?: boolean;
  /** Show console logs in development */
  verbose?: boolean;
}

interface NotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  hasPromptedUser: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function NotificationProvider({
  children,
  autoSubscribe = false,
  verbose = false,
}: NotificationProviderProps) {
  // ==================== STATE ====================

  const { user, isAuthenticated } = useAuthStore();
  const [state, setState] = useState<NotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    hasPromptedUser: false,
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isInitializedRef = useRef(false);

  // ==================== EFFECTS ====================

  /**
   * Initialize notification support check
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const supported = isPushNotificationSupported();
    const permission = getNotificationPermission();

    setState((prev) => ({
      ...prev,
      isSupported: supported,
      permission,
    }));

    if (verbose) {
      logger.info('Notification support check', { supported, permission });
    }
  }, [verbose]);

  /**
   * Handle user authentication and subscription
   */
  useEffect(() => {
    // Skip if not authenticated or already initialized
    if (!isAuthenticated || !user || isInitializedRef.current) {
      return;
    }

    // Skip if notifications not supported
    if (!state.isSupported) {
      if (verbose) {
        logger.warn('Push notifications not supported in this browser');
      }
      return;
    }

    // Mark as initialized early to prevent re-runs
    isInitializedRef.current = true;

    // Auto-subscribe if enabled and permission granted
    if (autoSubscribe && state.permission === 'granted') {
      handleSubscribe();
    }

    // Setup foreground message listener
    setupForegroundListener();

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      isInitializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    user?.id, // Only depend on user ID, not entire user object
    state.isSupported,
    state.permission,
    autoSubscribe,
  ]);

  // ==================== HANDLERS ====================

  /**
   * Subscribe to push notifications
   */
  const handleSubscribe = async () => {
    try {
      if (verbose) {
        logger.info('Attempting to subscribe to push notifications');
      }

      const result = await subscribeToPushNotifications();

      if (result.success) {
        setState((prev) => ({ ...prev, isSubscribed: true }));

        toast.success('Bildirimler aktif edildi!', {
          description: 'Artık önemli güncellemelerden haberdar olacaksınız.',
        });

        if (verbose) {
          logger.info('Successfully subscribed to push notifications', {
            deviceId: result.deviceId,
          });
        }
      } else {
        throw new Error(result.error || 'Subscription failed');
      }
    } catch (error) {
      logger.error('Push notification subscription failed', error as Error);

      toast.error('Bildirim ayarı başarısız', {
        description:
          'Bildirimler şu anda aktif edilemedi. Lütfen tarayıcı ayarlarınızı kontrol edin.',
      });

      setState((prev) => ({ ...prev, isSubscribed: false }));
    }
  };

  /**
   * Unsubscribe from push notifications
   * Reserved for future use (settings page)
   */
  const _handleUnsubscribe = async () => {
    try {
      await unsubscribeFromPushNotifications();

      setState((prev) => ({ ...prev, isSubscribed: false }));

      toast.info('Bildirimler kapatıldı', {
        description: 'Artık push bildirimleri almayacaksınız.',
      });

      if (verbose) {
        logger.info('Successfully unsubscribed from push notifications');
      }
    } catch (error) {
      logger.error('Push notification unsubscribe failed', error as Error);
    }
  };

  /**
   * Setup foreground message listener
   */
  const setupForegroundListener = () => {
    const unsubscribe = setupForegroundMessageListener(
      (payload: MessagePayload) => {
        if (verbose) {
          logger.info('Foreground notification received', {
            title: payload.notification?.title,
            body: payload.notification?.body,
          });
        }

        // Extract notification data
        const title = payload.notification?.title || 'MarifetBul';
        const body = payload.notification?.body || 'Yeni bir bildiriminiz var';
        const data = payload.data;

        // Show toast notification
        toast(title, {
          description: body,
          action: data?.url
            ? {
                label: 'Görüntüle',
                onClick: () => {
                  window.location.href = data.url;
                },
              }
            : undefined,
          duration: 5000,
        });
      }
    );

    unsubscribeRef.current = unsubscribe;
  };

  // ==================== CONTEXT VALUE ====================

  // We can expose these via context if needed in the future
  // For now, provider just handles automatic subscription

  // ==================== RENDER ====================

  return <>{children}</>;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default NotificationProvider;
