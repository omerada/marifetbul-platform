/* eslint-disable @typescript-eslint/no-unused-vars */
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
        async fetchById(_id: string): Promise<T | null> {
          return null;
        },
        async refresh(): Promise<void> {},
        async loadMore(): Promise<void> {},
        async create(_data: CreateDTO): Promise<T | null> {
          return null;
        },
        async update(_id: string, _data: UpdateDTO): Promise<T | null> {
          return null;
        },
        async delete(_id: string): Promise<boolean> {
          return false;
        },
        async bulkDelete(_ids: string[]): Promise<boolean> {
          return false;
        },
        select(_id: string): void {},
        deselect(_id: string): void {},
        selectAll(): void {},
        deselectAll(): void {},
        toggleSelection(_id: string): void {},
        invalidateCache(): void {},
        clearCache(): void {},
        clearError(): void {},
        reset(): void {},
        optimisticAdd(_id: string, _item: T): void {},
        optimisticUpdate(_id: string, _item: T): void {},
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
