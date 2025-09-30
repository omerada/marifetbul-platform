// Production-ready performance monitoring system
'use client';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

export interface WebVitalsMetric {
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// Performance monitor class
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupObservers();
    }
  }

  // Start monitoring
  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Monitor navigation timing
    this.trackNavigationTiming();

    // Monitor resource loading
    this.trackResourceTiming();

    // Monitor long tasks
    this.trackLongTasks();

    // Monitor layout shifts
    this.trackLayoutShifts();

    // Monitor largest contentful paint
    this.trackLCP();

    // Monitor first input delay
    this.trackFID();

    // Monitor cumulative layout shift
    this.trackCLS();
  }

  // Stop monitoring
  stop(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }

  // Track custom metric
  trackMetric(
    name: string,
    value: number,
    unit: string,
    context?: Record<string, unknown>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      context,
    };

    this.metrics.push(metric);
    this.reportMetric(metric);
  }

  // Track function execution time
  trackExecutionTime<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.trackMetric(`${name}_execution_time`, duration, 'ms');
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.trackMetric(`${name}_execution_time`, duration, 'ms', {
        error: true,
      });
      throw error;
    }
  }

  // Track async function execution time
  async trackAsyncExecutionTime<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.trackMetric(`${name}_execution_time`, duration, 'ms');
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.trackMetric(`${name}_execution_time`, duration, 'ms', {
        error: true,
      });
      throw error;
    }
  }

  // Get all metrics
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Get metrics by name
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter((metric) => metric.name === name);
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = [];
  }

  private setupObservers(): void {
    // Only setup if supported
    if (!('PerformanceObserver' in window)) return;
  }

  private trackNavigationTiming(): void {
    if (typeof window === 'undefined' || !window.performance?.getEntriesByType)
      return;

    const navigation = window.performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    if (!navigation) return;

    this.trackMetric(
      'dns_lookup',
      navigation.domainLookupEnd - navigation.domainLookupStart,
      'ms'
    );
    this.trackMetric(
      'tcp_connection',
      navigation.connectEnd - navigation.connectStart,
      'ms'
    );
    this.trackMetric(
      'ssl_negotiation',
      navigation.connectEnd - navigation.secureConnectionStart,
      'ms'
    );
    this.trackMetric(
      'ttfb',
      navigation.responseStart - navigation.requestStart,
      'ms'
    );
    this.trackMetric(
      'response_time',
      navigation.responseEnd - navigation.responseStart,
      'ms'
    );
    this.trackMetric(
      'dom_processing',
      navigation.domContentLoadedEventStart - navigation.responseEnd,
      'ms'
    );
    this.trackMetric(
      'resource_loading',
      navigation.loadEventStart - navigation.domContentLoadedEventEnd,
      'ms'
    );
    this.trackMetric(
      'total_load_time',
      navigation.loadEventEnd - navigation.fetchStart,
      'ms'
    );
  }

  private trackResourceTiming(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window))
      return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          this.trackMetric(
            'resource_load_time',
            resource.responseEnd - resource.startTime,
            'ms',
            {
              url: resource.name,
              type: resource.initiatorType,
              size: resource.transferSize,
            }
          );
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.push(observer);
  }

  private trackLongTasks(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window))
      return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackMetric('long_task', entry.duration, 'ms', {
            startTime: entry.startTime,
            attribution: (entry as any).attribution,
          });
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    } catch (e) {
      // Long tasks may not be supported in all browsers
    }
  }

  private trackLayoutShifts(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window))
      return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (
            entry.entryType === 'layout-shift' &&
            !(entry as any).hadRecentInput
          ) {
            this.trackMetric('layout_shift', (entry as any).value, 'score', {
              startTime: entry.startTime,
              sources: (entry as any).sources,
            });
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (e) {
      // Layout shift may not be supported in all browsers
    }
  }

  private trackLCP(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window))
      return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        this.trackMetric(
          'largest_contentful_paint',
          lastEntry.startTime,
          'ms',
          {
            element: (lastEntry as any).element?.tagName,
            url: (lastEntry as any).url,
            size: (lastEntry as any).size,
          }
        );
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (e) {
      // LCP may not be supported in all browsers
    }
  }

  private trackFID(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window))
      return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackMetric(
            'first_input_delay',
            (entry as any).processingStart - entry.startTime,
            'ms',
            {
              eventType: (entry as any).name,
              startTime: entry.startTime,
            }
          );
        }
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (e) {
      // FID may not be supported in all browsers
    }
  }

  private trackCLS(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window))
      return;

    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries: any[] = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          if (
            sessionValue &&
            entry.startTime - lastSessionEntry.startTime < 1000 &&
            entry.startTime - firstSessionEntry.startTime < 5000
          ) {
            sessionValue += (entry as any).value;
            sessionEntries.push(entry);
          } else {
            sessionValue = (entry as any).value;
            sessionEntries = [entry];
          }

          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            this.trackMetric('cumulative_layout_shift', clsValue, 'score');
          }
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (e) {
      // CLS may not be supported in all browsers
    }
  }

  private reportMetric(metric: PerformanceMetric): void {
    // Send to analytics service (GA, Mixpanel, etc.)
    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV === 'production'
    ) {
      // Example: Send to Google Analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', 'performance_metric', {
          metric_name: metric.name,
          metric_value: metric.value,
          metric_unit: metric.unit,
          custom_parameter: metric.context,
        });
      }

      // Example: Send to custom endpoint
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/analytics/performance',
          JSON.stringify(metric)
        );
      }
    }

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Performance] ${metric.name}: ${metric.value}${metric.unit}`,
        metric.context
      );
    }
  }
}

// React hook for performance monitoring
import { useEffect, useRef } from 'react';

export function usePerformanceMonitor() {
  const monitor = useRef<PerformanceMonitor>();

  useEffect(() => {
    monitor.current = new PerformanceMonitor();
    monitor.current.start();

    return () => {
      if (monitor.current) {
        monitor.current.stop();
      }
    };
  }, []);

  return {
    trackMetric: (
      name: string,
      value: number,
      unit: string,
      context?: Record<string, unknown>
    ) => {
      monitor.current?.trackMetric(name, value, unit, context);
    },
    trackExecutionTime: (name: string, fn: () => unknown) => {
      return monitor.current?.trackExecutionTime(name, fn) ?? fn();
    },
    trackAsyncExecutionTime: async (
      name: string,
      fn: () => Promise<unknown>
    ) => {
      return monitor.current?.trackAsyncExecutionTime(name, fn) ?? fn();
    },
    getMetrics: () => monitor.current?.getMetrics() ?? [],
    clearMetrics: () => monitor.current?.clearMetrics(),
  };
}

// Component-level performance tracker interface
export interface PerformanceTrackerOptions {
  componentName: string;
  trackRenders?: boolean;
  trackMounts?: boolean;
}

// Web Vitals integration
export function measureWebVitals(onMetric: (metric: WebVitalsMetric) => void) {
  // This would integrate with web-vitals library
  // For now, we'll provide the interface

  if (typeof window === 'undefined') return;

  // Example integration with web-vitals library
  // import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

  // getCLS(onMetric);
  // getFID(onMetric);
  // getFCP(onMetric);
  // getLCP(onMetric);
  // getTTFB(onMetric);
}

// Bundle size analyzer (development only)
export function analyzeBundleSize() {
  if (process.env.NODE_ENV !== 'development') return;

  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const stylesheets = Array.from(
    document.querySelectorAll('link[rel="stylesheet"]')
  );

  console.group('Bundle Analysis');

  scripts.forEach((script) => {
    const src = (script as HTMLScriptElement).src;
    console.log(`Script: ${src}`);
  });

  stylesheets.forEach((link) => {
    const href = (link as HTMLLinkElement).href;
    console.log(`Stylesheet: ${href}`);
  });

  console.groupEnd();
}

// Memory usage tracker
export function trackMemoryUsage() {
  if (typeof window === 'undefined' || !(window.performance as any)?.memory)
    return;

  const memory = (window.performance as any).memory;

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  };
}

// Performance budget checker
export function checkPerformanceBudget(budgets: Record<string, number>) {
  const monitor = new PerformanceMonitor();
  const metrics = monitor.getMetrics();
  const violations: string[] = [];

  Object.entries(budgets).forEach(([metricName, budget]) => {
    const metric = metrics.find((m) => m.name === metricName);
    if (metric && metric.value > budget) {
      violations.push(
        `${metricName}: ${metric.value}${metric.unit} exceeds budget of ${budget}${metric.unit}`
      );
    }
  });

  return {
    passed: violations.length === 0,
    violations,
  };
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();
