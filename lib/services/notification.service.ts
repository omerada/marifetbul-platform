import { Notification } from '@/types';

export interface CreateNotificationRequest {
  userId: string;
  title: string;
  content: string;
  type:
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'job'
    | 'package'
    | 'message'
    | 'payment';
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
  private baseUrl = '/api/notifications';

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

    const response = await fetch(
      `${this.baseUrl}/${userId}?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const data = await response.json();
    return data.notifications || [];
  }

  async markAsRead(notificationId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${notificationId}/read`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${userId}/read-all`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${notificationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }
  }

  async createNotification(
    request: CreateNotificationRequest
  ): Promise<Notification> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to create notification');
    }

    const data = await response.json();
    return data.notification;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const response = await fetch(`${this.baseUrl}/${userId}/unread-count`);
    if (!response.ok) {
      throw new Error('Failed to get unread count');
    }

    const data = await response.json();
    return data.count || 0;
  }
}
