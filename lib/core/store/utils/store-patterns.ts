/**
 * Standardized Store Utilities for Consistent Async State Management
 * Provides common patterns and utilities for all stores
 */

import { StateCreator } from 'zustand';

// === Base Async State Pattern ===
export interface BaseAsyncState {
  isLoading: boolean;
  error: string | null;
  lastFetch: string | null;
}

// === CRUD State Pattern ===
export interface CrudState<T> extends BaseAsyncState {
  items: T[];
  currentItem: T | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

// === Paginated State Pattern ===
export interface PaginatedState<T> extends BaseAsyncState {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// === Search State Pattern ===
export interface SearchState<T> extends BaseAsyncState {
  query: string;
  results: T[];
  filters: Record<string, unknown>;
  suggestions: string[];
  recentSearches: string[];
}

// === Base Actions ===
export interface BaseAsyncActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  updateLastFetch: () => void;
  reset: () => void;
}

// === CRUD Actions ===
export interface CrudActions<
  T,
  CreateDTO = Partial<T>,
  UpdateDTO = Partial<T>,
> {
  fetch: () => Promise<void>;
  fetchById: (id: string) => Promise<T | null>;
  create: (data: CreateDTO) => Promise<T | null>;
  update: (id: string, data: UpdateDTO) => Promise<T | null>;
  delete: (id: string) => Promise<boolean>;
  setCurrentItem: (item: T | null) => void;
}

// === Paginated Actions ===
export interface PaginatedActions {
  fetchPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  setPageSize: (size: number) => void;
  resetPagination: () => void;
}

// === Search Actions ===
export interface SearchActions {
  search: (query: string, filters?: Record<string, unknown>) => Promise<void>;
  clearSearch: () => void;
  setFilters: (filters: Record<string, unknown>) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

// === Initial States ===
export const createInitialAsyncState = (): BaseAsyncState => ({
  isLoading: false,
  error: null,
  lastFetch: null,
});

export const createInitialCrudState = <T>(): CrudState<T> => ({
  ...createInitialAsyncState(),
  items: [],
  currentItem: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
});

export const createInitialPaginatedState = <T>(): PaginatedState<T> => ({
  ...createInitialAsyncState(),
  items: [],
  pagination: null,
  hasNextPage: false,
  hasPreviousPage: false,
});

export const createInitialSearchState = <T>(): SearchState<T> => ({
  ...createInitialAsyncState(),
  query: '',
  results: [],
  filters: {},
  suggestions: [],
  recentSearches: [],
});

// === Action Creators ===
export const createBaseAsyncActions =
  <TState extends BaseAsyncState>(
    initialState: TState
  ): StateCreator<TState & BaseAsyncActions, [], [], BaseAsyncActions> =>
  (set) => ({
    setLoading: (loading: boolean) => {
      set({ isLoading: loading } as Partial<TState & BaseAsyncActions>);
    },

    setError: (error: string | null) => {
      set({
        error,
        isLoading: false,
      } as Partial<TState & BaseAsyncActions>);
    },

    clearError: () => {
      set({ error: null } as Partial<TState & BaseAsyncActions>);
    },

    updateLastFetch: () => {
      set({
        lastFetch: new Date().toISOString(),
      } as Partial<TState & BaseAsyncActions>);
    },

    reset: () => {
      set(initialState as TState & BaseAsyncActions);
    },
  });

// === Async Handler Utility ===
export const withAsyncHandler = <TArgs extends unknown[], TResult>(
  operation: (...args: TArgs) => Promise<TResult>,
  setters: {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateLastFetch: () => void;
  },
  onSuccess?: (result: TResult) => void,
  onError?: (error: Error) => void
) => {
  return async (...args: TArgs): Promise<TResult | null> => {
    setters.setLoading(true);
    setters.setError(null);

    try {
      const result = await operation(...args);
      setters.setLoading(false);
      setters.updateLastFetch();
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Bir hata oluştu';
      setters.setError(errorMessage);
      setters.setLoading(false);
      onError?.(error as Error);
      return null;
    }
  };
};

// === API Helper ===
export const createApiCall = async <TData>(
  url: string,
  options?: RequestInit
): Promise<TData> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'API hatası');
  }

  return data.data;
};

// === Performance Optimizations ===
export const createMemoizedSelector = <TState, TResult>(
  selector: (state: TState) => TResult
) => {
  let lastState: TState;
  let lastResult: TResult;

  return (state: TState): TResult => {
    if (state !== lastState) {
      lastState = state;
      lastResult = selector(state);
    }
    return lastResult;
  };
};

// createDebouncedAction moved to optimized.ts to avoid duplication
// Use: import { createDebouncedAction } from '../optimized'

// === Cache Management ===
export const isCacheValid = (
  lastFetch: string | null,
  maxAge: number = 5 * 60 * 1000 // 5 minutes default
): boolean => {
  if (!lastFetch) return false;
  return Date.now() - new Date(lastFetch).getTime() < maxAge;
};

// === Store Validation ===
export const validateStoreState = <T>(
  state: T,
  requiredFields: (keyof T)[]
): boolean => {
  return requiredFields.every((field) => state[field] !== undefined);
};

// === Store Pattern Utilities Export ===
const storePatterns = {
  createInitialAsyncState,
  createInitialCrudState,
  createInitialPaginatedState,
  createInitialSearchState,
  createBaseAsyncActions,
  withAsyncHandler,
  createApiCall,
  createMemoizedSelector,
  isCacheValid,
  validateStoreState,
};

export default storePatterns;
