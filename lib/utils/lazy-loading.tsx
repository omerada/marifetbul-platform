import React, { lazy, Suspense, ComponentType } from 'react';

// Import unified skeleton system
import {
  SkeletonComponent,
  SkeletonCard,
  SkeletonPage,
} from '@/components/ui/UnifiedSkeleton';

// ================================================
// LAZY LOADING UTILITIES
// ================================================

/**
 * Create a lazy-loaded component with performance tracking
 */
export function createLazyComponent<
  T extends ComponentType<Record<string, unknown>>,
>(importFn: () => Promise<{ default: T }>, componentName: string) {
  const LazyComponent = lazy(async () => {
    const startTime = performance.now();

    try {
      const moduleExport = await importFn();
      const loadTime = performance.now() - startTime;

      if (process.env.NODE_ENV === 'development') {
        console.log(`Lazy loaded ${componentName} in ${loadTime.toFixed(2)}ms`);
      }

      return moduleExport;
    } catch (error) {
      console.error(`Failed to lazy load ${componentName}:`, error);
      throw error;
    }
  });

  return LazyComponent;
}

/**
 * Higher-order component for adding Suspense wrapper
 */
export function withSuspense<P extends Record<string, unknown>>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  const WithSuspenseComponent = (props: P) => (
    <Suspense fallback={fallback || <ComponentLoadingSkeleton />}>
      <Component {...props} />
    </Suspense>
  );

  WithSuspenseComponent.displayName = `withSuspense(${Component.displayName || Component.name})`;
  return WithSuspenseComponent;
}

/**
 * Loading skeleton component
 */
export function ComponentLoadingSkeleton() {
  return <SkeletonComponent lines={3} hasImage={true} hasActions={true} />;
}

/**
 * Card loading skeleton
 */
export function CardLoadingSkeleton() {
  return <SkeletonCard variant="detailed" />;
}

/**
 * Page loading component
 */
export function PageLoadingSkeleton() {
  return <SkeletonPage layout="grid" />;
}

// ================================================
// PERFORMANCE MONITORING
// ================================================

/**
 * Component performance tracker
 */
export function useComponentPerformance(componentName: string) {
  const startTime = performance.now();

  React.useEffect(() => {
    return () => {
      const endTime = performance.now();
      const componentLifetime = endTime - startTime;

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `Component ${componentName} lifetime: ${componentLifetime.toFixed(2)}ms`
        );
      }
    };
  }, [componentName, startTime]);
}

/**
 * Render performance hook
 */
export function useRenderPerformance(componentName: string) {
  const renderCount = React.useRef(0);
  const lastRenderTime = React.useRef(performance.now());

  React.useLayoutEffect(() => {
    const currentTime = performance.now();
    const renderTime = currentTime - lastRenderTime.current;
    renderCount.current += 1;

    // Log excessive re-renders
    if (process.env.NODE_ENV === 'development' && renderCount.current > 10) {
      console.warn(
        `Component ${componentName} has rendered ${renderCount.current} times`
      );
    }

    if (renderTime > 16) {
      console.warn(
        `Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`
      );
    }

    lastRenderTime.current = currentTime;
  });

  return {
    renderCount: renderCount.current,
    componentName,
  };
}

// ================================================
// CODE SPLITTING UTILITIES
// ================================================

/**
 * Dynamic import with retry mechanism
 */
export async function dynamicImportWithRetry<T>(
  importFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await importFn();
    } catch (error) {
      lastError = error as Error;

      if (i < maxRetries - 1) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
        console.warn(`Import failed, retrying... (${i + 1}/${maxRetries})`);
      }
    }
  }

  throw lastError!;
}

/**
 * Preload component for better UX
 */
export function preloadComponent<
  T extends ComponentType<Record<string, unknown>>,
>(importFn: () => Promise<{ default: T }>) {
  // Start loading immediately but don't block
  importFn().catch((error) => {
    console.warn('Component preload failed:', error);
  });
}

// ================================================
// EXPORTS
// ================================================

const LazyLoadingUtils = {
  createLazyComponent,
  withSuspense,
  ComponentLoadingSkeleton,
  CardLoadingSkeleton,
  PageLoadingSkeleton,
  useComponentPerformance,
  useRenderPerformance,
  dynamicImportWithRetry,
  preloadComponent,
};

export default LazyLoadingUtils;
