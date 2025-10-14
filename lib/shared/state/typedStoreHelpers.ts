// ================================================
// TYPE-SAFE STORE UTILITIES
// ================================================
// Pragmatic approach to typed Zustand stores
// Compatible with existing codebase, gradually adoptable

import { create, StoreApi } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

// ================================
// TYPES
// ================================

/**
 * Base state interface - all stores should extend this
 */
export interface TypedBaseState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Async data state
 */
export interface TypedAsyncState<TData> extends TypedBaseState {
  data: TData | null;
  isRefreshing: boolean;
}

/**
 * Store configuration
 */
export interface TypedStoreConfig<TState extends TypedBaseState> {
  /** Store name for DevTools and persistence */
  name: string;
  /** Initial state */
  initialState: TState;
  /** Store actions */
  actions: (
    set: StoreApi<TState>['setState'],
    get: StoreApi<TState>['getState']
  ) => Partial<TState>;
  /** Enable Redux DevTools (default: true in development) */
  devtools?: boolean;
  /** Enable local storage persistence */
  persist?: boolean;
}

/**
 * Async store configuration
 */
export interface TypedAsyncStoreConfig<TData> {
  /** Store name */
  name: string;
  /** Data fetcher function */
  fetcher: () => Promise<TData>;
  /** Initial data */
  initialData?: TData | null;
  /** Enable persistence */
  persist?: boolean;
  /** Enable DevTools */
  devtools?: boolean;
  /** Error handler */
  onError?: (error: Error) => void;
  /** Success handler */
  onSuccess?: (data: TData) => void;
}

// ================================
// BASIC TYPED STORE
// ================================

/**
 * Create a type-safe Zustand store
 *
 * @example
 * ```typescript
 * interface CounterState extends TypedBaseState {
 *   count: number;
 * }
 *
 * const useCounterStore = createTypedStore<CounterState>({
 *   name: 'counter',
 *   initialState: {
 *     count: 0,
 *     isLoading: false,
 *     error: null,
 *     lastUpdated: null,
 *   },
 *   actions: (set, get) => ({
 *     increment: () => set({ count: get().count + 1 }),
 *     decrement: () => set({ count: get().count - 1 }),
 *   }),
 * });
 * ```
 */
export function createTypedStore<TState extends TypedBaseState>(
  config: TypedStoreConfig<TState>
) {
  const {
    name,
    initialState,
    actions,
    devtools: enableDevtools,
    persist: enablePersist,
  } = config;

  // Create base store
  const store = create<TState>()((set, get) => ({
    ...initialState,
    ...actions(set, get),
  }));

  // Apply middleware if needed
  if (enableDevtools && process.env.NODE_ENV === 'development') {
    // Note: Middleware wrapping is complex, so we create a new store with devtools
    return create<TState>()(
      devtools(
        (set, get) => ({
          ...initialState,
          ...actions(set, get),
        }),
        { name }
      )
    );
  }

  if (enablePersist) {
    return create<TState>()(
      persist(
        (set, get) => ({
          ...initialState,
          ...actions(set, get),
        }),
        {
          name: `marifet-${name}`,
          storage: createJSONStorage(() => localStorage),
        }
      )
    );
  }

  return store;
}

// ================================
// ASYNC STORE HELPER
// ================================

/**
 * Create a type-safe async data store
 * Includes fetch, refresh, reset, and error handling
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 * }
 *
 * const useUserStore = createTypedAsyncStore<User>({
 *   name: 'user',
 *   fetcher: async () => {
 *     const response = await fetch('/api/user');
 *     return response.json();
 *   },
 *   onSuccess: (user) => console.log('User loaded:', user),
 *   onError: (error) => console.error('Failed to load user:', error),
 * });
 *
 * // Usage in component:
 * const { data: user, isLoading, error, fetch, refresh } = useUserStore();
 * ```
 */
