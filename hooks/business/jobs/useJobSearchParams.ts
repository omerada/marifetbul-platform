/**
 * useJobSearchParams Hook
 * Synchronizes job filters with URL search parameters
 *
 * Features:
 * - Bidirectional sync between filters and URL
 * - Bookmarkable URLs
 * - Browser back/forward support
 * - Clean URL handling (removes empty params)
 * - Type-safe parameter parsing
 *
 * Sprint 5 - Story 5.3: Advanced Job Search Enhancement
 *
 * @example
 * ```tsx
 * const { filters, updateFilters, resetFilters } = useJobSearchParams();
 *
 * // Updates both state and URL
 * updateFilters({ categoryId: '123' });
 *
 * // URL: /jobs?categoryId=123&budgetMin=1000&skills=react,typescript
 * ```
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { JobFilters } from '@/lib/api/jobs';

/**
 * Parse URL search params into JobFilters object
 */
function parseSearchParams(searchParams: URLSearchParams): JobFilters {
  const filters: JobFilters = {
    page: 0,
    size: 20,
  };

  // String parameters
  if (searchParams.has('search')) {
    filters.search = searchParams.get('search') || undefined;
  }
  if (searchParams.has('categoryId')) {
    filters.categoryId = searchParams.get('categoryId') || undefined;
  }
  if (searchParams.has('subcategoryId')) {
    filters.subcategoryId = searchParams.get('subcategoryId') || undefined;
  }
  if (searchParams.has('location')) {
    filters.location = searchParams.get('location') || undefined;
  }
  if (searchParams.has('budgetType')) {
    const budgetType = searchParams.get('budgetType');
    if (budgetType) filters.budgetType = budgetType as JobFilters['budgetType'];
  }
  if (searchParams.has('sortBy')) {
    const sortBy = searchParams.get('sortBy');
    if (sortBy) filters.sortBy = sortBy as JobFilters['sortBy'];
  }

  // Number parameters
  if (searchParams.has('budgetMin')) {
    const value = Number(searchParams.get('budgetMin'));
    if (!isNaN(value)) filters.budgetMin = value;
  }
  if (searchParams.has('budgetMax')) {
    const value = Number(searchParams.get('budgetMax'));
    if (!isNaN(value)) filters.budgetMax = value;
  }
  if (searchParams.has('page')) {
    const value = Number(searchParams.get('page'));
    if (!isNaN(value)) filters.page = value;
  }
  if (searchParams.has('size')) {
    const value = Number(searchParams.get('size'));
    if (!isNaN(value)) filters.size = value;
  }

  // Boolean parameters
  if (searchParams.has('isRemote')) {
    filters.isRemote = searchParams.get('isRemote') === 'true';
  }

  // Array parameters
  if (searchParams.has('skills')) {
    const skillsParam = searchParams.get('skills');
    if (skillsParam) {
      filters.skills = skillsParam.split(',').filter(Boolean);
    }
  }
  if (searchParams.has('experienceLevel')) {
    const levelsParam = searchParams.get('experienceLevel');
    if (levelsParam) {
      filters.experienceLevel = levelsParam.split(
        ','
      ) as JobFilters['experienceLevel'];
    }
  }

  // Date parameters - Sprint 5
  if (searchParams.has('postedAfter')) {
    filters.postedAfter = searchParams.get('postedAfter') || undefined;
  }
  if (searchParams.has('deadlineBefore')) {
    filters.deadlineBefore = searchParams.get('deadlineBefore') || undefined;
  }

  return filters;
}

/**
 * Convert JobFilters to URLSearchParams
 */
function filtersToSearchParams(filters: JobFilters): URLSearchParams {
  const params = new URLSearchParams();

  // Add only non-empty values
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        params.set(key, value.join(','));
      }
    } else if (typeof value === 'boolean') {
      params.set(key, String(value));
    } else {
      params.set(key, String(value));
    }
  });

  return params;
}

/**
 * Hook return type
 */
export interface UseJobSearchParamsReturn {
  /** Current filters from URL */
  filters: JobFilters;

  /** Update filters and sync to URL */
  updateFilters: (newFilters: Partial<JobFilters>) => void;

  /** Reset all filters */
  resetFilters: () => void;

  /** Check if any filters are active */
  hasActiveFilters: boolean;
}

/**
 * Main hook
 */
export function useJobSearchParams(): UseJobSearchParamsReturn {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse current filters from URL
  const filters = useMemo(
    () => parseSearchParams(searchParams),
    [searchParams]
  );

  // Check if any filters are active (excluding page/size)
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'page' || key === 'size') return false;
      return value !== undefined && value !== null && value !== '';
    });
  }, [filters]);

  // Update filters and URL
  const updateFilters = useCallback(
    (newFilters: Partial<JobFilters>) => {
      const mergedFilters = { ...filters, ...newFilters };

      // Reset page to 0 when filters change (unless page is explicitly set)
      if (!('page' in newFilters)) {
        mergedFilters.page = 0;
      }

      const params = filtersToSearchParams(mergedFilters);
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;

      router.push(newUrl, { scroll: false });
    },
    [filters, router]
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    router.push(window.location.pathname, { scroll: false });
  }, [router]);

  return {
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
  };
}
