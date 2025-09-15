/**
 * @deprecated This file has been replaced by unified-performance.ts
 * Please use useEnhancedPerformance from hooks/useEnhancedPerformanceUnified.ts instead
 *
 * Legacy performance store - will be removed in next version
 */

console.warn(
  '⚠️ lib/store/performance.ts is deprecated. Use lib/store/unified-performance.ts instead'
);

// Re-export unified store for backward compatibility
export * from './unified-performance';
export { useUnifiedPerformanceStore as usePerformanceStore } from './unified-performance';
