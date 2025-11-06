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
// ESCALATION FEATURE (Sprint 1 - Task 6)
// ============================================================================

export { EscalateCommentModal } from './EscalateCommentModal';
export type { EscalateCommentModalProps } from './EscalateCommentModal';

// ============================================================================
// DEDICATED MODERATION COMPONENTS (Sprint 1)
// ============================================================================

// DEPRECATED: ModeratorReviewQueue - Use UnifiedReviewQueue from @/components/domains/moderation/shared
// export { ModeratorReviewQueue } from './ModeratorReviewQueue'; // REMOVED - Use UnifiedReviewQueue
export { ModeratorTicketQueue } from './ModeratorTicketQueue';
export { ModeratorReportQueue } from './ModeratorReportQueue';

// ============================================================================
// DASHBOARD COMPONENTS (Sprint 2)
// ============================================================================
// DEPRECATED: ModeratorDashboardOverview - Use ModeratorDashboardView from @/components/domains/dashboard/views
// Migration: All moderator dashboard functionality moved to UnifiedDashboard
// See: components/domains/dashboard/views/ModeratorDashboardView.tsx

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
