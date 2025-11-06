// ================================================
// BASE UTILITY HOOKS SYSTEM
// ================================================
// Base patterns and utilities for consistent hook design
// Async operations are handled by unified async system

import { useEffect, useRef, useCallback, useState } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// ASYNC OPERATION HOOKS (UNIFIED SYSTEM)
// ================================================
// Re-export from unified async system to maintain backward compatibility
export {
  useAsyncOperation,
  useAsyncAction,
  useMultipleAsyncOperations,
  type AsyncOperationHook,
  type AsyncActionHook,
  type AsyncState as UnifiedAsyncState,
  type MutationOptions,
} from '../../core/useUnifiedAsync';

// ================================================
// BASE TYPES (NON-ASYNC)
// ================================================

// Legacy type aliases for backward compatibility
export type AsyncHookReturn<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch?: () => Promise<void>;
};

export type MutationHookReturn<TData, TParams> = {
  mutate: (params: TParams) => Promise<TData>;
  data: TData | null;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
};

export type PaginatedHookReturn<T> = PaginationHookReturn<T>;

// ================================================
// BASE TYPES (NON-ASYNC)
// ================================================

export interface PaginatedState<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
}

export interface PaginationHookReturn<T> {
  data: PaginatedState<T>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  refetch: () => Promise<void>;
  reset: () => void;
}

// ================================================
// PAGINATION HOOK
// ================================================

/**
 * Pagination hook with consistent pagination logic
 */
export function usePagination<T>(
  fetchData: (
    page: number,
    pageSize: number
  ) => Promise<{
    items: T[];
    total: number;
  }>,
  initialPageSize: number = 10
): PaginationHookReturn<T> {
  const [state, setState] = useState<PaginatedState<T>>({
    items: [],
    total: 0,
    page: 1,
    pageSize: initialPageSize,
    isLoading: false,
    error: null,
    hasMore: false,
  });

  const updateState = useCallback((updates: Partial<PaginatedState<T>>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const loadData = useCallback(
    async (page: number, pageSize: number): Promise<void> => {
      updateState({ isLoading: true, error: null });

      try {
        const { items, total } = await fetchData(page, pageSize);
        const hasMore = page * pageSize < total;

        updateState({
          items,
          total,
          page,
          pageSize,
          hasMore,
          isLoading: false,
        });
      } catch (error) {
        updateState({
          error: error instanceof Error ? error : new Error(String(error)),
          isLoading: false,
        });
      }
    },
    [fetchData, updateState]
  );

  const setPage = useCallback(
    (page: number) => {
      if (page !== state.page && page > 0) {
        loadData(page, state.pageSize);
      }
    },
    [state.page, state.pageSize, loadData]
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      if (pageSize !== state.pageSize && pageSize > 0) {
        loadData(1, pageSize);
      }
    },
    [state.pageSize, loadData]
  );

  const nextPage = useCallback(() => {
    if (state.hasMore) {
      setPage(state.page + 1);
    }
  }, [state.hasMore, state.page, setPage]);

  const previousPage = useCallback(() => {
    if (state.page > 1) {
      setPage(state.page - 1);
    }
  }, [state.page, setPage]);

  const refetch = useCallback(() => {
    return loadData(state.page, state.pageSize);
  }, [state.page, state.pageSize, loadData]);

  const reset = useCallback(() => {
    setState({
      items: [],
      total: 0,
      page: 1,
      pageSize: initialPageSize,
      isLoading: false,
      error: null,
      hasMore: false,
    });
  }, [initialPageSize]);

  return {
    data: state,
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    refetch,
    reset,
  };
}

// ================================================
// DEBOUNCE HOOKS
// ================================================

/**
 * Debounced value hook
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounced callback hook
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, delay, ...deps]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Throttled callback hook
 */
export function useThrottledCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const lastExecuted = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastExecuted.current >= delay) {
        lastExecuted.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(
          () => {
            lastExecuted.current = Date.now();
            callback(...args);
          },
          delay - (now - lastExecuted.current)
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, delay, ...deps]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

// ================================================
// LOCAL STORAGE HOOK
// ================================================

/**
 * Local storage hook with error handling
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logger.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        // Save to localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        logger.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      logger.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// ================================================
// PREVIOUS VALUE HOOK
// ================================================

/**
 * Previous value hook
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

// ================================================
// INTERSECTION OBSERVER HOOK
// ================================================

/**
 * Intersection observer hook
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<Element | null>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<Element | null>(null);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options]);

  return [targetRef, isIntersecting];
}

// ================================================
// MEDIA QUERY HOOK
// ================================================

/**
 * Media query hook
 * Provides consistent media query handling
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

// ================================================
// EXPORTS
// ================================================

const BaseHooks = {
  // Base utilities (defined in this file)
  usePagination,
  useDebounce,
  useDebouncedCallback,
  useThrottledCallback,
  useLocalStorage,
  usePrevious,
  useIntersectionObserver,
  useMediaQuery,
};

export default BaseHooks;
