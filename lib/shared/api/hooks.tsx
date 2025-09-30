import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, ApiResponse, ApiError, RequestConfig } from './client';

// Hook state interfaces
export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  response: ApiResponse<T> | null;
}

export interface UseApiActions {
  refetch: () => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

export interface UseApiOptions extends Partial<RequestConfig> {
  immediate?: boolean;
  onSuccess?: (data: unknown, response: ApiResponse<unknown>) => void;
  onError?: (error: ApiError) => void;
  deps?: React.DependencyList;
}

export interface UseMutationOptions<TData, TVariables>
  extends Partial<RequestConfig> {
  onSuccess?: (
    data: TData,
    variables: TVariables,
    response: ApiResponse<TData>
  ) => void;
  onError?: (error: ApiError, variables: TVariables) => void;
  onSettled?: (
    data: TData | null,
    error: ApiError | null,
    variables: TVariables
  ) => void;
}

export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  error: ApiError | null;
  loading: boolean;
  reset: () => void;
}

// Generic API hook
export function useApi<T>(
  url: string | null,
  options: UseApiOptions = {}
): UseApiState<T> & UseApiActions {
  const { immediate = true, onSuccess, onError, ...requestConfig } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    response: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const optionsRef = useRef({ onSuccess, onError, ...requestConfig });
  optionsRef.current = { onSuccess, onError, ...requestConfig };

  const fetchData = useCallback(async () => {
    if (!url) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient.request<T>({
        url,
        method: 'GET',
        ...optionsRef.current,
        signal: abortControllerRef.current.signal,
      });

      if (mountedRef.current) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          response,
        });

        optionsRef.current.onSuccess?.(response.data, response);
      }
    } catch (error) {
      if (mountedRef.current && (error as Error).name !== 'AbortError') {
        const apiError = error as ApiError;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: apiError,
        }));

        optionsRef.current.onError?.(apiError);
      }
    }
  }, [url]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState((prev) => ({ ...prev, loading: false }));
  }, []);

  const reset = useCallback(() => {
    cancel();
    setState({
      data: null,
      loading: false,
      error: null,
      response: null,
    });
  }, [cancel]);

  useEffect(() => {
    if (immediate && url) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate, url, fetchData]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    refetch: fetchData,
    cancel,
    reset,
  };
}

// Specific HTTP method hooks
export function useGet<T>(
  url: string | null,
  options?: UseApiOptions
): UseApiState<T> & UseApiActions {
  return useApi<T>(url, { ...options, method: 'GET' });
}

// Mutation hook for POST, PUT, PATCH, DELETE
export function useMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const { onSuccess, onError, onSettled } = options;

  const [state, setState] = useState({
    data: null as TData | null,
    error: null as ApiError | null,
    loading: false,
  });

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await mutationFn(variables);

        setState({
          data: response.data,
          error: null,
          loading: false,
        });

        onSuccess?.(response.data, variables, response);
        onSettled?.(response.data, null, variables);

        return response.data;
      } catch (error) {
        const apiError = error as ApiError;

        setState((prev) => ({
          ...prev,
          error: apiError,
          loading: false,
        }));

        onError?.(apiError, variables);
        onSettled?.(null, apiError, variables);

        throw apiError;
      }
    },
    [mutationFn, onSuccess, onError, onSettled]
  );

  const mutate = useCallback(
    async (variables: TVariables) => {
      try {
        return await mutateAsync(variables);
      } catch {
        // Swallow errors for fire-and-forget mutations
      }
    },
    [mutateAsync]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      loading: false,
    });
  }, []);

  return {
    mutate: mutate as (variables: TVariables) => Promise<TData>,
    mutateAsync,
    ...state,
    reset,
  };
}

// Specific mutation hooks
export function usePost<TData = unknown, TVariables = unknown>(
  url: string,
  options?: UseMutationOptions<TData, TVariables>
): UseMutationResult<TData, TVariables> {
  return useMutation(
    async (variables: TVariables) =>
      apiClient.post<TData>(url, variables, options),
    options
  );
}

export function usePut<TData = unknown, TVariables = unknown>(
  url: string,
  options?: UseMutationOptions<TData, TVariables>
): UseMutationResult<TData, TVariables> {
  return useMutation(
    async (variables: TVariables) =>
      apiClient.put<TData>(url, variables, options),
    options
  );
}

export function usePatch<TData = unknown, TVariables = unknown>(
  url: string,
  options?: UseMutationOptions<TData, TVariables>
): UseMutationResult<TData, TVariables> {
  return useMutation(
    async (variables: TVariables) =>
      apiClient.patch<TData>(url, variables, options),
    options
  );
}

export function useDelete<TData = unknown, TVariables = unknown>(
  url: string,
  options?: UseMutationOptions<TData, TVariables>
): UseMutationResult<TData, TVariables> {
  return useMutation(
    async (variables: TVariables) =>
      apiClient.delete<TData>(url, { ...options, data: variables }),
    options
  );
}

