/**
 * Notification type definitions
 * Re-exports from business/features/notifications to avoid duplication
 */

export type {
  NotificationType,
  InAppNotification as Notification,
} from '../business/features/notifications';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NotificationCountResponse {
  totalCount: number;
  unreadCount: number;
}

export interface WebSocketNotificationPayload {
  notificationId: string;
  title: string;
  content: string;
  type: string;
  actionUrl?: string;
  [key: string]: unknown;
}
