/**
 * ================================================
 * USE TABLE SORT HOOK
 * ================================================
 * Sprint 2 - Story 1.2: Sorting Implementation
 *
 * Handles client-side and server-side table sorting
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-19
 */

'use client';

import { useState, useMemo } from 'react';
import type {
  SortConfig,
  SortingOptions,
  UseTableSortReturn,
  Column,
} from '../types';

interface UseTableSortProps<T> {
  data: T[];
  columns: Column<T>[];
  options?: SortingOptions;
}

/**
 * Hook for table sorting functionality
 *
 * @example
 * ```tsx
 * const { sortedData, sortConfig, handleSort } = useTableSort({
 *   data: users,
 *   columns: userColumns,
 *   options: {
 *     enabled: true,
 *     defaultSort: { column: 'name', direction: 'asc' },
 *     serverSide: false,
 *   }
 * });
 * ```
 */
export function useTableSort<T>({
  data,
  columns,
  options = {},
}: UseTableSortProps<T>): UseTableSortReturn<T> {
  const {
    enabled = true,
    defaultSort = null,
    serverSide = false,
    onSortChange,
  } = options;

  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort);

  /**
   * Handle sort column toggle
   */
  const handleSort = (columnId: string) => {
    if (!enabled) return;

    // Find column config
    const column = columns.find((col) => col.id === columnId);
    if (!column?.sortable) return;

    setSortConfig((current) => {
      let newSort: SortConfig | null = null;

      if (!current || current.column !== columnId) {
        // First click: sort ascending
        newSort = { column: columnId, direction: 'asc' };
      } else if (current.direction === 'asc') {
        // Second click: sort descending
        newSort = { column: columnId, direction: 'desc' };
      } else {
        // Third click: clear sort
        newSort = null;
      }

      // Notify parent for server-side sorting
      if (serverSide && onSortChange) {
        onSortChange(newSort);
      }

      return newSort;
    });
  };

  /**
   * Clear all sorting
   */
  const clearSort = () => {
    setSortConfig(null);
    if (serverSide && onSortChange) {
      onSortChange(null);
    }
  };

  /**
   * Sort data (client-side only)
   */
  const sortedData = useMemo(() => {
    if (!enabled || !sortConfig || serverSide) {
      return data;
    }

    const { column: columnId, direction } = sortConfig;

    // Find column config
    const column = columns.find((col) => col.id === columnId);
    if (!column) return data;

    // Clone array to avoid mutation
    const sorted = [...data];

    // Use custom sort function if provided
    if (column.sortFn) {
      return sorted.sort((a, b) => column.sortFn!(a, b, direction));
    }

    // Default sorting by accessor
    if (!column.accessor) return data;

    return sorted.sort((a, b) => {
      const aValue = a[column.accessor!];
      const bValue = b[column.accessor!];

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // String comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue, 'tr-TR');
        return direction === 'asc' ? comparison : -comparison;
      }

      // Number/Date comparison
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, enabled, serverSide, columns]);

  return {
    sortedData,
    sortConfig,
    handleSort,
    clearSort,
  };
}
