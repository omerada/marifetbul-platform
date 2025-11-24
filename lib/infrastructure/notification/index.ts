/**
 * ================================================
 * NOTIFICATION INFRASTRUCTURE EXPORTS
 * ================================================
 * Centralized exports for notification system
 * Sprint 6 - Story 6.5: Unified Notification System
 */

// Unified Notification Handler (NEW - Sprint 6)
export {
  getUnifiedNotificationHandler,
  destroyUnifiedNotificationHandler,
} from './UnifiedNotificationHandler';
export type {
  NotificationSource,
  ProcessedNotification,
  NotificationHandlerCallbacks,
  NotificationHandlerOptions,
} from './UnifiedNotificationHandler';

// Re-export for backward compatibility
export { default as UnifiedNotificationHandler } from './UnifiedNotificationHandler';
