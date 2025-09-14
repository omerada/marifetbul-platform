// Consolidated review types
import { PaginationMeta, ApiResponse } from '../utils/api';

// Legacy compatibility exports
export type ReviewData = Review;
export type ReviewFilters = ReviewFilter;
export interface CreateReviewRequest {
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  wouldRecommend: boolean;
  tags?: string[];
  images?: File[];
}

export type CreateReviewResponse = ApiResponse<Review>;
export interface ReviewsResponse {
  reviews: Review[];
  pagination: PaginationMeta;
  stats: ReviewStats;
}

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  orderId: string;
  packageId?: string;
  jobId?: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  wouldRecommend: boolean;
  isVerified: boolean;
  isPublic: boolean;
  tags?: ReviewTag[];
  helpfulVotes: number;
  reportCount: number;
  createdAt: string;
  updatedAt?: string;
  response?: ReviewResponse;
  images?: string[];
}

export interface ReviewResponse {
  id: string;
  sellerId: string;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewTag {
  id: string;
  name: string;
  category: ReviewTagCategory;
  color?: string;
}

export type ReviewTagCategory =
  | 'quality'
  | 'communication'
  | 'delivery'
  | 'professionalism'
  | 'value'
  | 'experience';

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recommendationRate: number;
  responseRate: number;
  verifiedReviewsCount: number;
  tagFrequency: Record<string, number>;
}

export interface ReviewFilter {
  rating?: number[];
  hasComment?: boolean;
  isVerified?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  wouldRecommend?: boolean;
}

export interface ReviewSummary {
  id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  isVerified: boolean;
  wouldRecommend: boolean;
  helpfulVotes: number;
  hasResponse: boolean;
}

export interface ReviewHelpfulVote {
  id: string;
  reviewId: string;
  userId: string;
  isHelpful: boolean;
  createdAt: string;
}

export interface ReviewReport {
  id: string;
  reviewId: string;
  reporterId: string;
  reason: ReviewReportReason;
  description?: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export type ReviewReportReason =
  | 'inappropriate_content'
  | 'fake_review'
  | 'spam'
  | 'personal_attack'
  | 'off_topic'
  | 'copyright_violation'
  | 'other';

export interface ReviewMetrics {
  userId: string;
  period: {
    start: string;
    end: string;
  };
  reviewsReceived: number;
  reviewsGiven: number;
  averageRatingReceived: number;
  averageRatingGiven: number;
  responseRate: number;
  responseTime: number; // average hours to respond
  improvedRatings: boolean; // trending up
}

export interface ReviewTemplate {
  id: string;
  name: string;
  category: string;
  questions: ReviewQuestion[];
  isDefault: boolean;
  isActive: boolean;
}

export interface ReviewQuestion {
  id: string;
  question: string;
  type: 'rating' | 'text' | 'boolean' | 'multiple_choice';
  isRequired: boolean;
  options?: string[]; // for multiple choice
  placeholder?: string;
}

export interface BulkReviewData {
  reviews: Review[];
  stats: ReviewStats;
  filters: ReviewFilter;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
