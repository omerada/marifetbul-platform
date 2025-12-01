/**
 * ================================================
 * MILESTONE NOTIFICATION HELPERS
 * ================================================
 * Helper functions for creating milestone-related notifications
 *
 * Features:
 * - Milestone delivered notification
 * - Milestone accepted notification
 * - Milestone revision requested notification
 * - Auto-acceptance warning notifications
 *
 * Sprint: Sprint 1 - Milestone Payment System
 * Story: 1.10 - Notification Integration (5 pts)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  OrderMilestone,
  MilestoneStatus,
} from '@/types/business/features/milestone';

// ============================================================================
// TYPES
// ============================================================================

export interface MilestoneNotificationOptions {
  /** Show toast notification */
  showToast?: boolean;
  /** Toast duration in ms */
  toastDuration?: number;
  /** Custom toast message */
  customMessage?: string;
}

export interface MilestoneNotificationData {
  milestoneId: string;
  milestoneTitle: string;
  orderId: string;
  orderTitle: string;
  amount: number;
  currency: string;
  status: MilestoneStatus;
  userRole: 'FREELANCER' | 'EMPLOYER';
}

// ============================================================================
// NOTIFICATION CREATORS
// ============================================================================

/**
 * Notify when milestone is delivered
 */
export function notifyMilestoneDelivered(
  data: MilestoneNotificationData,
  options: MilestoneNotificationOptions = {}
): void {
  const { showToast = true, toastDuration = 5000, customMessage } = options;

  logger.info('[MilestoneNotifications] Milestone delivered', {
    milestoneId: data.milestoneId,
    orderId: data.orderId,
  });

  if (!showToast) return;

  const message =
    customMessage ||
    (data.userRole === 'EMPLOYER'
      ? `Freelancer "${data.milestoneTitle}" milestone'ını teslim etti`
      : `"${data.milestoneTitle}" milestone'ı başarıyla teslim ettiniz`);

  toast.success('Milestone Teslim Edildi', {
    description: message,
    duration: toastDuration,
    action: {
      label: 'Görüntüle',
      onClick: () => {
        window.location.href = `/dashboard/orders/${data.orderId}`;
      },
    },
  });
}

/**
 * Notify when milestone is accepted
 */
export function notifyMilestoneAccepted(
  data: MilestoneNotificationData,
  options: MilestoneNotificationOptions = {}
): void {
  const { showToast = true, toastDuration = 5000, customMessage } = options;

  logger.info('[MilestoneNotifications] Milestone accepted', {
    milestoneId: data.milestoneId,
    orderId: data.orderId,
  });

  if (!showToast) return;

  const message =
    customMessage ||
    (data.userRole === 'FREELANCER'
      ? `"${data.milestoneTitle}" onaylandı. ${data.amount} ${data.currency} ödeme hesabınıza aktarıldı.`
      : `"${data.milestoneTitle}" milestone'ını onayladınız. Ödeme serbest bırakıldı.`);

  toast.success('Milestone Onaylandı', {
    description: message,
    duration: toastDuration,
    action: {
      label: 'Detaylar',
      onClick: () => {
        window.location.href = `/dashboard/orders/${data.orderId}`;
      },
    },
  });
}

/**
 * Notify when milestone revision is requested
 */
export function notifyMilestoneRevisionRequested(
  data: MilestoneNotificationData,
  revisionReason: string,
  options: MilestoneNotificationOptions = {}
): void {
  const { showToast = true, toastDuration = 7000, customMessage } = options;

  logger.info('[MilestoneNotifications] Revision requested', {
    milestoneId: data.milestoneId,
    orderId: data.orderId,
  });

  if (!showToast) return;

  const message =
    customMessage ||
    (data.userRole === 'FREELANCER'
      ? `"${data.milestoneTitle}" için revizyon istendi: ${revisionReason.substring(0, 100)}${revisionReason.length > 100 ? '...' : ''}`
      : `"${data.milestoneTitle}" için revizyon istediniz.`);

  toast.warning('Revizyon İstendi', {
    description: message,
    duration: toastDuration,
    action: {
      label: 'İncele',
      onClick: () => {
        window.location.href = `/dashboard/orders/${data.orderId}`;
      },
    },
  });
}

/**
 * Notify when milestone is started
 */
export function notifyMilestoneStarted(
  data: MilestoneNotificationData,
  options: MilestoneNotificationOptions = {}
): void {
  const { showToast = true, toastDuration = 4000, customMessage } = options;

  logger.info('[MilestoneNotifications] Milestone started', {
    milestoneId: data.milestoneId,
    orderId: data.orderId,
  });

  if (!showToast) return;

  const message =
    customMessage ||
    (data.userRole === 'EMPLOYER'
      ? `Freelancer "${data.milestoneTitle}" üzerinde çalışmaya başladı`
      : `"${data.milestoneTitle}" üzerinde çalışmaya başladınız`);

  toast.info('Milestone Başladı', {
    description: message,
    duration: toastDuration,
  });
}

/**
 * Notify about upcoming milestone deadline
 */
