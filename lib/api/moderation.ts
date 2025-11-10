/**
 * ================================================
 * MODERATION API CLIENT
 * ================================================
 * API client for moderator endpoints
 *
 * ⚠️ REFACTORED: Sprint 1 - Story 1.3
 * - Bulk operations delegated to @/lib/services/moderation-service
 * - Dashboard/stats methods kept here (specific to moderator dashboard)
 * - Maintains backward compatibility
 *
 * Sprint: Moderator Dashboard Implementation
 * @version 3.0.0
 * @author MarifetBul Development Team
 * @updated November 8, 2025
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import type {
  ModerationStats,
  ModerationQueueItem,
  ModerationActivity,
  BlogCommentDto,
  CommentStatus,
  ReviewDto,
  ReportDto,
  UserModerationHistory,
} from '@/types/business/moderation';

// ============================================================================
// Sprint 9: Import canonical API types
// ============================================================================
import type { ApiResponse, PageResponse } from '@/types/infrastructure/api';

// ============================================================================
// RE-EXPORT BULK OPERATIONS FROM CENTRALIZED SERVICE
// ============================================================================
import {
  // Comment bulk operations
  bulkApproveComments,
  bulkRejectComments,
  bulkMarkCommentsAsSpam,

  // Review bulk operations
  bulkApproveReviews,
  bulkRejectReviews,

  // Single operations
  approveComment,
  rejectComment,
  markCommentAsSpam,
  approveReview,
  rejectReview,

  // Types
  type BulkModerationRequest,
  type BulkModerationResponse,
  type ModerationStatus,
  type ModerationItemType,
} from '@/lib/services/moderation-service';

export {
  bulkApproveComments,
  bulkRejectComments,
  bulkMarkCommentsAsSpam,
  bulkApproveReviews,
  bulkRejectReviews,
  approveComment,
  rejectComment,
  markCommentAsSpam,
  approveReview,
  rejectReview,
  type BulkModerationRequest,
  type BulkModerationResponse,
  type ModerationStatus,
  type ModerationItemType,
};

// ============================================================================
// STATS & DASHBOARD
// ============================================================================

/**
 * Get moderation statistics
 *
 * SPRINT 1 - STORY 1: Production-ready implementation
 * Backend: GET /api/v1/moderation/stats (ModerationController)
 * Returns: ModerationStatsResponse with real data
 *
 * @returns Comprehensive moderation statistics
 */
export async function getModerationStats(): Promise<ModerationStats> {
  const response = await apiClient.get<ApiResponse<ModerationStats>>(
    '/api/v1/moderation/stats'
  );
  return response.data;
}

/**
 * SPRINT 1 - STORY 2: Get moderation queue with pagination and filtering
 * Backend: GET /api/v1/moderation/queue
 * @param page - Page number (0-indexed on backend)
 * @param size - Page size (default 20, max 100)
 * @param type - Filter by type: 'review' | 'comment' | 'report' | null
 * @param priority - Filter by priority: 'HIGH' | 'MEDIUM' | 'LOW' | null
 * @returns Paginated queue items with priority sorting
 */
export async function getModerationQueue(
  page = 0,
  size = 20,
  type?: string | null,
  priority?: string | null
): Promise<PageResponse<ModerationQueueItem>> {
  const params: Record<string, string> = {
    page: page.toString(),
    size: size.toString(),
  };

  if (type) params.type = type;
  if (priority) params.priority = priority;

  const response = await apiClient.get<
    ApiResponse<PageResponse<ModerationQueueItem>>
  >('/api/v1/moderation/queue', params);
  return response.data;
}

/**
 * SPRINT 1 - STORY 3: Get recent moderation activities
 * Backend: GET /api/v1/moderation/activities
 *
 * @param page - Page number (0-indexed)
 * @param size - Page size (default 20, max 100)
 * @param allModerators - Include all moderators' activities (admin only, default false)
 * @returns Paginated activity log
 */
export async function getRecentActivities(
  page = 0,
  size = 20,
  allModerators = false
): Promise<PageResponse<ModerationActivity>> {
  const params: Record<string, string> = {
    page: page.toString(),
    size: size.toString(),
  };

  if (allModerators) {
    params.allModerators = 'true';
  }

  const response = await apiClient.get<
    ApiResponse<PageResponse<ModerationActivity>>
  >('/api/v1/moderation/activities', params);

  return response.data;
}

// ============================================================================
// COMMENT MODERATION
// ============================================================================

/**
 * Get pending comments (awaiting moderation)
 * Backend: GET /api/v1/moderation/comments/pending
 * Returns: PageResponse<CommentModerationResponse>
 */
