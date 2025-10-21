/**
 * ===================================================================================
 * WEBSOCKET CLIENT - Production-Ready Real-Time Communication
 * ===================================================================================
 * WebSocket client for real-time messaging, notifications, and order updates
 *
 * Backend WebSocket Endpoint: ws://localhost:8080/ws
 * Production: wss://api.marifetbul.com/ws
 *
 * @version 2.0.0
 * @author MarifetBul Development Team
 */

import { getWebSocketUrl } from '@/lib/config/api';
import { apiLogger } from '../monitoring/logger';

// ================================================
// TYPES
// ================================================

export type WebSocketEventType =
  | 'MESSAGE_RECEIVED'
  | 'ORDER_UPDATED'
  | 'NOTIFICATION_RECEIVED'
  | 'PROPOSAL_STATUS_CHANGED'
  | 'PAYMENT_COMPLETED'
  | 'USER_ONLINE'
  | 'USER_OFFLINE'
  | 'TYPING_START'
  | 'TYPING_END';

export interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType;
  payload: T;
  timestamp: string;
  userId?: string;
}

export interface WebSocketOptions {
  reconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  debug?: boolean;
}

type WebSocketEventHandler<T = unknown> = (data: T) => void;

// ================================================
// WEBSOCKET CLIENT CLASS
// ================================================

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private options: Required<WebSocketOptions>;
  private eventHandlers: Map<WebSocketEventType, Set<WebSocketEventHandler>>;
  private reconnectAttempts: number = 0;
  private reconnectTimeout?: NodeJS.Timeout;
  private heartbeatInterval?: NodeJS.Timeout;
  private isConnecting: boolean = false;
  private shouldReconnect: boolean = true;

  constructor(options: WebSocketOptions = {}) {
    this.url = getWebSocketUrl();
    this.options = {
      reconnect: options.reconnect ?? true,
      reconnectDelay: options.reconnectDelay ?? 3000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 10,
      heartbeatInterval: options.heartbeatInterval ?? 30000,
      debug: options.debug ?? false,
    };
    this.eventHandlers = new Map();

    this.log('WebSocket client initialized', { url: this.url });
  }

  // ==================== CONNECTION MANAGEMENT ====================

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.log('WebSocket already connected');
        resolve();
        return;
      }

      if (this.isConnecting) {
        this.log('WebSocket connection already in progress');
        return;
      }

      this.isConnecting = true;
      this.log('Connecting to WebSocket...', { url: this.url });

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.log('WebSocket connected successfully');

          // Start heartbeat
          this.startHeartbeat();

          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onerror = (error) => {
          this.isConnecting = false;
          this.log('WebSocket error', { error }, 'error');
          reject(error);
        };

        this.ws.onclose = (event) => {
          this.isConnecting = false;
          this.log('WebSocket closed', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });

          this.stopHeartbeat();
          this.handleDisconnection();
        };
      } catch (error) {
        this.isConnecting = false;
        this.log('Failed to create WebSocket connection', { error }, 'error');
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.shouldReconnect = false;
    this.stopHeartbeat();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.log('WebSocket disconnected');
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // ==================== MESSAGE HANDLING ====================

  /**
   * Send message to server
   */
  send<T = unknown>(type: WebSocketEventType, payload: T): boolean {
    if (!this.isConnected()) {
      this.log('Cannot send message: not connected', { type }, 'warn');
      return false;
    }

    const message: WebSocketMessage<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    try {
      this.ws!.send(JSON.stringify(message));
      this.log('Message sent', { type });
      return true;
    } catch (error) {
      this.log('Failed to send message', { type, error }, 'error');
      return false;
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.log('Message received', { type: message.type });

      // Emit to registered handlers
      const handlers = this.eventHandlers.get(message.type);
      if (handlers) {
        handlers.forEach((handler) => {
          try {
            handler(message.payload);
          } catch (error) {
            this.log(
              'Error in event handler',
              { type: message.type, error },
              'error'
            );
          }
        });
      }
    } catch (error) {
      this.log('Failed to parse WebSocket message', { error }, 'error');
    }
  }

  // ==================== EVENT SUBSCRIPTION ====================

  /**
   * Subscribe to WebSocket events
   */
  on<T = unknown>(
    type: WebSocketEventType,
    handler: WebSocketEventHandler<T>
  ): () => void {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, new Set());
    }

    this.eventHandlers.get(type)!.add(handler as WebSocketEventHandler);
    this.log('Event handler registered', { type });

    // Return unsubscribe function
    return () => {
      this.off(type, handler);
    };
  }

  /**
   * Unsubscribe from WebSocket events
   */
  off<T = unknown>(
    type: WebSocketEventType,
    handler: WebSocketEventHandler<T>
  ): void {
    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.delete(handler as WebSocketEventHandler);
      this.log('Event handler unregistered', { type });
    }
  }

  /**
   * Remove all event handlers for a type
   */
  removeAllListeners(type?: WebSocketEventType): void {
    if (type) {
      this.eventHandlers.delete(type);
      this.log('All event handlers removed', { type });
    } else {
      this.eventHandlers.clear();
      this.log('All event handlers removed');
    }
  }

  // ==================== RECONNECTION ====================

  /**
   * Handle disconnection and attempt reconnect
   */
  private handleDisconnection(): void {
    if (!this.shouldReconnect || !this.options.reconnect) {
      return;
    }

    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.log('Max reconnection attempts reached', {}, 'error');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.options.reconnectDelay * this.reconnectAttempts;

    this.log('Attempting to reconnect...', {
      attempt: this.reconnectAttempts,
      delay,
    });

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch((error) => {
        this.log('Reconnection failed', { error }, 'error');
      });
    }, delay);
  }

  // ==================== HEARTBEAT ====================

  /**
   * Start sending heartbeat pings
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send('TYPING_END', {}); // Using as ping
        this.log('Heartbeat ping sent');
      }
    }, this.options.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  // ==================== LOGGING ====================

  /**
   * Log WebSocket events
   */
  private log(
    message: string,
    data?: Record<string, unknown>,
    level: 'info' | 'warn' | 'error' = 'info'
  ): void {
    if (!this.options.debug && level === 'info') {
      return;
    }

    const logData = {
      component: 'WebSocketClient',
      ...data,
    };

    switch (level) {
      case 'error':
        apiLogger.error(message, new Error(message), logData);
        break;
      case 'warn':
        apiLogger.warn(message, logData);
        break;
      default:
        apiLogger.debug(message, logData);
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get connection state
   */
  getState(): 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' | 'NOT_CONNECTED' {
    if (!this.ws) return 'NOT_CONNECTED';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'NOT_CONNECTED';
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      state: this.getState(),
      reconnectAttempts: this.reconnectAttempts,
      isConnecting: this.isConnecting,
      shouldReconnect: this.shouldReconnect,
      eventHandlerCount: this.eventHandlers.size,
    };
  }
}

// ================================================
// SINGLETON INSTANCE
// ================================================

let wsClientInstance: WebSocketClient | null = null;

/**
 * Get WebSocket client singleton
 */
export function getWebSocketClient(
  options?: WebSocketOptions
): WebSocketClient {
  if (!wsClientInstance) {
    wsClientInstance = new WebSocketClient(options);
  }
  return wsClientInstance;
}

/**
 * Initialize WebSocket connection
 */
export async function initializeWebSocket(
  options?: WebSocketOptions
): Promise<WebSocketClient> {
  const client = getWebSocketClient(options);

  if (!client.isConnected()) {
    await client.connect();
  }

  return client;
}

// ================================================
// EXPORTS
// ================================================

export default WebSocketClient;
export { WebSocketClient };
