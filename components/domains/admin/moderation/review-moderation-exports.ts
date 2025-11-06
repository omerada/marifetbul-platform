/**
 * Review and Comment Moderation Components
 *
 * Sprint 1 - EPIC 1.1: Component Deduplication
 * @updated November 6, 2025
 *
 * NOTE: Review and Comment moderation now use Unified components from @/components/domains/moderation/shared
 * - Reviews: Use UnifiedReviewQueue and UnifiedReviewModerationCard
 * - Comments: Use UnifiedCommentQueue and UnifiedCommentModerationCard
 *
 * Legacy components have been deprecated and removed
 */

// Review Moderation - DEPRECATED: Use UnifiedReviewQueue instead
// export { PendingReviewsList } from './reviews/PendingReviewsList'; // REMOVED - Use UnifiedReviewQueue
// export { default as ReviewModerationCard } from './reviews/ReviewModerationCard'; // REMOVED - Use UnifiedReviewModerationCard
export { default as ModerationStats } from './reviews/ModerationStats';

// Comment Moderation - DEPRECATED: Use UnifiedCommentQueue and UnifiedCommentModerationCard
// export { CommentModerationQueue } from './reviews/CommentModerationQueue'; // REMOVED - Use UnifiedCommentQueue
// export { CommentModerationCard } from './reviews/CommentModerationCard'; // REMOVED - Use UnifiedCommentModerationCard

// Supporting Comment Components (still in use)
export { CommentBulkActions } from './reviews/CommentBulkActions';
export { CommentFilterBar } from './reviews/CommentFilterBar';
export { CommentSearchBar } from './reviews/CommentSearchBar';
export { CommentModerationNotes } from './reviews/CommentModerationNotes';
export {
  CommentCardSkeleton as ModerationCommentCardSkeleton,
  StatsCardSkeleton as ModerationStatsCardSkeleton,
  ModerationQueueSkeleton,
  DashboardWidgetSkeleton as ModerationDashboardWidgetSkeleton,
  RecentCommentsSkeleton as ModerationRecentCommentsSkeleton,
} from './reviews/LoadingSkeletons'; // Sprint 1 - Bulk Action Components (NEW)
export { BulkActionToolbar, CommentListWithBulkActions } from '.';
export type {
  BulkActionToolbarProps,
  CommentListWithBulkActionsProps,
} from '.';

// Sprint 3 Day 2 - Advanced Moderation Components (NEW)
export { AdvancedFilterPanel } from './reviews/AdvancedFilterPanel';
export { CommentActionMenu } from './reviews/CommentActionMenu';
export { CommentEditDialog } from './reviews/CommentEditDialog';
export { CommentReplyDialog } from './reviews/CommentReplyDialog';
export { CommentHistoryDialog } from './reviews/CommentHistoryDialog';
export type {
  FilterPreset,
  AdvancedFilterPanelProps,
} from './reviews/AdvancedFilterPanel';
export type { CommentActionMenuProps } from './reviews/CommentActionMenu';
export type { CommentEditDialogProps } from './reviews/CommentEditDialog';
export type { CommentReplyDialogProps } from './reviews/CommentReplyDialog';
export type {
  CommentHistoryEntry,
  CommentHistoryDialogProps,
} from './reviews/CommentHistoryDialog';

// Sprint 3 Day 3 - Content Flagging & Auto-Moderation (NEW)
export { FlagCommentDialog } from './reviews/FlagCommentDialog';
export { AutoModerationRulesPanel } from './reviews/AutoModerationRulesPanel';
export { FlagStatisticsPanel } from './reviews/FlagStatisticsPanel';
export type { FlagCommentDialogProps } from './reviews/FlagCommentDialog';
export type { AutoModerationRulesPanelProps } from './reviews/AutoModerationRulesPanel';
export type { FlagStatisticsPanelProps } from './reviews/FlagStatisticsPanel';

// Sprint 3 Day 4 - Analytics Dashboard (NEW)
export { ModeratorAnalyticsDashboard } from './reviews/ModeratorAnalyticsDashboard';
export type { ModeratorAnalyticsDashboardProps } from './reviews/ModeratorAnalyticsDashboard';
// RENAMED to avoid conflict with ModeratorDashboardView
export { ModeratorDashboard as ModerationDashboardWidget } from './reviews/ModeratorDashboard';
export type { ModeratorDashboardProps as ModerationDashboardWidgetProps } from './reviews/ModeratorDashboard';

// Comment Dashboard Widgets
export { CommentModerationSummary } from '../dashboard/CommentModerationSummary';
export { CommentModerationStats } from '../dashboard/comments/CommentModerationStats';
export { PendingCommentsWidget } from '../dashboard/comments/PendingCommentsWidget';
export { RecentCommentsPreview } from '../dashboard/comments/RecentCommentsPreview';
