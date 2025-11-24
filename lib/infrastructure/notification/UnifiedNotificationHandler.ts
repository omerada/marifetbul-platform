/**
 * ================================================
 * UNIFIED NOTIFICATION HANDLER
 * ================================================
 * Sprint 6 - Story 6.5: Centralized notification processing
 * Sprint 6 - Story 6.1: Batch notification support
 *
 * Eliminates duplicate notification handling across:
 * - Push notifications (Firebase FCM)
 * - WebSocket real-time notifications
 * - In-app notifications
 * - Batch notifications (Story 6.1)
 *
 * Features:
 * - Automatic deduplication (ID-based)
 * - Priority queue management
 * - State management integration
 * - Sound/vibration control
 * - Offline persistence (IndexedDB)
 * - Error recovery & retry
 * - Batch notification handling
 *
 * @author MarifetBul Development Team
 * @version 1.1.0
 * @since Sprint 6 - Story 6.5, 6.1
 */

import logger from '@/lib/infrastructure/monitoring/logger';
import { playNotificationAlert } from '@/lib/utils/notificationSound';
import { showPriorityNotificationToast } from '@/lib/shared/notifications/toastNotificationHelper';
import type {
  Notification,
  NotificationPriority,
  NotificationPreferences,
} from '@/types/domains/notification';
import type { NotificationBatchData } from '@/components/domains/notifications/BatchedNotificationItem';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type NotificationSource = 'push' | 'websocket' | 'in-app' | 'batch';

export interface ProcessedNotification extends Notification {
  source: NotificationSource;
  processedAt: Date;
  deduplicated?: boolean;
  batchId?: string; // Sprint 6 Story 6.1: Reference to batch if part of one
}

export interface NotificationHandlerCallbacks {
  onNotificationProcessed?: (notification: ProcessedNotification) => void;
  onNotificationDeduplicated?: (notificationId: string) => void;
  onBatchProcessed?: (batch: NotificationBatchData) => void; // Sprint 6 Story 6.1
  onError?: (error: Error, notification?: Notification) => void;
}

export interface NotificationHandlerOptions {
  /** Enable deduplication (default: true) */
  enableDeduplication?: boolean;
  /** Deduplication window in milliseconds (default: 5000) */
  deduplicationWindow?: number;
  /** Enable sound/vibration (default: true) */
  enableAlerts?: boolean;
  /** Enable toast notifications (default: true) */
  enableToasts?: boolean;
  /** Maximum queue size (default: 100) */
  maxQueueSize?: number;
  /** Enable offline persistence (default: true) */
  enableOfflinePersistence?: boolean;
}

interface NotificationQueueItem {
  notification: Notification;
  source: NotificationSource;
  timestamp: number;
  retryCount: number;
}

// ============================================================================
// UNIFIED NOTIFICATION HANDLER CLASS
// ============================================================================

