/**
 * ================================================
 * BULK MODERATION API CLIENT
 * ================================================
 * Centralized API client for bulk moderation actions
 * Supports approve, reject, spam, and escalate operations
 *
 * Sprint 3 Day 1: Moderator Dashboard Enhancement
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { logger } from '@/lib/shared/utils/logger';

// ================================================
// TYPES
// ================================================

export interface BulkModerationRequest {
  commentIds: string[];
  reason?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface BulkModerationResponse {
  success: number;
  failed: number;
  total: number;
  errors?: Array<{
    id: string;
    reason: string;
  }>;
}

export interface EscalateRequest {
  commentIds: string[];
  reason: string;
  assignTo?: string; // Admin user ID
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

// ================================================
// API ENDPOINTS
// ================================================

const BULK_MODERATION_ENDPOINTS = {
  BULK_APPROVE: '/api/admin/moderation/bulk/approve',
  BULK_REJECT: '/api/admin/moderation/bulk/reject',
  BULK_SPAM: '/api/admin/moderation/bulk/spam',
  BULK_ESCALATE: '/api/admin/moderation/bulk/escalate',
} as const;

// ================================================
// API FUNCTIONS
// ================================================

/**
 * Bulk approve comments
 * @throws {AuthorizationError} Insufficient permissions
 * @throws {ValidationError} Invalid comment IDs or empty array
 */
export async function bulkApproveComments(
  commentIds: string[]
): Promise<BulkModerationResponse> {
  if (commentIds.length === 0) {
    throw new Error('No comment IDs provided');
  }

  logger.info(`Bulk approving ${commentIds.length} comments`);

  try {
    const response = await apiClient.post<BulkModerationResponse>(
      BULK_MODERATION_ENDPOINTS.BULK_APPROVE,
      { commentIds }
    );

    logger.info(
      `Bulk approve result: ${response.success}/${response.total} successful`
    );

    return response;
  } catch (error) {
    logger.error('Bulk approve failed:', error);
    throw error;
  }
}

/**
 * Bulk reject comments with optional reason
 * @throws {AuthorizationError} Insufficient permissions
 * @throws {ValidationError} Invalid comment IDs or empty array
 */
export async function bulkRejectComments(
  commentIds: string[],
  reason?: string
): Promise<BulkModerationResponse> {
  if (commentIds.length === 0) {
    throw new Error('No comment IDs provided');
  }

  logger.info(
    `Bulk rejecting ${commentIds.length} comments${reason ? ` with reason: ${reason}` : ''}`
  );

  try {
    const response = await apiClient.post<BulkModerationResponse>(
      BULK_MODERATION_ENDPOINTS.BULK_REJECT,
      { commentIds, reason }
    );

    logger.info(
      `Bulk reject result: ${response.success}/${response.total} successful`
    );

    return response;
  } catch (error) {
    logger.error('Bulk reject failed:', error);
    throw error;
  }
}

/**
 * Bulk mark comments as spam
 * @throws {AuthorizationError} Insufficient permissions
 * @throws {ValidationError} Invalid comment IDs or empty array
 */
export async function bulkMarkAsSpam(
  commentIds: string[]
): Promise<BulkModerationResponse> {
  if (commentIds.length === 0) {
    throw new Error('No comment IDs provided');
  }

  logger.info(`Bulk marking ${commentIds.length} comments as spam`);

  try {
    const response = await apiClient.post<BulkModerationResponse>(
      BULK_MODERATION_ENDPOINTS.BULK_SPAM,
      { commentIds }
    );

    logger.info(
      `Bulk spam result: ${response.success}/${response.total} successful`
    );

    return response;
  } catch (error) {
    logger.error('Bulk spam failed:', error);
    throw error;
  }
}

/**
 * Escalate comments to admins for review
 * @throws {AuthorizationError} Insufficient permissions
 * @throws {ValidationError} Invalid comment IDs or missing reason
 */
