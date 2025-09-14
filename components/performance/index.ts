// ================================================
// PERFORMANCE OPTIMIZATION INDEX
// ================================================
// Centralized performance optimization utilities and components

// Lazy loading and code splitting
export {
  LazyWrapper,
  createLazyComponent,
  createComponentLazy,
  preloadCriticalComponents,
  PerformanceMonitor,
  withMemo,
  getCachedComponent,
} from './LazyComponents';

// Performance hooks (from existing hooks)
export { useEnhancedPerformance as usePerformance } from '../../hooks/useEnhancedPerformance';
export { useEnhancedPerformance } from '../../hooks/useEnhancedPerformance';

// Import default utilities
import performanceUtils from './LazyComponents';

// Re-export for convenience
export default performanceUtils;
