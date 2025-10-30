/**
 * ================================================
 * ORDER DATA NORMALIZATION UTILITIES
 * ================================================
 * Central utilities for normalizing Order data across different sources
 * Eliminates the need for 'as never' casts and provides type-safe access
 *
 * Sprint 7: Order Data Normalization
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Order } from '@/types/business/features/orders';
import type { OrderResponse, OrderWithComputed } from '@/types/backend-aligned';
import { enrichOrder } from '@/types/order-helpers';

// ================================================
// TYPE DEFINITIONS
// ================================================

/**
 * Normalized Order type - Universal order representation
 * Simplified to avoid type conflicts - uses runtime validation
 */
export type NormalizedOrder = OrderWithComputed;

/**
 * Order source types - accepts any order-like structure
 */
export type OrderSource =
  | Order
  | OrderResponse
  | OrderWithComputed
  | Partial<Order>
  | any;

// ================================================
// NORMALIZATION FUNCTIONS
// ================================================

/**
 * Normalize any order-like object to a consistent structure
 * This is the main entry point for order normalization
 *
 * @param order - Any order-like object
 * @returns Normalized order with all convenience properties
 */
export function normalizeOrder(order: OrderSource): NormalizedOrder {
  if (!order) {
    throw new Error('Cannot normalize null or undefined order');
  }

  // If already enriched (has computed properties), return as-is
  if (hasComputedProperties(order)) {
    return order as NormalizedOrder;
  }

  // If it's an OrderResponse, enrich it
  if (isOrderResponse(order)) {
    return enrichOrder(order) as NormalizedOrder;
  }

  // If it's a basic Order type, add computed properties
  const normalized: any = {
    ...order,
    // Add convenience properties with safe fallbacks
    packageTitle: order.packageTitle || order.packageDetails?.packageTitle,
    customDescription:
      order.customDescription || order.customOrderDetails?.description,
    totalAmount: order.totalAmount ?? order.financials?.total ?? order.amount,
    sellerName:
      order.sellerName || order.seller?.username || order.seller?.name,
    buyerName: order.buyerName || order.buyer?.username || order.buyer?.name,
  };

  return normalized as NormalizedOrder;
}

/**
 * Check if order has computed properties (is already enriched)
 */
function hasComputedProperties(order: any): boolean {
  return (
    order &&
    (order.packageDetails !== undefined ||
      order.delivery !== undefined ||
      order.revisions !== undefined ||
      order.financials !== undefined)
  );
}

/**
 * Type guard to check if order is OrderResponse
 */
function isOrderResponse(order: any): order is OrderResponse {
  return (
    order &&
    typeof order.id === 'string' &&
    typeof order.orderNumber === 'string' &&
    typeof order.status === 'string' &&
    // OrderResponse specific fields
    (order.buyerName !== undefined || order.sellerName !== undefined)
  );
}

// ================================================
// TYPE GUARDS
// ================================================

/**
 * Check if order is a custom order
 */
export function isCustomOrder(order: OrderSource): boolean {
  const normalized = normalizeOrder(order);
  const n = normalized as any;
  return (
    n.customOrderDetails !== undefined ||
    normalized.customDescription !== undefined ||
    !normalized.packageId
  );
}

/**
 * Check if order is a package order
 */
export function isPackageOrder(order: OrderSource): boolean {
  const normalized = normalizeOrder(order);
  return normalized.packageId !== undefined;
}

/**
 * Check if order is a milestone-based order
 */
export function isMilestoneOrder(order: OrderSource): boolean {
  const normalized = normalizeOrder(order);
  const n = normalized as any;
  return n.milestones !== undefined && n.milestones.length > 0;
}

/**
 * Check if order has delivery submitted
 */
