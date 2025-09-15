import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  AdvancedSearchRequest,
  AdvancedSearchResponse,
  SearchSuggestionsResponse,
  SavedSearch,
  SearchFacets,
  Freelancer,
  Job,
  ServicePackage,
  User,
  SaveSearchRequest,
} from '@/types';

interface AdvancedSearchStore {
  // State properties
  searchQuery: string;
  searchResults: (Freelancer | Job | ServicePackage | User)[];
  suggestions: string[];
  recentSearches: string[];
  savedSearches: SavedSearch[];
  isLoading: boolean;
  isLoadingSuggestions: boolean;
  error: string | null;
  facets: SearchFacets | null;
  searchId: string | null;
  totalResults: number;
  hasNextPage: boolean;
  currentPage: number;

  // Actions
  setSearchQuery: (query: string) => void;
  getSuggestions: (
    query: string,
    type?: 'freelancers' | 'jobs' | 'services' | 'skills' | 'locations'
  ) => Promise<void>;
  performAdvancedSearch: (filters: AdvancedSearchRequest) => Promise<void>;
  loadMoreResults: (filters: AdvancedSearchRequest) => Promise<void>;
  saveSearch: (request: SaveSearchRequest) => Promise<void>;
  deleteSavedSearch: (id: string) => Promise<void>;
  fetchSavedSearches: () => Promise<void>;
  addToRecentSearches: (query: string) => void;
  clearSearchResults: () => void;
  clearSuggestions: () => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  searchQuery: '',
  searchResults: [],
  suggestions: [],
  recentSearches: [],
  savedSearches: [],
  isLoading: false,
  isLoadingSuggestions: false,
  error: null,
  facets: null,
  searchId: null,
  totalResults: 0,
  hasNextPage: false,
  currentPage: 1,
};

