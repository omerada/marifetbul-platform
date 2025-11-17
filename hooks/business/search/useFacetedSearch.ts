import { useState, useEffect, useCallback } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';

export interface FacetValue {
  value: string;
  count: number;
  selected?: boolean;
}

export interface Facets {
  category?: FacetValue[];
  priceRange?: FacetValue[];
  location?: FacetValue[];
  rating?: FacetValue[];
  deliveryTime?: FacetValue[];
  [key: string]: FacetValue[] | undefined;
}

export interface SearchFilters {
  query?: string;
  categories?: string[];
  priceMin?: number;
  priceMax?: number;
  locations?: string[];
  minRating?: number;
  maxDeliveryDays?: number;
  page?: number;
  pageSize?: number;
}

export interface FacetedSearchResult {
  services: unknown[];
  facets: Facets;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export function useFacetedSearch(initialFilters: SearchFilters = {}) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [data, setData] = useState<FacetedSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchFilters: SearchFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/search/faceted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(searchFilters),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      logger.info('[Hook] Faceted search completed', {
        resultsCount: result.services.length,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error(
        '[Hook] Faceted search error',
        err instanceof Error ? err : new Error(message)
      );
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    search(filters);
  }, [filters, search]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const toggleFacet = useCallback((facetType: string, value: string) => {
    setFilters((prev) => {
      const facetKey = `${facetType}s` as keyof SearchFilters;
      const currentValues = (prev[facetKey] as string[] | undefined) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [facetKey]: newValues,
        page: 1,
      };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ page: 1, pageSize: initialFilters.pageSize || 20 });
  }, [initialFilters.pageSize]);

  return {
    data,
    filters,
    isLoading,
    error,
    search,
    updateFilters,
    toggleFacet,
    clearFilters,
  };
}
