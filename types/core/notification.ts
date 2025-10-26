/**
 * Notification type definitions
 */

export type NotificationType =
  | 'MESSAGE'
  | 'JOB'
  | 'PROPOSAL'
  | 'ORDER'
  | 'PAYMENT'
  | 'REVIEW'
  | 'FOLLOW'
  | 'SYSTEM';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  content: string;
  actionUrl?: string;
  actionLabel?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

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
