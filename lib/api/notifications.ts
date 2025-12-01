/**
 * Notifications API Client
 *
 * Comprehensive client for notification management system.
 * Backend: NotificationController + NotificationPreferencesController (18 endpoints)
 *
 * Features:
 * - Paginated notification listing (all, unread, by type)
 * - Notification counts (total, unread, has-unread)
 * - Mark as read/unread operations (single, bulk, by type)
 * - Notification preferences management
 * - Do Not Disturb mode
 * - Real-time updates support
 *
 * @sprint Sprint 4 - Notifications System
 * @backend NotificationController.java (14 endpoints)
 * @backend NotificationPreferencesController.java (4 endpoints)
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { z } from 'zod';
import logger from '@/lib/infrastructure/monitoring/logger';

// ==================== ENUMS ====================

/**
 * Notification Type (matches backend NotificationType enum)
 */
export enum NotificationType {
  MESSAGE = 'MESSAGE',
  JOB = 'JOB',
  PROPOSAL = 'PROPOSAL',
  ORDER = 'ORDER',
  PAYMENT = 'PAYMENT',
  REVIEW = 'REVIEW',
  FOLLOW = 'FOLLOW',
  SYSTEM = 'SYSTEM',
}

/**
 * Notification Priority (matches backend NotificationPriority enum)
 */
export enum NotificationPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

// ==================== ZOD SCHEMAS ====================

/**
 * Notification Response Schema
 */
const notificationResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  username: z.string(),
  type: z.nativeEnum(NotificationType),
  priority: z.nativeEnum(NotificationPriority),
  title: z.string(),
  content: z.string(),
  actionUrl: z.string().nullable(),
  actionLabel: z.string().nullable(),
  relatedEntityType: z.string().nullable(),
  relatedEntityId: z.string().uuid().nullable(),
  isRead: z.boolean(),
  readAt: z.string().nullable(),
  pushSent: z.boolean(),
  emailSent: z.boolean(),
  createdAt: z.string(),
  expiresAt: z.string().nullable(),
  // Grouping & Threading (Sprint 6 - Story 6.6)
  groupKey: z.string().nullable().optional(),
  threadId: z.string().uuid().nullable().optional(),
  parentNotificationId: z.string().uuid().nullable().optional(),
  groupedCount: z.number().nullable().optional(),
});

/**
 * Paginated Notifications Schema
 */
const paginatedNotificationsSchema = z.object({
  content: z.array(notificationResponseSchema),
  pageable: z.object({
    pageNumber: z.number(),
    pageSize: z.number(),
    sort: z.object({
      empty: z.boolean(),
      sorted: z.boolean(),
      unsorted: z.boolean(),
    }),
    offset: z.number(),
    paged: z.boolean(),
    unpaged: z.boolean(),
  }),
  totalPages: z.number(),
  totalElements: z.number(),
  last: z.boolean(),
  first: z.boolean(),
  size: z.number(),
  number: z.number(),
  numberOfElements: z.number(),
  empty: z.boolean(),
});

/**
 * Notification Count Response Schema
 */
const notificationCountResponseSchema = z.object({
  totalCount: z.number(),
  unreadCount: z.number(),
});

/**
 * Notification Preferences Response Schema
 */
const notificationPreferencesResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  // Email Preferences
  messageEmail: z.boolean(),
  jobEmail: z.boolean(),
  proposalEmail: z.boolean(),
  orderEmail: z.boolean(),
  paymentEmail: z.boolean(),
  reviewEmail: z.boolean(),
  systemEmail: z.boolean(),
  // Push Preferences
  messagePush: z.boolean(),
  jobPush: z.boolean(),
  proposalPush: z.boolean(),
  orderPush: z.boolean(),
  paymentPush: z.boolean(),
  reviewPush: z.boolean(),
  systemPush: z.boolean(),
  // Do Not Disturb
  doNotDisturb: z.boolean(),
  dndStartTime: z.string().nullable(),
  dndEndTime: z.string().nullable(),
  // Grouping & Batching (Sprint 6)
  enableGrouping: z.boolean().optional(),
  batchingIntervalMinutes: z.number().optional(),
  emailDigestEnabled: z.boolean().optional(),
  emailDigestFrequency: z.string().optional(),
  digestDeliveryHour: z.number().optional(),
});

