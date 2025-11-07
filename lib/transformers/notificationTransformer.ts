/**
 * ================================================
 * NOTIFICATION TRANSFORMER
 * ================================================
 * Centralized transformation utilities for notification data
 * Converts backend API responses to frontend types
 *
 * @sprint Sprint 8 - Notification System Consolidation
 * @version 1.0.0
 */

import type { NotificationResponse } from '@/lib/api/notifications';
import type { InAppNotification } from '@/types/business/features/notifications';
import type { Notification } from '@/types/core/notification';

/**
 * Transform backend NotificationResponse to frontend InAppNotification
 * Used for real-time notifications, WebSocket updates, and notification hooks
 *
 * @param notification - Backend notification response
 * @returns Frontend InAppNotification format
 */
export function transformToInAppNotification(
  notification: NotificationResponse
): InAppNotification {
  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type.toLowerCase() as InAppNotification['type'],
    title: notification.title,
    message: notification.content, // Backend uses 'content', frontend uses 'message'
    content: notification.content, // Backward compatibility
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    readAt: notification.readAt || undefined,
    actionUrl: notification.actionUrl || undefined,
    priority:
      notification.priority.toLowerCase() as InAppNotification['priority'],
    relatedEntityType: notification.relatedEntityType || undefined,
    relatedEntityId: notification.relatedEntityId || undefined,
    data: notification.relatedEntityId
      ? {
          relatedEntityType: notification.relatedEntityType,
          relatedEntityId: notification.relatedEntityId,
        }
      : undefined,
  };
}

/**
 * Transform backend NotificationResponse to core Notification type
 * Used for notification pages, lists, and dashboard displays
 *
 * @param notification - Backend notification response
 * @returns Core Notification format
 */
export function transformToNotification(
  notification: NotificationResponse
): Notification {
  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type as unknown as Notification['type'],
    priority: notification.priority.toLowerCase() as Notification['priority'],
    title: notification.title,
    content: notification.content,
    message: notification.content, // Frontend expects 'message' property
    actionUrl: notification.actionUrl || undefined,
    relatedEntityType: notification.relatedEntityType || undefined,
    relatedEntityId: notification.relatedEntityId || undefined,
    isRead: notification.isRead,
    readAt: notification.readAt || undefined,
    createdAt: notification.createdAt,
  };
}

/**
 * Batch transform NotificationResponse array to InAppNotification array
 *
 * @param notifications - Array of backend notification responses
 * @returns Array of frontend InAppNotifications
 */
export function transformToInAppNotifications(
  notifications: NotificationResponse[]
): InAppNotification[] {
  return notifications.map(transformToInAppNotification);
}

/**
 * Batch transform NotificationResponse array to Notification array
 *
 * @param notifications - Array of backend notification responses
 * @returns Array of core Notifications
 */
export function transformToNotifications(
  notifications: NotificationResponse[]
): Notification[] {
  return notifications.map(transformToNotification);
}

/**
 * Type guard to check if notification is InAppNotification
 */
export function isInAppNotification(
  notification: unknown
): notification is InAppNotification {
  return (
    typeof notification === 'object' &&
    notification !== null &&
    'message' in notification &&
    'content' in notification
  );
}

/**
 * Type guard to check if notification is core Notification
 */
export function isNotification(
  notification: unknown
): notification is Notification {
  return (
    typeof notification === 'object' &&
    notification !== null &&
    'message' in notification &&
    'userId' in notification
  );
}
