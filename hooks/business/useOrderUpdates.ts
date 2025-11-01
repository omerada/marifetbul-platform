/**
 * ================================================
 * USE ORDER UPDATES HOOK - Real-time Order Updates
 * ================================================
 * React Hook for listening to real-time order status changes via WebSocket
 *
 * Features:
 * - Auto-subscribe to order-specific updates
 * - Type-safe event handling
 * - Toast notifications for status changes
 * - Automatic order data refresh
 * - Clean subscription management
 *
 * @version 1.0.0
 * @sprint Sprint 2 - Real-time Order Updates
 * @author MarifetBul Development Team
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useWebSocket } from '@/hooks/infrastructure/websocket/useWebSocket';
import { toast } from 'sonner';
import { logger } from '@/lib/shared/utils/logger';
import type {
  OrderWebSocketEventType,
  OrderWebSocketUpdate,
  OrderStatusChangedData,
  OrderDeliveredData,
  OrderAcceptedData,
  RevisionRequestedData,
  Order,
} from '@/types/business/features/order';

// ==================== TYPES ====================

export interface UseOrderUpdatesOptions {
  /** Order ID to listen for updates */
  orderId: string;
  /** Callback when order status changes */
  onStatusChange?: (order: Order) => void;
  /** Callback when order is delivered */
  onDelivered?: (data: OrderDeliveredData) => void;
  /** Callback when order is accepted */
  onAccepted?: (data: OrderAcceptedData) => void;
  /** Callback when revision is requested */
  onRevisionRequested?: (data: RevisionRequestedData) => void;
  /** Callback when order is completed */
  onCompleted?: (order: Order) => void;
  /** Callback when order is updated (any field) */
  onOrderUpdated?: (order: Order) => void;
  /** Enable toast notifications (default: true) */
  enableToast?: boolean;
  /** Custom toast messages */
  toastMessages?: Partial<Record<OrderWebSocketEventType, string>>;
}

export interface UseOrderUpdatesReturn {
  /** Is WebSocket connected */
  isConnected: boolean;
  /** Manually refresh order (triggers callbacks) */
  refresh: () => void;
}

// ==================== DEFAULT TOAST MESSAGES ====================

const DEFAULT_TOAST_MESSAGES: Record<OrderWebSocketEventType, string> = {
  ORDER_DELIVERED: '📦 Sipariş teslim edildi!',
  ORDER_ACCEPTED: '✅ Teslimat onaylandı!',
  ORDER_REVISION_REQUESTED: '🔄 Revizyon istendi',
  ORDER_COMPLETED: '🎉 Sipariş tamamlandı!',
  ORDER_STATUS_CHANGED: 'ℹ️ Sipariş durumu güncellendi',
  ORDER_UPDATED: 'ℹ️ Sipariş güncellendi',
  ORDER_CANCELED: '❌ Sipariş iptal edildi',
  ORDER_MESSAGE: '💬 Yeni mesaj',
};

// ==================== HOOK ====================

/**
 * useOrderUpdates Hook
 *
 * @example
 * ```tsx
 * const { isConnected } = useOrderUpdates({
 *   orderId: order.id,
 *   onStatusChange: (updatedOrder) => {
 *     setOrder(updatedOrder);
 *   },
 *   onDelivered: (data) => {
 *     logger.debug('Delivered with files:', data.attachments);
 *   },
 * });
 * ```
 */
