/**
 * ================================================
 * ORDER API CLIENT
 * ================================================
 * API client for order management operations
 *
 * Features:
 * - Order creation (package/custom)
 * - Order retrieval with validation
 * - Order status management
 * - Order history
 * - Order events timeline
 *
 * @author MarifetBul Development Team
 * @version 3.0.0 - Sprint 3: Backend-Aligned Types
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import {
  validateOrder,
  validatePagedOrders,
  validateCreatePackageOrderRequest,
  validateCreateCustomOrderRequest,
  type Order,
  type OrderStatus,
  type OrderType,
  type CreatePackageOrderRequest,
  type CreateCustomOrderRequest,
  type SubmitDeliveryRequest,
  type RequestRevisionRequest,
  type CancelOrderRequest,
  type OrderListFilters,
  type OrderStatistics,
  type PagedOrdersResponse,
} from './validators/order';
import type { OrderTimelineEvent } from '@/types/business/features/order';

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
  // Validate request
  validateCreatePackageOrderRequest(request);

  const response = await apiClient.post<Order>(
    ENDPOINTS.CREATE_PACKAGE_ORDER,
    request
  );

  // Validate response
  return validateOrder(response);
}

/**
 * Create a custom order
 * @throws {ValidationError} Invalid request or response
 * @throws {AuthenticationError} Not authenticated
 */
export async function createCustomOrder(
  request: CreateCustomOrderRequest
): Promise<Order> {
  // Validate request
  validateCreateCustomOrderRequest(request);

  const response = await apiClient.post<Order>(
    ENDPOINTS.CREATE_CUSTOM_ORDER,
    request
  );

  // Validate response
  return validateOrder(response);
}

/**
 * Get order details by ID
 * @throws {NotFoundError} Order not found
 * @throws {AuthenticationError} Not authenticated
 */
export async function getOrder(orderId: string): Promise<Order> {
  const response = await apiClient.get<Order>(ENDPOINTS.GET_ORDER(orderId));
  return validateOrder(response);
}

/**
 * Get all my orders (buyer + seller)
 */
export async function getMyOrders(
  filters?: OrderListFilters
): Promise<PagedOrdersResponse> {
  const params = buildOrderFilterParams(filters);
  const url = `${ENDPOINTS.GET_MY_ORDERS}?${params.toString()}`;

  const response = await apiClient.get<PagedOrdersResponse>(url);
  return validatePagedOrders(response);
}

/**
 * Get orders where I'm the buyer
 */
export async function getBuyerOrders(
  filters?: OrderListFilters
): Promise<PagedOrdersResponse> {
  const params = buildOrderFilterParams(filters);
  const url = `${ENDPOINTS.GET_BUYER_ORDERS}?${params.toString()}`;

  const response = await apiClient.get<PagedOrdersResponse>(url);
  return validatePagedOrders(response);
}

/**
 * Get orders where I'm the seller
 */
export async function getSellerOrders(
  filters?: OrderListFilters
): Promise<PagedOrdersResponse> {
  const params = buildOrderFilterParams(filters);
  const url = `${ENDPOINTS.GET_SELLER_ORDERS}?${params.toString()}`;

  const response = await apiClient.get<PagedOrdersResponse>(url);
  return validatePagedOrders(response);
}

/**
 * Confirm payment for an order
 */
export async function confirmPayment(
  orderId: string,
  paymentId: string
): Promise<Order> {
  const response = await apiClient.post<Order>(
    ENDPOINTS.CONFIRM_PAYMENT(orderId),
    { paymentId }
  );
  return validateOrder(response);
}

/**
 * Accept an order (seller)
 */
export async function acceptOrder(orderId: string): Promise<Order> {
  const response = await apiClient.post<Order>(
    ENDPOINTS.ACCEPT_ORDER(orderId),
    {}
  );
  return validateOrder(response);
}

/**
 * Start working on an order (seller)
 */
