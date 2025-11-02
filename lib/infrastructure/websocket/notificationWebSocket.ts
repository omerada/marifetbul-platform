/**
 * ================================================
 * NOTIFICATION WEBSOCKET SUBSCRIPTION
 * ================================================
 * Handles WebSocket subscriptions for real-time notifications
 *
 * Sprint Day 2 - WebSocket Integration
 * @version 1.0.0
 */

import { getWebSocketService } from './WebSocketService';
import { logger } from '@/lib/shared/utils/logger';
import type { InAppNotification } from '@/types/business/features/notifications';

export interface NotificationWebSocketPayload {
  notificationId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  priority: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdAt: string;
}

export interface NotificationWebSocketCallbacks {
  onNotification: (notification: InAppNotification) => void;
  onError?: (error: Error) => void;
}

/**
 * Subscribe to user-specific notifications
 * Backend topic: /user/{userId}/queue/notifications
 */
export function subscribeToNotifications(
  userId: string,
  callbacks: NotificationWebSocketCallbacks
): () => void {
  logger.info('NotificationWebSocket', 'Subscribing to notifications', {
    userId,
  });

  try {
    const ws = getWebSocketService();

    if (!ws) {
      const error = new Error('WebSocket service not initialized');
      logger.error('NotificationWebSocket', error.message);
      callbacks.onError?.(error);
      throw error;
    }

    // Subscribe to user-specific notification queue
    const topic = `/user/${userId}/queue/notifications`;

    const subscriptionId = ws.subscribe(topic, (message) => {
      try {
        const payload = message as NotificationWebSocketPayload;

        logger.debug('NotificationWebSocket', 'Received notification', {
          payload,
        });

        // Transform payload to InAppNotification format
        const notification: InAppNotification = {
          id: payload.notificationId,
          userId: payload.userId,
          type: transformNotificationType(payload.type),
          title: payload.title,
          message: payload.message,
          actionUrl: payload.actionUrl,
          priority: transformPriority(payload.priority),
          isRead: false, // New notifications are always unread
          createdAt: payload.createdAt,
          data: payload.relatedEntityId
            ? {
                relatedEntityType: payload.relatedEntityType,
                relatedEntityId: payload.relatedEntityId,
              }
            : undefined,
        };

        // Call the notification callback
        callbacks.onNotification(notification);

        logger.info(
          'NotificationWebSocket',
          'Notification processed successfully',
          {
            notificationId: notification.id,
            type: notification.type,
          }
        );
      } catch (error) {
        logger.error('NotificationWebSocket', 'Error processing notification', {
          error,
        });
        callbacks.onError?.(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    });

    logger.info(
      'NotificationWebSocket',
      'Successfully subscribed to notifications',
      { topic, subscriptionId }
    );

    // Return unsubscribe function
    return () => {
      logger.info('NotificationWebSocket', 'Unsubscribing from notifications');
      ws.unsubscribe(subscriptionId);
    };
  } catch (error) {
    logger.error(
      'NotificationWebSocket',
      'Failed to subscribe to notifications',
      { error }
    );
    callbacks.onError?.(
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Subscribe to broadcast notifications
 * Backend topic: /topic/notifications
 */
export function subscribeToBroadcastNotifications(
  callbacks: NotificationWebSocketCallbacks
): () => void {
  logger.info(
    'NotificationWebSocket',
    'Subscribing to broadcast notifications'
  );

  try {
    const ws = getWebSocketService();

    if (!ws) {
      const error = new Error('WebSocket service not initialized');
      logger.error('NotificationWebSocket', error.message);
      callbacks.onError?.(error);
      throw error;
    }

    const topic = '/topic/notifications';

    const subscriptionId = ws.subscribe(topic, (message) => {
      try {
        const payload = message as NotificationWebSocketPayload;

        logger.debug(
          'NotificationWebSocket',
          'Received broadcast notification',
          { payload }
        );

        const notification: InAppNotification = {
          id: payload.notificationId,
          userId: payload.userId,
          type: transformNotificationType(payload.type),
          title: payload.title,
          message: payload.message,
          actionUrl: payload.actionUrl,
          priority: transformPriority(payload.priority),
          isRead: false,
          createdAt: payload.createdAt,
          data: payload.relatedEntityId
            ? {
                relatedEntityType: payload.relatedEntityType,
                relatedEntityId: payload.relatedEntityId,
              }
            : undefined,
        };

        callbacks.onNotification(notification);

        logger.info(
          'NotificationWebSocket',
          'Broadcast notification processed',
          {
            notificationId: notification.id,
          }
        );
      } catch (error) {
        logger.error(
          'NotificationWebSocket',
          'Error processing broadcast notification',
          { error }
        );
        callbacks.onError?.(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    });

    logger.info(
      'NotificationWebSocket',
      'Successfully subscribed to broadcast notifications',
      { topic, subscriptionId }
    );

    return () => {
      logger.info(
        'NotificationWebSocket',
        'Unsubscribing from broadcast notifications'
      );
      ws.unsubscribe(subscriptionId);
    };
  } catch (error) {
    logger.error(
      'NotificationWebSocket',
      'Failed to subscribe to broadcast notifications',
      { error }
    );
    callbacks.onError?.(
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Transform backend notification type to frontend format
 */
function transformNotificationType(type: string): InAppNotification['type'] {
  const typeMap: Record<string, InAppNotification['type']> = {
    NEW_MESSAGE: 'message_received',
    MESSAGE: 'message_received',
    NEW_ORDER: 'job_accepted',
    ORDER: 'job_accepted',
    ORDER_STATUS_CHANGED: 'job_completed',
    PAYMENT_RECEIVED: 'payment_received',
    PAYMENT: 'payment_received',
    REVIEW_RECEIVED: 'review_received',
    REVIEW: 'review_received',
    PROPOSAL_RECEIVED: 'job_application',
    PROPOSAL: 'job_application',
    JOB_APPLICATION: 'job_application',
    SYSTEM_ANNOUNCEMENT: 'system_update',
    SYSTEM: 'system_update',
    PROMOTION: 'promotion',
  };

  const normalized = type.toUpperCase();
  return typeMap[normalized] || 'system_update';
}

/**
 * Transform backend priority to frontend format
 */
function transformPriority(priority: string): InAppNotification['priority'] {
  const normalized = priority.toLowerCase();
  if (
    normalized === 'low' ||
    normalized === 'medium' ||
    normalized === 'high' ||
    normalized === 'urgent'
  ) {
    return normalized;
  }
  return 'medium'; // Default
}

/**
 * Check if WebSocket is connected
 */
export function isNotificationWebSocketConnected(): boolean {
  try {
    const ws = getWebSocketService();
    return ws?.isConnected() ?? false;
  } catch {
    return false;
  }
}

/**
 * Get WebSocket connection state
 */
export function getNotificationWebSocketState(): string {
  try {
    const ws = getWebSocketService();
    return ws?.getState() ?? 'DISCONNECTED';
  } catch {
    return 'DISCONNECTED';
  }
}
