/**
 * Notification Repository
 * Handles all notification-related API calls with caching and error handling
 */

import { BaseRepository, PaginatedResult } from './BaseRepository';
import { ApiResponse } from '../api/UnifiedApiClient';
import type { InAppNotification } from '../../types';
import type { PaginationOptions, PaginatedResult } from '../services/base';

export interface NotificationFilters {
  read?: boolean;
  type?: string;
  category?: string;
  fromDate?: string;
  toDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  categories: {
    messages: boolean;
    payments: boolean;
    jobs: boolean;
    system: boolean;
    marketing: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class NotificationRepository extends BaseRepository {
  constructor() {
    super('/api/v1');
  }

  /**
   * Fetch notifications with pagination and filtering
   */
  async fetchNotifications(
    options: PaginationOptions = { page: 1, limit: 20 },
    filters: NotificationFilters = {}
  ): Promise<ApiResponse<PaginatedResult<InAppNotification>>> {
    const params = {
      page: (options.page || 1).toString(),
      limit: (options.limit || 20).toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined)
      ),
    };

    return this.get<PaginatedResult<InAppNotification>>(
      '/notifications',
      params,
      {
        cache: {
          enabled: true,
          ttl: 30000, // 30 seconds
        },
        retries: 2,
      }
    );
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return this.get<{ count: number }>(
      '/notifications/unread-count',
      undefined,
      {
        cache: {
          enabled: true,
          ttl: 10000, // 10 seconds
        },
      }
    );
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    notificationId: string
  ): Promise<ApiResponse<InAppNotification>> {
    const response = await this.patch<InAppNotification>(
      `/notifications/${notificationId}`,
      { read: true }
    );

    // Clear related cache entries
    this.clearCache('/notifications');

    return response;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse<{ updated: number }>> {
    const response = await this.patch<{ updated: number }>(
      '/notifications/mark-all-read'
    );

    // Clear all notification cache
    this.clearCache('/notifications');

    return response;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    const response = await this.delete<void>(
      `/notifications/${notificationId}`
    );

    // Clear related cache entries
    this.clearCache('/notifications');

    return response;
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(): Promise<ApiResponse<{ deleted: number }>> {
    const response = await this.delete<{ deleted: number }>(
      '/notifications/read'
    );

    // Clear all notification cache
    this.clearCache('/notifications');

    return response;
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    return this.get<NotificationPreferences>(
      '/notifications/preferences',
      undefined,
      {
        cache: {
          enabled: true,
          ttl: 60000, // 1 minute
        },
      }
    );
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<ApiResponse<NotificationPreferences>> {
    const response = await this.put<NotificationPreferences>(
      '/notifications/preferences',
      preferences
    );

    // Clear preferences cache
    this.clearCache('/notifications/preferences');

    return response;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(
    subscription: PushSubscriptionData
  ): Promise<ApiResponse<{ subscribed: boolean }>> {
    return this.post<{ subscribed: boolean }>(
      '/notifications/push/subscribe',
      subscription
    );
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<ApiResponse<{ unsubscribed: boolean }>> {
    return this.delete<{ unsubscribed: boolean }>(
      '/notifications/push/unsubscribe'
    );
  }

  /**
   * Send test notification
   */
  async sendTestNotification(): Promise<ApiResponse<InAppNotification>> {
    return this.post<InAppNotification>('/notifications/test');
  }

  /**
   * Get notification statistics
   */
  async getStatistics(period: 'day' | 'week' | 'month' = 'week'): Promise<
    ApiResponse<{
      total: number;
      read: number;
      unread: number;
      byType: Record<string, number>;
      byDay: Array<{ date: string; count: number }>;
    }>
  > {
    return this.get(
      '/notifications/statistics',
      { period },
      {
        cache: {
          enabled: true,
          ttl: 300000, // 5 minutes
        },
      }
    );
  }

  /**
   * Bulk operations on notifications
   */
  async bulkOperation(
    operation: 'markRead' | 'delete',
    notificationIds: string[]
  ): Promise<ApiResponse<{ affected: number }>> {
    const response = await this.post<{ affected: number }>(
      '/notifications/bulk',
      {
        operation,
        ids: notificationIds,
      }
    );

    // Clear notification cache
    this.clearCache('/notifications');

    return response;
  }

  /**
   * Search notifications
   */
  async searchNotifications(
    query: string,
    options: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<ApiResponse<PaginatedResult<InAppNotification>>> {
    return this.get<PaginatedResult<InAppNotification>>(
      '/notifications/search',
      {
        q: query,
        page: (options.page || 1).toString(),
        limit: (options.limit || 20).toString(),
      },
      {
        cache: {
          enabled: true,
          ttl: 60000, // 1 minute
        },
      }
    );
  }
}