export async function escalateComments(
  commentIds: string[],
  reason: string,
  priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM',
  assignTo?: string
): Promise<BulkModerationResponse> {
  if (commentIds.length === 0) {
    throw new Error('No comment IDs provided');
  }

  if (!reason || reason.trim().length === 0) {
    throw new Error('Escalation reason is required');
  }

  logger.info(
    `Escalating ${commentIds.length} comments with priority: ${priority}`
  );

  try {
    const response = await apiClient.post<BulkModerationResponse>(
      BULK_MODERATION_ENDPOINTS.BULK_ESCALATE,
      { commentIds, reason, priority, assignTo }
    );

    logger.info(
      `Escalation result: ${response.success}/${response.total} successful`
    );

    return response;
  } catch (error) {
    logger.error('Escalation failed:', error);
    throw error;
  }
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Format bulk action result into user-friendly message
 */
export function formatBulkResult(
  result: BulkModerationResponse,
  action: 'approved' | 'rejected' | 'spam' | 'escalated'
): string {
  const actionPastTense = {
    approved: 'onaylandı',
    rejected: 'reddedildi',
    spam: 'spam olarak işaretlendi',
    escalated: 'yükseltildi',
  };

  if (result.failed === 0) {
    return `${result.success} yorum başarıyla ${actionPastTense[action]}`;
  }

  return `${result.success} yorum ${actionPastTense[action]}, ${result.failed} başarısız`;
}

/**
 * Check if bulk action was successful
 */
export function isBulkActionSuccessful(
  result: BulkModerationResponse
): boolean {
  return result.failed === 0;
}

/**
 * Check if bulk action was partially successful
 */
export function isBulkActionPartial(result: BulkModerationResponse): boolean {
  return result.success > 0 && result.failed > 0;
}

/**
 * Get error summary from bulk action result
 */
export function getBulkErrorSummary(
  result: BulkModerationResponse
): string | null {
  if (!result.errors || result.errors.length === 0) {
    return null;
  }

  const errorCounts = new Map<string, number>();

  result.errors.forEach((err) => {
    const count = errorCounts.get(err.reason) || 0;
    errorCounts.set(err.reason, count + 1);
  });

  const summary: string[] = [];
  errorCounts.forEach((count, reason) => {
    summary.push(`${reason} (${count})`);
  });

  return summary.join(', ');
}

/**
 * Validate comment IDs before bulk action
 */
export function validateCommentIds(commentIds: string[]): {
  valid: boolean;
  error?: string;
} {
  if (!Array.isArray(commentIds)) {
    return { valid: false, error: 'Comment IDs must be an array' };
  }

  if (commentIds.length === 0) {
    return { valid: false, error: 'No comment IDs provided' };
  }

  if (commentIds.length > 100) {
    return {
      valid: false,
      error: 'Too many comments selected (max 100)',
    };
  }

  const invalidIds = commentIds.filter((id) => !id || typeof id !== 'string');
  if (invalidIds.length > 0) {
    return { valid: false, error: 'Some comment IDs are invalid' };
  }

  return { valid: true };
}

/**
 * Split large bulk operations into chunks
 */
export function chunkCommentIds(
  commentIds: string[],
  chunkSize: number = 50
): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < commentIds.length; i += chunkSize) {
    chunks.push(commentIds.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Execute bulk operation in chunks with progress tracking
 */
export async function executeBulkActionInChunks(
  commentIds: string[],
  action: (ids: string[]) => Promise<BulkModerationResponse>,
  onProgress?: (completed: number, total: number) => void
): Promise<BulkModerationResponse> {
  const chunks = chunkCommentIds(commentIds, 50);
  const totalChunks = chunks.length;

  let totalSuccess = 0;
  let totalFailed = 0;
  const allErrors: Array<{ id: string; reason: string }> = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const result = await action(chunk);

    totalSuccess += result.success;
    totalFailed += result.failed;

    if (result.errors) {
      allErrors.push(...result.errors);
    }

    if (onProgress) {
      onProgress(i + 1, totalChunks);
    }

    // Add delay between chunks to prevent rate limiting
    if (i < chunks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return {
    success: totalSuccess,
    failed: totalFailed,
    total: commentIds.length,
    errors: allErrors.length > 0 ? allErrors : undefined,
  };
}
