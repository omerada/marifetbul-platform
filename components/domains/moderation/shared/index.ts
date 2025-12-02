/**
 * ================================================
 * SHARED MODERATION COMPONENTS
 * ================================================
 * Centralized export for unified moderation components
 * Used by both Admin and Moderator interfaces
 *
 * Sprint 1: Comment Moderation UI Completion
 * @version 3.2.0 - Sprint 1 COMPLETE ✅
 * @updated December 2, 2025
 */

// Review Components
export { UnifiedReviewModerationCard } from './UnifiedReviewModerationCard';
export { default as UnifiedReviewModerationCardDefault } from './UnifiedReviewModerationCard';
export { UnifiedReviewQueue } from './UnifiedReviewQueue';
export { default as UnifiedReviewQueueDefault } from './UnifiedReviewQueue';

// Comment Components
export { UnifiedCommentModerationCard } from './UnifiedCommentModerationCard';
export { default as UnifiedCommentModerationCardDefault } from './UnifiedCommentModerationCard';
export { UnifiedCommentQueue } from './UnifiedCommentQueue';
export { default as UnifiedCommentQueueDefault } from './UnifiedCommentQueue';

// Comment Escalation - Sprint 1 ✅
export { CommentEscalationModal } from './CommentEscalationModal';
export { default as CommentEscalationModalDefault } from './CommentEscalationModal';

// Flagged Comments Management - Sprint 1 ✅
export { FlaggedCommentsQueue } from './FlaggedCommentsQueue';
export { default as FlaggedCommentsQueueDefault } from './FlaggedCommentsQueue';
export { FlaggedCommentCard } from './FlaggedCommentCard';
export { default as FlaggedCommentCardDefault } from './FlaggedCommentCard';
export { ResolveFlagModal } from './ResolveFlagModal';
export { default as ResolveFlagModalDefault } from './ResolveFlagModal';
export { FlagStatisticsWidget } from './FlagStatisticsWidget';
export { default as FlagStatisticsWidgetDefault } from './FlagStatisticsWidget';

// Types - Component-specific props
export type { UnifiedReviewModerationCardProps } from './UnifiedReviewModerationCard';
export type { UnifiedCommentModerationCardProps } from './UnifiedCommentModerationCard';
export type { UnifiedCommentQueueProps } from './UnifiedCommentQueue';
export type {
  EscalationPriority,
  EscalationData,
  CommentEscalationModalProps,
} from './CommentEscalationModal';
export type { FlaggedCommentsQueueProps } from './FlaggedCommentsQueue';
export type { FlaggedCommentCardProps } from './FlaggedCommentCard';
export type { ResolveFlagModalProps } from './ResolveFlagModal';
export type { FlagStatisticsWidgetProps } from './FlagStatisticsWidget';

// Shared types (ViewMode, UserRole) are now in @/types/business/moderation
// Import from there: import type { ViewMode, UserRole } from '@/types/business/moderation';
