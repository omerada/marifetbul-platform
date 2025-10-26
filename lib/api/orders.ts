/**
 * ================================================
 * ORDER API CLIENT
 * ================================================
 * API client for order management operations
 *
 * Features:
 * - Order creation (package/custom)
 * - Order retrieval
 * - Order status management
 * - Order history
 * - Order events timeline
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 3: API Layer Unification
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { validateResponse, OrderSchema } from './validators';
import type { Order } from './validators';
import {
  OrderResponse,
  OrderSummaryResponse,
  OrderStatistics,
  OrderEvent,
  OrderType,
  OrderStatus,
  OrderCancellationReason,
  PageResponse,
} from '@/types/backend-aligned';

// ================================================
// API ENDPOINTS
// ================================================

const ENDPOINTS = {
  // Order CRUD
  CREATE_PACKAGE_ORDER: '/api/orders/package',
  CREATE_CUSTOM_ORDER: '/api/orders/custom',
  GET_ORDER: (id: string) => `/api/orders/${id}`,
  GET_MY_ORDERS: '/api/orders/me',
  GET_BUYER_ORDERS: '/api/orders/buyer',
  GET_SELLER_ORDERS: '/api/orders/seller',

  // Order Status
  CONFIRM_PAYMENT: (id: string) => `/api/orders/${id}/confirm-payment`,
  ACCEPT_ORDER: (id: string) => `/api/orders/${id}/accept`,
  START_ORDER: (id: string) => `/api/orders/${id}/start`,
  SUBMIT_DELIVERY: (id: string) => `/api/orders/${id}/deliver`,
  APPROVE_DELIVERY: (id: string) => `/api/orders/${id}/approve`,
  REQUEST_REVISION: (id: string) => `/api/orders/${id}/revision`,
  COMPLETE_ORDER: (id: string) => `/api/orders/${id}/complete`,
  CANCEL_ORDER: (id: string) => `/api/orders/${id}/cancel`,

  // Statistics & Events
  GET_STATISTICS: '/api/orders/stats',
  GET_EVENTS: (id: string) => `/api/orders/${id}/events`,
} as const;

// ================================================
// REQUEST TYPES
// ================================================

export interface CreatePackageOrderRequest {
  packageId: string;
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM';
  requirements?: string;
  notes?: string;
}

export interface CreateCustomOrderRequest {
  sellerId: string;
  title: string;
  description: string;
  amount: number;
  requirements?: string;
  deadline: string; // ISO 8601
}

export interface SubmitDeliveryRequest {
  deliveryNote: string;
  attachments?: string[];
}

export interface RequestRevisionRequest {
  revisionNote: string;
}

export interface CancelOrderRequest {
  reason: OrderCancellationReason;
  note?: string;
}

export interface OrderListFilters {
  status?: OrderStatus[];
  type?: OrderType[];
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'deadline' | 'totalAmount';
  sortDir?: 'asc' | 'desc';
}

// ================================================
// API FUNCTIONS
// ================================================

/**
 * Create a new package order
 * @throws {ValidationError} Invalid request or response
 * @throws {AuthenticationError} Not authenticated
 */
export async function createPackageOrder(
  request: CreatePackageOrderRequest
): Promise<Order> {
  const response = await apiClient.post<OrderResponse>(
    ENDPOINTS.CREATE_PACKAGE_ORDER,
    request
  );
  return validateResponse(OrderSchema, response, 'Order');
}

/**
 * Create a custom order
 * @throws {ValidationError} Invalid request or response
 * @throws {AuthenticationError} Not authenticated
 */
export async function createCustomOrder(
  request: CreateCustomOrderRequest
): Promise<Order> {
  const response = await apiClient.post<OrderResponse>(
    ENDPOINTS.CREATE_CUSTOM_ORDER,
    request
  );
  return validateResponse(OrderSchema, response, 'Order');
}

