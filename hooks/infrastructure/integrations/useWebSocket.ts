'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useMessagingStore } from '@/lib/core/store/messaging';
import { useOrderStore } from '@/lib/core/store/orders';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import type { OrderTimeline, Order, Message } from '@/types';

interface WebSocketMessage {
  type: 'message' | 'order_update' | 'typing' | 'user_status' | 'ping' | 'pong';
  data: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  conversationId?: string;
  orderId?: string;
}

interface UseWebSocketProps {
  url?: string;
  enabled?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

export const useWebSocket = ({
  url = process.env.NODE_ENV === 'production'
    ? 'wss://api.marifet.com/ws'
    : 'ws://localhost:3001/ws',
  enabled = true,
  reconnectInterval = 5000,
  maxReconnectAttempts = 5,
}: UseWebSocketProps = {}) => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const pingInterval = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
  });

  const { user, isAuthenticated } = useAuthStore();
  const { addMessage, updateTypingStatus, updateUserStatus } =
    useMessagingStore();
  const { handleOrderUpdate, handleTimelineUpdate } = useOrderStore();

  const cleanup = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
      pingInterval.current = null;
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  const startPingInterval = useCallback(() => {
    if (pingInterval.current) clearInterval(pingInterval.current);

    pingInterval.current = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        const pingMessage: WebSocketMessage = {
          type: 'ping',
          data: {},
          timestamp: new Date().toISOString(),
        };
        ws.current.send(JSON.stringify(pingMessage));
      }
    }, 30000); // Ping every 30 seconds
  }, []);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'message':
            // New chat message received
            if (message.data && message.conversationId) {
              // Convert BasicMessage to Message format
              const messageData = message.data as any;
              const convertedMessage: Message = {
                ...messageData,
                timestamp:
                  messageData.timestamp ||
                  messageData.createdAt ||
                  messageData.sentAt,
                conversationId:
                  messageData.conversationId || message.conversationId,
                type: messageData.type || 'text',
                isRead: messageData.isRead || false,
                attachments: messageData.attachments || [],
              };
              addMessage(convertedMessage);
            }
            break;

          case 'order_update':
            // Order status or timeline update
            if (message.data && message.orderId) {
              const data = message.data as Record<string, unknown>;
              if (data.timeline) {
                handleTimelineUpdate(
                  message.orderId,
                  data.timeline as OrderTimeline
                );
              } else {
                handleOrderUpdate(message.data as unknown as Order);
              }
            }
            break;

          case 'typing':
            // Typing indicator update
            if (message.conversationId && message.userId) {
              const typingData = message.data as { isTyping: boolean };
              updateTypingStatus(
                message.conversationId,
                message.userId,
                typingData.isTyping
              );
            }
            break;

          case 'user_status':
            // User online/offline status
            if (message.userId) {
              const statusData = message.data as {
                status: 'online' | 'away' | 'busy' | 'offline';
              };
              updateUserStatus(message.userId, statusData.status === 'online');
            }
            break;

          case 'pong':
            // Pong response to ping

            break;

          default:
            console.warn('Unknown WebSocket message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    },
    [
      addMessage,
      handleOrderUpdate,
      handleTimelineUpdate,
      updateTypingStatus,
      updateUserStatus,
    ]
  );

  const connect = useCallback(() => {
    if (!enabled || !isAuthenticated || !user) {
      return;
    }

    if (
      ws.current?.readyState === WebSocket.CONNECTING ||
      ws.current?.readyState === WebSocket.OPEN
    ) {
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const wsUrl = `${url}?userId=${user.id}&token=mock-token`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0,
        }));
        startPingInterval();
      };

      ws.current.onmessage = handleMessage;

      ws.current.onclose = (event) => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));

        if (pingInterval.current) {
          clearInterval(pingInterval.current);
          pingInterval.current = null;
        }

        // Attempt reconnection if not a manual close
        if (event.code !== 1000 && enabled && isAuthenticated) {
          setState((prev) => {
            if (prev.reconnectAttempts < maxReconnectAttempts) {
              reconnectTimeout.current = setTimeout(() => {
                connect();
              }, reconnectInterval);

              return {
                ...prev,
                reconnectAttempts: prev.reconnectAttempts + 1,
              };
            } else {
              return {
                ...prev,
                error: 'Maximum reconnection attempts reached',
              };
            }
          });
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState((prev) => ({
          ...prev,
          error: 'WebSocket connection error',
          isConnecting: false,
        }));
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to create WebSocket connection',
        isConnecting: false,
      }));
    }
  }, [
    enabled,
    isAuthenticated,
    user,
    url,
    handleMessage,
    startPingInterval,
    maxReconnectAttempts,
    reconnectInterval,
  ]);

  const disconnect = useCallback(() => {
    cleanup();
    setState((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempts: 0,
    }));
  }, [cleanup]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('WebSocket is not connected');
    return false;
  }, []);

  // Send chat message
  const sendChatMessage = useCallback(
    (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
      return sendMessage({
        type: 'message',
        data: {
          ...message,
          id: `msg-${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
        conversationId,
        userId: user?.id,
      });
    },
    [sendMessage, user?.id]
  );

  // Send typing indicator
  const sendTypingStatus = useCallback(
    (conversationId: string, isTyping: boolean) => {
      return sendMessage({
        type: 'typing',
        data: { isTyping },
        timestamp: new Date().toISOString(),
        conversationId,
        userId: user?.id,
      });
    },
    [sendMessage, user?.id]
  );

  // Send user status update
  const sendUserStatus = useCallback(
    (status: 'online' | 'away' | 'busy' | 'offline') => {
      return sendMessage({
        type: 'user_status',
        data: { status },
        timestamp: new Date().toISOString(),
        userId: user?.id,
      });
    },
    [sendMessage, user?.id]
  );

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
      sendUserStatus('online');
    }
  }, [state.isConnected, user, sendUserStatus]);

  // Send offline status when component unmounts
  useEffect(() => {
    return () => {
      if (state.isConnected) {
        sendUserStatus('offline');
      }
    };
  }, [state.isConnected, sendUserStatus]);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    sendChatMessage,
    sendTypingStatus,
    sendUserStatus,
  };
};

export default useWebSocket;
