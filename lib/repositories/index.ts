/**
 * Repository Layer Index
 * Exports all repositories and provides repository factory for dependency injection
 */

// Base repository functionality
export { BaseRepository, RepositoryError } from './base';
export type {
  ApiResponse,
  HttpMethod,
  RequestConfig,
  RequestOptions,
  CacheConfig,
} from './base';

// Domain Repositories
export { NotificationRepository } from './notification.repository';
export { MessagingRepository } from './messaging.repository';
export { PaymentRepository } from './payment.repository';

// Import for factory
import { NotificationRepository } from './notification.repository';
import { MessagingRepository } from './messaging.repository';
import { PaymentRepository } from './payment.repository';

// Repository Data Types
export type {
  NotificationFilters,
  NotificationPreferences,
  PushSubscriptionData,
} from './notification.repository';

export type {
  MessageFilters,
  ConversationFilters,
  SendMessageData,
  CreateConversationData,
  MessageSearchResult,
} from './messaging.repository';

export type {
  PaymentData,
  RefundData,
  EscrowReleaseData,
  PaymentRecord,
  InvoiceRecord,
} from './payment.repository';

// Repository Factory - for dependency injection and testing
export class RepositoryFactory {
  private static notificationRepository: NotificationRepository;
  private static messagingRepository: MessagingRepository;
  private static paymentRepository: PaymentRepository;

  static getNotificationRepository(): NotificationRepository {
    if (!this.notificationRepository) {
      this.notificationRepository = new NotificationRepository();
    }
    return this.notificationRepository;
  }

  static getMessagingRepository(): MessagingRepository {
    if (!this.messagingRepository) {
      this.messagingRepository = new MessagingRepository();
    }
    return this.messagingRepository;
  }

  static getPaymentRepository(): PaymentRepository {
    if (!this.paymentRepository) {
      this.paymentRepository = new PaymentRepository();
    }
    return this.paymentRepository;
  }

  // For testing - allows repository replacement
  static setNotificationRepository(repository: NotificationRepository): void {
    this.notificationRepository = repository;
  }

  static setMessagingRepository(repository: MessagingRepository): void {
    this.messagingRepository = repository;
  }

  static setPaymentRepository(repository: PaymentRepository): void {
    this.paymentRepository = repository;
  }

  // Reset all repositories (useful for testing)
  static reset(): void {
    this.notificationRepository = new NotificationRepository();
    this.messagingRepository = new MessagingRepository();
    this.paymentRepository = new PaymentRepository();
  }

  // Health check for all repositories
  static async healthCheck(): Promise<{
    notification: boolean;
    messaging: boolean;
    payment: boolean;
    overall: boolean;
  }> {
    const results = {
      notification: false,
      messaging: false,
      payment: false,
      overall: false,
    };

    try {
      // Test notification repository
      await this.getNotificationRepository().getUnreadCount();
      results.notification = true;
    } catch (error) {
      console.warn('Notification repository health check failed:', error);
    }

    try {
      // Test messaging repository
      await this.getMessagingRepository().getUnreadCount();
      results.messaging = true;
    } catch (error) {
      console.warn('Messaging repository health check failed:', error);
    }

    try {
      // Test payment repository - try to get payment methods
      await this.getPaymentRepository().getPaymentMethods();
      results.payment = true;
    } catch (error) {
      console.warn('Payment repository health check failed:', error);
    }

    results.overall =
      results.notification && results.messaging && results.payment;
    return results;
  }

  // Clear all repository caches
  static clearAllCaches(): void {
    this.getNotificationRepository().clearRepositoryCache();
    this.getMessagingRepository().clearRepositoryCache();
    this.getPaymentRepository().clearRepositoryCache();
  }

  // Get cache statistics from all repositories
  static getCacheStats(): {
    notification: { size: number; keys: string[] };
    messaging: { size: number; keys: string[] };
    payment: { size: number; keys: string[] };
    total: number;
  } {
    const notificationStats =
      this.getNotificationRepository().getRepositoryCacheStats();
    const messagingStats =
      this.getMessagingRepository().getRepositoryCacheStats();
    const paymentStats = this.getPaymentRepository().getRepositoryCacheStats();

    return {
      notification: notificationStats,
      messaging: messagingStats,
      payment: paymentStats,
      total: notificationStats.size + messagingStats.size + paymentStats.size,
    };
  }
}
