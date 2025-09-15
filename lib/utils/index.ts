/**
 * Optimized Utils Index
 * Clean utility exports organized by functional domains
 */

// ================================================
// CORE UTILITIES (MOST COMMONLY USED)
// ================================================
export { cn } from '../utils'; // ClassNames utility - keep main export

// Date utilities
export * from './date';

// Format utilities
export * from './format';

// Async utilities
export * from './async';

// Validation utilities
export * from './validation';

// Type guards
export * from './typeGuards';

// ================================================
// LAZY LOADING UTILITIES
// ================================================
export {
  createLazyComponent,
  withSuspense,
  ComponentLoadingSkeleton,
  CardLoadingSkeleton,
  PageLoadingSkeleton,
  useComponentPerformance,
  useRenderPerformance,
  dynamicImportWithRetry,
  preloadComponent,
} from './lazy-loading';

// ================================================
// PERFORMANCE OPTIMIZATION UTILITIES
// ================================================
export {
  useStableCallback,
  useMemoizedSelector,
  OptimizedList,
  deepMemoCompare,
} from './performance-optimization';

// ================================================
// PRODUCTION OPTIMIZATION UTILITIES
// ================================================
export {
  BundleAnalyzer,
  TreeShakingAnalyzer,
  ProductionReadinessChecker,
} from './production-optimization';

export {
  ProductionOptimizationManager,
  quickProductionCheck,
  initializeProductionOptimizations,
} from './production-config';

export type {
  BundleReport,
  TreeShakingReport,
  ReadinessReport,
  ProductionReport,
  ActionItem,
  PerformanceMetrics,
} from './production-types';

// ================================================
// DEFAULT EXPORT FOR ORGANIZED IMPORTS
// ================================================
const UnifiedUtils = {
  // Add utils here as they are confirmed to exist
};

export default UnifiedUtils;
