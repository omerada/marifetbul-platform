/**
 * Service Layer Index
 * Exports all domain services for use in the application
 */

// Base service functionality
export {
  BaseService,
  ServiceError,
  createSuccessResult,
  createErrorResult,
} from './base';
export type {
  ServiceResult,
  ServiceOptions,
  ServiceContext,
  PaginationOptions,
  PaginatedResult,
  CacheConfig,
} from './base';

// WebSocket Manager
export { WebSocketManager, getWebSocketManager } from './websocket';
export type {
  WebSocketConfig,
  WebSocketMessage,
  WebSocketEventHandler,
} from './websocket';
