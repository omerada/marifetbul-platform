export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint (seconds)
  fid: number; // First Input Delay (milliseconds)
  cls: number; // Cumulative Layout Shift (score)
  fcp: number; // First Contentful Paint (milliseconds)
  ttfb: number; // Time to First Byte (milliseconds)
}

export interface LoadTimes {
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
  domReady: number; // DOM ready time
  loadComplete: number; // Complete load time
}

export interface BundleSize {
  js: number; // JavaScript bundle size (KB)
  css: number; // CSS bundle size (KB)
  images: number; // Images total size (KB)
  fonts: number; // Fonts total size (KB)
  total: number; // Total bundle size (KB)
}

export interface PerformanceMetrics {
  coreWebVitals: CoreWebVitals;
  loadTimes: LoadTimes;
  bundleSize: BundleSize;
  cacheHitRate: number; // Cache hit rate (0-1)
  networkType: string; // Network connection type
  deviceType: 'mobile' | 'tablet' | 'desktop';
  timestamp: string;
}

export interface PerformanceMetricsResponse {
  data: PerformanceMetrics;
}

export interface PerformanceThresholds {
  lcp: { good: number; needsImprovement: number }; // 2.5s, 4s
  fid: { good: number; needsImprovement: number }; // 100ms, 300ms
  cls: { good: number; needsImprovement: number }; // 0.1, 0.25
  fcp: { good: number; needsImprovement: number }; // 1.8s, 3s
  ttfb: { good: number; needsImprovement: number }; // 800ms, 1800ms
}

export interface PerformanceScore {
  overall: number; // 0-100
  breakdown: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  grade: 'excellent' | 'good' | 'needs-improvement' | 'poor';
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  metric: keyof CoreWebVitals | keyof LoadTimes;
  message: string;
  recommendation: string;
  timestamp: string;
}

export interface PerformanceConfig {
  thresholds: PerformanceThresholds;
  enableTracking: boolean;
  enableAlerts: boolean;
  sampleRate: number; // 0-1, percentage of sessions to track
}

export interface ResourceTiming {
  name: string;
  size: number;
  loadTime: number;
  type: 'script' | 'stylesheet' | 'image' | 'font' | 'other';
  cached: boolean;
}
