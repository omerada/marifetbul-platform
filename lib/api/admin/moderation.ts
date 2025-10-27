/**
 * ================================================
 * ADMIN MODERATION API CLIENT
 * ================================================
 * Handles admin review moderation operations
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { z } from 'zod';

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED',
}

export enum ReviewType {
  ORDER = 'ORDER',
  PACKAGE = 'PACKAGE',
  FREELANCER = 'FREELANCER',
  EMPLOYER = 'EMPLOYER',
}

// Review Summary Schema (for list views)
const ReviewSummarySchema = z.object({
  id: z.string().uuid(),
  reviewerId: z.string().uuid(),
  reviewerName: z.string(),
  reviewerAvatar: z.string().optional(),
  targetId: z.string().uuid(),
  targetType: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  status: z.nativeEnum(ReviewStatus),
  type: z.nativeEnum(ReviewType),
  flaggedCount: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ReviewSummary = z.infer<typeof ReviewSummarySchema>;

// Full Review Schema (for detail views)
const ReviewResponseSchema = z.object({
  id: z.string().uuid(),
  reviewerId: z.string().uuid(),
  reviewerName: z.string(),
  reviewerAvatar: z.string().optional(),
  reviewerRole: z.string(),
  targetId: z.string().uuid(),
  targetType: z.string(),
  targetName: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  status: z.nativeEnum(ReviewStatus),
  type: z.nativeEnum(ReviewType),
  flaggedCount: z.number().default(0),
  flagReasons: z.array(z.string()).optional(),
  moderatorNotes: z.string().optional(),
  moderatedBy: z.string().uuid().optional(),
  moderatedAt: z.string().optional(),
  rejectionReason: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  canEdit: z.boolean().default(false),
  canDelete: z.boolean().default(false),
});

export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;

// Platform Stats Schema
const PlatformReviewStatsSchema = z.object({
  totalReviews: z.number(),
  pendingReviews: z.number(),
  approvedReviews: z.number(),
  rejectedReviews: z.number(),
  flaggedReviews: z.number(),
  averageRating: z.number(),
  reviewsToday: z.number(),
  reviewsThisWeek: z.number(),
  reviewsThisMonth: z.number(),
});

export type PlatformReviewStats = z.infer<typeof PlatformReviewStatsSchema>;

// Paginated Response Schema
const PagedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    content: z.array(itemSchema),
    totalElements: z.number(),
    totalPages: z.number(),
    size: z.number(),
    number: z.number(),
    first: z.boolean(),
    last: z.boolean(),
    empty: z.boolean(),
  });

// ============================================================================
// ADMIN REVIEW OPERATIONS
// ============================================================================

/**
 * Get all reviews with optional filters
 * GET /api/v1/admin/reviews
 *
 * @param {Object} params - Query parameters
 * @param {ReviewStatus} params.status - Filter by status
 * @param {ReviewType} params.type - Filter by type
 * @param {number} params.page - Page number (0-indexed)
 * @param {number} params.size - Page size
 * @param {string} params.sortBy - Sort field
 * @param {'ASC'|'DESC'} params.direction - Sort direction
 * @returns {Promise<PagedResponse<ReviewSummary>>}
 */
export async function getAllReviews(
  params: {
    status?: ReviewStatus;
    type?: ReviewType;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: 'ASC' | 'DESC';
  } = {}
) {
  const queryParams = new URLSearchParams();

  if (params.status) queryParams.append('status', params.status);
  if (params.type) queryParams.append('type', params.type);
  queryParams.append('page', (params.page ?? 0).toString());
  queryParams.append('size', (params.size ?? 20).toString());
  queryParams.append('sortBy', params.sortBy ?? 'createdAt');
  queryParams.append('direction', params.direction ?? 'DESC');

  const response = await apiClient.get<unknown>(
    `/admin/reviews?${queryParams.toString()}`
  );

  return PagedResponseSchema(ReviewSummarySchema).parse(response);
}

/**
 * Get pending reviews (awaiting approval)
 * GET /api/v1/admin/reviews/pending
 *
 * @param {number} page - Page number
 * @param {number} size - Page size
 * @returns {Promise<PagedResponse<ReviewSummary>>}
 */
export async function getPendingReviews(page: number = 0, size: number = 20) {
  const response = await apiClient.get<unknown>(
    `/admin/reviews/pending?page=${page}&size=${size}`
  );

  return PagedResponseSchema(ReviewSummarySchema).parse(response);
}

/**
 * Get flagged reviews (need moderation)
 * GET /api/v1/admin/reviews/flagged
 *
 * @param {number} page - Page number
 * @param {number} size - Page size
 * @returns {Promise<PagedResponse<ReviewSummary>>}
 */
export async function getFlaggedReviews(page: number = 0, size: number = 20) {
  const response = await apiClient.get<unknown>(
    `/admin/reviews/flagged?page=${page}&size=${size}`
  );

  return PagedResponseSchema(ReviewSummarySchema).parse(response);
}

