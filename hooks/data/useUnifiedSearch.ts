// Unified Search Hook - consolidating useAdvancedSearch, useEnhancedSearch functionality
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchStore } from '@/lib/store/search';
import type {
  SearchFilters,
  AdvancedSearchRequest,
  SearchSuggestion,
  SearchResult,
  SearchHistory,
  SavedSearch,
} from '@/types/search';

// Hook options
interface UseUnifiedSearchOptions {
  autoSuggestions?: boolean;
  suggestionsDelay?: number;
  autoHistory?: boolean;
  defaultFilters?: Partial<SearchFilters>;
}

// Hook return interface
interface UseUnifiedSearchReturn {
  // State
  query: string;
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  isLoadingSuggestions: boolean;
  error: string | null;
  filters: SearchFilters;
  history: SearchHistory[];
  savedSearches: SavedSearch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  facets: unknown;

  // Search actions
  search: (
    query?: string,
    customFilters?: Partial<SearchFilters>
  ) => Promise<void>;
  quickSearch: (
    query: string,
    type?: 'jobs' | 'services' | 'users'
  ) => Promise<void>;

  // Query management
  setQuery: (query: string) => void;
  clearQuery: () => void;

  // Suggestions
  fetchSuggestions: (query: string) => Promise<void>;

  // Filters
  updateFilters: (filters: Partial<SearchFilters>) => void;
  applyFilter: (
    key: keyof SearchFilters,
    value: SearchFilters[keyof SearchFilters]
  ) => Promise<void>;
  clearFilters: () => void;

  // Results
  clearResults: () => void;
  refreshResults: () => Promise<void>;

  // History management
  addToHistory: (query: string, filters: SearchFilters) => void;
  clearHistory: () => void;

  // Saved searches
  saveSearch: (name: string) => Promise<void>;
  deleteSavedSearch: (id: string) => void;
  loadSavedSearch: (id: string) => void;

  // Utilities
  clearError: () => void;
  reset: () => void;
}

export function useUnifiedSearch(
  options: UseUnifiedSearchOptions = {}
): UseUnifiedSearchReturn {
  const {
    autoSuggestions = true,
    suggestionsDelay = 300,
    autoHistory = true,
    defaultFilters = {},
  } = options;

  const store = useSearchStore();
  const [isTyping, setIsTyping] = useState(false);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchRequestRef = useRef<AbortController | null>(null);

  // Memoized filters with defaults
  const currentFilters = useMemo(() => {
    const baseFilters: SearchFilters = {
      type: 'all',
      sortBy: 'relevance',
      sortOrder: 'desc',
    };

    return {
      ...baseFilters,
      ...defaultFilters,
      ...store.filters,
    };
  }, [defaultFilters, store.filters]);

  // Main search function
  const search = useCallback(
    async (customQuery?: string, customFilters?: Partial<SearchFilters>) => {
      const searchQuery = customQuery || store.query;
      const searchFilters = customFilters
        ? { ...currentFilters, ...customFilters }
        : currentFilters;

      if (!searchQuery.trim()) {
        console.warn('Empty search query');
        return;
      }

      // Cancel previous request
      if (searchRequestRef.current) {
        searchRequestRef.current.abort();
      }

      searchRequestRef.current = new AbortController();

      try {
        const searchRequest: AdvancedSearchRequest = {
          query: searchQuery,
          filters: searchFilters,
          page: 1,
          limit: 20,
          includeAggregations: true,
        };

        await store.performSearch(searchRequest);

        // Add to history if enabled
        if (autoHistory && searchQuery.trim()) {
          store.addToHistory(searchQuery, searchFilters, store.results.length);
        }
      } catch (error) {
        console.error('Search failed:', error);
      }
    },
    [store, currentFilters, autoHistory]
  );

  // Quick search with preset filters
  const quickSearch = useCallback(
    async (query: string, type?: 'jobs' | 'services' | 'users') => {
      const quickFilters: Partial<SearchFilters> = type ? { type } : {};
      await search(query, quickFilters);
    },
    [search]
  );

  // Fetch suggestions with debouncing
  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!autoSuggestions || query.length < 2) {
        return;
      }

      setIsTyping(true);

      // Clear previous timeout
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }

      // Set new timeout for debouncing
      suggestionsTimeoutRef.current = setTimeout(async () => {
        try {
          await store.fetchSuggestions(query);
        } catch (error) {
          console.error('Suggestions failed:', error);
        } finally {
          setIsTyping(false);
        }
      }, suggestionsDelay);
    },
    [store, autoSuggestions, suggestionsDelay]
  );

  // Auto-fetch suggestions when query changes
  useEffect(() => {
    if (store.query && autoSuggestions) {
      fetchSuggestions(store.query);
    }
  }, [store.query, fetchSuggestions, autoSuggestions]);

  useEffect(() => {
    return () => {
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
        suggestionsTimeoutRef.current = null;
      }
      if (searchRequestRef.current) {
        searchRequestRef.current.abort();
        searchRequestRef.current = null;
      }
    };
  }, []);

  // Apply single filter and trigger search
  const applyFilter = useCallback(
    async (
      key: keyof SearchFilters,
      value: SearchFilters[keyof SearchFilters]
    ) => {
      const newFilters = { ...currentFilters, [key]: value };
      store.updateFilters(newFilters);

      if (store.query) {
        await search(store.query, newFilters);
      }
    },
    [currentFilters, store, search]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    store.updateFilters({
      type: 'all',
      sortBy: 'relevance',
      sortOrder: 'desc',
      ...defaultFilters,
    });
  }, [store, defaultFilters]);

  // Refresh current results
  const refreshResults = useCallback(async () => {
    if (store.query) {
      await search(store.query, currentFilters);
    }
  }, [store.query, search, currentFilters]);

  // Clear query
  const clearQuery = useCallback(() => {
    store.setQuery('');
  }, [store]);

  // Save current search
  const saveSearch = useCallback(
    async (name: string) => {
      if (!store.query) {
        console.warn('No query to save');
        return;
      }

      try {
        store.saveSearch(name, store.query, currentFilters);
      } catch (error) {
        console.error('Save search failed:', error);
      }
    },
    [store, currentFilters]
  );

  // Reset everything
  const reset = useCallback(() => {
    store.clearSearch();
    store.clearResults();
    store.clearError();
  }, [store]);

  return {
    // State
    query: store.query,
    results: store.results,
    suggestions: store.suggestions,
    isLoading: store.isLoading,
    isLoadingSuggestions: isTyping,
    error: store.error,
    filters: currentFilters,
    history: store.history,
    savedSearches: store.savedSearches,
    pagination: store.pagination,
    facets: store.facets,

    // Search actions
    search,
    quickSearch,

    // Query management
    setQuery: store.setQuery,
    clearQuery,

    // Suggestions
    fetchSuggestions,

    // Filters
    updateFilters: store.updateFilters,
    applyFilter,
    clearFilters,

    // Results
    clearResults: store.clearResults,
    refreshResults,

    // History management
    addToHistory: (query: string, filters: SearchFilters) => {
      store.addToHistory(query, filters, store.results.length);
    },
    clearHistory: store.clearHistory,

    // Saved searches
    saveSearch,
    deleteSavedSearch: store.deleteSavedSearch,
    loadSavedSearch: store.loadSavedSearch,

    // Utilities
    clearError: store.clearError,
    reset,
  };
}

export default useUnifiedSearch;
