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
 */
export interface ModerationStats {
  // Comment Statistics
  pendingComments: number;
  flaggedComments: number;
  commentsApprovedToday: number;
  commentsRejectedToday: number;

  // Review Statistics
  pendingReviews: number;
  flaggedReviews: number;
  reviewsApprovedToday: number;
  reviewsRejectedToday: number;

  // Report Statistics
  pendingReports: number;
  reportsResolvedToday: number;

  // Support Ticket Statistics
  pendingSupportTickets: number;
  ticketsClosedToday: number;

  // Overall Statistics
  totalPendingItems: number;
  totalActionsToday: number;
  averageResponseTimeMinutes: number;
  accuracyRate: number;
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
}

/**
 * Pending moderation item
 */
export interface PendingItem {
  itemId: string;
  itemType: PendingItemType;
  content: string;
  authorName: string;
  authorId: string;
  relatedEntity: string;
  priority: Priority;
  flagCount?: number;
  flagReasons?: string[];
  createdAt: string;
  waitingTimeMinutes: number;
  reviewUrl: string;
}

/**
 * Recent activity item
 */
export interface ModeratorActivity {
  activityId: string;
  moderatorId: string;
  moderatorName: string;
  actionType: ActionType;
  targetType: string;
  targetId: string;
  description: string;
  reason?: string;
  timestamp: string;
  affectedUserId?: string;
  affectedUserName?: string;
}

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
 * API response for recent activities
 */
export interface ModeratorActivitiesResponse {
  activities: ModeratorActivity[];
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
