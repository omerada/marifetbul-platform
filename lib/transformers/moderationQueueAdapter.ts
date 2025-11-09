/**
 * ================================================
 * MODERATION QUEUE ADAPTER
 * ================================================
 * Adapts new ModerationQueueItem format to legacy PendingItem format
 * Ensures backward compatibility with existing components
 *
 * SPRINT 1 - STORY 2: Backend Integration
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created November 9, 2025
 */

import {
  type ModerationQueueItem,
  type PendingItem,
  PendingItemType,
  Priority,
  ModerationItemStatus,
} from '@/types/business/moderation';

/**
 * Convert backend ModerationQueueItem to frontend PendingItem
 * Provides backward compatibility for existing components
 *
 * @param queueItem - Item from new queue API
 * @returns PendingItem compatible with legacy components
 */
export function adaptQueueItemToPendingItem(
  queueItem: ModerationQueueItem
): PendingItem {
  // Map type strings
  const itemType = mapTypeToLegacyType(queueItem.type);

  // Map priority strings
  const priority = mapPriorityToLegacyPriority(queueItem.priority);

  // Map status strings
  const status = mapStatusToLegacyStatus(queueItem.status);

  // Calculate waiting time (minutes since creation)
  const createdDate = new Date(queueItem.createdAt);
  const now = new Date();
  const waitingTimeMinutes = Math.floor(
    (now.getTime() - createdDate.getTime()) / (1000 * 60)
  );

  return {
    itemId: queueItem.id,
    itemType,
    content: queueItem.content,
    authorId: queueItem.authorId,
    authorName: queueItem.authorName,
    submittedAt: queueItem.createdAt,
    priority,
    status,
    waitingTimeMinutes,
    flagCount: queueItem.reportCount,
    flagReasons: queueItem.flagReason ? [queueItem.flagReason] : undefined,
    contentPreview: queueItem.content,
  };
}

/**
 * Convert array of ModerationQueueItem to array of PendingItem
 *
 * @param queueItems - Items from new queue API
 * @returns Array of PendingItem compatible with legacy components
 */
export function adaptQueueItemsToPendingItems(
  queueItems: ModerationQueueItem[]
): PendingItem[] {
  return queueItems.map(adaptQueueItemToPendingItem);
}

// ============================================================================
// MAPPING FUNCTIONS
// ============================================================================

/**
 * Map backend type string to frontend PendingItemType enum
 */
function mapTypeToLegacyType(type: string): PendingItemType {
  const normalized = type.toUpperCase();
  switch (normalized) {
    case 'COMMENT':
      return PendingItemType.COMMENT;
    case 'REVIEW':
      return PendingItemType.REVIEW;
    case 'REPORT':
      return PendingItemType.REPORT;
    default:
      // Default to COMMENT for unknown types
      return PendingItemType.COMMENT;
  }
}

/**
 * Map backend priority string to frontend Priority enum
 */
function mapPriorityToLegacyPriority(priority: string): Priority {
  const normalized = priority.toUpperCase();
  switch (normalized) {
    case 'HIGH':
      return Priority.HIGH;
    case 'MEDIUM':
      return Priority.MEDIUM;
    case 'LOW':
      return Priority.LOW;
    case 'CRITICAL':
      return Priority.CRITICAL;
    default:
      return Priority.MEDIUM;
  }
}

/**
 * Map backend status string to frontend ModerationItemStatus enum
 */
function mapStatusToLegacyStatus(status: string): ModerationItemStatus {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case 'PENDING':
      return ModerationItemStatus.PENDING;
    case 'IN_REVIEW':
    case 'UNDER_REVIEW':
      return ModerationItemStatus.IN_REVIEW;
    case 'APPROVED':
      return ModerationItemStatus.APPROVED;
    case 'REJECTED':
      return ModerationItemStatus.REJECTED;
    case 'ESCALATED':
      return ModerationItemStatus.ESCALATED;
    case 'SPAM':
      return ModerationItemStatus.SPAM;
    case 'FLAGGED':
      // Map FLAGGED to PENDING (both need moderation)
      return ModerationItemStatus.PENDING;
    default:
      return ModerationItemStatus.PENDING;
  }
}
