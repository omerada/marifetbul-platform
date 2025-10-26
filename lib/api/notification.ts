import { apiClient } from '@/lib/infrastructure/api/client';
import type {
  Notification,
  NotificationCountResponse,
  NotificationType,
} from '@/types/core/notification';

/**
 * Notification API Client
 * Handles all notification-related API calls
 */

export interface GetNotificationsParams {
  page?: number;
  size?: number;
  type?: NotificationType;
}

/**
 * Get paginated notifications
 */
export async function getNotifications(params: GetNotificationsParams = {}) {
  const { page = 0, size = 20, type } = params;
  let url = `/notifications?page=${page}&size=${size}`;
  if (type) {
    url += `&type=${type}`;
  }
  const response = await apiClient.get<{
    content: Notification[];
    totalElements: number;
  }>(url);
  return response;
}

/**
 * Get unread notifications
 */
export async function getUnreadNotifications(
  page: number = 0,
  size: number = 20
) {
  const response = await apiClient.get<{
    content: Notification[];
    totalElements: number;
  }>(`/notifications/unread?page=${page}&size=${size}`);
  return response;
}

/**
 * Get recent unread notifications (for dropdown)
 */
export async function getRecentNotifications(limit: number = 5) {
  const response = await apiClient.get<Notification[]>(
    `/notifications/recent?limit=${limit}`
  );
  return response;
}

/**
 * Get notification counts
 */
export async function getNotificationCounts() {
  const response = await apiClient.get<NotificationCountResponse>(
    '/notifications/count'
  );
  return response;
}

/**
 * Get unread count only (lightweight)
 */
export async function getUnreadCount() {
  const response = await apiClient.get<number>('/notifications/unread-count');
  return response;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string) {
  await apiClient.put(`/notifications/${notificationId}/read`);
}

/**
 * Mark notification as unread
 */
export async function markAsUnread(notificationId: string) {
  await apiClient.put(`/notifications/${notificationId}/unread`);
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
  const response = await apiClient.put<number>('/notifications/mark-all-read');
  return response;
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string) {
  await apiClient.delete(`/notifications/${notificationId}`);
}
