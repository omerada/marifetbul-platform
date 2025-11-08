/**
 * ================================================
 * NOTIFICATION DOMAIN - UNIFIED EXPORTS
 * ================================================
 * Centralized notification type exports
 * Single source of truth
 *
 * @version 2.0.0 - Sprint 1: Notification System Unification
 * @author MarifetBul Development Team
 */

// Export all notification types from canonical source
export * from './notification.types';

// Re-export for backward compatibility (will be removed in Sprint 2)
export type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  EnhancedNotification,
  NotificationPreferences,
  NotificationSettings,
  NotificationFilters,
  NotificationCountResponse,
  NotificationStats,
  PushNotificationPayload,
  WebSocketNotificationPayload,
  FailedNotificationDelivery,
  DLQStats,
} from './notification.types';