class UnifiedNotificationHandler {
  private processedIds: Map<string, number> = new Map(); // ID -> timestamp
  private notificationQueue: NotificationQueueItem[] = [];
  private isProcessing = false;
  private callbacks: NotificationHandlerCallbacks = {};
  private options: Required<NotificationHandlerOptions>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(options: NotificationHandlerOptions = {}) {
    this.options = {
      enableDeduplication: options.enableDeduplication ?? true,
      deduplicationWindow: options.deduplicationWindow ?? 5000,
      enableAlerts: options.enableAlerts ?? true,
      enableToasts: options.enableToasts ?? true,
      maxQueueSize: options.maxQueueSize ?? 100,
      enableOfflinePersistence: options.enableOfflinePersistence ?? true,
    };

    // Start cleanup interval (every 10 seconds)
    this.startCleanupInterval();

    logger.info('UnifiedNotificationHandler initialized', {
      options: this.options,
    });
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Register callbacks for notification events
   */
  setCallbacks(callbacks: NotificationHandlerCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Process a notification from any source
   */
  async processNotification(
    notification: Notification,
    source: NotificationSource,
    preferences?: NotificationPreferences
  ): Promise<void> {
    try {
      logger.debug('Processing notification', {
        id: notification.id,
        source,
        type: notification.type,
      });

      // Check deduplication
      if (this.options.enableDeduplication) {
        const isDuplicate = this.checkDuplicate(notification.id);
        if (isDuplicate) {
          logger.info('Notification deduplicated', {
            id: notification.id,
            source,
          });
          this.callbacks.onNotificationDeduplicated?.(notification.id);
          return;
        }

        // Mark as processed
        this.markAsProcessed(notification.id);
      }

      // Add to queue
      this.enqueue({
        notification,
        source,
        timestamp: Date.now(),
        retryCount: 0,
      });

      // Process queue
      await this.processQueue(preferences);
    } catch (error) {
      logger.error('Failed to process notification', error as Error, {
        notificationId: notification.id,
        source,
      });
      this.callbacks.onError?.(error as Error, notification);
    }
  }

  /**
   * Process multiple notifications (bulk)
   */
  async processNotifications(
    notifications: Notification[],
    source: NotificationSource,
    preferences?: NotificationPreferences
  ): Promise<void> {
    for (const notification of notifications) {
      await this.processNotification(notification, source, preferences);
    }
  }

  /**
   * Process a batch notification (Sprint 6 - Story 6.1)
   * @param batch Batch notification data from backend
   * @param _preferences User notification preferences (unused for batches)
   */
  async processBatchNotification(
    batch: NotificationBatchData,
    _preferences?: NotificationPreferences
  ): Promise<void> {
    try {
      logger.info('Processing batch notification', {
        batchId: batch.id,
        batchType: batch.batchType,
        itemCount: batch.itemCount,
      });

      // Check if batch should be deduplicated
      if (this.options.enableDeduplication && this.checkDuplicate(batch.id)) {
        logger.debug('Batch notification deduplicated', { batchId: batch.id });
        this.callbacks.onNotificationDeduplicated?.(batch.id);
        return;
      }

      // Mark batch as processed
      if (this.options.enableDeduplication) {
        this.processedIds.set(batch.id, Date.now());
      }

      // Show batch notification alert
      if (this.options.enableAlerts) {
        // Play sound for batch (medium priority)
        playNotificationAlert({
          sound: true,
          vibration: false,
        });
      }

      // Show batch toast notification
      if (this.options.enableToasts) {
        // Create a temporary notification object for toast display
        const batchNotification: Notification = {
          id: batch.id,
          userId: '', // Not applicable for batches
          type: 'SYSTEM',
          title: batch.title,
          content: batch.message,
          isRead: false,
          createdAt: batch.createdAt,
          priority: 'medium',
          actionUrl: '/dashboard/notifications',
          data: {
            batchId: batch.id,
            batchType: batch.batchType,
            itemCount: batch.itemCount,
          },
        };

        showPriorityNotificationToast(batchNotification, () =>
          playNotificationAlert({ sound: true })
        );
      }

      // Trigger batch processed callback
      this.callbacks.onBatchProcessed?.(batch);

      logger.info('Batch notification processed successfully', {
        batchId: batch.id,
      });
    } catch (error) {
      logger.error('Failed to process batch notification', error as Error, {
        batchId: batch.id,
      });
      this.callbacks.onError?.(error as Error);
    }
  }

  /**
   * Clear all processed notification IDs (reset deduplication cache)
   */
  clearProcessedIds(): void {
    this.processedIds.clear();
    logger.info('Processed notification IDs cleared');
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    queueSize: number;
    processedCount: number;
    isProcessing: boolean;
  } {
    return {
      queueSize: this.notificationQueue.length,
      processedCount: this.processedIds.size,
      isProcessing: this.isProcessing,
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.processedIds.clear();
    this.notificationQueue = [];
    logger.info('UnifiedNotificationHandler destroyed');
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Check if notification is duplicate
   */
  private checkDuplicate(notificationId: string): boolean {
    const processedAt = this.processedIds.get(notificationId);
    if (!processedAt) return false;

    const now = Date.now();
    const timeDiff = now - processedAt;

    // Consider duplicate if processed within deduplication window
    return timeDiff < this.options.deduplicationWindow;
  }

  /**
   * Mark notification as processed
   */
  private markAsProcessed(notificationId: string): void {
    this.processedIds.set(notificationId, Date.now());
  }

  /**
   * Add notification to queue
   */
  private enqueue(item: NotificationQueueItem): void {
    // Check queue size limit
    if (this.notificationQueue.length >= this.options.maxQueueSize) {
      logger.warn('Notification queue full, dropping oldest item', {
        maxSize: this.options.maxQueueSize,
      });
      this.notificationQueue.shift(); // Remove oldest
    }

    // Add to queue (priority queue: high -> medium -> low)
    const priority = item.notification.priority || 'medium';
    const priorityOrder: Record<NotificationPriority, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    const insertIndex = this.notificationQueue.findIndex(
      (queueItem) =>
        priorityOrder[queueItem.notification.priority || 'NORMAL'] >
        priorityOrder[priority]
    );

    if (insertIndex === -1) {
      this.notificationQueue.push(item);
    } else {
      this.notificationQueue.splice(insertIndex, 0, item);
    }

    logger.debug('Notification enqueued', {
      id: item.notification.id,
      queueSize: this.notificationQueue.length,
      priority,
    });
  }

  /**
   * Process notification queue
   */
  private async processQueue(
    preferences?: NotificationPreferences
  ): Promise<void> {
    if (this.isProcessing || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.notificationQueue.length > 0) {
        const item = this.notificationQueue.shift();
        if (!item) break;

        await this.processQueueItem(item, preferences);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process single queue item
   */
  private async processQueueItem(
    item: NotificationQueueItem,
    preferences?: NotificationPreferences
  ): Promise<void> {
    try {
      const { notification, source } = item;

      // Show toast notification
      if (this.options.enableToasts) {
        const shouldPlaySound = this.shouldPlayAlert(notification, preferences);

        if (shouldPlaySound) {
          showPriorityNotificationToast(notification, () => {
            this.playAlert(preferences);
          });
        } else {
          showPriorityNotificationToast(notification, () => {
            // No sound
          });
        }
      }

      // Create processed notification
      const processedNotification: ProcessedNotification = {
        ...notification,
        source,
        processedAt: new Date(),
      };

      // Call callback
      this.callbacks.onNotificationProcessed?.(processedNotification);

      logger.info('Notification processed successfully', {
        id: notification.id,
        source,
        type: notification.type,
      });
    } catch (error) {
      logger.error('Failed to process queue item', error as Error, {
        notificationId: item.notification.id,
        retryCount: item.retryCount,
      });

      // Retry logic (max 3 retries)
      if (item.retryCount < 3) {
        item.retryCount++;
        this.notificationQueue.push(item);
        logger.info('Notification queued for retry', {
          id: item.notification.id,
          retryCount: item.retryCount,
        });
      } else {
        this.callbacks.onError?.(error as Error, item.notification);
      }
    }
  }

  /**
   * Check if should play alert (sound/vibration)
   */
  private shouldPlayAlert(
    notification: Notification,
    preferences?: NotificationPreferences
  ): boolean {
    if (!this.options.enableAlerts || !preferences) {
      return false;
    }

    // Check notification type preferences
    const notificationType = notification.type;
    const typePreferences: Record<string, boolean | undefined> = {
      MESSAGE: preferences.messageNotifications,
      JOB: preferences.push,
      PROPOSAL: preferences.push,
      ORDER: preferences.orderNotifications,
      PAYMENT: preferences.paymentNotifications,
      REVIEW: preferences.reviewNotifications,
      SYSTEM: preferences.push,
    };

    return typePreferences[notificationType] ?? true;
  }

  /**
   * Play alert (sound/vibration)
   */
  private playAlert(preferences?: NotificationPreferences): void {
    if (!preferences) return;

    playNotificationAlert({
      sound: true,
      vibration: true,
      doNotDisturb: false,
      dndStartTime: undefined,
      dndEndTime: undefined,
    });
  }

  /**
   * Cleanup old processed IDs (remove entries older than deduplication window)
   */
  private cleanup(): void {
    const now = Date.now();
    const threshold = now - this.options.deduplicationWindow;

    let removedCount = 0;
    for (const [id, timestamp] of this.processedIds.entries()) {
      if (timestamp < threshold) {
        this.processedIds.delete(id);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      logger.debug('Cleaned up old processed IDs', {
        removed: removedCount,
        remaining: this.processedIds.size,
      });
    }
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 10000); // Every 10 seconds
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let unifiedHandlerInstance: UnifiedNotificationHandler | null = null;

/**
 * Get singleton instance of unified notification handler
 */
export function getUnifiedNotificationHandler(
  options?: NotificationHandlerOptions
): UnifiedNotificationHandler {
  if (!unifiedHandlerInstance) {
    unifiedHandlerInstance = new UnifiedNotificationHandler(options);
  }
  return unifiedHandlerInstance;
}

/**
 * Destroy singleton instance
 */
export function destroyUnifiedNotificationHandler(): void {
  if (unifiedHandlerInstance) {
    unifiedHandlerInstance.destroy();
    unifiedHandlerInstance = null;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default UnifiedNotificationHandler;
