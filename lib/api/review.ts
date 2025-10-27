/**
 * ================================================
 * REVIEW API CLIENT
 * ================================================
 * API client for Review System endpoints
 * Handles all review-related HTTP requests
 *
 * @author MarifetBul Development Team
 * @version 3.0.0 - Sprint Refactoring: Backend API Path Consolidation
 * @since Review System Sprint
 *
 * Backend Changes:
 * - /api/v1/user/reviews → /api/v1/reviews/manage (authenticated CRUD)
 * - /api/v1/public/packages/{id}/reviews → /api/v1/reviews/public/package/{id}
 * - /api/v1/public/sellers/{id}/reviews → /api/v1/reviews/public/seller/{id}
 * - /api/v1/user/reviews/{id}/response → /api/v1/reviews/response/{id}
 * - /api/v1/user/reviews/{id}/images → /api/v1/reviews/images/{id}
 * - /api/v1/admin/reviews (enhanced, path unchanged)
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { validateResponse, ReviewSchema } from './validators';
import type { Review as ValidatedReview } from './validators';
import type {
  Review,
  ReviewsResponse,
  CreateReviewRequest,
  UpdateReviewRequest,
  SellerResponseRequest,
  FlagReviewRequest,
  ModerateReviewRequest,
  ReviewQueryParams,
  PackageReviewsQueryParams,
  SellerReviewsQueryParams,
  AdminModerationQueryParams,
  ReviewImage,
  VoteType,
  PlatformReviewStats,
} from '@/types/business/review';

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

// ========================================
// Review CRUD Operations
// Backend: /api/v1/reviews/manage
// Authorization: isAuthenticated()
// ========================================

/**
 * Create a new review
 * @throws {ValidationError} Invalid review data or response
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not eligible to review
 */
export async function createReview(
  data: CreateReviewRequest
): Promise<ValidatedReview> {
  const response = await apiClient.post<ApiResponse<Review>>(
    '/api/v1/reviews/manage',
    data
  );
  return validateResponse(ReviewSchema, response.data, 'Review');
}

/**
 * Get review by ID (authenticated user)
 * @throws {NotFoundError} Review not found
 */
export async function getReviewById(
  reviewId: string
): Promise<ValidatedReview> {
  const response = await apiClient.get<ApiResponse<Review>>(
    `/api/v1/reviews/manage/${reviewId}`
  );
  return validateResponse(ReviewSchema, response.data, 'Review');
}

/**
 * Update review
 * @throws {ValidationError} Invalid review data
 * @throws {NotFoundError} Review not found
 * @throws {AuthorizationError} Not review owner
 */
export async function updateReview(
  reviewId: string,
  data: UpdateReviewRequest
): Promise<ValidatedReview> {
  const response = await apiClient.put<ApiResponse<Review>>(
    `/api/v1/reviews/manage/${reviewId}`,
    data
  );
  return validateResponse(ReviewSchema, response.data, 'Review');
}

/**
 * Delete review
 */
export async function deleteReview(reviewId: string): Promise<void> {
  await apiClient.delete(`/api/v1/reviews/manage/${reviewId}`);
}

// ========================================
// Review Queries
// ========================================

/**
 * Get reviews for a package (public)
 * Backend: /api/v1/reviews/public/package/{id}
 * Authorization: None
 */
export async function getPackageReviews(
  params: PackageReviewsQueryParams
): Promise<ReviewsResponse> {
  const { packageId, ...queryParams } = params;
  const response = await apiClient.get<ApiResponse<ReviewsResponse>>(
    `/api/v1/reviews/public/package/${packageId}`,
    queryParams as Record<string, string>
  );
  return response.data;
}

/**
 * Get reviews written by current user (as reviewer)
 * Backend: /api/v1/reviews/manage/my-reviews
 * Authorization: isAuthenticated()
 */
export async function getUserReviews(
  params?: ReviewQueryParams
): Promise<ReviewsResponse> {
  const response = await apiClient.get<ApiResponse<ReviewsResponse>>(
    `/api/v1/reviews/manage/my-reviews`,
    params as Record<string, string>
  );
  return response.data;
}

/**
 * Get reviews received by a seller (as reviewee) - public view
 * Backend: /api/v1/reviews/public/seller/{id}
 * Authorization: None
 */
export async function getSellerReviews(
  params: SellerReviewsQueryParams
): Promise<ReviewsResponse> {
  const { sellerId, ...queryParams } = params;
  const response = await apiClient.get<ApiResponse<ReviewsResponse>>(
    `/api/v1/reviews/public/seller/${sellerId}`,
    queryParams as Record<string, string>
  );
  return response.data;
}

/**
 * Check if user can review an order
 * Backend: /api/v1/reviews/manage/can-review/{orderId}
 * Authorization: isAuthenticated()
 */
export async function canReviewOrder(orderId: string): Promise<boolean> {
  const response = await apiClient.get<ApiResponse<{ canReview: boolean }>>(
    `/api/v1/reviews/manage/can-review/${orderId}`
  );
  return response.data.canReview;
}

