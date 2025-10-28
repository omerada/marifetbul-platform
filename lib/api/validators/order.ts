/**
 * ================================================
 * ORDER VALIDATORS - DEPRECATED
 * ================================================
 * This file is deprecated and now re-exports from backend-aligned types.
 * Use @/types/backend-aligned for all type definitions.
 *
 * @deprecated Use types from @/types/backend-aligned instead
 * @author MarifetBul Development Team
 * @version 3.0.0 - Unified Type System
 */

// Re-export from centralized types
export type {
  OrderStatus,
  OrderType,
  OrderCancellationReason,
  PackageTier,
  OrderPaymentStatus,
  DeliveryStatus,
  OrderResponse as Order, // Alias for backward compatibility
  OrderSummaryResponse as OrderSummary, // Alias for backward compatibility
  OrderResponse,
  OrderSummaryResponse,
  OrderStatistics,
  OrderEvent,
} from '@/types/backend-aligned';

/**
 * Request types - These remain in validators as they're frontend-specific
 */
export interface CreatePackageOrderRequest {
  packageId: string;
  amount: number;
  customizations?: string;
  deadline: string; // ISO 8601
}

export interface CreateCustomOrderRequest {
  sellerId: string;
  title: string;
  description: string;
  amount: number;
  requirements: string;
  deadline: string;
}

export interface SubmitDeliveryRequest {
  deliverables: string;
  deliveryNote?: string;
  attachments?: string[];
}

export interface RequestRevisionRequest {
  revisionNote: string;
  attachments?: string[];
}

export interface CancelOrderRequest {
  reason: string;
  note?: string;
}

export interface OrderListFilters {
  status?: string | string[];
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}

export interface PagedOrdersResponse {
  content: OrderResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// Import backend-aligned types for validation
import type { OrderResponse } from '@/types/backend-aligned';

/**
 * Runtime validation functions
 * @deprecated Use Zod schemas from @/lib/core/validations/order
 */
export function validateOrder(data: unknown): OrderResponse {
  // Basic runtime validation
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid order data');
  }
  return data as OrderResponse;
}

export function validatePagedOrders(data: unknown): PagedOrdersResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid paged orders data');
  }
  return data as PagedOrdersResponse;
}

export function validateCreatePackageOrderRequest(
  data: unknown
): CreatePackageOrderRequest {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid create package order request');
  }
  return data as CreatePackageOrderRequest;
}

export function validateCreateCustomOrderRequest(
  data: unknown
): CreateCustomOrderRequest {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid create custom order request');
  }
  return data as CreateCustomOrderRequest;
}

/**
 * @deprecated This file will be removed in v4.0.0
 * Migrate to:
 * - Types: @/types/backend-aligned
 * - Validations: @/lib/core/validations/order
 */
