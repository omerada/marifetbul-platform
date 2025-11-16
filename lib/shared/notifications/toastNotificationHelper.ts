/**
 * ================================================
 * TOAST NOTIFICATION HELPER - PRODUCTION READY
 * ================================================
 * Notification-specific toast messages
 * Sprint 1.3: Toast Notification System
 *
 * Features:
 * - Type-specific toast variants
 * - Action buttons with navigation
 * - Icon mapping per notification type
 * - Auto-dismiss with sensible defaults
 * - Sound & vibration integration
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 */

import { toast } from 'sonner';
import type { Notification } from '@/types/domains/notification';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPE DEFINITIONS
// ================================================

export interface NotificationToastOptions {
  sound?: boolean;
  vibration?: boolean;
  duration?: number;
  showAction?: boolean;
}

// ================================================
// ICON EMOJI MAPPING
// ================================================

export function getNotificationToastIcon(type: string): string {
  switch (type.toUpperCase()) {
    // Order & Milestone
    case 'ORDER_CREATED':
    case 'ORDER_CONFIRMED':
      return '🛒';
    case 'ORDER_COMPLETED':
      return '✅';
    case 'ORDER_CANCELLED':
      return '❌';

    case 'MILESTONE_DELIVERED':
      return '📦';
    case 'MILESTONE_ACCEPTED':
      return '✅';
    case 'MILESTONE_REVISION_REQUESTED':
      return '🔄';

    // Package
    case 'PACKAGE_PURCHASED':
    case 'PACKAGE_APPROVED':
      return '📦';

    // Message
    case 'MESSAGE_RECEIVED':
    case 'PROPOSAL_RECEIVED':
      return '💬';

    // Payment
    case 'PAYMENT_RECEIVED':
    case 'PAYMENT_PROCESSED':
    case 'PAYOUT_COMPLETED':
      return '💰';

    case 'REFUND_APPROVED':
      return '💵';
    case 'REFUND_REJECTED':
      return '⚠️';

    // Review
    case 'REVIEW_RECEIVED':
      return '⭐';

    // Dispute
    case 'DISPUTE_OPENED':
      return '⚠️';

    // System
    case 'SYSTEM_ANNOUNCEMENT':
    case 'MAINTENANCE_SCHEDULED':
      return 'ℹ️';

    default:
      return '🔔';
  }
}

// ================================================
// TOAST DURATION MAPPING
// ================================================

export function getNotificationToastDuration(type: string): number {
  switch (type.toUpperCase()) {
    // Critical notifications - longer duration
    case 'ORDER_CANCELLED':
    case 'PAYMENT_FAILED':
    case 'REFUND_REJECTED':
    case 'DISPUTE_OPENED':
      return 8000;

    // Important notifications - medium duration
    case 'ORDER_COMPLETED':
    case 'MILESTONE_ACCEPTED':
    case 'PAYMENT_RECEIVED':
    case 'PAYOUT_COMPLETED':
      return 6000;

    // Standard notifications - default duration
    case 'MESSAGE_RECEIVED':
    case 'PROPOSAL_RECEIVED':
    case 'REVIEW_RECEIVED':
      return 5000;

    // Info notifications - shorter duration
    case 'SYSTEM_ANNOUNCEMENT':
      return 4000;

    default:
      return 5000;
  }
}

// ================================================
// TOAST VARIANT MAPPING
// ================================================

export function getNotificationToastVariant(
  type: string
): 'success' | 'error' | 'info' | 'warning' {
  switch (type.toUpperCase()) {
    // Success variants
    case 'ORDER_COMPLETED':
    case 'MILESTONE_ACCEPTED':
    case 'PAYMENT_RECEIVED':
    case 'PAYOUT_COMPLETED':
    case 'REFUND_APPROVED':
    case 'REVIEW_RECEIVED':
      return 'success';

    // Error variants
    case 'ORDER_CANCELLED':
    case 'PAYMENT_FAILED':
    case 'REFUND_REJECTED':
    case 'DISPUTE_OPENED':
      return 'error';

    // Warning variants
    case 'MILESTONE_REVISION_REQUESTED':
    case 'ORDER_DELAYED':
    case 'PAYMENT_PENDING':
      return 'warning';

    // Info variants (default)
    default:
      return 'info';
  }
}

// ================================================
// MAIN TOAST FUNCTION
// ================================================

/**
 * Show notification as toast
 * @param notification - Notification object
 * @param options - Toast options
 */
