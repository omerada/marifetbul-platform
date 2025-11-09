'use client';

/**
 * useOrderNotifications
 * ---------------------
 * Cross-cutting hook that wires order-related WebSocket events to UI notifications
 * - Subscribes to user order queue and generic notifications
 * - Shows sonner toasts for important events (delivery, status change, revision requests)
 * - Triggers Desktop Notifications (Notification API) when permitted
 * - Integrates with existing notification store/hooks when available
 */

'use client';

import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useWebSocket } from '@/hooks/infrastructure/websocket/useWebSocket';
import logger from '@/lib/infrastructure/monitoring/logger';
import { useNotifications } from '@/hooks/business/useNotifications';
import type {
  OrderWebSocketEventType,
  OrderWebSocketUpdate,
} from '@/types/business/features/order';

interface UseOrderNotificationsOptions {
  enableDesktop?: boolean;
  enableToasts?: boolean;
}

export function useOrderNotifications(
  options: UseOrderNotificationsOptions = {}
) {
  const { enableDesktop = true, enableToasts = true } = options;

  const { subscribe, unsubscribe, isConnected } = useWebSocket({
    autoConnect: true,
    enableStoreIntegration: true,
  });

  // useNotifications provides unread count and methods; we will use it to refresh list
  const { refetch: refetchNotifications } = useNotifications();

  const showDesktopNotification = useCallback(
    (title: string, body?: string) => {
      if (
        !enableDesktop ||
        typeof window === 'undefined' ||
        !('Notification' in window)
      )
        return;

      try {
        if (Notification.permission === 'granted') {
          new Notification(title, { body });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              new Notification(title, { body });
            }
          });
        }
      } catch (err) {
        logger.warn('useOrderNotifications', { err,  });
      }
    },
    [enableDesktop]
  );

  useEffect(() => {
    if (!isConnected) return;

    const handler = (msg: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = msg as any;
      const payload = message?.data as OrderWebSocketUpdate | undefined;
      const orderNumber =
        payload && (payload.data as Record<string, unknown>)['orderNumber']
          ? String((payload.data as Record<string, unknown>)['orderNumber'])
          : undefined;
      const type: OrderWebSocketEventType | string =
        payload?.type || message?.type;

      // Refresh generic notifications list
      refetchNotifications?.();

      // Show toasts & desktop notifications for important order events
      switch (type) {
        case 'ORDER_DELIVERED':
          if (enableToasts)
            toast.success('Sipariş teslim edildi', {
              description: orderNumber,
            });
          showDesktopNotification(
            'Sipariş teslim edildi',
            orderNumber ? `Sipariş #${orderNumber}` : undefined
          );
          break;

        case 'ORDER_ACCEPTED':
          if (enableToasts)
            toast.success('Sipariş kabul edildi', { description: orderNumber });
          showDesktopNotification(
            'Sipariş kabul edildi',
            orderNumber ? `Sipariş #${orderNumber}` : undefined
          );
          break;

        case 'ORDER_REVISION_REQUESTED':
        case 'REVISION_REQUESTED':
          if (enableToasts)
            toast('Revizyon istendi', { description: orderNumber });
          showDesktopNotification(
            'Revizyon istendi',
            orderNumber ? `Sipariş #${orderNumber}` : undefined
          );
          break;

        case 'ORDER_STATUS_CHANGED':
        case 'STATUS_CHANGED':
          if (enableToasts)
            toast('Sipariş durumu güncellendi', { description: orderNumber });
          showDesktopNotification(
            'Sipariş durumu güncellendi',
            orderNumber ? `Sipariş #${orderNumber}` : undefined
          );
          break;

        default:
          // Generic notification: integrate with notification list
          break;
      }
    };

    // Subscribe to user queue and general order topic
    const userQueue = '/user/queue/orders';
    const orderTopic = '/topic/orders';

    subscribe(userQueue, handler);
    subscribe(orderTopic, handler);

    return () => {
      unsubscribe(userQueue);
      unsubscribe(orderTopic);
    };
  }, [
    isConnected,
    subscribe,
    unsubscribe,
    refetchNotifications,
    enableToasts,
    showDesktopNotification,
  ]);
}