export async function getPendingComments(
  page = 0,
  size = 20
): Promise<{ comments: BlogCommentDto[]; total: number }> {
  const response = await apiClient.get<
    ApiResponse<{
      content: Array<{
        commentId: string;
        status: string;
        notes?: string;
      }>;
      totalElements: number;
    }>
  >('/api/v1/moderation/comments/pending', {
    page: page.toString(),
    size: size.toString(),
  });

  // Transform backend CommentModerationResponse to frontend BlogCommentDto format
  // Note: Backend returns minimal CommentModerationResponse, we need to fetch full comment data
  // For now, return transformed data - TODO: Backend should return full comment details
  const transformedComments: BlogCommentDto[] = response.data.content.map(
    (item) => ({
      id: item.commentId,
      postId: '0', // Will be filled by backend
      postTitle: 'Loading...', // Will be filled by backend
      content: item.notes || '',
      authorName: 'User', // Will be filled by backend
      authorId: '', // Will be filled by backend
      status: item.status as CommentStatus,
      flaggedCount: 0, // Will be filled by backend
      flagReasons: [], // Will be filled by backend
      createdAt: new Date().toISOString(), // Will be filled by backend
    })
  );

  return {
    comments: transformedComments,
    total: response.data.totalElements,
  };
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

// ============================================================================
// NOTE: Comment/Review moderation actions moved to moderation-service.ts
// Re-exported at the top of this file for backward compatibility
// ============================================================================

// ============================================================================
// REVIEW MODERATION
// ============================================================================

/**
 * SPRINT 1 - STORY 4: Get pending reviews (awaiting moderation)
 * Backend: GET /api/v1/moderation/reviews/pending
 * Returns: PageResponse<ReviewModerationListResponse>
 *
 * @param page - Page number (0-indexed)
 * @param size - Page size (default 20)
 * @returns Paginated pending reviews with full details
 */
export async function getPendingReviews(
  page = 0,
  size = 20
): Promise<PageResponse<ReviewDto>> {
  const response = await apiClient.get<ApiResponse<PageResponse<ReviewDto>>>(
    '/api/v1/moderation/reviews/pending',
    {
      page: page.toString(),
      size: size.toString(),
    }
  );
  return response.data;
}

/**
 * SPRINT 1 - STORY 4: Get flagged reviews (need moderation)
 * Backend: GET /api/v1/moderation/reviews/flagged
 * Returns: PageResponse<ReviewModerationListResponse>
 *
 * @param page - Page number (0-indexed)
 * @param size - Page size (default 20)
 * @returns Paginated flagged reviews sorted by flaggedCount DESC
 */
export async function getFlaggedReviews(
  page = 0,
  size = 20
): Promise<PageResponse<ReviewDto>> {
  const response = await apiClient.get<ApiResponse<PageResponse<ReviewDto>>>(
    '/api/v1/moderation/reviews/flagged',
    {
      page: page.toString(),
      size: size.toString(),
    }
  );
  return response.data;
}

// ============================================================================
// NOTE: Review approve/reject moved to moderation-service.ts
// Re-exported at the top of this file for backward compatibility
// flagReview and resolveReviewFlag kept here (specific to moderation flow)
// ============================================================================

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
// USER MODERATION (WARNINGS & SUSPENSIONS)
// ============================================================================

/**
 * Issue warning to user
 * Backend: POST /api/v1/moderator/users/warnings
 */
export async function issueWarning(request: {
  userId: string;
  reason: string;
  details: string;
  relatedContentRef?: string;
}): Promise<UserWarning> {
  const response = await apiClient.post<ApiResponse<UserWarning>>(
    '/api/v1/moderator/users/warnings',
    request
  );
  return response.data;
}

/**
 * Get user warnings
 * Backend: GET /api/v1/moderator/users/warnings/user/{userId}
 */
export async function getUserWarnings(
  userId: string,
  page = 0,
  size = 20
): Promise<{ content: UserWarning[]; totalElements: number }> {
  const response = await apiClient.get<
    ApiResponse<{ content: UserWarning[]; totalElements: number }>
  >(`/api/v1/moderator/users/warnings/user/${userId}`, {
    page: page.toString(),
    size: size.toString(),
  });
  return response.data;
}

/**
 * Get active user warnings
 * Backend: GET /api/v1/moderator/users/warnings/user/{userId}/active
 */
export async function getActiveUserWarnings(
  userId: string
): Promise<UserWarning[]> {
  const response = await apiClient.get<ApiResponse<UserWarning[]>>(
    `/api/v1/moderator/users/warnings/user/${userId}/active`
  );
  return response.data;
}

/**
 * Revoke warning
 * Backend: POST /api/v1/moderator/users/warnings/{warningId}/revoke?reason=...
 */
export async function revokeWarning(
  warningId: string,
  reason: string
): Promise<UserWarning> {
  const response = await apiClient.post<ApiResponse<UserWarning>>(
    `/api/v1/moderator/users/warnings/${warningId}/revoke?reason=${encodeURIComponent(reason)}`
  );
  return response.data;
}

/**
 * Suspend user
 * Backend: POST /api/v1/moderator/users/suspensions
 */
export async function suspendUser(request: {
  userId: string;
  suspensionType:
    | 'TEMPORARY'
    | 'PERMANENT'
    | 'SELLER_RESTRICTED'
    | 'BUYER_RESTRICTED';
  reason: string;
  details: string;
  durationDays?: number;
  internalNotes?: string;
}): Promise<UserSuspension> {
  const response = await apiClient.post<ApiResponse<UserSuspension>>(
    '/api/v1/moderator/users/suspensions',
    request
  );
  return response.data;
}

/**
 * Get user suspensions
 * Backend: GET /api/v1/moderator/users/suspensions/user/{userId}
 */
export async function getUserSuspensions(
  userId: string,
  page = 0,
  size = 20
): Promise<{ content: UserSuspension[]; totalElements: number }> {
  const response = await apiClient.get<
    ApiResponse<{ content: UserSuspension[]; totalElements: number }>
  >(`/api/v1/moderator/users/suspensions/user/${userId}`, {
    page: page.toString(),
    size: size.toString(),
  });
  return response.data;
}

/**
 * Get user suspension status
 * Backend: GET /api/v1/moderator/users/suspensions/user/{userId}/status
 */
export async function getUserSuspensionStatus(
  userId: string
): Promise<UserSuspension | null> {
  const response = await apiClient.get<ApiResponse<UserSuspension | null>>(
    `/api/v1/moderator/users/suspensions/user/${userId}/status`
  );
  return response.data;
}

/**
 * Lift suspension (unsuspend user)
 * Backend: POST /api/v1/moderator/users/suspensions/{suspensionId}/lift?reason=...
 */
export async function liftSuspension(
  suspensionId: string,
  reason: string
): Promise<UserSuspension> {
  const response = await apiClient.post<ApiResponse<UserSuspension>>(
    `/api/v1/moderator/users/suspensions/${suspensionId}/lift?reason=${encodeURIComponent(reason)}`
  );
  return response.data;
}

/**
 * Decide on suspension appeal
 * Backend: POST /api/v1/moderator/users/suspensions/{suspensionId}/appeal/decide
 */
export async function decideSuspensionAppeal(
  suspensionId: string,
  decision: 'APPROVED' | 'REJECTED' | 'REDUCED',
  reason: string
): Promise<UserSuspension> {
  const response = await apiClient.post<ApiResponse<UserSuspension>>(
    `/api/v1/moderator/users/suspensions/${suspensionId}/appeal/decide`,
    { decision, reason }
  );
  return response.data;
}

/**
 * Get user moderation summary
 * Backend: GET /api/v1/moderator/users/summary/{userId}
 */
export async function getUserModerationSummary(
  userId: string
): Promise<string> {
  const response = await apiClient.get<ApiResponse<string>>(
    `/api/v1/moderator/users/summary/${userId}`
  );
  return response.data;
}

// Type definitions for new user moderation system
export interface UserWarning {
  id: string;
  userId: string;
  moderatorId: string;
  moderatorName?: string;
  warningLevel: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';
  reason: string;
  reasonDescription: string;
  details: string;
  relatedContentRef?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'APPEALED' | 'REVOKED' | 'ESCALATED';
  createdAt: string;
  expiresAt?: string;
  acknowledgedAt?: string;
  appealedAt?: string;
  appealDecision?: string;
  active: boolean;
  canAppeal: boolean;
}

export interface UserSuspension {
  id: string;
  userId: string;
  moderatorId: string;
  moderatorName?: string;
  suspensionType:
    | 'TEMPORARY'
    | 'PERMANENT'
    | 'SELLER_RESTRICTED'
    | 'BUYER_RESTRICTED';
  suspensionTypeDescription: string;
  reason: string;
  reasonDescription: string;
  details: string;
  warningId?: string;
  startsAt: string;
  expiresAt?: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'LIFTED' | 'APPEALED';
  createdAt: string;
  appealedAt?: string;
  appealMessage?: string;
  appealDecision?: 'APPROVED' | 'REJECTED' | 'REDUCED';
  appealDecisionReason?: string;
  appealDecidedAt?: string;
  unsuspendedAt?: string;
  unsuspensionReason?: string;
  active: boolean;
  permanent: boolean;
  canAppeal: boolean;
}

// ============================================================================
// USER MODERATION HISTORY
// ============================================================================

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
  getRecentActivities,

  // Comment Moderation (query methods - actions re-exported from moderation-service)
  getPendingComments,
  getCommentsByStatus,

  // Comment/Review Actions - delegated to moderation-service (re-exported above)
  approveComment,
  rejectComment,
  markCommentAsSpam,
  bulkApproveComments,
  bulkRejectComments,
  bulkMarkCommentsAsSpam,
  approveReview,
  rejectReview,

  // Review Moderation (specific to moderation flow)
  getPendingReviews,
  getFlaggedReviews,
  flagReview,
  resolveReviewFlag,

  // User Moderation
  issueWarning,
  getUserWarnings,
  getActiveUserWarnings,
  revokeWarning,
  suspendUser,
  getUserSuspensions,
  getUserSuspensionStatus,
  liftSuspension,
  decideSuspensionAppeal,
  getUserModerationSummary,
  getUserModerationHistory,

  // Reports
  getPendingReports,
  resolveReport,
  dismissReport,
};

export default moderationApi;
