/**
 * WebSocket Infrastructure Exports
 * Centralized exports for real-time communication
 */

// New STOMP-based WebSocket Service (Sprint 5)
export {
  WebSocketService,
  WebSocketState,
  getWebSocketService,
  initWebSocketService,
  destroyWebSocketService,
} from './WebSocketService';

export type {
  WebSocketConfig,
  SubscriptionCallback,
  WebSocketEventHandlers,
} from './WebSocketService';

// Legacy WebSocket Manager (keeping for backward compatibility)
export {
  WebSocketManager,
  getWebSocketManager,
  initializeWebSocket,
  cleanupWebSocket,
  // Presence tracking
  updatePresence,
  subscribeToPresence,
  sendTypingIndicator,
  subscribeToTyping,
  // Real-time subscriptions
  subscribeToNotifications,
  subscribeToMessages,
  subscribeToOrderUpdates,
  subscribeToPaymentUpdates,
  // Connection monitoring
  subscribeToConnection,
  getConnectionStats,
  isWebSocketConnected,
} from '../websocket';

export type {
  WebSocketMessage,
  WebSocketOptions,
  WebSocketEventType,
  WebSocketEventHandler,
  PresenceStatus,
  ConnectionStats,
} from '../websocket';