// ========================================
// Seller Response
// Backend: /api/v1/reviews/response
// Authorization: hasRole('FREELANCER')
// ========================================

/**
 * Add seller response to a review
 * Backend: POST /api/v1/reviews/response/{id}/respond
 */
export async function addSellerResponse(
  reviewId: string,
  data: SellerResponseRequest
): Promise<Review> {
  const response = await apiClient.post<ApiResponse<Review>>(
    `/api/v1/reviews/response/${reviewId}/respond`,
    data
  );
  return response.data;
}

/**
 * Update seller response
 * Backend: PUT /api/v1/reviews/response/{id}
 */
export async function updateSellerResponse(
  reviewId: string,
  data: SellerResponseRequest
): Promise<Review> {
  const response = await apiClient.put<ApiResponse<Review>>(
    `/api/v1/reviews/response/${reviewId}`,
    data
  );
  return response.data;
}

/**
 * Delete seller response
 * Backend: DELETE /api/v1/reviews/response/{id}
 */
export async function deleteSellerResponse(reviewId: string): Promise<Review> {
  const response = await apiClient.delete<ApiResponse<Review>>(
    `/api/v1/reviews/response/${reviewId}`
  );
  return response.data;
}

// ========================================
// Voting
// Backend: /api/v1/reviews/manage/{id}/helpful or not-helpful
// Authorization: isAuthenticated()
// ========================================

/**
 * Vote on review as helpful
 * Backend: POST /api/v1/reviews/manage/{id}/helpful
 */
export async function voteHelpful(reviewId: string): Promise<Review> {
  const response = await apiClient.post<ApiResponse<Review>>(
    `/api/v1/reviews/manage/${reviewId}/helpful`
  );
  return response.data;
}

/**
 * Vote on review as not helpful
 * Backend: POST /api/v1/reviews/manage/{id}/not-helpful
 */
export async function voteNotHelpful(reviewId: string): Promise<Review> {
  const response = await apiClient.post<ApiResponse<Review>>(
    `/api/v1/reviews/manage/${reviewId}/not-helpful`
  );
  return response.data;
}

/**
 * Legacy voting function - maps to new helpful/not-helpful endpoints
 * @deprecated Use voteHelpful() or voteNotHelpful() instead
 */
export async function voteReview(
  reviewId: string,
  voteType: VoteType
): Promise<Review> {
  if (voteType === 'HELPFUL') {
    return voteHelpful(reviewId);
  } else {
    return voteNotHelpful(reviewId);
  }
}

/**
 * Remove vote from review
 * Note: Backend might not have explicit unvote endpoint - voting again toggles
 * @deprecated Backend may handle this differently in new architecture
 */
export async function removeVote(reviewId: string): Promise<Review> {
  // This endpoint may need backend support or toggle behavior
  // Keeping for backward compatibility
  throw new Error(
    'removeVote: Backend endpoint not yet implemented in new architecture'
  );
}

// ========================================
// Flagging
// Backend: /api/v1/reviews/manage/{id}/flag
// Authorization: isAuthenticated()
// ========================================

/**
 * Flag a review for moderation
 * Backend: POST /api/v1/reviews/manage/{id}/flag
 */
export async function flagReview(
  reviewId: string,
  data: FlagReviewRequest
): Promise<void> {
  await apiClient.post(`/api/v1/reviews/manage/${reviewId}/flag`, data);
}

// ========================================
// Image Upload
// Backend: /api/v1/reviews/images/{reviewId}
// Authorization: isAuthenticated() - owner verification via service
// ========================================

/**
 * Upload image to review
 * Backend: POST /api/v1/reviews/images/{reviewId}
 * Business Rules: Max 5 images, 5MB each, JPEG/PNG/WebP
 */
