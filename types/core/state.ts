// ================================================
// STATE MANAGEMENT TYPE DEFINITIONS
// ================================================
// Type-safe Zustand store types and utilities

import { StoreApi, UseBoundStore } from 'zustand';
import { Draft } from 'immer';

// ================================
// CORE ZUSTAND TYPES
// ================================

/**
 * State setter function type for Zustand stores with Immer
 */
export type SetState<T> = (
  partial: T | Partial<T> | ((state: Draft<T>) => void),
  replace?: boolean
) => void;

/**
 * State getter function type for Zustand stores
 */
export type GetState<T> = () => T;

/**
 * Store API type from Zustand
 */
export type StateStoreApi<T> = StoreApi<T>;

/**
 * Zustand store creator function with Immer support
 */
export type StoreCreator<T> = (
  set: SetState<T>,
  get: GetState<T>,
  api: StateStoreApi<T>
) => T;

/**
 * Complete Zustand store hook type
 */
export type StateStore<T> = UseBoundStore<StoreApi<T>>;

// ================================
// ASYNC ACTION TYPES
// ================================

/**
 * Async action function that has access to set and get
 */
export type AsyncAction<TState, TResult> = (
  set: SetState<TState>,
  get: GetState<TState>
) => Promise<TResult>;

/**
 * Fetcher function for async data loading
 */
export type DataFetcher<TData> = () => Promise<TData>;

/**
 * Fetcher function with parameters
 */
export type ParameterizedFetcher<TParams, TData> = (
  params: TParams
) => Promise<TData>;

// ================================
// STORE CONFIGURATION TYPES
// ================================

/**
 * Configuration options for store creation
 */
export interface StoreConfig {
  /** Store name for DevTools and persistence */
  name: string;
  /** Enable local storage persistence */
  persist?: boolean;
  /** Enable Redux DevTools integration */
  devtools?: boolean;
  /** Custom storage (defaults to localStorage) */
  storage?: 'localStorage' | 'sessionStorage';
}

/**
 * Persist configuration options
 */
export interface PersistConfig<T> {
  /** Storage key name */
  name: string;
  /** Storage implementation */
  storage: Storage;
  /** Partial state persistence */
  partialize?: (state: T) => Partial<T>;
  /** State version for migrations */
  version?: number;
}

// ================================
// SELECTOR TYPES
// ================================

/**
 * Selector function type
 */
export type Selector<TState, TResult> = (state: TState) => TResult;

/**
 * Hook selector type
 */
export type UseSelector<TResult> = () => TResult;

/**
 * Async state selectors
 */
export interface AsyncSelectors<TData> {
  useData: UseSelector<TData | null>;
  useIsLoading: UseSelector<boolean>;
  useIsRefreshing: UseSelector<boolean>;
  useError: UseSelector<string | null>;
  useStatus: UseSelector<{
    isLoading: boolean;
    isRefreshing: boolean;
    hasError: boolean;
    hasData: boolean;
  }>;
}

/**
 * Paginated state selectors
 */
export interface PaginatedSelectors<TItem> {
  useItems: UseSelector<TItem[]>;
  usePagination: UseSelector<PaginationInfo>;
  useIsLoading: UseSelector<boolean>;
  useIsLoadingMore: UseSelector<boolean>;
  useStatus: UseSelector<{
    isLoading: boolean;
    isLoadingMore: boolean;
    isRefreshing: boolean;
    hasError: boolean;
    hasItems: boolean;
    canLoadMore: boolean;
  }>;
}

// ================================
// STATE INTERFACES
// ================================

/**
 * Base state interface with common async properties
 */
export interface BaseState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Async state for single data items
 */
export interface AsyncState<TData> extends BaseState {
  data: TData | null;
  isRefreshing: boolean;
}

/**
 * Pagination metadata
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Paginated state for lists
 */
export interface PaginatedState<TItem> extends BaseState {
  items: TItem[];
  pagination: PaginationInfo;
  isLoadingMore: boolean;
  isRefreshing: boolean;
}

/**
 * Cache state for storing multiple items by key
 */
export interface CacheState<TItem> {
  data: Record<string, TItem>;
  timestamps: Record<string, number>;
  ttl: number;
}

// ================================
// STORE ACTIONS INTERFACES
// ================================

/**
 * Base async store actions
 */
export interface AsyncStoreActions {
  fetch: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
  clearError: () => void;
}

/**
 * Complete async store state and actions
 */
export type AsyncStore<TData> = AsyncState<TData> & AsyncStoreActions;

/**
 * Paginated store actions
 */
export interface PaginatedStoreActions {
  fetch: (page?: number) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
  clearError: () => void;
  setPage: (page: number) => void;
}

/**
 * Complete paginated store state and actions
 */
export type PaginatedStore<TItem> = PaginatedState<TItem> &
  PaginatedStoreActions;

/**
 * Cache store actions
 */
export interface CacheStoreActions<TItem> {
  get: (key: string) => TItem | null;
  set: (key: string, value: TItem) => void;
  remove: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
  isExpired: (key: string) => boolean;
}

/**
 * Complete cache store state and actions
 */
export type CacheStore<TItem> = CacheState<TItem> & CacheStoreActions<TItem>;

// ================================
// UTILITY TYPES
// ================================

/**
 * Extract state type from store
 */
export type ExtractState<TStore> =
  TStore extends StateStore<infer TState> ? TState : never;

/**
 * Async function with debouncing
 */
export type DebouncedFunction<T extends (...args: unknown[]) => unknown> = (
  ...args: Parameters<T>
) => void;

/**
 * Error handler function type
 */
export type ErrorHandler = (error: Error) => void;

/**
 * Success handler function type
 */
export type SuccessHandler<TData> = (data: TData) => void;

// ================================
// STORE CREATION OPTIONS
// ================================

/**
 * Options for creating async stores
 */
export interface AsyncStoreOptions<TData> {
  /** Store name */
  name: string;
  /** Data fetcher function */
  fetcher: DataFetcher<TData>;
  /** Enable persistence */
  persist?: boolean;
  /** Enable DevTools */
  devtools?: boolean;
  /** Initial data */
  initialData?: TData | null;
  /** Error handler */
  onError?: ErrorHandler;
  /** Success handler */
  onSuccess?: SuccessHandler<TData>;
}

/**
 * Options for creating paginated stores
 */
export interface PaginatedStoreOptions<TItem> {
  /** Store name */
  name: string;
  /** Data fetcher function */
  fetcher: (
    page: number,
    limit: number
  ) => Promise<{
    items: TItem[];
    total: number;
  }>;
  /** Items per page */
  limit?: number;
  /** Enable persistence */
  persist?: boolean;
  /** Enable DevTools */
  devtools?: boolean;
  /** Error handler */
  onError?: ErrorHandler;
}

/**
 * Options for creating cache stores
 */
export interface CacheStoreOptions {
  /** Store name */
  name: string;
  /** Time to live in milliseconds */
  ttl?: number;
  /** Maximum cache size */
  maxSize?: number;
  /** Enable persistence */
  persist?: boolean;
}
