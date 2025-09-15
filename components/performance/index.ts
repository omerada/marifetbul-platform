// ================================================
// PERFORMANCE OPTIMIZATION INDEX
// ================================================
// Centralized performance optimization utilities and components

// Core components
export { default as PerformanceMonitor } from './PerformanceMonitor';

// Unified performance monitoring system
export {
  useEnhancedPerformance as usePerformance,
  useEnhancedPerformance,
  usePerformanceMonitoring,
  useSearchPerformance,
} from '../../hooks/data/useEnhancedPerformanceUnified';

export type {
  PerformanceMetrics,
  PerformanceAlert,
  PerformanceConfig,
} from '@/lib/store/unified-performance';
