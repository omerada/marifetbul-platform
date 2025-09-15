/**
 * Optimized Utils Index
 * Clean utility exports organized by functional domains
 */

// ================================================
// CORE UTILITIES (MOST COMMONLY USED)
// ================================================
// cn utility is exported from parent ../utils.ts to avoid circular import

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
// These utilities moved to components/shared/LazyComponents.tsx

// ================================================
// PERFORMANCE OPTIMIZATION UTILITIES
// ================================================
// These utilities moved to components/shared/LazyComponents.tsx

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
