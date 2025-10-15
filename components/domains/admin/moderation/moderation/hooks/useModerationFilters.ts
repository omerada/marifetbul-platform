/**
 * useModerationFilters Hook
 *
 * Custom hook for managing moderation filters state and changes.
 */

'use client';

import { useState, useCallback } from 'react';
import { DEFAULT_FILTERS } from '../utils/moderationConstants';
import type {
  ModerationFilters,
  UseModerationFiltersReturn,
} from '../types/moderationTypes';

export function useModerationFilters(
  initialFilters: Partial<ModerationFilters> = {}
): UseModerationFiltersReturn {
  const [filters, setFilters] = useState<ModerationFilters>({
    status: [...DEFAULT_FILTERS.status],
    priority: [...DEFAULT_FILTERS.priority],
    type: [...DEFAULT_FILTERS.type],
    search: DEFAULT_FILTERS.search,
    ...initialFilters,
  });

  const handleFilterChange = useCallback(
    (key: keyof ModerationFilters, value: string | string[]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({
      status: [],
      priority: [],
      type: [],
      search: '',
    });
  }, []);

  return {
    filters,
    handleFilterChange,
    clearFilters,
  };
}
