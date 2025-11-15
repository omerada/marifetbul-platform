'use client';

/**
 * ================================================
 * USE MILESTONE WEBSOCKET HOOK
 * ================================================
 * Real-time milestone updates via WebSocket
 *
 * Features:
 * - Subscribe to milestone-specific events
 * - Auto-revalidate SWR cache on updates
 * - Handle connection/reconnection
 * - Missed message sync after reconnect
 * - Toast notifications for events
 *
 * Sprint: Sprint 1 - Milestone Payment System
 * Story: 1.8 - WebSocket Integration (5 pts)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useEffect, useCallback, useRef } from 'react';
import { mutate } from 'swr';
import { toast } from 'sonner';
import { WebSocketState } from '@/lib/infrastructure/websocket/WebSocketService';
import { useWebSocket } from '@/hooks/infrastructure/websocket/useWebSocket';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  MilestoneWebSocketUpdate,
  MilestoneDeliveredData,
  MilestoneAcceptedData,
  OrderMilestone,
} from '@/types/business/features/milestone';

// ============================================================================
// TYPES
// ============================================================================

export interface UseMilestoneWebSocketOptions {
  /** Order ID to subscribe to */
  orderId?: string;
  /** Enable auto-revalidation of SWR cache */
  autoRevalidate?: boolean;
  /** Enable toast notifications */
  showToasts?: boolean;
  /** Custom event handlers */
  onMilestoneDelivered?: (data: MilestoneDeliveredData) => void;
  onMilestoneAccepted?: (data: MilestoneAcceptedData) => void;
  onMilestoneRevisionRequested?: (data: OrderMilestone) => void;
  onMilestoneStatusChanged?: (data: OrderMilestone) => void;
}

