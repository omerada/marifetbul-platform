'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SearchResult } from '@/types/shared/search';

// Cache configuration
const CACHE_SIZE = 100;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: SearchResult[];
  timestamp: number;
  ttl: number;
}

interface SearchCache {
  [key: string]: CacheEntry;
}

// Global cache instance
let searchCache: SearchCache = {};
let cacheKeys: string[] = [];

// Cache utilities
const generateCacheKey = (
  query: string,
  filters: Record<string, unknown>
): string => {
  return `search_${query}_${JSON.stringify(filters)}`.toLowerCase();
};

const isCacheValid = (entry: CacheEntry): boolean => {
  return Date.now() - entry.timestamp < entry.ttl;
};

const addToCache = (
  key: string,
  data: SearchResult[],
  ttl: number = CACHE_TTL
): void => {
  // Remove oldest entries if cache is full
  if (cacheKeys.length >= CACHE_SIZE) {
    const oldestKey = cacheKeys.shift();
    if (oldestKey) {
      delete searchCache[oldestKey];
    }
  }

  searchCache[key] = {
    data: [...data],
    timestamp: Date.now(),
    ttl,
  };

  // Update keys order
  cacheKeys = cacheKeys.filter((k) => k !== key);
  cacheKeys.push(key);
};

const getFromCache = (key: string): SearchResult[] | null => {
  const entry = searchCache[key];
  if (!entry || !isCacheValid(entry)) {
    if (entry) {
      delete searchCache[key];
      cacheKeys = cacheKeys.filter((k) => k !== key);
    }
    return null;
  }

  // Move to end (most recently used)
  cacheKeys = cacheKeys.filter((k) => k !== key);
  cacheKeys.push(key);

  return entry.data;
};

export const clearSearchCache = (): void => {
  searchCache = {};
  cacheKeys = [];
};

