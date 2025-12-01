import { useState, useEffect, useCallback, useRef } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { PaginatedResponse } from '@/types/infrastructure/api';

// ================================================
// CUSTOM HOOKS - RE-EXPORTED FROM CANONICAL SOURCE
// ================================================
// All custom hooks consolidated in @/hooks/shared/base
// Import from there for the most up-to-date implementations
export {
  useDebouncedCallback,
  useMediaQuery,
  usePrevious,
  useIntersectionObserver,
} from '@/hooks/shared/base';

// Re-export useDebounce
export { useDebounce } from '@/hooks/shared/useDebounce';

// ================================================
// LOCAL UTILITY HOOKS
// ================================================

// useLocalStorage - Client-side localStorage management
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      logger.error(
        'Error reading localStorage',
        error instanceof Error ? error : new Error(String(error))
      );
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        logger.error(
          'Error setting localStorage',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
};

// useThrottle - Throttled callback execution
export const useThrottle = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

// useThrottledCallback - Alias for useThrottle (for backward compatibility)
export const useThrottledCallback = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T => {
  return useThrottle(callback, delay);
};

// ================================================
// API & ASYNC OPERATION HOOKS
// ================================================
export const useAsyncOperation = <T, Args extends unknown[] = []>(
  operation: (...args: Args) => Promise<T>
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: Args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await operation(...args);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        throw err as Error;
      } finally {
        setLoading(false);
      }
    },
    [operation]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
};

export const useMutation = <TData, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
  }
) => {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (variables: TVariables) => {
      try {
        setLoading(true);
        setError(null);
        const result = await mutationFn(variables);
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Mutation failed');
        setError(error instanceof Error ? error : new Error(String(error)));
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn, options]
  );

  return { data, loading, error, mutate };
};

export const usePagination = <T>(
  fetchFn: (page: number, limit: number) => Promise<PaginatedResponse<T>>,
  initialLimit = 10
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = useCallback(
    async (pageToLoad: number) => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchFn(pageToLoad, limit);

        if (pageToLoad === 1) {
          setData(response.data);
        } else {
          setData((prev) => [...prev, ...response.data]);
        }

        setTotal(response.pagination.total);
        setHasMore(pageToLoad < response.pagination.totalPages);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, limit]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPage(nextPage);
    }
  }, [loading, hasMore, page, loadPage]);

  const refresh = useCallback(() => {
    setPage(1);
    loadPage(1);
  }, [loadPage]);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  return {
    data,
    loading,
    error,
    page,
    total,
    hasMore,
    loadMore,
    refresh,
  };
};

export const useAsyncState = <T>(initialData: T | null = null) => {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err as Error;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  return { data, loading, error, execute, reset };
};

// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Base patterns
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Use canonical PaginatedResponse from infrastructure/api
export type { PaginatedResponse } from '@/types/infrastructure/api';

// Hook return types
export interface AsyncHookReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: () => Promise<T>;
  reset: () => void;
}

export interface MutationHookReturn<TData, TVariables> {
  data: TData | null;
  loading: boolean;
  error: Error | null;
  mutate: (variables: TVariables) => Promise<TData>;
}

export interface PaginatedHookReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  page: number;
  total: number;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

// Base service class
export abstract class BaseService {
  protected baseUrl: string = process.env.NEXT_PUBLIC_API_URL || '/api';

  protected async executeOperation<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      logger.error(
        `${operation} failed`,
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  protected buildUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }
}