export const useAdvancedSearchStore = create<AdvancedSearchStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setSearchQuery: (query: string) => {
        set({ searchQuery: query }, false, 'setSearchQuery');
      },

      getSuggestions: async (query: string, type = 'freelancers') => {
        if (query.length < 2) {
          set({ suggestions: [] }, false, 'clearSuggestions');
          return;
        }

        set(
          { isLoadingSuggestions: true, error: null },
          false,
          'getSuggestions/start'
        );

        try {
          const response = await fetch(
            `/api/v1/search/suggestions?query=${encodeURIComponent(query)}&type=${type}&limit=8`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: SearchSuggestionsResponse = await response.json();

          if (data.success && data.data) {
            set(
              {
                suggestions: data.data.suggestions,
                isLoadingSuggestions: false,
              },
              false,
              'getSuggestions/success'
            );
          } else {
            throw new Error(data.error || 'Öneriler alınamadı');
          }
        } catch (error) {
          set(
            {
              error:
                error instanceof Error ? error.message : 'Öneriler yüklenemedi',
              isLoadingSuggestions: false,
            },
            false,
            'getSuggestions/error'
          );
        }
      },

      performAdvancedSearch: async (filters: AdvancedSearchRequest) => {
        set(
          {
            isLoading: true,
            error: null,
            currentPage: 1,
            searchResults: [],
            hasNextPage: false,
            totalResults: 0,
          },
          false,
          'performAdvancedSearch/start'
        );

        try {
          const response = await fetch('/api/v1/search/advanced', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...filters, page: 1 }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: AdvancedSearchResponse = await response.json();

          if (data.success && data.data) {
            const { results, pagination, facets, searchId } = data.data;

            set(
              {
                searchResults: results,
                facets,
                searchId,
                totalResults: pagination.total,
                hasNextPage: pagination.hasNext,
                currentPage: pagination.page,
                isLoading: false,
              },
              false,
              'performAdvancedSearch/success'
            );

            // Add to recent searches
            if (filters.query) {
              get().addToRecentSearches(filters.query);
            }
          } else {
            throw new Error(data.error || 'Arama yapılamadı');
          }
        } catch (error) {
          set(
            {
              error:
                error instanceof Error ? error.message : 'Arama yapılamadı',
              isLoading: false,
            },
            false,
            'performAdvancedSearch/error'
          );
        }
      },

      loadMoreResults: async (filters: AdvancedSearchRequest) => {
        const { isLoading, hasNextPage, currentPage } = get();

        if (isLoading || !hasNextPage) return;

        set({ isLoading: true, error: null }, false, 'loadMoreResults/start');

        try {
          const response = await fetch('/api/v1/search/advanced', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...filters, page: currentPage + 1 }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: AdvancedSearchResponse = await response.json();

          if (data.success && data.data) {
            const { results, pagination } = data.data;

            set(
              (state) => ({
                searchResults: [...state.searchResults, ...results],
                hasNextPage: pagination.hasNext,
                currentPage: pagination.page,
                isLoading: false,
              }),
              false,
              'loadMoreResults/success'
            );
          } else {
            throw new Error(data.error || 'Daha fazla sonuç yüklenemedi');
          }
        } catch (error) {
          set(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Daha fazla sonuç yüklenemedi',
              isLoading: false,
            },
            false,
            'loadMoreResults/error'
          );
        }
      },

      saveSearch: async (request: SaveSearchRequest) => {
        try {
          const response = await fetch('/api/v1/search/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.success) {
            // Refresh saved searches
            await get().fetchSavedSearches();
          } else {
            throw new Error(data.error || 'Arama kaydedilemedi');
          }
        } catch (error) {
          set(
            {
              error:
                error instanceof Error ? error.message : 'Arama kaydedilemedi',
            },
            false,
            'saveSearch/error'
          );
        }
      },

      deleteSavedSearch: async (id: string) => {
        try {
          const response = await fetch(`/api/v1/search/saved/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.success) {
            set(
              (state) => ({
                savedSearches: state.savedSearches.filter(
                  (search) => search.id !== id
                ),
              }),
              false,
              'deleteSavedSearch/success'
            );
          } else {
            throw new Error(data.error || 'Kayıtlı arama silinemedi');
          }
        } catch (error) {
          set(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Kayıtlı arama silinemedi',
            },
            false,
            'deleteSavedSearch/error'
          );
        }
      },

      fetchSavedSearches: async () => {
        try {
          const response = await fetch('/api/v1/search/saved');

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.success && data.data) {
            set(
              {
                savedSearches: data.data,
              },
              false,
              'fetchSavedSearches/success'
            );
          } else {
            throw new Error(data.error || 'Kayıtlı aramalar yüklenemedi');
          }
        } catch (error) {
          set(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Kayıtlı aramalar yüklenemedi',
            },
            false,
            'fetchSavedSearches/error'
          );
        }
      },

      addToRecentSearches: (query: string) => {
        if (!query.trim()) return;

        set(
          (state) => {
            const updatedRecent = [
              query,
              ...state.recentSearches.filter((q) => q !== query),
            ].slice(0, 10); // Keep last 10

            // Store in localStorage
            try {
              if (typeof window !== 'undefined') {
                localStorage.setItem(
                  'marifet_recent_searches',
                  JSON.stringify(updatedRecent)
                );
              }
            } catch (error) {
              console.warn(
                'Failed to save recent searches to localStorage:',
                error
              );
            }

            return { recentSearches: updatedRecent };
          },
          false,
          'addToRecentSearches'
        );
      },

      clearSearchResults: () => {
        set(
          {
            searchResults: [],
            facets: null,
            searchId: null,
            totalResults: 0,
            hasNextPage: false,
            currentPage: 1,
          },
          false,
          'clearSearchResults'
        );
      },

      clearSuggestions: () => {
        set({ suggestions: [] }, false, 'clearSuggestions');
      },

      clearError: () => {
        set({ error: null }, false, 'clearError');
      },

      reset: () => {
        set(initialState, false, 'reset');
      },
    }),
    {
      name: 'advanced-search-store',
    }
  )
);

// Initialize recent searches from localStorage
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('marifet_recent_searches');
    if (saved) {
      const recentSearches = JSON.parse(saved);
      if (Array.isArray(recentSearches)) {
        useAdvancedSearchStore.setState({ recentSearches });
      }
    }
  } catch (error) {
    console.warn('Failed to load recent searches from localStorage:', error);
  }
}
