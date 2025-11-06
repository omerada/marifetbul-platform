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
  SkeletonJobDetail,
  SkeletonPage,
  SkeletonGrid,
  SkeletonList,
  SkeletonComponent,
  UnifiedSkeletonSystem,
} from '../UnifiedSkeleton';

// Advanced skeleton components - Sprint EPIC 4
export {
  TableSkeleton,
  TableSkeletonCompact,
  StatsTableSkeleton,
} from './TableSkeleton';
export type { TableSkeletonProps } from './TableSkeleton';

export {
  FormSkeleton,
  SettingsFormSkeleton,
  InlineFormSkeleton,
} from './FormSkeleton';
export type { FormSkeletonProps, FormFieldConfig } from './FormSkeleton';

export {
  ListSkeleton,
  OrderListSkeleton,
  PackageListSkeleton,
} from './ListSkeleton';
export type { ListSkeletonProps, ListVariant } from './ListSkeleton';

// Default export - most commonly used component
export { UnifiedLoading as default } from '../UnifiedLoadingSystem';
