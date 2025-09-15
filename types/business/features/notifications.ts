// Consolidated notification types
import { User } from '../../core/base';

// Legacy compatibility exports
// export interface Notification extends InAppNotification {}

export interface EnhancedNotification extends InAppNotification {
  relatedUser?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  groupKey?: string;
  groupCount?: number;
  expiresAt?: string;
  category?: string;
  channel?: string;
  deliveryStatus?: string;
  deliveryAttempts?: Array<{
    id: string;
    notificationId: string;
    channel: string;
    status: string;
    timestamp: string;
  }>;
  actionText?: string;
  imageUrl?: string;
}

export interface NotificationCenter {
  notifications: InAppNotification[];
  unreadCount: number;
  hasMore: boolean;
  lastFetch: string;
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: NotificationType[];
  priority?: ('low' | 'medium' | 'high' | 'urgent')[];
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface NotificationError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: string;
}

export interface NotificationBatch {
  notifications: InAppNotification[];
  batchId: string;
  createdAt: string;
  processedAt?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  marketing: boolean;
  updates: boolean;
  reminders: boolean;
}

export interface NotificationSettings {
  userId: string;
  preferences: NotificationPreferences;
  updatedAt: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface InAppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export type NotificationType =
  | 'job_application'
  | 'job_accepted'
  | 'job_completed'
  | 'payment_received'
  | 'message_received'
  | 'review_received'
  | 'system_update'
  | 'promotion'
  | 'reminder';

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  bodyTemplate: string;
  emailTemplate?: string;
  variables: string[];
  isActive: boolean;
}

export interface NotificationHistory {
  id: string;
  userId: string;
  notificationId: string;
  channel: 'email' | 'push' | 'sms' | 'in_app';
  status: 'sent' | 'delivered' | 'failed' | 'clicked';
  sentAt: string;
  deliveredAt?: string;
  clickedAt?: string;
  error?: string;
}