// File upload hook
export function useUpload<TData = unknown>(
  url: string,
  options?: UseMutationOptions<
    TData,
    { file: File; data?: Record<string, unknown> }
  >
): UseMutationResult<TData, { file: File; data?: Record<string, unknown> }> & {
  progress: number;
} {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation(
    async (variables: { file: File; data?: Record<string, unknown> }) => {
      setProgress(0);

      // Mock progress for demonstration - in real implementation,
      // you'd use XMLHttpRequest or a similar API that supports progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      try {
        const response = await apiClient.uploadFile<TData>(
          url,
          variables.file,
          { ...options, data: variables.data }
        );

        setProgress(100);
        clearInterval(progressInterval);

        return response;
      } catch (error) {
        clearInterval(progressInterval);
        setProgress(0);
        throw error;
      }
    },
    {
      ...options,
      onSettled: (data, error, variables) => {
        setProgress(0);
        options?.onSettled?.(data, error, variables);
      },
    }
  );

  return {
    ...mutation,
    progress,
  };
}

// Paginated data hook
export function usePagination<T>(
  url: string,
  options: UseApiOptions & {
    pageSize?: number;
    initialPage?: number;
  } = {}
): UseApiState<T[]> & {
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  refetch: () => Promise<void>;
  cancel: () => void;
  reset: () => void;
} {
  const { pageSize = 20, initialPage = 1, ...apiOptions } = options;
  const [page, setPage] = useState(initialPage);

  const {
    data: paginatedData,
    loading,
    error,
    response,
    refetch,
    cancel,
    reset: resetApi,
  } = useApi<{
    data: T[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(url, {
    ...apiOptions,
    params: {
      ...apiOptions.params,
      page,
      pageSize,
    },
    deps: [page, pageSize, ...(apiOptions.deps || [])],
  });

  const nextPage = useCallback(() => {
    if (paginatedData?.pagination.hasNext) {
      setPage((prev) => prev + 1);
    }
  }, [paginatedData?.pagination.hasNext]);

  const prevPage = useCallback(() => {
    if (paginatedData?.pagination.hasPrev) {
      setPage((prev) => prev - 1);
    }
  }, [paginatedData?.pagination.hasPrev]);

  const goToPage = useCallback(
    (newPage: number) => {
      if (
        newPage >= 1 &&
        newPage <= (paginatedData?.pagination.totalPages || 1)
      ) {
        setPage(newPage);
      }
    },
    [paginatedData?.pagination.totalPages]
  );

  const reset = useCallback(() => {
    setPage(initialPage);
    resetApi();
  }, [initialPage, resetApi]);

  return {
    data: paginatedData?.data || null,
    loading,
    error,
    response: response as ApiResponse<T[]> | null,
    page: paginatedData?.pagination.page || page,
    pageSize: paginatedData?.pagination.pageSize || pageSize,
    totalPages: paginatedData?.pagination.totalPages || 0,
    total: paginatedData?.pagination.total || 0,
    hasNext: paginatedData?.pagination.hasNext || false,
    hasPrev: paginatedData?.pagination.hasPrev || false,
    nextPage,
    prevPage,
    goToPage,
    refetch,
    cancel,
    reset,
  };
}

// Infinite scroll hook
export function useInfiniteQuery<T>(
  url: string,
  options: UseApiOptions & {
    pageSize?: number;
    getNextPageParam?: (lastPage: T[], allPages: T[][]) => number | undefined;
  } = {}
): {
  data: T[];
  loading: boolean;
  error: ApiError | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<void>;
  refetch: () => Promise<void>;
  reset: () => void;
} {
  const { pageSize = 20, getNextPageParam, ...apiOptions } = options;

  const [pages, setPages] = useState<T[][]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const {
    loading,
    error,
    refetch: refetchPage,
  } = useApi<T[]>(url, {
    ...apiOptions,
    params: {
      ...apiOptions.params,
      page,
      pageSize,
    },
    deps: [page, pageSize, ...(apiOptions.deps || [])],
    onSuccess: (data) => {
      if (page === 1) {
        setPages([data as T[]]);
      } else {
        setPages((prev) => [...prev, data as T[]]);
      }

      // Determine if there's a next page
      if (getNextPageParam) {
        const nextPage = getNextPageParam(data as T[], [...pages, data as T[]]);
        setHasNextPage(nextPage !== undefined);
      } else {
        setHasNextPage((data as T[]).length === pageSize);
      }

      setIsFetchingNextPage(false);
    },
    onError: () => {
      setIsFetchingNextPage(false);
    },
  });

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage && !loading && !isFetchingNextPage) {
      setIsFetchingNextPage(true);
      setPage((prev) => prev + 1);
    }
  }, [hasNextPage, loading, isFetchingNextPage]);

  const refetch = useCallback(async () => {
    setPage(1);
    setPages([]);
    setHasNextPage(true);
    await refetchPage();
  }, [refetchPage]);

  const reset = useCallback(() => {
    setPage(1);
    setPages([]);
    setHasNextPage(true);
    setIsFetchingNextPage(false);
  }, []);

  return {
    data: pages.flat(),
    loading: loading && page === 1,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    reset,
  };
}

const apiHooks = {
  useApi,
  useGet,
  useMutation,
  usePost,
  usePut,
  usePatch,
  useDelete,
  useUpload,
  usePagination,
  useInfiniteQuery,
};

export default apiHooks;