export function hasDeliverySubmitted(order: OrderSource): boolean {
  const normalized = normalizeOrder(order);
  return (
    normalized.delivery?.submittedAt !== undefined ||
    normalized.status === 'DELIVERED'
  );
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(order: OrderSource): boolean {
  const normalized = normalizeOrder(order);
  const status = String(normalized.status).toUpperCase();
  return (
    status === 'PENDING' ||
    status === 'PAID' ||
    status === 'IN_PROGRESS' ||
    status === 'PENDING_PAYMENT'
  );
}

/**
 * Check if order can submit delivery
 */
export function canSubmitDelivery(order: OrderSource): boolean {
  const normalized = normalizeOrder(order);
  const n = normalized as any;
  return (
    n.canSubmitDelivery === true ||
    (normalized.status === 'IN_PROGRESS' && !hasDeliverySubmitted(normalized))
  );
}

/**
 * Check if order can approve delivery
 */
export function canApproveDelivery(order: OrderSource): boolean {
  const normalized = normalizeOrder(order);
  const n = normalized as any;
  return (
    n.canApproveDelivery === true ||
    (hasDeliverySubmitted(normalized) && normalized.status === 'DELIVERED')
  );
}

/**
 * Check if order can request revision
 */
export function canRequestRevision(order: OrderSource): boolean {
  const normalized = normalizeOrder(order);
  const n = normalized as any;
  if (n.canRequestRevision === true) return true;

  const revisions = getRevisionInfo(normalized);
  return (
    hasDeliverySubmitted(normalized) &&
    revisions.remaining > 0 &&
    normalized.status === 'DELIVERED'
  );
}

// ================================================
// DATA EXTRACTION HELPERS
// ================================================

/**
 * Get order title with fallbacks
 */
export function getOrderTitle(order: OrderSource): string {
  const normalized = normalizeOrder(order);
  const n = normalized as any;
  return (
    normalized.packageTitle ||
    normalized.packageDetails?.packageTitle ||
    normalized.customDescription ||
    n.customOrderDetails?.title ||
    `Sipariş #${normalized.orderNumber || normalized.id?.slice(0, 8)}`
  );
}

/**
 * Get total amount with fallbacks
 */
export function getTotalAmount(order: OrderSource): number {
  const normalized = normalizeOrder(order);
  const n = normalized as any;
  return (
    normalized.totalAmount ?? normalized.financials?.total ?? n.amount ?? 0
  );
}

/**
 * Get currency with fallback
 */
export function getCurrency(order: OrderSource): string {
  const normalized = normalizeOrder(order);
  return normalized.currency ?? normalized.financials?.currency ?? 'TRY';
}

/**
 * Get seller name with fallbacks
 */
export function getSellerName(order: OrderSource): string {
  const normalized = normalizeOrder(order);
  return (
    normalized.sellerName ||
    normalized.seller?.username ||
    normalized.seller?.name ||
    'Freelancer'
  );
}

/**
 * Get buyer name with fallbacks
 */
export function getBuyerName(order: OrderSource): string {
  const normalized = normalizeOrder(order);
  return (
    normalized.buyerName ||
    normalized.buyer?.username ||
    normalized.buyer?.name ||
    'Alıcı'
  );
}

/**
 * Get revision info with fallbacks
 */
export function getRevisionInfo(order: OrderSource): {
  current: number;
  max: number;
  remaining: number;
} {
  const normalized = normalizeOrder(order);

  if (normalized.revisions) {
    const max = normalized.revisions.revisionLimit ?? 0;
    const remaining = normalized.revisions.revisionsRemaining ?? 0;
    const current = max - remaining;
    return { current, max, remaining };
  }

  return { current: 0, max: 0, remaining: 0 };
}

/**
 * Get delivery info
 */
export function getDeliveryInfo(order: OrderSource): {
  submittedAt?: string;
  notes?: string;
  files?: string[];
} {
  const normalized = normalizeOrder(order);
  const n = normalized as any;
  return {
    submittedAt: normalized.delivery?.submittedAt,
    notes: normalized.delivery?.deliveryNote || n.delivery?.notes,
    files: normalized.delivery?.attachments || n.delivery?.files,
  };
}

// ================================================
// FORMATTING UTILITIES
// ================================================

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number,
  currency: string = 'TRY'
): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date string
 */
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format date and time string
 */
export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ================================================
// RE-EXPORTS
// ================================================

// Re-export for convenience
export { enrichOrder, unwrapOrderResponse } from '@/types/order-helpers';
export type { OrderWithComputed } from '@/types/backend-aligned';
