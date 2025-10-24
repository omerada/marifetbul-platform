'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useMessagingStore } from '@/lib/core/store/messaging';
import { useOrderStore } from '@/lib/core/store/orders';
import { useNotificationStore } from '@/lib/core/store/notificationStore';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { logger } from '@/lib/shared/utils/logger';
import type { Message } from '@/types';
import type { MessageNotification } from '@/hooks/business/messaging';

interface WebSocketMessage<T = unknown> {
  type:
    | 'MESSAGE'
    | 'ORDER_UPDATE'
    | 'TYPING'
    | 'USER_STATUS'
    | 'PING'
    | 'PONG'
    | 'NOTIFICATION';
  data: T;
  timestamp: string;
  userId?: string;
  conversationId?: string;
  orderId?: string;
  metadata?: Record<string, unknown>;
}

interface OrderUpdateMessage {
  orderId: string;
  orderNumber: string;
  status: string;
  title: string;
  updateType:
    | 'STATUS_CHANGE'
    | 'DELIVERY_SUBMITTED'
    | 'REVISION_REQUESTED'
    | 'PAYMENT_COMPLETED'
    | 'MILESTONE_COMPLETED';
  message: string;
  buyerId: string;
  sellerId: string;
}

interface ChatMessageData {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  isRead: boolean;
  timestamp: string;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }>;
}

interface UserStatusMessage {
  userId: string;
  username: string;
  status: 'ONLINE' | 'AWAY' | 'BUSY' | 'OFFLINE';
  lastSeen?: string;
}

interface TypingIndicatorMessage {
  userId: string;
  conversationId: string;
  username: string;
  isTyping: boolean;
}

