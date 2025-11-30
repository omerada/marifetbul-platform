'use client';

import { useState, useEffect, useMemo } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';
import { JobFilters, PackageFilters } from '@/types';

// Advanced Job Filters Hook
export function useJobFilters(initialFilters: JobFilters = {}) {
  const [filters, setFilters] = useState<JobFilters>(initialFilters);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const toggleFiltersVisibility = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };

  const updateFilters = (newFilters: JobFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: JobFilters = {
      search: '',
      category: '',
      subcategory: '',
      budgetMin: undefined,
      budgetMax: undefined,
      budgetType: undefined,
      experienceLevel: undefined,
      location: [],
      skills: [],
    };
    setFilters(clearedFilters);
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== '';
    });
  }, [filters]);

  // Create query string for API calls
  const getQueryString = useMemo(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (Array.isArray(value) && value.length > 0) {
          params.append(key, value.join(','));
        } else if (!Array.isArray(value)) {
          params.append(key, String(value));
        }
      }
    });

    return params.toString();
  }, [filters]);

  return {
    filters,
    isFiltersVisible,
    hasActiveFilters,
    queryString: getQueryString,
    updateFilters,
    clearFilters,
    toggleFiltersVisibility,
    setFiltersVisible: setIsFiltersVisible,
  };
}

// Advanced Package Filters Hook
export function usePackageFilters(initialFilters: PackageFilters = {}) {
  const [filters, setFilters] = useState<PackageFilters>(initialFilters);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const toggleFiltersVisibility = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };

  const updateFilters = (newFilters: PackageFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: PackageFilters = {
      search: '',
      category: '',
      subcategory: '',
      priceMin: undefined,
      priceMax: undefined,
      deliveryTime: undefined,
      rating: undefined,
    };
    setFilters(clearedFilters);
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== undefined && value !== ''
    );
  }, [filters]);

  // Create query string for API calls
  const getQueryString = useMemo(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, String(value));
      }
    });

    return params.toString();
  }, [filters]);

  return {
    filters,
    isFiltersVisible,
    hasActiveFilters,
    queryString: getQueryString,
    updateFilters,
    clearFilters,
    toggleFiltersVisibility,
    setFiltersVisible: setIsFiltersVisible,
  };
}

// Search suggestions hook
export function useSearchSuggestions(query: string, type: 'jobs' | 'packages') {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    // Production: real backend API call for autocomplete suggestions
    const timeoutId = setTimeout(async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
        const res = await fetch(
          `${apiUrl}/search/suggestions?query=${encodeURIComponent(query)}&type=${type}`,
          {
            cache: 'no-store',
          }
        );

        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];
          setSuggestions(items.slice(0, 5));
        } else {
          // If endpoint doesn't exist yet or error, fall back to empty
          setSuggestions([]);
        }
      } catch (error) {
        logger.error('Search suggestions fetch error:', error instanceof Error ? error : new Error(String(error)));
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      setIsLoading(false);
    };
  }, [query, type]);

  return { suggestions, isLoading };
}

// Filter persistence hook (localStorage)
export function useFilterPersistence(key: string) {
  const saveFilters = (filters: JobFilters | PackageFilters) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(filters));
      }
    } catch (error) {
      logger.error('Failed to save filters to localStorage:', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const loadFilters = (): JobFilters | PackageFilters | null => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : null;
      }
      return null;
    } catch (error) {
      logger.error('Failed to load filters from localStorage:', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  };

  const clearSavedFilters = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      logger.error('Failed to clear filters from localStorage:', error instanceof Error ? error : new Error(String(error)));
    }
  };

  return {
    saveFilters,
    loadFilters,
    clearSavedFilters,
  };
}
