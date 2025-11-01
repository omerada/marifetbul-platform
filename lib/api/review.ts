/**
 * ================================================
 * REVIEW API CLIENT
 * ================================================
 * API client for Review System endpoints
 * Handles all review-related HTTP requests
 *
 * @author MarifetBul Development Team
 * @version 4.0.0 - Sprint 1 Refactoring: Unified Review Controller
 * @since Review System Sprint
 *
 * Backend Changes (v4.0.0):
 * - ALL endpoints consolidated into ReviewController.java
 * - /api/v1/reviews/manage/* → /api/v1/reviews/*
 * - /api/v1/reviews/public/* (unchanged)
 * - /api/v1/reviews/response/* → /api/v1/reviews/about-me/* and /api/v1/reviews/{id}/respond
 * - /api/v1/reviews/images/{reviewId}/* → /api/v1/reviews/{reviewId}/images/*
 * - /api/v1/admin/reviews/* → /api/v1/reviews/admin/*
 *
 * Migration Summary:
 * - 5 backend controllers merged into 1
 * - Consistent path structure: /api/v1/reviews/*
 * - Role-based access via method-level @PreAuthorize
 * - Backward compatibility maintained (old paths deprecated)
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { validateResponse, ReviewSchema } from './validators';
import type { Review as ValidatedReview } from './validators';
import {
  VoteType,
  type Review,
  type ReviewsResponse,
  type CreateReviewRequest,
  type UpdateReviewRequest,
  type SellerResponseRequest,
  type FlagReviewRequest,
  type ModerateReviewRequest,
  type ReviewQueryParams,
  type PackageReviewsQueryParams,
  type SellerReviewsQueryParams,
  type AdminModerationQueryParams,
  type ReviewImage,
  type PlatformReviewStats,
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
// Backend: /api/v1/reviews (unified controller)
// Authorization: isAuthenticated()
// ========================================

/**
 * Create a new review
 * Backend: POST /api/v1/reviews
 * @throws {ValidationError} Invalid review data or response
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not eligible to review
 */
export async function createReview(
  data: CreateReviewRequest
): Promise<ValidatedReview> {
  const response = await apiClient.post<ApiResponse<Review>>(
    '/api/v1/reviews',
    data
  );
  return validateResponse(ReviewSchema, response.data, 'Review');
}

/**
 * Get review by ID (authenticated user)
 * Backend: GET /api/v1/reviews/{reviewId}
 * @throws {NotFoundError} Review not found
 */
export async function getReviewById(
  reviewId: string
): Promise<ValidatedReview> {
  const response = await apiClient.get<ApiResponse<Review>>(
    `/api/v1/reviews/${reviewId}`
  );
  return validateResponse(ReviewSchema, response.data, 'Review');
}

/**
 * Update review
 * Backend: PUT /api/v1/reviews/{reviewId}
 * @throws {ValidationError} Invalid review data
 * @throws {NotFoundError} Review not found
 * @throws {AuthorizationError} Not review owner
 */
export async function updateReview(
  reviewId: string,
  data: UpdateReviewRequest
): Promise<ValidatedReview> {
  const response = await apiClient.put<ApiResponse<Review>>(
    `/api/v1/reviews/${reviewId}`,
    data
  );
  return validateResponse(ReviewSchema, response.data, 'Review');
}

/**
 * Delete review
 * Backend: DELETE /api/v1/reviews/{reviewId}
 */