/**
 * Get order details by ID
 * @throws {NotFoundError} Order not found
 * @throws {AuthenticationError} Not authenticated
 */
export async function getOrder(orderId: string): Promise<OrderResponse> {
  return apiClient.get<OrderResponse>(ENDPOINTS.GET_ORDER(orderId));
}

/**
 * Get all my orders (buyer + seller)
 */
export async function getMyOrders(
  filters?: OrderListFilters
): Promise<PageResponse<OrderSummaryResponse>> {
  const params = new URLSearchParams();

  if (filters?.status) {
    filters.status.forEach((s) => params.append('status', s));
  }
  if (filters?.type) {
    filters.type.forEach((t) => params.append('type', t));
  }
  if (filters?.page !== undefined) {
    params.append('page', filters.page.toString());
  }
  if (filters?.size !== undefined) {
    params.append('size', filters.size.toString());
  }
  if (filters?.sortBy) {
    params.append('sortBy', filters.sortBy);
  }
  if (filters?.sortDir) {
    params.append('sortDir', filters.sortDir);
  }

  const url = `${ENDPOINTS.GET_MY_ORDERS}?${params.toString()}`;
  return apiClient.get<PageResponse<OrderSummaryResponse>>(url);
}

/**
 * Get orders where I'm the buyer
 */
export async function getBuyerOrders(
  filters?: OrderListFilters
): Promise<PageResponse<OrderSummaryResponse>> {
  const params = new URLSearchParams();

  if (filters?.status) {
    filters.status.forEach((s) => params.append('status', s));
  }
  if (filters?.page !== undefined) {
    params.append('page', filters.page.toString());
  }
  if (filters?.size !== undefined) {
    params.append('size', filters.size.toString());
  }

  const url = `${ENDPOINTS.GET_BUYER_ORDERS}?${params.toString()}`;
  return apiClient.get<PageResponse<OrderSummaryResponse>>(url);
}

/**
 * Get orders where I'm the seller
 */
export async function getSellerOrders(
  filters?: OrderListFilters
): Promise<PageResponse<OrderSummaryResponse>> {
  const params = new URLSearchParams();

  if (filters?.status) {
    filters.status.forEach((s) => params.append('status', s));
  }
  if (filters?.page !== undefined) {
    params.append('page', filters.page.toString());
  }
  if (filters?.size !== undefined) {
    params.append('size', filters.size.toString());
  }

  const url = `${ENDPOINTS.GET_SELLER_ORDERS}?${params.toString()}`;
  return apiClient.get<PageResponse<OrderSummaryResponse>>(url);
}

/**
 * Confirm payment for an order
 */
export async function confirmPayment(
  orderId: string,
  paymentId: string
): Promise<OrderResponse> {
  return apiClient.post<OrderResponse>(ENDPOINTS.CONFIRM_PAYMENT(orderId), {
    paymentId,
  });
}

/**
 * Accept an order (seller)
 */
export async function acceptOrder(orderId: string): Promise<OrderResponse> {
  return apiClient.post<OrderResponse>(ENDPOINTS.ACCEPT_ORDER(orderId), {});
}

/**
 * Start working on an order (seller)
 */
export async function startOrder(orderId: string): Promise<OrderResponse> {
  return apiClient.post<OrderResponse>(ENDPOINTS.START_ORDER(orderId), {});
}

/**
 * Submit delivery (seller)
 */
export async function submitDelivery(
  orderId: string,
  request: SubmitDeliveryRequest
): Promise<OrderResponse> {
  return apiClient.post<OrderResponse>(
    ENDPOINTS.SUBMIT_DELIVERY(orderId),
    request
  );
}

/**
 * Approve delivery (buyer)
 */
export async function approveDelivery(orderId: string): Promise<OrderResponse> {
  return apiClient.post<OrderResponse>(ENDPOINTS.APPROVE_DELIVERY(orderId), {});
}

