/**
 * ================================================
 * REVIEW & COMMENT MODERATION COMPONENTS
 * ================================================
 * Unified moderation components for admin/moderator dashboards
 *
 * Sprint 1 - EPIC 1.1: Component Deduplication ✅
 * Sprint 1 - Task 2: Deprecated Code Cleanup ✅
 * @version 2.0.0
 * @updated November 9, 2025
 *
 * NOTE: Review and Comment moderation use Unified components:
 * - Reviews: UnifiedReviewQueue + UnifiedReviewModerationCard
 * - Comments: UnifiedCommentQueue + UnifiedCommentModerationCard
 * - Flagging: CommentReportModal from @/components/blog
 */

// ================================================
// MODERATION STATS
// ================================================

export { default as ModerationStats } from './reviews/ModerationStats';

// ================================================
// COMMENT MODERATION SUPPORTING COMPONENTS
// ================================================

export { CommentBulkActions } from './reviews/CommentBulkActions';
export { CommentFilterBar } from './reviews/CommentFilterBar';
export { CommentSearchBar } from './reviews/CommentSearchBar';
export { CommentModerationNotes } from './reviews/CommentModerationNotes';

// ================================================
// LOADING SKELETONS
// ================================================

export {
  CommentCardSkeleton as ModerationCommentCardSkeleton,
  ModerationQueueSkeleton,
  DashboardWidgetSkeleton as ModerationDashboardWidgetSkeleton,
  RecentCommentsSkeleton as ModerationRecentCommentsSkeleton,
} from './reviews/LoadingSkeletons';

// Sprint 1 Day 3: StatsCardSkeleton removed (unused component)

// ================================================
// BULK ACTION COMPONENTS (Sprint 1 - EPIC 2)
// ================================================

export { BulkActionToolbar, CommentListWithBulkActions } from '.';
export type {
  BulkActionToolbarProps,
  CommentListWithBulkActionsProps,
} from '.';

// ================================================
// ADVANCED MODERATION (Sprint 3 Day 2)
// ================================================

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

// ================================================
// CONTENT FLAGGING & AUTO-MODERATION (Sprint 3 Day 3)
// ================================================

export { AutoModerationRulesPanel } from './reviews/AutoModerationRulesPanel';
export { FlagStatisticsPanel } from './reviews/FlagStatisticsPanel';

export type { AutoModerationRulesPanelProps } from './reviews/AutoModerationRulesPanel';
export type { FlagStatisticsPanelProps } from './reviews/FlagStatisticsPanel';

// ================================================
// ANALYTICS DASHBOARD (Sprint 3 Day 4)
// ================================================

export { ModeratorAnalyticsDashboard } from './reviews/ModeratorAnalyticsDashboard';
export { ModeratorDashboardWidget } from './reviews/ModeratorDashboardWidget';

export type { ModeratorAnalyticsDashboardProps } from './reviews/ModeratorAnalyticsDashboard';
export type { ModeratorDashboardWidgetProps } from './reviews/ModeratorDashboardWidget';

// ================================================
// DASHBOARD WIDGETS
// ================================================

export { CommentModerationSummary } from '../dashboard/CommentModerationSummary';
export { CommentModerationStats } from '../dashboard/comments/CommentModerationStats';
export { PendingCommentsWidget } from '../dashboard/comments/PendingCommentsWidget';
export { RecentCommentsPreview } from '../dashboard/comments/RecentCommentsPreview';
