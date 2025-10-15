// ================================================
// UNIFIED STATE MANAGEMENT SYSTEM
// ================================================
// Modern Zustand-based state management with performance optimizations

import { create, StoreApi, UseBoundStore } from 'zustand';
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

export interface AsyncActions {
  fetch: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
  clearError: () => void;
}

// ================================
// STORE UTILITIES
// ================================

export function createStoreWithMiddleware<T>(
  storeCreator: (
    set: StoreApi<T>['setState'],
    get: StoreApi<T>['getState'],
    api: StoreApi<T>
  ) => T,
  config: {
    name: string;
    persist?: boolean;
    devtools?: boolean;
  }
): UseBoundStore<StoreApi<T>> {
  let store: typeof storeCreator = storeCreator;

  if (config.persist) {
    store = persist(store, {
      name: `marifet-${config.name}`,
      storage: createJSONStorage(() => localStorage),
    }) as typeof storeCreator;
  }

  if (config.devtools && process.env.NODE_ENV === 'development') {
    store = devtools(store, { name: config.name }) as typeof storeCreator;
  }

  // @ts-expect-error - Zustand v4 + Immer middleware type compatibility issue
  // See: https://github.com/pmndrs/zustand/issues/1937
  return create(immer(store));
}

// ================================
// PERFORMANCE OPTIMIZATIONS
// ================================

export function withDebounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function createAsyncAction<TState extends BaseState, TResult>(
  actionName: string,
  asyncFn: () => Promise<TResult>
) {
  return async (
    set: (fn: (draft: TState) => void) => void,
    get: () => TState
  ) => {
    const state = get();

    if (state.isLoading) return;

    set((draft: TState) => {
      draft.isLoading = true;
      draft.error = null;
    });

    try {
      const result = await asyncFn();
      // @ts-expect-error - Type assertion needed for AsyncState extension
      set((draft: TState & AsyncState<TResult>) => {
        draft.data = result;
        draft.isLoading = false;
        draft.lastUpdated = new Date();
      });
      return result;
    } catch (error) {
      set((draft: TState) => {
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

export function createAsyncSelectors<T>(
  store: UseBoundStore<StoreApi<AsyncState<T>>>
) {
  return {
    useData: () => store((state) => state.data),
    useIsLoading: () => store((state) => state.isLoading),
    useIsRefreshing: () => store((state) => state.isRefreshing),
    useError: () => store((state) => state.error),
    useStatus: () =>
      store((state) => ({
        isLoading: state.isLoading,
        isRefreshing: state.isRefreshing,
        hasError: !!state.error,
        hasData: !!state.data,
      })),
  };
}

export function createPaginatedSelectors<T>(
  store: UseBoundStore<StoreApi<PaginatedState<T>>>
) {
  return {
    useItems: () => store((state) => state.items),
    usePagination: () => store((state) => state.pagination),
    useIsLoading: () => store((state) => state.isLoading),
    useIsLoadingMore: () => store((state) => state.isLoadingMore),
    useStatus: () =>
      store((state) => ({
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
  type StoreState = AsyncState<T> & AsyncActions;

  // Using type assertion for Zustand+Immer middleware compatibility
  // The middleware chain causes complex type inference issues
  return createStoreWithMiddleware<StoreState>(
    (set, get) => ({
      data: null,
      isLoading: false,
      isRefreshing: false,
      error: null,
      lastUpdated: null,

      fetch: async () => {
        const state = get();
        if (state.isLoading) return;

        // @ts-expect-error - Immer draft mutation pattern
        set((draft) => {
          draft.isLoading = true;
          draft.error = null;
        });

        try {
          const data = await fetcher();
          // @ts-expect-error - Immer draft mutation pattern
          set((draft) => {
            draft.data = data;
            draft.isLoading = false;
            draft.lastUpdated = new Date();
          });
        } catch (error) {
          // @ts-expect-error - Immer draft mutation pattern
          set((draft) => {
            draft.error =
              error instanceof Error ? error.message : 'An error occurred';
            draft.isLoading = false;
          });
        }
      },

      refresh: async () => {
        const state = get();
        if (state.isRefreshing) return;

        // @ts-expect-error - Immer draft mutation pattern
        set((draft) => {
          draft.isRefreshing = true;
          draft.error = null;
        });

        try {
          const data = await fetcher();
          // @ts-expect-error - Immer draft mutation pattern
          set((draft) => {
            draft.data = data;
            draft.isRefreshing = false;
            draft.lastUpdated = new Date();
          });
        } catch (error) {
          // @ts-expect-error - Immer draft mutation pattern
          set((draft) => {
            draft.error =
              error instanceof Error ? error.message : 'An error occurred';
            draft.isRefreshing = false;
          });
        }
      },

      reset: () => {
        // @ts-expect-error - Immer draft mutation pattern
        set((draft) => {
          draft.data = null;
          draft.isLoading = false;
          draft.isRefreshing = false;
          draft.error = null;
          draft.lastUpdated = null;
        });
      },

      clearError: () => {
        // @ts-expect-error - Immer draft mutation pattern
        set((draft) => {
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

const unifiedStateSystem = {
  createStoreWithMiddleware,
  createAsyncAction,
  createAsyncSelectors,
  createPaginatedSelectors,
  createBaseAsyncStore,
  withDebounce,
};

export default unifiedStateSystem;
