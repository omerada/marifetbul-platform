/**
 * ================================================
 * ADMIN DASHBOARD COMPONENTS
 * ================================================
 * Export all dashboard-related components
 */

export { PendingCommentsWidget } from './PendingCommentsWidget';
export { CommentModerationStats } from './CommentModerationStats';
export { RecentCommentsPreview } from './RecentCommentsPreview';
export { CommentModerationSummary } from '@/components/admin/dashboard/CommentModerationSummary';

export type {
  PendingCommentsSummary,
  PendingCommentsWidgetProps,
} from './PendingCommentsWidget';

export type {
  CommentModerationStatsData,
  CommentModerationStatsProps,
} from './CommentModerationStats';

export type { RecentCommentsPreviewProps } from './RecentCommentsPreview';