/**
 * Get all reviews needing moderation (pending + flagged)
 * GET /api/v1/admin/reviews/moderation
 *
 * @param {number} page - Page number
 * @param {number} size - Page size
 * @returns {Promise<PagedResponse<ReviewSummary>>}
 */
export async function getReviewsNeedingModeration(
  page: number = 0,
  size: number = 20
) {
  const response = await apiClient.get<unknown>(
    `/admin/reviews/moderation?page=${page}&size=${size}`
  );

  return PagedResponseSchema(ReviewSummarySchema).parse(response);
}

/**
 * Get review by ID
 * GET /api/v1/admin/reviews/{reviewId}
 *
 * @param {string} reviewId - Review UUID
 * @returns {Promise<ReviewResponse>}
 */
export async function getReviewById(reviewId: string): Promise<ReviewResponse> {
  const response = await apiClient.get<ReviewResponse>(
    `/admin/reviews/${reviewId}`
  );

  return ReviewResponseSchema.parse(response);
}

/**
 * Get platform-wide review statistics
 * GET /api/v1/admin/reviews/stats
 *
 * @returns {Promise<PlatformReviewStats>}
 */
export async function getPlatformStats(): Promise<PlatformReviewStats> {
  const response =
    await apiClient.get<PlatformReviewStats>(`/admin/reviews/stats`);

  return PlatformReviewStatsSchema.parse(response);
}

/**
 * Approve a review
 * POST /api/v1/admin/reviews/{reviewId}/approve
 *
 * @param {string} reviewId - Review UUID
 * @returns {Promise<ReviewResponse>}
 */
export async function approveReview(reviewId: string): Promise<ReviewResponse> {
  const response = await apiClient.post<ReviewResponse>(
    `/admin/reviews/${reviewId}/approve`,
    {}
  );

  return ReviewResponseSchema.parse(response);
}

/**
 * Reject a review with reason
 * POST /api/v1/admin/reviews/{reviewId}/reject
 *
 * @param {string} reviewId - Review UUID
 * @param {string} reason - Rejection reason
 * @returns {Promise<ReviewResponse>}
 */
export async function rejectReview(
  reviewId: string,
  reason: string
): Promise<ReviewResponse> {
  const queryParams = new URLSearchParams({ reason });
  const response = await apiClient.post<ReviewResponse>(
    `/admin/reviews/${reviewId}/reject?${queryParams.toString()}`,
    {}
  );

  return ReviewResponseSchema.parse(response);
}

/**
 * Resolve a flagged review
 * POST /api/v1/admin/reviews/{reviewId}/resolve
 *
 * @param {string} reviewId - Review UUID
 * @param {string} resolution - Resolution notes
 * @returns {Promise<ReviewResponse>}
 */
export async function resolveFlag(
  reviewId: string,
  resolution: string
): Promise<ReviewResponse> {
  const queryParams = new URLSearchParams({ resolution });
  const response = await apiClient.post<ReviewResponse>(
    `/admin/reviews/${reviewId}/resolve?${queryParams.toString()}`,
    {}
  );

  return ReviewResponseSchema.parse(response);
}

/**
 * Delete a review permanently (admin only)
 * DELETE /api/v1/admin/reviews/{reviewId}
 *
 * @param {string} reviewId - Review UUID
 * @returns {Promise<void>}
 */
export async function deleteReview(reviewId: string): Promise<void> {
  await apiClient.delete(`/admin/reviews/${reviewId}`);
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Bulk approve reviews
 *
 * @param {string[]} reviewIds - Array of review UUIDs
 * @returns {Promise<{success: number, failed: number}>}
 */
export async function bulkApproveReviews(
  reviewIds: string[]
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  await Promise.allSettled(
    reviewIds.map(async (id) => {
      try {
        await approveReview(id);
        success++;
      } catch (_error) {
        failed++;
      }
    })
  );

  return { success, failed };
}

/**
 * Bulk reject reviews
 *
 * @param {string[]} reviewIds - Array of review UUIDs
 * @param {string} reason - Rejection reason
 * @returns {Promise<{success: number, failed: number}>}
 */
export async function bulkRejectReviews(
  reviewIds: string[],
  reason: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  await Promise.allSettled(
    reviewIds.map(async (id) => {
      try {
        await rejectReview(id, reason);
        success++;
      } catch (_error) {
        failed++;
      }
    })
  );

  return { success, failed };
}

// ============================================================================
// EXPORT API OBJECT
// ============================================================================

export const adminModerationApi = {
  // List operations
  getAllReviews,
  getPendingReviews,
  getFlaggedReviews,
  getReviewsNeedingModeration,
  getReviewById,
  getPlatformStats,

  // Moderation actions
  approveReview,
  rejectReview,
  resolveFlag,
  deleteReview,

  // Bulk operations
  bulkApproveReviews,
  bulkRejectReviews,
};

export default adminModerationApi;
