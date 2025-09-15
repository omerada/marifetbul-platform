// ================================================
// TYPE CONSTRAINTS FOR BASE STORE
// ================================================
// Better type safety for BaseStore

// Generic type constraint for entities with ID
export interface BaseEntity {
  id: string | number;
}

// Update BaseStore to require ID field
export interface BaseStoreState<T extends BaseEntity> {
  // Data
  data: T | null;
  items: T[];

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;

  // Error states
  error: string | null;
  lastError: Error | null;

  // Cache management
  lastFetchTime: number | null;
  cacheTimeout: number;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;

  // Selection
  selectedIds: Set<string>;

  // Optimistic updates
  optimisticUpdates: Map<string, T>;
}

export interface BaseStoreActions<
  T extends BaseEntity,
  CreateDTO = Partial<T>,
  UpdateDTO = Partial<T>,
> {
  // Data fetching
  fetch: (params?: Record<string, string | number | boolean>) => Promise<void>;
  fetchById: (id: string) => Promise<T | null>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;

  // CRUD operations
  create: (data: CreateDTO) => Promise<T | null>;
  update: (id: string, data: UpdateDTO) => Promise<T | null>;
  delete: (id: string) => Promise<boolean>;
  bulkDelete: (ids: string[]) => Promise<boolean>;

  // Selection
  select: (id: string) => void;
  deselect: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleSelection: (id: string) => void;

  // Cache management
  invalidateCache: () => void;
  clearCache: () => void;

  // Error handling
  clearError: () => void;

  // State management
  reset: () => void;

  // Optimistic updates
  optimisticAdd: (id: string, item: T) => void;
  optimisticUpdate: (id: string, item: T) => void;
  optimisticRemove: (id: string) => void;
  commitOptimistic: (id: string) => void;
  revertOptimistic: (id: string) => void;
}
