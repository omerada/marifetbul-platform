/**
 * WebSocket Client Infrastructure
 *
 * Provides real-time communication using STOMP over WebSocket.
 * Backend: Spring WebSocket with STOMP protocol
 * Endpoint: /ws (with SockJS fallback)
 *
 * Features:
 * - Auto-connection with JWT authentication
 * - Auto-reconnection on disconnect
 * - Heartbeat monitoring
 * - Topic subscriptions
 * - Error handling
 * - Connection state management
 *
 * @sprint Sprint 5 - Real-time Messaging
 */

import { Client, IFrame, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { logger } from '@/lib/shared/utils/logger';

// ==================== TYPES ====================

export enum WebSocketState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR',
}

export interface WebSocketConfig {
  /** WebSocket endpoint URL */
  url: string;
  /** JWT token for authentication */
  token: string;
  /** Auto-reconnect on disconnect (default: true) */
  autoReconnect?: boolean;
  /** Initial reconnect delay in ms (default: 1000) */
  reconnectDelay?: number;
  /** Max reconnect delay in ms (default: 30000) */
  maxReconnectDelay?: number;
  /** Max reconnect attempts (default: 10, 0 = infinite) */
  maxReconnectAttempts?: number;
  /** Heartbeat interval in ms (default: 10000) */
  heartbeatInterval?: number;
  /** Debug mode (default: false) */
  debug?: boolean;
}

export interface SubscriptionCallback {
  (message: unknown): void;
}

export interface WebSocketEventHandlers {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onReconnecting?: (attempt: number) => void;
  onStateChange?: (state: WebSocketState) => void;
}

// ==================== WEBSOCKET SERVICE ====================

export class WebSocketService {
  private client: Client | null = null;
  private config: Required<WebSocketConfig>;
  private state: WebSocketState = WebSocketState.DISCONNECTED;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private eventHandlers: WebSocketEventHandlers = {};

  constructor(config: WebSocketConfig) {
    this.config = {
      autoReconnect: true,
      reconnectDelay: 1000,
      maxReconnectDelay: 30000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 10000,
      debug: false,
      ...config,
    } as Required<WebSocketConfig>;
  }

  // ==================== CONNECTION ====================

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (
      this.state === WebSocketState.CONNECTED ||
      this.state === WebSocketState.CONNECTING
    ) {
      logger.warn('WebSocketService', 'Already connected or connecting');
      return;
    }

    this.setState(WebSocketState.CONNECTING);
    logger.info('WebSocketService', 'Connecting to WebSocket...', {
      url: this.config.url,
    });

    try {
      // Create STOMP client with SockJS
      this.client = new Client({
        webSocketFactory: () => new SockJS(this.config.url) as WebSocket,

        // Authentication headers
        connectHeaders: {
          Authorization: `Bearer ${this.config.token}`,
        },

        // Heartbeat configuration (send, receive in ms)
        heartbeatIncoming: this.config.heartbeatInterval,
        heartbeatOutgoing: this.config.heartbeatInterval,

        // Reconnect configuration
        reconnectDelay: this.config.reconnectDelay,

        // Debug logging
        debug: this.config.debug
          ? (str) => logger.debug('STOMP', str)
          : undefined,

        // Connection callbacks
        onConnect: this.onConnect.bind(this),
        onDisconnect: this.onDisconnect.bind(this),
        onStompError: this.onStompError.bind(this),
        onWebSocketError: this.onWebSocketError.bind(this),
      });

      // Activate the client
      this.client.activate();
    } catch (error) {
      logger.error('WebSocketService', 'Failed to create client', { error });
      this.setState(WebSocketState.ERROR);
      this.handleReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    logger.info('WebSocketService', 'Disconnecting...');

    // Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Unsubscribe all
    this.unsubscribeAll();

    // Deactivate client
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.setState(WebSocketState.DISCONNECTED);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return (
      this.state === WebSocketState.CONNECTED && this.client?.connected === true
    );
  }

  /**
   * Get current state
   */
  getState(): WebSocketState {
    return this.state;
  }

  // ==================== SUBSCRIPTIONS ====================

