/**
 * ================================================
 * MODERATOR COMPONENTS INDEX
 * ================================================
 * Central export hub for moderator domain components
 *
 * Sprint 1 - Story 1.1: Review Moderation System
 * @version 2.0.0
 * @author MarifetBul Development Team
 * @updated November 3, 2025
 */

// ============================================================================
// CORE COMPONENTS
// ============================================================================

export { ModerationQueue } from './ModerationQueue';
export { ModerationQueueContainer } from './ModerationQueueContainer';
export { ModeratorStatsWidget } from './ModeratorStatsWidget';
export { QuickActionButtons } from './QuickActionButtons';
export { ModerationActionPanel } from './ModerationActionPanel';
export { ModerationHistory } from './ModerationHistory';
export { ModerationFilters } from './ModerationFilters';
export { BulkModerationPanel } from './BulkModerationPanel';

// ============================================================================
// DEDICATED MODERATION COMPONENTS (Sprint 1)
// ============================================================================

export { ModeratorReviewQueue } from './ModeratorReviewQueue';
export { ModeratorTicketQueue } from './ModeratorTicketQueue';
export { ModeratorReportQueue } from './ModeratorReportQueue';

// ============================================================================
// DASHBOARD COMPONENTS (Sprint 2)
// ============================================================================

export { ModeratorDashboardOverview } from './ModeratorDashboardOverview';
export { ModeratorActivityTimeline } from './ModeratorActivityTimeline';
export type { ModeratorActivityTimelineProps } from './ModeratorActivityTimeline';
export { ModeratorPerformanceCharts } from './ModeratorPerformanceCharts';
export type { ModeratorPerformanceChartsProps } from './ModeratorPerformanceCharts';

// ============================================================================
// TYPE RE-EXPORTS
// ============================================================================

export type {
  ModerationStats,
  PendingItem,
  PendingItemType,
  Priority,
  ModeratorActivity,
  ActionType,
  BlogCommentDto,
  ReviewDto,
  ReportDto,
  CommentStatus,
  ReviewStatus,
  ReportStatus,
} from '@/types/business/moderation';
