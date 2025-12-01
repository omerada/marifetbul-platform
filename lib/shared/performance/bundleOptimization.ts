// ================================================
// BUNDLE OPTIMIZATION UTILITIES
// ================================================
// Advanced bundle optimization for production performance

import logger from '@/lib/infrastructure/monitoring/logger';

export interface BundleAnalysisReport {
  totalSize: number;
  chunkCount: number;
  largestChunks: Array<{
    name: string;
    size: number;
    modules: string[];
  }>;
  recommendations: string[];
}

export function analyzeBundleSize(): BundleAnalysisReport {
  // Bundle analysis - integrate with webpack-bundle-analyzer for detailed reports
  return {
    totalSize: 0,
    chunkCount: 0,
    largestChunks: [],
    recommendations: [
      'Consider code splitting for large components',
      'Implement dynamic imports for admin features',
      'Use React.lazy for dashboard components',
    ],
  };
}

// ================================
// PRELOAD STRATEGIES
// ================================

export const preloadCriticalRoutes = () => {
  if (typeof window !== 'undefined') {
    // Preload on interaction
    const preloadOnHover = (
      selector: string,
      importFn: () => Promise<unknown>
    ) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        element.addEventListener(
          'mouseenter',
          () => {
            importFn().catch(() => {
              // Silently handle preload failures
            });
          },
          { once: true }
        );
      });
    };

    // Preload critical routes on hover
    preloadOnHover('[href="/dashboard"]', () => import('@/app/dashboard/page'));
    preloadOnHover(
      '[href="/marketplace"]',
      () => import('@/app/marketplace/page')
    );
    preloadOnHover(
      '[href^="/profile"]',
      () => import('@/app/profile/[id]/page')
    );
  }
};

// ================================
// RESOURCE HINTS
// ================================

export const addResourceHints = () => {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Preconnect to external domains
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://api.marifetbul.com',
    ];

    preconnectDomains.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }
};

// ================================
// CHUNK OPTIMIZATION
// ================================

export interface ChunkConfig {
  vendor: string[];
  common: string[];
  pages: Record<string, string[]>;
}

export const optimizedChunkConfig: ChunkConfig = {
  vendor: ['react', 'react-dom', 'next', 'zustand', 'react-hook-form', 'zod'],
  common: [
    '@/components/ui',
    '@/components/shared',
    '@/lib/utils',
    '@/hooks/shared',
  ],
  pages: {
    admin: [
      '@/components/domains/admin',
      '@/hooks/business/useAdminDashboard',
      '@/lib/core/store/admin-dashboard',
    ],
    marketplace: [
      '@/components/domains/marketplace',
      '@/components/domains/jobs',
      '@/components/domains/packages',
    ],
    profile: ['@/components/domains/profile', '@/hooks/business/useProfile'],
  },
};

// ================================
// INITIALIZATION
// ================================

export const initializeBundleOptimization = () => {
  if (typeof window !== 'undefined') {
    // Add resource hints
    addResourceHints();

    // Preload critical routes after page load
    window.addEventListener('load', () => {
      setTimeout(preloadCriticalRoutes, 1000);
    });

    // Performance monitoring
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming;
          const loadTime = navigation.loadEventEnd - navigation.loadEventStart;

          if (loadTime > 3000) {
            logger.warn('Slow page load detected', {
              component: 'BundleOptimization',
              error: new Error(`Load time: ${loadTime}ms`),
            });
          }
        }, 0);
      });
    }
  }
};

// Auto-initialize
if (typeof window !== 'undefined') {
  initializeBundleOptimization();
}

export default {
  analyzeBundleSize,
  preloadCriticalRoutes,
  addResourceHints,
  optimizedChunkConfig,
  initializeBundleOptimization,
};
