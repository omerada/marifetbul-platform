/**
 * Repository Layer Index
 * Exports all repositories and provides repository factory for dependency injection
 */

// Base repository functionality
export {
  default as BaseRepository,
  type Repository,
  type PaginatedResult,
  type SearchOptions,
} from './BaseRepository';

// Unified API client
export {
  unifiedApiClient,
  type ApiResponse,
  type RequestConfig,
} from '../api/UnifiedApiClient';

// Domain Repositories - New Unified Repositories
export {
  default as userRepository,
  type User,
  type CreateUserData,
  type UpdateUserData,
} from './UserRepository';
export {
  default as jobRepository,
  type Job,
  type CreateJobData,
  type UpdateJobData,
} from './JobRepository';
export {
  default as packageRepository,
  type Package,
  type CreatePackageData,
  type UpdatePackageData,
} from './PackageRepository';

// Legacy repositories for backwards compatibility
export {
  BaseRepository as LegacyBaseRepository,
  RepositoryError,
} from './base';
export { NotificationRepository } from './notification.repository';
export { MessagingRepository } from './messaging.repository';
export { PaymentRepository } from './payment.repository';

// Import for factory
import { NotificationRepository } from './notification.repository';
import { MessagingRepository } from './messaging.repository';
import { PaymentRepository } from './payment.repository';
import userRepository from './UserRepository';
import jobRepository from './JobRepository';
import packageRepository from './PackageRepository';

// Unified repository collection
export const repositories = {
  user: userRepository,
  job: jobRepository,
  package: packageRepository,
  // Legacy repositories
  notification: new NotificationRepository(),
  messaging: new MessagingRepository(),
  payment: new PaymentRepository(),
} as const;

// Repository Data Types - Legacy
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

// Repository Factory - Enhanced with new repositories
export class RepositoryFactory {
  private static notificationRepository: NotificationRepository;
  private static messagingRepository: MessagingRepository;
  private static paymentRepository: PaymentRepository;

  // New unified repositories are singletons by design
  static getUserRepository() {
    return userRepository;
  }

  static getJobRepository() {
    return jobRepository;
  }

  static getPackageRepository() {
    return packageRepository;
  }

  // Legacy repository methods
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

  // Enhanced health check including new repositories
  static async healthCheck(): Promise<{
    user: boolean;
    job: boolean;
    package: boolean;
    notification: boolean;
    messaging: boolean;
    payment: boolean;
    overall: boolean;
  }> {
    const results = {
      user: false,
      job: false,
      package: false,
      notification: false,
      messaging: false,
      payment: false,
      overall: false,
    };

    try {
      // Test user repository
      await this.getUserRepository().count();
      results.user = true;
    } catch (error) {
      console.warn('User repository health check failed:', error);
    }

    try {
      // Test job repository
      await this.getJobRepository().count();
      results.job = true;
    } catch (error) {
      console.warn('Job repository health check failed:', error);
    }

    try {
      // Test package repository
      await this.getPackageRepository().count();
      results.package = true;
    } catch (error) {
      console.warn('Package repository health check failed:', error);
    }

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
      // Test payment repository
      await this.getPaymentRepository().getPaymentMethods();
      results.payment = true;
    } catch (error) {
      console.warn('Payment repository health check failed:', error);
    }

    results.overall =
      results.user &&
      results.job &&
      results.package &&
      results.notification &&
      results.messaging &&
      results.payment;

    return results;
  }

  // Enhanced cache clearing including unified API client
  static clearAllCaches(): void {
    // Clear unified API client cache (shared across all repositories)
    import('../api/UnifiedApiClient').then(({ unifiedApiClient }) => {
      unifiedApiClient.clearCache();
    });

    // Clear legacy repository caches
    this.getNotificationRepository().clearRepositoryCache();
    this.getMessagingRepository().clearRepositoryCache();
    this.getPaymentRepository().clearRepositoryCache();
  }

  // Enhanced cache statistics
  static getCacheStats(): {
    unified: { size: number; description: string };
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
      unified: {
        size: 1, // Unified API client uses Map-based caching
        description: 'Unified API client cache',
      },
      notification: notificationStats,
      messaging: messagingStats,
      payment: paymentStats,
      total:
        1 + notificationStats.size + messagingStats.size + paymentStats.size,
    };
  }
}

export default repositories;
