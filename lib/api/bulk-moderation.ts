/**
 * ================================================
 * BULK MODERATION API CLIENT (DEPRECATED)
 * ================================================
 * @deprecated Use @/lib/services/moderation-service instead
 *
 * This file re-exports from the centralized moderation service.
 * Will be removed in Sprint 2.
 *
 * Migration guide:
 * - Change: import { bulkApproveComments } from '@/lib/api/bulk-moderation'
 * - To:     import { bulkApproveComments } from '@/lib/services/moderation-service'
 *
 * Sprint 1 - Story 1.6: Moderation Logic Consolidation
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

// Re-export types and functions from centralized service
export type {
  BulkModerationRequest,
  BulkModerationResponse,
  ModerationStatus,
  ModerationItemType,
  ModerationActionRequest,
} from '@/lib/services/moderation-service';

export {
  // Comment moderation
  bulkApproveComments,
  bulkRejectComments,
  bulkMarkCommentsAsSpam,

  // Review moderation
  bulkApproveReviews,
  bulkRejectReviews,

  // Unified API
  bulkApprove,
  bulkReject,
  bulkMarkAsSpam,

  // Utilities
  formatBulkResult,
  getSuccessRate,

  // Default export
  moderationService as default,
} from '@/lib/services/moderation-service';

// ================================================
// DEPRECATED TYPES (for backward compatibility)
// ================================================

/**
 * @deprecated Use BulkModerationRequest from moderation-service
 */
export interface EscalateRequest {
  commentIds: string[];
  reason: string;
  assignTo?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

// ================================================
// DEPRECATED UTILITY FUNCTIONS
// ================================================

/**
 * @deprecated Use validateItemIds from moderation-service
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
 * @deprecated Use chunkItems from moderation-service
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
