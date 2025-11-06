// ================================================
// HOOK ARCHITECTURE STANDARD PATTERNS
// ================================================
// Standardized patterns for consistent hook design and responsibility separation

import { useCallback, useEffect, useMemo } from 'react';
import {
  useAsyncOperation,
  usePagination,
  type AsyncHookReturn,
  type MutationHookReturn as BaseMutationHookReturn,
  type PaginatedHookReturn,
} from './index';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// HOOK RESPONSIBILITY CATEGORIES
// ================================================

/**
 * DATA HOOKS - Responsible for data fetching and caching
 * - Single responsibility: Data fetching only
 * - Consistent return types
 * - No business logic
 */
export interface DataHookOptions {
  enabled?: boolean;
  dependencies?: React.DependencyList;
  refetchInterval?: number;
}

export interface DataHookReturn<T> extends AsyncHookReturn<T> {
  isStale: boolean;
  lastFetchTime: Date | null;
}

/**
 * MUTATION HOOKS - Responsible for data mutations
 * - Single responsibility: Data modification only
 * - Optimistic updates support
 * - Consistent error handling
 */
export interface MutationHookOptions<TData, TParams> {
  onSuccess?: (data: TData, params: TParams) => void;
  onError?: (error: Error, params: TParams) => void;
  onSettled?: (
    data: TData | null,
    error: Error | null,
    params: TParams
  ) => void;
  optimisticUpdate?: (params: TParams) => TData | undefined;
}

export interface StandardMutationHookReturn<TData, TParams>
  extends BaseMutationHookReturn<TData, TParams> {
  isPending: boolean;
  isOptimistic: boolean;
}

/**
 * STATE HOOKS - Responsible for local state management
 * - Single responsibility: State management only
 * - No side effects
 * - Predictable state updates
 */
export interface StateHookReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  reset: () => void;
  isDirty: boolean;
  hasChanges: boolean;
}

/**
 * EFFECT HOOKS - Responsible for side effects
 * - Single responsibility: Side effects only
 * - Cleanup handling
 * - Dependency management
 */
export interface EffectHookOptions {
  dependencies?: React.DependencyList;
  cleanup?: () => void;
  enabled?: boolean;
}

// ================================================
// STANDARDIZED HOOK BUILDERS
// ================================================

/**
 * Creates a standardized data fetching hook
 */
export function createDataHook<T, P = void>(
  fetchFn: (params: P) => Promise<T>,
  defaultOptions: DataHookOptions = {}
) {
  return function useData(
    params?: P,
    options: DataHookOptions = {}
  ): DataHookReturn<T> {
    const mergedOptions = { ...defaultOptions, ...options };
    const { enabled = true, refetchInterval } = mergedOptions;

    const asyncHook = useAsyncOperation(() => fetchFn(params as P), {
      enabled,
    });

    // Auto-refetch interval
    useEffect(() => {
      if (!enabled || !refetchInterval) return;

      const interval = setInterval(() => {
        void asyncHook.execute();
      }, refetchInterval);

      return () => clearInterval(interval);
    }, [enabled, refetchInterval, asyncHook]);

    const lastFetchTime = useMemo(
      () => (asyncHook.data ? new Date() : null),
      [asyncHook.data]
    );

    const isStale = useMemo(() => {
      if (!lastFetchTime || !refetchInterval) return false;
      return Date.now() - lastFetchTime.getTime() > refetchInterval;
    }, [lastFetchTime, refetchInterval]);

    return {
      ...asyncHook,
      isStale,
      lastFetchTime,
    };
  };
}

/**
 * Creates a standardized mutation hook
 */
export function createMutationHook<TData, TParams>(
  mutationFn: (params: TParams) => Promise<TData>,
  defaultOptions: MutationHookOptions<TData, TParams> = {}
) {
  return function useMutationStandard(
    options: MutationHookOptions<TData, TParams> = {}
  ): StandardMutationHookReturn<TData, TParams> {
    const mergedOptions = { ...defaultOptions, ...options };

    // Use useAsyncOperation with proper generic typing to avoid conditional type issues
    const mutation = useAsyncOperation<TData, TParams>(
      mutationFn as TParams extends void
        ? (() => Promise<TData>) | null
        : ((params: TParams) => Promise<TData>) | null,
      mergedOptions
    );

    return {
      data: mutation.data,
      isLoading: mutation.isLoading,
      error: mutation.error,
      mutate: mutation.execute,
      reset: mutation.reset,
      isPending: mutation.isLoading,
      isOptimistic: false, // Will be enhanced with optimistic updates
    };
  };
}

/**
 * Creates a standardized pagination hook
 */
