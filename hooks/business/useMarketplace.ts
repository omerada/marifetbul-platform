'use client';

import { useCallback, useMemo } from 'react';
import {
  useJobsStore,
  usePackagesStore,
} from '@/lib/core/store/domains/marketplace/marketplaceStore';
import type { JobFilters, PackageFilters } from '@/types';
import type { ViewPreferences } from '@/lib/core/validations/marketplace';

export function useMarketplace() {
  // Store state
  const jobs = useJobsStore((state) => state.items);
  const packages = usePackagesStore((state) => state.items);

  const rawJobsPagination = useJobsStore((state) => state.pagination);
  const rawPackagesPagination = usePackagesStore((state) => state.pagination);

  const jobsPagination = useMemo(() => {
    return (
      rawJobsPagination || {
        total: 0,
        page: 1,
        totalPages: 1,
        limit: 12,
      }
    );
  }, [rawJobsPagination]);

  const packagesPagination = useMemo(() => {
    return (
      rawPackagesPagination || {
        total: 0,
        page: 1,
        totalPages: 1,
        limit: 12,
      }
    );
  }, [rawPackagesPagination]);

  // Loading states
  const jobsLoading = useJobsStore((state) => state.isLoading);
  const packagesLoading = usePackagesStore((state) => state.isLoading);
  const isLoading = jobsLoading || packagesLoading;

  const jobsLoadingMore = useJobsStore((state) => state.isLoadingMore);
  const packagesLoadingMore = usePackagesStore((state) => state.isLoadingMore);
  const isLoadingMore = jobsLoadingMore || packagesLoadingMore;

  // Errors
  const jobsError = useJobsStore((state) => state.error);
  const packagesError = usePackagesStore((state) => state.error);
  const error = jobsError || packagesError;

  // Store actions
  const fetchJobs = useJobsStore((state) => state.fetch);
  const fetchPackages = usePackagesStore((state) => state.fetch);
  const refreshJobs = useJobsStore((state) => state.refresh);
  const refreshPackages = usePackagesStore((state) => state.refresh);
  const loadMoreJobs = useJobsStore((state) => state.loadMore);
  const loadMorePackages = usePackagesStore((state) => state.loadMore);

  // State for features - using BaseStore data
  const jobFilters: JobFilters = useMemo(
    () => ({
      page: jobsPagination.page,
      limit: jobsPagination.limit,
      search: '',
    }),
    [jobsPagination.page, jobsPagination.limit]
  );

  const packageFilters: PackageFilters = useMemo(
    () => ({
      page: packagesPagination.page,
      limit: packagesPagination.limit,
      search: '',
    }),
    [packagesPagination.page, packagesPagination.limit]
  );

  const viewPreferences: ViewPreferences = useMemo(
    () => ({
      layout: 'grid' as const,
      itemsPerPage: 12,
      showFilters: true,
      showAdvancedFilters: false,
      sortBy: 'newest' as const,
      sortOrder: 'desc' as const,
    }),
    []
  );

  const searchQuery = '';
  const searchHistory: string[] = [];
  const selectedJobs: string[] = [];
  const selectedPackages: string[] = [];
  const favoriteJobs: string[] = [];
  const favoritePackages: string[] = [];

  // Actions
  const search = useCallback(
    async (query: string, type: 'jobs' | 'packages' | 'all' = 'all') => {
      if (type === 'jobs' || type === 'all') {
        await fetchJobs();
      }
      if (type === 'packages' || type === 'all') {
        await fetchPackages();
      }
    },
    [fetchJobs, fetchPackages]
  );

  const advancedSearch = useCallback(async () => {
    await Promise.all([fetchJobs(), fetchPackages()]);
  }, [fetchJobs, fetchPackages]);

  const applyJobFilters = useCallback(async () => {
    await fetchJobs();
  }, [fetchJobs]);

  const applyPackageFilters = useCallback(async () => {
    await fetchPackages();
  }, [fetchPackages]);

  const loadMoreJobs_wrapper = useCallback(async () => {
    await loadMoreJobs();
  }, [loadMoreJobs]);

  const loadMorePackages_wrapper = useCallback(async () => {
    await loadMorePackages();
  }, [loadMorePackages]);

  const sortJobs = useCallback(async () => {
    await fetchJobs();
  }, [fetchJobs]);

  const sortPackages = useCallback(async () => {
    await fetchPackages();
  }, [fetchPackages]);

  const updateViewPreferences = useCallback(() => {
    // View preferences update - to be implemented in BaseStore
  }, []);

  // Action placeholders for features to be implemented
  const setSearchQuery = useCallback(() => {}, []);
  const addToSearchHistory = useCallback(() => {}, []);
  const clearSearchHistory = useCallback(() => {}, []);
  const setJobFilters = useCallback(() => {}, []);
  const setPackageFilters = useCallback(() => {}, []);
  const setViewPreferences = useCallback(() => {}, []);
  const toggleJobSelection = useCallback(() => {}, []);
  const togglePackageSelection = useCallback(() => {}, []);
  const toggleJobFavorite = useCallback(() => {}, []);
  const togglePackageFavorite = useCallback(() => {}, []);

  // Utility functions
  const isJobSelected = useCallback(() => false, []);
  const isPackageSelected = useCallback(() => false, []);
  const isFavoriteJob = useCallback(() => false, []);
  const isFavoritePackage = useCallback(() => false, []);

  const refreshData = useCallback(async () => {
    await Promise.all([refreshJobs(), refreshPackages()]);
  }, [refreshJobs, refreshPackages]);

  const reset = useCallback(() => {
    // Reset functionality not implemented in BaseStore
  }, []);

  const selectAllJobs = useCallback(() => {}, []);
  const selectAllPackages = useCallback(() => {}, []);
  const clearSelections = useCallback(() => {}, []);

  // Stats
  const stats = useMemo(
    () => ({
      totalJobs: jobsPagination.total,
      totalPackages: packagesPagination.total,
      hasMoreJobs: jobsPagination.page < jobsPagination.totalPages,
      hasMorePackages: packagesPagination.page < packagesPagination.totalPages,
    }),
    [jobsPagination, packagesPagination]
  );

  return {
    // Data
    jobs,
    packages,
    jobsPagination,
    packagesPagination,
    jobFilters,
    packageFilters,
    searchQuery,
    searchHistory,
    viewPreferences,

    // Selection and favorites
    selectedJobs,
    selectedPackages,
    favoriteJobs,
    favoritePackages,

    // Loading states
    isLoading,
    isLoadingMore,
    error,

    // Actions
    search,
    advancedSearch,
    applyJobFilters,
    applyPackageFilters,
    loadMoreJobs: loadMoreJobs_wrapper,
    loadMorePackages: loadMorePackages_wrapper,
    sortJobs,
    sortPackages,
    updateViewPreferences,
    refreshData,
    reset,

    // Utility
    setSearchQuery,
    addToSearchHistory,
    clearSearchHistory,
    setJobFilters,
    setPackageFilters,
    setViewPreferences,

    // Selection management
    isJobSelected,
    isPackageSelected,
    toggleJobSelection,
    togglePackageSelection,
    selectAllJobs,
    selectAllPackages,
    clearSelections,

    // Favorites management
    isFavoriteJob,
    isFavoritePackage,
    toggleJobFavorite,
    togglePackageFavorite,

    // Stats
    stats,
  };
}

