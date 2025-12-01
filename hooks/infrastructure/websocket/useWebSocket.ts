'use client';

/**
 * ================================================
 * UNIFIED WEBSOCKET HOOK - Production Ready
 * ================================================
 * React Hook for WebSocket Connection with Store Integration
 *
 * Provides easy WebSocket integration for React components.
 * Handles connection lifecycle, subscriptions, cleanup, and automatic store updates.
 *
 * Features:
 * - Auto-connect on mount
 * - Auto-disconnect on unmount
 * - Connection state tracking
 * - Type-safe subscriptions
 * - Error handling
 * - Automatic store integration (messaging, notifications)
 * - Reconnection support
 *
 * @version 2.0.0
 * @sprint Sprint 1 - Real-time Messaging
 * @author MarifetBul Development Team
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getWebSocketService,
  initWebSocketService,
  WebSocketState,
  type WebSocketConfig,
  type SubscriptionCallback,
} from '@/lib/infrastructure/websocket/WebSocketService';
import logger from '@/lib/infrastructure/monitoring/logger';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { useMessagingStore } from '@/lib/core/store/domains/messaging/MessagingStore';
import { useNotificationStore } from '@/lib/core/store/notificationStore';
import { useOrderStore } from '@/lib/core/store/orders';
import type { Message as MessageType } from '@/types/message';
import type { Message as BusinessMessage } from '@/types/business/features/messaging';
import type { Notification } from '@/types/core/notification';
import type { NotificationType } from '@/types/domains/notification';
import type { WebSocketMessage } from '@/types/shared/utils/api';
import type { Order, OrderTimeline } from '@/types';

// ==================== TYPES ====================

// WebSocket Order Update payload
interface OrderUpdatePayload {
  orderId?: string;
  status?: string;
  order?: Order;
  timeline?: OrderTimeline;
}

export interface UseWebSocketOptions {
  /** Auto-connect on mount (default: true) */
  autoConnect?: boolean;
  /** Auto-disconnect on unmount (default: true) */
  autoDisconnect?: boolean;
  /** Enable automatic store updates (default: true) */
  enableStoreIntegration?: boolean;
  /** Custom WebSocket config */
  config?: Partial<WebSocketConfig>;
  /** Callback on connect */
  onConnect?: () => void;
  /** Callback on disconnect */
  onDisconnect?: () => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

export interface UseWebSocketReturn {
  /** Current connection state */
  state: WebSocketState;
  /** Is connected */
  isConnected: boolean;
  /** Connect manually */
  connect: () => void;
  /** Disconnect manually */
  disconnect: () => void;
  /** Subscribe to a topic */
  subscribe: (destination: string, callback: SubscriptionCallback) => string;
  /** Unsubscribe from a topic */
  unsubscribe: (destination: string) => void;
  /** Send a message */
  send: (destination: string, body: unknown) => void;
  /** Connection error if any */
  error: Error | null;
}

// ==================== HOOK ====================

/**
 * useWebSocket Hook
 *
 * @example
 * ```tsx
 * const { isConnected, subscribe, send } = useWebSocket({
 *   onConnect: () => logger.debug('Connected!'),
 * });
 *
 * useEffect(() => {
 *   if (!isConnected) return;
 *
 *   const subId = subscribe('/topic/messages', (message) => {
 *     logger.debug('Received:', message);
 *   });
 *
 *   return () => unsubscribe(subId);
 * }, [isConnected]);
 * ```
 */
