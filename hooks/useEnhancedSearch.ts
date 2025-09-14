import { useState, useCallback } from 'react';

export interface EnhancedSearchFilters {
  query: string;
  type?: 'jobs' | 'freelancers' | 'packages';
  filters?: Record<string, unknown>;
  sort?: string;
  location?: string;
}

export interface EnhancedSearchResult {
  id: string;
  type: 'job' | 'freelancer' | 'package';
  title: string;
  description?: string;
  relevanceScore: number;
  matchedKeywords: string[];
  [key: string]: unknown;
}

export interface SearchSuggestion {
  text: string;
  type: 'keyword' | 'location' | 'skill' | 'category';
  count?: number;
}

export interface UseEnhancedSearchReturn {
  results: EnhancedSearchResult[];
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  search: (filters: EnhancedSearchFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  getSuggestions: (query: string) => Promise<SearchSuggestion[]>;
  clearResults: () => void;
  // Additional properties expected by EnhancedSearchSystem
  query: string;
  filters: EnhancedSearchFilters;
  setQuery: (query: string) => void;
  applyFilter: (key: string, value: unknown) => void;
  removeFilter: (key: string) => void;
  clearSearch: () => void;
  saveCurrentSearch: (name: string) => Promise<void>;
  getSearchAnalytics: () => Promise<SearchAnalytics>;
}

export interface SearchAnalytics {
  popularQueries: Array<{
    query: string;
    count: number;
  }>;
  searchTrends: Array<{
    period: string;
    searches: number;
  }>;
  conversionRate: number;
}

export const useEnhancedSearch = (): UseEnhancedSearchReturn => {
  const [results, setResults] = useState<EnhancedSearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<EnhancedSearchFilters>({ query: '' });

  const search = useCallback(async (searchFilters: EnhancedSearchFilters) => {
    setIsLoading(true);
    setError(null);
    setFilters(searchFilters);

    try {
      // Mock search implementation
      const mockResults: EnhancedSearchResult[] = [
        {
          id: '1',
          type: 'job' as const,
          title: 'React Developer Needed',
          description: 'Looking for an experienced React developer',
          relevanceScore: 0.95,
          matchedKeywords: ['react', 'developer', 'javascript'],
        },
      ];

      setResults(mockResults);
      setHasMore(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyFilter = useCallback((key: string, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value,
      },
    }));
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFilters((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: undefined,
      },
    }));
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilters({ query: '' });
    setResults([]);
    setSuggestions([]);
    setError(null);
    setHasMore(false);
  }, []);

  const saveCurrentSearch = useCallback(
    async (name: string) => {
      try {
        // Mock save search implementation
        console.log('Saving search:', name, filters);
      } catch (err) {
        console.error('Failed to save search:', err);
      }
    },
    [filters]
  );

  const getSearchAnalytics = useCallback(async (): Promise<SearchAnalytics> => {
    try {
      // Mock analytics implementation
      return {
        popularQueries: [
          { query: 'react developer', count: 42 },
          { query: 'web design', count: 35 },
        ],
        searchTrends: [
          { period: '2024-01', searches: 125 },
          { period: '2024-02', searches: 142 },
        ],
        conversionRate: 0.15,
      };
    } catch (err) {
      console.error('Failed to get analytics:', err);
      throw err;
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      // Mock load more implementation
      setHasMore(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading]);

  const getSuggestions = useCallback(
    async (query: string): Promise<SearchSuggestion[]> => {
      if (!query.trim()) return [];

      try {
        // Mock suggestions
        const mockSuggestions: SearchSuggestion[] = [
          { text: 'react developer', type: 'keyword', count: 42 },
          { text: 'javascript', type: 'skill', count: 156 },
          { text: 'web development', type: 'category', count: 89 },
        ];

        setSuggestions(mockSuggestions);
        return mockSuggestions;
      } catch (err) {
        console.error('Failed to get suggestions:', err);
        return [];
      }
    },
    []
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setSuggestions([]);
    setError(null);
    setHasMore(false);
  }, []);

  return {
    results,
    suggestions,
    isLoading,
    error,
    hasMore,
    search,
    loadMore,
    getSuggestions,
    clearResults,
    query,
    filters,
    setQuery,
    applyFilter,
    removeFilter,
    clearSearch,
    saveCurrentSearch,
    getSearchAnalytics,
  };
};

export default useEnhancedSearch;
