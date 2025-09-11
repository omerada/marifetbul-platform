import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  Job,
  ServicePackage,
  PaginatedResponse,
  JobFilters,
  PackageFilters,
} from '@/types';
import {
  type ViewPreferences,
  defaultJobFilters,
  defaultPackageFilters,
  defaultViewPreferences,
} from '@/lib/validations/marketplace';

interface MarketplaceState {
  // Data
  jobs: Job[];
  packages: ServicePackage[];

  // Pagination
  jobsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  packagesPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Filters
  jobFilters: JobFilters;
  packageFilters: PackageFilters;

  // UI State
  viewPreferences: ViewPreferences;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;

  // Search
  searchQuery: string;
  searchHistory: string[];

  // Selected items
  selectedJobs: string[];
  selectedPackages: string[];

  // Cache
  lastFetchTime: {
    jobs: number | null;
    packages: number | null;
  };

  // Favorites
  favoriteJobs: string[];
  favoritePackages: string[];
}

interface MarketplaceActions {
  // Jobs actions
  fetchJobs: (
    filters?: Partial<JobFilters>,
    options?: { append?: boolean }
  ) => Promise<void>;
  setJobFilters: (filters: Partial<JobFilters>) => void;
  clearJobFilters: () => void;

  // Packages actions
  fetchPackages: (
    filters?: Partial<PackageFilters>,
    options?: { append?: boolean }
  ) => Promise<void>;
  setPackageFilters: (filters: Partial<PackageFilters>) => void;
  clearPackageFilters: () => void;

  // UI actions
  setViewPreferences: (preferences: Partial<ViewPreferences>) => void;
  setLoading: (loading: boolean) => void;
  setLoadingMore: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Search actions
  setSearchQuery: (query: string) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;

  // Selection actions
  toggleJobSelection: (jobId: string) => void;
  togglePackageSelection: (packageId: string) => void;
  clearSelections: () => void;

  // Favorites actions
  toggleJobFavorite: (jobId: string) => void;
  togglePackageFavorite: (packageId: string) => void;

  // Utility actions
  refreshData: () => Promise<void>;
  clearCache: () => void;
  reset: () => void;
}

type MarketplaceStore = MarketplaceState & MarketplaceActions;

