/**
 * ===================================================================================
 * MODERATOR SERVICE - Production-Ready API Client
 * ===================================================================================
 * Complete moderation service matching Spring Boot backend endpoints exactly
 *
 * Backend Controllers:
 * - ModeratorDashboardController.java
 * - BlogCommentController.java (moderation endpoints)
 * - ReviewController.java (moderation endpoints)
 *
 * Base Paths (Sprint 1 - Task 5: API Consolidation):
 * - /api/v1/dashboard/moderator (dashboard endpoints)
 * - /api/v1/blog/admin/comments (comment moderation)
 * - /api/v1/review/moderation (review moderation)
 *
 * @version 2.0.0
 * @created November 3, 2025
 * @updated November 5, 2025
 * @author MarifetBul Development Team
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { ApiResponse } from '@/types/backend-aligned';
import type { PerformanceMetrics } from '@/hooks/business/moderation/useModeratorPerformance';

// ================================================
// CONSTANTS
// ================================================

/**
 * API Base Path for Moderator Dashboard
 */
const MODERATOR_API_BASE = '/api/v1/dashboard/moderator';

// ================================================
// TYPE DEFINITIONS
// ================================================

/**
 * Moderation Statistics
 * Matches: ModerationStats.java
 */
export interface ModerationStats {
  pendingCommentsCount: number;
  pendingReviewsCount: number;
  pendingReportsCount: number;
  actionsTakenToday: number;
  averageResponseTimeMinutes: number;
  accuracyRate: number;
  totalItemsModerated: number;
  moderatorRank?: string;
}

/**
 * Pending Item Priority
 */
export type PendingItemPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

/**
 * Pending Item Type
 */
export type PendingItemType =
  | 'COMMENT'
  | 'REVIEW'
  | 'REPORT'
  | 'SUPPORT_TICKET'
  | 'USER_PROFILE'
  | 'PACKAGE';

/**
 * Pending Item Status
 */
export type PendingItemStatus = 'PENDING' | 'IN_REVIEW' | 'FLAGGED';

/**
 * Single Pending Item
 * Matches: PendingItemDto.java
 */
export interface PendingItem {
  id: string;
  type: PendingItemType;
  priority: PendingItemPriority;
  status: PendingItemStatus;
  contentPreview: string;
  reporterUsername?: string;
  waitingTimeMinutes: number;
  flagCount?: number;
  relatedEntityId: string;
  submittedAt: string;
  createdAt: string;
}

/**
 * Pending Items Response
 * Matches: PendingItemsResponse.java
 */
