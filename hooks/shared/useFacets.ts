'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Facet, FacetGroup } from '@/components/shared/filters';

/**
 * useFacets Hook - Sprint 4 Day 2
 *
 * Manages facet data and state for faceted navigation
 *
 * Features:
 * - Fetch facet counts from API
 * - Update on filter changes
 * - Handle facet selection/deselection
 * - Optimistic UI updates
 * - Loading and error states
 */

export interface FacetsData {
  categories: Record<string, number>;
  skills: Record<string, number>;
  locations: Record<string, number>;
}

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
 * Default facets data (mock for development)
 */
const DEFAULT_FACETS_DATA: FacetsData = {
  categories: {
    'Web Geliştirme': 142,
    'Mobil Uygulama': 87,
    'Grafik Tasarım': 156,
    'İçerik Yazarlığı': 93,
    'Dijital Pazarlama': 78,
    'Video Düzenleme': 64,
    SEO: 52,
    'Veri Girişi': 121,
  },
  skills: {
    React: 89,
    'Node.js': 67,
    TypeScript: 54,
    Python: 78,
    'Adobe Photoshop': 94,
    Figma: 72,
    WordPress: 103,
    'Social Media': 45,
  },
  locations: {
    İstanbul: 234,
    Ankara: 112,
    İzmir: 89,
    Antalya: 45,
    Bursa: 38,
    Adana: 32,
    Konya: 28,
    Uzaktan: 456,
  },
};

/**
 * Convert facets data to FacetGroup format
 */
function convertToFacetGroups(
  data: FacetsData,
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

/**
 * Fetch facets from API
 *
 * TODO: Backend Implementation Required
 * Endpoint: GET /api/v1/jobs/facets
 * Query Params: ?category={category}&location={location}&minBudget={min}&maxBudget={max}
 *
 * Expected Response:
 * {
 *   success: true,
 *   data: {
 *     categories: { "Web Geliştirme": 142, ... },
 *     skills: { "React": 89, ... },
 *     locations: { "İstanbul": 234, ... },
 *     budgetRanges: { "0-500": 45, ... }
 *   }
 * }
 *
 * For now, returns mock data. Should be replaced with real facet counts from search index.
 */
async function fetchFacetsFromAPI(
  filters?: Record<string, unknown>
): Promise<FacetsData> {
  try {
    // TODO: Implement when backend creates dedicated facets endpoint
    // const params = new URLSearchParams();
    // if (filters?.category) params.set('category', String(filters.category));
    // if (filters?.location) params.set('location', String(filters.location));
    //
    // const response = await fetch(`/api/v1/jobs/facets?${params.toString()}`);
    // if (!response.ok) throw new Error(`API error: ${response.status}`);
    // const result = await response.json();
    // return result.data;

    // Using mock data until backend implements facets endpoint
    void filters; // Suppress unused warning
    return DEFAULT_FACETS_DATA;
  } catch (error) {
    console.error('[fetchFacetsFromAPI] Error:', error);
    return DEFAULT_FACETS_DATA;
  }
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

      const data = await fetchFacetsFromAPI(currentFilters);
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
