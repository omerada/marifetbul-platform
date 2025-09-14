import React from 'react';
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { shallow } from 'zustand/shallow';
import type { Draft } from 'immer';

// ================================================
// DOMAIN-BASED STORE ARCHITECTURE - PRODUCTION READY
// ================================================
// Unified store pattern for consistent state management
// Performance optimized with proper cleanup and selectors

// Base store pattern interface
export interface BaseStoreState<T> {
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
  T,
  CreateDTO = Partial<T>,
  UpdateDTO = Partial<T>,
> {
  // Data fetching
  fetch: (params?: any) => Promise<void>;
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

// Generic store creator function
export function createBaseStore<
  T,
  CreateDTO = Partial<T>,
  UpdateDTO = Partial<T>,
>(
  name: string,
  config: {
    apiEndpoint: string;
    cacheTimeout?: number;
    defaultLimit?: number;
  }
) {
  const {
    apiEndpoint,
    cacheTimeout = 5 * 60 * 1000,
    defaultLimit = 20,
  } = config;

  type StoreState = BaseStoreState<T>;
  type StoreActions = BaseStoreActions<T, CreateDTO, UpdateDTO>;
  type Store = StoreState & StoreActions;

  const initialState: StoreState = {
    data: null,
    items: [],
    isLoading: false,
    isRefreshing: false,
    isLoadingMore: false,
    error: null,
    lastError: null,
    lastFetchTime: null,
    cacheTimeout,
    pagination: null,
    selectedIds: new Set<string>(),
    optimisticUpdates: new Map<string, T>(),
  };

  return create<Store>()(
    subscribeWithSelector(
      devtools(
        immer<Store>((set, get) => ({
          ...initialState,

          // Data fetching
          fetch: async (params = {}) => {
            const state = get();

            // Check cache validity
            if (
              state.lastFetchTime &&
              Date.now() - state.lastFetchTime < state.cacheTimeout
            ) {
              return;
            }

            set((draft) => {
              draft.isLoading = true;
              draft.error = null;
            });

            try {
              const queryParams = new URLSearchParams({
                page: '1',
                limit: defaultLimit.toString(),
                ...params,
              });

              const response = await fetch(`${apiEndpoint}?${queryParams}`);

              if (!response.ok) {
                throw new Error(
                  `HTTP ${response.status}: ${response.statusText}`
                );
              }

              const result = await response.json();

              set((draft) => {
                draft.items = result.data || result.items || result;
                draft.pagination = result.pagination || null;
                draft.lastFetchTime = Date.now();
                draft.isLoading = false;
                draft.error = null;
              });
            } catch (error) {
              set((draft) => {
                draft.error =
                  error instanceof Error ? error.message : 'Unknown error';
                draft.lastError =
                  error instanceof Error ? error : new Error('Unknown error');
                draft.isLoading = false;
              });
            }
          },

          fetchById: async (id: string) => {
            set((draft) => {
              draft.isLoading = true;
              draft.error = null;
            });

            try {
              const response = await fetch(`${apiEndpoint}/${id}`);

              if (!response.ok) {
                throw new Error(
                  `HTTP ${response.status}: ${response.statusText}`
                );
              }

              const result = await response.json();
              const item = result.data || result;

              set((draft) => {
                draft.data = item;

                // Update item in items array if it exists
                const existingIndex = draft.items.findIndex(
                  (i: any) => i.id === id
                );
                if (existingIndex !== -1) {
                  draft.items[existingIndex] = item;
                }

                draft.isLoading = false;
                draft.error = null;
              });

              return item;
            } catch (error) {
              set((draft) => {
                draft.error =
                  error instanceof Error ? error.message : 'Unknown error';
                draft.lastError =
                  error instanceof Error ? error : new Error('Unknown error');
                draft.isLoading = false;
              });
              return null;
            }
          },

          refresh: async () => {
            set((draft) => {
              draft.isRefreshing = true;
              draft.lastFetchTime = null; // Force refresh
            });

            await get().fetch();

            set((draft) => {
              draft.isRefreshing = false;
            });
          },

          loadMore: async () => {
            const state = get();

            if (!state.pagination?.hasNext || state.isLoadingMore) {
              return;
            }

            set((draft) => {
              draft.isLoadingMore = true;
            });

            try {
              const queryParams = new URLSearchParams({
                page: (state.pagination.page + 1).toString(),
                limit: state.pagination.limit.toString(),
              });

              const response = await fetch(`${apiEndpoint}?${queryParams}`);

              if (!response.ok) {
                throw new Error(
                  `HTTP ${response.status}: ${response.statusText}`
                );
              }

              const result = await response.json();

              set((draft) => {
                draft.items.push(...(result.data || result.items || result));
                draft.pagination = result.pagination || draft.pagination;
                draft.isLoadingMore = false;
              });
            } catch (error) {
              set((draft) => {
                draft.error =
                  error instanceof Error ? error.message : 'Unknown error';
                draft.isLoadingMore = false;
              });
            }
          },

          // CRUD operations
          create: async (data: CreateDTO) => {
            set((draft) => {
              draft.isLoading = true;
              draft.error = null;
            });

            try {
              const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });

              if (!response.ok) {
                throw new Error(
                  `HTTP ${response.status}: ${response.statusText}`
                );
              }

              const result = await response.json();
              const newItem = result.data || result;

              set((draft) => {
                draft.items.unshift(newItem);
                draft.data = newItem;
                draft.isLoading = false;
              });

              return newItem;
            } catch (error) {
              set((draft) => {
                draft.error =
                  error instanceof Error ? error.message : 'Unknown error';
                draft.lastError =
                  error instanceof Error ? error : new Error('Unknown error');
                draft.isLoading = false;
              });
              return null;
            }
          },

          update: async (id: string, data: UpdateDTO) => {
            // Optimistic update
            const optimisticId = `update_${id}_${Date.now()}`;
            const state = get();
            const existingItem = state.items.find(
              (item: any) => item.id === id
            );

            if (existingItem) {
              const optimisticItem = { ...existingItem, ...data } as T;
              get().optimisticUpdate(optimisticId, optimisticItem);
            }

            try {
              const response = await fetch(`${apiEndpoint}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });

              if (!response.ok) {
                throw new Error(
                  `HTTP ${response.status}: ${response.statusText}`
                );
              }

              const result = await response.json();
              const updatedItem = result.data || result;

              set((draft) => {
                // Remove optimistic update
                draft.optimisticUpdates.delete(optimisticId);

                // Update items array
                const index = draft.items.findIndex(
                  (item: any) => item.id === id
                );
                if (index !== -1) {
                  draft.items[index] = updatedItem;
                }

                // Update current data if it matches
                if (draft.data && (draft.data as any).id === id) {
                  draft.data = updatedItem;
                }
              });

              return updatedItem;
            } catch (error) {
              // Revert optimistic update
              get().revertOptimistic(optimisticId);

              set((draft) => {
                draft.error =
                  error instanceof Error ? error.message : 'Unknown error';
                draft.lastError =
                  error instanceof Error ? error : new Error('Unknown error');
              });
              return null;
            }
          },

          delete: async (id: string) => {
            // Optimistic deletion
            const optimisticId = `delete_${id}_${Date.now()}`;
            get().optimisticRemove(optimisticId);

            try {
              const response = await fetch(`${apiEndpoint}/${id}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error(
                  `HTTP ${response.status}: ${response.statusText}`
                );
              }

              set((draft) => {
                // Remove from items
                draft.items = draft.items.filter((item: any) => item.id !== id);

                // Clear current data if it matches
                if (draft.data && (draft.data as any).id === id) {
                  draft.data = null;
                }

                // Remove from selection
                draft.selectedIds.delete(id);

                // Remove optimistic update
                draft.optimisticUpdates.delete(optimisticId);
              });

              return true;
            } catch (error) {
              // Revert optimistic deletion
              get().revertOptimistic(optimisticId);

              set((draft) => {
                draft.error =
                  error instanceof Error ? error.message : 'Unknown error';
                draft.lastError =
                  error instanceof Error ? error : new Error('Unknown error');
              });
              return false;
            }
          },

          bulkDelete: async (ids: string[]) => {
            try {
              const response = await fetch(`${apiEndpoint}/bulk-delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
              });

              if (!response.ok) {
                throw new Error(
                  `HTTP ${response.status}: ${response.statusText}`
                );
              }

              set((draft) => {
                draft.items = draft.items.filter(
                  (item: any) => !ids.includes(item.id)
                );
                ids.forEach((id) => draft.selectedIds.delete(id));

                if (draft.data && ids.includes((draft.data as any).id)) {
                  draft.data = null;
                }
              });

              return true;
            } catch (error) {
              set((draft) => {
                draft.error =
                  error instanceof Error ? error.message : 'Unknown error';
                draft.lastError =
                  error instanceof Error ? error : new Error('Unknown error');
              });
              return false;
            }
          },

          // Selection methods
          select: (id: string) => {
            set((draft) => {
              draft.selectedIds.add(id);
            });
          },

          deselect: (id: string) => {
            set((draft) => {
              draft.selectedIds.delete(id);
            });
          },

          selectAll: () => {
            set((draft) => {
              draft.items.forEach((item: any) => {
                draft.selectedIds.add(item.id);
              });
            });
          },

          deselectAll: () => {
            set((draft) => {
              draft.selectedIds.clear();
            });
          },

          toggleSelection: (id: string) => {
            set((draft) => {
              if (draft.selectedIds.has(id)) {
                draft.selectedIds.delete(id);
              } else {
                draft.selectedIds.add(id);
              }
            });
          },

          // Cache management
          invalidateCache: () => {
            set((draft) => {
              draft.lastFetchTime = null;
            });
          },

          clearCache: () => {
            set((draft) => {
              draft.items = [];
              draft.data = null;
              draft.lastFetchTime = null;
              draft.pagination = null;
            });
          },

          // Error handling
          clearError: () => {
            set((draft) => {
              draft.error = null;
              draft.lastError = null;
            });
          },

          // State management
          reset: () => {
            set(() => ({
              ...initialState,
              selectedIds: new Set<string>(),
              optimisticUpdates: new Map<string, T>(),
            }));
          },

          // Optimistic updates
          optimisticAdd: (id: string, item: T) => {
            set((draft) => {
              draft.optimisticUpdates.set(id, item as Draft<T>);
            });
          },

          optimisticUpdate: (id: string, item: T) => {
            set((draft) => {
              draft.optimisticUpdates.set(id, item as Draft<T>);
            });
          },

          optimisticRemove: (id: string) => {
            set((draft) => {
              draft.optimisticUpdates.set(id, null as any);
            });
          },

          commitOptimistic: (id: string) => {
            set((draft) => {
              draft.optimisticUpdates.delete(id);
            });
          },

          revertOptimistic: (id: string) => {
            set((draft) => {
              draft.optimisticUpdates.delete(id);
            });
          },
        })),
        { name: `${name}-store` }
      )
    )
  );
}

// ================================================
// OPTIMIZED SELECTORS
// ================================================
// Memoized selectors to prevent unnecessary re-renders

export function createOptimizedSelectors<T>(store: any) {
  return {
    // Data selectors
    useItems: () => store((state: any) => state.items, shallow),
    useData: () => store((state: any) => state.data),

    // Loading selectors
    useLoading: () =>
      store(
        (state: any) => ({
          isLoading: state.isLoading,
          isRefreshing: state.isRefreshing,
          isLoadingMore: state.isLoadingMore,
        }),
        shallow
      ),

    // Error selectors
    useError: () =>
      store(
        (state: any) => ({
          error: state.error,
          lastError: state.lastError,
        }),
        shallow
      ),

    // Pagination selectors
    usePagination: () => store((state: any) => state.pagination),

    // Selection selectors
    useSelection: () =>
      store(
        (state: any) => ({
          selectedIds: Array.from(state.selectedIds),
          selectedCount: state.selectedIds.size,
        }),
        shallow
      ),

    // Cache selectors
    useCache: () =>
      store(
        (state: any) => ({
          lastFetchTime: state.lastFetchTime,
          isStale: state.lastFetchTime
            ? Date.now() - state.lastFetchTime > state.cacheTimeout
            : true,
        }),
        shallow
      ),

    // Actions selector (stable reference)
    useActions: () =>
      store(
        (state: any) => ({
          fetch: state.fetch,
          fetchById: state.fetchById,
          refresh: state.refresh,
          loadMore: state.loadMore,
          create: state.create,
          update: state.update,
          delete: state.delete,
          bulkDelete: state.bulkDelete,
          select: state.select,
          deselect: state.deselect,
          selectAll: state.selectAll,
          deselectAll: state.deselectAll,
          toggleSelection: state.toggleSelection,
          invalidateCache: state.invalidateCache,
          clearCache: state.clearCache,
          clearError: state.clearError,
          reset: state.reset,
        }),
        shallow
      ),
  };
}

// ================================================
// MEMORY LEAK PREVENTION
// ================================================

// Cleanup utility for store subscriptions
export function createStoreCleanup() {
  const subscriptions = new Set<() => void>();

  const addSubscription = (unsubscribe: () => void) => {
    subscriptions.add(unsubscribe);
    return unsubscribe;
  };

  const cleanup = () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
    subscriptions.clear();
  };

  return { addSubscription, cleanup };
}

// Hook for automatic cleanup on unmount
export function useStoreCleanup() {
  const cleanupRef = React.useRef(createStoreCleanup());

  React.useEffect(() => {
    return () => {
      cleanupRef.current.cleanup();
    };
  }, []);

  return cleanupRef.current;
}

// ================================================
// PERFORMANCE MONITORING
// ================================================

// Store performance monitoring
export function createStoreMonitor(storeName: string) {
  let lastStateChange = Date.now();
  let changeCount = 0;

  return {
    trackChange: () => {
      const now = Date.now();
      changeCount++;

      if (process.env.NODE_ENV === 'development') {
        const timeSinceLastChange = now - lastStateChange;

        if (timeSinceLastChange < 16) {
          // Less than 1 frame
          console.warn(
            `[${storeName}] Rapid state changes detected: ${changeCount} changes`
          );
        }
      }

      lastStateChange = now;
    },

    reset: () => {
      changeCount = 0;
      lastStateChange = Date.now();
    },
  };
}

export default createBaseStore;
