import { createOptimizedStore } from './optimized';
import {
  PerformanceMetrics,
  PerformanceScore,
  PerformanceAlert,
  PerformanceConfig,
  PerformanceThresholds,
  ResourceTiming,
  CoreWebVitals,
} from '@/types/shared/performance';

interface PerformanceStore {
  // State
  metrics: PerformanceMetrics | null;
  score: PerformanceScore | null;
  alerts: PerformanceAlert[];
  isLoading: boolean;
  error: string | null;
  config: PerformanceConfig;
  resourceTimings: ResourceTiming[];

  // Actions
  fetchMetrics: () => Promise<void>;
  trackMetric: (metric: keyof CoreWebVitals, value: number) => void;
  calculateScore: (metrics: PerformanceMetrics) => PerformanceScore;
  addAlert: (alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => void;
  clearAlerts: () => void;
  updateConfig: (config: Partial<PerformanceConfig>) => void;
  trackResourceTiming: (resource: ResourceTiming) => void;
  clearError: () => void;
  reset: () => void;
}

const defaultThresholds: PerformanceThresholds = {
  lcp: { good: 2.5, needsImprovement: 4.0 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  fcp: { good: 1.8, needsImprovement: 3.0 },
  ttfb: { good: 800, needsImprovement: 1800 },
};

const defaultConfig: PerformanceConfig = {
  thresholds: defaultThresholds,
  enableTracking: true,
  enableAlerts: true,
  sampleRate: 0.1, // Track 10% of sessions
};

export const usePerformanceStore = createOptimizedStore<PerformanceStore>(
  (set, get) => ({
    // Initial state
    metrics: null,
    score: null,
    alerts: [],
    isLoading: false,
    error: null,
    config: defaultConfig,
    resourceTimings: [],

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
        const metrics = data.data;
        const score = get().calculateScore(metrics);

        set((draft) => {
          draft.metrics = metrics;
          draft.score = score;
          draft.isLoading = false;
        });
      } catch (error) {
        set((draft) => {
          draft.error =
            error instanceof Error ? error.message : 'Unknown error';
          draft.isLoading = false;
        });
      }
    },

    // Optimized metric tracking with proper typing
    trackMetric: (metric: keyof CoreWebVitals, value: number) => {
      const { config } = get();
      if (!config.enableTracking) return;

      // Sample based on configured rate
      if (Math.random() > config.sampleRate) return;

      set((draft) => {
        if (!draft.metrics) {
          draft.metrics = {
            coreWebVitals: {
              lcp: 0,
              fid: 0,
              cls: 0,
              fcp: 0,
              ttfb: 0,
            },
            loadTimes: { ttfb: 0, fcp: 0, domReady: 0, loadComplete: 0 },
            bundleSize: { js: 0, css: 0, images: 0, fonts: 0, total: 0 },
            cacheHitRate: 0,
            networkType: 'unknown',
            deviceType: 'desktop',
            timestamp: new Date().toISOString(),
          };
        }
        draft.metrics.coreWebVitals[metric] = value;
        draft.metrics.timestamp = new Date().toISOString();
      });
    },

    calculateScore: (metrics: PerformanceMetrics): PerformanceScore => {
      const { thresholds } = get().config;
      const vitals = metrics.coreWebVitals;

      const scores = {
        lcp: calculateMetricScore(vitals.lcp, thresholds.lcp),
        fid: calculateMetricScore(vitals.fid, thresholds.fid),
        cls: calculateMetricScore(vitals.cls, thresholds.cls, true),
        fcp: calculateMetricScore(vitals.fcp, thresholds.fcp),
        ttfb: calculateMetricScore(vitals.ttfb, thresholds.ttfb),
      };

      const overallScore = Math.round(
        (scores.lcp + scores.fid + scores.cls + scores.fcp + scores.ttfb) / 5
      );

      return {
        overall: overallScore,
        breakdown: scores,
        grade:
          overallScore >= 90
            ? 'excellent'
            : overallScore >= 80
              ? 'good'
              : overallScore >= 60
                ? 'needs-improvement'
                : 'poor',
      };
    },

    addAlert: (alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => {
      const { config } = get();
      if (!config.enableAlerts) return;

      const newAlert: PerformanceAlert = {
        ...alert,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };

      set((draft) => {
        draft.alerts.push(newAlert);
        // Keep only last 20 alerts
        if (draft.alerts.length > 20) {
          draft.alerts = draft.alerts.slice(-20);
        }
      });
    },

    clearAlerts: () =>
      set((draft) => {
        draft.alerts = [];
      }),

    updateConfig: (newConfig: Partial<PerformanceConfig>) => {
      set((draft) => {
        Object.assign(draft.config, newConfig);
      });
    },

    trackResourceTiming: (resource: ResourceTiming) => {
      set((draft) => {
        draft.resourceTimings.push(resource);
        // Keep last 50 resource timings
        if (draft.resourceTimings.length > 50) {
          draft.resourceTimings = draft.resourceTimings.slice(-50);
        }
      });
    },

    clearError: () =>
      set((draft) => {
        draft.error = null;
      }),

    reset: () =>
      set((draft) => {
        draft.metrics = null;
        draft.score = null;
        draft.alerts = [];
        draft.isLoading = false;
        draft.error = null;
        draft.resourceTimings = [];
      }),
  }),
  'performance-store'
);

// Helper function to calculate individual metric scores
function calculateMetricScore(
  value: number,
  threshold: { good: number; needsImprovement: number },
  inverse = false // For CLS, lower is better
): number {
  const { good, needsImprovement } = threshold;

  if (!inverse) {
    // For most metrics, lower is better
    if (value <= good) return 100;
    if (value >= needsImprovement) return 0;
    return Math.round(100 - ((value - good) / (needsImprovement - good)) * 100);
  } else {
    // For CLS, handle inverse logic
    if (value <= good) return 100;
    if (value >= needsImprovement) return 0;
    return Math.round(100 - ((value - good) / (needsImprovement - good)) * 100);
  }
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const store = usePerformanceStore();

  return {
    ...store,
    // Additional utility methods
    trackPageLoad: () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        store.trackMetric(
          'ttfb',
          navigation.responseStart - navigation.fetchStart
        );
        store.trackMetric(
          'fcp',
          navigation.loadEventEnd - navigation.fetchStart
        );
      }
    },

    trackLargestContentfulPaint: () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          store.trackMetric('lcp', lastEntry.startTime);
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        return () => observer.disconnect();
      }
    },

    trackCumulativeLayoutShift: () => {
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            const layoutShiftEntry = entry as PerformanceEntry & {
              value: number;
              hadRecentInput: boolean;
            };
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
            }
          }
          store.trackMetric('cls', clsValue);
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        return () => observer.disconnect();
      }
    },
  };
}
