/**
 * Admin Moderation API - Stub Implementation
 * TODO: Implement full moderation API functionality
 */

export const moderationApi = {
  getStats: async () => ({ total: 0, pending: 0, resolved: 0 }),
  getReviews: async () => [],
  approveReview: async (id: number) => {},
  rejectReview: async (id: number) => {},
};

export type ModerationStats = {
  total: number;
  pending: number;
  resolved: number;
};
