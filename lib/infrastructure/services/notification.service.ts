import type {
  Notification,
  NotificationType,
} from '@/types/domains/notification';
import type { ApiResponse } from '@/types/shared/api';
import { apiClient } from '@/lib/infrastructure/api/client';

export interface CreateNotificationRequest {
  userId: string;
  title: string;
  content: string;
  type: NotificationType;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationFilters {
  type?: string[];
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async getNotifications(
    userId: string,
    filters?: NotificationFilters
  ): Promise<Notification[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type.join(','));
    if (filters?.isRead !== undefined)
      params.append('isRead', String(filters.isRead));
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const response = await apiClient.get<
      ApiResponse<{ notifications: Notification[] }>
    >(`/notifications/${userId}?${params.toString()}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch notifications');
    }

    return response.data.notifications || [];
  }

  async markAsRead(notificationId: string): Promise<void> {
    const response = await apiClient.put<ApiResponse<void>>(
      `/notifications/${notificationId}/read`
    );

    if (!response.success) {
      throw new Error(
        response.message || 'Failed to mark notification as read'
      );
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const response = await apiClient.put<ApiResponse<void>>(
      `/notifications/${userId}/read-all`
    );

    if (!response.success) {
      throw new Error(
        response.message || 'Failed to mark all notifications as read'
      );
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/notifications/${notificationId}`
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete notification');
    }
  }

  async createNotification(
    request: CreateNotificationRequest
  ): Promise<Notification> {
    const response = await apiClient.post<
      ApiResponse<{ notification: Notification }>
    >('/notifications', request);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create notification');
    }

    return response.data.notification;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ count: number }>>(
      `/notifications/${userId}/unread-count`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get unread count');
    }

    return response.data.count || 0;
  }
}