export async function deleteReview(reviewId: string): Promise<void> {
  await apiClient.delete(`/api/v1/reviews/${reviewId}`);
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
 * Backend: GET /api/v1/reviews/my
 * Authorization: isAuthenticated()
 */
export async function getUserReviews(
  params?: ReviewQueryParams
): Promise<ReviewsResponse> {
  const response = await apiClient.get<ApiResponse<ReviewsResponse>>(
    `/api/v1/reviews/my`,
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
 * Backend: GET /api/v1/reviews/can-review/{orderId}
 * Authorization: isAuthenticated()
 */
export async function canReviewOrder(orderId: string): Promise<boolean> {
  const response = await apiClient.get<ApiResponse<{ canReview: boolean }>>(
    `/api/v1/reviews/can-review/${orderId}`
  );
  return response.data.canReview;
}

// ========================================
// Seller Response
// Backend: /api/v1/reviews/{reviewId}/respond (unified controller)
// Authorization: hasRole('FREELANCER')
// ========================================

/**
 * Add seller response to a review
 * Backend: POST /api/v1/reviews/{reviewId}/respond
 */
export async function addSellerResponse(
  reviewId: string,
  data: SellerResponseRequest
): Promise<Review> {
  const response = await apiClient.post<ApiResponse<Review>>(
    `/api/v1/reviews/${reviewId}/respond`,
    data
  );
  return response.data;
}

/**
 * Update seller response
 * Backend: PUT /api/v1/reviews/{reviewId}/respond
 */
export async function updateSellerResponse(
  reviewId: string,
  data: SellerResponseRequest
): Promise<Review> {
  const response = await apiClient.put<ApiResponse<Review>>(
    `/api/v1/reviews/${reviewId}/respond`,
    data
  );
  return response.data;
}

/**
 * Delete seller response
 * Backend: DELETE /api/v1/reviews/{reviewId}/respond
 */
export async function deleteSellerResponse(reviewId: string): Promise<Review> {
  const response = await apiClient.delete<ApiResponse<Review>>(
    `/api/v1/reviews/${reviewId}/respond`
  );
  return response.data;
}

// ========================================
// Voting
// Backend: /api/v1/reviews/{reviewId}/helpful or not-helpful
// Authorization: isAuthenticated()
// ========================================

/**
 * Vote on review as helpful
 * Backend: POST /api/v1/reviews/{reviewId}/helpful
 */
export async function voteHelpful(reviewId: string): Promise<Review> {
  const response = await apiClient.post<ApiResponse<Review>>(
    `/api/v1/reviews/${reviewId}/helpful`
  );
  return response.data;
}

/**
 * Vote on review as not helpful
 * Backend: POST /api/v1/reviews/{reviewId}/not-helpful
 */
export async function voteNotHelpful(reviewId: string): Promise<Review> {
  const response = await apiClient.post<ApiResponse<Review>>(
    `/api/v1/reviews/${reviewId}/not-helpful`
  );
  return response.data;
}

/**
 * Vote on review (helpful or not helpful)
 * Convenience method that calls voteHelpful or voteNotHelpful based on voteType
 */
export async function vote(
  reviewId: string,
  voteType: VoteType
): Promise<Review> {
  if (voteType === VoteType.HELPFUL) {
    return voteHelpful(reviewId);
  } else {
    return voteNotHelpful(reviewId);
  }
}

/**
 * Remove vote from review
 * Backend: DELETE /api/v1/reviews/{reviewId}/vote
 */
export async function removeVote(reviewId: string): Promise<Review> {
  const response = await apiClient.delete<ApiResponse<Review>>(
    `/api/v1/reviews/${reviewId}/vote`
  );
  return response.data;
}

// ========================================
// Flagging
// Backend: /api/v1/reviews/{reviewId}/flag
// Authorization: isAuthenticated()
// ========================================

/**
 * Flag a review for moderation
 * Backend: POST /api/v1/reviews/{reviewId}/flag
 */
export async function flagReview(
  reviewId: string,
  data: FlagReviewRequest
): Promise<void> {
  await apiClient.post(`/api/v1/reviews/${reviewId}/flag`, data);
}

// ========================================
// Image Upload
// Backend: /api/v1/reviews/{reviewId}/images
// Authorization: isAuthenticated() - owner verification via service
// ========================================

/**
 * Upload image to review
 * Backend: POST /api/v1/reviews/{reviewId}/images
 * Business Rules: Max 5 images, 5MB each, JPEG/PNG/WebP
 */
export async function uploadReviewImage(
  reviewId: string,
  file: File
): Promise<ReviewImage> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<ReviewImage>>(
    `/api/v1/reviews/${reviewId}/images`,
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
 * Backend: GET /api/v1/reviews/{reviewId}/images
 */
export async function getReviewImages(
  reviewId: string
): Promise<ReviewImage[]> {
  const response = await apiClient.get<ApiResponse<ReviewImage[]>>(
    `/api/v1/reviews/${reviewId}/images`
  );
  return response.data;
}

/**
 * Delete review image
 * Backend: DELETE /api/v1/reviews/{reviewId}/images/{imageId}
 */
export async function deleteReviewImage(
  reviewId: string,
  imageId: string
): Promise<void> {
  await apiClient.delete(`/api/v1/reviews/${reviewId}/images/${imageId}`);
}

/**
 * Delete all images for a review
 * Backend: DELETE /api/v1/reviews/{reviewId}/images
 */
export async function deleteAllReviewImages(reviewId: string): Promise<void> {
  await apiClient.delete(`/api/v1/reviews/${reviewId}/images`);
}

// ========================================
// Admin Moderation
// Backend: /api/v1/reviews/admin (unified controller)
// Authorization: hasRole('ADMIN')
// ========================================

/**
 * Get reviews for moderation (admin)
 * Backend: GET /api/v1/reviews/admin/pending
 */
export async function getReviewsForModeration(
  params?: AdminModerationQueryParams
): Promise<ReviewsResponse> {
  const response = await apiClient.get<ApiResponse<ReviewsResponse>>(
    '/api/v1/reviews/admin/pending',
    params as Record<string, string>
  );
  return response.data;
}

/**
 * Approve review (admin)
 * Backend: POST /api/v1/reviews/admin/{reviewId}/approve
 */
export async function approveReview(reviewId: string): Promise<Review> {
  const response = await apiClient.post<ApiResponse<Review>>(
    `/api/v1/reviews/admin/${reviewId}/approve`
  );
  return response.data;
}

/**
 * Reject review (admin)
 * Backend: POST /api/v1/reviews/admin/{reviewId}/reject
 */
export async function rejectReview(
  reviewId: string,
  reason: string
): Promise<Review> {
  const response = await apiClient.post<ApiResponse<Review>>(
    `/api/v1/reviews/admin/${reviewId}/reject`,
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
 * Backend: GET /api/v1/reviews/admin/flagged
 */
export async function getFlaggedReviews(
  params?: ReviewQueryParams
): Promise<ReviewsResponse> {
  const response = await apiClient.get<ApiResponse<ReviewsResponse>>(
    '/api/v1/reviews/admin/flagged',
    params as Record<string, string>
  );
  return response.data;
}

/**
 * Resolve flagged review (admin)
 * Backend: POST /api/v1/reviews/admin/{reviewId}/resolve
 */
export async function resolveFlaggedReview(
  reviewId: string,
  resolution: string
): Promise<Review> {
  const response = await apiClient.post<ApiResponse<Review>>(
    `/api/v1/reviews/admin/${reviewId}/resolve`,
    { resolution }
  );
  return response.data;
}

/**
 * Delete review (admin)
 * Backend: DELETE /api/v1/reviews/admin/{reviewId}
 */
export async function adminDeleteReview(reviewId: string): Promise<void> {
  await apiClient.delete(`/api/v1/reviews/admin/${reviewId}`);
}

// ========================================
// Statistics
// ========================================

/**
 * Get platform-wide review statistics (admin only)
 * Backend: GET /api/v1/reviews/admin/stats
 */
export async function getPlatformStats(): Promise<PlatformReviewStats> {
  const response = await apiClient.get<ApiResponse<PlatformReviewStats>>(
    '/api/v1/reviews/admin/stats'
  );
  return response.data;
}

// ========================================
// Export API object
// ========================================

export const reviewApi = {
  // CRUD (/api/v1/reviews)
  create: createReview,
  getById: getReviewById,
  update: updateReview,
  delete: deleteReview,

  // Queries
  getPackageReviews, // /api/v1/reviews/public/package/{id}
  getUserReviews, // /api/v1/reviews/my
  getSellerReviews, // /api/v1/reviews/public/seller/{id}
  canReviewOrder, // /api/v1/reviews/can-review/{orderId}

  // Seller Response (/api/v1/reviews/{reviewId}/respond)
  addResponse: addSellerResponse,
  updateResponse: updateSellerResponse,
  deleteResponse: deleteSellerResponse,

  // Voting (/api/v1/reviews/{reviewId}/helpful|not-helpful)
  voteHelpful,
  voteNotHelpful,
  vote,
  removeVote, // May not be supported in new architecture

  // Flagging (/api/v1/reviews/{reviewId}/flag)
  flag: flagReview,

  // Images (/api/v1/reviews/{reviewId}/images)
  uploadImage: uploadReviewImage,
  getImages: getReviewImages,
  deleteImage: deleteReviewImage,
  deleteAllImages: deleteAllReviewImages,

  // Admin (/api/v1/reviews/admin)
  getForModeration: getReviewsForModeration,
  moderate: moderateReview,
  approve: approveReview,
  reject: rejectReview,
  getFlagged: getFlaggedReviews,
  resolveFlag: resolveFlaggedReview,
  adminDelete: adminDeleteReview,
  getPlatformStats,
};

export default reviewApi;