export function createPaginationHook<T>(
  fetchFn: (
    page: number,
    pageSize: number
  ) => Promise<{ items: T[]; total: number }>,
  defaultPageSize: number = 10
) {
  return function usePaginatedData(
    options: { pageSize?: number; enabled?: boolean } = {}
  ): PaginatedHookReturn<T> {
    const { pageSize = defaultPageSize } = options;

    return usePagination(fetchFn, pageSize);
  };
}

// ================================================
// HOOK COMPOSITION PATTERNS
// ================================================

/**
 * Types for hook composition
 */
interface HookWithLoading {
  isLoading?: boolean;
}

interface HookWithError {
  error?: Error | null;
}

interface HookWithRefetch {
  refetch?: () => Promise<unknown>;
}

/**
 * Hook composition utility for combining multiple hooks
 */
export function createCombinedHooks<T extends Record<string, unknown>>(
  hookFactory: () => T
) {
  return function useCombinedHooks(): T & {
    isLoading: boolean;
    hasError: boolean;
    errors: Error[];
    refetchAll: () => Promise<void>;
  } {
    const hooks = hookFactory();
    const hookValues = Object.values(hooks);

    const isLoading = hookValues.some(
      (hook: unknown) => (hook as HookWithLoading)?.isLoading === true
    );

    const errors = hookValues
      .map((hook: unknown) => (hook as HookWithError)?.error)
      .filter((error): error is Error => error instanceof Error);

    const hasError = errors.length > 0;

    const refetchAll = useCallback(async () => {
      const refetchPromises = hookValues
        .map((hook: unknown) => (hook as HookWithRefetch)?.refetch?.())
        .filter(Boolean);

      await Promise.allSettled(refetchPromises);
    }, [hookValues]);

    return {
      ...hooks,
      isLoading,
      hasError,
      errors,
      refetchAll,
    };
  };
}

/**
 * Creates a hook with optimistic updates
 */
export function withOptimisticUpdates<TData, TParams>(
  mutationHook: () => BaseMutationHookReturn<TData, TParams>,
  optimisticUpdateFn: (params: TParams) => TData | undefined
) {
  return function useOptimisticMutation() {
    const mutation = mutationHook();

    const mutateWithOptimistic = useCallback(
      async (params: TParams) => {
        // Apply optimistic update (would need state management integration)
        optimisticUpdateFn(params);

        try {
          const result = await mutation.mutate(params);
          return result;
        } catch (error) {
          // Revert optimistic update on error
          throw error;
        }
      },
      [mutation]
    );

    return {
      ...mutation,
      mutate: mutateWithOptimistic,
      isOptimistic: mutation.isLoading,
    };
  };
}

// ================================================
// HOOK VALIDATION PATTERNS
// ================================================

/**
 * Validates hook parameters and dependencies
 */
export function validateHookParams<T>(
  params: T,
  validator: (params: T) => boolean,
  errorMessage: string = 'Invalid hook parameters'
): void {
  if (!validator(params)) {
    throw new Error(errorMessage);
  }
}

/**
 * Creates a hook with parameter validation
 */
export function withValidation<TParams, TReturn>(
  hook: (params: TParams) => TReturn,
  validator: (params: TParams) => boolean,
  errorMessage?: string
) {
  return function useValidatedHook(params: TParams): TReturn {
    validateHookParams(params, validator, errorMessage);
    return hook(params);
  };
}

// ================================================
// ERROR BOUNDARY PATTERNS
// ================================================

/**
 * Creates a hook with error boundary integration
 */
export function withErrorBoundary<TReturn>(
  hook: () => TReturn,
  fallbackValue: TReturn
) {
  return function useSafeHook(): TReturn {
    try {
      return hook();
    } catch (error) {
      logger.error('Hook error caught:', error instanceof Error ? error : new Error(String(error)));
      return fallbackValue;
    }
  };
}

// ================================================
// PERFORMANCE PATTERNS
// ================================================

/**
 * Creates a hook with performance monitoring
 */
export function withPerformanceMonitoring<TParams, TReturn>(
  hook: (params: TParams) => TReturn,
  hookName: string
) {
  return function useMonitoredHook(params: TParams): TReturn {
    const startTime = performance.now();

    const result = hook(params);

    useEffect(() => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (duration > 16) {
        // Longer than one frame
        logger.warn(`Hook ${hookName} took ${duration.toFixed(2)}ms`);
      }
    });

    return result;
  };
}

// ================================================
// EXPORTS
// ================================================

export const HookPatterns = {
  createDataHook,
  createMutationHook,
  createPaginationHook,
  createCombinedHooks,
  withOptimisticUpdates,
  withValidation,
  withErrorBoundary,
  withPerformanceMonitoring,
};

export default HookPatterns;
