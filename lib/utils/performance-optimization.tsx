/**
 * Performance Optimization Utilities
 * React performance patterns and optimization techniques
 */

import React, { memo, useMemo, useCallback } from 'react';
import { shallowEqual } from '@/lib/store/optimized';

// ================================================
// MEMOIZATION PATTERNS
// ================================================

/**
 * Deep memo comparison for complex objects
 */
export function deepMemoCompare<T>(prevProps: T, nextProps: T): boolean {
  if (prevProps === nextProps) return true;

  if (typeof prevProps !== 'object' || typeof nextProps !== 'object') {
    return false;
  }

  if (!prevProps || !nextProps) return false;

  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) return false;

  for (const key of prevKeys) {
    if (!nextKeys.includes(key)) return false;

    const prevValue = (prevProps as Record<string, unknown>)[key];
    const nextValue = (nextProps as Record<string, unknown>)[key];

    if (typeof prevValue === 'object' && typeof nextValue === 'object') {
      if (!deepMemoCompare(prevValue, nextValue)) return false;
    } else if (prevValue !== nextValue) {
      return false;
    }
  }

  return true;
}

/**
 * HOC for automatic memoization with custom comparison
 */
export function withMemo<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  comparison?: (prevProps: P, nextProps: P) => boolean
) {
  const MemoizedComponent = memo(Component, comparison || shallowEqual);
  MemoizedComponent.displayName = `Memo(${Component.displayName || Component.name})`;
  return MemoizedComponent;
}

/**
 * HOC for performance tracking
 */
export function withPerformanceTracking<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const TrackedComponent = (props: P) => {
    const name = componentName || Component.displayName || Component.name;
    const renderStart = useMemo(() => performance.now(), []);

    React.useLayoutEffect(() => {
      const renderTime = performance.now() - renderStart;
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`Slow render in ${name}: ${renderTime.toFixed(2)}ms`);
      }
    });

    return React.createElement(Component, props);
  };

  TrackedComponent.displayName = `Tracked(${Component.displayName || Component.name})`;
  return TrackedComponent;
}

// ================================================
// OPTIMIZATION HOOKS
// ================================================

/**
 * Stable callback hook - prevents unnecessary re-renders
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): T {
  const callbackRef = React.useRef(callback);

  // Always keep the latest callback
  React.useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return React.useCallback(
    ((...args: unknown[]) => callbackRef.current(...args)) as T,
    []
  );
}

/**
 * Memoized selector hook for complex computations
 */
export function useMemoizedSelector<TState, TResult>(
  selector: (state: TState) => TResult,
  state: TState,
  equalityFn?: (a: TResult, b: TResult) => boolean
): TResult {
  const lastState = React.useRef<TState | undefined>(undefined);
  const lastResult = React.useRef<TResult | undefined>(undefined);

  return useMemo(() => {
    if (lastState.current === state && lastResult.current !== undefined) {
      return lastResult.current;
    }

    const result = selector(state);

    if (
      lastResult.current === undefined ||
      (equalityFn
        ? !equalityFn(lastResult.current, result)
        : lastResult.current !== result)
    ) {
      lastResult.current = result;
    }

    lastState.current = state;
    return lastResult.current;
  }, [state, selector, equalityFn]);
}

/**
 * Optimized array hook - prevents re-renders when array content is same
 */
export function useStableArray<T>(array: T[]): T[] {
  const lastArrayRef = React.useRef<T[]>([]);

  return useMemo(() => {
    if (array.length !== lastArrayRef.current.length) {
      lastArrayRef.current = array;
      return array;
    }

    const isSame = array.every(
      (item, index) => item === lastArrayRef.current[index]
    );
    if (!isSame) {
      lastArrayRef.current = array;
      return array;
    }

    return lastArrayRef.current;
  }, [array]);
}

/**
 * Debounced value hook for performance
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ================================================
// COMPONENT OPTIMIZATION PATTERNS
// ================================================

/**
 * Optimized list component with virtualization
 */
interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  itemHeight?: number;
  containerHeight?: number;
  className?: string;
}

export function OptimizedList<T>({
  items,
  renderItem,
  keyExtractor,
  itemHeight = 50,
  containerHeight = 400,
  className = '',
}: OptimizedListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 2,
      items.length
    );

    return {
      startIndex: Math.max(0, startIndex - 1),
      endIndex,
      items: items.slice(Math.max(0, startIndex - 1), endIndex),
    };
  }, [items, scrollTop, itemHeight, containerHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleItems.startIndex * itemHeight;

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.items.map((item, index) => {
            const actualIndex = visibleItems.startIndex + index;
            return (
              <div
                key={keyExtractor(item, actualIndex)}
                style={{ height: itemHeight }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Optimized card grid with intersection observer
 */
interface OptimizedCardGridProps {
  children: React.ReactNode[];
  className?: string;
  threshold?: number;
}

export const OptimizedCardGrid = memo<OptimizedCardGridProps>(
  ({ children, className = '', threshold = 0.1 }) => {
    const [visibleCards, setVisibleCards] = React.useState<Set<number>>(
      new Set()
    );
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (!containerRef.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          setVisibleCards((prev) => {
            const newVisible = new Set(prev);
            entries.forEach((entry) => {
              const index = parseInt(
                entry.target.getAttribute('data-index') || '0'
              );
              if (entry.isIntersecting) {
                newVisible.add(index);
              } else {
                newVisible.delete(index);
              }
            });
            return newVisible;
          });
        },
        { threshold }
      );

      const cards = containerRef.current.querySelectorAll('[data-index]');
      cards.forEach((card) => observer.observe(card));

      return () => observer.disconnect();
    }, [children, threshold]);

    return (
      <div ref={containerRef} className={`grid gap-4 ${className}`}>
        {children.map((child, index) => (
          <div key={index} data-index={index}>
            {visibleCards.has(index) ? (
              child
            ) : (
              <div style={{ height: '200px' }} />
            )}
          </div>
        ))}
      </div>
    );
  }
);

OptimizedCardGrid.displayName = 'OptimizedCardGrid';

// ================================================
// EXPORTS
// ================================================

const PerformanceOptimizationUtils = {
  // HOCs
  withMemo,
  withPerformanceTracking,

  // Hooks
  useStableCallback,
  useMemoizedSelector,
  useStableArray,
  useDebouncedValue,

  // Components
  OptimizedList,
  OptimizedCardGrid,

  // Utilities
  deepMemoCompare,
  shallowEqual,
};

export default PerformanceOptimizationUtils;
