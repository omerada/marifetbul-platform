import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

/**
 * Search Domain Store
 * Handles message search functionality with caching and history
 * Focused on search operations for better performance
 */
interface SearchFilters {
  dateRange?: {
    from: string;
    to: string;
  };
  participants?: string[];
  messageType?: 'text' | 'media' | 'file' | 'all';
  hasAttachments?: boolean;
}

interface SearchResult {
  messageId: string;
  conversationId: string;
  content: string;
  timestamp: string;
  authorId: string;
  authorName: string;
  conversationTitle: string;
  highlights: string[];
  context: {
    before: string[];
    after: string[];
  };
}

interface SearchHistory {
  id: string;
  query: string;
  filters: SearchFilters;
  timestamp: string;
  resultCount: number;
}

interface SearchState {
  // Current search
  currentQuery: string;
  currentFilters: SearchFilters;
  isSearching: boolean;

  // Results
  results: SearchResult[];
  totalResults: number;
  hasMore: boolean;

  // Pagination
  currentPage: number;
  resultsPerPage: number;

  // Search history
  searchHistory: SearchHistory[];

  // Recent searches cache
  recentSearches: string[];

  // Error handling
  searchError: string | null;
}

interface SearchActions {
  // Search operations
  search: (query: string, filters?: SearchFilters) => Promise<void>;
  searchMore: () => Promise<void>;
  clearSearch: () => void;

  // Filters
  setFilters: (filters: SearchFilters) => void;
  clearFilters: () => void;

  // History management
  addToHistory: (
    query: string,
    filters: SearchFilters,
    resultCount: number
  ) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;

  // Recent searches
  addToRecentSearches: (query: string) => void;
  clearRecentSearches: () => void;

  // Utilities
  highlightText: (text: string, query: string) => string[];
  reset: () => void;
}

type SearchStore = SearchState & SearchActions;

export const useSearchStore = create<SearchStore>()(
  immer((set, get) => ({
    // Initial state
    currentQuery: '',
    currentFilters: {},
    isSearching: false,
    results: [],
    totalResults: 0,
    hasMore: false,
    currentPage: 1,
    resultsPerPage: 20,
    searchHistory: [],
    recentSearches: [],
    searchError: null,

    // Search operations
    search: async (query, filters = {}) => {
      if (!query.trim()) {
        get().clearSearch();
        return;
      }

      set((state) => {
        state.isSearching = true;
        state.currentQuery = query.trim();
        state.currentFilters = filters;
        state.currentPage = 1;
        state.searchError = null;
        state.results = [];
      });

      try {
        const response = await fetch(
          `/api/v1/search/messages?query=${encodeURIComponent(query)}&page=1`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Arama başarısız oldu');
        }

        const result = await response.json();
        const searchResults: SearchResult[] = result.data?.results || [];

        set((state) => {
          state.results = searchResults;
          state.totalResults = result.data?.totalResults || 0;
          state.hasMore = result.data?.hasMore || false;
          state.isSearching = false;
        });

        get().addToHistory(query, filters, searchResults.length);
        get().addToRecentSearches(query);
      } catch {
        set((state) => {
          state.searchError = 'Arama sırasında bir hata oluştu';
          state.isSearching = false;
        });
      }
    },

    searchMore: async () => {
      const { hasMore, isSearching, currentQuery } = get();

      if (!hasMore || isSearching || !currentQuery) return;

      set((state) => {
        state.isSearching = true;
        state.currentPage += 1;
      });

      try {
        const { currentPage } = get();
        const response = await fetch(
          `/api/v1/search/messages?query=${encodeURIComponent(currentQuery)}&page=${currentPage}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Sayfalama başarısız oldu');
        }

        const result = await response.json();
        const moreResults: SearchResult[] = result.data?.results || [];

        set((state) => {
          state.results.push(...moreResults);
          state.hasMore = result.data?.hasMore || false;
          state.isSearching = false;
        });
      } catch {
        set((state) => {
          state.searchError = 'Daha fazla sonuç yüklenirken hata oluştu';
          state.isSearching = false;
          state.currentPage -= 1;
        });
      }
    },

    clearSearch: () => {
      set((state) => {
        state.currentQuery = '';
        state.currentFilters = {};
        state.results = [];
        state.totalResults = 0;
        state.hasMore = false;
        state.currentPage = 1;
        state.searchError = null;
        state.isSearching = false;
      });
    },

    // Filter management
    setFilters: (filters) => {
      set((state) => {
        state.currentFilters = { ...state.currentFilters, ...filters };
      });
    },

    clearFilters: () => {
      set((state) => {
        state.currentFilters = {};
      });
    },

    // History management
    addToHistory: (query, filters, resultCount) => {
      set((state) => {
        const historyItem: SearchHistory = {
          id: Date.now().toString(),
          query,
          filters,
          timestamp: new Date().toISOString(),
          resultCount,
        };

        // Add to beginning and limit to 50 items
        state.searchHistory = [
          historyItem,
          ...state.searchHistory.slice(0, 49),
        ];
      });
    },

    clearHistory: () => {
      set((state) => {
        state.searchHistory = [];
      });
    },

    removeFromHistory: (id) => {
      set((state) => {
        state.searchHistory = state.searchHistory.filter(
          (item) => item.id !== id
        );
      });
    },

    // Recent searches management
    addToRecentSearches: (query) => {
      set((state) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;

        // Remove if already exists
        state.recentSearches = state.recentSearches.filter(
          (item) => item !== trimmedQuery
        );

        // Add to beginning and limit to 10 items
        state.recentSearches = [
          trimmedQuery,
          ...state.recentSearches.slice(0, 9),
        ];
      });
    },

    clearRecentSearches: () => {
      set((state) => {
        state.recentSearches = [];
      });
    },

    // Utility functions
    highlightText: (text, query) => {
      if (!query) return [text];

      const regex = new RegExp(`(${query})`, 'gi');
      return text.split(regex);
    },

    reset: () => {
      set((state) => {
        state.currentQuery = '';
        state.currentFilters = {};
        state.isSearching = false;
        state.results = [];
        state.totalResults = 0;
        state.hasMore = false;
        state.currentPage = 1;
        state.searchHistory = [];
        state.recentSearches = [];
        state.searchError = null;
      });
    },
  }))
);

// Selectors for better performance
export const useSearchResults = () =>
  useSearchStore((state) => ({
    results: state.results,
    totalResults: state.totalResults,
    hasMore: state.hasMore,
    isSearching: state.isSearching,
    error: state.searchError,
  }));

export const useSearchQuery = () =>
  useSearchStore((state) => ({
    query: state.currentQuery,
    filters: state.currentFilters,
  }));

export const useSearchHistory = () =>
  useSearchStore((state) => state.searchHistory);
export const useRecentSearches = () =>
  useSearchStore((state) => state.recentSearches);

// Action selectors
export const useSearchActions = () => {
  const store = useSearchStore();
  return {
    search: store.search,
    searchMore: store.searchMore,
    clearSearch: store.clearSearch,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,
    addToHistory: store.addToHistory,
    clearHistory: store.clearHistory,
    removeFromHistory: store.removeFromHistory,
    addToRecentSearches: store.addToRecentSearches,
    clearRecentSearches: store.clearRecentSearches,
    highlightText: store.highlightText,
    reset: store.reset,
  };
};