/**
 * Request revision (buyer)
 */
export async function requestRevision(
  orderId: string,
  request: RequestRevisionRequest
): Promise<OrderResponse> {
  return apiClient.post<OrderResponse>(
    ENDPOINTS.REQUEST_REVISION(orderId),
    request
  );
}

/**
 * Complete an order
 */
export async function completeOrder(orderId: string): Promise<OrderResponse> {
  return apiClient.post<OrderResponse>(ENDPOINTS.COMPLETE_ORDER(orderId), {});
}

/**
 * Cancel an order
 */
export async function cancelOrder(
  orderId: string,
  request: CancelOrderRequest
): Promise<OrderResponse> {
  return apiClient.post<OrderResponse>(
    ENDPOINTS.CANCEL_ORDER(orderId),
    request
  );
}

/**
 * Get order statistics
 */
export async function getOrderStatistics(): Promise<OrderStatistics> {
  return apiClient.get<OrderStatistics>(ENDPOINTS.GET_STATISTICS);
}

/**
 * Get order events timeline
 */
export async function getOrderEvents(orderId: string): Promise<OrderEvent[]> {
  return apiClient.get<OrderEvent[]>(ENDPOINTS.GET_EVENTS(orderId));
}

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(order: OrderResponse): boolean {
  return order.canCancel ?? false;
}

/**
 * Check if order can be completed
 */
export function canCompleteOrder(order: OrderResponse): boolean {
  return order.canComplete ?? false;
}

/**
 * Get order status badge color
 */
export function getOrderStatusColor(status: OrderStatus): string {
  const colorMap: Record<OrderStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-indigo-100 text-indigo-800',
    APPROVED: 'bg-green-100 text-green-800',
    REVISION_REQUESTED: 'bg-orange-100 text-orange-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    DISPUTED: 'bg-red-100 text-red-800',
  };

  return colorMap[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get order status label (Turkish)
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  const labelMap: Record<OrderStatus, string> = {
    PENDING: 'Beklemede',
    ACCEPTED: 'Kabul Edildi',
    IN_PROGRESS: 'Devam Ediyor',
    DELIVERED: 'Teslim Edildi',
    APPROVED: 'Onaylandı',
    REVISION_REQUESTED: 'Revizyon İstendi',
    COMPLETED: 'Tamamlandı',
    CANCELLED: 'İptal Edildi',
    DISPUTED: 'İhtilafta',
  };

  return labelMap[status] || status;
}

/**
 * Get order type label (Turkish)
 */
export function getOrderTypeLabel(type: OrderType): string {
  const labelMap: Record<OrderType, string> = {
    JOB_PROPOSAL: 'İş Teklifi',
    PACKAGE_ORDER: 'Paket Siparişi',
    CUSTOM_ORDER: 'Özel Sipariş',
  };

  return labelMap[type] || type;
}

/**
 * Format remaining time
 */
export function formatRemainingTime(hours?: number): string {
  if (!hours || hours < 0) return 'Süre doldu';

  if (hours < 24) {
    return `${Math.floor(hours)} saat`;
  }

  const days = Math.floor(hours / 24);
  return `${days} gün`;
}

// ================================================
// BARREL EXPORT
// ================================================

export const orderApi = {
  // Order Creation
  createPackageOrder,
  createCustomOrder,

  // Order Retrieval
  getOrder,
  getMyOrders,
  getBuyerOrders,
  getSellerOrders,

  // Order Status
  confirmPayment,
  acceptOrder,
  startOrder,
  submitDelivery,
  approveDelivery,
  requestRevision,
  completeOrder,
  cancelOrder,

  // Statistics & Events
  getOrderStatistics,
  getOrderEvents,

  // Helpers
  canCancelOrder,
  canCompleteOrder,
  getOrderStatusColor,
  getOrderStatusLabel,
  getOrderTypeLabel,
  formatRemainingTime,
};
