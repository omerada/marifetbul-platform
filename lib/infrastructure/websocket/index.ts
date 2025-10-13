/**
 * WebSocket Infrastructure Exports
 * Centralized exports for real-time communication
 */

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
