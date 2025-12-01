/**
 * WebSocket Manager for Real-time Communication
 * Handles WebSocket connections, reconnection logic, and event management
 * - Cookie-based authentication
 * - Automatic reconnection with exponential backoff
 * - Heartbeat/ping-pong mechanism
 * - Presence tracking
 * - Type-safe event system
 */

import { getCurrentUserId } from '@/lib/domains/auth/utils';
import logger from '@/lib/infrastructure/monitoring/logger';

export interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType;
  payload: T;
  timestamp: string;
  userId?: string;
  messageId?: string;
}

export interface WebSocketOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  enableHeartbeat?: boolean;
  debug?: boolean;
}

export type WebSocketEventType =
  | 'notification'
  | 'message'
  | 'user_status'
  | 'presence'
  | 'typing'
  | 'order_update'
  | 'payment_update'
  | 'system_alert'
  | 'heartbeat'
  | 'connection'
  | 'error';

export interface PresenceStatus {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: string;
}

export interface ConnectionStats {
  isConnected: boolean;
  reconnectAttempts: number;
  lastConnectedAt?: string;
  lastDisconnectedAt?: string;
  messagesSent: number;
  messagesReceived: number;
  errors: number;
}

export type WebSocketEventHandler<T = unknown> = (data: T) => void;

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private options: Required<WebSocketOptions>;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private eventHandlers: Map<
    WebSocketEventType,
    Set<WebSocketEventHandler<unknown>>
  > = new Map();
  private isConnecting = false;
  private lastPongTime = 0;
  private stats: ConnectionStats = {
    isConnected: false,
    reconnectAttempts: 0,
    messagesSent: 0,
    messagesReceived: 0,
    errors: 0,
  };

  constructor(options: WebSocketOptions) {
    this.options = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      enableHeartbeat: true,
      debug: false,
      ...options,
    };

    // Initialize event handler sets
    const eventTypes: WebSocketEventType[] = [
      'notification',
      'message',
      'user_status',
      'order_update',
      'system_alert',
      'heartbeat',
    ];

    eventTypes.forEach((type) => {
      this.eventHandlers.set(type, new Set());
    });
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (
        this.isConnecting ||
        (this.ws && this.ws.readyState === WebSocket.CONNECTING)
      ) {
        reject(new Error('Connection already in progress'));
        return;
      }

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        // Cookie-based auth - credentials sent automatically
        const userId = getCurrentUserId();
        const wsUrl = new URL(this.options.url);

        // Add userId to URL for routing (optional)
        if (userId) {
          wsUrl.searchParams.set('userId', userId);
        }

        this.ws = new WebSocket(wsUrl.toString());

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.stats.isConnected = true;
          this.stats.reconnectAttempts = 0;
          this.stats.lastConnectedAt = new Date().toISOString();

          if (this.options.debug) {
            logger.debug('WebSocket: Connected to', this.options.url);
          }

          if (this.options.enableHeartbeat) {
            this.startHeartbeat();
          }

          // Emit connection event
          this.emitEvent('connection', { status: 'connected' });

          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          this.isConnecting = false;
          this.stats.isConnected = false;
          this.stats.lastDisconnectedAt = new Date().toISOString();
          this.stopHeartbeat();

          if (this.options.debug) {
            logger.debug('WebSocket: Disconnected', {
              code: event.code,
              reason: event.reason,
            });
          }

          // Emit connection event
          this.emitEvent('connection', {
            status: 'disconnected',
            code: event.code,
          });

          if (
            !event.wasClean &&
            this.reconnectAttempts < this.options.maxReconnectAttempts
          ) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          this.stats.errors++;
          this.isConnecting = false;

          if (this.options.debug) {
            logger.error(
              'WebSocket: Error',
              error instanceof Error ? error : new Error(String(error))
            );
          }

          // Emit error event
          this.emitEvent('error', { error: error.toString() });

          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    this.reconnectAttempts = 0;
  }

  /**
   * Send message through WebSocket
   */
  send<T = unknown>(type: WebSocketEventType, payload: T): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      if (this.options.debug) {
        logger.warn('WebSocket: Cannot send, not connected');
      }
      return false;
    }

    const message: WebSocketMessage<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      userId: getCurrentUserId() || undefined,
      messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    try {
      this.ws.send(JSON.stringify(message));
      this.stats.messagesSent++;

      if (this.options.debug) {
        logger.debug('WebSocket: Sent', { type, payload });
      }

      return true;
    } catch (error) {
      this.stats.errors++;
      if (this.options.debug) {
        logger.error(
          'WebSocket: Send failed',
          error instanceof Error ? error : new Error(String(error))
        );
      }
      return false;
    }
  }

  /**
   * Subscribe to WebSocket events
   */
  on<T = unknown>(
    eventType: WebSocketEventType,
    handler: WebSocketEventHandler<T>
  ): () => void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.add(handler as WebSocketEventHandler<unknown>);
    }

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        handlers.delete(handler as WebSocketEventHandler<unknown>);
      }
    };
  }

  /**
   * Unsubscribe from WebSocket events
   */
  off<T = unknown>(
    eventType: WebSocketEventType,
    handler: WebSocketEventHandler<T>
  ): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler as WebSocketEventHandler<unknown>);
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state
   */
  getReadyState(): number | null {
    return this.ws?.readyState || null;
  }

  /**
   * Get connection statistics
   */
  getStats(): ConnectionStats {
    return { ...this.stats };
  }

  /**
   * Emit event to handlers (internal helper)
   */
  private emitEvent<T = unknown>(type: WebSocketEventType, payload: T): void {
    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(payload);
        } catch (error) {
          if (this.options.debug) {
            logger.error(
              'WebSocket: Handler error',
              error instanceof Error ? error : new Error(String(error))
            );
          }
        }
      });
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.stats.messagesReceived++;

      if (this.options.debug) {
        logger.debug('WebSocket: Received', {
          type: message.type,
          payload: message.payload,
        });
      }

      // Handle heartbeat/pong messages
      if (message.type === 'heartbeat') {
        const heartbeatPayload = message.payload as { type?: string };
        if (heartbeatPayload?.type === 'pong') {
          this.lastPongTime = Date.now();
          return;
        }
      }

      // Emit to registered handlers
      this.emitEvent(message.type, message.payload);
    } catch (error) {
      this.stats.errors++;
      if (this.options.debug) {
        logger.error(
          'WebSocket: Parse error',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    this.stats.reconnectAttempts = this.reconnectAttempts;

    const delay = Math.min(
      this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    if (this.options.debug) {
      logger.debug(
        `WebSocket: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`
      );
    }

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        logger.error(
          'WebSocket: Reconnection failed',
          error instanceof Error ? error : new Error(String(error))
        );

        if (this.reconnectAttempts < this.options.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else {
          logger.error('WebSocket: Max reconnection attempts reached');
        }
      });
    }, delay);
  }

  /**
   * Start heartbeat mechanism
   */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.lastPongTime = Date.now();

    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        // Send ping
        this.send('heartbeat', { type: 'ping', timestamp: Date.now() });

        // Check if we received pong recently
        const timeSinceLastPong = Date.now() - this.lastPongTime;
        if (timeSinceLastPong > this.options.heartbeatInterval * 2) {
          logger.warn('WebSocket: Heartbeat timeout, reconnecting...');
          this.ws.close(1000, 'Heartbeat timeout');
        }
      }
    }, this.options.heartbeatInterval);
  }

  /**
   * Stop heartbeat mechanism
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

// Singleton instance for global use
let globalWebSocketManager: WebSocketManager | null = null;

/**
 * Get or create global WebSocket manager instance
 */
