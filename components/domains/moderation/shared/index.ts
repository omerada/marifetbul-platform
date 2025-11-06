/**
 * ================================================
 * SHARED MODERATION COMPONENTS
 * ================================================
 * Centralized export for unified moderation components
 * Used by both Admin and Moderator interfaces
 *
 * Sprint 1 - EPIC 1.1: Component Deduplication
 * @version 3.0.0 - Now includes Comment moderation
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

// Types
export type {
  UnifiedReviewModerationCardProps,
  ViewMode,
  UserRole,
} from './UnifiedReviewModerationCard';

export type { UnifiedCommentModerationCardProps } from './UnifiedCommentModerationCard';

export type { UnifiedCommentQueueProps } from './UnifiedCommentQueue';
