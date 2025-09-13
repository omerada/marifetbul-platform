import { useCallback, useEffect, useState } from 'react';
import { usePerformanceStore } from '@/lib/store/performance';

/**
 * Enhanced custom hook for performance monitoring and optimization
 * Provides utilities for Core Web Vitals tracking and performance alerts
 */
export function useEnhancedPerformance() {
  const {
    metrics,
    alerts,
    isLoading,
    error,
    fetchMetrics,
    clearAlerts,
    clearError,
  } = usePerformanceStore();

  const [isTracking, setIsTracking] = useState(false);

  // Real-time performance tracking
  const startTracking = useCallback(() => {
    if (isTracking) return;

    setIsTracking(true);

    // Track Core Web Vitals
    if ('web-vital' in window) {
      // Implementation for real performance tracking would go here
      console.log('Performance tracking started');
    }

    // Fetch initial metrics
    fetchMetrics();
  }, [isTracking, fetchMetrics]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    console.log('Performance tracking stopped');
  }, []);

  // Measure specific performance events
  const measurePerformance = useCallback(
    (label: string, fn: () => void | Promise<void>) => {
      const startTime = performance.now();

      const finish = () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        console.log(`${label}: ${duration.toFixed(2)}ms`);
        return duration;
      };

      try {
        const result = fn();

        if (result instanceof Promise) {
          return result.finally(finish);
        } else {
          finish();
          return result;
        }
      } catch (error) {
        finish();
        throw error;
      }
    },
    []
  );

  // Get performance recommendations
  const getRecommendations = useCallback(() => {
    if (!metrics) return [];

    const recommendations: string[] = [];

    // Core Web Vitals recommendations
    if (metrics.coreWebVitals.lcp > 2.5) {
      recommendations.push(
        'Optimize Largest Contentful Paint (LCP): Consider lazy loading images and reducing server response times'
      );
    }

    if (metrics.coreWebVitals.fid > 100) {
      recommendations.push(
        'Improve First Input Delay (FID): Minimize JavaScript execution time and break up long tasks'
      );
    }

    if (metrics.coreWebVitals.cls > 0.1) {
      recommendations.push(
        'Reduce Cumulative Layout Shift (CLS): Set size attributes on images and avoid inserting content above existing content'
      );
    }

    if (metrics.coreWebVitals.fcp > 1800) {
      recommendations.push(
        'Optimize First Contentful Paint (FCP): Optimize critical rendering path and reduce render-blocking resources'
      );
    }

    // Bundle size recommendations
    if (metrics.bundleSize.js > 500) {
      recommendations.push(
        'JavaScript bundle too large: Consider code splitting and tree shaking'
      );
    }

    if (metrics.bundleSize.css > 100) {
      recommendations.push(
        'CSS bundle too large: Consider purging unused CSS and splitting critical CSS'
      );
    }

    if (metrics.bundleSize.images > 2000) {
      recommendations.push(
        'Image payload too large: Optimize images and use WebP format'
      );
    }

    // Cache recommendations
    if (metrics.cacheHitRate < 0.8) {
      recommendations.push(
        'Improve cache hit rate: Review caching strategies and set appropriate cache headers'
      );
    }

    return recommendations;
  }, [metrics]);

  // Calculate performance score
  const getPerformanceScore = useCallback(() => {
    if (!metrics) return 0;

    let score = 100;

    // Core Web Vitals scoring (Google's thresholds)
    const { lcp, fid, cls, fcp } = metrics.coreWebVitals;

    // LCP scoring
    if (lcp > 4) score -= 25;
    else if (lcp > 2.5) score -= 15;
    else if (lcp > 1.8) score -= 5;

    // FID scoring
    if (fid > 300) score -= 25;
    else if (fid > 100) score -= 15;
    else if (fid > 50) score -= 5;

    // CLS scoring
    if (cls > 0.25) score -= 25;
    else if (cls > 0.1) score -= 15;
    else if (cls > 0.05) score -= 5;

    // FCP scoring
    if (fcp > 3000) score -= 15;
    else if (fcp > 1800) score -= 10;
    else if (fcp > 1200) score -= 5;

    // Bundle size penalty
    if (metrics.bundleSize.total > 2000) score -= 10;
    else if (metrics.bundleSize.total > 1000) score -= 5;

    // Cache hit rate bonus
    if (metrics.cacheHitRate > 0.9) score += 5;
    else if (metrics.cacheHitRate < 0.7) score -= 5;

    return Math.max(0, Math.min(100, score));
  }, [metrics]);

  // Performance alert management
  const dismissAlert = useCallback((alertId: string) => {
    // Individual alert dismissal would need store method
    console.log('Dismissing alert:', alertId);
  }, []);

  const dismissAllAlerts = useCallback(() => {
    clearAlerts();
  }, [clearAlerts]);

  // Export performance report
  const exportReport = useCallback(() => {
    if (!metrics) return null;

    const report = {
      timestamp: new Date().toISOString(),
      score: getPerformanceScore(),
      metrics: metrics,
      recommendations: getRecommendations(),
      alerts: alerts,
    };

    return report;
  }, [metrics, getPerformanceScore, getRecommendations, alerts]);

  // Resource timing analysis
  const getResourceTiming = useCallback(() => {
    if (!window.performance) return [];

    const resources = window.performance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];

    return resources.map((resource) => ({
      name: resource.name,
      type: resource.initiatorType,
      size: resource.transferSize || 0,
      duration: resource.duration,
      startTime: resource.startTime,
    }));
  }, []);

  // Network information
  const getNetworkInfo = useCallback(() => {
    if (!('connection' in navigator)) return null;

    interface NetworkConnection {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    }

    const connection = (navigator as { connection?: NetworkConnection })
      .connection;

    return {
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData,
    };
  }, []);

  // Auto-refresh metrics
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      fetchMetrics();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isTracking, fetchMetrics]);

  // Listen for performance events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isTracking) {
        // Page is hidden, save current metrics
        console.log('Page hidden, saving metrics');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTracking]);

  return {
    // State
    metrics,
    alerts,
    isLoading,
    error,
    isTracking,

    // Actions
    startTracking,
    stopTracking,
    fetchMetrics,
    dismissAlert,
    dismissAllAlerts,
    clearError,

    // Utilities
    measurePerformance,
    getRecommendations,
    getPerformanceScore,
    exportReport,
    getResourceTiming,
    getNetworkInfo,
  };
}
