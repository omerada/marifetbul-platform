/**
 * ================================================
 * MODERATION API CLIENT
 * ================================================
 * API client for moderator endpoints
 *
 * Sprint: Moderator Dashboard Implementation
 * @version 2.0.0
 * @author MarifetBul Development Team
 * @updated November 1, 2025
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import type {
  ModerationStats,
  PendingItemsResponse,
  ModeratorActivitiesResponse,
  BlogCommentDto,
  ReviewDto,
  ReportDto,
  BulkActionResponse,
  UserModerationHistory,
} from '@/types/business/moderation';

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

// ============================================================================
// STATS & DASHBOARD
// ============================================================================

/**
 * Get moderation statistics
 * Backend: GET /api/v1/moderator/stats
 */
export async function getModerationStats(): Promise<ModerationStats> {
  const response = await apiClient.get<ApiResponse<ModerationStats>>(
    '/api/v1/moderator/stats'
  );
  return response.data;
}

/**
 * Get pending items queue
 * Backend: GET /api/v1/moderator/pending-items
 */
export async function getPendingItems(
  page = 1,
  pageSize = 10
): Promise<PendingItemsResponse> {
  const response = await apiClient.get<ApiResponse<PendingItemsResponse>>(
    '/api/v1/moderator/pending-items',
    { page: page.toString(), pageSize: pageSize.toString() }
  );
  return response.data;
}

/**
 * Get recent moderator activities
 * Backend: GET /api/v1/moderator/recent-activity
 */
