/**
 * ================================================
 * REVIEW TRANSFORMER
 * ================================================
 * Transforms backend review responses to frontend types
 * Adds computed properties like reviewerName, revieweeName
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Updated for backend validator types
 */

import type { Review as BackendReview } from '@/lib/api/validators';
import type { Review as FrontendReview } from '@/types/business/review';
import { ReviewType, ReviewStatus } from '@/types/business/review';

/**
 * Transform backend review response to frontend Review type
 */
export function transformReviewResponse(
  backend: BackendReview
): FrontendReview {
  const fullName =
    backend.reviewer?.firstName && backend.reviewer?.lastName
      ? `${backend.reviewer.firstName} ${backend.reviewer.lastName}`
      : backend.reviewer?.username;

  return {
    id: backend.id.toString(),
    reviewerId: backend.reviewerId.toString(),
    reviewerName: fullName || 'Anonymous',
    reviewerAvatar: backend.reviewer?.profilePictureUrl || undefined,
    revieweeId: backend.revieweeId.toString(),
    revieweeName: 'User', // Backend doesn't provide reviewee info
    orderId: backend.orderId.toString(),
    packageId: backend.order?.packageId?.toString(),
    packageTitle: undefined, // Backend Order doesn't have packageTitle
    packageName: undefined,
    serviceName: undefined,
    type: ReviewType.ORDER,
    status: ReviewStatus.APPROVED,
    overallRating: backend.rating,
    communicationRating: backend.rating,
    qualityRating: backend.rating,
    deliveryRating: backend.rating,
    reviewText: backend.comment || '',
    responseText: undefined,
    sellerResponse: undefined,
    helpfulCount: 0,
    notHelpfulCount: 0,
    isVerifiedPurchase: true,
    verifiedPurchase: true,
    flaggedCount: 0,
    adminNotes: undefined,
    moderatorNote: undefined,
    createdAt: backend.createdAt,
    updatedAt: backend.createdAt,
    respondedAt: undefined,
    images: [],
    userVote: undefined,
    canRespond: false,
    canEdit: false,
    canDelete: false,
    moderationHistory: [],
  };
}

/**
 * Transform array of backend review responses
 */
export function transformReviewResponses(
  backendReviews: BackendReview[]
): FrontendReview[] {
  return backendReviews.map(transformReviewResponse);
}
