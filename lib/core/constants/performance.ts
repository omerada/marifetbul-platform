/**
 * Unified Performance Constants
 * Consolidates all performance thresholds, budgets, and configuration
 * Eliminates magic numbers scattered across the codebase
 */

// Core Web Vitals Thresholds (Google's official recommendations)
export const CORE_WEB_VITALS = {
  // Largest Contentful Paint (LCP) - milliseconds
  LCP: {
    GOOD: 2500,
    NEEDS_IMPROVEMENT: 4000,
    POOR: Infinity,
  },

  // First Input Delay (FID) - milliseconds
  FID: {
    GOOD: 100,
    NEEDS_IMPROVEMENT: 300,
    POOR: Infinity,
  },

  // Cumulative Layout Shift (CLS) - score
  CLS: {
    GOOD: 0.1,
    NEEDS_IMPROVEMENT: 0.25,
    POOR: Infinity,
  },

  // First Contentful Paint (FCP) - milliseconds
  FCP: {
    GOOD: 1800,
    NEEDS_IMPROVEMENT: 3000,
    POOR: Infinity,
  },

  // Time to First Byte (TTFB) - milliseconds
  TTFB: {
    GOOD: 800,
    NEEDS_IMPROVEMENT: 1800,
    POOR: Infinity,
  },
} as const;

// Performance Budgets for Development
export const PERFORMANCE_BUDGETS = {
  // JavaScript bundle sizes (KB)
  BUNDLE_SIZE: {
    JS: {
      GOOD: 300,
      WARNING: 500,
      ERROR: 800,
    },
    CSS: {
      GOOD: 50,
      WARNING: 100,
      ERROR: 200,
    },
    IMAGES: {
      GOOD: 1000,
      WARNING: 2000,
      ERROR: 5000,
    },
    TOTAL: {
      GOOD: 1500,
      WARNING: 3000,
      ERROR: 6000,
    },
  },

  // Network performance
  NETWORK: {
    REQUEST_COUNT: {
      GOOD: 50,
      WARNING: 100,
      ERROR: 150,
    },
    CACHE_HIT_RATE: {
      GOOD: 0.9,
      WARNING: 0.8,
      ERROR: 0.7,
    },
  },

  // Memory usage (MB)
  MEMORY: {
    HEAP_SIZE: {
      GOOD: 50,
      WARNING: 100,
      ERROR: 200,
    },
    COMPONENT_COUNT: {
      GOOD: 100,
      WARNING: 200,
      ERROR: 500,
    },
  },
} as const;

// UI Performance Constants
export const UI_PERFORMANCE = {
  // Animation frame rates
  ANIMATION: {
    TARGET_FPS: 60,
    MIN_FPS: 30,
    FRAME_BUDGET_MS: 16.67, // 1000/60
  },

  // List virtualization thresholds
  VIRTUALIZATION: {
    ITEM_HEIGHT: 80,
    OVERSCAN: 5,
    MIN_ITEMS_FOR_VIRTUAL: 50,
  },

  // Debounce intervals (milliseconds)
  DEBOUNCE: {
    SEARCH: 300,
    RESIZE: 150,
    SCROLL: 100,
    API_CALLS: 500,
  },

  // Auto-refresh intervals (milliseconds)
  REFRESH_INTERVALS: {
    REAL_TIME: 1000,
    FREQUENT: 3000,
    MODERATE: 30000,
    OCCASIONAL: 300000,
  },
} as const;

// API Performance Constants
export const API_PERFORMANCE = {
  // Timeout values (milliseconds)
  TIMEOUTS: {
    FAST: 5000,
    NORMAL: 10000,
    SLOW: 30000,
  },

  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY_MS: 1000,
    BACKOFF_MULTIPLIER: 2,
  },

  // Rate limiting
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 100,
    BURST_LIMIT: 20,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 12,
    MAX_PAGE_SIZE: 100,
    LARGE_LIST_THRESHOLD: 1000,
  },
} as const;