export function useWebSocket(
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    autoConnect = true,
    autoDisconnect = true,
    enableStoreIntegration = true,
    config = {},
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const { user, isAuthenticated } = useAuthStore();
  const messagingStore = useMessagingStore();
  const notificationStore = useNotificationStore();
  const orderStore = useOrderStore();
  const [state, setState] = useState<WebSocketState>(
    WebSocketState.DISCONNECTED
  );
  const [error, setError] = useState<Error | null>(null);
  const serviceRef = useRef<ReturnType<typeof getWebSocketService> | null>(
    null
  );
  const isInitialized = useRef(false);

  // ==================== MESSAGE HANDLER ====================

  /**
   * Handle incoming WebSocket messages and route to appropriate stores
   */
  const handleMessage = useCallback(
    (message: unknown) => {
      if (!enableStoreIntegration) return;

      try {
        // Cast to WebSocketMessage format
        const wsMessage = message as WebSocketMessage;
        const messageType = wsMessage.type;

        logger.debug('useWebSocket', { type: messageType, payload: wsMessage });

        switch (messageType) {
          case 'MESSAGE':
            // New message received - convert to business message format
            if (wsMessage.data) {
              const rawMsg = wsMessage.data as MessageType;
              const businessMsg: BusinessMessage = {
                id: rawMsg.id,
                conversationId: rawMsg.conversationId,
                senderId: rawMsg.senderId,
                receiverId: rawMsg.recipientId,
                content: rawMsg.content,
                type: rawMsg.type.toLowerCase() as BusinessMessage['type'],
                isRead: rawMsg.isRead,
                isEdited: rawMsg.isEdited,
                sentAt: rawMsg.createdAt,
                createdAt: rawMsg.createdAt,
                timestamp: rawMsg.createdAt,
                readAt: rawMsg.readAt,
                editedAt: rawMsg.editedAt,
                replyTo: rawMsg.replyTo,
                attachments: rawMsg.attachments?.map((att) => ({
                  id: att.id,
                  name: att.fileName,
                  url: att.fileUrl,
                  size: att.fileSize,
                  type: att.mimeType,
                  uploadedAt: att.uploadedAt,
                })),
              };
              messagingStore.addMessage(businessMsg);
              logger.info('useWebSocket', {
                messageId: businessMsg.id,
                conversationId: businessMsg.conversationId,
              });
            }
            break;

          case 'TYPING':
          case 'TYPING_START':
            // Typing indicator
            if (wsMessage.data) {
              const typing = wsMessage.data as {
                userId: string;
                conversationId: string;
              };
              messagingStore.updateTypingStatus(
                typing.userId,
                typing.conversationId,
                true
              );
              logger.debug('useWebSocket', { typing });
            }
            break;

          case 'TYPING_STOP':
            // Stop typing indicator
            if (wsMessage.data) {
              const typing = wsMessage.data as {
                userId: string;
                conversationId: string;
              };
              messagingStore.updateTypingStatus(
                typing.userId,
                typing.conversationId,
                false
              );
              logger.debug('useWebSocket', { typing });
            }
            break;

          case 'USER_STATUS':
          case 'PRESENCE':
          case 'USER_ONLINE':
          case 'USER_OFFLINE':
            // User online/offline status
            if (wsMessage.data) {
              const presence = wsMessage.data as {
                userId: string;
                status?: string;
              };
              const isOnline =
                messageType === 'USER_ONLINE' || presence.status === 'ONLINE';
              messagingStore.updateUserStatus(presence.userId, isOnline);
              logger.debug('useWebSocket', {
                userId: presence.userId,
                isOnline,
              });
            }
            break;

          case 'NOTIFICATION':
            // System notification - convert to EnhancedNotification format
            if (wsMessage.data) {
              const notification = wsMessage.data as Notification;
              // Convert core Notification to EnhancedNotification format
              // Map backend NotificationType to frontend NotificationType
              const notificationTypeMap: Record<string, NotificationType> = {
                MESSAGE: 'MESSAGE',
                JOB: 'JOB',
                PROPOSAL: 'PROPOSAL',
                ORDER: 'ORDER',
                PAYMENT: 'PAYMENT',
                REVIEW: 'REVIEW',
                FOLLOW: 'FOLLOW',
                SYSTEM: 'SYSTEM',
              };
              const enhancedNotification = {
                id: notification.id,
                userId: notification.userId,
                type: notificationTypeMap[notification.type] || 'SYSTEM',
                title: notification.title,
                message: notification.content || notification.message || '',
                content: notification.content,
                isRead: notification.isRead,
                createdAt: notification.createdAt,
                readAt: notification.readAt,
                actionUrl: notification.actionUrl,
                priority: notification.priority.toLowerCase() as
                  | 'low'
                  | 'medium'
                  | 'high'
                  | 'urgent',
                relatedEntityType: notification.relatedEntityType,
                relatedEntityId: notification.relatedEntityId,
                data: {
                  relatedEntityType: notification.relatedEntityType,
                  relatedEntityId: notification.relatedEntityId,
                },
              };
              notificationStore.handleRealtimeNotification(
                enhancedNotification
              );
              logger.info('useWebSocket', {
                id: notification.id,
                type: notification.type,
              });
            }
            break;

          case 'ORDER_UPDATE':
            // Order status update - could trigger notification
            logger.info('useWebSocket', { data: wsMessage.data });

            // Integrate with order store
            if (wsMessage.data && enableStoreIntegration) {
              const orderData = wsMessage.data as OrderUpdatePayload;

              // Update order in store
              if (orderData.orderId && orderData.status) {
                orderStore.handleStatusChange(
                  orderData.orderId,
                  orderData.status
                );
                logger.debug('useWebSocket', {
                  orderId: orderData.orderId,
                  status: orderData.status,
                });
              }

              // If full order object is provided, update the order
              if (orderData.order) {
                orderStore.handleOrderUpdate(orderData.order);
                logger.debug('useWebSocket', { orderId: orderData.order.id });
              }

              // Add timeline entry if provided
              if (orderData.timeline && orderData.orderId) {
                orderStore.handleTimelineUpdate(
                  orderData.orderId,
                  orderData.timeline
                );
                logger.debug('useWebSocket', { orderId: orderData.orderId });
              }
            }
            break;

          case 'MESSAGE_READ':
          case 'MESSAGES_READ':
            // Message read receipt
            if (wsMessage.data) {
              const readData = wsMessage.data as {
                messageId?: string;
                messageIds?: string[];
                readAt?: string;
              };
              const messageIds =
                readData.messageIds ||
                (readData.messageId ? [readData.messageId] : []);
              messageIds.forEach((messageId) => {
                messagingStore.updateMessage(messageId, {
                  isRead: true,
                  readAt: readData.readAt || new Date().toISOString(),
                });
              });
              logger.debug('useWebSocket', { count: messageIds.length });
            }
            break;

          default:
            logger.warn('useWebSocket', {
              type: messageType,
              message: wsMessage,
            });
        }
      } catch (err) {
        logger.error('useWebSocket: Error handling message', undefined, {
          error: err,
          message,
        });
      }
    },
    [enableStoreIntegration, messagingStore, notificationStore, orderStore]
  );

  // ==================== CONNECTION ====================

  const connect = useCallback(() => {
    // Get token from localStorage (set by auth service)
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (!token) {
      logger.warn('useWebSocket', 'Cannot connect: no token');
      return;
    }

    if (!isAuthenticated || !user) {
      logger.warn('useWebSocket', 'User not authenticated');
      return;
    }

    try {
      // Initialize service if not already done
      if (!serviceRef.current) {
        const wsConfig: WebSocketConfig = {
          url: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws',
          token,
          debug: process.env.NODE_ENV === 'development',
          ...config,
        };

        logger.info('useWebSocket', { url: wsConfig.url, userId: user.id });

        serviceRef.current = initWebSocketService(wsConfig);

        // Set event handlers
        serviceRef.current.setEventHandlers({
          onConnect: () => {
            logger.info('useWebSocket', 'WebSocket connected');
            setState(WebSocketState.CONNECTED);
            setError(null);

            // Subscribe to default topics for automatic store updates
            if (enableStoreIntegration && serviceRef.current && user) {
              try {
                // Subscribe to personal message queue
                serviceRef.current.subscribe(
                  `/user/queue/messages`,
                  handleMessage
                );
                logger.info(
                  'useWebSocket',
                  'Subscribed to personal message queue'
                );

                // Subscribe to personal order updates
                serviceRef.current.subscribe(
                  `/user/queue/orders`,
                  handleMessage
                );
                logger.info(
                  'useWebSocket',
                  'Subscribed to order updates queue'
                );

                // Subscribe to notifications
                serviceRef.current.subscribe(
                  `/user/queue/notifications`,
                  handleMessage
                );
                logger.info(
                  'useWebSocket',
                  'Subscribed to notifications queue'
                );

                // Subscribe to typing indicators for active conversations
                serviceRef.current.subscribe(`/topic/typing`, handleMessage);
                logger.info('useWebSocket', 'Subscribed to typing indicators');

                // Subscribe to user presence updates
                serviceRef.current.subscribe(`/topic/presence`, handleMessage);
                logger.info('useWebSocket', 'Subscribed to user presence');
              } catch (err) {
                logger.error(
                  'useWebSocket: Failed to subscribe to default topics',
                  undefined,
                  { error: err }
                );
              }
            }

            onConnect?.();
          },
          onDisconnect: () => {
            logger.info('useWebSocket', 'WebSocket disconnected');
            setState(WebSocketState.DISCONNECTED);
            onDisconnect?.();
          },
          onError: (err) => {
            logger.error('useWebSocket: WebSocket error', undefined, {
              error: err,
            });
            setError(err instanceof Error ? err : new Error(String(err)));
            onError?.(err);
          },
          onReconnecting: (attempt) => {
            setState(WebSocketState.RECONNECTING);
          },
          onStateChange: (newState) => {
            setState(newState);
          },
        });
      }

      // Connect
      serviceRef.current.connect();
      isInitialized.current = true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect');
      logger.error('useWebSocket: Connection failed', undefined, { error });
      setError(error instanceof Error ? error : new Error(String(error)));
      setState(WebSocketState.ERROR);
    }
  }, [
    user,
    isAuthenticated,
    config,
    onConnect,
    onDisconnect,
    onError,
    enableStoreIntegration,
    handleMessage,
  ]);

  const disconnect = useCallback(() => {
    if (serviceRef.current) {
      logger.info('useWebSocket', 'Disconnecting WebSocket');
      serviceRef.current.disconnect();
    }
  }, []);

  // ==================== SUBSCRIPTIONS ====================

  const subscribe = useCallback(
    (destination: string, callback: SubscriptionCallback): string => {
      if (!serviceRef.current) {
        throw new Error('WebSocket service not initialized');
      }

      return serviceRef.current.subscribe(destination, callback);
    },
    []
  );

  const unsubscribe = useCallback((destination: string) => {
    if (!serviceRef.current) {
      return;
    }

    serviceRef.current.unsubscribe(destination);
  }, []);

  // ==================== MESSAGING ====================

  const send = useCallback((destination: string, body: unknown) => {
    if (!serviceRef.current) {
      throw new Error('WebSocket service not initialized');
    }

    serviceRef.current.send(destination, body);
  }, []);

  // ==================== LIFECYCLE ====================

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && isAuthenticated && user && !isInitialized.current) {
      connect();
    }
  }, [autoConnect, isAuthenticated, user, connect]);

  // Auto-disconnect on unmount
  useEffect(() => {
    return () => {
      if (autoDisconnect && serviceRef.current) {
        disconnect();
      }
    };
  }, [autoDisconnect, disconnect]);

  // ==================== RETURN ====================

  return {
    state,
    isConnected: state === WebSocketState.CONNECTED,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
    error,
  };
}
