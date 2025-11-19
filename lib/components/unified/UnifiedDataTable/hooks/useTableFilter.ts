/**
 * ================================================
 * USE TABLE FILTER HOOK
 * ================================================
 * Sprint 2 - Story 1.3: Filtering Implementation
 *
 * Handles client-side and server-side table filtering
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-19
 */

'use client';

import { useState, useMemo } from 'react';
import type {
  FilterValues,
  FilteringOptions,
  UseTableFilterReturn,
  Column,
} from '../types';

interface UseTableFilterProps<T> {
  data: T[];
  columns: Column<T>[];
  options?: FilteringOptions;
}

/**
 * Hook for table filtering functionality
 *
 * @example
 * ```tsx
 * const { filteredData, filters, setFilter } = useTableFilter({
 *   data: users,
 *   columns: userColumns,
 *   options: {
 *     enabled: true,
 *     filters: [
 *       { id: 'status', type: 'select', options: [...] },
 *       { id: 'search', type: 'text' },
 *     ],
 *     serverSide: false,
 *   }
 * });
 * ```
 */
export function useTableFilter<T>({
  data,
  columns,
  options = {},
}: UseTableFilterProps<T>): UseTableFilterReturn<T> {
  const {
    enabled = true,
    defaultFilters = {},
    serverSide = false,
    onFilterChange,
  } = options;

  const [filters, setFilters] = useState<FilterValues>(defaultFilters);

  /**
   * Set a single filter value
   */
  const setFilter = (filterId: string, value: unknown) => {
    setFilters((current) => {
      const updated = { ...current, [filterId]: value };

      // Notify parent for server-side filtering
      if (serverSide && onFilterChange) {
        onFilterChange(updated);
      }

      return updated;
    });
  };

  /**
   * Clear a single filter
   */
  const clearFilter = (filterId: string) => {
    setFilters((current) => {
      const { [filterId]: _, ...rest } = current;

      // Notify parent for server-side filtering
      if (serverSide && onFilterChange) {
        onFilterChange(rest);
      }

      return rest;
    });
  };

  /**
   * Clear all filters
   */
  const clearAllFilters = () => {
    setFilters({});
    if (serverSide && onFilterChange) {
      onFilterChange({});
    }
  };

  /**
   * Filter data (client-side only)
   */
  const filteredData = useMemo(() => {
    if (!enabled || serverSide || Object.keys(filters).length === 0) {
      return data;
    }

    return data.filter((row) => {
      // Check each active filter
      return Object.entries(filters).every(([filterId, filterValue]) => {
        // Skip empty filters
        if (
          filterValue === '' ||
          filterValue === null ||
          filterValue === undefined
        ) {
          return true;
        }

        // Find column
        const column = columns.find((col) => col.id === filterId);
        if (!column || !column.accessor) return true;

        const cellValue = row[column.accessor];

        // Handle different filter types
        if (Array.isArray(filterValue)) {
          // Multi-select: value must be in array
          return filterValue.includes(cellValue);
        }

        if (typeof filterValue === 'object' && filterValue !== null) {
          // Range filter (date-range, number-range)
          const { min, max } = filterValue;
          if (min !== undefined && cellValue < min) return false;
          if (max !== undefined && cellValue > max) return false;
          return true;
        }

        if (typeof filterValue === 'string') {
          // Text search: case-insensitive contains
          const searchTerm = filterValue.toLowerCase();
          const cellString = String(cellValue).toLowerCase();
          return cellString.includes(searchTerm);
        }

        // Exact match for other types
        return cellValue === filterValue;
      });
    });
  }, [data, filters, enabled, serverSide, columns]);

  return {
    filteredData,
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
  };
}
