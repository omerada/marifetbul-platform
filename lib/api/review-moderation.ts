/**
 * ================================================
 * REVIEW MODERATION API CLIENT
 * ================================================
 * API client for moderator review management
 * Provides access to review moderation endpoints
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Moderator Dashboard
 */

import { apiClient } from '@/lib/infrastructure/api/client';

// ============================================================================
// TYPES
// ============================================================================

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ReviewModerationDTO {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  revieweeId: string;
  revieweeName: string;
  orderId: string;
  packageId?: string;
  packageTitle?: string;
  overallRating: number;
  communicationRating?: number;
  qualityRating?: number;
  deliveryRating?: number;
  reviewText: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  flaggedCount: number;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
}

export interface BulkReviewModerationRequest {
  reviewIds: string[];
  reason?: string;
}

export interface BulkReviewModerationResponse {
  successCount: number;
  failureCount: number;
  totalCount: number;
  successfulReviewIds: string[];
  failedReviews: Array<{
    reviewId: string;
    errorMessage: string;
  }>;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL_SUCCESS';
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * Get pending reviews awaiting moderation
 * Backend: GET /api/v1/reviews/moderation/pending
 */
export async function getPendingReviews(
  page = 0,
  size = 20
): Promise<PageResponse<ReviewModerationDTO>> {
  return apiClient.get<PageResponse<ReviewModerationDTO>>(
    '/reviews/moderation/pending',
    {
      page: page.toString(),
      size: size.toString(),
    }
  );
}

/**
 * Get flagged reviews reported by users
 * Backend: GET /api/v1/reviews/moderation/flagged
 */
export async function getFlaggedReviews(
  page = 0,
  size = 20
): Promise<PageResponse<ReviewModerationDTO>> {
  return apiClient.get<PageResponse<ReviewModerationDTO>>(
    '/reviews/moderation/flagged',
    {
      page: page.toString(),
      size: size.toString(),
    }
  );
}

/**
 * Approve a review
 * Backend: POST /api/v1/reviews/moderation/{reviewId}/approve
 */
export async function approveReview(
  reviewId: string
): Promise<ReviewModerationDTO> {
  return apiClient.post<ReviewModerationDTO>(
    `/reviews/moderation/${reviewId}/approve`,
    {}
  );
}

/**
 * Reject a review with optional reason
 * Backend: POST /api/v1/reviews/moderation/{reviewId}/reject
 */
export async function rejectReview(
  reviewId: string,
  reason?: string
): Promise<ReviewModerationDTO> {
  const url = reason
    ? `/reviews/moderation/${reviewId}/reject?reason=${encodeURIComponent(reason)}`
    : `/reviews/moderation/${reviewId}/reject`;

  return apiClient.post<ReviewModerationDTO>(url, {});
}

/**
 * Bulk approve multiple reviews
 * Backend: POST /api/v1/reviews/moderation/bulk/approve
 */
export async function bulkApproveReviews(
  reviewIds: string[]
): Promise<BulkReviewModerationResponse> {
  return apiClient.post<BulkReviewModerationResponse>(
    '/reviews/moderation/bulk/approve',
    { reviewIds }
  );
}

/**
 * Bulk reject multiple reviews
 * Backend: POST /api/v1/reviews/moderation/bulk/reject
 */
export async function bulkRejectReviews(
  reviewIds: string[],
  reason?: string
): Promise<BulkReviewModerationResponse> {
  return apiClient.post<BulkReviewModerationResponse>(
    '/reviews/moderation/bulk/reject',
    { reviewIds, reason }
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format bulk moderation result message
 */
export function formatBulkResult(result: BulkReviewModerationResponse): string {
  if (result.status === 'SUCCESS') {
    return `✅ ${result.successCount} review başarıyla işlendi`;
  }
  if (result.status === 'FAILED') {
    return `❌ Tüm işlemler başarısız (${result.failureCount} hata)`;
  }
  return `⚠️ ${result.successCount} başarılı, ${result.failureCount} başarısız`;
}

/**
 * Check if bulk operation was successful
 */
export function isBulkOperationSuccessful(
  result: BulkReviewModerationResponse
): boolean {
  return result.status === 'SUCCESS';
}

/**
 * Check if bulk operation was partially successful
 */
export function isBulkOperationPartial(
  result: BulkReviewModerationResponse
): boolean {
  return result.status === 'PARTIAL_SUCCESS';
}

/**
 * Get error summary for failed reviews
 */
export function getFailedReviewsSummary(
  result: BulkReviewModerationResponse
): string {
  if (result.failedReviews.length === 0) return '';

  const errors = result.failedReviews
    .slice(0, 3)
    .map((fr) => `Review ${fr.reviewId.substring(0, 8)}: ${fr.errorMessage}`)
    .join('\n');

  const remaining = result.failedReviews.length - 3;
  return remaining > 0 ? `${errors}\n... ve ${remaining} hata daha` : errors;
}

/**
 * Get review status badge color
 */
export function getReviewStatusColor(
  status: ReviewModerationDTO['status']
): string {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'destructive';
    case 'FLAGGED':
      return 'destructive';
    default:
      return 'default';
  }
}

/**
 * Get review status label
 */
export function getReviewStatusLabel(
  status: ReviewModerationDTO['status']
): string {
  switch (status) {
    case 'PENDING':
      return 'Beklemede';
    case 'APPROVED':
      return 'Onaylandı';
    case 'REJECTED':
      return 'Reddedildi';
    case 'FLAGGED':
      return 'Şikayet Edildi';
    default:
      return status;
  }
}

// ============================================================================
// EXPORT API OBJECT
// ============================================================================

export const reviewModerationApi = {
  // Core operations
  getPendingReviews,
  getFlaggedReviews,
  approveReview,
  rejectReview,
  bulkApproveReviews,
  bulkRejectReviews,

  // Helper functions
  formatBulkResult,
  isBulkOperationSuccessful,
  isBulkOperationPartial,
  getFailedReviewsSummary,
  getReviewStatusColor,
  getReviewStatusLabel,
};

export default reviewModerationApi;
