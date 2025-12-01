/**
 * ================================================
 * MODERATION TYPES
 * ================================================
 * Types for content moderation system
 *
 * Sprint: Moderator Dashboard Implementation
 * @version 2.0.0
 * @author MarifetBul Development Team
 * @updated November 1, 2025
 */

/**
 * Moderation statistics for dashboard
 *
 * SPRINT 1 - STORY 1: Updated to match ModerationStatsResponse from backend
 * Backend DTO: ModerationStatsResponse.java
 * Endpoint: GET /api/v1/moderation/stats
 *
 * @version 2.0.0 - Production Ready
 */
export interface ModerationStats {
  // Pending Counts
  pendingReviews: number;
  pendingComments: number;
  pendingReports: number;
  flaggedItems: number;

  // Daily Action Counts
  commentsApprovedToday: number;
  commentsRejectedToday: number;

  // Resolution Metrics
  resolvedToday: number;
  resolvedThisWeek: number;
  resolvedThisMonth: number;
  averageResolutionTimeMinutes: number;

  // Moderator Metrics
  totalModeratorsActive: number;

  // Performance Metrics
  performance: {
    actionsToday: number;
    actionsThisWeek: number;
    actionsThisMonth: number;
    averageActionTimeMinutes: number;
    accuracyRate: number;
  };
}

/**
 * Pending item types
 */
export enum PendingItemType {
  COMMENT = 'COMMENT',
  REVIEW = 'REVIEW',
  REPORT = 'REPORT',
  SUPPORT_TICKET = 'SUPPORT_TICKET',
  PACKAGE_APPROVAL = 'PACKAGE_APPROVAL',
  USER_VERIFICATION = 'USER_VERIFICATION',
}

/**
 * Priority levels
 */
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Moderation item status
 */
export enum ModerationItemStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
  SPAM = 'SPAM',
}

/**
 * View modes for moderation cards
 * Used by both UnifiedCommentModerationCard and UnifiedReviewModerationCard
 */
export type ViewMode = 'compact' | 'card' | 'detailed';

/**
 * User roles for moderation interface
 * Determines action availability and UI behavior
 */
export type UserRole = 'admin' | 'moderator';

/**
 * SPRINT 1 - STORY 2: Moderation Queue Item
 * Backend DTO: ModerationQueueItemResponse.java
 * Endpoint: GET /api/v1/moderation/queue
 *
 * Represents a single item in the moderation queue
 * Can be a Review, Comment, or Report
 *
 * @version 1.0.0
 */
export interface ModerationQueueItem {
  /** Unique identifier (UUID) */
  id: string;

  /** Item type: 'REVIEW' | 'COMMENT' | 'REPORT' */
  type: string;

  /** Content preview (max 100 chars + "...") */
  content: string;

  /** Name of the person who created the item */
  authorName: string;

  /** Author's user ID (UUID) */
  authorId: string;

  /** Priority: 'HIGH' | 'MEDIUM' | 'LOW' */
  priority: string;

  /** Current status (e.g., 'PENDING', 'FLAGGED', 'UNDER_REVIEW') */
  status: string;

  /** Creation timestamp (ISO string) */
  createdAt: string;

  /** Flag/escalation reason (nullable) */
  flagReason: string | null;

  /** Number of reports/flags */
  reportCount: number;
}

/**
 * Pending moderation item (Frontend representation)
 * Maps from backend PendingItemDto
 */
export interface PendingItem {
  /** Unique item identifier */
  itemId: string;

  /** Type of content being moderated */
  itemType: PendingItemType;

  /** Content text or description */
  content: string;

  /** Author user ID */
  authorId: string;

  /** Author display name */
  authorName: string;

  /** When item was submitted (ISO string) */
  submittedAt: string;

  /** Priority level */
  priority: Priority;

  /** Current moderation status */
  status: ModerationItemStatus;

  /** How long item has been waiting (minutes) */
  waitingTimeMinutes: number;

  /** Number of user reports/flags */
  flagCount?: number;

  /** Reasons for flags */
  flagReasons?: string[];

  /** Related entity ID (e.g., blog post ID for comment) */
  relatedEntityId?: string;

  /** Related entity title */
  relatedEntityTitle?: string;

  /** URL to review/view the item */
  reviewUrl?: string;

  /** Content preview (truncated) */
  contentPreview?: string;
}

/**
 * SPRINT 1 - STORY 3: Moderation Activity
 * Backend DTO: ModerationActivityResponse.java
 * Endpoint: GET /api/v1/moderation/activities
 *
 * Represents a single moderation action in the activity log
 *
 * @version 1.0.0
 */
export interface ModerationActivity {
  /** Unique activity ID */
  id: string;

  /** Action performed: 'APPROVE' | 'REJECT' | 'SPAM' | 'ESCALATE' | etc. */
  action: string;

  /** Type of item moderated: 'COMMENT' | 'REVIEW' | 'REPORT' */
  itemType: string;

  /** ID of the moderated item */
  itemId: string;

  /** Name of the moderator who performed the action */
  moderatorName: string;

  /** Moderator's user ID */
  moderatorId: string;

  /** Reason or notes for the action (nullable) */
  reason: string | null;

  /** Timestamp when action was performed (ISO string) */
  timestamp: string;
}

/**
 * Alias for backward compatibility
 */
export type ModeratorActivity = ModerationActivity;

/**
 * Action types
 */
export enum ActionType {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SPAM = 'SPAM',
  RESOLVE = 'RESOLVE',
  CLOSE = 'CLOSE',
  WARN = 'WARN',
  BAN = 'BAN',
  BULK_APPROVE = 'BULK_APPROVE',
  BULK_REJECT = 'BULK_REJECT',
  BULK_SPAM = 'BULK_SPAM',
}

/**
 * API response for pending items
 */
export interface PendingItemsResponse {
  items: PendingItem[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Real-time update event
 */
export interface ModerationUpdateEvent {
  type: 'stats_update' | 'new_item' | 'item_resolved';
  data: Partial<ModerationStats> | PendingItem | { id: string };
  timestamp: string;
}

/**
 * Blog comment for moderation
 */
export interface BlogCommentDto {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  postId: string;
  postTitle: string;
  status: CommentStatus;
  flaggedCount: number;
  flagReasons: string[];
  createdAt: string;
  parentCommentId?: string;
}

/**
 * Comment status enum
 */
export enum CommentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SPAM = 'SPAM',
}

/**
 * Review for moderation
 */
export interface ReviewDto {
  id: string;
  rating: number;
  comment: string;
  reviewerId: string;
  reviewerName: string;
  packageId: string;
  packageTitle: string;
  sellerId: string;
  status: ReviewStatus;
  flaggedCount: number;
  flagReasons: string[];
  createdAt: string;
  verified: boolean;
}

/**
 * Review status enum
 */
export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SPAM = 'SPAM',
}

/**
 * Report for moderation
 */
export interface ReportDto {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  reason: string;
  description: string;
  evidence: string[];
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

/**
 * Report status enum
 */
export enum ReportStatus {
  PENDING = 'PENDING',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

/**
 * Bulk action response
 */
export interface BulkActionResponse {
  successCount: number;
  failureCount: number;
  failures: Array<{
    id: string;
    error: string;
  }>;
}

/**
 * User moderation history
 */
export interface UserModerationHistory {
  userId: string;
  userName: string;
  warningCount: number;
  banCount: number;
  lastAction: {
    type: ActionType;
    reason: string;
    timestamp: string;
  };
  totalReportsAgainst: number;
  totalContentRemoved: number;
}