export async function startOrder(orderId: string): Promise<Order> {
  const response = await apiClient.post<Order>(
    ENDPOINTS.START_ORDER(orderId),
    {}
  );
  return validateOrder(response);
}

/**
 * Submit delivery (seller)
 */
export async function submitDelivery(
  orderId: string,
  request: SubmitDeliveryRequest
): Promise<Order> {
  const response = await apiClient.post<Order>(
    ENDPOINTS.SUBMIT_DELIVERY(orderId),
    request
  );
  return validateOrder(response);
}

/**
 * Approve delivery (buyer)
 */
export async function approveDelivery(orderId: string): Promise<Order> {
  const response = await apiClient.post<Order>(
    ENDPOINTS.APPROVE_DELIVERY(orderId),
    {}
  );
  return validateOrder(response);
}

/**
 * Request revision (buyer)
 */
export async function requestRevision(
  orderId: string,
  request: RequestRevisionRequest
): Promise<Order> {
  const response = await apiClient.post<Order>(
    ENDPOINTS.REQUEST_REVISION(orderId),
    request
  );
  return validateOrder(response);
}

/**
 * Complete an order
 */
export async function completeOrder(orderId: string): Promise<Order> {
  const response = await apiClient.post<Order>(
    ENDPOINTS.COMPLETE_ORDER(orderId),
    {}
  );
  return validateOrder(response);
}

/**
 * Cancel an order
 */
export async function cancelOrder(
  orderId: string,
  request: CancelOrderRequest
): Promise<Order> {
  const response = await apiClient.post<Order>(
    ENDPOINTS.CANCEL_ORDER(orderId),
    request
  );
  return validateOrder(response);
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
export async function getOrderEvents(
  orderId: string
): Promise<OrderTimelineEvent[]> {
  return apiClient.get<OrderTimelineEvent[]>(ENDPOINTS.GET_EVENTS(orderId));
}

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Build URLSearchParams from order filters
 */
function buildOrderFilterParams(filters?: OrderListFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (!filters) return params;

  if (filters.status) {
    filters.status.forEach((s) => params.append('status', s));
  }
  if (filters.type) {
    filters.type.forEach((t) => params.append('type', t));
  }
  if (filters.page !== undefined) {
    params.append('page', filters.page.toString());
  }
  if (filters.size !== undefined) {
    params.append('size', filters.size.toString());
  }
  if (filters.sortBy) {
    params.append('sortBy', filters.sortBy);
  }
  if (filters.sortDir) {
    params.append('sortDir', filters.sortDir);
  }

  return params;
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(order: Order): boolean {
  return order.canCancel ?? false;
}

/**
 * Check if order can be completed
 */
export function canCompleteOrder(order: Order): boolean {
  return order.canComplete ?? false;
}

/**
 * Get order status badge color
 */
export function getOrderStatusColor(status: OrderStatus): string {
  const colorMap: Record<OrderStatus, string> = {
    PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-indigo-100 text-indigo-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-orange-100 text-orange-800',
    DISPUTED: 'bg-red-100 text-red-800',
    IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  };

  return colorMap[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get order status label (Turkish)
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  const labelMap: Record<OrderStatus, string> = {
    PENDING_PAYMENT: 'Ödeme Bekleniyor',
    PAID: 'Ödendi',
    IN_PROGRESS: 'Devam Ediyor',
    DELIVERED: 'Teslim Edildi',
    COMPLETED: 'Tamamlandı',
    CANCELED: 'İptal Edildi',
    REFUNDED: 'İade Edildi',
    DISPUTED: 'İhtilafta',
    IN_REVIEW: 'İnceleniyor',
  };

  return labelMap[status] || status;
}

/**
 * Get order type label (Turkish)
 */
export function getOrderTypeLabel(type: OrderType): string {
  const labelMap: Record<OrderType, string> = {
    PACKAGE_ORDER: 'Paket Siparişi',
    JOB_ORDER: 'İş Siparişi',
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
