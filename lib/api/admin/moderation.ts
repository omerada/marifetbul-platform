/**
 * Admin Moderation API - Type Definitions
 *
 * Production Implementation:
 * - Unified moderation via lib/api/moderation.ts
 * - Admin & Moderator endpoints consolidated
 * - UnifiedCommentQueue for all comment types (blog, reviews, etc.)
 */

export type PlatformReviewStats = {
  approved: number;
  pending: number;
  rejected: number;
  spam: number;
  // Extended fields for ModerationStats component
  pendingReviews: number;
  flaggedReviews: number;
  reviewsToday: number;
  totalReviews: number;
  reviewsThisWeek: number;
  reviewsThisMonth: number;
  approvedReviews: number;
  rejectedReviews: number;
  averageRating: number;
};

export const moderationApi = {
  getStats: async () => ({ total: 0, pending: 0, resolved: 0 }),
  getPlatformStats: async (): Promise<PlatformReviewStats> => ({
    approved: 0,
    pending: 0,
    rejected: 0,
    spam: 0,
    pendingReviews: 0,
    flaggedReviews: 0,
    reviewsToday: 0,
    totalReviews: 0,
    reviewsThisWeek: 0,
    reviewsThisMonth: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
    averageRating: 0,
  }),
  getReviews: async () => [],
  approveReview: async (id: number) => {},
  rejectReview: async (id: number) => {},
};

export type ModerationStats = {
  total: number;
  pending: number;
  resolved: number;
};
