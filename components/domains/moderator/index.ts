/**
 * ================================================
 * MODERATOR COMPONENTS INDEX
 * ================================================
 * Central export hub for moderator domain components
 *
 * SPRINT 1 - MODERATION CONSOLIDATION (Nov 2025)
 * - Removed deprecated queue components (now using Unified components)
 * - Kept specialized moderator-only tools
 *
 * @version 3.0.0 - Consolidated
 * @author MarifetBul Development Team
 * @updated November 12, 2025
 */

// ============================================================================
// DEPRECATED COMPONENTS REMOVED
// ============================================================================
// The following components have been replaced by Unified components:
// - ModerationQueue → Use UnifiedCommentQueue or UnifiedReviewQueue
// - ModerationQueueContainer → Use UnifiedCommentQueue or UnifiedReviewQueue
// - ModeratorStatsWidget → Use UnifiedDashboard stats
// - QuickActionButtons → Integrated into Unified components
// - ModerationActionPanel → Integrated into Unified components
// - ModerationHistory → Use ModeratorActivityTimeline
// - ModerationFilters → Integrated into Unified components
// - BulkModerationPanel → Integrated into Unified components
//
// See: components/domains/moderation/shared/

// ============================================================================
// ESCALATION FEATURE (Sprint 1 - Task 6)
// ============================================================================

export { EscalateCommentModal } from './EscalateCommentModal';
export type { EscalateCommentModalProps } from './EscalateCommentModal';

// ============================================================================
// DEDICATED MODERATION COMPONENTS (Sprint 1)
// ============================================================================

export { ModeratorTicketQueue } from './ModeratorTicketQueue';
export { ModeratorReportQueue } from './ModeratorReportQueue';

// ============================================================================
// DASHBOARD COMPONENTS (Sprint 2)
// ============================================================================
// Moderator dashboard moved to UnifiedDashboard
// See: components/domains/dashboard/views/ModeratorDashboardView.tsx

export { ModeratorActivityTimeline } from './ModeratorActivityTimeline';
export type { ModeratorActivityTimelineProps } from './ModeratorActivityTimeline';
export { ModeratorPerformanceCharts } from './ModeratorPerformanceCharts';
export type { ModeratorPerformanceChartsProps } from './ModeratorPerformanceCharts';

// ============================================================================
// SPRINT 2 - STORY 2.4: MODERATOR DASHBOARD ENHANCEMENT
// ============================================================================

export { ModerationItemCard } from './ModerationItemCard';
export type { ModerationItemCardProps } from './ModerationItemCard';
export { BulkModerationActions } from './BulkModerationActions';
export type { BulkModerationActionsProps } from './BulkModerationActions';
export { ModerationFiltersPanel } from './ModerationFiltersPanel';
export type {
  ModerationFiltersPanelProps,
  ModerationFilters,
  ContentType,
  Priority as FilterPriority,
  Status as FilterStatus,
} from './ModerationFiltersPanel';

// ============================================================================
// TYPE RE-EXPORTS
// ============================================================================

export type {
  ModerationStats,
  PendingItem,
  PendingItemType,
  Priority,
  ModerationActivity,
  ActionType,
  BlogCommentDto,
  ReviewDto,
  ReportDto,
  CommentStatus,
  ReviewStatus,
  ReportStatus,
} from '@/types/business/moderation';
