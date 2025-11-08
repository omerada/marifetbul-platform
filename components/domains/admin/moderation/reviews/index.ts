/**
 * ================================================
 * ADMIN MODERATION COMPONENTS
 * ================================================
 * Export all moderation-related components
 *
 * NOTE: Review and Comment queue components have been unified.
 * Use components from @/components/domains/moderation/shared:
 * - UnifiedReviewQueue & UnifiedReviewModerationCard
 * - UnifiedCommentQueue & UnifiedCommentModerationCard
 */

// Stats Components
export { default as ModerationStats } from './ModerationStats';

// Supporting Comment Components (still in use)
export { CommentModerationNotes } from './CommentModerationNotes';
export { CommentBulkActions } from './CommentBulkActions';
export { CommentFilterBar } from './CommentFilterBar';
export { CommentSearchBar } from './CommentSearchBar';
export {
  CommentCardSkeleton as ModerationCommentCardSkeleton,
  StatsCardSkeleton as ModerationStatsCardSkeleton,
  ModerationQueueSkeleton,
  DashboardWidgetSkeleton as ModerationDashboardWidgetSkeleton,
  RecentCommentsSkeleton as ModerationRecentCommentsSkeleton,
} from './LoadingSkeletons';

export type {
  ModerationNote,
  CommentModerationNotesProps,
} from './CommentModerationNotes';
export type {
  BulkActionResult,
  CommentBulkActionsProps,
} from './CommentBulkActions';
export type { CommentFilterBarProps } from './CommentFilterBar';
export type { CommentSearchBarProps } from './CommentSearchBar';
