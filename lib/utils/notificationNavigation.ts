/**
 * ================================================
 * NOTIFICATION NAVIGATION HELPER
 * ================================================
 * Centralized navigation logic for notification clicks
 *
 * Features:
 * - Type-based routing (refund, order, milestone, etc.)
 * - Detail modal triggers
 * - External navigation
 * - Query parameter support
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Story 3.4: Refund Notifications Enhancement
 */

import { EnhancedNotification } from '@/types';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

export interface NavigationResult {
  /** URL to navigate to */
  url?: string;

  /** Whether to open in new tab */
  newTab?: boolean;

  /** Modal to open (if applicable) */
  modal?: 'refund-detail' | 'order-detail' | 'milestone-detail';

  /** ID for modal detail view */
  detailId?: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

// ================================================
// NAVIGATION HANDLER
// ================================================

/**
 * Get navigation result for notification click
 *
 * @param notification - The notification that was clicked
 * @returns Navigation result with URL or modal info
 *
 * @example
 * ```ts
 * const result = getNotificationNavigation(notification);
 * if (result.url) {
 *   router.push(result.url);
 * } else if (result.modal) {
 *   openModal(result.modal, result.detailId);
 * }
 * ```
 */
export function getNotificationNavigation(
  notification: EnhancedNotification
): NavigationResult {
  const { type } = notification;

  logger.debug('NotificationNavigation: Processing navigation', {
    type,
    notificationId: notification.id,
  });

  // Refund notifications (Sprint 3)
  if (type.includes('refund')) {
    return handleRefundNavigation(notification);
  }

  // Milestone notifications (Sprint 1)
  if (type.includes('milestone')) {
    return handleMilestoneNavigation(notification);
  }

  // Payment/Escrow notifications
  if (type.includes('payment') || type.includes('escrow')) {
    return handlePaymentNavigation(notification);
  }

  // Order notifications
  if (type.includes('order') || type.includes('service')) {
    return handleOrderNavigation(notification);
  }

  // Message/Proposal notifications
  if (type.includes('message') || type.includes('proposal')) {
    return handleMessageNavigation(notification);
  }

  // Review/Rating notifications
  if (type.includes('review') || type.includes('rating')) {
    return handleReviewNavigation(notification);
  }

  // Default: Navigate to dashboard
  logger.warn('NotificationNavigation: Unknown notification type', { type });
  return { url: '/dashboard' };
}

// ================================================
// TYPE-SPECIFIC HANDLERS
// ================================================

/**
 * Handle refund notification navigation
 */
function handleRefundNavigation(
  notification: EnhancedNotification
): NavigationResult {
  const refundId = notification.data?.refundId as string | undefined;
  const orderId = notification.data?.orderId as string | undefined;

  // Priority 1: Refund detail modal (if refundId exists)
  if (refundId) {
    logger.debug('NotificationNavigation: Opening refund detail modal', {
      refundId,
    });
    return {
      modal: 'refund-detail',
      detailId: refundId,
      metadata: { orderId },
    };
  }

  // Priority 2: Refunds list page (filtered by order if available)
  const url = orderId
    ? `/dashboard/refunds?orderId=${orderId}`
    : '/dashboard/refunds';

  logger.debug('NotificationNavigation: Navigating to refunds page', { url });
  return { url };
}

/**
 * Handle milestone notification navigation
 */
function handleMilestoneNavigation(
  notification: EnhancedNotification
): NavigationResult {
  const milestoneId = notification.data?.milestoneId as string | undefined;
  const orderId = notification.data?.orderId as string | undefined;

  // Priority 1: Milestone detail modal
  if (milestoneId) {
    return {
      modal: 'milestone-detail',
      detailId: milestoneId,
      metadata: { orderId },
    };
  }

  // Priority 2: Order detail page
  if (orderId) {
    return { url: `/dashboard/orders/${orderId}#milestones` };
  }

  // Fallback: Orders list
  return { url: '/dashboard/orders' };
}

/**
 * Handle payment/escrow notification navigation
 */
function handlePaymentNavigation(
  notification: EnhancedNotification
): NavigationResult {
  const orderId = notification.data?.orderId as string | undefined;
  const transactionId = notification.data?.transactionId as string | undefined;

  // Priority 1: Order detail (payments tab)
  if (orderId) {
    return { url: `/dashboard/orders/${orderId}#payments` };
  }

  // Priority 2: Wallet (transactions)
  if (transactionId) {
    return { url: `/dashboard/wallet?transaction=${transactionId}` };
  }

  // Fallback: Wallet page
  return { url: '/dashboard/wallet' };
}

/**
 * Handle order notification navigation
 */
function handleOrderNavigation(
  notification: EnhancedNotification
): NavigationResult {
  const orderId = notification.data?.orderId as string | undefined;

  if (orderId) {
    return { url: `/dashboard/orders/${orderId}` };
  }

  return { url: '/dashboard/orders' };
}

/**
 * Handle message/proposal notification navigation
 */
function handleMessageNavigation(
  notification: EnhancedNotification
): NavigationResult {
  const conversationId = notification.data?.conversationId as
    | string
    | undefined;
  const proposalId = notification.data?.proposalId as string | undefined;

  // Priority 1: Specific conversation
  if (conversationId) {
    return { url: `/messages/${conversationId}` };
  }

  // Priority 2: Proposal detail
  if (proposalId) {
    return { url: `/dashboard/proposals/${proposalId}` };
  }

  // Fallback: Messages inbox
  return { url: '/messages' };
}

/**
 * Handle review/rating notification navigation
 */
function handleReviewNavigation(
  notification: EnhancedNotification
): NavigationResult {
  const orderId = notification.data?.orderId as string | undefined;
  const reviewId = notification.data?.reviewId as string | undefined;

  // Priority 1: Order detail (reviews tab)
  if (orderId) {
    return { url: `/dashboard/orders/${orderId}#reviews` };
  }

  // Priority 2: Review detail (if standalone review page exists)
  if (reviewId) {
    return { url: `/dashboard/reviews/${reviewId}` };
  }

  // Fallback: Orders list
  return { url: '/dashboard/orders' };
}

// ================================================
// MODAL TRIGGER HELPER
// ================================================

/**
 * Check if notification should trigger a modal
 */
export function shouldOpenModal(notification: EnhancedNotification): boolean {
  const result = getNotificationNavigation(notification);
  return !!result.modal;
}

/**
 * Get modal info for notification
 */
export function getNotificationModal(notification: EnhancedNotification): {
  type: 'refund-detail' | 'order-detail' | 'milestone-detail';
  id: string;
} | null {
  const result = getNotificationNavigation(notification);

  if (result.modal && result.detailId) {
    return {
      type: result.modal,
      id: result.detailId,
    };
  }

  return null;
}

// ================================================
// DEFAULT EXPORT
// ================================================

export default getNotificationNavigation;
