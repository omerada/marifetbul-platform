'use client';

import { useState, useEffect, useMemo } from 'react';
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
      isRemote: undefined,
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

    // Simulate API call for suggestions
    const timeoutId = setTimeout(() => {
      const mockSuggestions =
        type === 'jobs'
          ? [
              'React Developer',
              'Frontend Developer',
              'Full Stack Developer',
              'UI/UX Designer',
              'Mobile App Developer',
              'WordPress Developer',
            ]
          : [
              'Logo Tasarım',
              'Web Sitesi Geliştirme',
              'Mobile Uygulama',
              'SEO Hizmeti',
              'İçerik Yazımı',
              'Sosyal Medya Yönetimi',
            ];

      const filtered = mockSuggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );

      setSuggestions(filtered.slice(0, 5));
      setIsLoading(false);
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
      localStorage.setItem(key, JSON.stringify(filters));
    } catch (error) {
      console.error('Failed to save filters to localStorage:', error);
    }
  };

  const loadFilters = (): JobFilters | PackageFilters | null => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load filters from localStorage:', error);
      return null;
    }
  };

  const clearSavedFilters = () => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear filters from localStorage:', error);
    }
  };

  return {
    saveFilters,
    loadFilters,
    clearSavedFilters,
  };
}
