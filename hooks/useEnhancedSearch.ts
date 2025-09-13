import { useCallback, useEffect, useState } from 'react';
import { useSearchStore } from '@/lib/store/search';
import type {
  SearchSuggestion,
  AdvancedSearchRequest,
  SearchResult,
  SearchFilters,
} from '@/types/search';

/**
 * Enhanced custom hook for advanced search functionality
 * Provides utilities for search, suggestions, history, and filtering
 */
export function useEnhancedSearch() {
  const {
    query,
    suggestions,
    results,
    history,
    savedSearches,
    filters,
    isLoading,
    error,
    setQuery,
    performSearch,
    fetchSuggestions,
    updateFilters,
    clearSearch,
    clearResults,
    clearError,
    addToHistory,
    clearHistory,
    saveSearch,
    deleteSavedSearch,
    loadSavedSearch: loadSavedSearchFromStore,
  } = useSearchStore();

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [isTyping, setIsTyping] = useState(false);

  // Debounced search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsTyping(false);
    }, 300);

    setIsTyping(true);
    return () => clearTimeout(timer);
  }, [query]);

  // Auto-fetch suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery, fetchSuggestions]);

  // Search with current query and filters
  const search = useCallback(
    async (customQuery?: string, customFilters?: Partial<SearchFilters>) => {
      const searchQuery = customQuery || query;
      const searchFilters = customFilters
        ? { ...filters, ...customFilters }
        : filters;

      if (!searchQuery.trim()) return;

      const searchRequest: Partial<AdvancedSearchRequest> = {
        query: searchQuery,
        filters: searchFilters,
        page: 1,
        limit: 20,
      };

      await performSearch(searchRequest);
    },
    [query, filters, performSearch]
  );

  // Quick search with preset filters
  const quickSearch = useCallback(
    async (searchQuery: string, type?: 'jobs' | 'services' | 'users') => {
      const quickFilters: Partial<SearchFilters> = type ? { type } : {};
      await search(searchQuery, quickFilters);
    },
    [search]
  );

  // Apply single filter
  const applyFilter = useCallback(
    async (
      filterKey: keyof SearchFilters,
      value: string | number | string[]
    ) => {
      const newFilters = { ...filters, [filterKey]: value };
      updateFilters(newFilters);

      if (query) {
        await search(query, newFilters);
      }
    },
    [filters, query, updateFilters, search]
  );

  // Remove single filter
  const removeFilter = useCallback(
    async (filterKey: keyof SearchFilters) => {
      const newFilters = { ...filters };
      delete newFilters[filterKey];
      updateFilters(newFilters);

      if (query) {
        await search(query, newFilters);
      }
    },
    [filters, query, updateFilters, search]
  );

  // Search from suggestion
  const searchFromSuggestion = useCallback(
    async (suggestion: SearchSuggestion) => {
      setQuery(suggestion.text);
      await search(suggestion.text);
    },
    [setQuery, search]
  );

  // Search from history
  const searchFromHistory = useCallback(
    async (historyItem: { query: string; filters: SearchFilters }) => {
      setQuery(historyItem.query);
      updateFilters(historyItem.filters);
      await search(historyItem.query, historyItem.filters);
    },
    [setQuery, updateFilters, search]
  );

  // Save current search
  const saveCurrentSearch = useCallback(
    (name: string) => {
      if (!query) return;

      saveSearch(name, query, filters);
    },
    [query, filters, saveSearch]
  );

  // Load saved search
  const loadSaved = useCallback(
    async (savedSearchId: string) => {
      loadSavedSearchFromStore(savedSearchId);
    },
    [loadSavedSearchFromStore]
  );

  // Get search analytics
  const getSearchAnalytics = useCallback(() => {
    return {
      totalSearches: history.length,
      topQueries: history.slice(0, 5).map((h) => h.query),
      savedSearchCount: savedSearches.length,
      currentFiltersCount: Object.keys(filters).length,
    };
  }, [history, savedSearches, filters]);

  // Smart search suggestions based on history
  const getSmartSuggestions = useCallback(
    (inputQuery: string) => {
      if (!inputQuery) return [];

      // Filter history based on input
      const historySuggestions = history
        .filter((item) =>
          item.query.toLowerCase().includes(inputQuery.toLowerCase())
        )
        .slice(0, 3)
        .map((item) => ({
          text: item.query,
          type: 'history' as const,
          count: 0,
        }));

      // Combine with API suggestions
      return [...historySuggestions, ...suggestions];
    },
    [history, suggestions]
  );

  // Auto-complete functionality
  const getAutoComplete = useCallback(
    (inputQuery: string) => {
      const lowerQuery = inputQuery.toLowerCase();

      return suggestions
        .filter((s) => s.text.toLowerCase().startsWith(lowerQuery))
        .slice(0, 5);
    },
    [suggestions]
  );

  // Search validation
  const validateSearch = useCallback((searchQuery: string) => {
    const issues: string[] = [];

    if (!searchQuery.trim()) {
      issues.push('Search query cannot be empty');
    }

    if (searchQuery.length < 2) {
      issues.push('Search query must be at least 2 characters');
    }

    if (searchQuery.length > 100) {
      issues.push('Search query is too long (max 100 characters)');
    }

    // Check for potentially problematic characters
    if (/[<>\"'&]/.test(searchQuery)) {
      issues.push('Search query contains invalid characters');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }, []);

  return {
    // State
    query,
    debouncedQuery,
    suggestions,
    results,
    history,
    savedSearches,
    filters,
    isLoading,
    error,
    isTyping,

    // Actions
    setQuery,
    search,
    quickSearch,
    searchFromSuggestion,
    searchFromHistory,
    clearSearch,
    clearResults,
    clearError,

    // Filter management
    applyFilter,
    removeFilter,
    updateFilters,

    // Search management
    saveCurrentSearch,
    loadSaved,
    deleteSavedSearch,
    clearHistory,

    // Utilities
    getSearchAnalytics,
    getSmartSuggestions,
    getAutoComplete,
    validateSearch,
  };
}
