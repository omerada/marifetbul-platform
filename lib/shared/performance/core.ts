// Production-ready performance monitoring core
import { logger } from '@/lib/shared/utils/logger';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

export interface WebVitalsMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  attribution?: Record<string, unknown>;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isActive = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (typeof window === 'undefined') return;

    this.isActive = true;
    this.startCoreWebVitalsTracking();
    this.startResourceTracking();
    this.startNavigationTracking();
    this.startLayoutShiftTracking();
    this.startLargestContentfulPaintTracking();
    this.startFirstInputDelayTracking();
    this.startCumulativeLayoutShiftTracking();
  }

  stop(): void {
    this.isActive = false;
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }

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

  trackExecutionTime<T>(name: string, fn: () => T): T {
    const start = performance.now();

    try {
      const result = fn();
      const duration = performance.now() - start;
      this.trackMetric(name, duration, 'ms', { type: 'execution' });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.trackMetric(name, duration, 'ms', {
        type: 'execution',
        error: true,
      });
      throw error;
    }
  }

  async trackAsyncExecutionTime<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.trackMetric(name, duration, 'ms', { type: 'async_execution' });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.trackMetric(name, duration, 'ms', {
        type: 'async_execution',
        error: true,
      });
      throw error;
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter((metric) => metric.name === name);
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  private reportMetric(metric: PerformanceMetric): void {
    // Report to console in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug(
        `[Performance] ${metric.name}: ${metric.value}${metric.unit}`,
        metric.context
      );
    }

    // Report to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric);
    }
  }

  private sendToAnalytics(metric: PerformanceMetric): void {
    // Example implementation - replace with your analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_unit: metric.unit,
        custom_map: metric.context,
      });
    }

    // Example: Send to custom analytics endpoint
    // fetch('/api/analytics/performance', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(metric),
    // }).catch(() => {
    //   // Silently fail - don't let analytics break the app
    // });
  }

  // Core Web Vitals tracking methods
  private startCoreWebVitalsTracking(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window))
      return;

    // First Contentful Paint (FCP)
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(
          (entry) => entry.name === 'first-contentful-paint'
        );

        if (fcpEntry) {
          this.trackMetric('FCP', fcpEntry.startTime, 'ms', {
            type: 'core_web_vital',
            attribution: (fcpEntry as any).attribution,
          });
        }
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch {
      // Observer not supported
    }
  }

  private startLayoutShiftTracking(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window))
      return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();

        entries.forEach((entry) => {
          if (
            entry.entryType === 'layout-shift' &&
            !(entry as any).hadRecentInput
          ) {
            this.trackMetric('Layout Shift', (entry as any).value, 'score', {
              type: 'layout_shift',
              sources: (entry as any).sources,
            });
          }
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch {
      // Observer not supported
    }
  }

  private startLargestContentfulPaintTracking(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window))
      return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        if (lastEntry) {
          this.trackMetric('LCP', lastEntry.startTime, 'ms', {
            type: 'core_web_vital',
            element: (lastEntry as any).element?.tagName,
            url: (lastEntry as any).url,
            size: (lastEntry as any).size,
          });
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch {
      // Observer not supported
    }
  }

  private startFirstInputDelayTracking(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window))
      return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();

        entries.forEach((entry) => {
          this.trackMetric(
            'FID',
            (entry as any).processingStart - entry.startTime,
            'ms',
            {
              type: 'core_web_vital',
              eventType: (entry as any).name,
            }
          );
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch {
      // Observer not supported
    }
  }

  private startCumulativeLayoutShiftTracking(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window))
      return;

    let clsValue = 0;
    let sessionValue = 0;
    const sessionEntries: any[] = [];

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();

        entries.forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

            if (
              sessionValue &&
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000
            ) {
              sessionValue += (entry as any).value;
            } else {
              sessionValue = (entry as any).value;
            }

            if (sessionValue > clsValue) {
              clsValue = sessionValue;
              this.trackMetric('CLS', clsValue, 'score', {
                type: 'core_web_vital',
                entries: sessionEntries.length,
              });
            }
          }
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch {
      // Observer not supported
    }
  }

  private startResourceTracking(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window))
      return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();

        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.trackMetric(`Resource: ${entry.name}`, entry.duration, 'ms', {
              type: 'resource',
              size: (entry as any).transferSize,
              cached: (entry as any).transferSize === 0,
            });
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch {
      // Observer not supported
    }
  }

  private startNavigationTracking(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window))
      return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();

        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;

            this.trackMetric(
              'DNS Lookup',
              navEntry.domainLookupEnd - navEntry.domainLookupStart,
              'ms',
              { type: 'navigation' }
            );
            this.trackMetric(
              'TCP Connect',
              navEntry.connectEnd - navEntry.connectStart,
              'ms',
              { type: 'navigation' }
            );
            this.trackMetric(
              'TLS Setup',
              navEntry.secureConnectionStart
                ? navEntry.connectEnd - navEntry.secureConnectionStart
                : 0,
              'ms',
              { type: 'navigation' }
            );
            this.trackMetric(
              'Request',
              navEntry.responseStart - navEntry.requestStart,
              'ms',
              { type: 'navigation' }
            );
            this.trackMetric(
              'Response',
              navEntry.responseEnd - navEntry.responseStart,
              'ms',
              { type: 'navigation' }
            );
            this.trackMetric(
              'DOM Processing',
              navEntry.domContentLoadedEventStart - navEntry.responseEnd,
              'ms',
              { type: 'navigation' }
            );
            this.trackMetric(
              'Load Complete',
              navEntry.loadEventEnd - navEntry.loadEventStart,
              'ms',
              { type: 'navigation' }
            );
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch {
      // Observer not supported
    }
  }
}

// Web Vitals integration
export function measureWebVitals(_onMetric: (metric: WebVitalsMetric) => void) {
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

  logger.debug('Bundle Analysis - Scripts');

  scripts.forEach((script) => {
    const src = (script as HTMLScriptElement).src;
    logger.debug(`Script: ${src}`);
  });

  logger.debug('Bundle Analysis - Stylesheets');

  stylesheets.forEach((link) => {
    const href = (link as HTMLLinkElement).href;
    logger.debug(`Stylesheet: ${href}`);
  });
}

// Memory usage tracking
export function getMemoryUsage() {
  if (typeof window === 'undefined' || !(window.performance as any)?.memory)
    return;

  const memory = (window.performance as any).memory;

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
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

// Global instance
export const performanceMonitor = new PerformanceMonitor();