// Debounce utility
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Virtual scrolling hook
interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualScroll = <T>(
  items: T[],
  { itemHeight, containerHeight, overscan = 5 }: VirtualScrollOptions
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount, items.length);

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length, end + overscan),
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items
      .slice(visibleRange.start, visibleRange.end)
      .map((item, index) => ({
        item,
        index: visibleRange.start + index,
      }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
};

// Enhanced search performance hook
interface UseEnhancedSearchPerformanceOptions {
  debounceDelay?: number;
  cacheEnabled?: boolean;
  cacheTTL?: number;
  virtualScrollEnabled?: boolean;
  itemHeight?: number;
  containerHeight?: number;
}

export const useEnhancedSearchPerformance = (
  options: UseEnhancedSearchPerformanceOptions = {}
) => {
  const {
    debounceDelay = 300,
    cacheEnabled = true,
    cacheTTL = CACHE_TTL,
    virtualScrollEnabled = false,
    itemHeight = 200,
    containerHeight = 600,
  } = options;

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchStats, setSearchStats] = useState({
    totalSearches: 0,
    cacheHits: 0,
    averageSearchTime: 0,
    lastSearchTime: 0,
  });

  // Debounced values
  const debouncedQuery = useDebounce(query, debounceDelay);
  const debouncedFilters = useDebounce(filters, debounceDelay);

  // Virtual scroll setup
  const virtualScroll = useVirtualScroll(results, {
    itemHeight,
    containerHeight,
    overscan: 5,
  });

  // Enhanced search function with caching
  const performSearch = useCallback(
    async (searchQuery: string, searchFilters: Record<string, unknown>) => {
      if (!searchQuery.trim() && Object.keys(searchFilters).length === 0) {
        setResults([]);
        return;
      }

      const cacheKey = generateCacheKey(searchQuery, searchFilters);
      const startTime = performance.now();

      // Check cache first
      if (cacheEnabled) {
        const cachedResults = getFromCache(cacheKey);
        if (cachedResults) {
          setResults(cachedResults);
          setSearchStats((prev) => ({
            ...prev,
            cacheHits: prev.cacheHits + 1,
            lastSearchTime: performance.now() - startTime,
          }));
          return;
        }
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/search/enhanced', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: searchQuery,
            filters: searchFilters,
            page: 1,
            limit: 50,
          }),
        });

        if (!response.ok) {
          throw new Error('Search request failed');
        }

        const data = await response.json();
        const searchResults: SearchResult[] = data.results || [];

        setResults(searchResults);

        // Cache results
        if (cacheEnabled && searchResults.length > 0) {
          addToCache(cacheKey, searchResults, cacheTTL);
        }

        const searchTime = performance.now() - startTime;
        setSearchStats((prev) => ({
          totalSearches: prev.totalSearches + 1,
          cacheHits: prev.cacheHits,
          averageSearchTime:
            prev.totalSearches > 0
              ? (prev.averageSearchTime * prev.totalSearches + searchTime) /
                (prev.totalSearches + 1)
              : searchTime,
          lastSearchTime: searchTime,
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [cacheEnabled, cacheTTL]
  );

  // Trigger search when debounced values change
  useEffect(() => {
    performSearch(debouncedQuery, debouncedFilters);
  }, [debouncedQuery, debouncedFilters, performSearch]);

  // Lazy loading for pagination
  const loadMore = useCallback(
    async (page: number) => {
      if (isLoading) return;

      setIsLoading(true);
      try {
        const response = await fetch('/api/search/enhanced', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: debouncedQuery,
            filters: debouncedFilters,
            page,
            limit: 20,
          }),
        });

        if (!response.ok) {
          throw new Error('Load more request failed');
        }

        const data = await response.json();
        const newResults: SearchResult[] = data.results || [];

        setResults((prev) => [...prev, ...newResults]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedQuery, debouncedFilters, isLoading]
  );

  // Prefetch next page
  const prefetchNextPage = useCallback(
    (currentPage: number) => {
      const cacheKey = generateCacheKey(debouncedQuery, {
        ...debouncedFilters,
        page: currentPage + 1,
      });

      if (!getFromCache(cacheKey)) {
        // Prefetch in background
        fetch('/api/search/enhanced', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: debouncedQuery,
            filters: debouncedFilters,
            page: currentPage + 1,
            limit: 20,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.results) {
              addToCache(cacheKey, data.results, cacheTTL);
            }
          })
          .catch(() => {
            // Ignore prefetch errors
          });
      }
    },
    [debouncedQuery, debouncedFilters, cacheTTL]
  );

  return {
    // Search state
    query,
    setQuery,
    filters,
    setFilters,
    results,
    isLoading,
    error,
    searchStats,

    // Performance features
    debouncedQuery,
    debouncedFilters,

    // Virtual scrolling (when enabled)
    ...(virtualScrollEnabled ? virtualScroll : {}),

    // Pagination
    loadMore,
    prefetchNextPage,

    // Cache management
    clearCache: clearSearchCache,

    // Manual search trigger
    performSearch: () => performSearch(query, filters),
  };
};

// Search result optimization utilities
export const optimizeSearchResults = (
  results: SearchResult[]
): SearchResult[] => {
  // Remove duplicates
  const uniqueResults = results.filter(
    (result, index, array) =>
      array.findIndex((r) => r.id === result.id) === index
  );

  // Sort by relevance score (if available) and featured status
  return uniqueResults.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    if (a.urgent && !b.urgent) return -1;
    if (!a.urgent && b.urgent) return 1;
    return b.rating - a.rating; // Higher rating first
  });
};

// Performance monitoring
export const useSearchPerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    searchCount: 0,
    averageSearchTime: 0,
    cacheHitRate: 0,
    errorRate: 0,
  });

  const trackSearch = useCallback(
    (searchTime: number, fromCache: boolean, hasError: boolean) => {
      setMetrics((prev) => {
        const newSearchCount = prev.searchCount + 1;
        const newAverageTime =
          (prev.averageSearchTime * prev.searchCount + searchTime) /
          newSearchCount;
        const cacheHits = fromCache ? 1 : 0;
        const newCacheHitRate =
          (prev.cacheHitRate * prev.searchCount + cacheHits) / newSearchCount;
        const errors = hasError ? 1 : 0;
        const newErrorRate =
          (prev.errorRate * prev.searchCount + errors) / newSearchCount;

        return {
          searchCount: newSearchCount,
          averageSearchTime: newAverageTime,
          cacheHitRate: newCacheHitRate,
          errorRate: newErrorRate,
        };
      });
    },
    []
  );

  return { metrics, trackSearch };
};