// Mobile Performance Constants
export const MOBILE_PERFORMANCE = {
  // Touch targets (pixels)
  TOUCH: {
    MIN_TARGET_SIZE: 44,
    RECOMMENDED_TARGET_SIZE: 48,
  },

  // Network considerations
  NETWORK: {
    SLOW_3G_SPEED: 400, // kbps
    FAST_3G_SPEED: 1600, // kbps
  },

  // Battery optimization
  BATTERY: {
    LOW_BATTERY_THRESHOLD: 0.2,
    CRITICAL_BATTERY_THRESHOLD: 0.1,
  },
} as const;

// Development & Testing Constants
export const DEVELOPMENT = {
  // Performance monitoring
  MONITORING: {
    SAMPLE_RATE: 0.1, // 10% of users
    SLOW_OPERATION_THRESHOLD: 1000, // ms
  },

  // Memory leak detection
  MEMORY_LEAK: {
    CHECK_INTERVAL: 10000, // ms
    THRESHOLD_INCREASE: 1.5, // 50% increase
  },

  // Bundle analysis
  BUNDLE_ANALYSIS: {
    SIZE_THRESHOLD_KB: 500,
    DUPLICATE_THRESHOLD: 0.1, // 10%
  },
} as const;

// Performance score calculation weights
export const PERFORMANCE_WEIGHTS = {
  LCP: 0.25,
  FID: 0.25,
  CLS: 0.25,
  FCP: 0.15,
  TTFB: 0.1,
} as const;

// Helper functions for performance scoring
export const calculatePerformanceScore = (metrics: {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}): number => {
  let score = 100;

  // LCP scoring
  if (metrics.lcp) {
    if (metrics.lcp > CORE_WEB_VITALS.LCP.NEEDS_IMPROVEMENT) {
      score -= 30 * PERFORMANCE_WEIGHTS.LCP;
    } else if (metrics.lcp > CORE_WEB_VITALS.LCP.GOOD) {
      score -= 15 * PERFORMANCE_WEIGHTS.LCP;
    }
  }

  // FID scoring
  if (metrics.fid) {
    if (metrics.fid > CORE_WEB_VITALS.FID.NEEDS_IMPROVEMENT) {
      score -= 30 * PERFORMANCE_WEIGHTS.FID;
    } else if (metrics.fid > CORE_WEB_VITALS.FID.GOOD) {
      score -= 15 * PERFORMANCE_WEIGHTS.FID;
    }
  }

  // CLS scoring
  if (metrics.cls) {
    if (metrics.cls > CORE_WEB_VITALS.CLS.NEEDS_IMPROVEMENT) {
      score -= 30 * PERFORMANCE_WEIGHTS.CLS;
    } else if (metrics.cls > CORE_WEB_VITALS.CLS.GOOD) {
      score -= 15 * PERFORMANCE_WEIGHTS.CLS;
    }
  }

  // FCP scoring
  if (metrics.fcp) {
    if (metrics.fcp > CORE_WEB_VITALS.FCP.NEEDS_IMPROVEMENT) {
      score -= 30 * PERFORMANCE_WEIGHTS.FCP;
    } else if (metrics.fcp > CORE_WEB_VITALS.FCP.GOOD) {
      score -= 15 * PERFORMANCE_WEIGHTS.FCP;
    }
  }

  // TTFB scoring
  if (metrics.ttfb) {
    if (metrics.ttfb > CORE_WEB_VITALS.TTFB.NEEDS_IMPROVEMENT) {
      score -= 30 * PERFORMANCE_WEIGHTS.TTFB;
    } else if (metrics.ttfb > CORE_WEB_VITALS.TTFB.GOOD) {
      score -= 15 * PERFORMANCE_WEIGHTS.TTFB;
    }
  }

  return Math.max(0, Math.round(score));
};

// Performance check helpers
export const isGoodPerformance = (
  metric: number,
  thresholds: { GOOD: number }
) => metric <= thresholds.GOOD;

export const needsImprovement = (
  metric: number,
  thresholds: { GOOD: number; NEEDS_IMPROVEMENT: number }
) => metric > thresholds.GOOD && metric <= thresholds.NEEDS_IMPROVEMENT;

export const isPoorPerformance = (
  metric: number,
  thresholds: { NEEDS_IMPROVEMENT: number }
) => metric > thresholds.NEEDS_IMPROVEMENT;