interface UseWebSocketProps {
  url?: string;
  enabled?: boolean;
  reconnectInterval?: number;
  _maxReconnectAttempts?: number;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

export const useWebSocket = ({
  url = process.env.NODE_ENV === 'production'
    ? 'https://api.marifet.com/ws'
    : process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws',
  enabled = typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true',
  reconnectInterval = 5000,
  _maxReconnectAttempts = 5, // Used for future manual reconnection logic
}: UseWebSocketProps = {}) => {
  const stompClient = useRef<Client | null>(null);
  const subscriptions = useRef<Map<string, StompSubscription>>(new Map());
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
  });

  const { user, isAuthenticated } = useAuthStore();
  const { addMessage, updateTypingStatus, updateUserStatus } =
    useMessagingStore();
  const { handleOrderUpdate: _handleOrderUpdate } = useOrderStore();
  const { addNotification } = useNotificationStore();

  // Get JWT token from cookie
  const getAuthToken = useCallback(() => {
    if (typeof window === 'undefined') return '';
    return (
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1] || ''
    );
  }, []);

  // Handle incoming STOMP messages
  const handleStompMessage = useCallback(
    (destination: string, message: IMessage) => {
      try {
        const wsMessage: WebSocketMessage = JSON.parse(message.body);

        if (process.env.NODE_ENV === 'development') {
          console.log('[WebSocket] Received message:', {
            destination,
            type: wsMessage.type,
            data: wsMessage.data,
          });
        }

        switch (wsMessage.type) {
          case 'MESSAGE': {
            // New chat message received
            const chatData = wsMessage.data as ChatMessageData;
            if (chatData && chatData.conversationId) {
              const convertedMessage: Message = {
                id: chatData.id,
                conversationId: chatData.conversationId,
                senderId: chatData.senderId,
                content: chatData.content,
                timestamp: chatData.timestamp,
                sentAt: chatData.timestamp,
                createdAt: chatData.timestamp,
                type: chatData.type as Message['type'],
                isRead: chatData.isRead,
                attachments:
                  chatData.attachments?.map((att) => ({
                    id: att.id,
                    name: att.fileName,
                    url: att.fileUrl,
                    type: att.mimeType,
                    size: att.fileSize,
                    uploadedAt: chatData.timestamp,
                  })) || [],
              };
              addMessage(convertedMessage);
            }
            break;
          }

          case 'ORDER_UPDATE': {
            // Order status or timeline update
            const orderData = wsMessage.data as OrderUpdateMessage;
            if (orderData && orderData.orderId) {
              // Trigger a refetch of the order - handleOrderUpdate expects full Order object
              // For now, just log the update. In production, this should trigger a refetch
              if (process.env.NODE_ENV === 'development') {
                console.log('[WebSocket] Order update received:', {
                  orderId: orderData.orderId,
                  status: orderData.status,
                  message: orderData.message,
                });
              }

              // Note: Full order refetch should be triggered here
              // This avoids type mismatch by not calling handleOrderUpdate with partial data
            }
            break;
          }

          case 'TYPING': {
            // Typing indicator update
            const typingData = wsMessage.data as TypingIndicatorMessage;
            if (typingData && typingData.conversationId && typingData.userId) {
              updateTypingStatus(
                typingData.conversationId,
                typingData.userId,
                typingData.isTyping
              );
            }
            break;
          }

          case 'USER_STATUS': {
            // User online/offline status
            const statusData = wsMessage.data as UserStatusMessage;
            if (statusData && statusData.userId) {
              updateUserStatus(
                statusData.userId,
                statusData.status === 'ONLINE'
              );
            }
            break;
          }

          case 'NOTIFICATION': {
            // General notification (e.g., new message notification)
            const notificationData = wsMessage.data as MessageNotification;
            if (notificationData) {
              addNotification(notificationData);

              if (process.env.NODE_ENV === 'development') {
                console.log(
                  '[WebSocket] Notification received:',
                  notificationData
                );
              }
            }
            break;
          }

          default:
            logger.warn('Unknown WebSocket message type:', wsMessage.type);
        }
      } catch (error) {
        logger.error('Error parsing WebSocket message:', error);
      }
    },
    [addMessage, updateTypingStatus, updateUserStatus, addNotification]
  );

  // Subscribe to user-specific topics
  const subscribeToTopics = useCallback(() => {
    if (!stompClient.current || !user) return;

    const client = stompClient.current;

    // Subscribe to user-specific queue for private messages
    const userQueueSub = client.subscribe(`/user/queue/messages`, (message) =>
      handleStompMessage('/user/queue/messages', message)
    );
    subscriptions.current.set('user-queue', userQueueSub);

    // Subscribe to user-specific order updates
    const orderUpdatesSub = client.subscribe(`/user/queue/orders`, (message) =>
      handleStompMessage('/user/queue/orders', message)
    );
    subscriptions.current.set('order-updates', orderUpdatesSub);

    // Subscribe to global notifications topic
    const notificationsSub = client.subscribe(
      `/topic/notifications`,
      (message) => handleStompMessage('/topic/notifications', message)
    );
    subscriptions.current.set('notifications', notificationsSub);

    if (process.env.NODE_ENV === 'development') {
      console.log('[WebSocket] Subscribed to topics');
    }
  }, [user, handleStompMessage]);

  // Unsubscribe from all topics
  const unsubscribeAll = useCallback(() => {
    subscriptions.current.forEach((subscription) => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        logger.warn('Error unsubscribing:', error);
      }
    });
    subscriptions.current.clear();
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
    unsubscribeAll();
    if (stompClient.current?.active) {
      stompClient.current.deactivate();
    }
    stompClient.current = null;
  }, [unsubscribeAll]);

  // Start heartbeat to keep connection alive
  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);

    heartbeatInterval.current = setInterval(() => {
      if (stompClient.current?.active) {
        stompClient.current.publish({
          destination: '/app/ping',
          body: JSON.stringify({ timestamp: new Date().toISOString() }),
        });
      }
    }, 30000); // Heartbeat every 30 seconds
  }, []);

  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (!enabled || !isAuthenticated || !user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[WebSocket] Not connecting:', {
          enabled,
          isAuthenticated,
          hasUser: !!user,
        });
      }
      return;
    }

    if (stompClient.current?.active) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[WebSocket] Already connected');
      }
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const authToken = getAuthToken();

      // Create STOMP client with SockJS
      const client = new Client({
        webSocketFactory: () => new SockJS(url),
        connectHeaders: {
          Authorization: `Bearer ${authToken}`,
        },
        debug: (str) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[STOMP Debug]', str);
          }
        },
        reconnectDelay: reconnectInterval,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onConnect: () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[WebSocket] Connected successfully');
          }
          setState((prev) => ({
            ...prev,
            isConnected: true,
            isConnecting: false,
            error: null,
            reconnectAttempts: 0,
          }));

          // Subscribe to topics after connection
          subscribeToTopics();
          startHeartbeat();

          // Send online status
          client.publish({
            destination: '/app/user/status',
            body: JSON.stringify({
              status: 'ONLINE',
              userId: user.id,
            }),
          });
        },
        onStompError: (frame) => {
          logger.error('STOMP error:', frame);
          setState((prev) => ({
            ...prev,
            error: 'WebSocket connection error',
            isConnecting: false,
          }));
        },
        onWebSocketError: (event) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[WebSocket] Connection error:', event);
          }
          setState((prev) => ({
            ...prev,
            error: 'WebSocket unavailable',
            isConnecting: false,
          }));
        },
        onDisconnect: () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[WebSocket] Disconnected');
          }
          setState((prev) => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
          }));
          unsubscribeAll();
          if (heartbeatInterval.current) {
            clearInterval(heartbeatInterval.current);
            heartbeatInterval.current = null;
          }
        },
      });

      stompClient.current = client;
      client.activate();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[WebSocket] Failed to create connection:', error);
      }
      setState((prev) => ({
        ...prev,
        error: 'WebSocket unavailable',
        isConnecting: false,
      }));
    }
  }, [
    enabled,
    isAuthenticated,
    user,
    url,
    getAuthToken,
    reconnectInterval,
    subscribeToTopics,
    startHeartbeat,
    unsubscribeAll,
  ]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (stompClient.current?.active && user) {
      // Send offline status before disconnecting
      try {
        stompClient.current.publish({
          destination: '/app/user/status',
          body: JSON.stringify({
            status: 'OFFLINE',
            userId: user.id,
          }),
        });
      } catch (error) {
        logger.warn('Error sending offline status:', error);
      }
    }

    cleanup();
    setState((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempts: 0,
    }));
  }, [cleanup, user]);

  // Send chat message
  const sendChatMessage = useCallback(
    (
      conversationId: string,
      content: string,
      type: 'text' | 'image' | 'file' = 'text'
    ) => {
      if (!stompClient.current?.active || !user) {
        logger.warn('WebSocket is not connected');
        return false;
      }

      try {
        const message: ChatMessageData = {
          id: `msg-${Date.now()}`,
          conversationId,
          senderId: user.id,
          senderName: user.name || user.email,
          content,
          type,
          isRead: false,
          timestamp: new Date().toISOString(),
        };

        stompClient.current.publish({
          destination: '/app/chat/message',
          body: JSON.stringify(message),
        });

        return true;
      } catch (error) {
        logger.error('Error sending chat message:', error);
        return false;
      }
    },
    [user]
  );

  // Send typing indicator
  const sendTypingStatus = useCallback(
    (conversationId: string, isTyping: boolean) => {
      if (!stompClient.current?.active || !user) return false;

      try {
        const message: TypingIndicatorMessage = {
          userId: user.id,
          conversationId,
          username: user.name || user.email,
          isTyping,
        };

        stompClient.current.publish({
          destination: '/app/chat/typing',
          body: JSON.stringify(message),
        });

        return true;
      } catch (error) {
        logger.error('Error sending typing status:', error);
        return false;
      }
    },
    [user]
  );

  // Send user status update
  const sendUserStatus = useCallback(
    (status: 'ONLINE' | 'AWAY' | 'BUSY' | 'OFFLINE') => {
      if (!stompClient.current?.active || !user) return false;

      try {
        const message: UserStatusMessage = {
          userId: user.id,
          username: user.name || user.email,
          status,
        };

        stompClient.current.publish({
          destination: '/app/user/status',
          body: JSON.stringify(message),
        });

        return true;
      } catch (error) {
        logger.error('Error sending user status:', error);
        return false;
      }
    },
    [user]
  );

  // Subscribe to specific conversation
  const subscribeToConversation = useCallback(
    (conversationId: string) => {
      if (!stompClient.current?.active) return;

      const destination = `/topic/conversation/${conversationId}`;
      const sub = stompClient.current.subscribe(destination, (message) =>
        handleStompMessage(destination, message)
      );
      subscriptions.current.set(`conversation-${conversationId}`, sub);

      if (process.env.NODE_ENV === 'development') {
        console.log('[WebSocket] Subscribed to conversation:', conversationId);
      }
    },
    [handleStompMessage]
  );

  // Unsubscribe from specific conversation
  const unsubscribeFromConversation = useCallback((conversationId: string) => {
    const key = `conversation-${conversationId}`;
    const sub = subscriptions.current.get(key);
    if (sub) {
      sub.unsubscribe();
      subscriptions.current.delete(key);

      if (process.env.NODE_ENV === 'development') {
        console.log(
          '[WebSocket] Unsubscribed from conversation:',
          conversationId
        );
      }
    }
  }, []);

  // Connect when component mounts and user is authenticated
  useEffect(() => {
    if (enabled && isAuthenticated && user) {
      connect();
    }

    return cleanup;
  }, [enabled, isAuthenticated, user, connect, cleanup]);

  // Send online status when connected
  useEffect(() => {
    if (state.isConnected && user) {
      sendUserStatus('ONLINE');
    }
  }, [state.isConnected, user, sendUserStatus]);

  return {
    ...state,
    connect,
    disconnect,
    sendChatMessage,
    sendTypingStatus,
    sendUserStatus,
    subscribeToConversation,
    unsubscribeFromConversation,
  };
};

export default useWebSocket;
