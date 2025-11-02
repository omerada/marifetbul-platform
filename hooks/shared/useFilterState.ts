'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { FilterState } from '@/components/shared/filters';

/**
 * useFilterState Hook - Sprint 4 Day 1
 *
 * Custom hook for managing filter state with:
 * - URL parameter synchronization
 * - Filter state management
 * - Preset save/load from localStorage
 * - Clear filters utility
 * - History management
 *
 * Usage:
 * ```tsx
 * const { filters, updateFilters, clearFilters, savePreset, loadPreset } = useFilterState({
 *   defaultFilters: { priceRange: [100, 10000], ... },
 *   syncWithUrl: true
 * });
 * ```
 */

export interface UseFilterStateOptions {
  /** Default filter values */
  defaultFilters: FilterState;
  /** Sync filters with URL parameters */
  syncWithUrl?: boolean;
  /** Callback when filters change */
  onFilterChange?: (filters: FilterState) => void;
  /** Debounce delay for URL updates (ms) */
  debounceDelay?: number;
}

export interface FilterPreset {
  name: string;
  filters: FilterState;
  createdAt: string;
}

const PRESETS_STORAGE_KEY = 'marifetbul_filter_presets';
const RECENT_FILTERS_KEY = 'marifetbul_recent_filters';
const MAX_RECENT_FILTERS = 5;

/**
 * Convert FilterState to URL search params
 */
function filtersToSearchParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();

  // Price range
  if (filters.priceRange[0] !== 100) {
    params.set('minPrice', filters.priceRange[0].toString());
  }
  if (filters.priceRange[1] !== 10000) {
    params.set('maxPrice', filters.priceRange[1].toString());
  }

  // Rating
  if (filters.minRating !== null) {
    params.set('rating', filters.minRating.toString());
  }

  // Delivery time
  if (filters.deliveryTime) {
    params.set('delivery', filters.deliveryTime);
  }

  // Seller levels
  if (filters.sellerLevels.length > 0) {
    params.set('levels', filters.sellerLevels.join(','));
  }

  // Location
  if (filters.location) {
    params.set('location', filters.location);
  }

  return params;
}

/**
 * Parse URL search params to FilterState
 */
function searchParamsToFilters(
  searchParams: URLSearchParams,
  defaultFilters: FilterState
): FilterState {
  const filters: FilterState = { ...defaultFilters };

  // Price range
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  if (minPrice) filters.priceRange[0] = parseInt(minPrice, 10);
  if (maxPrice) filters.priceRange[1] = parseInt(maxPrice, 10);

  // Rating
  const rating = searchParams.get('rating');
  if (rating) filters.minRating = parseInt(rating, 10);

  // Delivery time
  const delivery = searchParams.get('delivery');
  if (delivery && ['24h', '3d', '7d', '14d+'].includes(delivery)) {
    filters.deliveryTime = delivery as FilterState['deliveryTime'];
  }

  // Seller levels
  const levels = searchParams.get('levels');
  if (levels) {
    filters.sellerLevels = levels
      .split(',')
      .filter((l) =>
        ['NEW', 'LEVEL_1', 'LEVEL_2', 'TOP_RATED'].includes(l)
      ) as FilterState['sellerLevels'];
  }

  // Location
  const location = searchParams.get('location');
  if (location) filters.location = location;

  return filters;
}