// ==================== TYPES ====================

export type NotificationResponse = z.infer<typeof notificationResponseSchema>;
export type PaginatedNotifications = z.infer<
  typeof paginatedNotificationsSchema
>;
export type NotificationCountResponse = z.infer<
  typeof notificationCountResponseSchema
>;
export type NotificationPreferencesResponse = z.infer<
  typeof notificationPreferencesResponseSchema
>;

/**
 * Update Notification Preferences Request
 */
export interface UpdateNotificationPreferencesRequest {
  // Email Preferences
  messageEmail?: boolean;
  jobEmail?: boolean;
  proposalEmail?: boolean;
  orderEmail?: boolean;
  paymentEmail?: boolean;
  reviewEmail?: boolean;
  systemEmail?: boolean;
  // Push Preferences
  messagePush?: boolean;
  jobPush?: boolean;
  proposalPush?: boolean;
  orderPush?: boolean;
  paymentPush?: boolean;
  reviewPush?: boolean;
  systemPush?: boolean;
  // Do Not Disturb
  doNotDisturb?: boolean;
  dndStartTime?: string | null;
  dndEndTime?: string | null;
  // Grouping & Batching (Sprint 6)
  enableGrouping?: boolean;
  batchingIntervalMinutes?: number;
  emailDigestEnabled?: boolean;
  emailDigestFrequency?: string;
  digestDeliveryHour?: number;
}

/**
 * Create Notification Request (Admin only)
 */
export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  content: string;
  actionUrl?: string | null;
  actionLabel?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
}

// ==================== API FUNCTIONS ====================

/**
 * Get paginated notifications for current user
 *
 * @endpoint GET /api/v1/notifications
 * @param page - Page number (0-based)
 * @param size - Page size (default 20)
 */
export async function getNotifications(
  page: number = 0,
  size: number = 20
): Promise<PaginatedNotifications> {
  logger.debug('notifications.api', { sizesize });

  const response = await apiClient.get<PaginatedNotifications>(
    `/v1/notifications?page=${page}&size=${size}`
  );

  return paginatedNotificationsSchema.parse(response);
}

/**
 * Get unread notifications with pagination
 *
 * @endpoint GET /api/v1/notifications/unread
 * @param page - Page number (0-based)
 * @param size - Page size (default 20)
 */
export async function getUnreadNotifications(
  page: number = 0,
  size: number = 20
): Promise<PaginatedNotifications> {
  logger.debug('notifications.api', { size });

  const response = await apiClient.get<PaginatedNotifications>(
    `/v1/notifications/unread?page=${page}&size=${size}`
  );

  return paginatedNotificationsSchema.parse(response);
}

/**
 * Get recent unread notifications (limited, for dropdown)
 *
 * @endpoint GET /api/v1/notifications/recent
 * @param limit - Result limit (default 5)
 */
export async function getRecentNotifications(
  limit: number = 5
): Promise<NotificationResponse[]> {
  logger.debug(`Fetching recent notifications: limit=${limit}`, {
    component: 'notifications.api',
  });

  const response = await apiClient.get<NotificationResponse[]>(
    `/v1/notifications/recent?limit=${limit}`
  );

  return z.array(notificationResponseSchema).parse(response);
}

/**
 * Get notification by ID
 *
 * @endpoint GET /api/v1/notifications/{id}
 * @param notificationId - Notification UUID
 */
export async function getNotificationById(
  notificationId: string
): Promise<NotificationResponse> {
  const response = await apiClient.get<NotificationResponse>(
    `/v1/notifications/${notificationId}`
  );

  return notificationResponseSchema.parse(response);
}

/**
 * Get notifications by type
 *
 * @endpoint GET /api/v1/notifications/type/{type}
 * @param type - Notification type
 * @param page - Page number (0-based)
 * @param size - Page size (default 20)
 */
export async function getNotificationsByType(
  type: NotificationType,
  page: number = 0,
  size: number = 20
): Promise<PaginatedNotifications> {
  logger.debug('notifications.api', { page });

  const response = await apiClient.get<PaginatedNotifications>(
    `/v1/notifications/type/${type}?page=${page}&size=${size}`
  );

  return paginatedNotificationsSchema.parse(response);
}

/**
 * Get notification counts (total and unread)
 *
 * @endpoint GET /api/v1/notifications/count
 */
