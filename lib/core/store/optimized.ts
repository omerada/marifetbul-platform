import { create, StateCreator } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// OPTIMIZED STORE PATTERNS
// ================================================

/**
 * High-performance store creator with built-in optimizations
 */
export function createOptimizedStore<T>(
  initializer: StateCreator<T, [['zustand/immer', never]], []>,
  name: string
) {
  return create<T>()(
    devtools(subscribeWithSelector(immer(initializer)), { name })
  );
}

/**
 * Create store with automatic cleanup
 */
export function createCleanupStore<T extends { reset?: () => void }>(
  initializer: StateCreator<T, [['zustand/immer', never]], []>,
  name: string
) {
  const store = createOptimizedStore(initializer, name);

  // Auto-cleanup on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      const state = store.getState();
      if (state?.reset) {
        state.reset();
      }
    });
  }

  return store;
}

// ================================================
// PERFORMANCE MONITORING
// ================================================

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  slowRenders: number;
}

/**
 * Store performance monitor
 */
export class StorePerformanceMonitor {
  private static instance: StorePerformanceMonitor;
  private metrics = new Map<string, PerformanceMetrics>();

  static getInstance() {
    if (!this.instance) {
      this.instance = new StorePerformanceMonitor();
    }
    return this.instance;
  }

  trackRender(storeName: string, renderTime: number) {
    const current = this.metrics.get(storeName) || {
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      slowRenders: 0,
    };

    current.renderCount++;
    current.lastRenderTime = renderTime;
    current.averageRenderTime =
      (current.averageRenderTime * (current.renderCount - 1) + renderTime) /
      current.renderCount;

    if (renderTime > 16) {
      // Slower than 60fps
      current.slowRenders++;
    }

    this.metrics.set(storeName, current);

    // Log slow renders in development
    if (process.env.NODE_ENV === 'development' && renderTime > 50) {
      logger.warn(`Slow render detected in ${storeName}: ${renderTime}ms`);
    }
  }

  getMetrics(storeName?: string) {
    if (storeName) {
      return this.metrics.get(storeName);
    }
    return Object.fromEntries(this.metrics);
  }

  reset(storeName?: string) {
    if (storeName) {
      this.metrics.delete(storeName);
    } else {
      this.metrics.clear();
    }
  }
}

export const globalPerformanceMonitor = StorePerformanceMonitor.getInstance();

// ================================================
// OPTIMIZED ACTION PATTERNS
// ================================================

/**
 * Debounced action wrapper
 */
export function createDebouncedAction<
  T extends (...args: unknown[]) => unknown,
>(action: T, delay: number = 300): T {
  let timeoutId: NodeJS.Timeout;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => action(...args), delay);
  }) as T;
}

/**
 * Throttled action wrapper
 */
export function createThrottledAction<
  T extends (...args: unknown[]) => unknown,
>(action: T, limit: number = 100): T {
  let inThrottle: boolean;

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      action(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}

/**
 * Batched action wrapper for multiple updates
 */
export function createBatchedAction<T>(
  setter: (updates: T[]) => void,
  delay: number = 50
) {
  let batch: T[] = [];
  let timeoutId: NodeJS.Timeout;

  return (update: T) => {
    batch.push(update);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (batch.length > 0) {
        setter([...batch]);
        batch = [];
      }
    }, delay);
  };
}

// ================================================
// MEMOIZATION UTILITIES
// ================================================

/**
 * Shallow compare for React.memo
 */
export function shallowEqual<T extends Record<string, unknown>>(
  objA: T,
  objB: T
): boolean {
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (objA[key] !== objB[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Create memoized selector
 */
export function createMemoizedSelector<TState, TResult>(
  selector: (state: TState) => TResult,
  equalityFn: (a: TResult, b: TResult) => boolean = Object.is
) {
  let lastArgs: TState | undefined;
  let lastResult: TResult;

  return (state: TState): TResult => {
    if (lastArgs === undefined || !Object.is(lastArgs, state)) {
      const result = selector(state);
      if (lastArgs === undefined || !equalityFn(lastResult, result)) {
        lastResult = result;
      }
      lastArgs = state;
    }
    return lastResult;
  };
}

// ================================================
// EXPORTS
// ================================================

const OptimizedStoreUtils = {
  createOptimizedStore,
  createCleanupStore,
  StorePerformanceMonitor,
  globalPerformanceMonitor,
  createDebouncedAction,
  createThrottledAction,
  createBatchedAction,
  shallowEqual,
  createMemoizedSelector,
};

export default OptimizedStoreUtils;
