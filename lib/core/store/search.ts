import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  SearchState,
  SearchFilters,
  AdvancedSearchRequest,
  SearchHistory,
  SavedSearch,
  SearchConfig,
} from '@/types/shared/search';
import { logger } from '@/lib/shared/utils/logger';

interface SearchStore extends SearchState {
  // Actions
  setQuery: (query: string) => void;
  updateFilters: (filters: Partial<SearchFilters>) => void;
  performSearch: (request?: Partial<AdvancedSearchRequest>) => Promise<void>;
  fetchSuggestions: (query: string) => Promise<void>;
  clearSearch: () => void;
  clearResults: () => void;
  clearError: () => void;

  // History & Saved Searches
  addToHistory: (
    query: string,
    filters: SearchFilters,
    resultCount: number
  ) => void;
  clearHistory: () => void;
  saveSearch: (
    name: string,
    query: string,
    filters: SearchFilters,
    alertsEnabled?: boolean
  ) => void;
  deleteSavedSearch: (id: string) => void;
  loadSavedSearch: (id: string) => void;

  // Pagination
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  // Config
  updateConfig: (config: Partial<SearchConfig>) => void;

  // Analytics
  trackSearch: (query: string, resultCount: number) => void;
  trackResultClick: (resultId: string) => void;
}

const defaultFilters: SearchFilters = {
  type: 'all',
  sortBy: 'relevance',
  sortOrder: 'desc',
};

const defaultConfig: SearchConfig = {
  enableAutocomplete: true,
  enableSuggestions: true,
  enableHistory: true,
  enableAnalytics: true,
  maxHistoryItems: 50,
  maxSuggestions: 10,
  debounceMs: 300,
  minQueryLength: 2,
};

export const useSearchStore = create<SearchStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        query: '',
        results: [],
        suggestions: [],
        facets: null,
        filters: defaultFilters,
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        },
        isLoading: false,
        isSearching: false,
        error: null,
        searchTime: 0,
        history: [],
        savedSearches: [],
        config: defaultConfig,

        // Actions
        setQuery: (query: string) => {
          set({ query });
        },

        updateFilters: (newFilters: Partial<SearchFilters>) => {
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
            pagination: { ...state.pagination, page: 1 }, // Reset to first page
          }));
        },

        performSearch: async (request?: Partial<AdvancedSearchRequest>) => {
          const state = get();
          const searchRequest: AdvancedSearchRequest = {
            query: state.query,
            filters: state.filters,
            page: state.pagination.page,
            limit: state.pagination.limit,
            includeAggregations: true,
            ...request,
          };

          if (!searchRequest.query.trim()) {
            set({ results: [], facets: null, error: null });
            return;
          }

          set({ isSearching: true, error: null });
          const startTime = Date.now();

          try {
            const response = await fetch('/api/v1/search/advanced', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(searchRequest),
            });

            if (!response.ok) throw new Error('Search failed');

            const data = await response.json();
            const searchTime = Date.now() - startTime;

            set({
              results: data.data.results,
              facets: data.data.facets,
              pagination: data.data.pagination,
              searchTime,
              isSearching: false,
            });

            // Add to history and track analytics
            if (state.config.enableHistory) {
              get().addToHistory(
                searchRequest.query,
                searchRequest.filters,
                data.data.pagination.total
              );
            }

            if (state.config.enableAnalytics) {
              get().trackSearch(
                searchRequest.query,
                data.data.pagination.total
              );
            }
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Search failed',
              isSearching: false,
            });
          }
        },

        fetchSuggestions: async (query: string) => {
          if (!query || query.length < get().config.minQueryLength) {
            set({ suggestions: [] });
            return;
          }

          set({ isLoading: true });

          try {
            const response = await fetch(
              `/api/v1/search/suggestions?q=${encodeURIComponent(query)}`
            );
            if (!response.ok) throw new Error('Failed to fetch suggestions');

            const data = await response.json();

            set({
              suggestions: data.data.suggestions.slice(
                0,
                get().config.maxSuggestions
              ),
              isLoading: false,
            });
          } catch (error) {
            set({
              suggestions: [],
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to fetch suggestions',
            });
          }
        },

        clearSearch: () => {
          set({
            query: '',
            results: [],
            suggestions: [],
            facets: null,
            filters: defaultFilters,
            pagination: { page: 1, limit: 20, total: 0, pages: 0 },
            error: null,
            searchTime: 0,
          });
        },

        clearResults: () => {
          set({
            results: [],
            facets: null,
            pagination: { page: 1, limit: 20, total: 0, pages: 0 },
          });
        },

        clearError: () => set({ error: null }),

        // History & Saved Searches
        addToHistory: (
          query: string,
          filters: SearchFilters,
          resultCount: number
        ) => {
          const state = get();
          const newHistoryItem: SearchHistory = {
            id: Date.now().toString(),
            query,
            filters,
            timestamp: new Date().toISOString(),
            resultCount,
          };

          const updatedHistory = [
            newHistoryItem,
            ...state.history.filter((item) => item.query !== query),
          ].slice(0, state.config.maxHistoryItems);

          set({ history: updatedHistory });
        },

        clearHistory: () => set({ history: [] }),

        saveSearch: (
          name: string,
          query: string,
          filters: SearchFilters,
          alertsEnabled = false
        ) => {
          const state = get();
          const newSavedSearch: SavedSearch = {
            id: Date.now().toString(),
            name,
            query,
            filters,
            alertsEnabled,
            createdAt: new Date().toISOString(),
          };

          set({
            savedSearches: [...state.savedSearches, newSavedSearch],
          });
        },

        deleteSavedSearch: (id: string) => {
          set((state) => ({
            savedSearches: state.savedSearches.filter(
              (search) => search.id !== id
            ),
          }));
        },

        loadSavedSearch: (id: string) => {
          const state = get();
          const savedSearch = state.savedSearches.find(
            (search) => search.id === id
          );

          if (savedSearch) {
            set({
              query: savedSearch.query,
              filters: savedSearch.filters,
              pagination: { ...state.pagination, page: 1 },
            });
          }
        },

        // Pagination
        setPage: (page: number) => {
          set((state) => ({
            pagination: { ...state.pagination, page },
          }));
        },

        setLimit: (limit: number) => {
          set((state) => ({
            pagination: { ...state.pagination, limit, page: 1 },
          }));
        },

        // Config
        updateConfig: (newConfig: Partial<SearchConfig>) => {
          set((state) => ({
            config: { ...state.config, ...newConfig },
          }));
        },

        // Analytics
        trackSearch: (query: string, resultCount: number) => {
          // In a real app, this would send to analytics service
          logger.debug('Search tracked', {
            query,
            resultCount,
            timestamp: new Date().toISOString(),
          });
        },

        trackResultClick: (resultId: string) => {
          // In a real app, this would send to analytics service
          logger.debug('Result click tracked', {
            resultId,
            timestamp: new Date().toISOString(),
          });
        },
      }),
      {
        name: 'search-store',
        partialize: (state) => ({
          history: state.history,
          savedSearches: state.savedSearches,
          config: state.config,
          filters: state.filters,
        }),
      }
    ),
    {
      name: 'search-store',
    }
  )
);
