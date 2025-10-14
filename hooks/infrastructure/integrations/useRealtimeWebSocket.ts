/**
 * React Hook for WebSocket Real-time Features
 * Provides easy-to-use WebSocket functionality for React components
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
import { logger } from '@/lib/shared/utils/logger';
  getWebSocketManager,
  subscribeToNotifications,
  subscribeToMessages,
  subscribeToPresence,
  subscribeToTyping,
  subscribeToConnection,
  updatePresence,
  sendTypingIndicator,
  getConnectionStats,
  type PresenceStatus,
  type ConnectionStats,
} from '@/lib/infrastructure/websocket';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  enablePresence?: boolean;
  debug?: boolean;
}

interface UseWebSocketReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  stats: ConnectionStats;

  // Connection methods
  connect: () => Promise<void>;
  disconnect: () => void;

  // Presence methods
  updatePresence: (status: PresenceStatus['status']) => void;

  // Typing indicators
  sendTyping: (conversationId: string, isTyping: boolean) => void;

  // Send custom message
  send: <T = unknown>(type: string, payload: T) => boolean;
}

/**
 * Main WebSocket hook for real-time features
 */
export function useWebSocket(
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const { autoConnect = true, enablePresence = true, debug = false } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [stats, setStats] = useState<ConnectionStats>({
    isConnected: false,
    reconnectAttempts: 0,
    messagesSent: 0,
    messagesReceived: 0,
    errors: 0,
  });

  const wsManagerRef = useRef(getWebSocketManager());
  const presenceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getConnectionStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Connection monitoring
  useEffect(() => {
    const unsubscribe = subscribeToConnection((data) => {
      if (debug) {
        logger.debug('[useWebSocket] Connection status:', data.status);
      }

      setIsConnected(data.status === 'connected');
      setIsConnecting(data.status === 'connecting');
    });

    return unsubscribe;
  }, [debug]);

  // Auto-connect on mount
  useEffect(() => {
    if (!autoConnect) return;

    const wsManager = wsManagerRef.current;
    const connect = async () => {
      try {
        setIsConnecting(true);
        await wsManager.connect();
        setIsConnected(true);
      } catch (error) {
        if (debug) {
          logger.error('[useWebSocket] Connection failed:', error);
        }
      } finally {
        setIsConnecting(false);
      }
    };

    connect();

    return () => {
      wsManager.disconnect();
      setIsConnected(false);
    };
  }, [autoConnect, debug]);

  // Auto presence updates
  useEffect(() => {
    if (!enablePresence || !isConnected) return;

    // Send initial presence
    updatePresence('online');

    // Update presence every 30 seconds
    presenceIntervalRef.current = setInterval(() => {
      updatePresence('online');
    }, 30000);

    // Update presence on visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away');
      } else {
        updatePresence('online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (presenceIntervalRef.current) {
        clearInterval(presenceIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      updatePresence('offline');
    };
  }, [enablePresence, isConnected]);

  // Connection methods
  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      await wsManagerRef.current.connect();
      setIsConnected(true);
    } catch (error) {
      if (debug) {
        logger.error('[useWebSocket] Connection failed:', error);
      }
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [debug]);

  const disconnect = useCallback(() => {
    wsManagerRef.current.disconnect();
    setIsConnected(false);
  }, []);

  // Presence methods
  const handleUpdatePresence = useCallback(
    (status: PresenceStatus['status']) => {
      updatePresence(status);
    },
    []
  );

  // Typing methods
  const sendTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      sendTypingIndicator(conversationId, isTyping);
    },
    []
  );

  // Send custom message
  const send = useCallback(<T = unknown>(type: string, payload: T): boolean => {
    return wsManagerRef.current.send(type as never, payload);
  }, []);

  return {
    isConnected,
    isConnecting,
    stats,
    connect,
    disconnect,
    updatePresence: handleUpdatePresence,
    sendTyping,
    send,
  };
}

/**
 * Hook for subscribing to real-time notifications
 */
export function useNotifications<T = unknown>(
  callback: (notification: T) => void,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const unsubscribe = subscribeToNotifications<T>(callback);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook for subscribing to real-time messages
 */
export function useMessages<T = unknown>(
  callback: (message: T) => void,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const unsubscribe = subscribeToMessages<T>(callback);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook for tracking user presence
 */
export function usePresence(
  callback: (presence: PresenceStatus) => void,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const unsubscribe = subscribeToPresence(callback);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook for tracking typing indicators
 */
export function useTypingIndicator(
  callback: (data: {
    userId: string;
    conversationId: string;
    isTyping: boolean;
  }) => void,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const unsubscribe = subscribeToTyping(callback);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook for managing typing indicator in a conversation
 */
export function useConversationTyping(conversationId: string) {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track other users' typing status
  useTypingIndicator(
    (data) => {
      if (data.conversationId !== conversationId) return;

      if (data.isTyping) {
        setTypingUsers((prev) =>
          prev.includes(data.userId) ? prev : [...prev, data.userId]
        );
      } else {
        setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
      }
    },
    [conversationId]
  );

  // Stop typing
  const stopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      sendTypingIndicator(conversationId, false);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [conversationId, isTyping]);

  // Start typing
  const startTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(conversationId, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [conversationId, isTyping, stopTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        sendTypingIndicator(conversationId, false);
      }
    };
  }, [conversationId, isTyping]);

  return {
    isTyping,
    typingUsers,
    startTyping,
    stopTyping,
  };
}
