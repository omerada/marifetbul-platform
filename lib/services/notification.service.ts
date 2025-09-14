/**
 * Notification Service
 * Handles all notification-related business logic
 * Uses repository pattern for data access
 */

import {
  BaseService,
  ServiceResult,
  PaginationOptions,
  PaginatedResult,
  createSuccessResult,
} from './base';
import {
  NotificationRepository,
  type NotificationFilters,
  type NotificationPreferences,
} from '../repositories/notification.repository';
import type { InAppNotification } from '../../types';

export class NotificationService extends BaseService {
  private repository: NotificationRepository;

  constructor(repository?: NotificationRepository) {
    super('NotificationService');
    this.repository = repository || new NotificationRepository();
  }

  /**
   * Fetch notifications with pagination and filtering
   */
  async fetchNotifications(
    options: PaginationOptions & {
      filters?: NotificationFilters;
    } = {}
  ): Promise<ServiceResult<PaginatedResult<InAppNotification>>> {
    return this.executeOperation('fetchNotifications', async () => {
      const { filters = {}, ...paginationOptions } = options;

      const response = await this.repository.fetchNotifications(
        paginationOptions,
        filters
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch notifications');
      }

      return createSuccessResult(response.data);
    });
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<ServiceResult<number>> {
    return this.executeOperation('getUnreadCount', async () => {
      const response = await this.repository.getUnreadCount();

      if (!response.success) {
        throw new Error(response.message || 'Failed to get unread count');
      }

      return createSuccessResult(response.data.count);
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    notificationId: string
  ): Promise<ServiceResult<InAppNotification>> {
    return this.executeOperation('markAsRead', async () => {
      const response = await this.repository.markAsRead(notificationId);

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to mark notification as read'
        );
      }

      return createSuccessResult(response.data);
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ServiceResult<number>> {
    return this.executeOperation('markAllAsRead', async () => {
      const response = await this.repository.markAllAsRead();

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to mark all notifications as read'
        );
      }

      return createSuccessResult(response.data.updated);
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(
    notificationId: string
  ): Promise<ServiceResult<void>> {
    return this.executeOperation('deleteNotification', async () => {
      const response = await this.repository.deleteNotification(notificationId);

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete notification');
      }

      return createSuccessResult(undefined);
    });
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(): Promise<ServiceResult<number>> {
    return this.executeOperation('deleteAllRead', async () => {
      const response = await this.repository.deleteAllRead();

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to delete read notifications'
        );
      }

      return createSuccessResult(response.data.deleted);
    });
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<ServiceResult<NotificationPreferences>> {
    return this.executeOperation('getPreferences', async () => {
      const response = await this.repository.getPreferences();

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to get notification preferences'
        );
      }

      return createSuccessResult(response.data);
    });
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<ServiceResult<NotificationPreferences>> {
    return this.executeOperation('updatePreferences', async () => {
      const response = await this.repository.updatePreferences(preferences);

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to update notification preferences'
        );
      }

      return createSuccessResult(response.data);
    });
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  }): Promise<ServiceResult<boolean>> {
    return this.executeOperation('subscribeToPush', async () => {
      const response = await this.repository.subscribeToPush(subscription);

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to subscribe to push notifications'
        );
      }

      return createSuccessResult(response.data.subscribed);
    });
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<ServiceResult<boolean>> {
    return this.executeOperation('unsubscribeFromPush', async () => {
      const response = await this.repository.unsubscribeFromPush();

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to unsubscribe from push notifications'
        );
      }

      return createSuccessResult(response.data.unsubscribed);
    });
  }

  /**
   * Send test notification
   */
  async sendTestNotification(): Promise<ServiceResult<InAppNotification>> {
    return this.executeOperation('sendTestNotification', async () => {
      const response = await this.repository.sendTestNotification();

      if (!response.success) {
        throw new Error(response.message || 'Failed to send test notification');
      }

      return createSuccessResult(response.data);
    });
  }

  /**
   * Search notifications
   */
  async searchNotifications(
    query: string,
    options: PaginationOptions = {}
  ): Promise<ServiceResult<PaginatedResult<InAppNotification>>> {
    return this.executeOperation('searchNotifications', async () => {
      const response = await this.repository.searchNotifications(
        query,
        options
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to search notifications');
      }

      return createSuccessResult(response.data);
    });
  }

  /**
   * Bulk operations on notifications
   */
  async bulkOperation(
    operation: 'markRead' | 'delete',
    notificationIds: string[]
  ): Promise<ServiceResult<number>> {
    return this.executeOperation('bulkOperation', async () => {
      const response = await this.repository.bulkOperation(
        operation,
        notificationIds
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to perform bulk operation');
      }

      return createSuccessResult(response.data.affected);
    });
  }

  /**
   * Get notification statistics
   */
  async getStatistics(period: 'day' | 'week' | 'month' = 'week'): Promise<
    ServiceResult<{
      total: number;
      read: number;
      unread: number;
      byType: Record<string, number>;
      byDay: Array<{ date: string; count: number }>;
    }>
  > {
    return this.executeOperation('getStatistics', async () => {
      const response = await this.repository.getStatistics(period);

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to get notification statistics'
        );
      }

      return createSuccessResult(response.data);
    });
  }
}
