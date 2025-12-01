/**
 * ================================================
 * ORDER API CLIENT - UNIFIED
 * ================================================
 * Re-exports from production-ready OrderService
 * This file maintains backward compatibility while using
 * the centralized service implementation
 *
 * @author MarifetBul Development Team
 * @version 4.0.0 - Unified API Architecture
 */

import orderServiceInstance from '@/lib/infrastructure/services/api/orderService';
import type {
  CreateJobOrderRequest,
  CreatePackageOrderRequest,
  CreateCustomOrderRequest,
  SubmitDeliveryRequest,
  RequestRevisionRequest,
  AcceptRevisionRequest,
  CompleteRevisionRequest,
  RejectRevisionRequest,
  OrderRevisionResponse,
  CancelOrderRequest,
  ConfirmManualPaymentRequest,
  OrderFilters,
} from '@/lib/infrastructure/services/api/orderService';

// Re-export types for backward compatibility
export type {
  CreateJobOrderRequest,
  CreatePackageOrderRequest,
  CreateCustomOrderRequest,
  SubmitDeliveryRequest,
  RequestRevisionRequest,
  AcceptRevisionRequest,
  CompleteRevisionRequest,
  RejectRevisionRequest,
  OrderRevisionResponse,
  CancelOrderRequest,
  ConfirmManualPaymentRequest,
  OrderFilters,
};

// Re-export from backend-aligned types
export type {
  OrderResponse,
  OrderSummaryResponse,
  OrderStatistics,
  OrderEvent,
  OrderStatus,
  ApiResponse,
  PageResponse,
  OrderWithComputed,
} from '@/types/backend-aligned';

// Re-export helper functions
export {
  enrichOrder,
  unwrapOrderResponse,
  getOrderStatusLabel,
  getOrderStatusColor,
  canRequestRevision,
  canSubmitDelivery,
  canApproveDelivery,
} from '@/types/backend-aligned';

/**
 * Unified Order API
 * All methods delegate to the centralized OrderService
 */
export const orderApi = {
  // ==================== ORDER CREATION ====================
  createJobOrder:
    orderServiceInstance.createJobOrder.bind(orderServiceInstance),
  createPackageOrder:
    orderServiceInstance.createPackageOrder.bind(orderServiceInstance),
  createCustomOrder:
    orderServiceInstance.createCustomOrder.bind(orderServiceInstance),

  // ==================== ORDER RETRIEVAL ====================
  getMyOrders: orderServiceInstance.getMyOrders.bind(orderServiceInstance),
  getOrder: orderServiceInstance.getOrderById.bind(orderServiceInstance), // Primary alias
  getOrderById: orderServiceInstance.getOrderById.bind(orderServiceInstance),
  getActiveOrders:
    orderServiceInstance.getActiveOrders.bind(orderServiceInstance),
  getCompletedOrders:
    orderServiceInstance.getCompletedOrders.bind(orderServiceInstance),
  getCancelledOrders:
    orderServiceInstance.getCancelledOrders.bind(orderServiceInstance),

  // ==================== SELLER ORDERS ====================
  getSellerOrders:
    orderServiceInstance.getSellerOrders.bind(orderServiceInstance),
  getActiveSellerOrders:
    orderServiceInstance.getActiveSellerOrders.bind(orderServiceInstance),
  getPendingSellerOrders:
    orderServiceInstance.getPendingSellerOrders.bind(orderServiceInstance),

  // ==================== BUYER ORDERS ====================
  // Note: getBuyerOrders maps to getMyOrders with role filtering on backend
  getBuyerOrders: orderServiceInstance.getMyOrders.bind(orderServiceInstance),
  getActiveBuyerOrders:
    orderServiceInstance.getActiveOrders.bind(orderServiceInstance),

  // ==================== ORDER ACTIONS ====================
  acceptOrder: orderServiceInstance.acceptOrder.bind(orderServiceInstance),
  startOrder: orderServiceInstance.startOrder.bind(orderServiceInstance),
  confirmManualPayment:
    orderServiceInstance.confirmManualPayment.bind(orderServiceInstance),
  submitDelivery:
    orderServiceInstance.submitDelivery.bind(orderServiceInstance),
  approveDelivery:
    orderServiceInstance.approveDelivery.bind(orderServiceInstance),
  requestRevision:
    orderServiceInstance.requestRevision.bind(orderServiceInstance),
  completeOrder: orderServiceInstance.completeOrder.bind(orderServiceInstance),
  cancelOrder: orderServiceInstance.cancelOrder.bind(orderServiceInstance),

  // ==================== ORDER REVISIONS ====================
  getOrderRevisions:
    orderServiceInstance.getOrderRevisions.bind(orderServiceInstance),
  acceptRevision:
    orderServiceInstance.acceptRevision.bind(orderServiceInstance),
  completeRevision:
    orderServiceInstance.completeRevision.bind(orderServiceInstance),
  rejectRevision:
    orderServiceInstance.rejectRevision.bind(orderServiceInstance),
  getPendingRevisions:
    orderServiceInstance.getPendingRevisions.bind(orderServiceInstance),

  // ==================== ORDER STATISTICS ====================
  getOrderStatistics:
    orderServiceInstance.getOrderStatistics.bind(orderServiceInstance),

  // ==================== ADMIN ENDPOINTS ====================
  getAllOrders: orderServiceInstance.getAllOrders.bind(orderServiceInstance),
  // REMOVED: getDisputedOrders - Use getAllDisputes from @/lib/api/disputes instead
  resolveDispute:
    orderServiceInstance.resolveDispute.bind(orderServiceInstance),

  // ==================== HELPER FUNCTIONS ====================
  // Re-exported from order-helpers for convenience
  getOrderStatusLabel: (status: string) => {
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
  },

  getOrderStatusColor: (status: string) => {
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
  },

  // ==================== CACHE MANAGEMENT ====================
  invalidateCache:
    orderServiceInstance.invalidateOrderCache.bind(orderServiceInstance),
  clearCache: orderServiceInstance.clearOrderCache.bind(orderServiceInstance),
} as const;

// Default export for convenience
export default orderApi;

/**
 * Individual function exports for tree-shaking
 * These maintain the old API surface for components that use direct imports
 */
export const createPackageOrder = orderApi.createPackageOrder;
export const createCustomOrder = orderApi.createCustomOrder;
export const createJobOrder = orderApi.createJobOrder;
export const getOrder = orderApi.getOrderById; // Alias for backward compatibility
export const getOrderById = orderApi.getOrderById;
export const getMyOrders = orderApi.getMyOrders;
export const getBuyerOrders = orderApi.getBuyerOrders;
export const getSellerOrders = orderApi.getSellerOrders;
export const acceptOrder = orderApi.acceptOrder;
export const startOrder = orderApi.startOrder;
export const confirmManualPayment = orderApi.confirmManualPayment;
export const submitDelivery = orderApi.submitDelivery;
export const approveDelivery = orderApi.approveDelivery;
export const requestRevision = orderApi.requestRevision;
export const completeOrder = orderApi.completeOrder;
export const cancelOrder = orderApi.cancelOrder;
export const getOrderStatistics = orderApi.getOrderStatistics;

// Revision exports
export const getOrderRevisions = orderApi.getOrderRevisions;
export const acceptRevision = orderApi.acceptRevision;
export const completeRevision = orderApi.completeRevision;
export const rejectRevision = orderApi.rejectRevision;
export const getPendingRevisions = orderApi.getPendingRevisions;
