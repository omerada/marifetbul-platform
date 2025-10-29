/**
 * Portfolio Filters Hook
 * Sprint 1: Story 4.2 - Portfolio Search & Filter
 *
 * Provides portfolio filtering functionality
 */

import { useState, useCallback, useMemo } from 'react';
import type { PortfolioResponse } from '@/lib/api/portfolio';

// ============================================================================
// TYPES
// ============================================================================

export interface PortfolioFilters {
  categories: string[];
  skills: string[];
  visibility: 'all' | 'public' | 'private';
}

export interface UsePortfolioFiltersReturn {
  // State
  filters: PortfolioFilters;
  filteredResults: PortfolioResponse[];
  activeFilterCount: number;

  // Actions
  setCategories: (categories: string[]) => void;
  setSkills: (skills: string[]) => void;
  setVisibility: (visibility: 'all' | 'public' | 'private') => void;
  clearFilters: () => void;
  clearFilter: (filterType: keyof PortfolioFilters) => void;

  // Available options (extracted from portfolios)
  availableCategories: string[];
  availableSkills: string[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract unique categories from portfolios
 */
function extractCategories(portfolios: PortfolioResponse[]): string[] {
  const categories = new Set<string>();
  portfolios.forEach((p) => {
    if (p.category) {
      categories.add(p.category);
    }
  });
  return Array.from(categories).sort();
}

/**
 * Extract unique skills from portfolios
 */
function extractSkills(portfolios: PortfolioResponse[]): string[] {
  const skills = new Set<string>();
  portfolios.forEach((p) => {
    if (p.skills && p.skills.length > 0) {
      p.skills.forEach((skill) => skills.add(skill));
    }
  });
  return Array.from(skills).sort();
}

/**
 * Apply filters to portfolios
 */
function applyFilters(
  portfolios: PortfolioResponse[],
  filters: PortfolioFilters
): PortfolioResponse[] {
  return portfolios.filter((portfolio) => {
    // Category filter
    if (filters.categories.length > 0) {
      if (
        !portfolio.category ||
        !filters.categories.includes(portfolio.category)
      ) {
        return false;
      }
    }

    // Skills filter (portfolio must have at least one of the selected skills)
    if (filters.skills.length > 0) {
      if (!portfolio.skills || portfolio.skills.length === 0) {
        return false;
      }
      const hasMatchingSkill = portfolio.skills.some((skill) =>
        filters.skills.includes(skill)
      );
      if (!hasMatchingSkill) {
        return false;
      }
    }

    // Visibility filter
    if (filters.visibility !== 'all') {
      const isPublic = portfolio.isPublic;
      if (filters.visibility === 'public' && !isPublic) {
        return false;
      }
      if (filters.visibility === 'private' && isPublic) {
        return false;
      }
    }

    return true;
  });
}

// ============================================================================
// HOOK
// ============================================================================

export function usePortfolioFilters(
  portfolios: PortfolioResponse[]
): UsePortfolioFiltersReturn {
  const [filters, setFilters] = useState<PortfolioFilters>({
    categories: [],
    skills: [],
    visibility: 'all',
  });

  // Extract available options
  const availableCategories = useMemo(
    () => extractCategories(portfolios),
    [portfolios]
  );

  const availableSkills = useMemo(
    () => extractSkills(portfolios),
    [portfolios]
  );

  // Apply filters
  const filteredResults = useMemo(
    () => applyFilters(portfolios, filters),
    [portfolios, filters]
  );

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.skills.length > 0) count += filters.skills.length;
    if (filters.visibility !== 'all') count += 1;
    return count;
  }, [filters]);

  // Actions
  const setCategories = useCallback((categories: string[]) => {
    setFilters((prev) => ({ ...prev, categories }));
  }, []);

  const setSkills = useCallback((skills: string[]) => {
    setFilters((prev) => ({ ...prev, skills }));
  }, []);

  const setVisibility = useCallback(
    (visibility: 'all' | 'public' | 'private') => {
      setFilters((prev) => ({ ...prev, visibility }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({
      categories: [],
      skills: [],
      visibility: 'all',
    });
  }, []);

  const clearFilter = useCallback((filterType: keyof PortfolioFilters) => {
    setFilters((prev) => {
      if (filterType === 'visibility') {
        return { ...prev, visibility: 'all' };
      }
      return { ...prev, [filterType]: [] };
    });
  }, []);

  return {
    filters,
    filteredResults,
    activeFilterCount,
    setCategories,
    setSkills,
    setVisibility,
    clearFilters,
    clearFilter,
    availableCategories,
    availableSkills,
  };
}

export default usePortfolioFilters;
