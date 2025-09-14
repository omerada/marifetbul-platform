// ================================================
// PERFORMANCE OPTIMIZATION - LAZY COMPONENTS
// ================================================
// Lazy loaded components for better performance and code splitting

import React, { lazy, Suspense, ComponentType, useEffect } from 'react';
import { UnifiedLoading } from '@/components/ui/UnifiedLoadingSystem';

// ================================
// GENERIC LAZY WRAPPER
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

export function createLazyComponent<T extends Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);

  const LazyComponentWrapper: React.FC<T> = (props) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...(props as T)} />
    </LazyWrapper>
  );

  LazyComponentWrapper.displayName = 'LazyComponentWrapper';

  return LazyComponentWrapper;
}

// ================================
// PRELOADER FOR CRITICAL PATHS
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
      // Preload critical components that exist
      import('@/components/ui/UnifiedButton');
      import('@/components/ui/UnifiedImage');
    });
  }
};

// ================================
// COMPONENT LAZY FACTORIES
// ================================

// Generic lazy component for any component path
export const createComponentLazy = (componentPath: string) =>
  lazy(() => import(componentPath));

// ================================
// PERFORMANCE UTILITIES
// ================================

interface PerformanceMonitorProps {
  componentName: string;
  children: React.ReactNode;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
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

export const getCachedComponent = <T extends Record<string, unknown>>(
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

// ================================
// MEMO WRAPPER FOR PERFORMANCE
// ================================

export function withMemo<T extends Record<string, unknown>>(
  Component: ComponentType<T>,
  arePropsEqual?: (prevProps: T, nextProps: T) => boolean
): ComponentType<T> {
  return React.memo(Component, arePropsEqual);
}

// ================================
// BUNDLE SIZE OPTIMIZATION
// ================================

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

// Initialize optimization
if (typeof window !== 'undefined') {
  optimizeBundle();
  preloadCriticalComponents();
}

const performanceUtils = {
  LazyWrapper,
  createLazyComponent,
  preloadCriticalComponents,
  PerformanceMonitor,
  withMemo,
  getCachedComponent,
};

export default performanceUtils;
