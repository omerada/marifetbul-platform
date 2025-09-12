'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAdvancedSearchStore } from '@/lib/store';
import {
  AdvancedSearchRequest,
  Job,
  ServicePackage,
  Freelancer,
} from '@/types';

export interface SearchFilters {
  categories: string[];
  skills: string[];
  location: string;
  priceRange: [number, number];
  rating: number;
  deliveryTime: string;
  level: string;
  availability: string;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'category' | 'skill' | 'location';
  count?: number;
}

interface UseAdvancedSearchProps {
  mode: 'jobs' | 'services';
  items: (Job | ServicePackage)[];
}

export function useAdvancedSearch(props?: UseAdvancedSearchProps) {
  const store = useAdvancedSearchStore();
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Local state for filters and filtered items when used with props
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    skills: [],
    location: '',
    priceRange: [0, 10000],
    rating: 0,
    deliveryTime: '',
    level: '',
    availability: '',
  });

  const [filteredItems, setFilteredItems] = useState<(Job | ServicePackage)[]>(
    []
  );
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Update filter function
  const updateFilter = useCallback(
    (key: keyof SearchFilters, value: SearchFilters[keyof SearchFilters]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Add to search history
  const addToSearchHistory = useCallback((query: string) => {
    setSearchHistory((prev) => {
      const updated = [query, ...prev.filter((q) => q !== query)].slice(0, 10);
      return updated;
    });
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      categories: [],
      skills: [],
      location: '',
      priceRange: [0, 10000],
      rating: 0,
      deliveryTime: '',
      level: '',
      availability: '',
    });
  }, []);

  // Filter items based on current filters
  useEffect(() => {
    if (!props?.items) {
      setFilteredItems([]);
      return;
    }

    let filtered = [...props.items];

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((item) =>
        filters.categories.some((cat) =>
          item.category?.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    // Apply skill filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter((item) => {
        const skills =
          'skills' in item ? (item as { skills?: string[] }).skills : undefined;
        return (
          skills &&
          filters.skills.some((skill) =>
            skills.some((itemSkill: string) =>
              itemSkill.toLowerCase().includes(skill.toLowerCase())
            )
          )
        );
      });
    }

    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter((item) => {
        const location =
          'location' in item
            ? (item as { location?: string }).location
            : undefined;
        return (
          location &&
          location.toLowerCase().includes(filters.location.toLowerCase())
        );
      });
    }

    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter((item) => {
        const rating =
          'rating' in item ? (item as { rating?: number }).rating : undefined;
        return rating && rating >= filters.rating;
      });
    }

    setFilteredItems(filtered);
  }, [filters, props?.items]);

  // Update active filter count
  useEffect(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.skills.length > 0) count++;
    if (filters.location) count++;
    if (filters.rating > 0) count++;
    if (filters.deliveryTime) count++;
    if (filters.level) count++;
    if (filters.availability) count++;

    setActiveFilterCount(count);
  }, [filters]);

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
    // State - return local state if props are provided, otherwise store state
    searchQuery: store.searchQuery,
    searchResults: store.searchResults,
    suggestions: store.suggestions.map((s) => {
      if (typeof s === 'string') {
        return {
          id: s,
          text: s,
          type: 'skill' as const,
        };
      }
      // Handle suggestion object with proper typing
      const suggestion = s as { id?: string; text?: string; count?: number };
      return {
        id: suggestion.id || String(s),
        text: suggestion.text || String(s),
        type: 'skill' as const,
        count: suggestion.count,
      };
    }) as SearchSuggestion[],
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

    // Props-based state
    filters: props ? filters : undefined,
    filteredItems: props ? filteredItems : [],
    searchHistory: props ? searchHistory : [],
    activeFilterCount: props ? activeFilterCount : 0,

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

    // Props-based actions
    updateFilter: props ? updateFilter : undefined,
    addToSearchHistory: props ? addToSearchHistory : undefined,
    clearFilters: props ? clearFilters : undefined,
  };
}
