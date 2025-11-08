/**
 * ================================================
 * UNIFIED MODERATION SERVICE
 * ================================================
 * Centralized moderation service for all content types
 * Consolidates duplicate moderation logic across the codebase
 *
 * Sprint 1 - Story 1.6: Moderation Logic Consolidation
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import * as blogApi from '@/lib/api/blog';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { ApiResponse } from '@/types/infrastructure/api';

// ============================================================================
// TYPES
// ============================================================================

export enum ModerationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SPAM = 'SPAM',
  FLAGGED = 'FLAGGED',
}

export enum ModerationItemType {
  COMMENT = 'COMMENT',
  REVIEW = 'REVIEW',
  REPORT = 'REPORT',
  USER = 'USER',
}

export interface BulkModerationRequest {
  itemIds: string[];
  reason?: string;
  notes?: string;
}

export interface BulkModerationResponse {
  totalRequested: number;
  successCount: number;
  failureCount: number;
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED';
  successfulIds?: string[];
  errors?: Array<{
    itemId: string;
    error: string;
  }>;
}

export interface ModerationActionRequest {
  reason?: string;
  notes?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// ============================================================================
// COMMENT MODERATION
// ============================================================================

/**
 * Approve a single comment
 * POST /api/v1/blog/admin/comments/{id}/approve
 */
export async function approveComment(commentId: string): Promise<void> {
  logger.debug('[ModerationService] Approving comment', { commentId });

  await apiClient.post(`/api/v1/blog/admin/comments/${commentId}/approve`, {});
}

/**
 * Reject a single comment
 * POST /api/v1/blog/admin/comments/{id}/reject
 */
export async function rejectComment(
  commentId: string,
  reason?: string
): Promise<void> {
  logger.debug('[ModerationService] Rejecting comment', { commentId, reason });

  await apiClient.post(`/api/v1/blog/admin/comments/${commentId}/reject`, {
    reason,
  });
}

/**
 * Mark comment as spam
 * POST /api/v1/blog/admin/comments/{id}/spam
 */
export async function markCommentAsSpam(commentId: string): Promise<void> {
  logger.debug('[ModerationService] Marking comment as spam', { commentId });

  await apiClient.post(`/api/v1/blog/admin/comments/${commentId}/spam`, {});
}

/**
 * Bulk approve comments
 * POST /api/v1/blog/admin/comments/bulk/approve
 */
export async function bulkApproveComments(
  commentIds: string[]
): Promise<BulkModerationResponse> {
  logger.info('[ModerationService] Bulk approving comments', {
    count: commentIds.length,
  });

  const response = await apiClient.post<ApiResponse<BulkModerationResponse>>(
    '/api/v1/blog/admin/comments/bulk/approve',
    { commentIds }
  );

  return response.data;
}

/**
 * Bulk reject comments
 * POST /api/v1/blog/admin/comments/bulk/reject
 */
export async function bulkRejectComments(
  commentIds: string[],
  reason?: string
): Promise<BulkModerationResponse> {
  logger.info('[ModerationService] Bulk rejecting comments', {
    count: commentIds.length,
    reason,
  });

  const response = await apiClient.post<ApiResponse<BulkModerationResponse>>(
    '/api/v1/blog/admin/comments/bulk/reject',
    { commentIds, reason }
  );

  return response.data;
}

/**
 * Bulk mark comments as spam
 * POST /api/v1/blog/admin/comments/bulk/spam
 */
export async function bulkMarkCommentsAsSpam(
  commentIds: string[]
): Promise<BulkModerationResponse> {
  logger.info('[ModerationService] Bulk marking comments as spam', {
    count: commentIds.length,
  });

  const response = await apiClient.post<ApiResponse<BulkModerationResponse>>(
    '/api/v1/blog/admin/comments/bulk/spam',
    { commentIds }
  );

  return response.data;
}

// ============================================================================
// REVIEW MODERATION
// ============================================================================

/**
 * Approve a single review
 * POST /api/v1/reviews/moderation/{reviewId}/approve
 */
export async function approveReview(reviewId: string): Promise<void> {
  logger.debug('[ModerationService] Approving review', { reviewId });

  await apiClient.post(`/api/v1/reviews/moderation/${reviewId}/approve`, {});
}

/**
 * Reject a single review
 * POST /api/v1/reviews/moderation/{reviewId}/reject
 */
export async function rejectReview(
  reviewId: string,
  reason?: string
): Promise<void> {
  logger.debug('[ModerationService] Rejecting review', { reviewId, reason });

  const url = reason
    ? `/api/v1/reviews/moderation/${reviewId}/reject?reason=${encodeURIComponent(reason)}`
    : `/api/v1/reviews/moderation/${reviewId}/reject`;

  await apiClient.post(url, {});
}

/**
 * Bulk approve reviews
 * POST /api/v1/reviews/moderation/bulk/approve
 */
export async function bulkApproveReviews(
  reviewIds: string[]
): Promise<BulkModerationResponse> {
  logger.info('[ModerationService] Bulk approving reviews', {
    count: reviewIds.length,
  });

  const response = await apiClient.post<ApiResponse<BulkModerationResponse>>(
    '/api/v1/reviews/moderation/bulk/approve',
    { reviewIds }
  );

  return response.data;
}