// Hook for jobs only
export function useMarketplaceJobs() {
  const marketplace = useMarketplace();

  return {
    jobs: marketplace.jobs,
    pagination: marketplace.jobsPagination,
    filters: marketplace.jobFilters,
    isLoading: marketplace.isLoading,
    isLoadingMore: marketplace.isLoadingMore,
    error: marketplace.error,
    hasMore: marketplace.stats.hasMoreJobs,
    selectedJobs: marketplace.selectedJobs,
    favoriteJobs: marketplace.favoriteJobs,

    // Actions
    fetch: marketplace.applyJobFilters,
    loadMore: marketplace.loadMoreJobs,
    sort: marketplace.sortJobs,
    toggleSelection: marketplace.toggleJobSelection,
    toggleFavorite: marketplace.toggleJobFavorite,
    isSelected: marketplace.isJobSelected,
    isFavorite: marketplace.isFavoriteJob,
  };
}

// Hook for packages only
export function useMarketplacePackages() {
  const marketplace = useMarketplace();

  return {
    packages: marketplace.packages,
    pagination: marketplace.packagesPagination,
    filters: marketplace.packageFilters,
    isLoading: marketplace.isLoading,
    isLoadingMore: marketplace.isLoadingMore,
    error: marketplace.error,
    hasMore: marketplace.stats.hasMorePackages,
    selectedPackages: marketplace.selectedPackages,
    favoritePackages: marketplace.favoritePackages,

    // Actions
    fetch: marketplace.applyPackageFilters,
    loadMore: marketplace.loadMorePackages,
    sort: marketplace.sortPackages,
    toggleSelection: marketplace.togglePackageSelection,
    toggleFavorite: marketplace.togglePackageFavorite,
    isSelected: marketplace.isPackageSelected,
    isFavorite: marketplace.isFavoritePackage,
  };
}

// Hook for marketplace controls
export function useMarketplaceControls() {
  const marketplace = useMarketplace();

  return {
    // View controls
    viewPreferences: marketplace.viewPreferences,
    updateViewPreferences: marketplace.updateViewPreferences,

    // Search controls
    searchQuery: marketplace.searchQuery,
    searchHistory: marketplace.searchHistory,
    search: marketplace.search,
    advancedSearch: marketplace.advancedSearch,
    setSearchQuery: marketplace.setSearchQuery,
    addToSearchHistory: marketplace.addToSearchHistory,
    clearSearchHistory: marketplace.clearSearchHistory,

    // Filter controls
    jobFilters: marketplace.jobFilters,
    packageFilters: marketplace.packageFilters,
    applyJobFilters: marketplace.applyJobFilters,
    applyPackageFilters: marketplace.applyPackageFilters,

    // Sort controls
    sortJobs: marketplace.sortJobs,
    sortPackages: marketplace.sortPackages,

    // Selection controls
    selectedJobs: marketplace.selectedJobs,
    selectedPackages: marketplace.selectedPackages,
    selectAllJobs: marketplace.selectAllJobs,
    selectAllPackages: marketplace.selectAllPackages,
    clearSelections: marketplace.clearSelections,

    // Loading state
    isLoading: marketplace.isLoading,
    isLoadingMore: marketplace.isLoadingMore,
    error: marketplace.error,

    // Statistics
    stats: marketplace.stats,

    // Utility
    refreshData: marketplace.refreshData,
    reset: marketplace.reset,
  };
}