export interface UseMilestoneWebSocketReturn {
  /** WebSocket connection status */
  isConnected: boolean;
  /** Reconnection in progress */
  isReconnecting: boolean;
  /** Subscribe to specific milestone events */
  subscribeToMilestone: (milestoneId: string) => () => void;
  /** Subscribe to all milestones in an order */
  subscribeToOrderMilestones: (orderId: string) => () => void;
  /** Manually sync missed messages after reconnect */
  syncMissedMessages: () => Promise<void>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MILESTONE_TOPIC_PREFIX = '/topic/milestones';
const ORDER_MILESTONE_TOPIC_PREFIX = '/topic/orders';

// ============================================================================
// HOOK
// ============================================================================

export function useMilestoneWebSocket(
  options: UseMilestoneWebSocketOptions = {}
): UseMilestoneWebSocketReturn {
  const {
    orderId,
    autoRevalidate = true,
    showToasts = true,
    onMilestoneDelivered,
    onMilestoneAccepted,
    onMilestoneRevisionRequested,
    onMilestoneStatusChanged,
  } = options;

  // ========== WEBSOCKET CONNECTION ==========

  const { state, subscribe, unsubscribe } = useWebSocket({
    onConnect: () => {
      logger.info('[useMilestoneWebSocket] Connected to WebSocket');
      // Sync missed messages after reconnect
      if (lastDisconnectTime.current) {
        const downtime = Date.now() - lastDisconnectTime.current;
        if (downtime > 5000) {
          // If offline > 5 seconds, sync
          syncMissedMessages();
        }
        lastDisconnectTime.current = null;
      }
    },
    onDisconnect: () => {
      logger.warn('[useMilestoneWebSocket] Disconnected from WebSocket');
      lastDisconnectTime.current = Date.now();
    },
    onError: (error) => {
      logger.error(
        '[useMilestoneWebSocket] WebSocket error',
        error instanceof Error ? error : new Error(String(error))
      );
    },
  });

  const isConnected = state === WebSocketState.CONNECTED;
  const isReconnecting = state === WebSocketState.RECONNECTING;

  // Track disconnection time for missed message sync
  const lastDisconnectTime = useRef<number | null>(null);

  // ========== REVALIDATION HELPERS ==========

  const revalidateMilestone = useCallback(
    (milestoneId: string, orderId: string) => {
      if (!autoRevalidate) return;

      logger.info('[useMilestoneWebSocket] Revalidating milestone data', {
        milestoneId,
        orderId,
      });

      // Revalidate specific milestone
      mutate(`/api/v1/milestones/${milestoneId}`);

      // Revalidate order milestones list
      mutate(`/api/v1/orders/${orderId}/milestones`);

      // Revalidate order details (for stats update)
      mutate(`/api/v1/orders/${orderId}`);
    },
    [autoRevalidate]
  );

  // ========== EVENT HANDLERS ==========

  const handleMilestoneDelivered = useCallback(
    (update: MilestoneWebSocketUpdate<MilestoneDeliveredData>) => {
      logger.info('[useMilestoneWebSocket] Milestone delivered');

      const { milestoneId, orderId, data } = update;

      // Revalidate cache
      revalidateMilestone(milestoneId, orderId);

      // Show toast
      if (showToasts) {
        toast.success('Milestone Teslim Edildi', {
          description: `${data.deliveredBy.name} milestone'ı teslim etti`,
        });
      }

      // Custom handler
      onMilestoneDelivered?.(data);
    },
    [revalidateMilestone, showToasts, onMilestoneDelivered]
  );

  const handleMilestoneAccepted = useCallback(
    (update: MilestoneWebSocketUpdate<MilestoneAcceptedData>) => {
      logger.info('[useMilestoneWebSocket] Milestone accepted');

      const { milestoneId, orderId, data } = update;

      // Revalidate cache
      revalidateMilestone(milestoneId, orderId);

      // Show toast
      if (showToasts) {
        toast.success('Milestone Onaylandı', {
          description: `${data.acceptedBy.name} ödemeyi serbest bıraktı`,
        });
      }

      // Custom handler
      onMilestoneAccepted?.(data);
    },
    [revalidateMilestone, showToasts, onMilestoneAccepted]
  );

  const handleMilestoneRevisionRequested = useCallback(
    (update: MilestoneWebSocketUpdate<OrderMilestone>) => {
      logger.info('[useMilestoneWebSocket] Revision requested');

      const { milestoneId, orderId, data } = update;

      // Revalidate cache
      revalidateMilestone(milestoneId, orderId);

      // Show toast
      if (showToasts) {
        toast.warning('Revizyon İstendi', {
          description: 'Milestone için revizyon talep edildi',
        });
      }

      // Custom handler
      onMilestoneRevisionRequested?.(data);
    },
    [revalidateMilestone, showToasts, onMilestoneRevisionRequested]
  );

  const handleMilestoneStatusChanged = useCallback(
    (update: MilestoneWebSocketUpdate<OrderMilestone>) => {
      logger.info('[useMilestoneWebSocket] Status changed');

      const { milestoneId, orderId, data } = update;

      // Revalidate cache
      revalidateMilestone(milestoneId, orderId);

      // Custom handler
      onMilestoneStatusChanged?.(data);
    },
    [revalidateMilestone, onMilestoneStatusChanged]
  );

  // ========== SUBSCRIPTION HELPERS ==========

  const subscribeToMilestone = useCallback(
    (milestoneId: string): (() => void) => {
      if (!isConnected) {
        logger.warn('[useMilestoneWebSocket] Not connected, cannot subscribe');
        return () => {};
      }

      const topic = `${MILESTONE_TOPIC_PREFIX}/${milestoneId}`;
      logger.info('[useMilestoneWebSocket] Subscribing to milestone', {
        topic,
      });

      const subscriptionId = subscribe(topic, (message: unknown) => {
        const update = message as MilestoneWebSocketUpdate<unknown>;
        logger.debug('[useMilestoneWebSocket] Received message');

        // Route update to appropriate handler
        switch (update.type) {
          case 'MILESTONE_DELIVERED':
            handleMilestoneDelivered(
              update as MilestoneWebSocketUpdate<MilestoneDeliveredData>
            );
            break;
          case 'MILESTONE_ACCEPTED':
            handleMilestoneAccepted(
              update as MilestoneWebSocketUpdate<MilestoneAcceptedData>
            );
            break;
          case 'MILESTONE_REVISION_REQUESTED':
            handleMilestoneRevisionRequested(
              update as MilestoneWebSocketUpdate<OrderMilestone>
            );
            break;
          case 'MILESTONE_STATUS_CHANGED':
            handleMilestoneStatusChanged(
              update as MilestoneWebSocketUpdate<OrderMilestone>
            );
            break;
          default:
            logger.warn('[useMilestoneWebSocket] Unknown event type');
        }
      });

      return () => {
        logger.info('[useMilestoneWebSocket] Unsubscribing from milestone', {
          topic,
        });
        unsubscribe(subscriptionId);
      };
    },
    [
      isConnected,
      subscribe,
      unsubscribe,
      handleMilestoneDelivered,
      handleMilestoneAccepted,
      handleMilestoneRevisionRequested,
      handleMilestoneStatusChanged,
    ]
  );

  const subscribeToOrderMilestones = useCallback(
    (orderId: string): (() => void) => {
      if (!isConnected) {
        logger.warn('[useMilestoneWebSocket] Not connected, cannot subscribe');
        return () => {};
      }

      const topic = `${ORDER_MILESTONE_TOPIC_PREFIX}/${orderId}/milestones`;
      logger.info('[useMilestoneWebSocket] Subscribing to order milestones', {
        topic,
      });

      const subscriptionId = subscribe(topic, (message: unknown) => {
        const update = message as MilestoneWebSocketUpdate<unknown>;
        logger.debug('[useMilestoneWebSocket] Received message');

        // Route update to appropriate handler
        switch (update.type) {
          case 'MILESTONE_DELIVERED':
            handleMilestoneDelivered(
              update as MilestoneWebSocketUpdate<MilestoneDeliveredData>
            );
            break;
          case 'MILESTONE_ACCEPTED':
            handleMilestoneAccepted(
              update as MilestoneWebSocketUpdate<MilestoneAcceptedData>
            );
            break;
          case 'MILESTONE_REVISION_REQUESTED':
            handleMilestoneRevisionRequested(
              update as MilestoneWebSocketUpdate<OrderMilestone>
            );
            break;
          case 'MILESTONE_STATUS_CHANGED':
            handleMilestoneStatusChanged(
              update as MilestoneWebSocketUpdate<OrderMilestone>
            );
            break;
          default:
            logger.warn('[useMilestoneWebSocket] Unknown event type');
        }
      });

      return () => {
        logger.info(
          '[useMilestoneWebSocket] Unsubscribing from order milestones',
          { topic }
        );
        unsubscribe(subscriptionId);
      };
    },
    [
      isConnected,
      subscribe,
      unsubscribe,
      handleMilestoneDelivered,
      handleMilestoneAccepted,
      handleMilestoneRevisionRequested,
      handleMilestoneStatusChanged,
    ]
  );

  // ========== MISSED MESSAGE SYNC ==========

  const syncMissedMessages = useCallback(async () => {
    logger.info('[useMilestoneWebSocket] Syncing missed messages');

    if (!orderId) {
      logger.warn('[useMilestoneWebSocket] No orderId provided, skipping sync');
      return;
    }

    try {
      // Revalidate all order milestones to get latest state
      await mutate(`/api/v1/orders/${orderId}/milestones`);
      logger.info('[useMilestoneWebSocket] Missed messages synced');
    } catch (error) {
      logger.error(
        '[useMilestoneWebSocket] Failed to sync missed messages',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }, [orderId]);

  // ========== AUTO-SUBSCRIBE TO ORDER ==========

  useEffect(() => {
    if (!orderId || !isConnected) {
      return;
    }

    logger.info('[useMilestoneWebSocket] Auto-subscribing to order', {
      orderId,
    });

    const unsubscribeFn = subscribeToOrderMilestones(orderId);

    return () => {
      unsubscribeFn();
    };
  }, [orderId, isConnected, subscribeToOrderMilestones]);

  // ========== RETURN ==========

  return {
    isConnected,
    isReconnecting,
    subscribeToMilestone,
    subscribeToOrderMilestones,
    syncMissedMessages,
  };
}

export default useMilestoneWebSocket;
