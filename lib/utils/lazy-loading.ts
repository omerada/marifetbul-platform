// Lazy loading utilities for better performance - NON-JSX VERSION
import { lazy, ComponentType } from 'react';

// Higher-order component for lazy loading
export function withLazyLoading<T extends ComponentType<unknown>>(
  importFunction: () => Promise<{ default: T }>
) {
  return lazy(importFunction);
}

// Preload function for better UX
export function preloadComponent(importFunction: () => Promise<unknown>) {
  return importFunction();
}

// Hook for lazy loading with preloading capability
export function useLazyComponent<T extends ComponentType<unknown>>(
  importFunction: () => Promise<{ default: T }>,
  shouldPreload = false
) {
  const LazyComponent = lazy(importFunction);

  if (shouldPreload) {
    preloadComponent(importFunction);
  }

  return LazyComponent;
}

// Utility for dynamic imports with error boundary
export async function safeDynamicImport<T>(
  importFunction: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await importFunction();
  } catch (error) {
    console.error('Dynamic import failed:', error);
    if (fallback) {
      return fallback;
    }
    throw error;
  }
}

// Bundle analysis helper
export function getBundleInfo() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    return {
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoaded:
        navigation.domContentLoadedEventEnd - navigation.fetchStart,
      transferSize: navigation.transferSize,
      encodedBodySize: navigation.encodedBodySize,
    };
  }
  return null;
}
