'use client';

import React, { Suspense, lazy } from 'react';
import { UnifiedLoading } from './UnifiedLoading';

// Lazy load heavy components for better performance
export const LazyPerformanceMonitor = lazy(() =>
  import('./PerformanceMonitor').then((module) => ({
    default: module.PerformanceMonitor,
  }))
);

export const LazyAnalyticsDashboard = lazy(() =>
  import('./AnalyticsDashboard').then((module) => ({
    default: module.AnalyticsDashboard,
  }))
);

export const LazyPortfolioGallery = lazy(() =>
  import('./PortfolioGallery').then((module) => ({
    default: module.PortfolioGallery,
  }))
);

export const LazyNotificationCenter = lazy(() =>
  import('./NotificationCenter').then((module) => ({
    default: module.NotificationCenter,
  }))
);

export const LazyMapView = lazy(() =>
  import('./MapView').then((module) => ({ default: module.MapView }))
);

// Simple HOC for wrapping lazy components with Suspense
export function withSuspense<T extends Record<string, unknown>>(
  Component: React.LazyExoticComponent<React.ComponentType<T>>,
  fallback?: React.ReactNode
) {
  const ComponentWithSuspense = (props: T) => (
    <Suspense fallback={fallback || <UnifiedLoading variant="skeleton" />}>
      <Component {...props} />
    </Suspense>
  );

  ComponentWithSuspense.displayName = `withSuspense(Component)`;
  return ComponentWithSuspense;
}

// Pre-configured lazy components with loading states
export const PerformanceMonitorWithLoading = withSuspense(
  LazyPerformanceMonitor,
  <UnifiedLoading variant="skeleton" size="lg" />
);

export const AnalyticsDashboardWithLoading = withSuspense(
  LazyAnalyticsDashboard,
  <UnifiedLoading variant="dots" size="lg" />
);

export const PortfolioGalleryWithLoading = withSuspense(
  LazyPortfolioGallery,
  <UnifiedLoading variant="skeleton" />
);

export const NotificationCenterWithLoading = withSuspense(
  LazyNotificationCenter,
  <UnifiedLoading variant="dots" size="sm" />
);

export const MapViewWithLoading = withSuspense(
  LazyMapView,
  <UnifiedLoading variant="spinner" size="lg" />
);

// Component preloader hook for anticipating user interactions
export function useComponentPreloader() {
  const preloadComponent = React.useCallback(async (componentName: string) => {
    try {
      switch (componentName) {
        case 'performance-monitor':
          await import('./PerformanceMonitor');
          break;
        case 'analytics-dashboard':
          await import('./AnalyticsDashboard');
          break;
        case 'portfolio-gallery':
          await import('./PortfolioGallery');
          break;
        case 'notification-center':
          await import('./NotificationCenter');
          break;
        case 'map-view':
          await import('./MapView');
          break;
        default:
          console.warn(`Unknown component: ${componentName}`);
      }
    } catch (error) {
      console.error(`Failed to preload component ${componentName}:`, error);
    }
  }, []);

  const preloadOnHover = React.useCallback(
    (componentName: string) => ({
      onMouseEnter: () => preloadComponent(componentName),
      onFocus: () => preloadComponent(componentName),
    }),
    [preloadComponent]
  );

  return {
    preloadComponent,
    preloadOnHover,
  };
}

// Batch preloader for critical components
export function useCriticalComponentsPreloader() {
  React.useEffect(() => {
    const preloadCritical = async () => {
      // Preload components likely to be used within 3 seconds
      try {
        await Promise.all([
          import('./NotificationCenter').catch(() => {}),
          import('./PerformanceMonitor').catch(() => {}),
        ]);
      } catch (error) {
        console.error('Failed to preload critical components:', error);
      }
    };

    // Preload after initial render
    const timer = setTimeout(preloadCritical, 2000);
    return () => clearTimeout(timer);
  }, []);
}
