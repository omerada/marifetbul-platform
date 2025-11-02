/**
 * ================================================
 * MODERATOR DASHBOARD API TYPES
 * ================================================
 * TypeScript type definitions for Moderator Dashboard API responses
 * Mapped from Spring Boot DTOs
 *
 * Backend DTOs:
 * - ModerationStats.java (main DTO)
 * - PendingItemsResponse.java
 * - ActivityLogDto.java
 *
 * Backend Endpoint: GET /api/v1/moderator/stats
 *
 * Sprint 1 - Day 4: Dashboard Data Transformation
 * Task: T-110 - Moderator API Schema Types
 *
 * @created 2025-11-02
 * @author MarifetBul Development Team
 */

// ============================================================================
// MODERATION STATS (Main DTO)
// ============================================================================

/**
 * Aggregated statistics for moderator dashboard
 * Backend: ModerationStats.java
 */
export interface ModerationStatsDto {
  // ========== COMMENT STATISTICS ==========
  /**
   * Total pending blog comments awaiting moderation
   */
  pendingComments: number;

  /**
   * Total flagged/reported comments
   */
  flaggedComments: number;

  /**
   * Comments approved today by this moderator
   */
  commentsApprovedToday: number;

  /**
   * Comments rejected today by this moderator
   */
  commentsRejectedToday: number;

  // ========== REVIEW STATISTICS ==========
  /**
   * Total pending reviews awaiting moderation
   */
  pendingReviews: number;

  /**
   * Total flagged reviews
   */
  flaggedReviews: number;

  /**
   * Reviews approved today by this moderator
   */
  reviewsApprovedToday: number;

  /**
   * Reviews rejected today by this moderator
   */
  reviewsRejectedToday: number;

  // ========== REPORT STATISTICS ==========
  /**
   * Total pending reports (user reports, content reports)
   */
  pendingReports: number;

  /**
   * Reports resolved today by this moderator
   */
  reportsResolvedToday: number;

  // ========== SUPPORT TICKET STATISTICS ==========
  /**
   * Total pending support tickets awaiting response
   */
  pendingSupportTickets: number;

  /**
   * Support tickets closed today by this moderator
   */
  ticketsClosedToday: number;

  // ========== OVERALL STATISTICS ==========
  /**
   * Total pending items across all categories
   * Calculated from all pending counts
   */
  totalPendingItems: number;

  /**
   * Total actions taken today by this moderator
   * Calculated from all "today" actions
   */
  totalActionsToday: number;

  /**
   * Average response time in minutes
   * Time from item submission to first moderation action
   */
  averageResponseTimeMinutes: number;

  /**
   * Moderator accuracy rate
   * (approved items / total items reviewed)
   * Value between 0.0 and 1.0
   */
  accuracyRate: number;
}

// ============================================================================
// PENDING ITEMS
// ============================================================================

/**
 * Action types for moderator activity logs
 * Backend: ActivityLogDto.ActionType enum
 */
export type ModeratorActionType =
  | 'APPROVE'
  | 'REJECT'
  | 'SPAM'
  | 'RESOLVE'
  | 'CLOSE'
  | 'WARN'
  | 'BAN'
  | 'BULK_APPROVE'
  | 'BULK_REJECT'
  | 'BULK_SPAM';

/**
 * Target types for moderation items
 */
export type ModerationTargetType =
  | 'COMMENT'
  | 'REVIEW'
  | 'REPORT'
  | 'TICKET'
  | 'USER';

/**
 * Priority levels for moderation items
 */
export type ModerationPriority = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Status of moderation items
 */
export type ModerationItemStatus = 'PENDING' | 'FLAGGED' | 'RESOLVED';

/**
 * Single pending moderation item
 * Backend: PendingItemDto.java
 */
export interface PendingItemDto {
  /**
   * Item ID
   */
  itemId: string;

  /**
   * Item type (COMMENT, REVIEW, REPORT, TICKET)
   */
  itemType: ModerationTargetType;

  /**
   * Item content/description
   */
  content: string;

  /**
   * Author/reporter user ID
   */
  authorId: string;

  /**
   * Author/reporter username
   */
  authorName: string;

  /**
   * When the item was submitted
   */
  submittedAt: string;

  /**
   * Priority level
   */
  priority: ModerationPriority;

  /**
   * Current status
   */
  status: ModerationItemStatus;

  /**
   * Waiting time in minutes
   */
  waitingTimeMinutes: number;

  /**
   * Flag count (if flagged by multiple users)
   */
  flagCount: number;

  /**
   * Related entity ID (e.g., blog post ID for comment)
   */
  relatedEntityId?: string;

  /**
   * Related entity title
   */
  relatedEntityTitle?: string;
}

/**
 * Paginated response for pending moderation items
 * Backend: PendingItemsResponse.java
 */
export interface PendingItemsResponse {
  /**
   * List of pending items
   */
  items: PendingItemDto[];

  /**
   * Total count of pending items
   */
  totalCount: number;

  /**
   * Current page number (0-based)
   */
  currentPage: number;

  /**
   * Page size
   */
  pageSize: number;

  /**
   * Total pages
   */
  totalPages: number;

  /**
   * Has next page
   */
  hasNext: boolean;

  /**
   * Has previous page
   */
  hasPrevious: boolean;
}

// ============================================================================
// ACTIVITY LOG
// ============================================================================

/**
 * Single moderator activity log entry
 * Backend: ActivityLogDto.java
 */
export interface ActivityLogDto {
  /**
   * Activity ID
   */
  activityId: string;

  /**
   * Moderator ID who performed the action
   */
  moderatorId: string;

  /**
   * Moderator name
   */
  moderatorName: string;

  /**
   * Action type
   */
  actionType: ModeratorActionType;