export function getWebSocketManager(): WebSocketManager {
  if (!globalWebSocketManager) {
    // Use environment variable or default to localhost in development
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws';

    globalWebSocketManager = new WebSocketManager({
      url: wsUrl,
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      enableHeartbeat: true,
    });
  }

  return globalWebSocketManager;
}

/**
 * Initialize WebSocket connection with authentication
 */
export async function initializeWebSocket(): Promise<WebSocketManager> {
  const wsManager = getWebSocketManager();

  try {
    await wsManager.connect();
    return wsManager;
  } catch (error) {
    logger.error(
      'Failed to initialize WebSocket',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Clean up WebSocket connection
 */
export function cleanupWebSocket(): void {
  if (globalWebSocketManager) {
    globalWebSocketManager.disconnect();
    globalWebSocketManager = null;
  }
}

/**
 * Presence Tracking Helpers
 */

/**
 * Update user presence status
 */
export function updatePresence(status: PresenceStatus['status']): void {
  const wsManager = getWebSocketManager();
  const userId = getCurrentUserId();

  if (!userId) return;

  wsManager.send('presence', {
    userId,
    status,
    lastSeen: new Date().toISOString(),
  });
}

/**
 * Subscribe to presence updates
 */
export function subscribeToPresence(
  callback: (presence: PresenceStatus) => void
): () => void {
  const wsManager = getWebSocketManager();
  return wsManager.on<PresenceStatus>('presence', callback);
}

/**
 * Send typing indicator
 */
export function sendTypingIndicator(
  conversationId: string,
  isTyping: boolean
): void {
  const wsManager = getWebSocketManager();
  const userId = getCurrentUserId();

  if (!userId) return;

  wsManager.send('typing', {
    userId,
    conversationId,
    isTyping,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Subscribe to typing indicators
 */
export function subscribeToTyping(
  callback: (data: {
    userId: string;
    conversationId: string;
    isTyping: boolean;
  }) => void
): () => void {
  const wsManager = getWebSocketManager();
  return wsManager.on('typing', callback);
}

/**
 * Notification Helpers
 */

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications<T = unknown>(
  callback: (notification: T) => void
): () => void {
  const wsManager = getWebSocketManager();
  return wsManager.on<T>('notification', callback);
}

/**
 * Message Helpers
 */

/**
 * Subscribe to real-time messages
 */
export function subscribeToMessages<T = unknown>(
  callback: (message: T) => void
): () => void {
  const wsManager = getWebSocketManager();
  return wsManager.on<T>('message', callback);
}

/**
 * Order Update Helpers
 */

/**
 * Subscribe to order updates
 */
export function subscribeToOrderUpdates<T = unknown>(
  callback: (update: T) => void
): () => void {
  const wsManager = getWebSocketManager();
  return wsManager.on<T>('order_update', callback);
}

/**
 * Payment Update Helpers
 */

/**
 * Subscribe to payment updates
 */
export function subscribeToPaymentUpdates<T = unknown>(
  callback: (update: T) => void
): () => void {
  const wsManager = getWebSocketManager();
  return wsManager.on<T>('payment_update', callback);
}

/**
 * Connection Monitoring
 */

/**
 * Subscribe to connection status changes
 */
export function subscribeToConnection(
  callback: (data: { status: string; code?: number }) => void
): () => void {
  const wsManager = getWebSocketManager();
  return wsManager.on('connection', callback);
}

/**
 * Get connection statistics
 */
export function getConnectionStats(): ConnectionStats {
  const wsManager = getWebSocketManager();
  return wsManager.getStats();
}

/**
 * Check if WebSocket is connected
 */
export function isWebSocketConnected(): boolean {
  const wsManager = getWebSocketManager();
  return wsManager.isConnected();
}
