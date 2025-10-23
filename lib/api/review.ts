/**
 * ================================================
 * REVIEW API CLIENT
 * ================================================
 * API client for Review System endpoints
 * Handles all review-related HTTP requests
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint
 */

import { apiClient } from '@/lib/infrastructure/api/client';
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
// ========================================

/**
 * Create a new review
 */
export async function createReview(data: CreateReviewRequest): Promise<Review> {
  const response = await apiClient.post<ApiResponse<Review>>(
    '/api/v1/user/reviews',
    data
  );
  return response.data;
}

/**
 * Get review by ID
 */
export async function getReviewById(reviewId: string): Promise<Review> {
  const response = await apiClient.get<ApiResponse<Review>>(
    `/api/v1/user/reviews/${reviewId}`
  );
  return response.data;
}

/**
 * Update review
 */
export async function updateReview(
  reviewId: string,
  data: UpdateReviewRequest
): Promise<Review> {
  const response = await apiClient.put<ApiResponse<Review>>(
    `/api/v1/user/reviews/${reviewId}`,
    data
  );
  return response.data;
}

/**
 * Delete review
 */
export async function deleteReview(reviewId: string): Promise<void> {
  await apiClient.delete(`/api/v1/user/reviews/${reviewId}`);
}

// ========================================
// Review Queries
// ========================================

/**
 * Get reviews for a package
 */
export async function getPackageReviews(
  params: PackageReviewsQueryParams
): Promise<ReviewsResponse> {
  const { packageId, ...queryParams } = params;
  const response = await apiClient.get<ApiResponse<ReviewsResponse>>(
    `/api/v1/public/packages/${packageId}/reviews`,
    queryParams as Record<string, string>
  );
  return response.data;
}

/**
 * Get reviews written by a user (as reviewer)
 */
export async function getUserReviews(
  params?: ReviewQueryParams
): Promise<ReviewsResponse> {
  const response = await apiClient.get<ApiResponse<ReviewsResponse>>(
    `/api/v1/user/reviews`,
    params as Record<string, string>
  );
  return response.data;
}

/**
 * Get reviews received by a seller (as reviewee)
 */
export async function getSellerReviews(
  params: SellerReviewsQueryParams
): Promise<ReviewsResponse> {
  const { sellerId, ...queryParams } = params;
  const response = await apiClient.get<ApiResponse<ReviewsResponse>>(
    `/api/v1/public/sellers/${sellerId}/reviews`,
    queryParams as Record<string, string>
  );
  return response.data;
}

/**
 * Check if user can review an order
 */
export async function canReviewOrder(orderId: string): Promise<boolean> {
  const response = await apiClient.get<ApiResponse<{ canReview: boolean }>>(
    `/api/v1/user/orders/${orderId}/can-review`
  );
  return response.data.canReview;
}

// ========================================
// Seller Response
// ========================================

/**
 * Add seller response to a review
 */
export async function addSellerResponse(
  reviewId: string,
  data: SellerResponseRequest
): Promise<Review> {
  const response = await apiClient.post<ApiResponse<Review>>(
    `/api/v1/user/reviews/${reviewId}/response`,
    data
  );
  return response.data;
}

/**
 * Update seller response
 */
export async function updateSellerResponse(
  reviewId: string,
  data: SellerResponseRequest
): Promise<Review> {
  const response = await apiClient.put<ApiResponse<Review>>(
    `/api/v1/user/reviews/${reviewId}/response`,
    data
  );
  return response.data;
}

/**
 * Delete seller response
 */
export async function deleteSellerResponse(reviewId: string): Promise<Review> {
  const response = await apiClient.delete<ApiResponse<Review>>(
    `/api/v1/user/reviews/${reviewId}/response`
  );
  return response.data;
}

// ========================================
// Voting
// ========================================

/**
 * Vote on review (helpful/not helpful)
 */
export async function voteReview(
  reviewId: string,
  voteType: VoteType
): Promise<Review> {
  const response = await apiClient.post<ApiResponse<Review>>(
    `/api/v1/user/reviews/${reviewId}/vote`,
    { voteType }
  );
  return response.data;
}

/**
 * Remove vote from review
 */
export async function removeVote(reviewId: string): Promise<Review> {
  const response = await apiClient.delete<ApiResponse<Review>>(
    `/api/v1/user/reviews/${reviewId}/vote`
  );
  return response.data;
}

// ========================================
// Flagging
// ========================================

/**
 * Flag a review for moderation
 */
export async function flagReview(
  reviewId: string,
  data: FlagReviewRequest
): Promise<void> {
  await apiClient.post(`/api/v1/user/reviews/${reviewId}/flag`, data);
}

// ========================================
// Image Upload
// ========================================

/**
 * Upload image to review
 */
export async function uploadReviewImage(
  reviewId: string,
  file: File
): Promise<ReviewImage> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<ReviewImage>>(
    `/api/v1/user/reviews/${reviewId}/images`,
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
 */
export async function getReviewImages(
  reviewId: string
): Promise<ReviewImage[]> {
  const response = await apiClient.get<ApiResponse<ReviewImage[]>>(
    `/api/v1/user/reviews/${reviewId}/images`
  );
  return response.data;
}

/**
 * Delete review image
 */
export async function deleteReviewImage(
  reviewId: string,
  imageId: string
): Promise<void> {
  await apiClient.delete(`/api/v1/user/reviews/${reviewId}/images/${imageId}`);
}

/**
 * Delete all images for a review
 */
export async function deleteAllReviewImages(reviewId: string): Promise<void> {
  await apiClient.delete(`/api/v1/user/reviews/${reviewId}/images`);
}

// ========================================
// Admin Moderation
// ========================================

/**
 * Get reviews for moderation (admin)
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
 * Moderate review (admin)
 */
export async function moderateReview(
  reviewId: string,
  data: ModerateReviewRequest
): Promise<Review> {
  const response = await apiClient.post<ApiResponse<Review>>(
    `/api/v1/admin/reviews/${reviewId}/moderate`,
    data
  );
  return response.data;
}

/**
 * Get flagged reviews (admin)
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

// ========================================
// Export API object
// ========================================

export const reviewApi = {
  // CRUD
  create: createReview,
  getById: getReviewById,
  update: updateReview,
  delete: deleteReview,

  // Queries
  getPackageReviews,
  getUserReviews,
  getSellerReviews,
  canReviewOrder,

  // Seller Response
  addResponse: addSellerResponse,
  updateResponse: updateSellerResponse,
  deleteResponse: deleteSellerResponse,

  // Voting
  vote: voteReview,
  removeVote,

  // Flagging
  flag: flagReview,

  // Images
  uploadImage: uploadReviewImage,
  getImages: getReviewImages,
  deleteImage: deleteReviewImage,
  deleteAllImages: deleteAllReviewImages,

  // Admin
  getForModeration: getReviewsForModeration,
  moderate: moderateReview,
  getFlagged: getFlaggedReviews,
};

export default reviewApi;
