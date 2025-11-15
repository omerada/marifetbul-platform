/**
 * ================================================
 * ORDER TYPE HELPERS & COMPUTED PROPERTIES
 * ================================================
 * Helper types and functions for orders that compute
 * derived properties from OrderResponse
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import type { OrderResponse } from './backend-aligned';

/**
 * Extended Order type with computed properties
 * Use this in components that need nested objects
 */
export interface OrderWithComputed extends OrderResponse {
  // Computed nested objects for backward compatibility
  packageDetails?: {
    packageTitle: string;
    tier?: string;
    deliveryDays?: number;
    features?: string[];
  };

  delivery?: {
    deliveryNote?: string;
    submittedAt?: string;
    attachments?: string[];
  };

  revisions?: {
    revisionsUsed: number;
    revisionsRemaining: number;
    revisionLimit: number;
  };

  financials: {
    subtotal: number;
    serviceFee: number;
    netAmount: number;
    total: number;
    currency: string;
    // Optional fields that might exist in some order types
    tax?: number;
    discount?: number;
    sellerEarnings?: number;
  };

  seller: {
    id: string;
    name: string;
    username?: string;
    fullName?: string;
  };

  buyer: {
    id: string;
    name: string;
    username?: string;
    fullName?: string;
  };

  // Additional fields
  customDescription?: string;
  paymentStatus?:
    | 'PENDING'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'FAILED'
    | 'REFUNDED';
  cancellation?: {
    canceledAt?: string;
    reason?: string;
    note?: string;
  };

  // Payment-related fields (future sprint - payment integration)
  // Temporarily added for backward compatibility
  paymentMode?: 'ONLINE' | 'MANUAL_IBAN' | 'ESCROW';
  paymentProofUrl?: string;
  paymentConfirmedAt?: string;
  buyerPaymentConfirmed?: boolean;
  sellerPaymentConfirmed?: boolean;
}

/**
 * Compute package details from OrderResponse
 */
export function computePackageDetails(order: OrderResponse) {
  if (!order.packageId) return undefined;

  return {
    packageTitle: order.packageTitle || 'Unknown Package',
    tier: undefined, // This should come from package API if needed
    deliveryDays: undefined,
    features: [],
  };
}

/**
 * Compute delivery details from OrderResponse
 */
export function computeDeliveryDetails(order: OrderResponse) {
  return {
    deliveryNote: order.deliveryNote,
    submittedAt: order.deliveredAt,
    attachments: [], // Attachments should be fetched separately if needed
  };
}

/**
 * Compute revision details from OrderResponse
 */
export function computeRevisionDetails(order: OrderResponse) {
  const revisionsUsed = order.revisionCount || 0;
  const revisionLimit = order.maxRevisions || 0;
  const revisionsRemaining = Math.max(0, revisionLimit - revisionsUsed);

  return {
    revisionsUsed,
    revisionsRemaining,
    revisionLimit,
  };
}

/**
 * Compute financial details from OrderResponse
 */
export function computeFinancialDetails(order: OrderResponse) {
  // Calculate seller earnings (total - platform fee)
  const sellerEarnings = order.totalAmount - order.platformFee;

  return {
    subtotal: order.totalAmount,
    serviceFee: order.platformFee,
    netAmount: order.netAmount,
    total: order.totalAmount,
    currency: order.currency || 'TRY',
    sellerEarnings,
    // Optional fields
    tax: 0,
    discount: 0,
  };
}

/**
 * Compute seller details from OrderResponse
 */
export function computeSellerDetails(order: OrderResponse) {
  return {
    id: order.sellerId,
    name: order.sellerName,
    username: order.sellerName, // Backend doesn't separate username/fullName yet
    fullName: order.sellerName,
  };
}

/**
 * Compute buyer details from OrderResponse
 */
export function computeBuyerDetails(order: OrderResponse) {
  return {
    id: order.buyerId,
    name: order.buyerName,
    username: order.buyerName, // Backend doesn't separate username/fullName yet
    fullName: order.buyerName,
  };
}

/**
 * Enrich OrderResponse with computed properties
 * Use this to convert backend OrderResponse to component-friendly format
 */
export function enrichOrder(order: OrderResponse): OrderWithComputed {
  return {
    ...order,
    packageDetails: computePackageDetails(order),
    delivery: computeDeliveryDetails(order),
    revisions: computeRevisionDetails(order),
    financials: computeFinancialDetails(order),
    seller: computeSellerDetails(order),
    buyer: computeBuyerDetails(order),
    customDescription: order.requirements, // Map requirements to customDescription
    // Payment status mapping
    paymentStatus: 'COMPLETED', // Default - should be fetched from payment service if needed
    // Cancellation mapping
    cancellation: order.canceledAt
      ? {
          canceledAt: order.canceledAt,
          reason: order.cancellationReason,
          note: order.cancellationNote,
        }
      : undefined,
    // Payment-related fields (temporary defaults for Sprint 2)
    paymentMode: undefined, // Will be properly integrated in payment sprint
    paymentProofUrl: undefined,
    paymentConfirmedAt: undefined,
    buyerPaymentConfirmed: false,
    sellerPaymentConfirmed: false,
  };
}

/**
 * Extract OrderResponse from ApiResponse wrapper
 * Many API methods return ApiResponse<OrderResponse>, this unwraps it
 */
export function unwrapOrderResponse<T>(response: T | { data: T }): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

/**
 * Type guard to check if order has computed properties
 */
export function hasComputedProperties(
  order: OrderResponse | OrderWithComputed
): order is OrderWithComputed {
  return (
    'packageDetails' in order || 'delivery' in order || 'revisions' in order
  );
}

/**
 * Get order status display label
 */
export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING_PAYMENT: 'Ödeme Bekleniyor',
    PAID: 'Ödendi',
    IN_PROGRESS: 'Devam Ediyor',
    IN_REVIEW: 'İnceleniyor',
    DELIVERED: 'Teslim Edildi',
    COMPLETED: 'Tamamlandı',
    CANCELED: 'İptal Edildi',
    REFUNDED: 'İade Edildi',
    DISPUTED: 'Anlaşmazlık',
  };

  return labels[status] || status;
}

/**
 * Get order status color for UI
 */
export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING_PAYMENT: 'yellow',
    PAID: 'blue',
    IN_PROGRESS: 'purple',
    IN_REVIEW: 'orange',
    DELIVERED: 'cyan',
    COMPLETED: 'green',
    CANCELED: 'red',
    REFUNDED: 'gray',
    DISPUTED: 'red',
  };

  return colors[status] || 'gray';
}

/**
 * Check if order can be revised
 */
export function canRequestRevision(order: OrderResponse): boolean {
  const revisionsRemaining =
    (order.maxRevisions || 0) - (order.revisionCount || 0);
  return order.status === 'DELIVERED' && revisionsRemaining > 0;
}

/**
 * Check if order can be delivered
 */
export function canSubmitDelivery(order: OrderResponse): boolean {
  return order.status === 'IN_PROGRESS';
}

/**
 * Check if order can be approved
 */
export function canApproveDelivery(order: OrderResponse): boolean {
  return order.status === 'DELIVERED' || order.status === 'IN_REVIEW';
}
