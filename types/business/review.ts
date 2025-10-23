/**
 * ================================================
 * REVIEW TYPES & INTERFACES
 * ================================================
 * TypeScript types for Review System
 * Aligned with backend API contracts
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint
 */

import { z } from 'zod';

// ========================================
// Enums
// ========================================

/**
 * Review status
 */
export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED',
}

/**
 * Review type
 */
export enum ReviewType {
  ORDER = 'ORDER',
  PACKAGE = 'PACKAGE',
}

/**
 * Vote type for helpful/not helpful
 */
export enum VoteType {
  HELPFUL = 'HELPFUL',
  NOT_HELPFUL = 'NOT_HELPFUL',
}

/**
 * Flag reason
 */
export enum FlagReason {
  SPAM = 'SPAM',
  INAPPROPRIATE = 'INAPPROPRIATE',
  FAKE = 'FAKE',
  OFFENSIVE = 'OFFENSIVE',
  OTHER = 'OTHER',
}

// ========================================
// Core Review Types
// ========================================

/**
 * Review response from backend
 */
export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  revieweeId: string;
  revieweeName: string;
  orderId?: string;
  packageId?: string;
  packageTitle?: string;
  type: ReviewType;
  status: ReviewStatus;
  overallRating: number;
  communicationRating: number;
  qualityRating: number;
  deliveryRating: number;
  reviewText: string;
  responseText?: string;
  helpfulCount: number;
  notHelpfulCount: number;
  isVerifiedPurchase: boolean;
  flaggedCount: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string;
  images?: ReviewImage[];
  userVote?: VoteType;
  canRespond?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

/**
 * Review image
 */
export interface ReviewImage {
  id: string;
  reviewId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  filename: string;
  fileSize?: number;
  mimeType?: string;
  displayOrder: number;
  width?: number;
  height?: number;
  isPrimary: boolean;
  createdAt: string;
}

/**
 * Review statistics
 */
export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number; // 1-5 stars → count
  };
  communicationAvg: number;
  qualityAvg: number;
  deliveryAvg: number;
  verifiedPurchaseCount: number;
}

/**
 * Paginated reviews response
 */
export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  stats?: ReviewStats;
}

// ========================================
// Request DTOs
// ========================================

/**
 * Create review request
 */
export interface CreateReviewRequest {
  orderId?: string;
  packageId?: string;
  type: ReviewType;
  overallRating: number;
  communicationRating: number;
  qualityRating: number;
  deliveryRating: number;
  reviewText: string;
}

/**
 * Update review request
 */
export interface UpdateReviewRequest {
  overallRating?: number;
  communicationRating?: number;
  qualityRating?: number;
  deliveryRating?: number;
  reviewText?: string;
}

/**
 * Seller response request
 */
export interface SellerResponseRequest {
  responseText: string;
}

/**
 * Flag review request
 */
export interface FlagReviewRequest {
  reason: FlagReason;
  description?: string;
}

/**
 * Moderate review request (admin)
 */
export interface ModerateReviewRequest {
  action: 'APPROVE' | 'REJECT';
  reason?: string;
  adminNotes?: string;
}

// ========================================
// Query Parameters
// ========================================

/**
 * Review list query params
 */
export interface ReviewQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'CREATED_AT' | 'RATING' | 'HELPFUL_COUNT';
  sortDirection?: 'ASC' | 'DESC';
  status?: ReviewStatus;
  minRating?: number;
  maxRating?: number;
  verifiedOnly?: boolean;
}

/**
 * Package reviews query params
 */
export interface PackageReviewsQueryParams extends ReviewQueryParams {
  packageId: string;
}

/**
 * User reviews query params (as reviewer)
 */
export interface UserReviewsQueryParams extends ReviewQueryParams {
  userId: string;
}

/**
 * Seller reviews query params (as reviewee)
 */
export interface SellerReviewsQueryParams extends ReviewQueryParams {
  sellerId: string;
}

/**
 * Admin moderation query params
 */
export interface AdminModerationQueryParams {
  page?: number;
  pageSize?: number;
  status?: ReviewStatus;
  flaggedOnly?: boolean;
  sortBy?: 'CREATED_AT' | 'FLAGGED_COUNT';
  sortDirection?: 'ASC' | 'DESC';
}

// ========================================
// Zod Schemas for Validation
// ========================================

export const createReviewSchema = z
  .object({
    orderId: z.string().uuid().optional(),
    packageId: z.string().uuid().optional(),
    type: z.nativeEnum(ReviewType),
    overallRating: z.number().min(1).max(5),
    communicationRating: z.number().min(1).max(5),
    qualityRating: z.number().min(1).max(5),
    deliveryRating: z.number().min(1).max(5),
    reviewText: z.string().min(50).max(1000),
  })
  .refine(
    (data) => data.orderId || data.packageId,
    'Either orderId or packageId must be provided'
  );

export const updateReviewSchema = z.object({
  overallRating: z.number().min(1).max(5).optional(),
  communicationRating: z.number().min(1).max(5).optional(),
  qualityRating: z.number().min(1).max(5).optional(),
  deliveryRating: z.number().min(1).max(5).optional(),
  reviewText: z.string().min(50).max(1000).optional(),
});

export const sellerResponseSchema = z.object({
  responseText: z.string().min(10).max(500),
});

export const flagReviewSchema = z.object({
  reason: z.nativeEnum(FlagReason),
  description: z.string().max(500).optional(),
});

export const moderateReviewSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().max(500).optional(),
  adminNotes: z.string().max(500).optional(),
});

// ========================================
// UI Helper Types
// ========================================

/**
 * Review form state
 */
export interface ReviewFormState {
  overallRating: number;
  communicationRating: number;
  qualityRating: number;
  deliveryRating: number;
  reviewText: string;
  images: File[];
}

/**
 * Review filter state
 */
export interface ReviewFilterState {
  status?: ReviewStatus;
  minRating?: number;
  verifiedOnly: boolean;
  sortBy: 'CREATED_AT' | 'RATING' | 'HELPFUL_COUNT';
  sortDirection: 'ASC' | 'DESC';
}

/**
 * Rating category
 */
export type RatingCategory =
  | 'overall'
  | 'communication'
  | 'quality'
  | 'delivery';

/**
 * Rating labels
 */
export const RATING_LABELS: Record<RatingCategory, string> = {
  overall: 'Genel Değerlendirme',
  communication: 'İletişim',
  quality: 'Kalite',
  delivery: 'Teslimat',
};

/**
 * Rating descriptions
 */
export const RATING_DESCRIPTIONS: Record<number, string> = {
  1: 'Çok Kötü',
  2: 'Kötü',
  3: 'Orta',
  4: 'İyi',
  5: 'Mükemmel',
};

// ========================================
// Type Guards
// ========================================

export function isReview(obj: unknown): obj is Review {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'id' in obj &&
    typeof obj.id === 'string' &&
    'reviewerId' in obj &&
    typeof obj.reviewerId === 'string' &&
    'overallRating' in obj &&
    typeof obj.overallRating === 'number' &&
    'reviewText' in obj &&
    typeof obj.reviewText === 'string'
  );
}

export function isReviewImage(obj: unknown): obj is ReviewImage {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'id' in obj &&
    typeof obj.id === 'string' &&
    'reviewId' in obj &&
    typeof obj.reviewId === 'string' &&
    'imageUrl' in obj &&
    typeof obj.imageUrl === 'string'
  );
}
