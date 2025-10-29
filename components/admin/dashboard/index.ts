/**
 * ================================================
 * ADMIN DASHBOARD COMPONENTS - DEPRECATED
 * ================================================
 * @deprecated This directory is deprecated. Use @/components/domains/admin/dashboard/comments instead.
 * These re-exports are maintained for backward compatibility only.
 * All new code should import from the canonical location.
 *
 * Migration Path:
 * OLD: import { RecentCommentsPreview } from '@/components/admin/dashboard'
 * NEW: import { RecentCommentsPreview } from '@/components/domains/admin/dashboard/comments'
 */

// Re-export from canonical location (domains/admin/dashboard/comments)
export {
  PendingCommentsWidget,
  CommentModerationStats,
  RecentCommentsPreview,
} from '@/components/domains/admin/dashboard/comments';

// CommentModerationSummary stays here (not duplicated)
export { CommentModerationSummary } from './CommentModerationSummary';

// SearchAnalyticsWidget stays here (not duplicated)
export { SearchAnalyticsWidget } from './SearchAnalyticsWidget';

// Re-export types
export type {
  PendingCommentsSummary,
  PendingCommentsWidgetProps,
  CommentModerationStatsData,
  CommentModerationStatsProps,
  RecentCommentsPreviewProps,
} from '@/components/domains/admin/dashboard/comments';