export async function getNotificationCounts(): Promise<NotificationCountResponse> {
  logger.debug('Fetching notification counts', {
    component: 'notifications.api',
  });

  const response = await apiClient.get<NotificationCountResponse>(
    '/v1/notifications/count'
  );

  return notificationCountResponseSchema.parse(response);
}

/**
 * Get unread notification count only (lightweight for badge)
 *
 * @endpoint GET /api/v1/notifications/unread-count
 */
export async function getUnreadCount(): Promise<number> {
  logger.debug('Fetching unread count', { component: 'notifications.api' });

  const response = await apiClient.get<number>(
    '/v1/notifications/unread-count'
  );

  return z.number().parse(response);
}

/**
 * Check if user has unread notifications
 *
 * @endpoint GET /api/v1/notifications/has-unread
 */
export async function hasUnreadNotifications(): Promise<boolean> {
  logger.debug('Checking has unread notifications', {
    component: 'notifications.api',
  });

  const response = await apiClient.get<boolean>('/v1/notifications/has-unread');

  return z.boolean().parse(response);
}

/**
 * Mark notification as read
 *
 * @endpoint PUT /api/v1/notifications/{id}/read
 * @param notificationId - Notification UUID
 */
export async function markAsRead(notificationId: string): Promise<void> {
  logger.info(`Marking notification as read: ${notificationId}`, {
    component: 'notifications.api',
  });

  await apiClient.put(`/v1/notifications/${notificationId}/read`);
}

/**
 * Mark notification as unread
 *
 * @endpoint PUT /api/v1/notifications/{id}/unread
 * @param notificationId - Notification UUID
 */
export async function markAsUnread(notificationId: string): Promise<void> {
  logger.info(`Marking notification as unread: ${notificationId}`, {
    component: 'notifications.api',
  });

  await apiClient.put(`/v1/notifications/${notificationId}/unread`);
}

/**
 * Mark all notifications as read
 *
 * @endpoint PUT /api/v1/notifications/mark-all-read
 * @returns Number of notifications marked as read
 */
export async function markAllAsRead(): Promise<number> {
  logger.info('Marking all notifications as read', {
    component: 'notifications.api',
  });

  const response = await apiClient.put<number>(
    '/v1/notifications/mark-all-read'
  );

  return z.number().parse(response);
}

/**
 * Mark all notifications of specific type as read
 *
 * @endpoint PUT /api/v1/notifications/mark-all-read/type/{type}
 * @param type - Notification type
 * @returns Number of notifications marked as read
 */
export async function markAllAsReadByType(
  type: NotificationType
): Promise<number> {
  logger.info(`Marking all notifications of type ${type} as read`, {
    component: 'notifications.api',
  });

  const response = await apiClient.put<number>(
    `/v1/notifications/mark-all-read/type/${type}`
  );

  return z.number().parse(response);
}

/**
 * Delete notification (soft delete)
 *
 * @endpoint DELETE /api/v1/notifications/{id}
 * @param notificationId - Notification UUID
 */
export async function deleteNotification(
  notificationId: string
): Promise<void> {
  await apiClient.delete(`/v1/notifications/${notificationId}`);
}

/**
 * Create notification (Admin only)
 *
 * @endpoint POST /api/v1/notifications
 * @param request - Create notification request
 */
export async function createNotification(
  request: CreateNotificationRequest
): Promise<NotificationResponse> {
  logger.info(`Creating notification for user: ${request.userId}`, {
    component: 'notifications.api',
  });

  const response = await apiClient.post<NotificationResponse>(
    '/v1/notifications',
    request
  );

  return notificationResponseSchema.parse(response);
}

// ==================== PREFERENCES API ====================

/**
 * Get notification preferences
 *
 * @endpoint GET /api/v1/notifications/preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferencesResponse> {
  logger.debug('Fetching notification preferences', {
    component: 'notifications.api',
  });

  const response = await apiClient.get<NotificationPreferencesResponse>(
    '/v1/notifications/preferences'
  );

  return notificationPreferencesResponseSchema.parse(response);
}

/**
 * Update notification preferences
 *
 * @endpoint PUT /api/v1/notifications/preferences
 * @param request - Update preferences request
 */
