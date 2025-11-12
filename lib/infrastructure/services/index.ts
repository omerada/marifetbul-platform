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

// API Services
export { JobService } from './api/jobService';
export { PackageService } from './api/packageService';
export { AuthService, UserService } from './api/authService';

// Other Services
export { MessagingService } from './messaging.service';
export { NotificationService } from './notification.service';

// Service Types
export type {
  SendMessageRequest,
  CreateConversationRequest,
  SendMessageData,
  CreateConversationData,
} from './messaging.service';

// Note: PaymentService removed - Use lib/api/payment.ts instead (production-ready)

export type {
  CreateNotificationRequest,
  NotificationFilters,
} from './notification.service';

export type {
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from './api/authService';
