/**
 * Unified Performance Hook
 * Consolidates useEnhancedPerformance, useSearchPerformance and other performance hooks
 */

'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useUnifiedPerformanceStore } from '../../../lib/core/store/unified-performance';
import { logger } from '@/lib/shared/utils/logger';

export interface UsePerformanceOptions {
  autoStart?: boolean;
  trackSearch?: boolean;
  trackStoreRenders?: boolean;
  enableAlerts?: boolean;
  reportingInterval?: number;
}

export const useEnhancedPerformance = (options: UsePerformanceOptions = {}) => {
  const {
    autoStart = true,
    trackSearch = false,
    trackStoreRenders = true,
    reportingInterval = 30000,
  } = options;

  const {
    metrics,
    score,
    alerts,
    resourceTimings,
    isLoading,
    isTracking,
    error,
    config,
    storeMetrics,
    fetchMetrics,
    startTracking,
    stopTracking,
    trackMetric,
    trackResourceTiming,
    trackStoreRender,
    updateConfig,
    dismissAlert,
    dismissAllAlerts,
    clearError,
    reset,
    exportReport,
  } = useUnifiedPerformanceStore();

  // Auto-start tracking if enabled
  useEffect(() => {
    if (autoStart && !isTracking) {
      startTracking();
      fetchMetrics();
    }
  }, [autoStart, isTracking, startTracking, fetchMetrics]);

  // Update config based on options (only on mount or when reportingInterval changes)
  useEffect(() => {
    updateConfig({
      enableTracking: true,
      autoCollect: true,
      reportingInterval,
      alertThresholds: {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        fcp: 1800,
        ttfb: 600,
      },
    });
  }, [reportingInterval, updateConfig]); // Removed config.alertThresholds dependency to prevent infinite loop

  // Performance Observer for real-time metrics
  useEffect(() => {
    if (!isTracking || typeof window === 'undefined') return;

    const cleanupFunctions: (() => void)[] = [];

    // Core Web Vitals tracking
    if ('PerformanceObserver' in window) {
      try {
        // LCP Observer
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            trackMetric('lcp', lastEntry.startTime);
          }
        });
        lcpObserver.observe({
          type: 'largest-contentful-paint',
          buffered: true,
        });
        cleanupFunctions.push(() => lcpObserver.disconnect());

        // FCP Observer
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          for (const entry of entries) {
            if (entry.name === 'first-contentful-paint') {
              trackMetric('fcp', entry.startTime);
            }
          }
        });
        fcpObserver.observe({ type: 'paint', buffered: true });
        cleanupFunctions.push(() => fcpObserver.disconnect());

        // Resource timing observer for tracking assets
        const resourceObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          for (const entry of entries) {
            const resourceEntry = entry as PerformanceResourceTiming;
            if (resourceEntry.transferSize !== undefined) {
              trackResourceTiming({
                name: resourceEntry.name,
                type: resourceEntry.initiatorType || 'unknown',
                duration: resourceEntry.duration,
                size: resourceEntry.transferSize,
                cached: resourceEntry.transferSize === 0,
                timestamp: new Date().toISOString(),
              });
            }
          }
        });
        resourceObserver.observe({ type: 'resource', buffered: true });
        cleanupFunctions.push(() => resourceObserver.disconnect());
      } catch (error) {
        logger.warn('Performance Observer not fully supported:', error);
      }
    }

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [isTracking, trackMetric, trackResourceTiming]);

  // Search performance tracking (if enabled)
  useEffect(() => {
    if (!trackSearch || typeof window === 'undefined') return;

    const trackSearchPerformance = (searchQuery: string, startTime: number) => {
      const endTime = performance.now();
      const searchDuration = endTime - startTime;

      // Track as custom metric
      trackResourceTiming({
        name: `search-query-${searchQuery.length}`,
        type: 'search',
        duration: searchDuration,
        size: searchQuery.length,
        cached: false,
        timestamp: new Date().toISOString(),
      });
    };

    // Listen for search events
    const handleSearch = (event: CustomEvent) => {
      const { query, startTime } = event.detail;
      trackSearchPerformance(query, startTime);
    };

    window.addEventListener(
      'search-performance',
      handleSearch as EventListener
    );

    return () => {
      window.removeEventListener(
        'search-performance',
        handleSearch as EventListener
      );
    };
  }, [trackSearch, trackResourceTiming]);

  // Store render performance tracking
  const trackStorePerformance = useCallback(
    (storeName: string, renderTime: number) => {
      if (trackStoreRenders) {
        trackStoreRender(storeName, renderTime);
      }
    },
    [trackStoreRenders, trackStoreRender]
  );

  // Utility functions
  const getPerformanceGrade = useMemo(() => {
    if (!score) return 'N/A';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }, [score]);

  const getActiveAlerts = useMemo(() => {
    return alerts.filter((alert) => !alert.dismissed);
  }, [alerts]);

  const getResourcesByType = useMemo(() => {
    const byType: Record<string, typeof resourceTimings> = {};
    resourceTimings.forEach((resource) => {
      if (!byType[resource.type]) {
        byType[resource.type] = [];
      }
      byType[resource.type].push(resource);
    });
    return byType;
  }, [resourceTimings]);

  const getSlowStores = useMemo(() => {
    return Array.from(storeMetrics.entries())
      .filter(([, metrics]) => metrics.slowRenders > 0)
      .map(([name, metrics]) => ({ name, ...metrics }));
  }, [storeMetrics]);

  const getRecommendations = useMemo(() => {
    const recommendations: string[] = [];

    if (!metrics) return recommendations;

    // LCP recommendations
    if (metrics.coreWebVitals.lcp > 2500) {
      recommendations.push(
        'Optimize largest contentful paint by reducing server response times and optimizing critical resources'
      );
    }

    // FID recommendations
    if (metrics.coreWebVitals.fid > 100) {
      recommendations.push(
        'Improve first input delay by breaking up long JavaScript tasks and using web workers'
      );
    }

    // CLS recommendations
    if (metrics.coreWebVitals.cls > 0.1) {
      recommendations.push(
        'Reduce cumulative layout shift by setting explicit dimensions for images and avoiding dynamic content insertion'
      );
    }

    // Memory recommendations
    if (
      metrics?.memoryUsage?.percentage &&
      metrics.memoryUsage.percentage > 80
    ) {
      recommendations.push(
        'Optimize memory usage by implementing component memoization and cleaning up event listeners'
      );
    }

    // Bundle size recommendations
    if (metrics?.bundleSize?.total && metrics.bundleSize.total > 1024 * 1024) {
      // 1MB
      recommendations.push(
        'Reduce bundle size through code splitting and tree shaking'
      );
    }

    return recommendations;
  }, [metrics]);

  return {
    // Core state
    metrics,
    score,
    alerts,
    resourceTimings,
    isLoading,
    isTracking,
    error,
    config,
    storeMetrics,

    // Actions
    fetchMetrics,
    startTracking,
    stopTracking,
    trackMetric,
    trackResourceTiming,
    trackStorePerformance,
    updateConfig,
    dismissAlert,
    dismissAllAlerts,
    clearError,
    reset,
    exportReport,

    // Computed values
    performanceGrade: getPerformanceGrade,
    activeAlerts: getActiveAlerts,
    resourcesByType: getResourcesByType,
    slowStores: getSlowStores,
    recommendations: getRecommendations,

    // Utilities
    isGoodPerformance: score !== null && score >= 90,
    needsAttention:
      getActiveAlerts.length > 0 || (score !== null && score < 70),
    hasSlowStores: getSlowStores.length > 0,
  };
};

// Legacy exports for backward compatibility
export const usePerformanceMonitoring = useEnhancedPerformance;
export const useSearchPerformance = (searchOptions?: {
  trackQueries?: boolean;
}) => {
  return useEnhancedPerformance({
    trackSearch: searchOptions?.trackQueries ?? true,
    autoStart: true,
  });
};

export default useEnhancedPerformance;
