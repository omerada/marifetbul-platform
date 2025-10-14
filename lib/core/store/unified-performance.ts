/**
 * Unified Performance Monitoring System
 * Consolidates all performance tracking utilities into a single system
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { logger } from '@/lib/shared/utils/logger';

// === Additional Type Definitions ===
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  cancelable: boolean;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface NetworkInformation {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

declare global {
  interface Performance {
    memory?: MemoryInfo;
  }

  interface Navigator {
    connection?: NetworkInformation;
  }
}
export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

export interface LoadTimes {
  ttfb: number;
  fcp: number;
  domReady: number;
  loadComplete: number;
}

export interface BundleSize {
  js: number;
  css: number;
  images: number;
  fonts: number;
  total: number;
}

export interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
}

export interface NetworkInfo {
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

export interface PerformanceMetrics {
  coreWebVitals: CoreWebVitals;
  loadTimes: LoadTimes;
  bundleSize: BundleSize;
  memoryUsage: MemoryUsage;
  networkInfo: NetworkInfo;
  cacheHitRate: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  timestamp: string;
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: string;
  dismissed?: boolean;
}

export interface PerformanceConfig {
  enableTracking: boolean;
  sampleRate: number;
  alertThresholds: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  autoCollect: boolean;
  reportingInterval: number;
}

export interface ResourceTiming {
  name: string;
  type: string;
  duration: number;
  size: number;
  cached: boolean;
  timestamp: string;
}

// === Performance Store ===
interface UnifiedPerformanceState {
  // Metrics
  metrics: PerformanceMetrics | null;
  score: number | null;
  alerts: PerformanceAlert[];
  resourceTimings: ResourceTiming[];

  // State
  isLoading: boolean;
  isTracking: boolean;
  error: string | null;
  lastUpdate: string | null;

  // Config
  config: PerformanceConfig;

  // Store Performance
  storeMetrics: Map<
    string,
    {
      renderCount: number;
      lastRenderTime: number;
      averageRenderTime: number;
      slowRenders: number;
    }
  >;
}

interface UnifiedPerformanceActions {
  // Core actions
  fetchMetrics: () => Promise<void>;
  startTracking: () => void;
  stopTracking: () => void;
  calculateScore: (metrics: PerformanceMetrics) => number;

  // Metric tracking
  trackMetric: (metric: keyof CoreWebVitals, value: number) => void;
  trackResourceTiming: (resource: ResourceTiming) => void;
  trackStoreRender: (storeName: string, renderTime: number) => void;

  // Alerts
  checkAlerts: (metrics: PerformanceMetrics) => void;
  dismissAlert: (alertId: string) => void;
  dismissAllAlerts: () => void;

  // Config
  updateConfig: (config: Partial<PerformanceConfig>) => void;

  // Utilities
  clearError: () => void;
  reset: () => void;
  exportReport: () => Promise<Blob>;
  collectRealTimeMetrics: () => void;
}

type UnifiedPerformanceStore = UnifiedPerformanceState &
  UnifiedPerformanceActions;

// === Core Web Vitals Thresholds ===
export const CORE_WEB_VITALS = {
  LCP: { GOOD: 2500, NEEDS_IMPROVEMENT: 4000 },
  FID: { GOOD: 100, NEEDS_IMPROVEMENT: 300 },
  CLS: { GOOD: 0.1, NEEDS_IMPROVEMENT: 0.25 },
  FCP: { GOOD: 1800, NEEDS_IMPROVEMENT: 3000 },
  TTFB: { GOOD: 800, NEEDS_IMPROVEMENT: 1800 },
} as const;

// === Default Configuration ===
const defaultConfig: PerformanceConfig = {
  enableTracking: true,
  sampleRate: 1.0,
  alertThresholds: {
    lcp: CORE_WEB_VITALS.LCP.NEEDS_IMPROVEMENT,
    fid: CORE_WEB_VITALS.FID.NEEDS_IMPROVEMENT,
    cls: CORE_WEB_VITALS.CLS.NEEDS_IMPROVEMENT,
    fcp: CORE_WEB_VITALS.FCP.NEEDS_IMPROVEMENT,
    ttfb: CORE_WEB_VITALS.TTFB.NEEDS_IMPROVEMENT,
  },
  autoCollect: true,
  reportingInterval: 30000, // 30 seconds
};

// === Store Implementation ===
export const useUnifiedPerformanceStore = create<UnifiedPerformanceStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      metrics: null,
      score: null,
      alerts: [],
      resourceTimings: [],
      isLoading: false,
      isTracking: false,
      error: null,
      lastUpdate: null,
      config: defaultConfig,
      storeMetrics: new Map(),

      // Actions
      fetchMetrics: async () => {
        set((draft) => {
          draft.isLoading = true;
          draft.error = null;
        });

        try {
          const response = await fetch('/api/v1/performance/metrics');
          if (!response.ok)
            throw new Error('Failed to fetch performance metrics');

          const data = await response.json();
          const metrics = data.data as PerformanceMetrics;
          const score = get().calculateScore(metrics);

          set((draft) => {
            draft.metrics = metrics;
            draft.score = score;
            draft.isLoading = false;
            draft.lastUpdate = new Date().toISOString();
          });

          // Check for alerts
          get().checkAlerts(metrics);
        } catch (error) {
          set((draft) => {
            draft.error =
              error instanceof Error ? error.message : 'Unknown error';
            draft.isLoading = false;
          });
        }
      },

      startTracking: () => {
        const { config } = get();
        if (!config.enableTracking) return;

        set((draft) => {
          draft.isTracking = true;
        });

        // Start automatic metric collection
        if (config.autoCollect) {
          get().collectRealTimeMetrics();
        }
      },

      stopTracking: () => {
        set((draft) => {
          draft.isTracking = false;
        });
      },

      calculateScore: (metrics: PerformanceMetrics): number => {
        let score = 100;
        const { coreWebVitals } = metrics;

        // LCP scoring (25% weight)
        if (coreWebVitals.lcp > CORE_WEB_VITALS.LCP.NEEDS_IMPROVEMENT) {
          score -= 30;
        } else if (coreWebVitals.lcp > CORE_WEB_VITALS.LCP.GOOD) {
          score -= 15;
        }

        // FID scoring (25% weight)
        if (coreWebVitals.fid > CORE_WEB_VITALS.FID.NEEDS_IMPROVEMENT) {
          score -= 30;
        } else if (coreWebVitals.fid > CORE_WEB_VITALS.FID.GOOD) {
          score -= 15;
        }

        // CLS scoring (25% weight)
        if (coreWebVitals.cls > CORE_WEB_VITALS.CLS.NEEDS_IMPROVEMENT) {
          score -= 30;
        } else if (coreWebVitals.cls > CORE_WEB_VITALS.CLS.GOOD) {
          score -= 15;
        }

        // FCP scoring (15% weight)
        if (coreWebVitals.fcp > CORE_WEB_VITALS.FCP.NEEDS_IMPROVEMENT) {
          score -= 20;
        } else if (coreWebVitals.fcp > CORE_WEB_VITALS.FCP.GOOD) {
          score -= 10;
        }

        // TTFB scoring (10% weight)
        if (coreWebVitals.ttfb > CORE_WEB_VITALS.TTFB.NEEDS_IMPROVEMENT) {
          score -= 15;
        } else if (coreWebVitals.ttfb > CORE_WEB_VITALS.TTFB.GOOD) {
          score -= 5;
        }

        return Math.max(0, Math.round(score));
      },

      trackMetric: (metric: keyof CoreWebVitals, value: number) => {
        const { config } = get();
        if (!config.enableTracking) return;

        // Sample based on configured rate
        if (Math.random() > config.sampleRate) return;

        set((draft) => {
          if (!draft.metrics) {
            draft.metrics = {
              coreWebVitals: { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 },
              loadTimes: { ttfb: 0, fcp: 0, domReady: 0, loadComplete: 0 },
              bundleSize: { js: 0, css: 0, images: 0, fonts: 0, total: 0 },
              memoryUsage: { used: 0, total: 0, percentage: 0 },
              networkInfo: {
                type: 'unknown',
                effectiveType: '4g',
                downlink: 0,
                rtt: 0,
              },
              cacheHitRate: 0,
              deviceType: 'desktop',
              timestamp: new Date().toISOString(),
            };
          }
          draft.metrics.coreWebVitals[metric] = value;
          draft.metrics.timestamp = new Date().toISOString();
        });

        // Update score and check alerts
        const updatedMetrics = get().metrics;
        if (updatedMetrics) {
          const newScore = get().calculateScore(updatedMetrics);
          set((draft) => {
            draft.score = newScore;
          });
          get().checkAlerts(updatedMetrics);
        }
      },

      trackResourceTiming: (resource: ResourceTiming) => {
        set((draft) => {
          draft.resourceTimings.unshift(resource);
          // Keep only the last 100 resource timings
          if (draft.resourceTimings.length > 100) {
            draft.resourceTimings = draft.resourceTimings.slice(0, 100);
          }
        });
      },

      trackStoreRender: (storeName: string, renderTime: number) => {
        set((draft) => {
          const current = draft.storeMetrics.get(storeName) || {
            renderCount: 0,
            lastRenderTime: 0,
            averageRenderTime: 0,
            slowRenders: 0,
          };

          current.renderCount++;
          current.lastRenderTime = renderTime;
          current.averageRenderTime =
            (current.averageRenderTime * (current.renderCount - 1) +
              renderTime) /
            current.renderCount;

          if (renderTime > 16) {
            current.slowRenders++;
          }

          draft.storeMetrics.set(storeName, current);
        });

        // Log slow renders in development
        if (process.env.NODE_ENV === 'development' && renderTime > 50) {
          logger.warn(
            `🐌 Slow render detected in ${storeName}: ${renderTime}ms`
          );
        }
      },

      checkAlerts: (metrics: PerformanceMetrics) => {
        const { config } = get();
        const newAlerts: PerformanceAlert[] = [];

        // Check LCP
        if (metrics.coreWebVitals.lcp > config.alertThresholds.lcp) {
          newAlerts.push({
            id: `lcp-${Date.now()}`,
            type: 'warning',
            metric: 'lcp',
            value: metrics.coreWebVitals.lcp,
            threshold: config.alertThresholds.lcp,
            message: `Largest Contentful Paint is ${metrics.coreWebVitals.lcp}ms (threshold: ${config.alertThresholds.lcp}ms)`,
            timestamp: new Date().toISOString(),
          });
        }

        // Check FID
        if (metrics.coreWebVitals.fid > config.alertThresholds.fid) {
          newAlerts.push({
            id: `fid-${Date.now()}`,
            type: 'warning',
            metric: 'fid',
            value: metrics.coreWebVitals.fid,
            threshold: config.alertThresholds.fid,
            message: `First Input Delay is ${metrics.coreWebVitals.fid}ms (threshold: ${config.alertThresholds.fid}ms)`,
            timestamp: new Date().toISOString(),
          });
        }

        // Check CLS
        if (metrics.coreWebVitals.cls > config.alertThresholds.cls) {
          newAlerts.push({
            id: `cls-${Date.now()}`,
            type: 'error',
            metric: 'cls',
            value: metrics.coreWebVitals.cls,
            threshold: config.alertThresholds.cls,
            message: `Cumulative Layout Shift is ${metrics.coreWebVitals.cls} (threshold: ${config.alertThresholds.cls})`,
            timestamp: new Date().toISOString(),
          });
        }

        if (newAlerts.length > 0) {
          set((draft) => {
            draft.alerts.push(...newAlerts);
          });
        }
      },

      dismissAlert: (alertId: string) => {
        set((draft) => {
          const alert = draft.alerts.find((a) => a.id === alertId);
          if (alert) {
            alert.dismissed = true;
          }
        });
      },

      dismissAllAlerts: () => {
        set((draft) => {
          draft.alerts.forEach((alert) => {
            alert.dismissed = true;
          });
        });
      },

      updateConfig: (newConfig: Partial<PerformanceConfig>) => {
        set((draft) => {
          draft.config = { ...draft.config, ...newConfig };
        });
      },

      clearError: () => {
        set((draft) => {
          draft.error = null;
        });
      },

      reset: () => {
        set((draft) => {
          draft.metrics = null;
          draft.score = null;
          draft.alerts = [];
          draft.resourceTimings = [];
          draft.isLoading = false;
          draft.isTracking = false;
          draft.error = null;
          draft.lastUpdate = null;
          draft.storeMetrics.clear();
        });
      },

      exportReport: async (): Promise<Blob> => {
        const state = get();
        const report = {
          metrics: state.metrics,
          score: state.score,
          alerts: state.alerts.filter((a) => !a.dismissed),
          resourceTimings: state.resourceTimings,
          storeMetrics: Object.fromEntries(state.storeMetrics),
          exportedAt: new Date().toISOString(),
        };

        return new Blob([JSON.stringify(report, null, 2)], {
          type: 'application/json',
        });
      },

      // Private methods
      collectRealTimeMetrics: () => {
        if (typeof window === 'undefined') return;

        // Collect Core Web Vitals using Performance Observer API
        if ('PerformanceObserver' in window) {
          // LCP Observer
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              get().trackMetric('lcp', lastEntry.startTime);
            }
          });
          lcpObserver.observe({
            type: 'largest-contentful-paint',
            buffered: true,
          });

          // FID Observer
          const fidObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            for (const entry of entries) {
              const eventEntry = entry as PerformanceEventTiming;
              get().trackMetric(
                'fid',
                eventEntry.processingStart - eventEntry.startTime
              );
            }
          });
          fidObserver.observe({ type: 'first-input', buffered: true });

          // CLS Observer
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              const layoutShiftEntry = entry as PerformanceEntry & {
                value: number;
                hadRecentInput: boolean;
              };
              if (!layoutShiftEntry.hadRecentInput) {
                clsValue += layoutShiftEntry.value;
              }
            }
            get().trackMetric('cls', clsValue);
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });
        }

        // Collect other metrics periodically
        const { config } = get();
        setInterval(() => {
          if (!get().isTracking) return;

          // Memory usage
          if (performance.memory) {
            const memory = performance.memory;
            const memoryUsage = {
              used: memory.usedJSHeapSize,
              total: memory.totalJSHeapSize,
              percentage:
                (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
            };

            set((draft) => {
              if (draft.metrics) {
                draft.metrics.memoryUsage = memoryUsage;
              }
            });
          }

          // Network information
          if (navigator.connection) {
            const connection = navigator.connection;
            const networkInfo = {
              type: connection.type || 'unknown',
              effectiveType: connection.effectiveType || '4g',
              downlink: connection.downlink || 0,
              rtt: connection.rtt || 0,
            };

            set((draft) => {
              if (draft.metrics) {
                draft.metrics.networkInfo = networkInfo;
              }
            });
          }
        }, config.reportingInterval);
      },
    })),
    {
      name: 'unified-performance-store',
    }
  )
);

// === Utility Functions ===
export const getPerformanceRecommendations = (
  metrics: PerformanceMetrics
): string[] => {
  const recommendations: string[] = [];

  if (metrics.coreWebVitals.lcp > CORE_WEB_VITALS.LCP.GOOD) {
    recommendations.push(
      'Optimize Largest Contentful Paint (LCP): Consider lazy loading images and reducing server response times'
    );
  }

  if (metrics.coreWebVitals.fid > CORE_WEB_VITALS.FID.GOOD) {
    recommendations.push(
      'Improve First Input Delay (FID): Minimize JavaScript execution time and break up long tasks'
    );
  }

  if (metrics.coreWebVitals.cls > CORE_WEB_VITALS.CLS.GOOD) {
    recommendations.push(
      'Reduce Cumulative Layout Shift (CLS): Set size attributes on images and avoid inserting content above existing content'
    );
  }

  if (metrics.bundleSize.total > 1000) {
    recommendations.push(
      'Optimize bundle size: Consider code splitting and tree shaking to reduce bundle size'
    );
  }

  if (metrics.memoryUsage.percentage > 80) {
    recommendations.push(
      'Optimize memory usage: Consider using React.memo and cleaning up event listeners'
    );
  }

  return recommendations;
};

export const isGoodPerformance = (
  value: number,
  thresholds: { GOOD: number }
): boolean => {
  return value <= thresholds.GOOD;
};

export const needsImprovement = (
  value: number,
  thresholds: { GOOD: number; NEEDS_IMPROVEMENT: number }
): boolean => {
  return value > thresholds.GOOD && value <= thresholds.NEEDS_IMPROVEMENT;
};

export const isPoorPerformance = (
  value: number,
  thresholds: { NEEDS_IMPROVEMENT: number }
): boolean => {
  return value > thresholds.NEEDS_IMPROVEMENT;
};

// === Hook for Performance Monitoring ===
export const usePerformanceMonitoring = () => {
  const store = useUnifiedPerformanceStore();

  return {
    ...store,

    // Convenience methods
    getRecommendations: () =>
      store.metrics ? getPerformanceRecommendations(store.metrics) : [],

    getStoreMetrics: (storeName?: string) => {
      if (storeName) {
        return store.storeMetrics.get(storeName);
      }
      return Object.fromEntries(store.storeMetrics);
    },

    isGoodOverallPerformance: () => {
      return store.score !== null && store.score >= 90;
    },

    getActiveAlerts: () => store.alerts.filter((alert) => !alert.dismissed),
  };
};

export default useUnifiedPerformanceStore;
