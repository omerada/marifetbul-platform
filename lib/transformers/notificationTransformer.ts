/**
 * ================================================
 * NOTIFICATION TRANSFORMER
 * ================================================
 * Centralized transformation utilities for notification data
 * Converts backend API responses to frontend types
 *
 * @sprint Sprint 1 - Notification System Unification
 * @version 2.0.0 - Migrated to canonical types
 */

import type { NotificationResponse } from '@/lib/api/notifications';
import type { Notification } from '@/types/domains/notification';

/**
 * Transform backend NotificationResponse to frontend Notification
 * Used for all notification displays and real-time updates
 *
 * @param notification - Backend notification response
 * @returns Frontend Notification format
 */
export function transformToNotification(
  notification: NotificationResponse
): Notification {
  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type as Notification['type'],
    title: notification.title,
    content: notification.content,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    readAt: notification.readAt || undefined,
    actionUrl: notification.actionUrl || undefined,
    priority: notification.priority.toLowerCase() as Notification['priority'],
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
 * Batch transform NotificationResponse array to Notification array
 *
 * @param notifications - Array of backend notification responses
 * @returns Array of frontend Notifications
 */
export function transformToNotifications(
  notifications: NotificationResponse[]
): Notification[] {
  return notifications.map(transformToNotification);
}

/**
 * Type guard to check if notification is valid Notification
 */
export function isNotification(
  notification: unknown
): notification is Notification {
  return (
    typeof notification === 'object' &&
    notification !== null &&
    'id' in notification &&
    'userId' in notification &&
    'type' in notification &&
    'content' in notification
  );
}