export function notifyMilestoneDeadlineApproaching(
  data: MilestoneNotificationData,
  daysRemaining: number,
  options: MilestoneNotificationOptions = {}
): void {
  const { showToast = true, toastDuration = 6000, customMessage } = options;

  logger.warn('[MilestoneNotifications] Deadline approaching', {
    milestoneId: data.milestoneId,
    daysRemaining,
  });

  if (!showToast) return;

  const message =
    customMessage ||
    `"${data.milestoneTitle}" milestone'ının teslim tarihine ${daysRemaining} gün kaldı`;

  toast.warning('Teslim Tarihi Yaklaşıyor', {
    description: message,
    duration: toastDuration,
    action: {
      label: 'Görüntüle',
      onClick: () => {
        window.location.href = `/dashboard/orders/${data.orderId}`;
      },
    },
  });
}

/**
 * Notify about overdue milestone
 */
export function notifyMilestoneOverdue(
  data: MilestoneNotificationData,
  daysOverdue: number,
  options: MilestoneNotificationOptions = {}
): void {
  const { showToast = true, toastDuration = 8000, customMessage } = options;

  logger.error(
    '[MilestoneNotifications] Milestone overdue',
    new Error('Milestone overdue'),
    {
      milestoneId: data.milestoneId,
      daysOverdue: daysOverdue,
    }
  );

  if (!showToast) return;

  const message =
    customMessage ||
    `"${data.milestoneTitle}" teslim tarihi ${daysOverdue} gün geçti. Lütfen mümkün olan en kısa sürede teslim edin.`;

  toast.error('Milestone Gecikti', {
    description: message,
    duration: toastDuration,
    action: {
      label: 'Acil İncele',
      onClick: () => {
        window.location.href = `/dashboard/orders/${data.orderId}`;
      },
    },
  });
}

/**
 * Notify about auto-acceptance warning (48 hours before)
 */
export function notifyAutoAcceptanceWarning(
  data: MilestoneNotificationData,
  hoursRemaining: number,
  options: MilestoneNotificationOptions = {}
): void {
  const { showToast = true, toastDuration = 10000, customMessage } = options;

  logger.warn('[MilestoneNotifications] Auto-acceptance warning', {
    milestoneId: data.milestoneId,
    hoursRemaining,
  });

  if (!showToast) return;

  const message =
    customMessage ||
    `"${data.milestoneTitle}" ${hoursRemaining} saat içinde otomatik olarak onaylanacak. İncelemenizi yapın.`;

  toast.warning('Otomatik Onay Uyarısı', {
    description: message,
    duration: toastDuration,
    action: {
      label: 'Hemen İncele',
      onClick: () => {
        window.location.href = `/dashboard/orders/${data.orderId}`;
      },
    },
  });
}

/**
 * Notify when milestone is auto-accepted
 */
export function notifyMilestoneAutoAccepted(
  data: MilestoneNotificationData,
  options: MilestoneNotificationOptions = {}
): void {
  const { showToast = true, toastDuration = 8000, customMessage } = options;

  logger.info('[MilestoneNotifications] Milestone auto-accepted', {
    milestoneId: data.milestoneId,
    orderId: data.orderId,
  });

  if (!showToast) return;

  const message =
    customMessage ||
    (data.userRole === 'FREELANCER'
      ? `"${data.milestoneTitle}" otomatik olarak onaylandı. ${data.amount} ${data.currency} ödeme hesabınıza aktarıldı.`
      : `"${data.milestoneTitle}" otomatik olarak onaylandı. Ödeme serbest bırakıldı.`);

  toast.success('Otomatik Onay', {
    description: message,
    duration: toastDuration,
    action: {
      label: 'Detaylar',
      onClick: () => {
        window.location.href = `/dashboard/orders/${data.orderId}`;
      },
    },
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert OrderMilestone to MilestoneNotificationData
 */
export function toNotificationData(
  milestone: OrderMilestone,
  userRole: 'FREELANCER' | 'EMPLOYER',
  orderTitle?: string
): MilestoneNotificationData {
  return {
    milestoneId: milestone.id,
    milestoneTitle: milestone.title,
    orderId: milestone.orderId,
    orderTitle: orderTitle || 'Sipariş',
    amount: milestone.amount,
    currency: milestone.currency,
    status: milestone.status,
    userRole,
  };
}

/**
 * Get notification function based on status
 */
export function getNotificationForStatus(
  status: MilestoneStatus
):
  | typeof notifyMilestoneDelivered
  | typeof notifyMilestoneAccepted
  | typeof notifyMilestoneStarted
  | null {
  switch (status) {
    case 'DELIVERED':
      return notifyMilestoneDelivered;
    case 'ACCEPTED':
      return notifyMilestoneAccepted;
    case 'IN_PROGRESS':
      return notifyMilestoneStarted;
    default:
      return null;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const milestoneNotifications = {
  notifyDelivered: notifyMilestoneDelivered,
  notifyAccepted: notifyMilestoneAccepted,
  notifyRevisionRequested: notifyMilestoneRevisionRequested,
  notifyStarted: notifyMilestoneStarted,
  notifyDeadlineApproaching: notifyMilestoneDeadlineApproaching,
  notifyOverdue: notifyMilestoneOverdue,
  notifyAutoAcceptanceWarning: notifyAutoAcceptanceWarning,
  notifyAutoAccepted: notifyMilestoneAutoAccepted,
  toNotificationData,
  getNotificationForStatus,
};

export default milestoneNotifications;
