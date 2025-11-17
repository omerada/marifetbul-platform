/**
 * ================================================
 * ADMIN REFUND API CLIENT
 * ================================================
 * API client for admin refund management
 *
 * @author MarifetBul Development Team
 * @version 1.1.0
 * @updated November 5, 2025 - Refactored to use centralized types
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import {
  type RefundDto,
  type RefundStatisticsDto,
  type RefundFilters,
  type ApproveRefundRequest,
  type RejectRefundRequest,
  type BulkApproveRefundsRequest,
  type BulkApprovalResponse,
  type PageResponse,
  RefundStatus,
  RefundReasonCategory,
  RefundMethod,
} from '@/types/business/features/refund';

// Re-export types for convenience
export type {
  RefundDto,
  RefundStatisticsDto,
  RefundFilters,
  ApproveRefundRequest,
  RejectRefundRequest,
  BulkApproveRefundsRequest,
  BulkApprovalResponse,
  PageResponse,
};
export { RefundStatus, RefundReasonCategory, RefundMethod };

// ================================================
// API FUNCTIONS
// ================================================

/**
 * Get paginated refunds with filters
 */
export async function getRefunds(
  filters: RefundFilters = {}
): Promise<PageResponse<RefundDto>> {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.reasonCategory)
    params.append('reasonCategory', filters.reasonCategory);
  if (filters.userId) params.append('userId', filters.userId);
  if (filters.orderId) params.append('orderId', filters.orderId);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.minAmount !== undefined)
    params.append('minAmount', filters.minAmount.toString());
  if (filters.maxAmount !== undefined)
    params.append('maxAmount', filters.maxAmount.toString());
  if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
  if (filters.page !== undefined)
    params.append('page', filters.page.toString());
  if (filters.size !== undefined)
    params.append('size', filters.size.toString());
  if (filters.sort) params.append('sort', filters.sort);

  // Use pending endpoint for admin refunds listing
  return apiClient.get<PageResponse<RefundDto>>(
    `/api/v1/refunds/pending?${params.toString()}`
  );
}

/**
 * Get refund by ID
 */
export async function getRefundById(refundId: string): Promise<RefundDto> {
  return apiClient.get<RefundDto>(`/api/v1/refunds/${refundId}`);
}

/**
 * Approve refund
 */
export async function approveRefund(
  refundId: string,
  request: ApproveRefundRequest
): Promise<RefundDto> {
  return apiClient.patch<RefundDto>(
    `/api/v1/refunds/${refundId}/approve`,
    request
  );
}

/**
 * Reject refund
 */
export async function rejectRefund(
  refundId: string,
  request: RejectRefundRequest
): Promise<RefundDto> {
  return apiClient.patch<RefundDto>(
    `/api/v1/refunds/${refundId}/reject`,
    request
  );
}

/**
 * Bulk approve refunds
 * Sprint 1 - Story 1.1: Admin Bulk Operations
 */
export async function bulkApproveRefunds(
  request: BulkApproveRefundsRequest
): Promise<BulkApprovalResponse> {
  return apiClient.post<BulkApprovalResponse>(
    '/api/v1/refunds/bulk-approve',
    request
  );
}

/**
 * Process approved refund
 */
export async function processRefund(refundId: string): Promise<RefundDto> {
  return apiClient.post<RefundDto>(`/api/v1/refunds/${refundId}/process`);
}

/**
 * Get refund statistics
 */
export async function getRefundStatistics(
  startDate?: string,
  endDate?: string
): Promise<RefundStatisticsDto> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  return apiClient.get<RefundStatisticsDto>(
    `/api/v1/refunds/statistics?${params.toString()}`
  );
}

/**
 * Export functions
 */
export const refundAdminApi = {
  getRefunds,
  getRefundById,
  approveRefund,
  rejectRefund,
  bulkApproveRefunds,
  processRefund,
  getRefundStatistics,
};
