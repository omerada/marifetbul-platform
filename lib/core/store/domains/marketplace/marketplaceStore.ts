// ================================================
// MARKETPLACE STORE - DOMAIN BASED
// ================================================
// Uses BaseStore pattern for consistent state management

import { createBaseStore } from '../../base/BaseStore';
import type { Job, ServicePackage, JobFilters, PackageFilters } from '@/types';

// ================================
// TYPES & INTERFACES
// ================================

export interface JobCreateDTO {
  title: string;
  description: string;
  budget: number;
  deadline: string;
  skills: string[];
  categoryId: string;
  location?: string;
}

export interface JobUpdateDTO {
  title?: string;
  description?: string;
  budget?: number;
  deadline?: string;
  skills?: string[];
  status?: 'active' | 'paused' | 'completed' | 'cancelled';
}

export interface PackageCreateDTO {
  title: string;
  description: string;
  price: number;
  deliveryTime: number;
  features: string[];
  categoryId: string;
}

export interface PackageUpdateDTO {
  title?: string;
  description?: string;
  price?: number;
  deliveryTime?: number;
  features?: string[];
  isActive?: boolean;
}

export interface ViewPreferences {
  layout: 'grid' | 'list';
  itemsPerPage: 12 | 24 | 48;
  sortBy: 'newest' | 'price' | 'rating' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

// ================================
// STORES
// ================================

// Jobs Store
export const useJobsStore = createBaseStore<Job, JobCreateDTO, JobUpdateDTO>({
  endpoint: '/api/jobs',
  storeKey: 'jobs-store',
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  defaultLimit: 12,
});

// Service Packages Store
export const usePackagesStore = createBaseStore<
  ServicePackage,
  PackageCreateDTO,
  PackageUpdateDTO
>({
  endpoint: '/api/packages',
  storeKey: 'packages-store',
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  defaultLimit: 12,
});

// ================================
// COMPOSITE HOOKS
// ================================

// Marketplace-specific hooks that combine multiple stores
export function useMarketplace() {
  const jobs = useJobsStore((state) => state.items);
  const packages = usePackagesStore((state) => state.items);
  const jobsLoading = useJobsStore((state) => state.isLoading);
  const packagesLoading = usePackagesStore((state) => state.isLoading);
  const jobsRefreshing = useJobsStore((state) => state.isRefreshing);
  const packagesRefreshing = usePackagesStore((state) => state.isRefreshing);

  return {
    jobs,
    packages,
    isLoading: jobsLoading || packagesLoading,
    isRefreshing: jobsRefreshing || packagesRefreshing,
  };
}

export function useMarketplaceActions() {
  const jobsActions = {
    fetch: useJobsStore.getState().fetch,
    refresh: useJobsStore.getState().refresh,
    create: useJobsStore.getState().create,
    update: useJobsStore.getState().update,
    delete: useJobsStore.getState().delete,
  };

  const packagesActions = {
    fetch: usePackagesStore.getState().fetch,
    refresh: usePackagesStore.getState().refresh,
    create: usePackagesStore.getState().create,
    update: usePackagesStore.getState().update,
    delete: usePackagesStore.getState().delete,
  };

  return {
    jobs: jobsActions,
    packages: packagesActions,
    refreshAll: async () => {
      await Promise.all([jobsActions.refresh(), packagesActions.refresh()]);
    },
  };
}

// Specific hooks for common operations
export function useJobSearch() {
  const jobs = useJobsStore((state) => state.items);
  const isLoading = useJobsStore((state) => state.isLoading);
  const fetch = useJobsStore.getState().fetch;
  const loadMore = useJobsStore.getState().loadMore;

  const searchJobs = async (filters: JobFilters) => {
    await fetch(filters as any);
  };

  return {
    jobs,
    isLoading,
    searchJobs,
    loadMore,
  };
}

export function usePackageSearch() {
  const packages = usePackagesStore((state) => state.items);
  const isLoading = usePackagesStore((state) => state.isLoading);
  const fetch = usePackagesStore.getState().fetch;
  const loadMore = usePackagesStore.getState().loadMore;

  const searchPackages = async (filters: PackageFilters) => {
    await fetch(filters as any);
  };

  return {
    packages,
    isLoading,
    searchPackages,
    loadMore,
  };
}

// ================================
// LEGACY COMPATIBILITY
// ================================

// Marketplace store hook for backwards compatibility
export function useMarketplaceStore() {
  const marketplace = useMarketplace();
  const actions = useMarketplaceActions();

  return {
    ...marketplace,
    ...actions,
    // Legacy method names
    fetchJobs: actions.jobs.fetch,
    fetchPackages: actions.packages.fetch,
    createJob: actions.jobs.create,
    updateJob: actions.jobs.update,
    deleteJob: actions.jobs.delete,
    createPackage: actions.packages.create,
    updatePackage: actions.packages.update,
    deletePackage: actions.packages.delete,
  };
}

// Export default for main usage
export default useMarketplaceStore;
