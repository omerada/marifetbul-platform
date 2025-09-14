import { useState, useCallback } from 'react';

/**
 * Generic hook for handling async operations with loading and error states
 * Eliminates duplicate loading/error state management across components
 */
export interface AsyncOperationResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: (operation: () => Promise<T>) => Promise<T>;
  executeWithParams: <P extends unknown[]>(
    operation: (...params: P) => Promise<T>,
    ...params: P
  ) => Promise<T>;
  reset: () => void;
  clearError: () => void;
  setData: (data: T | null) => void;
}

export function useAsyncOperation<T = unknown>(): AsyncOperationResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata oluştu';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const executeWithParams = useCallback(
    async <P extends unknown[]>(
      operation: (...params: P) => Promise<T>,
      ...params: P
    ): Promise<T> => {
      return execute(() => operation(...params));
    },
    [execute]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    executeWithParams,
    reset,
    clearError,
    setData,
  };
}

/**
 * Specialized hook for operations that don't return data (like delete operations)
 */
export function useAsyncAction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const execute = useCallback(async (operation: () => Promise<void>): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    
    try {
      await operation();
      setIsSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata oluştu';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
    setIsSuccess(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    isSuccess,
    execute,
    reset,
    clearError,
  };
}

/**
 * Hook for managing multiple async operations
 */
export function useMultipleAsyncOperations() {
  const [operationStates, setOperationStates] = useState<Record<string, {
    isLoading: boolean;
    error: string | null;
    data: unknown;
  }>>({});

  const executeOperation = useCallback(async <T>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    setOperationStates(prev => ({
      ...prev,
      [key]: { isLoading: true, error: null, data: prev[key]?.data || null }
    }));

    try {
      const result = await operation();
      setOperationStates(prev => ({
        ...prev,
        [key]: { isLoading: false, error: null, data: result }
      }));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata oluştu';
      setOperationStates(prev => ({
        ...prev,
        [key]: { isLoading: false, error: errorMessage, data: prev[key]?.data || null }
      }));
      throw err;
    }
  }, []);

  const resetOperation = useCallback((key: string) => {
    setOperationStates(prev => ({
      ...prev,
      [key]: { isLoading: false, error: null, data: null }
    }));
  }, []);

  const resetAll = useCallback(() => {
    setOperationStates({});
  }, []);

  const getOperationState = useCallback((key: string) => {
    return operationStates[key] || { isLoading: false, error: null, data: null };
  }, [operationStates]);

  const isAnyLoading = Object.values(operationStates).some(op => op.isLoading);
  const hasAnyError = Object.values(operationStates).some(op => op.error);

  return {
    executeOperation,
    resetOperation,
    resetAll,
    getOperationState,
    isAnyLoading,
    hasAnyError,
  };
}