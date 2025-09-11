import { useCallback, useMemo } from 'react';
import { useMarketplaceStore } from '@/lib/store/marketplace';
import type { JobFilters, PackageFilters } from '@/types';
import type { ViewPreferences } from '@/lib/validations/marketplace';

export function useMarketplace() {
  const {
    jobs,
    packages,
    jobsPagination,
    packagesPagination,
    jobFilters,
    packageFilters,
    viewPreferences,
    isLoading,
    isLoadingMore,
    error,
    searchQuery,
    searchHistory,
    selectedJobs,
    selectedPackages,
    favoriteJobs,
    favoritePackages,
    fetchJobs,
    fetchPackages,
    setJobFilters,
    setPackageFilters,
    setViewPreferences,
    setSearchQuery,
    addToSearchHistory,
    clearSearchHistory,
    toggleJobSelection,
    togglePackageSelection,
    clearSelections,
    toggleJobFavorite,
    togglePackageFavorite,
    refreshData,
    reset,
  } = useMarketplaceStore();

  // Computed values
  const stats = useMemo(
    () => ({
      totalJobs: jobsPagination.total,
      totalPackages: packagesPagination.total,
      selectedJobsCount: selectedJobs.length,
      selectedPackagesCount: selectedPackages.length,
      favoriteJobsCount: favoriteJobs.length,
      favoritePackagesCount: favoritePackages.length,
      hasMoreJobs: jobsPagination.page < jobsPagination.totalPages,
      hasMorePackages: packagesPagination.page < packagesPagination.totalPages,
    }),
    [
      jobsPagination,
      packagesPagination,
      selectedJobs.length,
      selectedPackages.length,
      favoriteJobs.length,
      favoritePackages.length,
    ]
  );

  // Search functionality
  const search = useCallback(
    async (query: string, type: 'jobs' | 'packages' | 'all' = 'all') => {
      const trimmedQuery = query.trim();

      if (!trimmedQuery) return;

      setSearchQuery(trimmedQuery);
      addToSearchHistory(trimmedQuery);

      const searchFilters = { search: trimmedQuery, page: 1 };

      if (type === 'jobs' || type === 'all') {
        await fetchJobs(searchFilters);
      }

      if (type === 'packages' || type === 'all') {
        await fetchPackages(searchFilters);
      }
    },
    [setSearchQuery, addToSearchHistory, fetchJobs, fetchPackages]
  );

  // Advanced search with filters
  const advancedSearch = useCallback(
    async (filters: {
      query?: string;
      jobFilters?: Partial<JobFilters>;
      packageFilters?: Partial<PackageFilters>;
      type?: 'jobs' | 'packages' | 'all';
    }) => {
      const {
        query,
        jobFilters: jFilters,
        packageFilters: pFilters,
        type = 'all',
      } = filters;

      if (query) {
        setSearchQuery(query);
        addToSearchHistory(query);
      }

      if (type === 'jobs' || type === 'all') {
        const mergedJobFilters = {
          ...jFilters,
          ...(query && { search: query }),
          page: 1,
        };
        setJobFilters(mergedJobFilters);
        await fetchJobs(mergedJobFilters);
      }

      if (type === 'packages' || type === 'all') {
        const mergedPackageFilters = {
          ...pFilters,
          ...(query && { search: query }),
          page: 1,
        };
        setPackageFilters(mergedPackageFilters);
        await fetchPackages(mergedPackageFilters);
      }
    },
    [
      setSearchQuery,
      addToSearchHistory,
      setJobFilters,
      setPackageFilters,
      fetchJobs,
      fetchPackages,
    ]
  );

  // Load more functionality
  const loadMoreJobs = useCallback(async () => {
    if (!stats.hasMoreJobs || isLoadingMore) return;

    const nextPage = jobsPagination.page + 1;
    await fetchJobs({ ...jobFilters, page: nextPage }, { append: true });
  }, [
    stats.hasMoreJobs,
    isLoadingMore,
    jobsPagination.page,
    jobFilters,
    fetchJobs,
  ]);

  const loadMorePackages = useCallback(async () => {
    if (!stats.hasMorePackages || isLoadingMore) return;

    const nextPage = packagesPagination.page + 1;
    await fetchPackages(
      { ...packageFilters, page: nextPage },
      { append: true }
    );
  }, [
    stats.hasMorePackages,
    isLoadingMore,
    packagesPagination.page,
    packageFilters,
    fetchPackages,
  ]);

  // Filter helpers
  const applyJobFilters = useCallback(
    async (filters: Partial<JobFilters>) => {
      const mergedFilters = { ...filters, page: 1 };
      setJobFilters(mergedFilters);
      await fetchJobs(mergedFilters);
    },
    [setJobFilters, fetchJobs]
  );

  const applyPackageFilters = useCallback(
    async (filters: Partial<PackageFilters>) => {
      const mergedFilters = { ...filters, page: 1 };
      setPackageFilters(mergedFilters);
      await fetchPackages(mergedFilters);
    },
    [setPackageFilters, fetchPackages]
  );

  // Sort functionality
  const sortJobs = useCallback(
    async (
      sortBy: 'newest' | 'oldest' | 'budget' | 'relevance',
      sortOrder: 'asc' | 'desc' = 'desc'
    ) => {
      const newFilters = { ...jobFilters, sortBy, sortOrder, page: 1 };
      setJobFilters(newFilters);
      await fetchJobs(newFilters);
    },
    [jobFilters, setJobFilters, fetchJobs]
  );

  const sortPackages = useCallback(
    async (
      sortBy: 'newest' | 'oldest' | 'price' | 'rating' | 'relevance',
      sortOrder: 'asc' | 'desc' = 'desc'
    ) => {
      const newFilters = { ...packageFilters, sortBy, sortOrder, page: 1 };
      setPackageFilters(newFilters);
      await fetchPackages(newFilters);
    },
    [packageFilters, setPackageFilters, fetchPackages]
  );

  // View preferences
  const updateViewPreferences = useCallback(
    (preferences: Partial<ViewPreferences>) => {
      setViewPreferences(preferences);
    },
    [setViewPreferences]
  );

  // Favorites management
  const isFavoriteJob = useCallback(
    (jobId: string) => {
      return favoriteJobs.includes(jobId);
    },
    [favoriteJobs]
  );

  const isFavoritePackage = useCallback(
    (packageId: string) => {
      return favoritePackages.includes(packageId);
    },
    [favoritePackages]
  );

  // Selection management
  const isJobSelected = useCallback(
    (jobId: string) => {
      return selectedJobs.includes(jobId);
    },
    [selectedJobs]
  );

  const isPackageSelected = useCallback(
    (packageId: string) => {
      return selectedPackages.includes(packageId);
    },
    [selectedPackages]
  );

  const selectAllJobs = useCallback(() => {
    jobs.forEach((job) => {
      if (!selectedJobs.includes(job.id)) {
        toggleJobSelection(job.id);
      }
    });
  }, [jobs, selectedJobs, toggleJobSelection]);

  const selectAllPackages = useCallback(() => {
    packages.forEach((pkg) => {
      if (!selectedPackages.includes(pkg.id)) {
        togglePackageSelection(pkg.id);
      }
    });
  }, [packages, selectedPackages, togglePackageSelection]);

  return {
    // Data
    jobs,
    packages,

    // Pagination
    jobsPagination,
    packagesPagination,

    // Filters
    jobFilters,
    packageFilters,

    // UI State
    viewPreferences,
    isLoading,
    isLoadingMore,
    error,

    // Search
    searchQuery,
    searchHistory,

    // Stats
    stats,

    // Selection
    selectedJobs,
    selectedPackages,
    isJobSelected,
    isPackageSelected,

    // Favorites
    favoriteJobs,
    favoritePackages,
    isFavoriteJob,
    isFavoritePackage,

    // Actions
    search,
    advancedSearch,
    loadMoreJobs,
    loadMorePackages,
    applyJobFilters,
    applyPackageFilters,
    sortJobs,
    sortPackages,
    updateViewPreferences,

    // Selection actions
    toggleJobSelection,
    togglePackageSelection,
    selectAllJobs,
    selectAllPackages,
    clearSelections,

    // Favorite actions
    toggleJobFavorite,
    togglePackageFavorite,

    // Search actions
    setSearchQuery,
    addToSearchHistory,
    clearSearchHistory,

    // Utility actions
    refreshData,
    reset,
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
