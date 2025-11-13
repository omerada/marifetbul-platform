/**
 * ===================================================================================
 * ORDER SERVICE - Production-Ready API Client
 * ===================================================================================
 * Complete order management service matching Spring Boot backend endpoints exactly
 *
 * Backend Controller: OrderController.java
 * Base Path: /api/v1/orders
 *
 * @version 2.0.0
 * @author MarifetBul Development Team
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { ORDER_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse,
  PageResponse,
  OrderResponse,
  OrderSummaryResponse,
  OrderStatistics,
  OrderEvent,
  OrderStatus,
} from '@/types/backend-aligned';
import type { PaymentMode } from '@/types/business/features/order';

// ================================================
// REQUEST TYPES
// ================================================

export interface CreateJobOrderRequest {
  jobId: string;
  sellerId: string;
  paymentMode: PaymentMode; // Dual Payment System
  amount: number;
  requirements?: string;
  deadline: string; // ISO 8601
}

export interface CreatePackageOrderRequest {
  packageId: string;
  paymentMode: PaymentMode; // Dual Payment System
  amount: number;
  tier?: string;
  customizations?: string;
  requirements?: string;
  deadline: string;
  notes?: string;
}

export interface CreateCustomOrderRequest {
  sellerId: string;
  title: string;
  description: string;
  amount: number;
  requirements: string;
  paymentMode: PaymentMode; // Dual Payment System
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

export interface AcceptRevisionRequest {
  responseNote?: string;
}

export interface CompleteRevisionRequest {
  completionNote?: string;
}

export interface RejectRevisionRequest {
  rejectionReason: string;
}

export interface OrderRevisionResponse {
  id: string;
  orderId: string;
  requestedBy: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    fullName: string;
    avatarUrl?: string;
  };
  revisionNumber: number;
  revisionNote: string;
  responseNote?: string;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
}

export interface CancelOrderRequest {
  reason: string;
  note?: string;
}

export interface ConfirmManualPaymentRequest {
  paymentReference: string;
  notes?: string;
}

export interface OrderFilters {
  status?: OrderStatus | OrderStatus[];
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}

// ================================================
// ORDER SERVICE CLASS
// ================================================

class OrderService {
  // ==================== ORDER CREATION ====================

  /**
   * Create an order from a job proposal
   * POST /api/v1/orders/job
   */
  async createJobOrder(
    request: CreateJobOrderRequest
  ): Promise<ApiResponse<OrderResponse>> {
    return apiClient.post<ApiResponse<OrderResponse>>(
      ORDER_ENDPOINTS.CREATE + '/job',
      request
    );
  }

  /**
   * Create an order from a package
   * POST /api/v1/orders/package
   */
  async createPackageOrder(
    request: CreatePackageOrderRequest
  ): Promise<ApiResponse<OrderResponse>> {
    return apiClient.post<ApiResponse<OrderResponse>>(
      ORDER_ENDPOINTS.CREATE + '/package',
      request
    );
  }

  /**
   * Create a custom order
   * POST /api/v1/orders/custom
   */
  async createCustomOrder(
    request: CreateCustomOrderRequest
  ): Promise<ApiResponse<OrderResponse>> {
    return apiClient.post<ApiResponse<OrderResponse>>(
      ORDER_ENDPOINTS.CREATE + '/custom',
      request
    );
  }

  // ==================== ORDER RETRIEVAL ====================

  /**
   * Get current user's orders with filters and pagination
   * GET /api/v1/orders
   */
  async getMyOrders(
    filters?: OrderFilters
  ): Promise<ApiResponse<PageResponse<OrderSummaryResponse>>> {
    const params = this.buildQueryParams(filters);
    return apiClient.get<ApiResponse<PageResponse<OrderSummaryResponse>>>(
      ORDER_ENDPOINTS.MY_ORDERS,
      params
    );
  }

  /**
   * Get order by ID with full details
   * GET /api/v1/orders/:orderId
   */
  async getOrderById(orderId: string): Promise<ApiResponse<OrderResponse>> {
    return apiClient.get<ApiResponse<OrderResponse>>(
      ORDER_ENDPOINTS.GET_BY_ID(orderId)
    );
  }

  /**
   * Get active orders
   * GET /api/v1/orders/active
   */
  async getActiveOrders(
    filters?: OrderFilters
  ): Promise<ApiResponse<PageResponse<OrderSummaryResponse>>> {
    const params = this.buildQueryParams(filters);
    return apiClient.get<ApiResponse<PageResponse<OrderSummaryResponse>>>(
      ORDER_ENDPOINTS.ACTIVE,
      params
    );
  }

  /**
   * Get completed orders
   * GET /api/v1/orders/completed
   */
  async getCompletedOrders(
    filters?: OrderFilters
  ): Promise<ApiResponse<PageResponse<OrderSummaryResponse>>> {
    const params = this.buildQueryParams(filters);
    return apiClient.get<ApiResponse<PageResponse<OrderSummaryResponse>>>(
      ORDER_ENDPOINTS.COMPLETED,
      params
    );
  }

  /**
   * Get cancelled orders
   * GET /api/v1/orders/cancelled
   */
  async getCancelledOrders(
    filters?: OrderFilters
  ): Promise<ApiResponse<PageResponse<OrderSummaryResponse>>> {
    const params = this.buildQueryParams(filters);
    return apiClient.get<ApiResponse<PageResponse<OrderSummaryResponse>>>(
      ORDER_ENDPOINTS.CANCELLED,
      params
    );
  }

  // ==================== SELLER ORDERS ====================

  /**
   * Get orders where current user is seller
   * GET /api/v1/orders/seller
   */
  async getSellerOrders(
    filters?: OrderFilters
  ): Promise<ApiResponse<PageResponse<OrderSummaryResponse>>> {
    const params = this.buildQueryParams(filters);
    return apiClient.get<ApiResponse<PageResponse<OrderSummaryResponse>>>(
      ORDER_ENDPOINTS.SELLER_ORDERS,
      params
    );
  }

  /**
   * Get active seller orders
   * GET /api/v1/orders/seller/active
   */
  async getActiveSellerOrders(
    filters?: OrderFilters
  ): Promise<ApiResponse<PageResponse<OrderSummaryResponse>>> {
    const params = this.buildQueryParams(filters);
    return apiClient.get<ApiResponse<PageResponse<OrderSummaryResponse>>>(
      ORDER_ENDPOINTS.SELLER_ACTIVE,
      params
    );
  }

  /**
   * Get pending seller orders
   * GET /api/v1/orders/seller/pending
   */
  async getPendingSellerOrders(
    filters?: OrderFilters
  ): Promise<ApiResponse<PageResponse<OrderSummaryResponse>>> {
    const params = this.buildQueryParams(filters);
    return apiClient.get<ApiResponse<PageResponse<OrderSummaryResponse>>>(
      ORDER_ENDPOINTS.SELLER_PENDING,
      params
    );
  }

  // ==================== ORDER ACTIONS ====================

  /**
   * Accept an order (seller action)
   * POST /api/v1/orders/:orderId/accept
   */
  async acceptOrder(orderId: string): Promise<ApiResponse<OrderResponse>> {
    return apiClient.post<ApiResponse<OrderResponse>>(
      ORDER_ENDPOINTS.ACCEPT_DELIVERY(orderId),
      {}
    );
  }

  /**
   * Start working on order (seller action)
   * POST /api/v1/orders/:orderId/start
   */
  async startOrder(orderId: string): Promise<ApiResponse<OrderResponse>> {
    return apiClient.post<ApiResponse<OrderResponse>>(
      ORDER_ENDPOINTS.START(orderId),
      {}
    );
  }

  /**
   * Confirm manual payment reception (seller action)
   * POST /api/v1/orders/:orderId/confirm-manual-payment
   */
  async confirmManualPayment(
    orderId: string,
    request: ConfirmManualPaymentRequest
  ): Promise<ApiResponse<OrderResponse>> {
    return apiClient.put<ApiResponse<OrderResponse>>(
      ORDER_ENDPOINTS.CONFIRM_MANUAL_PAYMENT(orderId),
      request
    );
  }

  /**
   * Submit delivery (seller action)
   * POST /api/v1/orders/:orderId/deliver
   */
  async submitDelivery(
    orderId: string,
    request: SubmitDeliveryRequest
  ): Promise<ApiResponse<OrderResponse>> {
    return apiClient.post<ApiResponse<OrderResponse>>(
      ORDER_ENDPOINTS.DELIVER(orderId),
      request
    );
  }

  /**
   * Approve delivery (buyer action)
   * POST /api/v1/orders/:orderId/approve
   */
  async approveDelivery(orderId: string): Promise<ApiResponse<OrderResponse>> {
    return apiClient.post<ApiResponse<OrderResponse>>(
      ORDER_ENDPOINTS.ACCEPT_DELIVERY(orderId),
      {}
    );
  }

  /**
   * Request revision (buyer action)
   * POST /api/v1/orders/:orderId/revisions
   */
  async requestRevision(
    orderId: string,
    request: RequestRevisionRequest
  ): Promise<ApiResponse<OrderRevisionResponse>> {
    return apiClient.post<ApiResponse<OrderRevisionResponse>>(
      ORDER_ENDPOINTS.REQUEST_REVISION(orderId),
      request
    );
  }

  /**
   * Get all revisions for an order
   * GET /api/v1/orders/:orderId/revisions
   */
  async getOrderRevisions(
    orderId: string
  ): Promise<ApiResponse<OrderRevisionResponse[]>> {
    return apiClient.get<ApiResponse<OrderRevisionResponse[]>>(
      ORDER_ENDPOINTS.GET_REVISIONS(orderId)
    );
  }

  /**
   * Accept revision (seller action)
   * PUT /api/v1/orders/:orderId/revisions/:revisionId/accept
   */
  async acceptRevision(
    orderId: string,
    revisionId: string,
    request?: AcceptRevisionRequest
  ): Promise<ApiResponse<OrderRevisionResponse>> {
    return apiClient.put<ApiResponse<OrderRevisionResponse>>(
      ORDER_ENDPOINTS.ACCEPT_REVISION(orderId, revisionId),
      request || {}
    );
  }

  /**
   * Complete revision (seller action)
   * PUT /api/v1/orders/:orderId/revisions/:revisionId/complete
   */
  async completeRevision(
    orderId: string,
    revisionId: string,
    request?: CompleteRevisionRequest
  ): Promise<ApiResponse<OrderRevisionResponse>> {
    return apiClient.put<ApiResponse<OrderRevisionResponse>>(
      ORDER_ENDPOINTS.COMPLETE_REVISION(orderId, revisionId),
      request || {}
    );
  }

  /**
   * Reject revision (seller action)
   * PUT /api/v1/orders/:orderId/revisions/:revisionId/reject
   */
  async rejectRevision(
    orderId: string,
    revisionId: string,
    request: RejectRevisionRequest
  ): Promise<ApiResponse<OrderRevisionResponse>> {
    return apiClient.put<ApiResponse<OrderRevisionResponse>>(
      ORDER_ENDPOINTS.REJECT_REVISION(orderId, revisionId),
      request
    );
  }

  /**
   * Get pending revisions for seller
   * GET /api/v1/orders/pending/revisions
   */
  async getPendingRevisions(): Promise<ApiResponse<OrderRevisionResponse[]>> {
    return apiClient.get<ApiResponse<OrderRevisionResponse[]>>(
      ORDER_ENDPOINTS.PENDING_REVISIONS
    );
  }

  /**
   * Complete order manually (admin action)
   * POST /api/v1/orders/:orderId/complete
   */
  async completeOrder(orderId: string): Promise<ApiResponse<OrderResponse>> {
    return apiClient.post<ApiResponse<OrderResponse>>(
      ORDER_ENDPOINTS.COMPLETE(orderId),
      {}
    );
  }

  /**
   * Cancel order
   * POST /api/v1/orders/:orderId/cancel
   */
  async cancelOrder(
    orderId: string,
    request: CancelOrderRequest
  ): Promise<ApiResponse<OrderResponse>> {
    return apiClient.post<ApiResponse<OrderResponse>>(
      ORDER_ENDPOINTS.CANCEL(orderId),
      request
    );
  }

  // ==================== ORDER TIMELINE ====================

  /**
   * Get order timeline events
   * GET /api/v1/orders/:orderId/timeline
   */
  async getOrderTimeline(orderId: string): Promise<ApiResponse<OrderEvent[]>> {
    return apiClient.get<ApiResponse<OrderEvent[]>>(
      ORDER_ENDPOINTS.GET_TIMELINE(orderId)
    );
  }

  // ==================== STATISTICS ====================

  /**
   * Get order statistics for current user
   * GET /api/v1/orders/statistics
   */
  async getOrderStatistics(): Promise<ApiResponse<OrderStatistics>> {
    return apiClient.get<ApiResponse<OrderStatistics>>('/orders/statistics');
  }

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Get all orders (admin only)
   * GET /api/v1/admin/orders
   */
  async getAllOrders(
    filters?: OrderFilters
  ): Promise<ApiResponse<PageResponse<OrderSummaryResponse>>> {
    const params = this.buildQueryParams(filters);
    return apiClient.get<ApiResponse<PageResponse<OrderSummaryResponse>>>(
      ORDER_ENDPOINTS.ADMIN_ALL,
      params
    );
  }

  /**
   * Get disputed orders (admin only)
   * GET /api/v1/disputes (uses dispute API instead of order API)
   * @deprecated Use getAllDisputes from dispute API instead
   */
  async getDisputedOrders(
    filters?: OrderFilters
  ): Promise<ApiResponse<PageResponse<OrderSummaryResponse>>> {
    const params = this.buildQueryParams(filters);
    // Redirect to disputes API endpoint
    return apiClient.get<ApiResponse<PageResponse<OrderSummaryResponse>>>(
      '/api/v1/disputes',
      params
    );
  }

  /**
   * Resolve dispute (admin only)
   * POST /api/v1/admin/orders/:orderId/resolve
   */
  async resolveDispute(
    orderId: string,
    resolution: {
      decision: string;
      note: string;
      refundAmount?: number;
    }
  ): Promise<ApiResponse<OrderResponse>> {
    return apiClient.post<ApiResponse<OrderResponse>>(
      ORDER_ENDPOINTS.ADMIN_RESOLVE(orderId),
      resolution
    );
  }

  // ==================== MANUAL PAYMENT PROOF METHODS ====================

  /**
   * Upload payment proof (buyer)
   * POST /api/v1/orders/:orderId/payment-proof
   */
  async uploadPaymentProof(
    orderId: string,
    request: {
      paymentReference: string;
      notes?: string;
      proofFile: File;
      payerIban?: string;
      receiverIban?: string;
      declaredAmount?: number;
    }
  ): Promise<
    ApiResponse<import('@/types/backend-aligned').ManualPaymentProofResponse>
  > {
    const formData = new FormData();
    formData.append('paymentReference', request.paymentReference);
    if (request.notes) formData.append('notes', request.notes);
    formData.append('proofFile', request.proofFile);
    if (request.payerIban) formData.append('payerIban', request.payerIban);
    if (request.receiverIban)
      formData.append('receiverIban', request.receiverIban);
    if (request.declaredAmount)
      formData.append('declaredAmount', String(request.declaredAmount));

    return apiClient.post(
      ORDER_ENDPOINTS.UPLOAD_PAYMENT_PROOF(orderId),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  }

  /**
   * Get payment proof for order
   * GET /api/v1/orders/:orderId/payment-proof
   */
  async getPaymentProof(
    orderId: string
  ): Promise<
    ApiResponse<import('@/types/backend-aligned').ManualPaymentProofResponse>
  > {
    return apiClient.get(ORDER_ENDPOINTS.GET_PAYMENT_PROOF(orderId));
  }

  /**
   * Confirm payment proof (seller)
   * PUT /api/v1/orders/:orderId/payment-proof/confirm
   */
  async confirmPaymentProof(
    orderId: string,
    request: {
      confirmed: boolean;
      reason?: string;
    }
  ): Promise<
    ApiResponse<import('@/types/backend-aligned').ManualPaymentProofResponse>
  > {
    return apiClient.put(
      ORDER_ENDPOINTS.CONFIRM_PAYMENT_PROOF(orderId),
      request
    );
  }

  /**
   * Dispute payment proof
   * POST /api/v1/orders/:orderId/payment-proof/dispute
   */
  async disputePaymentProof(
    orderId: string,
    request: {
      disputeReason: string;
      supportingDocuments?: File[];
      requestedResolution?: string;
    }
  ): Promise<
    ApiResponse<import('@/types/backend-aligned').ManualPaymentProofResponse>
  > {
    const formData = new FormData();
    formData.append('disputeReason', request.disputeReason);
    if (request.requestedResolution) {
      formData.append('requestedResolution', request.requestedResolution);
    }
    if (request.supportingDocuments) {
      request.supportingDocuments.forEach((file, index) => {
        formData.append(`supportingDocuments[${index}]`, file);
      });
    }

    return apiClient.post(
      ORDER_ENDPOINTS.DISPUTE_PAYMENT_PROOF(orderId),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  }

  /**
   * Get pending payment confirmations (seller)
   * GET /api/v1/orders/payment-proofs/pending
   */
  async getPendingPaymentProofs(): Promise<
    ApiResponse<import('@/types/backend-aligned').ManualPaymentProofResponse[]>
  > {
    return apiClient.get(ORDER_ENDPOINTS.GET_PENDING_PAYMENT_PROOFS);
  }

  /**
   * Verify payment proof manually (admin)
   * PUT /api/v1/orders/payment-proofs/:proofId/verify
   */
  async verifyPaymentProofAdmin(
    proofId: string,
    approved: boolean,
    notes?: string
  ): Promise<
    ApiResponse<import('@/types/backend-aligned').ManualPaymentProofResponse>
  > {
    const url = `${ORDER_ENDPOINTS.VERIFY_PAYMENT_PROOF_ADMIN(proofId)}?approved=${approved}${notes ? `&notes=${encodeURIComponent(notes)}` : ''}`;
    return apiClient.put(url, null);
  }

  // ==================== HELPER METHODS ====================

  /**
   * Build query parameters from filters
   */
  private buildQueryParams(
    filters?: OrderFilters
  ): Record<string, string> | undefined {
    if (!filters) return undefined;

    const params: Record<string, string> = {};

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        params.status = filters.status.join(',');
      } else {
        params.status = filters.status;
      }
    }

    if (filters.page !== undefined) {
      params.page = String(filters.page);
    }

    if (filters.size !== undefined) {
      params.size = String(filters.size);
    }

    if (filters.sort) {
      params.sort = filters.sort;
    }

    if (filters.search) {
      params.search = filters.search;
    }

    return Object.keys(params).length > 0 ? params : undefined;
  }

  /**
   * Invalidate order cache
   */
  invalidateOrderCache(orderId?: string) {
    if (orderId) {
      apiClient.invalidateCache(ORDER_ENDPOINTS.GET_BY_ID(orderId));
    }
    apiClient.invalidateCachePattern(/\/orders/);
  }

  /**
   * Clear all order-related cache
   */
  clearOrderCache() {
    apiClient.invalidateCachePattern(/\/orders/);
  }
}

// ================================================
// SINGLETON INSTANCE
// ================================================

export const orderService = new OrderService();

// ================================================
// EXPORTS
// ================================================

export default orderService;
