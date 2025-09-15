/**
 * Utils Index - SIMPLIFIED
 * All utilities now come from shared/utils for consistency
 */

// Re-export everything from shared utils
export * from '../shared/utils';

// Production optimization utilities (unique to lib/utils)
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
