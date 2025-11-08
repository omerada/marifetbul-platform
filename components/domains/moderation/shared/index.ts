/**
 * ================================================
 * SHARED MODERATION COMPONENTS
 * ================================================
 * Centralized export for unified moderation components
 * Used by both Admin and Moderator interfaces
 *
 * Sprint 1 - EPIC 1.1: Component Deduplication
 * @version 3.0.1 - Consolidated types to @/types/business/moderation
 * @updated November 8, 2025
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

// Types - Component-specific props
export type { UnifiedReviewModerationCardProps } from './UnifiedReviewModerationCard';
export type { UnifiedCommentModerationCardProps } from './UnifiedCommentModerationCard';
export type { UnifiedCommentQueueProps } from './UnifiedCommentQueue';

// Shared types (ViewMode, UserRole) are now in @/types/business/moderation
// Import from there: import type { ViewMode, UserRole } from '@/types/business/moderation';