export async function uploadReviewImage(
  reviewId: string,
  file: File
): Promise<ReviewImage> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<ReviewImage>>(
    `/api/v1/reviews/images/${reviewId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

/**
 * Get images for a review
 * Backend: GET /api/v1/reviews/images/{reviewId}
 */
export async function getReviewImages(
  reviewId: string
): Promise<ReviewImage[]> {
  const response = await apiClient.get<ApiResponse<ReviewImage[]>>(
    `/api/v1/reviews/images/${reviewId}`
  );
  return response.data;
}

/**
 * Delete review image
 * Backend: DELETE /api/v1/reviews/images/{reviewId}/{imageId}
 */
export async function deleteReviewImage(
  reviewId: string,
  imageId: string
): Promise<void> {
  await apiClient.delete(`/api/v1/reviews/images/${reviewId}/${imageId}`);
}

/**
 * Delete all images for a review
 * Backend: DELETE /api/v1/reviews/images/{reviewId}
 */
export async function deleteAllReviewImages(reviewId: string): Promise<void> {
  await apiClient.delete(`/api/v1/reviews/images/${reviewId}`);
}

// ========================================
// Admin Moderation
// Backend: /api/v1/admin/reviews
// Authorization: hasRole('ADMIN')
// ========================================

/**
 * Get reviews for moderation (admin)
 * Backend: GET /api/v1/admin/reviews/moderation
 */
export async function getReviewsForModeration(
  params?: AdminModerationQueryParams
): Promise<ReviewsResponse> {
  const response = await apiClient.get<ApiResponse<ReviewsResponse>>(
    '/api/v1/admin/reviews/moderation',
    params as Record<string, string>
  );
  return response.data;
}

/**
 * Approve review (admin)
 * Backend: POST /api/v1/admin/reviews/{id}/approve
 */
export async function approveReview(reviewId: string): Promise<Review> {
  const response = await apiClient.post<ApiResponse<Review>>(
    `/api/v1/admin/reviews/${reviewId}/approve`
  );
  return response.data;
}

/**
 * Reject review (admin)
 * Backend: POST /api/v1/admin/reviews/{id}/reject
 */
export async function rejectReview(
  reviewId: string,
  reason: string
): Promise<Review> {
  const response = await apiClient.post<ApiResponse<Review>>(
    `/api/v1/admin/reviews/${reviewId}/reject`,
    { reason }
  );
  return response.data;
}

/**
 * Moderate review (admin) - legacy function
 * @deprecated Use approveReview() or rejectReview() instead
 */
export async function moderateReview(
  reviewId: string,
  data: ModerateReviewRequest
): Promise<Review> {
  if (data.action === 'APPROVE') {
    return approveReview(reviewId);
  } else if (data.action === 'REJECT') {
    return rejectReview(reviewId, data.reason || 'Rejected by admin');
  }
  throw new Error(`Unknown moderation action: ${data.action}`);
}

/**
 * Get flagged reviews (admin)
 * Backend: GET /api/v1/admin/reviews/flagged
 */
export async function getFlaggedReviews(
  params?: ReviewQueryParams
): Promise<ReviewsResponse> {
  const response = await apiClient.get<ApiResponse<ReviewsResponse>>(
    '/api/v1/admin/reviews/flagged',
    params as Record<string, string>
  );
  return response.data;
}

/**
 * Resolve flagged review (admin)
 * Backend: POST /api/v1/admin/reviews/{id}/resolve
 */
export async function resolveFlaggedReview(
  reviewId: string,
  resolution: string
): Promise<Review> {
  const response = await apiClient.post<ApiResponse<Review>>(
    `/api/v1/admin/reviews/${reviewId}/resolve`,
    { resolution }
  );
  return response.data;
}

/**
 * Delete review (admin)
 * Backend: DELETE /api/v1/admin/reviews/{id}
 */
export async function adminDeleteReview(reviewId: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/reviews/${reviewId}`);
}

// ========================================
// Statistics
// ========================================

/**
 * Get platform-wide review statistics (admin only)
 * Backend: GET /api/v1/admin/reviews/stats
 */
export async function getPlatformStats(): Promise<PlatformReviewStats> {
  const response = await apiClient.get<ApiResponse<PlatformReviewStats>>(
    '/api/v1/admin/reviews/stats'
  );
  return response.data;
}

// ========================================
// Export API object
// ========================================

export const reviewApi = {
  // CRUD (/api/v1/reviews/manage)
  create: createReview,
  getById: getReviewById,
  update: updateReview,
  delete: deleteReview,

  // Queries
  getPackageReviews, // /api/v1/reviews/public/package/{id}
  getUserReviews, // /api/v1/reviews/manage/my-reviews
  getSellerReviews, // /api/v1/reviews/public/seller/{id}
  canReviewOrder, // /api/v1/reviews/manage/can-review/{orderId}

  // Seller Response (/api/v1/reviews/response)
  addResponse: addSellerResponse,
  updateResponse: updateSellerResponse,
  deleteResponse: deleteSellerResponse,

  // Voting (/api/v1/reviews/manage/{id}/helpful|not-helpful)
  vote: voteReview, // Legacy - use voteHelpful/voteNotHelpful
  voteHelpful,
  voteNotHelpful,
  removeVote, // May not be supported in new architecture

  // Flagging (/api/v1/reviews/manage/{id}/flag)
  flag: flagReview,

  // Images (/api/v1/reviews/images/{reviewId})
  uploadImage: uploadReviewImage,
  getImages: getReviewImages,
  deleteImage: deleteReviewImage,
  deleteAllImages: deleteAllReviewImages,

  // Admin (/api/v1/admin/reviews)
  getForModeration: getReviewsForModeration,
  moderate: moderateReview, // Legacy - use approve/reject
  approve: approveReview,
  reject: rejectReview,
  getFlagged: getFlaggedReviews,
  resolveFlag: resolveFlaggedReview,
  adminDelete: adminDeleteReview,
  getPlatformStats,
};

export default reviewApi;
