import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  PerformanceMetrics,
  PerformanceScore,
  PerformanceAlert,
  PerformanceConfig,
  PerformanceThresholds,
  ResourceTiming,
} from '@/types/performance';

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
  trackMetric: (name: string, value: number) => void;
  calculateScore: (metrics: PerformanceMetrics) => PerformanceScore;
  addAlert: (alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => void;
  clearAlerts: () => void;
  updateConfig: (config: Partial<PerformanceConfig>) => void;
  trackResourceTiming: (resource: ResourceTiming) => void;
  clearError: () => void;
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

export const usePerformanceStore = create<PerformanceStore>()(
  devtools(
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
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/v1/performance/metrics');
          if (!response.ok)
            throw new Error('Failed to fetch performance metrics');

          const data = await response.json();
          const metrics = data.data;
          const score = get().calculateScore(metrics);

          set({
            metrics,
            score,
            isLoading: false,
          });

          // Check for performance issues and create alerts
          const addAlert = get().addAlert;
          const thresholds = get().config.thresholds;

          // Check LCP
          if (
            metrics.coreWebVitals.lcp * 1000 >
            thresholds.lcp.needsImprovement
          ) {
            addAlert({
              type: 'error',
              metric: 'lcp',
              message: `LCP çok yavaş: ${(metrics.coreWebVitals.lcp * 1000).toFixed(0)}ms`,
              recommendation:
                "Büyük görselleri optimize edin ve kritik CSS'i inline yapın.",
            });
          }

          // Check FID
          if (metrics.coreWebVitals.fid > thresholds.fid.needsImprovement) {
            addAlert({
              type: 'error',
              metric: 'fid',
              message: `FID çok yüksek: ${metrics.coreWebVitals.fid}ms`,
              recommendation:
                "JavaScript execution time'ını azaltın ve code splitting kullanın.",
            });
          }

          // Check CLS
          if (metrics.coreWebVitals.cls > thresholds.cls.needsImprovement) {
            addAlert({
              type: 'error',
              metric: 'cls',
              message: `CLS çok yüksek: ${metrics.coreWebVitals.cls.toFixed(3)}`,
              recommendation:
                'Görseller için boyut belirtin ve dinamik içerik eklemelerini optimize edin.',
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      trackMetric: (name: string, value: number) => {
        // Send metric to analytics service
        if (typeof window !== 'undefined' && get().config.enableTracking) {
          // In a real app, this would send to analytics
          console.log(`Performance metric: ${name} = ${value}`);
        }
      },

      calculateScore: (metrics: PerformanceMetrics): PerformanceScore => {
        const { thresholds } = get().config;

        // Calculate individual scores (0-100)
        const lcpScore = calculateMetricScore(
          metrics.coreWebVitals.lcp * 1000,
          thresholds.lcp
        );
        const fidScore = calculateMetricScore(
          metrics.coreWebVitals.fid,
          thresholds.fid
        );
        const clsScore = calculateMetricScore(
          metrics.coreWebVitals.cls,
          thresholds.cls,
          true
        );
        const fcpScore = calculateMetricScore(
          metrics.coreWebVitals.fcp,
          thresholds.fcp
        );
        const ttfbScore = calculateMetricScore(
          metrics.loadTimes.ttfb,
          thresholds.ttfb
        );

        // Weighted overall score (LCP and CLS have higher weight)
        const overall = Math.round(
          lcpScore * 0.25 +
            fidScore * 0.2 +
            clsScore * 0.25 +
            fcpScore * 0.15 +
            ttfbScore * 0.15
        );

        const grade =
          overall >= 90
            ? 'excellent'
            : overall >= 75
              ? 'good'
              : overall >= 50
                ? 'needs-improvement'
                : 'poor';

        return {
          overall,
          breakdown: {
            lcp: lcpScore,
            fid: fidScore,
            cls: clsScore,
            fcp: fcpScore,
            ttfb: ttfbScore,
          },
          grade,
        };
      },

      addAlert: (alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => {
        if (!get().config.enableAlerts) return;

        const newAlert: PerformanceAlert = {
          ...alert,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          alerts: [...state.alerts, newAlert],
        }));
      },

      clearAlerts: () => set({ alerts: [] }),

      updateConfig: (newConfig: Partial<PerformanceConfig>) => {
        set((state) => ({
          config: { ...state.config, ...newConfig },
        }));
      },

      trackResourceTiming: (resource: ResourceTiming) => {
        set((state) => ({
          resourceTimings: [...state.resourceTimings, resource].slice(-50), // Keep last 50
        }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'performance-store',
    }
  )
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
