/**
 * Service Layer Index
 * Exports all domain services for use in the application
 */

// Base service functionality
export {
  BaseService,
  ServiceError,
  createSuccessResult,
  createErrorResult,
} from './base';
export type {
  ServiceResult,
  ServiceOptions,
  ServiceContext,
  PaginationOptions,
  PaginatedResult,
  CacheConfig,
} from './base';

// Domain Services
export { NotificationService } from './notification.service';
export { MessagingService } from './messaging.service';
export { PaymentService } from './payment.service';

// Import for factory
import { NotificationService } from './notification.service';
import { MessagingService } from './messaging.service';
import { PaymentService } from './payment.service';
import { RepositoryFactory } from '../repositories';

// Service Data Types
export type {
  SendMessageData,
  CreateConversationData,
} from './messaging.service';

export type {
  PaymentData,
  RefundData,
  EscrowReleaseData,
  PaymentRecord,
  InvoiceRecord,
} from './payment.service';

// Service Factory - for dependency injection and testing
export class ServiceFactory {
  private static notificationService: NotificationService;
  private static messagingService: MessagingService;
  private static paymentService: PaymentService;

  static getNotificationService(): NotificationService {
    if (!this.notificationService) {
      this.notificationService = new NotificationService(
        RepositoryFactory.getNotificationRepository()
      );
    }
    return this.notificationService;
  }

  static getMessagingService(): MessagingService {
    if (!this.messagingService) {
      this.messagingService = new MessagingService(
        RepositoryFactory.getMessagingRepository()
      );
    }
    return this.messagingService;
  }

  static getPaymentService(): PaymentService {
    if (!this.paymentService) {
      this.paymentService = new PaymentService();
    }
    return this.paymentService;
  }

  // For testing - allows service replacement
  static setNotificationService(service: NotificationService): void {
    this.notificationService = service;
  }

  static setMessagingService(service: MessagingService): void {
    this.messagingService = service;
  }

  static setPaymentService(service: PaymentService): void {
    this.paymentService = service;
  }

  // Reset all services (useful for testing)
  static reset(): void {
    this.notificationService = new NotificationService();
    this.messagingService = new MessagingService();
    this.paymentService = new PaymentService();
  }
}