export async function updateNotificationPreferences(
  request: UpdateNotificationPreferencesRequest
): Promise<NotificationPreferencesResponse> {
  logger.info('Updating notification preferences', {
    component: 'notifications.api',
  });

  const response = await apiClient.put<NotificationPreferencesResponse>(
    '/v1/notifications/preferences',
    request
  );

  return notificationPreferencesResponseSchema.parse(response);
}

/**
 * Reset preferences to defaults
 *
 * @endpoint POST /api/v1/notifications/preferences/reset
 */
export async function resetNotificationPreferences(): Promise<NotificationPreferencesResponse> {
  logger.info('Resetting notification preferences to defaults', {
    component: 'notifications.api',
  });

  const response = await apiClient.post<NotificationPreferencesResponse>(
    '/v1/notifications/preferences/reset'
  );

  return notificationPreferencesResponseSchema.parse(response);
}

/**
 * Set Do Not Disturb mode
 *
 * @endpoint POST /api/v1/notifications/preferences/dnd
 * @param enabled - Enable or disable DND
 * @param startTime - DND start time (HH:mm format)
 * @param endTime - DND end time (HH:mm format)
 */
export async function setDoNotDisturb(
  enabled: boolean,
  startTime?: string,
  endTime?: string
): Promise<void> {
  const params = new URLSearchParams();
  params.append('enabled', String(enabled));
  if (startTime) params.append('startTime', startTime);
  if (endTime) params.append('endTime', endTime);

  await apiClient.post(
    `/v1/notifications/preferences/dnd?${params.toString()}`
  );
}

// ==================== GROUPING & THREADING (Sprint 6 - Story 6.6) ====================

/**
 * Get notification thread (all notifications in a group)
 *
 * @endpoint GET /api/v1/notifications/thread/:threadId
 * @param threadId - Thread UUID
 */
export async function getNotificationThread(
  threadId: string
): Promise<NotificationResponse[]> {
  const response = await apiClient.get<NotificationResponse[]>(
    `/v1/notifications/thread/${threadId}`
  );

  return z.array(notificationResponseSchema).parse(response);
}

/**
 * Expand grouped notification to see individual items
 *
 * @endpoint GET /api/v1/notifications/:notificationId/expand
 * @param notificationId - Grouped notification UUID
 */
export async function expandGroupedNotification(
  notificationId: string
): Promise<NotificationResponse[]> {
  logger.debug(`Expanding grouped notification: ${notificationId}`, {
    component: 'notifications.api',
  });

  const response = await apiClient.get<NotificationResponse[]>(
    `/v1/notifications/${notificationId}/expand`
  );

  return z.array(notificationResponseSchema).parse(response);
}

/**
 * Manually trigger notification grouping
 *
 * @endpoint POST /api/v1/notifications/group
 * @param lookbackMinutes - How far back to look for grouping (default: 60)
 */
export async function groupNotifications(
  lookbackMinutes: number = 60
): Promise<void> {
  logger.info(`Grouping notifications (${lookbackMinutes} min)`, {
    component: 'notifications.api',
  });

  await apiClient.post(
    `/v1/notifications/group?lookbackMinutes=${lookbackMinutes}`
  );
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case NotificationType.MESSAGE:
      return 'message-circle';
    case NotificationType.JOB:
      return 'briefcase';
    case NotificationType.PROPOSAL:
      return 'file-text';
    case NotificationType.ORDER:
      return 'shopping-cart';
    case NotificationType.PAYMENT:
      return 'credit-card';
    case NotificationType.REVIEW:
      return 'star';
    case NotificationType.FOLLOW:
      return 'user-plus';
    case NotificationType.SYSTEM:
      return 'info';
    default:
      return 'bell';
  }
}

/**
 * Get notification color based on priority
 */
export function getNotificationColor(priority: NotificationPriority): string {
  switch (priority) {
    case NotificationPriority.HIGH:
      return 'text-red-600';
    case NotificationPriority.MEDIUM:
      return 'text-yellow-600';
    case NotificationPriority.LOW:
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Format notification time (relative)
 */
export function formatNotificationTime(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Şimdi';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;

  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Check if notification is expired
 */
export function isNotificationExpired(
  notification: NotificationResponse
): boolean {
  if (!notification.expiresAt) return false;
  return new Date(notification.expiresAt) < new Date();
}