export interface PendingItemsResponse {
  items: PendingItem[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Activity Log Action Type
 */
export type ActivityAction =
  | 'APPROVE'
  | 'REJECT'
  | 'MARK_SPAM'
  | 'ISSUE_WARNING'
  | 'SUSPEND_USER'
  | 'RESOLVE_TICKET'
  | 'FLAG_CONTENT';

/**
 * Activity Log Item Type
 */
export type ActivityItemType =
  | 'COMMENT'
  | 'REVIEW'
  | 'REPORT'
  | 'USER'
  | 'TICKET';

/**
 * Activity Log Entry
 * Matches: ActivityLogDto.java
 */
export interface ActivityLog {
  id: string;
  action: ActivityAction;
  itemType: ActivityItemType;
  itemId: string;
  reason?: string;
  performedAt: string;
  moderatorId: string;
  moderatorUsername: string;
  contentPreview?: string;
}

/**
 * Bulk Action Response
 */
export interface BulkActionResponse {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  successfulIds: string[];
  failures: Array<{
    commentId: string;
    errorMessage: string;
    errorCode: string;
  }>;
  action: string;
}

/**
 * Comment Moderation Request
 */
export interface CommentModerationRequest {
  reason?: string;
}

/**
 * Review Moderation Request
 */
export interface ReviewModerationRequest {
  reason?: string;
}

// ================================================
// MODERATOR SERVICE CLASS
// ================================================

class ModeratorService {
  // ==================== DASHBOARD ENDPOINTS ====================

  /**
   * Get moderation statistics
   * GET /api/v1/dashboard/moderator/stats
   *
   * Returns comprehensive dashboard statistics including:
   * - Pending items count
   * - Actions taken today
   * - Average response time
   * - Moderator accuracy rate
   */
  async getStats(): Promise<ApiResponse<ModerationStats>> {
    logger.debug('[ModeratorService] Fetching moderation stats');

    return apiClient.get<ApiResponse<ModerationStats>>(
      `${MODERATOR_API_BASE}/stats`,
      undefined,
      {
        caching: {
          enabled: true,
          ttl: 60000, // 1 minute cache
        },
      }
    );
  }

  /**
   * Get pending moderation items
   * GET /api/v1/dashboard/moderator/pending-items
   *
   * @param page - Page number (0-based, default: 0)
   * @param size - Page size (default: 20, max: 100)
   */
  async getPendingItems(
    page = 0,
    size = 20
  ): Promise<ApiResponse<PendingItemsResponse>> {
    logger.debug('[ModeratorService] Fetching pending items', { page, size });

    return apiClient.get<ApiResponse<PendingItemsResponse>>(
      `${MODERATOR_API_BASE}/pending-items`,
      { page: page.toString(), size: size.toString() },
      {
        caching: {
          enabled: false, // Real-time data
        },
      }
    );
  }

  /**
   * Get recent moderator activity
   * GET /api/v1/dashboard/moderator/recent-activity
   *
   * @param limit - Number of recent activities (default: 20, max: 100)
   */
  async getRecentActivity(limit = 20): Promise<ApiResponse<ActivityLog[]>> {
    logger.debug('[ModeratorService] Fetching recent activity', { limit });

    return apiClient.get<ApiResponse<ActivityLog[]>>(
      `${MODERATOR_API_BASE}/recent-activity`,
      { limit: limit.toString() },
      {
        caching: {
          enabled: true,
          ttl: 30000, // 30 seconds cache
        },
      }
    );
  }

  /**
   * Get moderator performance metrics
   * GET /api/v1/dashboard/moderator/performance
   *
   * @param days - Number of days to analyze (default: 30, max: 90)
   */
  async getPerformanceMetrics(
    days = 30
  ): Promise<ApiResponse<PerformanceMetrics>> {
    logger.debug('[ModeratorService] Fetching performance metrics', { days });

    return apiClient.get<ApiResponse<PerformanceMetrics>>(
      `${MODERATOR_API_BASE}/performance`,
      { days: days.toString() },
      {
        caching: {
          enabled: true,
          ttl: 60000, // 1 minute cache
        },
      }
    );
  }

  // ==================== COMMENT MODERATION ====================

  /**
   * Approve a single comment
   * POST /api/v1/blog/admin/comments/{id}/approve
   *
   * @param commentId - Comment ID to approve
   */
  async approveComment(commentId: string): Promise<ApiResponse<void>> {
    logger.debug('[ModeratorService] Approving comment', { commentId });

    return apiClient.post<ApiResponse<void>>(
      `/api/v1/blog/admin/comments/${commentId}/approve`,
      {},
      {
        caching: { enabled: false },
      }
    );
  }

  /**
   * Reject a single comment
   * POST /api/v1/blog/admin/comments/{id}/reject
   *
   * @param commentId - Comment ID to reject
   * @param reason - Optional rejection reason
   */
  async rejectComment(
    commentId: string,
    reason?: string
  ): Promise<ApiResponse<void>> {
    logger.debug('[ModeratorService] Rejecting comment', { commentId, reason });

    return apiClient.post<ApiResponse<void>>(
      `/api/v1/blog/admin/comments/${commentId}/reject`,
      { reason },
      {
        caching: { enabled: false },
      }
    );
  }

  /**
   * Mark comment as spam
   * POST /api/v1/blog/admin/comments/{id}/spam
   *
   * @param commentId - Comment ID to mark as spam
   */
  async markCommentAsSpam(commentId: string): Promise<ApiResponse<void>> {
    logger.debug('[ModeratorService] Marking comment as spam', { commentId });

    return apiClient.post<ApiResponse<void>>(
      `/api/v1/blog/admin/comments/${commentId}/spam`,
      {},
      {
        caching: { enabled: false },
      }
    );
  }

  /**
   * Escalate a comment to admin/senior moderator
   * POST /api/v1/moderator/comments/{id}/escalate?reason={reason}
   * Sprint 1 - Task 6: Comment Escalation Feature
   *
   * @param commentId - Comment ID to escalate
   * @param reason - Reason for escalation
   */
  async escalateComment(
    commentId: string,
    reason: string
  ): Promise<ApiResponse<void>> {
    logger.debug('[ModeratorService] Escalating comment', { commentId, reason,  });

    // Encode reason as query parameter
    const encodedReason = encodeURIComponent(reason);

    return apiClient.post<ApiResponse<void>>(
      `/api/v1/moderator/comments/${commentId}/escalate?reason=${encodedReason}`,
      {},
      {
        caching: { enabled: false },
      }
    );
  }

  /**
   * Bulk escalate comments
   * POST /api/v1/moderator/comments/bulk/escalate
   * Sprint 1 - Task 6: Comment Escalation Feature
   *
   * @param commentIds - Array of comment IDs to escalate
   * @param reason - Reason for escalation
   */
  async bulkEscalateComments(
    commentIds: string[],
    reason: string
  ): Promise<ApiResponse<BulkActionResponse>> {
    logger.debug('[ModeratorService] Bulk escalating comments', { countcommentIdslength, reason,  });

    return apiClient.post<ApiResponse<BulkActionResponse>>(
      '/api/v1/moderator/comments/bulk/escalate',
      { commentIds, reason },
      {
        caching: { enabled: false },
      }
    );
  }

  /**
   * Bulk approve comments
   * POST /api/v1/blog/admin/comments/bulk/approve
   *
   * @param commentIds - Array of comment IDs to approve
   */
  async bulkApproveComments(
    commentIds: string[]
  ): Promise<ApiResponse<BulkActionResponse>> {
    logger.debug('[ModeratorService] Bulk approving comments', { countcommentIdslength,  });

    return apiClient.post<ApiResponse<BulkActionResponse>>(
      '/api/v1/blog/admin/comments/bulk/approve',
      { commentIds },
      {
        caching: { enabled: false },
      }
    );
  }

  /**
   * Bulk reject comments
   * POST /api/v1/blog/admin/comments/bulk/reject
   *
   * @param commentIds - Array of comment IDs to reject
   * @param reason - Optional rejection reason
   */
  async bulkRejectComments(
    commentIds: string[],
    reason?: string
  ): Promise<ApiResponse<BulkActionResponse>> {
    logger.debug('[ModeratorService] Bulk rejecting comments', { countcommentIdslength, reason,  });

    return apiClient.post<ApiResponse<BulkActionResponse>>(
      '/api/v1/blog/admin/comments/bulk/reject',
      { commentIds, reason },
      {
        caching: { enabled: false },
      }
    );
  }

  /**
   * Bulk mark comments as spam
   * POST /api/v1/blog/admin/comments/bulk/spam
   *
   * @param commentIds - Array of comment IDs to mark as spam
   */
  async bulkMarkCommentsAsSpam(
    commentIds: string[]
  ): Promise<ApiResponse<BulkActionResponse>> {
    logger.debug('[ModeratorService] Bulk marking comments as spam', { countcommentIdslength,  });

    return apiClient.post<ApiResponse<BulkActionResponse>>(
      '/api/v1/blog/admin/comments/bulk/spam',
      { commentIds },
      {
        caching: { enabled: false },
      }
    );
  }

  // ==================== REVIEW MODERATION ====================

  /**
   * Approve a single review
   * POST /api/v1/review/moderation/{reviewId}/approve
   *
   * @param reviewId - Review ID to approve
   */
  async approveReview(reviewId: string): Promise<ApiResponse<void>> {
    logger.debug('[ModeratorService] Approving review', { reviewId });

    return apiClient.post<ApiResponse<void>>(
      `/api/v1/review/moderation/${reviewId}/approve`,
      {},
      {
        caching: { enabled: false },
      }
    );
  }

  /**
   * Reject a single review
   * POST /api/v1/review/moderation/{reviewId}/reject
   *
   * @param reviewId - Review ID to reject
   * @param reason - Optional rejection reason
   */
  async rejectReview(
    reviewId: string,
    reason?: string
  ): Promise<ApiResponse<void>> {
    logger.debug('[ModeratorService] Rejecting review', { reviewId, reason });

    return apiClient.post<ApiResponse<void>>(
      `/api/v1/review/moderation/${reviewId}/reject`,
      { reason },
      {
        caching: { enabled: false },
      }
    );
  }

  /**
   * Bulk approve reviews
   * POST /api/v1/review/moderation/bulk/approve
   *
   * @param reviewIds - Array of review IDs to approve
   */
  async bulkApproveReviews(
    reviewIds: string[]
  ): Promise<ApiResponse<BulkActionResponse>> {
    logger.debug('[ModeratorService] Bulk approving reviews', { countreviewIdslength,  });

    return apiClient.post<ApiResponse<BulkActionResponse>>(
      '/api/v1/review/moderation/bulk/approve',
      { reviewIds },
      {
        caching: { enabled: false },
      }
    );
  }

  /**
   * Bulk reject reviews
   * POST /api/v1/review/moderation/bulk/reject
   *
   * @param reviewIds - Array of review IDs to reject
   * @param reason - Optional rejection reason
   */
  async bulkRejectReviews(
    reviewIds: string[],
    reason?: string
  ): Promise<ApiResponse<BulkActionResponse>> {
    logger.debug('[ModeratorService] Bulk rejecting reviews', { countreviewIdslength, reason,  });

    return apiClient.post<ApiResponse<BulkActionResponse>>(
      '/api/v1/review/moderation/bulk/reject',
      { reviewIds, reason },
      {
        caching: { enabled: false },
      }
    );
  }
}

// ================================================
// SINGLETON EXPORT
// ================================================

export const moderatorService = new ModeratorService();

// Named exports for convenience
export default moderatorService;
