// Pattern-based hook creators
import { useState, useEffect, useCallback } from 'react';

export interface DataHookOptions<T> {
  initialData?: T;
  refetchOnMount?: boolean;
  enabled?: boolean;
}

export interface DataHookReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface MutationHookReturn<TData, TVariables = unknown> {
  mutate: (variables: TVariables) => Promise<TData>;
  loading: boolean;
  error: string | null;
  data: TData | null;
}

export function createDataHook<T>(
  fetcher: () => Promise<T>
): (options?: DataHookOptions<T>) => DataHookReturn<T> {
  return function useData(options: DataHookOptions<T> = {}) {
    const [data, setData] = useState<T | null>(options.initialData || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetcher();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      if (options.enabled !== false && options.refetchOnMount !== false) {
        fetchData();
      }
    }, [fetchData, options.enabled, options.refetchOnMount]);

    return {
      data,
      loading,
      error,
      refetch: fetchData,
    };
  };
}

export function createMutationHook<TData, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>
): () => MutationHookReturn<TData, TVariables> {
  return function useMutation() {
    const [data, setData] = useState<TData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mutate = useCallback(async (variables: TVariables) => {
      try {
        setLoading(true);
        setError(null);
        const result = await mutationFn(variables);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);

    return {
      mutate,
      loading,
      error,
      data,
    };
  };
}
