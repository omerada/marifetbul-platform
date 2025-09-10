'use client';

import { useEffect, useState, useRef } from 'react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

interface ExtendedPerformanceEntry extends PerformanceEntry {
  processingStart?: number;
  hadRecentInput?: boolean;
  value?: number;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface ExtendedNavigator extends Navigator {
  connection?: {
    effectiveType?: string;
    addEventListener: (type: string, listener: () => void) => void;
    removeEventListener: (type: string, listener: () => void) => void;
  };
}

interface ExtendedPerformance extends Performance {
  memory?: MemoryInfo;
}

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const observerRef = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    const updateMetric = (name: string, value: number) => {
      setMetrics((prev) => ({ ...prev, [name]: value }));
    };

    // Observe paint metrics (FCP, LCP)
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          updateMetric('fcp', entry.startTime);
        }
      }
    });

    paintObserver.observe({ entryTypes: ['paint'] });

    // Observe LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      updateMetric('lcp', lastEntry.startTime);
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Observe FID
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const extendedEntry = entry as ExtendedPerformanceEntry;
        if (extendedEntry.processingStart) {
          updateMetric('fid', extendedEntry.processingStart - entry.startTime);
        }
      }
    });

    fidObserver.observe({ entryTypes: ['first-input'] });

    // Observe CLS
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const extendedEntry = entry as ExtendedPerformanceEntry;
        if (!extendedEntry.hadRecentInput && extendedEntry.value) {
          clsValue += extendedEntry.value;
        }
      }
      updateMetric('cls', clsValue);
    });

    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // Navigation timing for TTFB
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0] as PerformanceNavigationTiming;
      updateMetric('ttfb', nav.responseStart - nav.requestStart);
    }

    observerRef.current = paintObserver;

    return () => {
      paintObserver.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);

  return metrics;
}

export function usePageLoadTime() {
  const [loadTime, setLoadTime] = useState<number | null>(null);

  useEffect(() => {
    const handleLoad = () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      setLoadTime(loadTime);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  return loadTime;
}

export function useMemoryUsage() {
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      const extendedPerformance = performance as ExtendedPerformance;
      if (extendedPerformance.memory) {
        setMemoryInfo(extendedPerformance.memory);
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get connection type if available
    const extendedNavigator = navigator as ExtendedNavigator;
    if (extendedNavigator.connection) {
      const connection = extendedNavigator.connection;
      setConnectionType(connection.effectiveType || 'unknown');

      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType || 'unknown');
      };

      connection.addEventListener('change', handleConnectionChange);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    connectionType,
  };
}

// Performance budgets and warnings
export const performanceBudgets = {
  fcp: 1800, // 1.8s
  lcp: 2500, // 2.5s
  fid: 100, // 100ms
  cls: 0.1, // 0.1
  ttfb: 800, // 800ms
};

export function checkPerformanceBudget(metrics: PerformanceMetrics) {
  const warnings = [];

  if (metrics.fcp && metrics.fcp > performanceBudgets.fcp) {
    warnings.push(
      `First Contentful Paint (${metrics.fcp.toFixed(0)}ms) exceeds budget (${performanceBudgets.fcp}ms)`
    );
  }

  if (metrics.lcp && metrics.lcp > performanceBudgets.lcp) {
    warnings.push(
      `Largest Contentful Paint (${metrics.lcp.toFixed(0)}ms) exceeds budget (${performanceBudgets.lcp}ms)`
    );
  }

  if (metrics.fid && metrics.fid > performanceBudgets.fid) {
    warnings.push(
      `First Input Delay (${metrics.fid.toFixed(0)}ms) exceeds budget (${performanceBudgets.fid}ms)`
    );
  }

  if (metrics.cls && metrics.cls > performanceBudgets.cls) {
    warnings.push(
      `Cumulative Layout Shift (${metrics.cls.toFixed(3)}) exceeds budget (${performanceBudgets.cls})`
    );
  }

  if (metrics.ttfb && metrics.ttfb > performanceBudgets.ttfb) {
    warnings.push(
      `Time to First Byte (${metrics.ttfb.toFixed(0)}ms) exceeds budget (${performanceBudgets.ttfb}ms)`
    );
  }

  return warnings;
}

// Main performance hook export
export function usePerformance() {
  const performanceMetrics = usePerformanceMonitoring();
  const pageLoadTime = usePageLoadTime();
  const memoryUsage = useMemoryUsage();
  const networkStatus = useNetworkStatus();

  return {
    performanceMetrics,
    pageLoadTime,
    memoryUsage,
    networkStatus,
    checkBudget: () => checkPerformanceBudget(performanceMetrics),
  };
}