export function useOrderUpdates(
  options: UseOrderUpdatesOptions
): UseOrderUpdatesReturn {
  const {
    orderId,
    onStatusChange,
    onDelivered,
    onAccepted,
    onRevisionRequested,
    onCompleted,
    onOrderUpdated,
    enableToast = true,
    toastMessages = {},
  } = options;

  const { isConnected, subscribe, unsubscribe } = useWebSocket({
    autoConnect: true,
    enableStoreIntegration: true,
  });

  // ==================== MESSAGE HANDLER ====================

  const handleOrderUpdate = useCallback(
    (message: unknown) => {
      try {
        const msg = message as { body: string };
        const update = JSON.parse(msg.body) as OrderWebSocketUpdate;

        logger.info('useOrderUpdates', 'Received order update', {
          orderId: update.orderId,
          type: update.type,
        });

        // Show toast notification if enabled
        if (enableToast) {
          const toastMessage =
            toastMessages[update.type] || DEFAULT_TOAST_MESSAGES[update.type];
          if (toastMessage) {
            toast.info(toastMessage, {
              description: update.message,
              duration: 5000,
            });
          }
        }

        // Handle specific event types
        switch (update.type) {
          case 'ORDER_STATUS_CHANGED': {
            const data = update.data as OrderStatusChangedData;
            logger.info('useOrderUpdates', 'Order status changed', {
              orderId: update.orderId,
              previousStatus: data.previousStatus,
              newStatus: data.newStatus,
            });
            onStatusChange?.(data.order);
            break;
          }

          case 'ORDER_DELIVERED': {
            const data = update.data as OrderDeliveredData;
            logger.info('useOrderUpdates', 'Order delivered', {
              orderId: update.orderId,
              deliveredBy: data.deliveredBy.name,
              attachmentCount: data.attachments.length,
            });
            onDelivered?.(data);
            break;
          }

          case 'ORDER_ACCEPTED': {
            const data = update.data as OrderAcceptedData;
            logger.info('useOrderUpdates', 'Order accepted', {
              orderId: update.orderId,
              acceptedBy: data.acceptedBy.name,
              paymentReleased: data.paymentReleased,
            });
            onAccepted?.(data);
            break;
          }

          case 'ORDER_REVISION_REQUESTED': {
            const data = update.data as RevisionRequestedData;
            logger.info('useOrderUpdates', 'Revision requested', {
              orderId: update.orderId,
              requestedBy: data.requestedBy.name,
              revisionCount: data.revisionCount,
            });
            onRevisionRequested?.(data);
            break;
          }

          case 'ORDER_COMPLETED': {
            const data = update.data as { order: Order };
            logger.info('useOrderUpdates', 'Order completed', {
              orderId: update.orderId,
            });
            onCompleted?.(data.order);
            onStatusChange?.(data.order);
            break;
          }

          case 'ORDER_UPDATED': {
            const data = update.data as { order: Order };
            logger.info('useOrderUpdates', 'Order updated', {
              orderId: update.orderId,
            });
            onOrderUpdated?.(data.order);
            break;
          }

          case 'ORDER_CANCELED': {
            const data = update.data as { order: Order };
            logger.info('useOrderUpdates', 'Order canceled', {
              orderId: update.orderId,
            });
            onStatusChange?.(data.order);
            break;
          }

          default:
            logger.warn('useOrderUpdates', 'Unknown order event type', {
              type: update.type,
            });
        }
      } catch (error) {
        logger.error('useOrderUpdates', 'Failed to handle order update', {
          error,
          message,
        });
      }
    },
    [
      enableToast,
      toastMessages,
      onStatusChange,
      onDelivered,
      onAccepted,
      onRevisionRequested,
      onCompleted,
      onOrderUpdated,
    ]
  );

  // ==================== SUBSCRIPTION ====================

  useEffect(() => {
    if (!isConnected || !orderId) {
      return;
    }

    logger.info('useOrderUpdates', 'Subscribing to order updates', {
      orderId,
    });

    // Subscribe to order-specific topic
    const orderTopic = `/topic/orders/${orderId}`;
    subscribe(orderTopic, handleOrderUpdate);

    // Also subscribe to user-specific queue for order updates
    const userQueueTopic = `/user/queue/orders/${orderId}`;
    subscribe(userQueueTopic, handleOrderUpdate);

    logger.info('useOrderUpdates', 'Subscribed to order topics', {
      orderId,
      topics: [orderTopic, userQueueTopic],
    });

    // Cleanup subscriptions on unmount or when orderId changes
    return () => {
      logger.info('useOrderUpdates', 'Unsubscribing from order updates', {
        orderId,
      });
      unsubscribe(orderTopic);
      unsubscribe(userQueueTopic);
    };
  }, [isConnected, orderId, subscribe, unsubscribe, handleOrderUpdate]);

  // ==================== MANUAL REFRESH ====================

  const refresh = useCallback(() => {
    logger.info('useOrderUpdates', 'Manual refresh requested', { orderId });
    // In a real implementation, this could trigger a REST API call
    // to fetch the latest order data
    // For now, it's a no-op as WebSocket handles real-time updates
  }, [orderId]);

  // ==================== RETURN ====================

  return {
    isConnected,
    refresh,
  };
}
