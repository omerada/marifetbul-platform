'use client';

import React, { useRef, useEffect } from 'react';
import {
  PerformanceMonitor as PerfMonitor,
  performanceMonitor,
  type PerformanceMetric,
} from './core';

// React hooks for performance monitoring
export function usePerformanceMonitor() {
  const monitor = useRef<PerfMonitor>();

  useEffect(() => {
    monitor.current = new PerfMonitor();

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
    trackExecutionTime: function <T>(name: string, fn: () => T): T {
      return monitor.current?.trackExecutionTime(name, fn) ?? fn();
    },
    trackAsyncExecutionTime: async function <T>(
      name: string,
      fn: () => Promise<T>
    ): Promise<T> {
      return monitor.current?.trackAsyncExecutionTime(name, fn) ?? fn();
    },
    getMetrics: () => monitor.current?.getMetrics() ?? [],
    clearMetrics: () => monitor.current?.clearMetrics(),
  };
}

// Component-level performance tracker
export function withPerformanceTracking<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: T) {
    const { trackMetric } = usePerformanceMonitor();

    const renderStartTime = useRef<number>();

    useEffect(() => {
      renderStartTime.current = performance.now();
    });

    useEffect(() => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        trackMetric(`${componentName} Render`, renderTime, 'ms');
      }
    });

    return <Component {...props} />;
  };
}

// Performance metrics display component (development only)
export function PerformanceMonitor({
  enabled = process.env.NODE_ENV === 'development',
}: {
  enabled?: boolean;
}) {
  const [metrics, setMetrics] = React.useState<PerformanceMetric[]>([]);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  const coreWebVitals = metrics.filter(
    (m) => m.context?.type === 'core_web_vital'
  );
  const executionMetrics = metrics.filter(
    (m) => m.context?.type === 'execution'
  );

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 rounded bg-blue-600 px-3 py-2 text-sm text-white shadow-lg hover:bg-blue-700"
      >
        Performance {isVisible ? '−' : '+'}
      </button>

      {isVisible && (
        <div className="max-h-96 w-80 overflow-y-auto rounded-lg border bg-white p-4 shadow-xl">
          <h3 className="mb-3 font-semibold text-gray-900">
            Performance Metrics
          </h3>

          {coreWebVitals.length > 0 && (
            <div className="mb-4">
              <h4 className="mb-2 font-medium text-gray-700">
                Core Web Vitals
              </h4>
              {coreWebVitals.slice(-5).map((metric, index) => (
                <div key={index} className="mb-1 text-xs">
                  <span className="font-mono">{metric.name}:</span>
                  <span className={`ml-2 ${getMetricColor(metric)}`}>
                    {metric.value.toFixed(2)}
                    {metric.unit}
                  </span>
                </div>
              ))}
            </div>
          )}

          {executionMetrics.length > 0 && (
            <div className="mb-4">
              <h4 className="mb-2 font-medium text-gray-700">
                Execution Times
              </h4>
              {executionMetrics.slice(-5).map((metric, index) => (
                <div key={index} className="mb-1 text-xs">
                  <span className="font-mono">{metric.name}:</span>
                  <span className={`ml-2 ${getMetricColor(metric)}`}>
                    {metric.value.toFixed(2)}
                    {metric.unit}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => performanceMonitor.clearMetrics()}
            className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
          >
            Clear Metrics
          </button>
        </div>
      )}
    </div>
  );
}

function getMetricColor(metric: PerformanceMetric): string {
  if (metric.name === 'FCP' || metric.name === 'LCP') {
    return metric.value < 2500
      ? 'text-green-600'
      : metric.value < 4000
        ? 'text-yellow-600'
        : 'text-red-600';
  }
  if (metric.name === 'FID') {
    return metric.value < 100
      ? 'text-green-600'
      : metric.value < 300
        ? 'text-yellow-600'
        : 'text-red-600';
  }
  if (metric.name === 'CLS') {
    return metric.value < 0.1
      ? 'text-green-600'
      : metric.value < 0.25
        ? 'text-yellow-600'
        : 'text-red-600';
  }
  return 'text-gray-600';
}
