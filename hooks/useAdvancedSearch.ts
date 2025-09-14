import { useState, useCallback } from 'react';
import { SearchSuggestion } from '@/types/core/search';

export interface AdvancedSearchFilters {
  query: string;
  category?: string;
  location?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  skills?: string[];
  rating?: number;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'recent';
}

export interface AdvancedSearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  location?: string;
  price?: number;
  rating?: number;
  skills?: string[];
}

export interface UseAdvancedSearchReturn {
  results: AdvancedSearchResult[];
  searchResults: AdvancedSearchResult[]; // Alias for results
  isLoading: boolean;
  error: string | null;
  totalResults: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean; // Added for pagination
  suggestions: SearchSuggestion[]; // Added for suggestions
  recentSearches: string[]; // Added for recent searches
  search: (filters: AdvancedSearchFilters, page?: number) => Promise<void>;
  setSearchQuery: (query: string) => void; // Added for query management
  getSuggestions: (query: string) => Promise<void>; // Added for suggestions
  performSearch: (query: string, request?: any) => Promise<void>; // Added for quick search - accepts second param for compatibility
  loadMore: (request?: any) => Promise<void>; // Added for pagination - accepts param for compatibility
  saveSearch: (name: string, request?: any) => void; // Added for saving searches - accepts second param for compatibility
  addToRecentSearches: (query: string) => void; // Added for recent searches
  clearError: () => void; // Added for error management
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  clearResults: () => void;
}

export const useAdvancedSearch = (): UseAdvancedSearchReturn => {
  const [results, setResults] = useState<AdvancedSearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<AdvancedSearchFilters>({
    query: '',
  });

  const setSearchQuery = useCallback((query: string) => {
    setCurrentFilters((prev) => ({ ...prev, query }));
  }, []);

  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      // Mock suggestions implementation
      const mockSuggestions: SearchSuggestion[] = [
        { id: '1', text: `${query} development`, type: 'category' },
        { id: '2', text: `${query} design`, type: 'category' },
        { id: '3', text: `${query} consulting`, type: 'category' },
        { id: '4', text: `${query} support`, type: 'category' },
        { id: '5', text: `${query} maintenance`, type: 'category' },
      ];
      setSuggestions(mockSuggestions);
    } catch (err) {
      console.error('Failed to get suggestions:', err);
    }
  }, []);

  const performSearch = useCallback(
    async (query: string) => {
      const filters = { ...currentFilters, query };
      setIsLoading(true);
      setError(null);
      setCurrentFilters(filters);
      setCurrentPage(1);

      try {
        // Add to recent searches
        if (query.trim()) {
          setRecentSearches((prev) => {
            const filtered = prev.filter((q) => q !== query);
            return [query, ...filtered].slice(0, 10);
          });
        }

        // Mock search implementation
        const mockResults: AdvancedSearchResult[] = [
          {
            id: '1',
            title: 'Web Development Service',
            description: 'Professional web development with React and Node.js',
            category: 'Web Development',
            location: 'Istanbul, Turkey',
            price: 500,
            rating: 4.8,
            skills: ['React', 'Node.js', 'TypeScript'],
          },
        ];

        setResults(mockResults);
        setTotalResults(mockResults.length);
        setTotalPages(Math.ceil(mockResults.length / 10));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsLoading(false);
      }
    },
    [currentFilters]
  );

  const addToRecentSearches = useCallback((query: string) => {
    if (!query.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((q) => q !== query);
      return [query, ...filtered].slice(0, 10); // Keep last 10 searches
    });
  }, []);

  const saveSearch = useCallback(
    (name: string) => {
      // Mock implementation - in real app would save to backend
      console.log('Saving search:', name, currentFilters);
    },
    [currentFilters]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const search = useCallback(
    async (filters: AdvancedSearchFilters, page = 1) => {
      setIsLoading(true);
      setError(null);
      setCurrentFilters(filters);
      setCurrentPage(page);

      try {
        // Add to recent searches if it's a new search
        if (page === 1 && filters.query) {
          addToRecentSearches(filters.query);
        }

        // Mock search implementation
        const mockResults: AdvancedSearchResult[] = [
          {
            id: '1',
            title: 'Web Development Service',
            description: 'Professional web development with React and Node.js',
            category: 'Web Development',
            location: 'Istanbul, Turkey',
            price: 500,
            rating: 4.8,
            skills: ['React', 'Node.js', 'TypeScript'],
          },
        ];

        setResults(mockResults);
        setTotalResults(mockResults.length);
        setTotalPages(Math.ceil(mockResults.length / 10));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsLoading(false);
      }
    },
    [addToRecentSearches]
  );

  const loadMore = useCallback(async () => {
    if (currentPage < totalPages) {
      await search(currentFilters, currentPage + 1);
    }
  }, [currentPage, totalPages, currentFilters, search]);

  const nextPage = useCallback(async () => {
    if (currentPage < totalPages) {
      await search(currentFilters, currentPage + 1);
    }
  }, [currentPage, totalPages, currentFilters, search]);

  const prevPage = useCallback(async () => {
    if (currentPage > 1) {
      await search(currentFilters, currentPage - 1);
    }
  }, [currentPage, currentFilters, search]);

  const clearResults = useCallback(() => {
    setResults([]);
    setTotalResults(0);
    setCurrentPage(1);
    setTotalPages(0);
    setError(null);
  }, []);

  return {
    results,
    searchResults: results, // Alias for results
    suggestions,
    recentSearches,
    isLoading,
    error,
    totalResults,
    currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    search,
    setSearchQuery,
    getSuggestions,
    performSearch,
    loadMore,
    saveSearch,
    addToRecentSearches,
    clearError,
    nextPage,
    prevPage,
    clearResults,
  };
};

export default useAdvancedSearch;