  /**
   * Target item type
   */
  targetType: string;

  /**
   * Target item ID
   */
  targetId: string;

  /**
   * Action description (human-readable)
   */
  description: string;

  /**
   * Reason/notes (if applicable)
   */
  reason: string | null;

  /**
   * Timestamp of the action
   */
  timestamp: string;

  /**
   * Related user (affected user)
   */
  affectedUserId: string | null;

  /**
   * Related user name
   */
  affectedUserName: string | null;
}

/**
 * Recent activities response
 * Backend: List<ActivityLogDto>
 */
export interface RecentActivitiesResponse {
  activities: ActivityLogDto[];
  totalCount: number;
}

// ============================================================================
// COMPLETE API RESPONSE
// ============================================================================

/**
 * Complete Moderator Dashboard API Response
 * Combines stats, pending items, and recent activities
 *
 * Backend Endpoints:
 * - GET /api/v1/moderator/stats → ModerationStats
 * - GET /api/v1/moderator/pending-items → PendingItemsResponse
 * - GET /api/v1/moderator/activities → RecentActivitiesResponse
 *
 * Note: Unlike Admin/Seller/Buyer dashboards, Moderator data
 * comes from MULTIPLE endpoints. This interface represents the
 * COMBINED response after fetching from all endpoints.
 */
export interface ModeratorDashboardApiResponse {
  /**
   * Aggregated moderation statistics
   */
  stats: ModerationStatsDto;

  /**
   * Pending items queue (first page)
   */
  pendingItems: PendingItemsResponse;

  /**
   * Recent activities (last 20 actions)
   */
  recentActivities: RecentActivitiesResponse;

  /**
   * Moderator info
   */
  moderatorId: string;
  moderatorName: string;

  /**
   * Timestamp when data was fetched
   */
  generatedAt: string;

  /**
   * Whether data came from cache
   */
  fromCache: boolean;

  /**
   * Cache age in seconds (0 if not cached)
   */
  cacheAgeSeconds: number;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for ModerationStatsDto
 */
export function isModerationStatsDto(
  value: unknown
): value is ModerationStatsDto {
  if (!value || typeof value !== 'object') return false;

  const stats = value as Record<string, unknown>;

  return (
    typeof stats.pendingComments === 'number' &&
    typeof stats.flaggedComments === 'number' &&
    typeof stats.commentsApprovedToday === 'number' &&
    typeof stats.commentsRejectedToday === 'number' &&
    typeof stats.pendingReviews === 'number' &&
    typeof stats.flaggedReviews === 'number' &&
    typeof stats.reviewsApprovedToday === 'number' &&
    typeof stats.reviewsRejectedToday === 'number' &&
    typeof stats.pendingReports === 'number' &&
    typeof stats.reportsResolvedToday === 'number' &&
    typeof stats.pendingSupportTickets === 'number' &&
    typeof stats.ticketsClosedToday === 'number' &&
    typeof stats.totalPendingItems === 'number' &&
    typeof stats.totalActionsToday === 'number' &&
    typeof stats.averageResponseTimeMinutes === 'number' &&
    typeof stats.accuracyRate === 'number'
  );
}

/**
 * Type guard for PendingItemDto
 */
export function isPendingItemDto(value: unknown): value is PendingItemDto {
  if (!value || typeof value !== 'object') return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.itemId === 'string' &&
    typeof item.itemType === 'string' &&
    typeof item.content === 'string' &&
    typeof item.authorId === 'string' &&
    typeof item.authorName === 'string' &&
    typeof item.submittedAt === 'string' &&
    typeof item.priority === 'string' &&
    typeof item.status === 'string' &&
    typeof item.waitingTimeMinutes === 'number' &&
    typeof item.flagCount === 'number'
  );
}

/**
 * Type guard for PendingItemsResponse
 */
export function isPendingItemsResponse(
  value: unknown
): value is PendingItemsResponse {
  if (!value || typeof value !== 'object') return false;

  const response = value as Record<string, unknown>;

  return (
    Array.isArray(response.items) &&
    typeof response.totalCount === 'number' &&
    typeof response.currentPage === 'number' &&
    typeof response.pageSize === 'number' &&
    typeof response.totalPages === 'number' &&
    typeof response.hasNext === 'boolean' &&
    typeof response.hasPrevious === 'boolean'
  );
}

/**
 * Type guard for ActivityLogDto
 */
export function isActivityLogDto(value: unknown): value is ActivityLogDto {
  if (!value || typeof value !== 'object') return false;

  const log = value as Record<string, unknown>;

  return (
    typeof log.activityId === 'string' &&
    typeof log.moderatorId === 'string' &&
    typeof log.moderatorName === 'string' &&
    typeof log.actionType === 'string' &&
    typeof log.targetType === 'string' &&
    typeof log.targetId === 'string' &&
    typeof log.description === 'string' &&
    typeof log.timestamp === 'string'
  );
}

/**
 * Type guard for complete ModeratorDashboardApiResponse
 */
export function isModeratorDashboardApiResponse(
  value: unknown
): value is ModeratorDashboardApiResponse {
  if (!value || typeof value !== 'object') return false;

  const response = value as Record<string, unknown>;

  return (
    isModerationStatsDto(response.stats) &&
    isPendingItemsResponse(response.pendingItems) &&
    typeof response.moderatorId === 'string' &&
    typeof response.moderatorName === 'string' &&
    typeof response.generatedAt === 'string' &&
    typeof response.fromCache === 'boolean' &&
    typeof response.cacheAgeSeconds === 'number'
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  ModerationStatsDto as ModerationStats,
  PendingItemDto as PendingItem,
  ActivityLogDto as ActivityLog,
};
