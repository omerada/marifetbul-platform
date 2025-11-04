'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Facet, FacetGroup } from '@/components/shared/filters';
import {
  fetchJobFacetsWithCache,
  type JobFacetsData,
} from '@/lib/api/job-facets';

/**
 * useFacets Hook - Sprint 4 Day 2
 * Updated Sprint 1 - Task 5: Faceted Search Implementation
 *
 * Manages facet data and state for faceted navigation
 *
 * Features:
 * - Fetch facet counts from API ✅
 * - Update on filter changes
 * - Handle facet selection/deselection
 * - Optimistic UI updates
 * - Loading and error states
 */

export interface UseFacetsOptions {
  /** Initial facet groups structure */
  facetGroups?: FacetGroup[];
  /** Fetch facets on mount */
  fetchOnMount?: boolean;
  /** Current filters to pass to API */
  currentFilters?: Record<string, unknown>;
}

export interface UseFacetsReturn {
  /** Facet groups with counts */
  facetGroups: FacetGroup[];
  /** Currently selected facets by group */
  selectedFacets: Record<string, string[]>;
  /** Toggle facet selection */
  toggleFacet: (groupId: string, facetValue: string) => void;
  /** Clear all facets in a group */
  clearGroup: (groupId: string) => void;
  /** Clear all facets */
  clearAll: () => void;
  /** Fetch facets from API */
  fetchFacets: () => Promise<void>;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Check if any facets are selected */
  hasSelectedFacets: boolean;
}

/**
 * Convert facets data to FacetGroup format
 */
function convertToFacetGroups(
  data: JobFacetsData,
  baseGroups: FacetGroup[]
): FacetGroup[] {
  return baseGroups.map((group) => {
    let facets: Facet[] = [];

    switch (group.id) {
      case 'categories':
        facets = Object.entries(data.categories).map(([label, count]) => ({
          value: label.toLowerCase().replace(/\s+/g, '_'),
          label,
          count,
        }));
        break;
      case 'skills':
        facets = Object.entries(data.skills).map(([label, count]) => ({
          value: label.toLowerCase().replace(/\s+/g, '_'),
          label,
          count,
        }));
        break;
      case 'locations':
        facets = Object.entries(data.locations).map(([label, count]) => ({
          value: label.toLowerCase().replace(/\s+/g, '_'),
          label,
          count,
        }));
        break;
    }

    // Sort by count descending
    facets.sort((a, b) => b.count - a.count);

    return {
      ...group,
      facets,
    };
  });
}

export function useFacets(options: UseFacetsOptions = {}): UseFacetsReturn {
  const {
    facetGroups: initialGroups = [],
    fetchOnMount = true,
    currentFilters = {},
  } = options;

  const [facetGroups, setFacetGroups] = useState<FacetGroup[]>(initialGroups);
  const [selectedFacets, setSelectedFacets] = useState<
    Record<string, string[]>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch facets
  const fetchFacets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build filters for API
      const filters: Record<string, string | number | undefined> = {};
      if (currentFilters.category) {
        filters.category = String(currentFilters.category);
      }
      if (currentFilters.location) {
        filters.location = String(currentFilters.location);
      }
      if (currentFilters.minBudget) {
        filters.minBudget = Number(currentFilters.minBudget);
      }
      if (currentFilters.maxBudget) {
        filters.maxBudget = Number(currentFilters.maxBudget);
      }

      const data = await fetchJobFacetsWithCache(filters);
      const groups = convertToFacetGroups(data, initialGroups);
      setFacetGroups(groups);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Faset verileri yüklenemedi';
      setError(errorMessage);
      if (process.env.NODE_ENV === 'development') {
        console.error('[useFacets] Failed to fetch facets:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentFilters, initialGroups]);

  // Fetch on mount if enabled
  useEffect(() => {
    if (fetchOnMount) {
      fetchFacets();
    }
  }, [fetchOnMount, fetchFacets]);

  // Toggle facet selection
  const toggleFacet = useCallback((groupId: string, facetValue: string) => {
    setSelectedFacets((prev) => {
      const groupSelections = prev[groupId] || [];
      const isSelected = groupSelections.includes(facetValue);

      return {
        ...prev,
        [groupId]: isSelected
          ? groupSelections.filter((v) => v !== facetValue)
          : [...groupSelections, facetValue],
      };
    });
  }, []);

  // Clear group
  const clearGroup = useCallback((groupId: string) => {
    setSelectedFacets((prev) => {
      const next = { ...prev };
      delete next[groupId];
      return next;
    });
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setSelectedFacets({});
  }, []);

  // Check if any facets selected
  const hasSelectedFacets = Object.values(selectedFacets).some(
    (arr) => arr.length > 0
  );

  return {
    facetGroups,
    selectedFacets,
    toggleFacet,
    clearGroup,
    clearAll,
    fetchFacets,
    isLoading,
    error,
    hasSelectedFacets,
  };
}