export function showNotificationToast(
  notification: Notification,
  options: NotificationToastOptions = {}
): void {
  const {
    duration = getNotificationToastDuration(notification.type),
    showAction = true,
  } = options;

  const variant = getNotificationToastVariant(notification.type);
  const icon = getNotificationToastIcon(notification.type);

  // Prepare toast options
  const toastOptions = {
    description: notification.content,
    duration,
    icon,
    action:
      showAction && notification.actionUrl
        ? {
            label: getActionLabel(notification.type),
            onClick: () => {
              if (notification.actionUrl) {
                window.location.href = notification.actionUrl;
              }
            },
          }
        : undefined,
  };

  // Show toast based on variant
  switch (variant) {
    case 'success':
      toast.success(notification.title, toastOptions);
      break;
    case 'error':
      toast.error(notification.title, toastOptions);
      break;
    case 'warning':
      toast.warning(notification.title, toastOptions);
      break;
    case 'info':
    default:
      toast.info(notification.title, toastOptions);
      break;
  }

  logger.debug('Toast notification shown', {
    id: notification.id,
    type: notification.type,
    variant,
  });
}

// ================================================
// ACTION LABEL HELPER
// ================================================

function getActionLabel(type: string): string {
  switch (type.toUpperCase()) {
    case 'MESSAGE_RECEIVED':
    case 'PROPOSAL_RECEIVED':
      return 'Yanıtla';

    case 'ORDER_CREATED':
    case 'ORDER_CONFIRMED':
    case 'ORDER_COMPLETED':
    case 'MILESTONE_DELIVERED':
    case 'MILESTONE_ACCEPTED':
      return 'Siparişi Gör';

    case 'PAYMENT_RECEIVED':
    case 'PAYOUT_COMPLETED':
    case 'REFUND_APPROVED':
      return 'Cüzdanı Gör';

    case 'REVIEW_RECEIVED':
      return 'İncelemeyi Gör';

    case 'DISPUTE_OPENED':
      return 'İtirazı Gör';

    case 'PACKAGE_PURCHASED':
    case 'PACKAGE_APPROVED':
      return 'Paketi Gör';

    default:
      return 'Görüntüle';
  }
}

// ================================================
// BATCH NOTIFICATION TOAST
// ================================================

/**
 * Show grouped notifications (e.g., "3 new messages")
 * @param count - Number of notifications
 * @param type - Notification type
 * @param actionUrl - Optional action URL
 */
export function showBatchNotificationToast(
  count: number,
  type: string,
  actionUrl?: string
): void {
  if (count <= 0) return;

  const title = getBatchTitle(count, type);
  const description = getBatchDescription(count, type);
  const icon = getNotificationToastIcon(type);

  toast.info(title, {
    description,
    icon,
    duration: 6000,
    action: actionUrl
      ? {
          label: 'Tümünü Gör',
          onClick: () => {
            window.location.href = actionUrl;
          },
        }
      : undefined,
  });

  logger.debug('Batch notification toast shown', { count, type });
}

function getBatchTitle(count: number, type: string): string {
  switch (type.toUpperCase()) {
    case 'MESSAGE_RECEIVED':
      return `${count} yeni mesaj`;
    case 'ORDER_CREATED':
      return `${count} yeni sipariş`;
    case 'PROPOSAL_RECEIVED':
      return `${count} yeni teklif`;
    case 'REVIEW_RECEIVED':
      return `${count} yeni inceleme`;
    default:
      return `${count} yeni bildirim`;
  }
}

function getBatchDescription(count: number, type: string): string {
  switch (type.toUpperCase()) {
    case 'MESSAGE_RECEIVED':
      return 'Mesajlarınızı kontrol edin';
    case 'ORDER_CREATED':
      return 'Yeni siparişleriniz var';
    case 'PROPOSAL_RECEIVED':
      return 'Tekliflerinizi inceleyin';
    default:
      return 'Bildirimlerinizi kontrol edin';
  }
}

// ================================================
// PRIORITY-BASED TOAST
// ================================================

/**
 * Show notification based on priority
 * High priority: Sound + vibration + longer duration
 * Medium priority: Sound only + normal duration
 * Low priority: No sound + shorter duration
 */
export function showPriorityNotificationToast(
  notification: Notification,
  playSound: () => void
): void {
  const priority = notification.priority || 'medium';

  switch (priority) {
    case 'high':
    case 'urgent':
      playSound();
      showNotificationToast(notification, {
        duration: 8000,
        sound: true,
        vibration: true,
      });
      break;

    case 'medium':
      playSound();
      showNotificationToast(notification, {
        duration: 5000,
        sound: true,
        vibration: false,
      });
      break;

    case 'low':
    default:
      showNotificationToast(notification, {
        duration: 4000,
        sound: false,
        vibration: false,
      });
      break;
  }
}

// ================================================
// EXPORT
// ================================================

export const notificationToastHelper = {
  show: showNotificationToast,
  showBatch: showBatchNotificationToast,
  showPriority: showPriorityNotificationToast,
  getIcon: getNotificationToastIcon,
  getDuration: getNotificationToastDuration,
  getVariant: getNotificationToastVariant,
};

export default notificationToastHelper;
