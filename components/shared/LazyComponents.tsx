/* eslint-disable no-console */
'use client';

import React, {
  Suspense,
  lazy,
  ComponentType,
  useEffect,
  useCallback,
} from 'react';
import { UnifiedLoading } from '@/components/ui/UnifiedLoadingSystem';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// UNIFIED LAZY LOADING SYSTEM
// ================================================

// Consolidated lazy loading utilities for optimal performance

// ================================
// CORE LAZY WRAPPER
// ================================

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  className,
}) => (
  <Suspense
    fallback={
      fallback || (
        <div className={className}>
          <UnifiedLoading variant="spinner" size="lg" text="Yükleniyor..." />
        </div>
      )
    }
  >
    {children}
  </Suspense>
);

// ================================
// LAZY COMPONENT FACTORY
// ================================

export function createLazyComponent<T = Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);

  const LazyComponentWrapper: React.FC<T> = (props) => (
    <LazyWrapper fallback={fallback}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <LazyComponent {...(props as any)} />
    </LazyWrapper>
  );

  LazyComponentWrapper.displayName = 'LazyComponentWrapper';
  return LazyComponentWrapper;
}

// HOC for wrapping lazy components with Suspense
export function withSuspense<T = Record<string, unknown>>(
  Component: React.LazyExoticComponent<React.ComponentType<T>>,
  fallback?: React.ReactNode
) {
  const ComponentWithSuspense = (props: T) => (
    <Suspense fallback={fallback || <UnifiedLoading variant="skeleton" />}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Component {...(props as any)} />
    </Suspense>
  );

  ComponentWithSuspense.displayName = `withSuspense(Component)`;
  return ComponentWithSuspense;
}

// ================================
// PREDEFINED LAZY COMPONENTS
// ================================

// Feature components
export const LazyPerformanceMonitor = lazy(() =>
  import('@/components/shared/utilities/PerformanceMonitor').then((module) => ({
    default: module.PerformanceMonitor,
  }))
);

export const LazyAnalyticsDashboard = lazy(() =>
  import('@/components/domains/analytics').then((module) => ({
    default: module.AnalyticsDashboard,
  }))
);

export const LazyPortfolioGallery = lazy(() =>
  import('@/components/domains/profile').then((module) => ({
    default: module.PortfolioGallery,
  }))
);

export const LazyNotificationCenter = lazy(() =>
  import('@/components/domains/notifications').then((module) => ({
    default: module.NotificationCenter,
  }))
);

export const LazyMapView = lazy(() =>
  import('@/components/shared/utilities/MapView').then((module) => ({
    default: module.MapView,
  }))
);

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

// ================================
// COMPONENT PRELOADER HOOKS
// ================================

export function useComponentPreloader() {
  const preloadComponent = useCallback(async (componentName: string) => {
    try {
      switch (componentName) {
        case 'performance-monitor':
          await import('@/components/shared/utilities/PerformanceMonitor');
          break;
        case 'analytics-dashboard':
          await import('@/components/domains/analytics');
          break;
        case 'portfolio-gallery':
          await import('@/components/domains/profile');
          break;
        case 'notification-center':
          await import('@/components/domains/notifications');
          break;
        case 'map-view':
          await import('@/components/shared/utilities/MapView');
          break;
        default:
          logger.warn(`Unknown component: ${componentName}`);
      }
    } catch (error) {
      logger.error(`Failed to preload component ${componentName}:`, error instanceof Error ? error : new Error(String(error)));
    }
  }, []);

  const preloadOnHover = useCallback(
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

// Critical components preloader
export function useCriticalComponentsPreloader() {
  useEffect(() => {
    const preloadCritical = async () => {
      // Preload components likely to be used within 3 seconds
      try {
        await Promise.all([
          import('@/components/domains/notifications').catch(() => {}),
          import('@/components/shared/utilities/PerformanceMonitor').catch(
            () => {}
          ),
          import('@/components/ui/UnifiedButton').catch(() => {}),
          import('@/components/ui/UnifiedImage').catch(() => {}),
        ]);
      } catch (error) {
        logger.error('Failed to preload critical components:', error instanceof Error ? error : new Error(String(error)));
      }
    };

    // Preload after initial render
    const timer = setTimeout(preloadCritical, 2000);
    return () => clearTimeout(timer);
  }, []);
}

// ================================
// PERFORMANCE UTILITIES
// ================================

interface PerformanceMonitorProps {
  componentName: string;
  children: React.ReactNode;
}

export const ComponentPerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  componentName,
  children,
}) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.time(`${componentName} render`);

      return () => {
        console.timeEnd(`${componentName} render`);
      };
    }
  }, [componentName]);

  return <>{children}</>;
};

// Memory efficient component cache
const componentCache = new Map<
  string,
  ComponentType<Record<string, unknown>>
>();

export const getCachedComponent = <T = Record<string, unknown>,>(
  key: string,
  factory: () => ComponentType<T>
): ComponentType<T> => {
  if (!componentCache.has(key)) {
    componentCache.set(
      key,
      factory() as ComponentType<Record<string, unknown>>
    );
  }
  return componentCache.get(key)! as ComponentType<T>;
};

// HOC for performance optimization with React.memo
export function withMemo<T = Record<string, unknown>>(
  Component: ComponentType<T>,
  arePropsEqual?: (prevProps: T, nextProps: T) => boolean
) {
  return React.memo(Component, arePropsEqual) as ComponentType<T>;
}

// ================================
// BUNDLE OPTIMIZATION
// ================================

export const preloadCriticalComponents = () => {
  if (typeof window !== 'undefined') {
    const preload = (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(callback);
      } else {
        setTimeout(callback, 100);
      }
    };

    preload(() => {
      // Preload critical UI components
      import('@/components/ui/UnifiedButton').catch(() => {});
      import('@/components/ui/UnifiedImage').catch(() => {});
    });
  }
};

export const optimizeBundle = () => {
  if (typeof window !== 'undefined') {
    // Clear component cache periodically to prevent memory leaks
    const interval = setInterval(
      () => {
        if (componentCache.size > 50) {
          componentCache.clear();
        }
      },
      5 * 60 * 1000
    ); // Every 5 minutes

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(interval);
      componentCache.clear();
    });
  }
};

// Generic lazy component for any component path
// Note: Dynamic imports are not supported in Turbopack builds
// Use static imports instead
// export const createComponentLazy = (componentPath: string) =>
//   lazy(() => import(componentPath));

// ================================
// INITIALIZATION
// ================================

if (typeof window !== 'undefined') {
  optimizeBundle();
  preloadCriticalComponents();
}

// ================================
// DEFAULT EXPORT
// ================================

const LazyComponentsUtils = {
  LazyWrapper,
  createLazyComponent,
  withSuspense,
  useComponentPreloader,
  useCriticalComponentsPreloader,
  ComponentPerformanceMonitor,
  withMemo,
  getCachedComponent,
  preloadCriticalComponents,
  optimizeBundle,
  // createComponentLazy, // Disabled: dynamic imports not supported in Turbopack

  // Pre-configured components
  LazyPerformanceMonitor,
  LazyAnalyticsDashboard,
  LazyPortfolioGallery,
  LazyNotificationCenter,
  LazyMapView,

  // With loading states
  PerformanceMonitorWithLoading,
  AnalyticsDashboardWithLoading,
  PortfolioGalleryWithLoading,
  NotificationCenterWithLoading,
  MapViewWithLoading,
};

export default LazyComponentsUtils;
