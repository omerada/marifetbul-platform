// ================================================
// UNIFIED HOOK ARCHITECTURE SYSTEM
// ================================================
// Base patterns and utilities for consistent hook design
// across the entire application

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';

// ================================================
// CORE HOOK TYPES
// ================================================

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isInitialized: boolean;
}

export interface MutationState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
}

export interface PaginatedState<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AsyncHookReturn<T> extends AsyncState<T> {
  refetch: () => Promise<T | undefined>;
  reset: () => void;
}

export interface MutationHookReturn<TData, TParams>
  extends MutationState<TData> {
  mutate: (params: TParams) => Promise<TData>;
  mutateAsync: (params: TParams) => Promise<TData>;
  reset: () => void;
}

export interface PaginatedHookReturn<T>
  extends AsyncHookReturn<PaginatedState<T>> {
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  refresh: () => Promise<void>;
}

// ================================================
// BASE HOOK PATTERNS
// ================================================

/**
 * Base async state hook
 * Provides consistent async state management
 */
export function useAsyncState<T>(
  initialData: T | null = null
): [AsyncState<T>, (newState: Partial<AsyncState<T>>) => void] {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
    isInitialized: false,
  });

  const updateState = useCallback((newState: Partial<AsyncState<T>>) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  return [state, updateState];
}

/**
 * Base mutation state hook
 * Provides consistent mutation state management
 */
export function useMutationState<T>(
  initialData: T | null = null
): [MutationState<T>, (newState: Partial<MutationState<T>>) => void] {
  const [state, setState] = useState<MutationState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
    isSuccess: false,
  });

  const updateState = useCallback((newState: Partial<MutationState<T>>) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  return [state, updateState];
}

/**
 * Generic async operation hook
 * Provides consistent async operation handling
 */
export function useAsyncOperation<T, P = void>(
  operation: (params: P) => Promise<T>,
  options: {
    dependencies?: React.DependencyList;
    enabled?: boolean;
  } = {}
): AsyncHookReturn<T> {
  const { dependencies = [], enabled = true } = options;
  const [state, updateState] = useAsyncState<T>();
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (params?: P): Promise<T | undefined> => {
      // Cancel previous operation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      updateState({ isLoading: true, error: null });

      try {
        const result = await operation(params as P);

        if (!abortControllerRef.current.signal.aborted) {
          updateState({
            data: result,
            isLoading: false,
            isInitialized: true,
          });
        }

        return result;
      } catch (error) {
        if (!abortControllerRef.current.signal.aborted) {
          updateState({
            error: error instanceof Error ? error : new Error(String(error)),
            isLoading: false,
            isInitialized: true,
          });
        }
        throw error;
      }
    },
    [operation, updateState, ...dependencies]
  );

  const refetch = useCallback(async (): Promise<T | undefined> => {
    if (enabled) {
      return execute();
    }
  }, [execute, enabled]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    updateState({
      data: null,
      isLoading: false,
      error: null,
      isInitialized: false,
    });
  }, [updateState]);

  // Auto-execute on mount if enabled
  useEffect(() => {
    if (enabled) {
      execute();
    }
  }, [enabled]); // intentionally not including execute to avoid re-runs

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    refetch,
    reset,
  };
}

/**
 * Generic mutation hook
 * Provides consistent mutation operation handling
 */
export function useMutation<TData, TParams = void>(
  mutationFn: (params: TParams) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, params: TParams) => void;
    onError?: (error: Error, params: TParams) => void;
    onSettled?: (
      data: TData | null,
      error: Error | null,
      params: TParams
    ) => void;
  } = {}
): MutationHookReturn<TData, TParams> {
  const [state, updateState] = useMutationState<TData>();
  const { onSuccess, onError, onSettled } = options;

  const mutate = useCallback(
    async (params: TParams): Promise<TData> => {
      updateState({ isLoading: true, error: null, isSuccess: false });

      try {
        const result = await mutationFn(params);

        updateState({
          data: result,
          isLoading: false,
          isSuccess: true,
        });

        onSuccess?.(result, params);
        onSettled?.(result, null, params);

        return result;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));

        updateState({
          error: errorObj,
          isLoading: false,
          isSuccess: false,
        });

        onError?.(errorObj, params);
        onSettled?.(null, errorObj, params);

        throw error;
      }
    },
    [mutationFn, onSuccess, onError, onSettled, updateState]
  );

  const mutateAsync = useMemo(() => mutate, [mutate]);

  const reset = useCallback(() => {
    updateState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
    });
  }, [updateState]);

  return {
    ...state,
    mutate,
    mutateAsync,
    reset,
  };
}

/**
 * Pagination hook
 * Provides consistent pagination logic
 */
export function usePagination<T>(
  fetchFn: (
    page: number,
    pageSize: number
  ) => Promise<{ items: T[]; total: number }>,
  options: {
    initialPage?: number;
    pageSize?: number;
    enabled?: boolean;
  } = {}
): PaginatedHookReturn<T> {
  const { initialPage = 1, pageSize = 10, enabled = true } = options;

  const [page, setPage] = useState(initialPage);

  const fetchData = useCallback(async () => {
    const result = await fetchFn(page, pageSize);
    return {
      ...result,
      page,
      pageSize,
      hasNext: page * pageSize < result.total,
      hasPrev: page > 1,
    };
  }, [fetchFn, page, pageSize]);

  const asyncHook = useAsyncOperation(fetchData, {
    dependencies: [page, pageSize],
  });

  // Auto-fetch when enabled
  useEffect(() => {
    if (enabled) {
      void asyncHook.refetch();
    }
  }, [enabled, asyncHook]);

  const nextPage = useCallback(async () => {
    if (asyncHook.data?.hasNext) {
      setPage((prev) => prev + 1);
    }
  }, [asyncHook.data?.hasNext]);

  const prevPage = useCallback(async () => {
    if (asyncHook.data?.hasPrev) {
      setPage((prev) => prev - 1);
    }
  }, [asyncHook.data?.hasPrev]);

  const goToPage = useCallback(async (newPage: number) => {
    if (newPage >= 1) {
      setPage(newPage);
    }
  }, []);

  const refresh = useCallback(async () => {
    await asyncHook.refetch();
  }, [asyncHook]);

  return {
    ...asyncHook,
    nextPage,
    prevPage,
    goToPage,
    refresh,
  };
}

// ================================================
// DEBOUNCE & THROTTLE HOOKS
// ================================================

/**
 * Debounced value hook
 * Provides consistent debouncing
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
 * Provides consistent callback debouncing
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
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
 * Provides consistent callback throttling
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallTime = useRef<number>(0);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastCallTime.current >= delay) {
        lastCallTime.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
}

// ================================================
// LOCAL STORAGE HOOKS
// ================================================

/**
 * Local storage hook with TypeScript support
 * Provides consistent local storage management
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// ================================================
// PREVIOUS VALUE HOOK
// ================================================

/**
 * Previous value hook
 * Provides access to previous value
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
 * Provides consistent intersection observation
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): IntersectionObserverEntry | null {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => setEntry(entry), {
      threshold: options.threshold,
      root: options.root,
      rootMargin: options.rootMargin,
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, options.threshold, options.root, options.rootMargin]);

  return entry;
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
  useAsyncState,
  useMutationState,
  useAsyncOperation,
  useMutation,
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
