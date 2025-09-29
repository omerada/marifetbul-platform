/**
 * Notification Service
 * Handles all notification-related business logic
 */

import { BaseService } from '../../../lib/shared/base';

export class NotificationService extends BaseService {
  private static instance: NotificationService;

  private constructor() {
    super();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async fetchNotifications(
    userId: string,
    filters?: {
      type?: string[];
      isRead?: boolean;
      dateFrom?: string;
      dateTo?: string;
    }
  ) {
    return this.executeOperation('fetchNotifications', async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type.join(','));
      if (filters?.isRead !== undefined)
        params.append('isRead', String(filters.isRead));
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      const response = await fetch(
        `/api/notifications/${userId}?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      return data.notifications || [];
    });
  }

  async getUnreadCount(userId: string) {
    return this.executeOperation('getUnreadCount', async () => {
      const response = await fetch(`/api/notifications/${userId}/unread-count`);
      if (!response.ok) {
        throw new Error('Failed to get unread count');
      }

      const data = await response.json();
      return data.count || 0;
    });
  }

  async markAsRead(notificationId: string) {
    return this.executeOperation('markAsRead', async () => {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: 'PUT',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      return true;
    });
  }

  async markAllAsRead(userId: string) {
    return this.executeOperation('markAllAsRead', async () => {
      const response = await fetch(`/api/notifications/${userId}/read-all`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      return true;
    });
  }

  async deleteNotification(notificationId: string) {
    return this.executeOperation('deleteNotification', async () => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      return true;
    });
  }

  async deleteAllRead(userId: string) {
    return this.executeOperation('deleteAllRead', async () => {
      const response = await fetch(`/api/notifications/${userId}/delete-read`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete read notifications');
      }

      return true;
    });
  }

  async getPreferences(userId: string) {
    return this.executeOperation('getPreferences', async () => {
      const response = await fetch(`/api/notifications/${userId}/preferences`);
      if (!response.ok) {
        throw new Error('Failed to get preferences');
      }

      const data = await response.json();
      return data.preferences;
    });
  }

  async updatePreferences(
    userId: string,
    preferences: Record<string, unknown>
  ) {
    return this.executeOperation('updatePreferences', async () => {
      const response = await fetch(`/api/notifications/${userId}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      const data = await response.json();
      return data.preferences;
    });
  }

  async subscribeToPush(userId: string, subscription: Record<string, unknown>) {
    return this.executeOperation('subscribeToPush', async () => {
      const response = await fetch(
        `/api/notifications/${userId}/push-subscribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to subscribe to push notifications');
      }

      return true;
    });
  }

  async unsubscribeFromPush(userId: string) {
    return this.executeOperation('unsubscribeFromPush', async () => {
      const response = await fetch(
        `/api/notifications/${userId}/push-unsubscribe`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to unsubscribe from push notifications');
      }

      return true;
    });
  }

  async sendTestNotification(
    userId: string,
    notificationData: Record<string, unknown>
  ) {
    return this.executeOperation('sendTestNotification', async () => {
      const response = await fetch(`/api/notifications/${userId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }

      return true;
    });
  }

  async searchNotifications(query: string, userId: string) {
    return this.executeOperation('searchNotifications', async () => {
      const params = new URLSearchParams({
        q: query,
        userId,
      });

      const response = await fetch(
        `/api/notifications/search?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error('Failed to search notifications');
      }

      const data = await response.json();
      return data.notifications || [];
    });
  }

  async bulkOperation(operation: {
    action: string;
    notificationIds: string[];
  }) {
    return this.executeOperation('bulkOperation', async () => {
      const response = await fetch('/api/notifications/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(operation),
      });

      if (!response.ok) {
        throw new Error('Failed to perform bulk operation');
      }

      return true;
    });
  }

  async getStatistics(userId: string) {
    return this.executeOperation('getStatistics', async () => {
      const response = await fetch(`/api/notifications/${userId}/statistics`);
      if (!response.ok) {
        throw new Error('Failed to get statistics');
      }

      const data = await response.json();
      return data.statistics;
    });
  }
}