// Create the store
export const useMarketplaceStore = create<MarketplaceStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        jobs: [],
        packages: [],

        jobsPagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
        },
        packagesPagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
        },

        jobFilters: defaultJobFilters,
        packageFilters: defaultPackageFilters,

        viewPreferences: defaultViewPreferences,
        isLoading: false,
        isLoadingMore: false,
        error: null,

        searchQuery: '',
        searchHistory: [],

        selectedJobs: [],
        selectedPackages: [],

        lastFetchTime: {
          jobs: null,
          packages: null,
        },

        favoriteJobs: [],
        favoritePackages: [],

        // Actions
        fetchJobs: async (filters = {}, options = {}) => {
          const { append = false } = options;
          const state = get();

          if (!append) {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });
          } else {
            set((state) => {
              state.isLoadingMore = true;
            });
          }

          try {
            const mergedFilters = { ...state.jobFilters, ...filters };

            // Build query parameters
            const params = new URLSearchParams();
            Object.entries(mergedFilters).forEach(([key, value]) => {
              if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                  if (value.length > 0) {
                    params.append(key, value.join(','));
                  }
                } else {
                  params.append(key, String(value));
                }
              }
            });

            const response = await fetch(`/api/jobs?${params.toString()}`);

            if (!response.ok) {
              throw new Error('İş ilanları yüklenirken hata oluştu');
            }

            const data: { data: PaginatedResponse<Job> } =
              await response.json();

            set((state) => {
              if (append) {
                state.jobs.push(...data.data.data);
              } else {
                state.jobs = data.data.data;
              }

              state.jobsPagination = data.data.pagination;
              state.lastFetchTime.jobs = Date.now();
              state.isLoading = false;
              state.isLoadingMore = false;
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.error =
                error instanceof Error ? error.message : 'Bilinmeyen hata';
              state.isLoading = false;
              state.isLoadingMore = false;
            });
          }
        },

        setJobFilters: (filters) => {
          set((state) => {
            state.jobFilters = { ...state.jobFilters, ...filters };
          });
        },

        clearJobFilters: () => {
          set((state) => {
            state.jobFilters = defaultJobFilters;
          });
        },

        fetchPackages: async (filters = {}, options = {}) => {
          const { append = false } = options;
          const state = get();

          if (!append) {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });
          } else {
            set((state) => {
              state.isLoadingMore = true;
            });
          }

          try {
            const mergedFilters = { ...state.packageFilters, ...filters };

            // Build query parameters
            const params = new URLSearchParams();
            Object.entries(mergedFilters).forEach(([key, value]) => {
              if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                  if (value.length > 0) {
                    params.append(key, value.join(','));
                  }
                } else {
                  params.append(key, String(value));
                }
              }
            });

            const response = await fetch(`/api/packages?${params.toString()}`);

            if (!response.ok) {
              throw new Error('Hizmet paketleri yüklenirken hata oluştu');
            }

            const data: { data: PaginatedResponse<ServicePackage> } =
              await response.json();

            set((state) => {
              if (append) {
                state.packages.push(...data.data.data);
              } else {
                state.packages = data.data.data;
              }

              state.packagesPagination = data.data.pagination;
              state.lastFetchTime.packages = Date.now();
              state.isLoading = false;
              state.isLoadingMore = false;
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.error =
                error instanceof Error ? error.message : 'Bilinmeyen hata';
              state.isLoading = false;
              state.isLoadingMore = false;
            });
          }
        },

        setPackageFilters: (filters) => {
          set((state) => {
            state.packageFilters = { ...state.packageFilters, ...filters };
          });
        },

        clearPackageFilters: () => {
          set((state) => {
            state.packageFilters = defaultPackageFilters;
          });
        },

        setViewPreferences: (preferences) => {
          set((state) => {
            state.viewPreferences = {
              ...state.viewPreferences,
              ...preferences,
            };
          });
        },

        setLoading: (loading) => {
          set((state) => {
            state.isLoading = loading;
          });
        },

        setLoadingMore: (loading) => {
          set((state) => {
            state.isLoadingMore = loading;
          });
        },

        setError: (error) => {
          set((state) => {
            state.error = error;
          });
        },

        setSearchQuery: (query) => {
          set((state) => {
            state.searchQuery = query;
          });
        },

        addToSearchHistory: (query) => {
          set((state) => {
            const trimmedQuery = query.trim();
            if (trimmedQuery && !state.searchHistory.includes(trimmedQuery)) {
              state.searchHistory = [
                trimmedQuery,
                ...state.searchHistory.slice(0, 9),
              ];
            }
          });
        },

        clearSearchHistory: () => {
          set((state) => {
            state.searchHistory = [];
          });
        },

        toggleJobSelection: (jobId) => {
          set((state) => {
            const index = state.selectedJobs.indexOf(jobId);
            if (index > -1) {
              state.selectedJobs.splice(index, 1);
            } else {
              state.selectedJobs.push(jobId);
            }
          });
        },

        togglePackageSelection: (packageId) => {
          set((state) => {
            const index = state.selectedPackages.indexOf(packageId);
            if (index > -1) {
              state.selectedPackages.splice(index, 1);
            } else {
              state.selectedPackages.push(packageId);
            }
          });
        },

        clearSelections: () => {
          set((state) => {
            state.selectedJobs = [];
            state.selectedPackages = [];
          });
        },

        toggleJobFavorite: (jobId) => {
          set((state) => {
            const index = state.favoriteJobs.indexOf(jobId);
            if (index > -1) {
              state.favoriteJobs.splice(index, 1);
            } else {
              state.favoriteJobs.push(jobId);
            }
          });
        },

        togglePackageFavorite: (packageId) => {
          set((state) => {
            const index = state.favoritePackages.indexOf(packageId);
            if (index > -1) {
              state.favoritePackages.splice(index, 1);
            } else {
              state.favoritePackages.push(packageId);
            }
          });
        },

        refreshData: async () => {
          const state = get();
          const promises = [];

          if (state.jobs.length > 0 || state.lastFetchTime.jobs) {
            promises.push(state.fetchJobs());
          }

          if (state.packages.length > 0 || state.lastFetchTime.packages) {
            promises.push(state.fetchPackages());
          }

          await Promise.all(promises);
        },

        clearCache: () => {
          set((state) => {
            state.lastFetchTime.jobs = null;
            state.lastFetchTime.packages = null;
          });
        },

        reset: () => {
          set((state) => {
            state.jobs = [];
            state.packages = [];
            state.jobsPagination = {
              page: 1,
              limit: 12,
              total: 0,
              totalPages: 0,
            };
            state.packagesPagination = {
              page: 1,
              limit: 12,
              total: 0,
              totalPages: 0,
            };
            state.jobFilters = defaultJobFilters;
            state.packageFilters = defaultPackageFilters;
            state.viewPreferences = defaultViewPreferences;
            state.isLoading = false;
            state.isLoadingMore = false;
            state.error = null;
            state.searchQuery = '';
            state.selectedJobs = [];
            state.selectedPackages = [];
            state.lastFetchTime = { jobs: null, packages: null };
          });
        },
      })),
      {
        name: 'marketplace-store',
      }
    )
  )
);

