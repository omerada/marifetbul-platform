/**
 * ================================================
 * LEGACY NOTIFICATION TYPES - DEPRECATED
 * ================================================
 * @deprecated Sprint 1: Use types/domains/notification instead
 * This file is kept for backward compatibility only
 * Will be removed in Sprint 2
 */

// Re-export canonical types
export type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  EnhancedNotification,
  NotificationPreferences,
  NotificationSettings,
  NotificationFilters,
  NotificationStats,
  PushNotificationPayload,
  NotificationAction,
  PushSubscriptionData,
  WebSocketNotificationPayload,
  NotificationTemplate,
  NotificationHistory,
  NotificationCountResponse,
} from '../../domains/notification';

// Legacy alias - DO NOT USE IN NEW CODE
/** @deprecated Use Notification from domains/notification */
export type { Notification as InAppNotification } from '../../domains/notification';

/** @deprecated Use NotificationCenterState from domains/notification */
export interface NotificationCenter {
  notifications: unknown[];
  unreadCount: number;
  hasMore: boolean;
  lastFetch: string;
}

/** @deprecated Use NotificationError from domains/notification */
export interface NotificationError {
  code: string;
  message: string;
  retryable: boolean;
}

/** @deprecated Use NotificationBatch from domains/notification */
export interface NotificationBatch {
  notifications: unknown[];
  batchId: string;
  createdAt: string;
  processedAt?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}
