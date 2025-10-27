/**
 * React Hook for WebSocket Connection
 *
 * Provides easy WebSocket integration for React components.
 * Handles connection lifecycle, subscriptions, and cleanup.
 *
 * Features:
 * - Auto-connect on mount
 * - Auto-disconnect on unmount
 * - Connection state tracking
 * - Type-safe subscriptions
 * - Error handling
 *
 * @sprint Sprint 5 - Real-time Messaging
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
import { logger } from '@/lib/shared/utils/logger';
import { useAuth } from '@/hooks/shared/useAuth';

// ==================== TYPES ====================

export interface UseWebSocketOptions {
  /** Auto-connect on mount (default: true) */
  autoConnect?: boolean;
  /** Auto-disconnect on unmount (default: true) */
  autoDisconnect?: boolean;
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
 *   onConnect: () => console.log('Connected!'),
 * });
 *
 * useEffect(() => {
 *   if (!isConnected) return;
 *
 *   const subId = subscribe('/topic/messages', (message) => {
 *     console.log('Received:', message);
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
    config = {},
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const { user } = useAuth();
  const [state, setState] = useState<WebSocketState>(
    WebSocketState.DISCONNECTED
  );
  const [error, setError] = useState<Error | null>(null);
  const serviceRef = useRef<ReturnType<typeof getWebSocketService> | null>(
    null
  );
  const isInitialized = useRef(false);

  // ==================== CONNECTION ====================

  const connect = useCallback(() => {
    // Get token from localStorage (set by auth service)
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (!token) {
      logger.warn('useWebSocket', 'No token available, cannot connect');
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

        logger.info('useWebSocket', 'Initializing WebSocket service', {
          url: wsConfig.url,
          userId: user?.id,
        });

        serviceRef.current = initWebSocketService(wsConfig);

        // Set event handlers
        serviceRef.current.setEventHandlers({
          onConnect: () => {
            logger.info('useWebSocket', 'WebSocket connected');
            setState(WebSocketState.CONNECTED);
            setError(null);
            onConnect?.();
          },
          onDisconnect: () => {
            logger.info('useWebSocket', 'WebSocket disconnected');
            setState(WebSocketState.DISCONNECTED);
            onDisconnect?.();
          },
          onError: (err) => {
            logger.error('useWebSocket', 'WebSocket error', { error: err });
            setError(err);
            onError?.(err);
          },
          onReconnecting: (attempt) => {
            logger.info('useWebSocket', `Reconnecting (attempt ${attempt})`);
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
      logger.error('useWebSocket', 'Connection failed', { error });
      setError(error);
      setState(WebSocketState.ERROR);
    }
  }, [user?.id, config, onConnect, onDisconnect, onError]);

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
    if (autoConnect && user && !isInitialized.current) {
      connect();
    }
  }, [autoConnect, user, connect]);

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
