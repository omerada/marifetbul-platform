/**
 * ================================================
 * NOTIFICATION WEBSOCKET SUBSCRIPTION
 * ================================================
 * Handles WebSocket subscriptions for real-time notifications
 *
 * Sprint 1 - WebSocket Integration (Migrated to canonical types)
 * Sprint 6 - Story 6.1: Batch notification support
 * @version 2.1.0
 */

import { getWebSocketService } from './WebSocketService';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  Notification,
  WebSocketNotificationPayload,
} from '@/types/domains/notification';
import type { NotificationBatchData } from '@/components/domains/notifications/BatchedNotificationItem';

export interface NotificationWebSocketCallbacks {
  onNotification: (notification: Notification) => void;
  onBatchNotification?: (batch: NotificationBatchData) => void; // Sprint 6 - Story 6.1
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
  logger.info('NotificationWebSocket', { userId });

  try {
    const ws = getWebSocketService();

    if (!ws) {
      const error = new Error('WebSocket service not initialized');
      logger.error('NotificationWebSocket', error instanceof Error ? error : new Error(String(error)));
      callbacks.onError?.(error);
      throw error;
    }

    // Subscribe to user-specific notification queue
    const topic = `/user/${userId}/queue/notifications`;

    const subscriptionId = ws.subscribe(topic, (message) => {
      try {
        const payload = message as WebSocketNotificationPayload | any;

        logger.debug('NotificationWebSocket', { payload });

        // Sprint 6 - Story 6.1: Check if this is a batch notification
        if (payload.type === 'BATCH' && payload.batchType) {
          // This is a batch notification from backend
          const batch: NotificationBatchData = {
            id: payload.id,
            batchType: payload.batchType,
            title: payload.title,
            message: payload.message || payload.content,
            itemCount: payload.itemCount || 0,
            items: [], // Backend doesn't send full items via WebSocket
            createdAt: payload.createdAt || new Date().toISOString(),
            sentAt: payload.sentAt,
          };

          logger.info('NotificationWebSocket: Batch notification received', {
            batchId: batch.id,
            batchType: batch.batchType,
            itemCount: batch.itemCount,
          });

          // Call batch callback if available
          if (callbacks.onBatchNotification) {
            callbacks.onBatchNotification(batch);
          } else {
            logger.warn(
              'NotificationWebSocket: Batch received but no handler registered'
            );
          }
          return;
        }

        // Regular notification processing
        const notification: Notification = {
          id: payload.notificationId,
          userId: userId,
          type: payload.type,
          title: payload.title,
          content: payload.content,
          actionUrl: payload.actionUrl,
          priority: payload.priority,
          isRead: false, // New notifications are always unread
          createdAt: new Date().toISOString(),
          relatedEntityType: payload.data?.relatedEntityType as
            | string
            | undefined,
          relatedEntityId: payload.data?.relatedEntityId as string | undefined,
          data: payload.data,
        };

        // Call the notification callback
        callbacks.onNotification(notification);

        logger.info('NotificationWebSocket', {
          notificationId: notification.id,
          type: notification.type,
        });
      } catch (error) {
        logger.error(
          'NotificationWebSocket: Error processing notification',
          error as Error
        );
        callbacks.onError?.(error as Error);
      }
    });

    logger.info('NotificationWebSocket', { topic, subscriptionId });

    // Return unsubscribe function
    return () => {
      logger.info('NotificationWebSocket', { action: 'Unsubscribing' });
      ws.unsubscribe(subscriptionId);
    };
  } catch (error) {
    logger.error('NotificationWebSocket: Failed to subscribe', error as Error);
    callbacks.onError?.(error);
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
  logger.info('NotificationWebSocket', { action: 'Subscribing to broadcast' });

  try {
    const ws = getWebSocketService();

    if (!ws) {
      const error = new Error('WebSocket service not initialized');
      logger.error('NotificationWebSocket', error instanceof Error ? error : new Error(String(error)));
      callbacks.onError?.(error);
      throw error;
    }

    const topic = '/topic/notifications';

    const subscriptionId = ws.subscribe(topic, (message) => {
      try {
        const payload = message as WebSocketNotificationPayload;

        logger.debug('NotificationWebSocket', { payload });

        const notification: Notification = {
          id: payload.notificationId,
          userId: '', // Broadcast notifications don't have specific user
          type: payload.type,
          title: payload.title,
          content: payload.content,
          actionUrl: payload.actionUrl,
          priority: payload.priority,
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedEntityType: payload.data
            ? String(payload.data.relatedEntityType || '')
            : undefined,
          relatedEntityId: payload.data
            ? String(payload.data.relatedEntityId || '')
            : undefined,
          data: payload.data,
        };

        callbacks.onNotification(notification);

        logger.info('NotificationWebSocket', {
          notificationId: notification.id,
        });
      } catch (error) {
        logger.error(
          'NotificationWebSocket: Error processing broadcast',
          error as Error
        );
        callbacks.onError?.(error);
      }
    });

    logger.info('NotificationWebSocket', { topic, subscriptionId });

    return () => {
      logger.info('NotificationWebSocket', {
        action: 'Unsubscribing from broadcast',
      });
      ws.unsubscribe(subscriptionId);
    };
  } catch (error) {
    logger.error(
      'NotificationWebSocket: Failed to subscribe to broadcast',
      error as Error
    );
    callbacks.onError?.(error);
    throw error;
  }
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
