/**
 * ================================================
 * WEBSOCKET HOOKS - Unified Exports
 * ================================================
 *
 * React hooks for WebSocket integration.
 *
 * @version 2.0.0
 * @sprint Sprint 1 - Real-time Messaging
 */

// Main WebSocket hook (unified, production-ready)
export { useWebSocket as useStompWebSocket } from './useWebSocket';
export { useWebSocket } from './useWebSocket'; // Default export

export type { UseWebSocketOptions, UseWebSocketReturn } from './useWebSocket';