// Selectors
export const useMarketplaceJobs = () =>
  useMarketplaceStore((state) => state.jobs);
export const useMarketplacePackages = () =>
  useMarketplaceStore((state) => state.packages);
export const useMarketplaceLoading = () =>
  useMarketplaceStore((state) => state.isLoading);
export const useMarketplaceError = () =>
  useMarketplaceStore((state) => state.error);
export const useMarketplaceFilters = () =>
  useMarketplaceStore((state) => ({
    jobFilters: state.jobFilters,
    packageFilters: state.packageFilters,
  }));
export const useMarketplaceViewPreferences = () =>
  useMarketplaceStore((state) => state.viewPreferences);

// Computed selectors
export const useMarketplaceStats = () =>
  useMarketplaceStore((state) => ({
    totalJobs: state.jobsPagination.total,
    totalPackages: state.packagesPagination.total,
    selectedJobsCount: state.selectedJobs.length,
    selectedPackagesCount: state.selectedPackages.length,
    favoriteJobsCount: state.favoriteJobs.length,
    favoritePackagesCount: state.favoritePackages.length,
  }));

export const useMarketplaceActions = () =>
  useMarketplaceStore((state) => ({
    fetchJobs: state.fetchJobs,
    fetchPackages: state.fetchPackages,
    setJobFilters: state.setJobFilters,
    setPackageFilters: state.setPackageFilters,
    setViewPreferences: state.setViewPreferences,
    setSearchQuery: state.setSearchQuery,
    toggleJobFavorite: state.toggleJobFavorite,
    togglePackageFavorite: state.togglePackageFavorite,
    refreshData: state.refreshData,
    reset: state.reset,
  }));

// Persist favorites to localStorage
if (typeof window !== 'undefined') {
  useMarketplaceStore.subscribe(
    (state) => state.favoriteJobs,
    (favoriteJobs) => {
      localStorage.setItem(
        'marketplace-favorite-jobs',
        JSON.stringify(favoriteJobs)
      );
    }
  );

  useMarketplaceStore.subscribe(
    (state) => state.favoritePackages,
    (favoritePackages) => {
      localStorage.setItem(
        'marketplace-favorite-packages',
        JSON.stringify(favoritePackages)
      );
    }
  );

  // Load favorites from localStorage on initialization
  const savedFavoriteJobs = localStorage.getItem('marketplace-favorite-jobs');
  const savedFavoritePackages = localStorage.getItem(
    'marketplace-favorite-packages'
  );

  if (savedFavoriteJobs) {
    useMarketplaceStore.setState({
      favoriteJobs: JSON.parse(savedFavoriteJobs),
    });
  }

  if (savedFavoritePackages) {
    useMarketplaceStore.setState({
      favoritePackages: JSON.parse(savedFavoritePackages),
    });
  }
}
