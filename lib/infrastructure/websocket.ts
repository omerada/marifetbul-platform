/**
 * WebSocket Manager for Real-time Communication
 * Handles WebSocket connections, reconnection logic, and event management
 */

import { getCurrentUserId, getAuthToken } from '@/lib/utils/auth';

export interface WebSocketMessage {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
  userId?: string;
}

export interface WebSocketOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  enableHeartbeat?: boolean;
}

export type WebSocketEventType =
  | 'notification'
  | 'message'
  | 'user_status'
  | 'order_update'
  | 'system_alert'
  | 'heartbeat';

export interface WebSocketEventHandler {
  (data: Record<string, unknown>): void;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private options: Required<WebSocketOptions>;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private eventHandlers: Map<WebSocketEventType, Set<WebSocketEventHandler>> =
    new Map();
  private isConnecting = false;
  private lastPongTime = 0;

  constructor(options: WebSocketOptions) {
    this.options = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      enableHeartbeat: true,
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
        // Add auth token to WebSocket URL if available
        const token = getAuthToken();
        const userId = getCurrentUserId();
        const wsUrl = new URL(this.options.url);

        if (token) {
          wsUrl.searchParams.set('token', token);
        }
        if (userId) {
          wsUrl.searchParams.set('userId', userId);
        }

        this.ws = new WebSocket(wsUrl.toString());

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;

          if (this.options.enableHeartbeat) {
            this.startHeartbeat();
          }

          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();

          if (
            !event.wasClean &&
            this.reconnectAttempts < this.options.maxReconnectAttempts
          ) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
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
  send(type: WebSocketEventType, payload: Record<string, unknown>): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send message');
      return false;
    }

    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      userId: getCurrentUserId() || undefined,
    };

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }

  /**
   * Subscribe to WebSocket events
   */
  on(
    eventType: WebSocketEventType,
    handler: WebSocketEventHandler
  ): () => void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.add(handler);
    }

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * Unsubscribe from WebSocket events
   */
  off(eventType: WebSocketEventType, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
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
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      // Handle heartbeat/pong messages
      if (message.type === 'heartbeat' && message.payload.type === 'pong') {
        this.lastPongTime = Date.now();
        return;
      }

      // Emit to registered handlers
      const handlers = this.eventHandlers.get(
        message.type as WebSocketEventType
      );
      if (handlers) {
        handlers.forEach((handler) => {
          try {
            handler(message.payload);
          } catch (error) {
            console.error('Error in WebSocket event handler:', error);
          }
        });
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
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
    const delay = Math.min(
      this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    console.log(
      `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);

        if (this.reconnectAttempts < this.options.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else {
          console.error('Max reconnection attempts reached');
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
          console.warn('Heartbeat timeout, reconnecting...');
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
    console.log('WebSocket initialized successfully');
    return wsManager;
  } catch (error) {
    console.error('Failed to initialize WebSocket:', error);
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
