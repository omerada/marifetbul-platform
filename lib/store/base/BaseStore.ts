import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { BaseEntity, BaseStoreState, BaseStoreActions } from './types';

export interface StoreConfig<T extends BaseEntity> {
  endpoint: string;
  storeKey: string;
  cacheTimeout?: number;
  defaultLimit?: number;
}

export function createBaseStore<
  T extends BaseEntity,
  CreateDTO = Partial<T>,
  UpdateDTO = Partial<T>,
>(config: StoreConfig<T>) {
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
    cacheTimeout: config.cacheTimeout || 300000,
    pagination: null,
    selectedIds: new Set(),
    optimisticUpdates: new Map(),
  };

  const store = create<Store>()(
    devtools(
      immer(() => ({
        ...initialState,

        async fetch(): Promise<void> {},
        async fetchById(id: string): Promise<T | null> {
          return null;
        },
        async refresh(): Promise<void> {},
        async loadMore(): Promise<void> {},
        async create(data: CreateDTO): Promise<T | null> {
          return null;
        },
        async update(id: string, data: UpdateDTO): Promise<T | null> {
          return null;
        },
        async delete(id: string): Promise<boolean> {
          return false;
        },
        async bulkDelete(ids: string[]): Promise<boolean> {
          return false;
        },
        select(id: string): void {},
        deselect(id: string): void {},
        selectAll(): void {},
        deselectAll(): void {},
        toggleSelection(id: string): void {},
        invalidateCache(): void {},
        clearCache(): void {},
        clearError(): void {},
        reset(): void {},
        optimisticAdd(id: string, item: T): void {},
        optimisticUpdate(id: string, item: T): void {},
        optimisticRemove(id: string): void {},
        commitOptimistic(id: string): void {},
        revertOptimistic(id: string): void {},
      })),
      { name: config.storeKey }
    )
  );

  return store;
}

export type { BaseStoreState, BaseStoreActions };