  /**
   * Subscribe to a topic
   *
   * @param destination Topic destination (e.g., /topic/messages)
   * @param callback Callback function for messages
   * @returns Subscription ID
   */
  subscribe(destination: string, callback: SubscriptionCallback): string {
    if (!this.isConnected() || !this.client) {
      throw new Error('WebSocket not connected');
    }

    // Check if already subscribed
    if (this.subscriptions.has(destination)) {
      logger.warn('WebSocketService', `Already subscribed to ${destination}`);
      return destination;
    }

    logger.info('WebSocketService', `Subscribing to ${destination}`);

    const subscription = this.client.subscribe(
      destination,
      (message: IMessage) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          logger.error('WebSocketService', 'Failed to parse message', {
            error,
            body: message.body,
          });
        }
      }
    );

    this.subscriptions.set(destination, subscription);
    return destination;
  }

  /**
   * Unsubscribe from a topic
   *
   * @param destination Topic destination
   */
  unsubscribe(destination: string): void {
    const subscription = this.subscriptions.get(destination);

    if (subscription) {
      logger.info('WebSocketService', `Unsubscribing from ${destination}`);
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  /**
   * Unsubscribe from all topics
   */
  unsubscribeAll(): void {
    logger.info(
      'WebSocketService',
      `Unsubscribing from ${this.subscriptions.size} topics`
    );

    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });

    this.subscriptions.clear();
  }

  // ==================== MESSAGING ====================

  /**
   * Send a message to destination
   *
   * @param destination Destination (e.g., /app/chat.send)
   * @param body Message body (will be JSON stringified)
   */
  send(destination: string, body: unknown): void {
    if (!this.isConnected() || !this.client) {
      throw new Error('WebSocket not connected');
    }

    logger.debug('WebSocketService', `Sending message to ${destination}`, {
      body,
    });

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  // ==================== EVENT HANDLERS ====================

  /**
   * Set event handlers
   */
  setEventHandlers(handlers: WebSocketEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  /**
   * Remove event handlers
   */
  clearEventHandlers(): void {
    this.eventHandlers = {};
  }

  // ==================== PRIVATE METHODS ====================

  private onConnect(frame: IFrame): void {
    logger.info('WebSocketService', 'Connected to WebSocket', { frame });
    this.setState(WebSocketState.CONNECTED);
    this.reconnectAttempts = 0;

    if (this.eventHandlers.onConnect) {
      this.eventHandlers.onConnect();
    }
  }

  private onDisconnect(): void {
    logger.info('WebSocketService', 'Disconnected from WebSocket');
    this.setState(WebSocketState.DISCONNECTED);

    // Clear all subscriptions
    this.subscriptions.clear();

    if (this.eventHandlers.onDisconnect) {
      this.eventHandlers.onDisconnect();
    }

    // Handle reconnection if enabled
    if (this.config.autoReconnect) {
      this.handleReconnect();
    }
  }

  private onStompError(frame: IFrame): void {
    logger.error('WebSocketService', 'STOMP error', { frame });
    this.setState(WebSocketState.ERROR);

    const error = new Error(`STOMP Error: ${frame.headers['message']}`);

    if (this.eventHandlers.onError) {
      this.eventHandlers.onError(error);
    }
  }

  private onWebSocketError(event: Event): void {
    logger.error('WebSocketService', 'WebSocket error', { event });
    this.setState(WebSocketState.ERROR);

    const error = new Error('WebSocket Error');

    if (this.eventHandlers.onError) {
      this.eventHandlers.onError(error);
    }
  }

  private handleReconnect(): void {
    // Check max attempts
    if (
      this.config.maxReconnectAttempts > 0 &&
      this.reconnectAttempts >= this.config.maxReconnectAttempts
    ) {
      logger.error('WebSocketService', 'Max reconnect attempts reached');
      this.setState(WebSocketState.ERROR);
      return;
    }

    this.reconnectAttempts++;
    this.setState(WebSocketState.RECONNECTING);

    // Exponential backoff: delay = min(initialDelay * 2^attempts, maxDelay)
    const exponentialDelay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.config.maxReconnectDelay
    );

    // Add jitter (random 0-20% variance) to prevent thundering herd
    const jitter = exponentialDelay * 0.2 * Math.random();
    const actualDelay = exponentialDelay + jitter;

    logger.info(
      'WebSocketService',
      `Reconnecting in ${Math.round(actualDelay)}ms... (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts || '∞'})`
    );

    if (this.eventHandlers.onReconnecting) {
      this.eventHandlers.onReconnecting(this.reconnectAttempts);
    }

    // Clear existing timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Schedule reconnect with exponential backoff
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, actualDelay);
  }

  private setState(newState: WebSocketState): void {
    const oldState = this.state;
    this.state = newState;

    if (oldState !== newState) {
      logger.info(
        'WebSocketService',
        `State changed: ${oldState} → ${newState}`
      );

      if (this.eventHandlers.onStateChange) {
        this.eventHandlers.onStateChange(newState);
      }
    }
  }
}

// ==================== SINGLETON INSTANCE ====================

let webSocketServiceInstance: WebSocketService | null = null;

/**
 * Get WebSocket service instance (singleton)
 * Must call initWebSocketService first
 */
export function getWebSocketService(): WebSocketService {
  if (!webSocketServiceInstance) {
    throw new Error(
      'WebSocket service not initialized. Call initWebSocketService first.'
    );
  }
  return webSocketServiceInstance;
}

/**
 * Initialize WebSocket service
 */
export function initWebSocketService(
  config: WebSocketConfig
): WebSocketService {
  if (webSocketServiceInstance) {
    logger.warn(
      'WebSocketService',
      'Already initialized, disconnecting old instance'
    );
    webSocketServiceInstance.disconnect();
  }

  webSocketServiceInstance = new WebSocketService(config);
  return webSocketServiceInstance;
}

/**
 * Destroy WebSocket service
 */
export function destroyWebSocketService(): void {
  if (webSocketServiceInstance) {
    webSocketServiceInstance.disconnect();
    webSocketServiceInstance = null;
  }
}