export function useFilterState({
  defaultFilters,
  syncWithUrl = true,
  onFilterChange,
  debounceDelay = 300,
}: UseFilterStateOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize filters from URL if sync is enabled
  const initialFilters = useMemo(() => {
    if (syncWithUrl && searchParams) {
      return searchParamsToFilters(searchParams, defaultFilters);
    }
    return defaultFilters;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Sync filters to URL with debounce
  useEffect(() => {
    if (!syncWithUrl) return;

    const timeoutId = setTimeout(() => {
      const params = filtersToSearchParams(filters);

      // Preserve existing search query
      const currentQuery = searchParams?.get('q');
      if (currentQuery) {
        params.set('q', currentQuery);
      }

      const newUrl = `${pathname}?${params.toString()}`;

      // Only update if URL actually changed
      if (newUrl !== `${pathname}?${searchParams?.toString() || ''}`) {
        router.replace(newUrl, { scroll: false });
      }
    }, debounceDelay);

    return () => clearTimeout(timeoutId);
  }, [filters, syncWithUrl, pathname, router, debounceDelay, searchParams]);

  // Notify parent of filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  /**
   * Update filters (partial update)
   */
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Replace all filters
   */
  const setAllFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  /**
   * Clear all filters to default
   */
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  /**
   * Check if any filter is active (different from default)
   */
  const hasActiveFilters = useMemo(() => {
    return (
      filters.priceRange[0] !== defaultFilters.priceRange[0] ||
      filters.priceRange[1] !== defaultFilters.priceRange[1] ||
      filters.minRating !== defaultFilters.minRating ||
      filters.deliveryTime !== defaultFilters.deliveryTime ||
      filters.sellerLevels.length !== defaultFilters.sellerLevels.length ||
      filters.location !== defaultFilters.location
    );
  }, [filters, defaultFilters]);

  /**
   * Count active filters
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (
      filters.priceRange[0] !== defaultFilters.priceRange[0] ||
      filters.priceRange[1] !== defaultFilters.priceRange[1]
    )
      count++;
    if (filters.minRating !== null) count++;
    if (filters.deliveryTime !== null) count++;
    if (filters.sellerLevels.length > 0) count++;
    if (filters.location !== null) count++;
    return count;
  }, [filters, defaultFilters]);

  /**
   * Save current filters as a preset
   */
  const savePreset = useCallback(
    (name: string) => {
      try {
        const presetsJson = localStorage.getItem(PRESETS_STORAGE_KEY);
        const presets: FilterPreset[] = presetsJson
          ? JSON.parse(presetsJson)
          : [];

        const newPreset: FilterPreset = {
          name,
          filters,
          createdAt: new Date().toISOString(),
        };

        // Replace if preset with same name exists
        const existingIndex = presets.findIndex((p) => p.name === name);
        if (existingIndex >= 0) {
          presets[existingIndex] = newPreset;
        } else {
          presets.push(newPreset);
        }

        localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
        return true;
      } catch (error) {
        console.error('Failed to save preset:', error);
        return false;
      }
    },
    [filters]
  );

  /**
   * Load a filter preset by name
   */
  const loadPreset = useCallback((name: string) => {
    try {
      const presetsJson = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (!presetsJson) return false;

      const presets: FilterPreset[] = JSON.parse(presetsJson);
      const preset = presets.find((p) => p.name === name);

      if (preset) {
        setFilters(preset.filters);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load preset:', error);
      return false;
    }
  }, []);

  /**
   * Get all saved presets
   */
  const getPresets = useCallback((): FilterPreset[] => {
    try {
      const presetsJson = localStorage.getItem(PRESETS_STORAGE_KEY);
      return presetsJson ? JSON.parse(presetsJson) : [];
    } catch (error) {
      console.error('Failed to get presets:', error);
      return [];
    }
  }, []);

  /**
   * Delete a preset by name
   */
  const deletePreset = useCallback((name: string) => {
    try {
      const presetsJson = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (!presetsJson) return false;

      const presets: FilterPreset[] = JSON.parse(presetsJson);
      const filtered = presets.filter((p) => p.name !== name);

      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete preset:', error);
      return false;
    }
  }, []);

  /**
   * Save filters to recent history
   */
  const saveToRecent = useCallback(() => {
    if (!hasActiveFilters) return;

    try {
      const recentJson = localStorage.getItem(RECENT_FILTERS_KEY);
      const recent: FilterState[] = recentJson ? JSON.parse(recentJson) : [];

      // Add current filters to front
      const updated = [
        filters,
        ...recent.filter((r) => JSON.stringify(r) !== JSON.stringify(filters)),
      ];

      // Keep only last N
      const trimmed = updated.slice(0, MAX_RECENT_FILTERS);

      localStorage.setItem(RECENT_FILTERS_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Failed to save recent filters:', error);
    }
  }, [filters, hasActiveFilters]);

  /**
   * Get recent filter history
   */
  const getRecentFilters = useCallback((): FilterState[] => {
    try {
      const recentJson = localStorage.getItem(RECENT_FILTERS_KEY);
      return recentJson ? JSON.parse(recentJson) : [];
    } catch (error) {
      console.error('Failed to get recent filters:', error);
      return [];
    }
  }, []);

  /**
   * Export filters as shareable URL
   */
  const getShareableUrl = useCallback(() => {
    const params = filtersToSearchParams(filters);
    const currentQuery = searchParams?.get('q');
    if (currentQuery) {
      params.set('q', currentQuery);
    }
    return `${window.location.origin}${pathname}?${params.toString()}`;
  }, [filters, pathname, searchParams]);

  return {
    // State
    filters,
    hasActiveFilters,
    activeFilterCount,

    // Actions
    updateFilters,
    setAllFilters,
    clearFilters,

    // Presets
    savePreset,
    loadPreset,
    getPresets,
    deletePreset,

    // History
    saveToRecent,
    getRecentFilters,

    // Sharing
    getShareableUrl,
  };
}
