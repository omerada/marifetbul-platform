import { useState, useCallback, useMemo } from 'react';

// ================================================
// TYPES
// ================================================

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
}

export interface AsyncOperationHook<T, P = void> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
  execute: P extends void ? () => Promise<T> : (params: P) => Promise<T>;
  executeAsync: P extends void ? () => Promise<T> : (params: P) => Promise<T>;
  reset: () => void;
  clearError: () => void;
  setData: (data: T | null) => void;
}

export interface AsyncActionHook {
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
  execute: () => Promise<void>;
  reset: () => void;
  clearError: () => void;
}

export interface MutationOptions<TData, TParams> {
  onSuccess?: (data: TData, params: TParams) => void;
  onError?: (error: Error, params: TParams) => void;
  onSettled?: (
    data: TData | null,
    error: Error | null,
    params: TParams
  ) => void;
  enabled?: boolean;
  dependencies?: any[];
}

// ================================================
// UNIFIED ASYNC HOOK
// ================================================

/**
 * Unified async operation hook that replaces both useAsyncOperation and useMutation
 * Provides consistent interface for all async operations
 */
export function useAsyncOperation<TData, TParams = void>(
  asyncFn: TParams extends void
    ? (() => Promise<TData>) | null
    : ((params: TParams) => Promise<TData>) | null,
  options: MutationOptions<TData, TParams> = {}
): AsyncOperationHook<TData, TParams> {
  const [state, setState] = useState<AsyncState<TData>>({
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false,
  });

  const { onSuccess, onError, onSettled, enabled = true } = options;

  const updateState = useCallback((updates: Partial<AsyncState<TData>>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const execute = useCallback(
    async (params?: TParams): Promise<TData> => {
      if (!asyncFn) {
        throw new Error('Async function not provided');
      }

      if (!enabled) {
        throw new Error('Operation is disabled');
      }

      updateState({ isLoading: true, error: null, isSuccess: false });

      try {
        const result = await (params !== undefined
          ? (asyncFn as (params: TParams) => Promise<TData>)(params)
          : (asyncFn as () => Promise<TData>)());

        updateState({
          data: result,
          isLoading: false,
          isSuccess: true,
        });

        onSuccess?.(result, params as TParams);
        onSettled?.(result, null, params as TParams);

        return result;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));

        updateState({
          error: errorObj,
          isLoading: false,
          isSuccess: false,
        });

        onError?.(errorObj, params as TParams);
        onSettled?.(null, errorObj, params as TParams);

        throw errorObj;
      }
    },
    [asyncFn, onSuccess, onError, onSettled, updateState, enabled]
  );

  const executeAsync = useMemo(() => execute, [execute]);

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
    });
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const setData = useCallback(
    (data: TData | null) => {
      updateState({ data });
    },
    [updateState]
  );

  return {
    ...state,
    execute: execute as TParams extends void
      ? () => Promise<TData>
      : (params: TParams) => Promise<TData>,
    executeAsync: executeAsync as TParams extends void
      ? () => Promise<TData>
      : (params: TParams) => Promise<TData>,
    reset,
    clearError,
    setData,
  };
}

// ================================================
// MUTATION HOOK (LEGACY COMPATIBILITY)
// ================================================

/**
 * @deprecated Use useAsyncOperation instead
 * Legacy mutation hook for backward compatibility
 */
export function useMutation<TData, TParams = void>(
  mutationFn: (params: TParams) => Promise<TData>,
  options: MutationOptions<TData, TParams> = {}
) {
  const [state, setState] = useState<AsyncState<TData>>({
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false,
  });

  const mutate = useCallback(
    async (params: TParams): Promise<TData> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        isSuccess: false,
      }));

      try {
        const result = await mutationFn(params);
        setState((prev) => ({
          ...prev,
          data: result,
          isLoading: false,
          isSuccess: true,
        }));
        options.onSuccess?.(result, params);
        options.onSettled?.(result, null, params);
        return result;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        setState((prev) => ({
          ...prev,
          error: errorObj,
          isLoading: false,
          isSuccess: false,
        }));
        options.onError?.(errorObj, params);
        options.onSettled?.(null, errorObj, params);
        throw errorObj;
      }
    },
    [mutationFn, options]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
    });
  }, []);

  return {
    ...state,
    mutate,
    mutateAsync: mutate,
    reset,
  };
}

// ================================================
// ACTION HOOK FOR OPERATIONS WITHOUT RETURN DATA
// ================================================

/**
 * Specialized hook for operations that don't return data (like delete operations)
 */
export function useAsyncAction(
  actionFn: (() => Promise<void>) | null
): AsyncActionHook {
  const { isLoading, error, isSuccess, execute, reset, clearError } =
    useAsyncOperation<void, void>(actionFn);

  return {
    isLoading,
    error,
    isSuccess,
    execute,
    reset,
    clearError,
  };
}

// ================================================
// MULTIPLE OPERATIONS HOOK
// ================================================

export interface OperationState {
  isLoading: boolean;
  error: Error | null;
  data: unknown;
}

export function useMultipleAsyncOperations() {
  const [operationStates, setOperationStates] = useState<
    Record<string, OperationState>
  >({});

  const executeOperation = useCallback(
    async <T>(key: string, operation: () => Promise<T>): Promise<T> => {
      setOperationStates((prev) => ({
        ...prev,
        [key]: { isLoading: true, error: null, data: prev[key]?.data || null },
      }));

      try {
        const result = await operation();
        setOperationStates((prev) => ({
          ...prev,
          [key]: { isLoading: false, error: null, data: result },
        }));
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setOperationStates((prev) => ({
          ...prev,
          [key]: {
            isLoading: false,
            error,
            data: prev[key]?.data || null,
          },
        }));
        throw error;
      }
    },
    []
  );

  const resetOperation = useCallback((key: string) => {
    setOperationStates((prev) => ({
      ...prev,
      [key]: { isLoading: false, error: null, data: null },
    }));
  }, []);

  const resetAll = useCallback(() => {
    setOperationStates({});
  }, []);

  const getOperationState = useCallback(
    (key: string): OperationState => {
      return (
        operationStates[key] || { isLoading: false, error: null, data: null }
      );
    },
    [operationStates]
  );

  const isAnyLoading = useMemo(
    () => Object.values(operationStates).some((op) => op.isLoading),
    [operationStates]
  );

  const hasAnyError = useMemo(
    () => Object.values(operationStates).some((op) => op.error),
    [operationStates]
  );

  return {
    executeOperation,
    resetOperation,
    resetAll,
    getOperationState,
    isAnyLoading,
    hasAnyError,
  };
}

// ================================================
// EXPORTS
// ================================================

const UnifiedAsyncHooks = {
  useAsyncOperation,
  useMutation,
  useAsyncAction,
  useMultipleAsyncOperations,
};

export default UnifiedAsyncHooks;
