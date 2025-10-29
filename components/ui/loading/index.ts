/**
 * ================================================
 * LOADING COMPONENTS INDEX
 * ================================================
 * Centralized exports for all loading states
 *
 * @module components/ui/loading
 */

// Base loading components
export {
  UnifiedLoading as Loading,
  UnifiedLoading,
  LoadingButton,
  useLoadingState,
  type LoadingState,
  type LoadingVariant,
  type LoadingSize,
  type LoadingSpeed,
} from '../UnifiedLoadingSystem';

// Specialized loading components
export {
  ProgressLoader,
  LoadingOverlay,
  LoadingCard,
  LoadingPageSkeleton,
} from '../UnifiedLoadingSystem';

// Skeleton components
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonImage,
  SkeletonCard,
  SkeletonDashboard,
  SkeletonJobDetail,
  SkeletonPage,
  SkeletonGrid,
  SkeletonList,
  SkeletonComponent,
  UnifiedSkeletonSystem,
} from '../UnifiedSkeleton';

// Default export - most commonly used component
export { UnifiedLoading as default } from '../UnifiedLoadingSystem';