export function createTypedAsyncStore<TData>(
  config: TypedAsyncStoreConfig<TData>
) {
  const {
    name,
    fetcher,
    initialData = null,
    persist: enablePersist,
    devtools: enableDevtools,
    onError,
    onSuccess,
  } = config;

  type AsyncStoreState = TypedAsyncState<TData> & {
    fetch: () => Promise<void>;
    refresh: () => Promise<void>;
    reset: () => void;
    clearError: () => void;
    setData: (data: TData | null) => void;
  };

  const initialState: TypedAsyncState<TData> = {
    data: initialData,
    isLoading: false,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
  };

  const createStore = (
    set: StoreApi<AsyncStoreState>['setState'],
    get: StoreApi<AsyncStoreState>['getState']
  ) => ({
    ...initialState,

    fetch: async () => {
      const state = get();
      if (state.isLoading) return;

      set({ isLoading: true, error: null });

      try {
        const data = await fetcher();
        set({
          data,
          isLoading: false,
          lastUpdated: new Date(),
        });
        onSuccess?.(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An error occurred';
        set({
          error: errorMessage,
          isLoading: false,
        });
        onError?.(error instanceof Error ? error : new Error(errorMessage));
      }
    },

    refresh: async () => {
      const state = get();
      if (state.isRefreshing) return;

      set({ isRefreshing: true, error: null });

      try {
        const data = await fetcher();
        set({
          data,
          isRefreshing: false,
          lastUpdated: new Date(),
        });
        onSuccess?.(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An error occurred';
        set({
          error: errorMessage,
          isRefreshing: false,
        });
        onError?.(error instanceof Error ? error : new Error(errorMessage));
      }
    },

    reset: () => {
      set(initialState);
    },

    clearError: () => {
      set({ error: null });
    },

    setData: (data: TData | null) => {
      set({ data });
    },
  });

  // Apply middleware based on config
  if (enableDevtools && process.env.NODE_ENV === 'development') {
    return create<AsyncStoreState>()(devtools(createStore, { name }));
  }

  if (enablePersist) {
    return create<AsyncStoreState>()(
      persist(createStore, {
        name: `marifet-${name}`,
        storage: createJSONStorage(() => localStorage),
      })
    );
  }

  return create<AsyncStoreState>()(createStore);
}

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Create a typed selector hook
 *
 * @example
 * ```typescript
 * const useUserName = createTypedSelector(
 *   useUserStore,
 *   (state) => state.data?.name
 * );
 * ```
 */
export function createTypedSelector<TState, TResult>(
  store: (selector: (state: TState) => TResult) => TResult,
  selector: (state: TState) => TResult
) {
  return () => store(selector);
}

/**
 * Create multiple typed selectors
 *
 * @example
 * ```typescript
 * const userSelectors = createTypedSelectors(useUserStore, {
 *   name: (state) => state.data?.name,
 *   email: (state) => state.data?.email,
 *   isLoading: (state) => state.isLoading,
 * });
 *
 * // Usage:
 * const name = userSelectors.useName();
 * const email = userSelectors.useEmail();
 * ```
 */
export function createTypedSelectors<
  TState,
  TSelectors extends Record<string, (state: TState) => unknown>,
>(
  store: (selector: (state: TState) => unknown) => unknown,
  selectors: TSelectors
) {
  const result = {} as {
    [K in keyof TSelectors as `use${Capitalize<string & K>}`]: () => ReturnType<
      TSelectors[K]
    >;
  };

  for (const [key, selector] of Object.entries(selectors)) {
    const hookName =
      `use${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof typeof result;
    result[hookName] = (() =>
      store(
        selector as (state: TState) => unknown
      )) as (typeof result)[typeof hookName];
  }

  return result;
}

/**
 * Debounce utility for actions
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   // Search logic
 * }, 300);
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle utility for actions
 *
 * @example
 * ```typescript
 * const throttledScroll = throttle((event: Event) => {
 *   // Scroll logic
 * }, 100);
 * ```
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall < delay) return;
    lastCall = now;
    fn(...args);
  };
}

// ================================
// EXPORTS
// ================================

const typedStoreHelpers = {
  createTypedStore,
  createTypedAsyncStore,
  createTypedSelector,
  createTypedSelectors,
  debounce,
  throttle,
};

export default typedStoreHelpers;
