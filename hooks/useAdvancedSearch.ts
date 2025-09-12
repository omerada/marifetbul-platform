'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAdvancedSearchStore } from '@/lib/store';
import { AdvancedSearchRequest } from '@/types';

export function useAdvancedSearch() {
  const store = useAdvancedSearchStore();
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced suggestions getter to avoid too many API calls
  const getSuggestions = useCallback(
    async (
      query: string,
      type?: 'skills' | 'freelancers' | 'jobs' | 'services' | 'locations'
    ) => {
      if (query.length < 2) {
        store.clearSuggestions();
        return;
      }

      // Clear previous timeout
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }

      // Set new timeout for debouncing
      suggestionsTimeoutRef.current = setTimeout(async () => {
        await store.getSuggestions(query, type);
      }, 300);
    },
    [store]
  );

  // Clear timeout on component unmount
  useEffect(() => {
    return () => {
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, []);

  // Memoized search function
  const performSearch = useCallback(
    async (filters: AdvancedSearchRequest) => {
      await store.performAdvancedSearch(filters);
    },
    [store]
  );

  // Load more results for pagination
  const loadMore = useCallback(
    async (filters: AdvancedSearchRequest) => {
      await store.loadMoreResults(filters);
    },
    [store]
  );

  // Save search with error handling
  const saveSearch = useCallback(
    async (name: string, filters: AdvancedSearchRequest) => {
      await store.saveSearch({
        name,
        filters,
        query: filters.query,
        alertEnabled: false,
        alertFrequency: 'weekly',
      });
    },
    [store]
  );

  return {
    // State
    searchQuery: store.searchQuery,
    searchResults: store.searchResults,
    suggestions: store.suggestions,
    recentSearches: store.recentSearches,
    savedSearches: store.savedSearches,
    isLoading: store.isLoading,
    isLoadingSuggestions: store.isLoadingSuggestions,
    error: store.error,
    facets: store.facets,
    searchId: store.searchId,
    totalResults: store.totalResults,
    hasNextPage: store.hasNextPage,
    currentPage: store.currentPage,

    // Actions
    setSearchQuery: store.setSearchQuery,
    getSuggestions,
    performSearch,
    loadMore,
    saveSearch,
    deleteSavedSearch: store.deleteSavedSearch,
    fetchSavedSearches: store.fetchSavedSearches,
    addToRecentSearches: store.addToRecentSearches,
    clearSearchResults: store.clearSearchResults,
    clearSuggestions: store.clearSuggestions,
    clearError: store.clearError,
    reset: store.reset,
  };
}