/**
 * Bulk reject reviews
 * POST /api/v1/reviews/moderation/bulk/reject
 */
export async function bulkRejectReviews(
  reviewIds: string[],
  reason?: string
): Promise<BulkModerationResponse> {
  logger.info('[ModerationService] Bulk rejecting reviews', {
    count: reviewIds.length,
    reason,
  });

  const response = await apiClient.post<ApiResponse<BulkModerationResponse>>(
    '/api/v1/reviews/moderation/bulk/reject',
    { reviewIds, reason }
  );

  return response.data;
}

// ============================================================================
// UNIFIED BULK MODERATION (NEW - Unified API)
// ============================================================================

/**
 * Unified bulk approve (supports both comments and reviews)
 * POST /api/v1/moderation/{type}/bulk/approve
 */
export async function bulkApprove(
  type: ModerationItemType,
  itemIds: string[]
): Promise<BulkModerationResponse> {
  const endpoint = getModerationEndpoint(type, 'approve');

  logger.info('[ModerationService] Bulk approve', {
    type,
    count: itemIds.length,
  });

  const response = await apiClient.post<ApiResponse<BulkModerationResponse>>(
    endpoint,
    { itemIds }
  );

  return response.data;
}

/**
 * Unified bulk reject (supports both comments and reviews)
 * POST /api/v1/moderation/{type}/bulk/reject
 */
export async function bulkReject(
  type: ModerationItemType,
  itemIds: string[],
  reason?: string
): Promise<BulkModerationResponse> {
  const endpoint = getModerationEndpoint(type, 'reject');

  logger.info('[ModerationService] Bulk reject', {
    type,
    count: itemIds.length,
    reason,
  });

  const response = await apiClient.post<ApiResponse<BulkModerationResponse>>(
    endpoint,
    { itemIds, reason }
  );

  return response.data;
}

/**
 * Unified bulk spam (supports both comments and reviews)
 * POST /api/v1/moderation/{type}/bulk/spam
 */
export async function bulkMarkAsSpam(
  type: ModerationItemType,
  itemIds: string[]
): Promise<BulkModerationResponse> {
  const endpoint = getModerationEndpoint(type, 'spam');

  logger.info('[ModerationService] Bulk mark as spam', {
    type,
    count: itemIds.length,
  });

  const response = await apiClient.post<ApiResponse<BulkModerationResponse>>(
    endpoint,
    { itemIds }
  );

  return response.data;
}

/**
 * Bulk escalate comments to admin
 * Sprint 1 - EPIC 2: Bulk Moderation Operations
 * POST /blog/admin/comments/bulk/escalate
 */
export async function bulkEscalateComments(
  itemIds: string[],
  reason: string,
  priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
): Promise<BulkModerationResponse> {
  logger.info('[ModerationService] Bulk escalate comments', {
    count: itemIds.length,
    priority,
  });

  const commentIds = itemIds.map((id) => Number(id));
  const response = await blogApi.bulkEscalateComments(
    commentIds,
    reason,
    priority
  );

  // Transform blog API response to BulkModerationResponse
  return {
    status:
      response.failureCount === 0
        ? 'SUCCESS'
        : response.successCount === 0
          ? 'FAILED'
          : 'PARTIAL_SUCCESS',
    totalRequested: response.successCount + response.failureCount,
    successCount: response.successCount,
    failureCount: response.failureCount,
    errors: response.failures?.map((f) => ({
      itemId: String(f.commentId),
      error: f.errorMessage,
    })),
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get moderation endpoint based on type and action
 */
function getModerationEndpoint(
  type: ModerationItemType,
  action: 'approve' | 'reject' | 'spam'
): string {
  const typeEndpoint =
    type === ModerationItemType.COMMENT ? 'comments' : 'reviews';
  return `/api/v1/moderation/${typeEndpoint}/bulk/${action}`;
}

/**
 * Format bulk moderation result message
 */
export function formatBulkResult(result: BulkModerationResponse): string {
  if (result.status === 'SUCCESS') {
    return `✅ ${result.successCount} öğe başarıyla işlendi`;
  }
  if (result.status === 'FAILED') {
    return `❌ Tüm işlemler başarısız (${result.failureCount} hata)`;
  }
  return `⚠️ ${result.successCount} başarılı, ${result.failureCount} başarısız`;
}

/**
 * Calculate success rate percentage
 */
export function getSuccessRate(result: BulkModerationResponse): number {
  if (result.totalRequested === 0) return 0;
  return Math.round((result.successCount / result.totalRequested) * 100);
}

// ============================================================================
// EXPORT MODERATION SERVICE
// ============================================================================

export const moderationService = {
  // Comment moderation
  approveComment,
  rejectComment,
  markCommentAsSpam,
  bulkApproveComments,
  bulkRejectComments,
  bulkMarkCommentsAsSpam,

  // Review moderation
  approveReview,
  rejectReview,
  bulkApproveReviews,
  bulkRejectReviews,

  // Unified API
  bulkApprove,
  bulkReject,
  bulkMarkAsSpam,
  bulkEscalateComments,

  // Utilities
  formatBulkResult,
  getSuccessRate,
};

export default moderationService;
