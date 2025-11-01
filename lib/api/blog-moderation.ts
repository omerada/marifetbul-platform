/**
 * ================================================
 * BLOG MODERATION API CLIENT
 * ================================================
 * API client for blog comment moderation
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2: Moderation System
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import type {
  BlogCommentResponse,
  PageResponse,
  CommentStatus,
} from '@/types/backend-aligned';
import { BLOG_ENDPOINTS } from './endpoints';

// ================================================
// TYPES
// ================================================

export interface CommentFilters {
  status?: CommentStatus | CommentStatus[];
  postId?: string;
  userId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface BulkActionRequest {
  commentIds: string[];
  reason?: string;
}

export interface BulkActionResponse {
  success: number;
  failed: number;
  errors?: Array<{
    commentId: string;
    error: string;
  }>;
}

export interface ModerationStats {
  pending: number;
  approved: number;
  rejected: number;
  spam: number;
  total: number;
}

// ================================================
// COMMENT MODERATION API
// ================================================

/**
 * Get pending comments for moderation
 * @throws {AuthorizationError} Insufficient permissions
 */
export async function getPendingComments(
  filters?: CommentFilters
): Promise<PageResponse<BlogCommentResponse>> {
  const params = new URLSearchParams();

  if (filters?.page !== undefined) {
    params.set('page', filters.page.toString());
  }

  if (filters?.size !== undefined) {
    params.set('size', filters.size.toString());
  }

  if (filters?.sort) {
    params.set('sort', filters.sort);
  }

  if (filters?.postId) {
    params.set('postId', filters.postId);
  }

  if (filters?.search) {
    params.set('search', filters.search);
  }

  const queryString = params.toString();
  const url = `${BLOG_ENDPOINTS.GET_PENDING_COMMENTS}${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<PageResponse<BlogCommentResponse>>(url);
}

/**
 * Get comments by status
 * @throws {AuthorizationError} Insufficient permissions
 */
export async function getCommentsByStatus(
  filters: CommentFilters
): Promise<PageResponse<BlogCommentResponse>> {
  const params = new URLSearchParams();

  if (filters.status) {
    if (Array.isArray(filters.status)) {
      filters.status.forEach((s) => params.append('status', s));
    } else {
      params.set('status', filters.status);
    }
  }

  if (filters.postId) {
    params.set('postId', filters.postId);
  }

  if (filters.userId) {
    params.set('userId', filters.userId);
  }

  if (filters.search) {
    params.set('search', filters.search);
  }

  if (filters.startDate) {
    params.set('startDate', filters.startDate);
  }

  if (filters.endDate) {
    params.set('endDate', filters.endDate);
  }

  if (filters.page !== undefined) {
    params.set('page', filters.page.toString());
  }

  if (filters.size !== undefined) {
    params.set('size', filters.size.toString());
  }

  if (filters.sort) {
    params.set('sort', filters.sort);
  }

  const queryString = params.toString();
  const url = `${BLOG_ENDPOINTS.GET_COMMENTS_BY_STATUS}${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<PageResponse<BlogCommentResponse>>(url);
}

/**
 * Approve a comment
 * @throws {NotFoundError} Comment not found
 * @throws {AuthorizationError} Insufficient permissions
 */
export async function approveComment(
  commentId: string
): Promise<BlogCommentResponse> {
  return apiClient.post<BlogCommentResponse>(
    BLOG_ENDPOINTS.APPROVE_COMMENT(commentId)
  );
}

/**
 * Reject a comment with optional reason
 * @throws {NotFoundError} Comment not found
 * @throws {AuthorizationError} Insufficient permissions
 */
export async function rejectComment(
  commentId: string,
  reason?: string
): Promise<void> {
  return apiClient.post<void>(BLOG_ENDPOINTS.REJECT_COMMENT(commentId), {
    reason,
  });
}

/**
 * Mark a comment as spam
 * @throws {NotFoundError} Comment not found
 * @throws {AuthorizationError} Insufficient permissions
 */
export async function markCommentAsSpam(commentId: string): Promise<void> {
  return apiClient.post<void>(BLOG_ENDPOINTS.SPAM_COMMENT(commentId));
}

/**
 * Bulk approve comments
 * @throws {AuthorizationError} Insufficient permissions
 * @throws {ValidationError} Invalid comment IDs
 */
export async function bulkApproveComments(
  commentIds: string[]
): Promise<BulkActionResponse> {
  return apiClient.post<BulkActionResponse>(
    BLOG_ENDPOINTS.BULK_APPROVE_COMMENTS,
    { commentIds }
  );
}

/**
 * Bulk reject comments
 * @throws {AuthorizationError} Insufficient permissions
 * @throws {ValidationError} Invalid comment IDs
 */
export async function bulkRejectComments(
  commentIds: string[],
  reason?: string
): Promise<BulkActionResponse> {
  return apiClient.post<BulkActionResponse>(
    BLOG_ENDPOINTS.BULK_REJECT_COMMENTS,
    { commentIds, reason }
  );
}

/**
 * Bulk mark comments as spam
 * @throws {AuthorizationError} Insufficient permissions
 * @throws {ValidationError} Invalid comment IDs
 */
export async function bulkMarkSpam(
  commentIds: string[]
): Promise<BulkActionResponse> {
  return apiClient.post<BulkActionResponse>(BLOG_ENDPOINTS.BULK_SPAM_COMMENTS, {
    commentIds,
  });
}

/**
 * Get user's comments (for moderation)
 * @throws {NotFoundError} User not found
 * @throws {AuthorizationError} Insufficient permissions
 */
export async function getUserComments(
  userId: string,
  filters?: Omit<CommentFilters, 'userId'>
): Promise<PageResponse<BlogCommentResponse>> {
  const params = new URLSearchParams();

  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      filters.status.forEach((s) => params.append('status', s));
    } else {
      params.set('status', filters.status);
    }
  }

  if (filters?.page !== undefined) {
    params.set('page', filters.page.toString());
  }

  if (filters?.size !== undefined) {
    params.set('size', filters.size.toString());
  }

  if (filters?.sort) {
    params.set('sort', filters.sort);
  }

  const queryString = params.toString();
  const url = `${BLOG_ENDPOINTS.GET_USER_COMMENTS(userId)}${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<PageResponse<BlogCommentResponse>>(url);
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Get comment status label in Turkish
 */
export function getCommentStatusLabel(status: CommentStatus): string {
  const labels: Record<CommentStatus, string> = {
    PENDING: 'Beklemede',
    APPROVED: 'Onaylandı',
    REJECTED: 'Reddedildi',
    SPAM: 'Spam',
  };

  return labels[status] || status;
}

/**
 * Get comment status color
 */
export function getCommentStatusColor(status: CommentStatus): string {
  const colors: Record<CommentStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    SPAM: 'bg-gray-100 text-gray-700',
  };

  return colors[status] || 'bg-gray-100 text-gray-700';
}

/**
 * Format bulk action result message
 */
export function formatBulkActionResult(result: BulkActionResponse): string {
  if (result.failed === 0) {
    return `${result.success} yorum başarıyla işlendi`;
  }

  return `${result.success} yorum işlendi, ${result.failed} başarısız`;
}

/**
 * Check if comment can be moderated
 */
export function canModerateComment(comment: BlogCommentResponse): boolean {
  return comment.status === 'PENDING';
}

/**
 * Get rejection reason options
 */
export const REJECTION_REASONS = [
  { value: 'INAPPROPRIATE', label: 'Uygunsuz içerik' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'OFF_TOPIC', label: 'Konu dışı' },
  { value: 'PROFANITY', label: 'Küfür/Hakaret' },
  { value: 'DUPLICATE', label: 'Tekrarlayan yorum' },
  { value: 'OTHER', label: 'Diğer' },
] as const;

export type RejectionReason = (typeof REJECTION_REASONS)[number]['value'];