export async function getRecentActivities(
  page = 1,
  pageSize = 20
): Promise<ModeratorActivitiesResponse> {
  const response = await apiClient.get<
    ApiResponse<ModeratorActivitiesResponse>
  >('/api/v1/moderator/recent-activity', {
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  return response.data;
}

// ============================================================================
// COMMENT MODERATION
// ============================================================================

/**
 * Get pending comments (awaiting moderation)
 * Backend: GET /api/v1/blog/admin/comments/pending
 */
export async function getPendingComments(
  page = 0,
  size = 20
): Promise<{ comments: BlogCommentDto[]; total: number }> {
  const response = await apiClient.get<
    ApiResponse<{ comments: BlogCommentDto[]; total: number }>
  >('/api/v1/blog/admin/comments/pending', {
    page: page.toString(),
    size: size.toString(),
  });
  return response.data;
}

/**
 * Get comments by status
 * Backend: GET /api/v1/blog/admin/comments
 */
export async function getCommentsByStatus(
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM',
  page = 0,
  size = 20
): Promise<{ comments: BlogCommentDto[]; total: number }> {
  const response = await apiClient.get<
    ApiResponse<{ comments: BlogCommentDto[]; total: number }>
  >('/api/v1/blog/admin/comments', {
    status,
    page: page.toString(),
    size: size.toString(),
  });
  return response.data;
}

/**
 * Approve a single comment
 * Backend: POST /api/v1/blog/admin/comments/{id}/approve
 */
export async function approveComment(
  commentId: string
): Promise<BlogCommentDto> {
  const response = await apiClient.post<ApiResponse<BlogCommentDto>>(
    `/api/v1/blog/admin/comments/${commentId}/approve`
  );
  return response.data;
}

/**
 * Reject a single comment
 * Backend: POST /api/v1/blog/admin/comments/{id}/reject
 */
export async function rejectComment(
  commentId: string,
  reason?: string
): Promise<BlogCommentDto> {
  const response = await apiClient.post<ApiResponse<BlogCommentDto>>(
    `/api/v1/blog/admin/comments/${commentId}/reject`,
    { reason }
  );
  return response.data;
}

/**
 * Mark comment as spam
 * Backend: POST /api/v1/blog/admin/comments/{id}/spam
 */
export async function markCommentAsSpam(
  commentId: string
): Promise<BlogCommentDto> {
  const response = await apiClient.post<ApiResponse<BlogCommentDto>>(
    `/api/v1/blog/admin/comments/${commentId}/spam`
  );
  return response.data;
}

/**
 * Bulk approve comments
 * Backend: POST /api/v1/blog/admin/comments/bulk/approve
 */
export async function bulkApproveComments(
  commentIds: string[]
): Promise<BulkActionResponse> {
  const response = await apiClient.post<ApiResponse<BulkActionResponse>>(
    '/api/v1/blog/admin/comments/bulk/approve',
    { commentIds }
  );
  return response.data;
}

/**
 * Bulk reject comments
 * Backend: POST /api/v1/blog/admin/comments/bulk/reject
 */
export async function bulkRejectComments(
  commentIds: string[],
  reason?: string
): Promise<BulkActionResponse> {
  const response = await apiClient.post<ApiResponse<BulkActionResponse>>(
    '/api/v1/blog/admin/comments/bulk/reject',
    { commentIds, reason }
  );
  return response.data;
}

/**
 * Bulk mark comments as spam
 * Backend: POST /api/v1/blog/admin/comments/bulk/spam
 */
export async function bulkMarkCommentsAsSpam(
  commentIds: string[]
): Promise<BulkActionResponse> {
  const response = await apiClient.post<ApiResponse<BulkActionResponse>>(
    '/api/v1/blog/admin/comments/bulk/spam',
    { commentIds }
  );
  return response.data;
}

// ============================================================================
// REVIEW MODERATION
// ============================================================================

/**
 * Get pending reviews (awaiting moderation)
 * Backend: GET /api/v1/reviews/admin/pending
 */
export async function getPendingReviews(
  page = 0,
  size = 20
): Promise<{ reviews: ReviewDto[]; total: number }> {
  const response = await apiClient.get<
    ApiResponse<{ reviews: ReviewDto[]; total: number }>
  >('/api/v1/reviews/admin/pending', {
    page: page.toString(),
    size: size.toString(),
  });
  return response.data;
}

/**
 * Get flagged reviews (need moderation)
 * Backend: GET /api/v1/reviews/admin/flagged
 */
export async function getFlaggedReviews(
  page = 0,
  size = 20
): Promise<{ reviews: ReviewDto[]; total: number }> {
  const response = await apiClient.get<
    ApiResponse<{ reviews: ReviewDto[]; total: number }>
  >('/api/v1/reviews/admin/flagged', {
    page: page.toString(),
    size: size.toString(),
  });
  return response.data;
}

/**
 * Approve a review
 * Backend: POST /api/v1/reviews/admin/{id}/approve
 */
export async function approveReview(reviewId: string): Promise<ReviewDto> {
  const response = await apiClient.post<ApiResponse<ReviewDto>>(
    `/api/v1/reviews/admin/${reviewId}/approve`
  );
  return response.data;
}

/**
 * Reject a review
 * Backend: POST /api/v1/reviews/admin/{id}/reject
 */
export async function rejectReview(
  reviewId: string,
  reason: string
): Promise<ReviewDto> {
  const response = await apiClient.post<ApiResponse<ReviewDto>>(
    `/api/v1/reviews/admin/${reviewId}/reject`,
    { reason }
  );
  return response.data;
}

/**
 * Flag a review for moderation
 * Backend: POST /api/v1/reviews/{id}/flag
 */
export async function flagReview(
  reviewId: string,
  reason: string,
  description?: string
): Promise<ReviewDto> {
  const response = await apiClient.post<ApiResponse<ReviewDto>>(
    `/api/v1/reviews/${reviewId}/flag`,
    { reason, description }
  );
  return response.data;
}

/**
 * Resolve a review flag
 * Backend: POST /api/v1/reviews/admin/{id}/resolve-flag
 */
export async function resolveReviewFlag(
  reviewId: string,
  resolution: string
): Promise<ReviewDto> {
  const response = await apiClient.post<ApiResponse<ReviewDto>>(
    `/api/v1/reviews/admin/${reviewId}/resolve-flag`,
    { resolution }
  );
  return response.data;
}

// ============================================================================
// USER ACTIONS (WARNINGS & BANS)
// ============================================================================

/**
 * Warn a user
 * Backend: POST /api/v1/admin/users/{userId}/warn
 */
export async function warnUser(
  userId: string,
  reason: string,
  message: string
): Promise<{ success: boolean; warning: UserModerationHistory }> {
  const response = await apiClient.post<
    ApiResponse<{ success: boolean; warning: UserModerationHistory }>
  >(`/api/v1/admin/users/${userId}/warn`, { reason, message });
  return response.data;
}

/**
 * Ban a user temporarily
 * Backend: POST /api/v1/admin/users/{userId}/ban
 */
export async function banUser(
  userId: string,
  reason: string,
  duration: number, // in days
  permanent = false
): Promise<{ success: boolean; ban: UserModerationHistory }> {
  const response = await apiClient.post<
    ApiResponse<{ success: boolean; ban: UserModerationHistory }>
  >(`/api/v1/admin/users/${userId}/ban`, { reason, duration, permanent });
  return response.data;
}

/**
 * Unban a user
 * Backend: POST /api/v1/admin/users/{userId}/unban
 */
export async function unbanUser(userId: string): Promise<{ success: boolean }> {
  const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
    `/api/v1/admin/users/${userId}/unban`
  );
  return response.data;
}

/**
 * Get user moderation history
 * Backend: GET /api/v1/admin/users/{userId}/moderation-history
 */
export async function getUserModerationHistory(
  userId: string
): Promise<UserModerationHistory> {
  const response = await apiClient.get<ApiResponse<UserModerationHistory>>(
    `/api/v1/admin/users/${userId}/moderation-history`
  );
  return response.data;
}

// ============================================================================
// REPORTS HANDLING
// ============================================================================

/**
 * Get pending reports
 * Backend: GET /api/v1/moderator/reports/pending
 */
export async function getPendingReports(
  page = 0,
  size = 20
): Promise<{ reports: ReportDto[]; total: number }> {
  const response = await apiClient.get<
    ApiResponse<{ reports: ReportDto[]; total: number }>
  >('/api/v1/moderator/reports/pending', {
    page: page.toString(),
    size: size.toString(),
  });
  return response.data;
}

/**
 * Resolve a report
 * Backend: POST /api/v1/moderator/reports/{reportId}/resolve
 */
export async function resolveReport(
  reportId: string,
  action: string,
  notes?: string
): Promise<ReportDto> {
  const response = await apiClient.post<ApiResponse<ReportDto>>(
    `/api/v1/moderator/reports/${reportId}/resolve`,
    { action, notes }
  );
  return response.data;
}

/**
 * Dismiss a report
 * Backend: POST /api/v1/moderator/reports/{reportId}/dismiss
 */
export async function dismissReport(
  reportId: string,
  reason?: string
): Promise<ReportDto> {
  const response = await apiClient.post<ApiResponse<ReportDto>>(
    `/api/v1/moderator/reports/${reportId}/dismiss`,
    { reason }
  );
  return response.data;
}

// ============================================================================
// EXPORT API OBJECT
// ============================================================================

export const moderationApi = {
  // Stats & Dashboard
  getStats: getModerationStats,
  getPendingItems,
  getRecentActivities,

  // Comment Moderation
  getPendingComments,
  getCommentsByStatus,
  approveComment,
  rejectComment,
  markCommentAsSpam,
  bulkApproveComments,
  bulkRejectComments,
  bulkMarkCommentsAsSpam,

  // Review Moderation
  getPendingReviews,
  getFlaggedReviews,
  approveReview,
  rejectReview,
  flagReview,
  resolveReviewFlag,

  // User Actions
  warnUser,
  banUser,
  unbanUser,
  getUserModerationHistory,

  // Reports
  getPendingReports,
  resolveReport,
  dismissReport,
};

export default moderationApi;
