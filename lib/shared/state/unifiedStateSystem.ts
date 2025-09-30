// ================================================
// UNIFIED STATE MANAGEMENT SYSTEM
// ================================================
// Modern Zustand-based state management with performance optimizations

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ================================
// TYPES
// ================================

export interface BaseState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface PaginatedState<T> extends BaseState {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  isLoadingMore: boolean;
  isRefreshing: boolean;
}

export interface AsyncState<T> extends BaseState {
  data: T | null;
  isRefreshing: boolean;
}

export interface CacheState<T> {
  data: Record<string, T>;
  timestamps: Record<string, number>;
  ttl: number;
}

// ================================
// STORE UTILITIES
// ================================

export function createStoreWithMiddleware<T>(
  storeCreator: any,
  config: {
    name: string;
    persist?: boolean;
    devtools?: boolean;
  }
) {
  let store = storeCreator;

  if (config.persist) {
    store = persist(store, {
      name: `marifet-${config.name}`,
      storage: createJSONStorage(() => localStorage),
    });
  }

  if (config.devtools && process.env.NODE_ENV === 'development') {
    store = devtools(store, { name: config.name });
  }

  return create(immer(store));
}

// ================================
// PERFORMANCE OPTIMIZATIONS
// ================================

export function withDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

export function createAsyncAction<T>(
  actionName: string,
  asyncFn: () => Promise<T>
) {
  return async (set: any, get: any) => {
    const state = get();

    if (state.isLoading) return;

    set((draft: any) => {
      draft.isLoading = true;
      draft.error = null;
    });

    try {
      const result = await asyncFn();
      set((draft: any) => {
        draft.data = result;
        draft.isLoading = false;
        draft.lastUpdated = new Date();
      });
      return result;
    } catch (error) {
      set((draft: any) => {
        draft.error =
          error instanceof Error ? error.message : 'An error occurred';
        draft.isLoading = false;
      });
      throw error;
    }
  };
}

// ================================
// SELECTORS HELPERS
// ================================

export function createAsyncSelectors<T>(store: any) {
  return {
    useData: () => store((state: AsyncState<T>) => state.data),
    useIsLoading: () => store((state: AsyncState<T>) => state.isLoading),
    useIsRefreshing: () => store((state: AsyncState<T>) => state.isRefreshing),
    useError: () => store((state: AsyncState<T>) => state.error),
    useStatus: () =>
      store((state: AsyncState<T>) => ({
        isLoading: state.isLoading,
        isRefreshing: state.isRefreshing,
        hasError: !!state.error,
        hasData: !!state.data,
      })),
  };
}

export function createPaginatedSelectors<T>(store: any) {
  return {
    useItems: () => store((state: PaginatedState<T>) => state.items),
    usePagination: () => store((state: PaginatedState<T>) => state.pagination),
    useIsLoading: () => store((state: PaginatedState<T>) => state.isLoading),
    useIsLoadingMore: () =>
      store((state: PaginatedState<T>) => state.isLoadingMore),
    useStatus: () =>
      store((state: PaginatedState<T>) => ({
        isLoading: state.isLoading,
        isLoadingMore: state.isLoadingMore,
        isRefreshing: state.isRefreshing,
        hasError: !!state.error,
        hasItems: state.items.length > 0,
        canLoadMore: state.pagination.hasNextPage,
      })),
  };
}

// ================================
// COMMON STORE PATTERNS
// ================================

export const createBaseAsyncStore = <T>(
  name: string,
  fetcher: () => Promise<T>
) => {
  return createStoreWithMiddleware(
    (set: any, get: any) => ({
      data: null,
      isLoading: false,
      isRefreshing: false,
      error: null,
      lastUpdated: null,

      fetch: async () => {
        const state = get();
        if (state.isLoading) return;

        set((draft: any) => {
          draft.isLoading = true;
          draft.error = null;
        });

        try {
          const data = await fetcher();
          set((draft: any) => {
            draft.data = data;
            draft.isLoading = false;
            draft.lastUpdated = new Date();
          });
        } catch (error) {
          set((draft: any) => {
            draft.error =
              error instanceof Error ? error.message : 'An error occurred';
            draft.isLoading = false;
          });
        }
      },

      refresh: async () => {
        const state = get();
        if (state.isRefreshing) return;

        set((draft: any) => {
          draft.isRefreshing = true;
          draft.error = null;
        });

        try {
          const data = await fetcher();
          set((draft: any) => {
            draft.data = data;
            draft.isRefreshing = false;
            draft.lastUpdated = new Date();
          });
        } catch (error) {
          set((draft: any) => {
            draft.error =
              error instanceof Error ? error.message : 'An error occurred';
            draft.isRefreshing = false;
          });
        }
      },

      reset: () => {
        set((draft: any) => {
          draft.data = null;
          draft.isLoading = false;
          draft.isRefreshing = false;
          draft.error = null;
          draft.lastUpdated = null;
        });
      },

      clearError: () => {
        set((draft: any) => {
          draft.error = null;
        });
      },
    }),
    { name, devtools: true }
  );
};

// ================================
// EXPORTS
// ================================

export default {
  createStoreWithMiddleware,
  createAsyncAction,
  createAsyncSelectors,
  createPaginatedSelectors,
  createBaseAsyncStore,
  withDebounce,
};
