// Performance monitoring system - Main export
export type { PerformanceMetric, WebVitalsMetric } from './core';
export {
  PerformanceMonitor,
  performanceMonitor,
  measureWebVitals,
  analyzeBundleSize,
  getMemoryUsage,
  checkPerformanceBudget,
} from './core';

export {
  usePerformanceMonitor,
  withPerformanceTracking,
  PerformanceMonitor as PerformanceMonitorComponent,
} from './react';
