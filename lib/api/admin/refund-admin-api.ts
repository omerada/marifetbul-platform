/**
 * ================================================
 * ADMIN REFUND API CLIENT
 * ================================================
 * API client for admin refund management
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 31, 2025
 */

import { apiClient } from '@/lib/infrastructure/api/client';

// ================================================
// TYPES
// ================================================

export interface RefundDto {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason: string;
  reasonCategory: RefundReasonCategory;
  description?: string;
  status: RefundStatus;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  processedAt?: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
  adminNotes?: string;
  gatewayRefundId?: string;
  refundMethod?: RefundMethod;
  createdAt: string;
  updatedAt: string;
  // Related entities
  order?: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    buyer?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    seller?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum RefundReasonCategory {
  BUYER_REQUEST = 'BUYER_REQUEST',
  SELLER_CANCELLATION = 'SELLER_CANCELLATION',
  ORDER_NOT_DELIVERED = 'ORDER_NOT_DELIVERED',
  PRODUCT_NOT_AS_DESCRIBED = 'PRODUCT_NOT_AS_DESCRIBED',
  QUALITY_ISSUE = 'QUALITY_ISSUE',
  DUPLICATE_PAYMENT = 'DUPLICATE_PAYMENT',
  FRAUD_SUSPECTED = 'FRAUD_SUSPECTED',
  DISPUTE_RESOLUTION = 'DISPUTE_RESOLUTION',
  OTHER = 'OTHER',
}

export enum RefundMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  WALLET = 'WALLET',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export interface RefundStatisticsDto {
  totalRefunds: number;
  totalAmount: number;
  pendingCount: number;
  pendingAmount: number;
  approvedCount: number;
  approvedAmount: number;
  rejectedCount: number;
  completedCount: number;
  completedAmount: number;
  failedCount: number;
  averageProcessingTimeHours: number;
  approvalRate: number;
  successRate: number;
}

export interface RefundFilters {
  status?: RefundStatus;
  reasonCategory?: RefundReasonCategory;
  userId?: string;
  orderId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ApproveRefundRequest {
  adminNotes?: string;
}

export interface RejectRefundRequest {
  rejectionReason: string;
  adminNotes?: string;
}

export interface BulkApproveRefundsRequest {
  refundIds: string[];
  adminNotes?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

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
 */
export async function bulkApproveRefunds(
  request: BulkApproveRefundsRequest
): Promise<number> {
  return apiClient.post<number>('/api/v1/refunds/bulk-approve', request);
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
