/**
 * ================================================
 * CANONICAL NOTIFICATION TYPES
 * ================================================
 * Single source of truth for notification types
 * Aligned with backend NotificationType enum
 *
 * @version 2.0.0 - Sprint 1: Notification System Unification
 * @author MarifetBul Development Team
 * @since 2025-11-08
 */

import { User } from '../../core/base';

// ==================== CORE TYPES ====================

/**
 * Notification Type - Must align with backend enum
 * Backend: com.marifetbul.api.domain.notification.entity.NotificationType
 */
export type NotificationType =
  | 'MESSAGE'
  | 'JOB'
  | 'PROPOSAL'
  | 'ORDER'
  | 'PAYMENT'
  | 'PAYMENT_DISPUTE'
  | 'REVIEW'
  | 'FOLLOW'
  | 'PAYOUT_REQUESTED'
  | 'PAYOUT_PROCESSING'
  | 'PAYOUT_COMPLETED'
  | 'PAYOUT_REJECTED'
  | 'PORTFOLIO_APPROVED'
  | 'PORTFOLIO_REJECTED'
  | 'SYSTEM';

/**
 * Notification Priority
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Notification Channel
 */
export type NotificationChannel = 'EMAIL' | 'PUSH' | 'SMS' | 'IN_APP';

/**
 * Notification Status
 */
export type NotificationStatus = 'UNREAD' | 'READ' | 'ARCHIVED' | 'DELETED';

// ==================== MAIN INTERFACES ====================

/**
 * Base Notification Interface
 * Core notification structure from backend
 */
export interface Notification {
  id: string;
  userId: string;
  username?: string;
  type: NotificationType;
  title: string;
  content: string;
  message?: string; // Alias for content for backend compatibility
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  actionUrl?: string | null;
  priority: NotificationPriority;
  relatedEntityType?: string;
  relatedEntityId?: string;
  data?: Record<string, unknown>;
  groupedCount?: number; // For grouped notifications
}

/**
 * Enhanced Notification
 * Extended with frontend-specific fields
 */
export interface EnhancedNotification extends Notification {
  relatedUser?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  groupKey?: string;
  groupCount?: number;
  expiresAt?: string;
  category?: string;
  channel?: NotificationChannel;
  deliveryStatus?: string;
  deliveryAttempts?: NotificationDeliveryAttempt[];
  actionText?: string;
  imageUrl?: string;
}

/**
 * Notification Delivery Attempt
 */
export interface NotificationDeliveryAttempt {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  status: 'SENT' | 'DELIVERED' | 'FAILED' | 'CLICKED';
  timestamp: string;
  errorMessage?: string;
}

// ==================== PREFERENCES & SETTINGS ====================

/**
 * Notification Preferences
 */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  marketing: boolean;
  updates: boolean;
  reminders: boolean;
  // Type-specific preferences
  messageNotifications: boolean;
  orderNotifications: boolean;
  paymentNotifications: boolean;
  reviewNotifications: boolean;
}

/**
 * Notification Settings
 */
export interface NotificationSettings {
  userId: string;
  preferences: NotificationPreferences;
  doNotDisturb: {
    enabled: boolean;
    startTime?: string;
    endTime?: string;
  };
  sound: {
    enabled: boolean;
    volume: number;
  };
  updatedAt: string;
}

// ==================== FILTERS & QUERY ====================

/**
 * Notification Filters
 */
export interface NotificationFilters {
  isRead?: boolean;
  type?: NotificationType[];
  priority?: NotificationPriority[];
  dateRange?: {
    from: string;
    to: string;
  };
}

/**
 * Notification Query Parameters
 */
export interface NotificationQueryParams {
  page?: number;
  size?: number;
  filters?: NotificationFilters;
  sortBy?: 'createdAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

// ==================== RESPONSES & RESULTS ====================

/**
 * Notification List Response
 */
export interface NotificationListResponse {
  notifications: Notification[];
  totalCount: number;
  unreadCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Notification Count Response
 */
export interface NotificationCountResponse {
  totalCount: number;
  unreadCount: number;
  byType: Partial<Record<NotificationType, number>>;
}

/**
 * Notification Stats
 */
export interface NotificationStats {
  total: number;
  unread: number;
  byType: Partial<Record<NotificationType, number>>;
  byPriority: Partial<Record<NotificationPriority, number>>;
  last24Hours: number;
  last7Days: number;
}

// ==================== PUSH NOTIFICATIONS ====================

/**
 * Push Notification Payload
 */
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
}

/**
 * Notification Action
 */
export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

/**
 * Push Subscription Data
 */
export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: string;
}

// ==================== WEBSOCKET ====================

/**
 * WebSocket Notification Payload
 */
export interface WebSocketNotificationPayload {
  notificationId: string;
  type: NotificationType;
  title: string;
  content: string;
  actionUrl?: string;
  priority: NotificationPriority;
  data?: Record<string, unknown>;
}

// ==================== TEMPLATES ====================

/**
 * Notification Template
 */
export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  bodyTemplate: string;
  emailTemplate?: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== DLQ (Dead Letter Queue) ====================

/**
 * Failed Notification Delivery
 */
export interface FailedNotificationDelivery {
  id: string;
  notificationId: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISCARDED';
  retryCount: number;
  errorMessage: string;
  errorCode?: string;
  httpStatusCode?: number;
  recipientAddress: string;
  priority: NotificationPriority;
  alertSent: boolean;
  investigatingAdminId?: string;
  resolutionNotes?: string;
  failedAt: string;
  resolvedAt?: string;
}

/**
 * DLQ Statistics
 */
export interface DLQStats {
  pending: number;
  investigating: number;
  resolved: number;
  discarded: number;
  byChannel: Array<{ channel: string; count: number }>;
  topErrorCodes: Array<{ code: string; count: number }>;
}

// ==================== BATCH OPERATIONS ====================

/**
 * Notification Batch
 */
export interface NotificationBatch {
  notifications: Notification[];
  batchId: string;
  createdAt: string;
  processedAt?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

/**
 * Bulk Read Request
 */
export interface BulkReadRequest {
  notificationIds: string[];
}

/**
 * Bulk Delete Request
 */
export interface BulkDeleteRequest {
  notificationIds: string[];
}

// ==================== ERROR HANDLING ====================

/**
 * Notification Error
 */
export interface NotificationError {
  code: string;
  message: string;
  retryable: boolean;
  timestamp: string;
}

// ==================== HISTORY & AUDIT ====================

/**
 * Notification History
 */
export interface NotificationHistory {
  id: string;
  userId: string;
  notificationId: string;
  channel: NotificationChannel;
  status: 'sent' | 'delivered' | 'failed' | 'clicked';
  sentAt: string;
  deliveredAt?: string;
  clickedAt?: string;
  error?: string;
}

// ==================== UTILITY TYPES ====================

/**
 * Notification Center State
 */
export interface NotificationCenterState {
  notifications: Notification[];
  unreadCount: number;
  hasMore: boolean;
  isLoading: boolean;
  error?: NotificationError;
  lastFetch: string;
}

/**
 * Real-time Notification Update
 */
export interface NotificationUpdate {
  type: 'new' | 'read' | 'deleted' | 'updated';
  notification: Notification;
  timestamp: string;
}
