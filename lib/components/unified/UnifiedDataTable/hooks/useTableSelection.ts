/**
 * ================================================
 * USE TABLE SELECTION HOOK
 * ================================================
 * Sprint 2 - Story 1.5: Selection Implementation
 *
 * Handles table row selection and bulk actions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-19
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import type { SelectionOptions, UseTableSelectionReturn } from '../types';

interface UseTableSelectionProps<T> {
  data: T[];
  options?: SelectionOptions<T>;
}

/**
 * Hook for table row selection
 *
 * @example
 * ```tsx
 * const { selectedIds, toggleRow, toggleAll } = useTableSelection({
 *   data: users,
 *   options: {
 *     enabled: true,
 *     rowIdAccessor: 'id',
 *     onSelectionChange: (ids, rows) => console.log(ids),
 *   }
 * });
 * ```
 */
export function useTableSelection<T>({
  data,
  options = {},
}: UseTableSelectionProps<T>): UseTableSelectionReturn<T> {
  const {
    enabled = true,
    selectedIds: controlledIds,
    onSelectionChange,
    rowIdAccessor = 'id' as keyof T,
    isRowDisabled = () => false,
  } = options;

  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([]);

  // Use controlled or internal selection
  const selectedIds = controlledIds ?? internalSelectedIds;

  /**
   * Get row ID
   */
  const getRowId = useCallback(
    (row: T): string => {
      if (typeof rowIdAccessor === 'function') {
        return rowIdAccessor(row);
      }
      const id = row[rowIdAccessor];
      return String(id);
    },
    [rowIdAccessor]
  );

  /**
   * Get selected rows
   */
  const selectedRows = useMemo(() => {
    if (!enabled) return [];
    return data.filter((row) => selectedIds.includes(getRowId(row)));
  }, [data, selectedIds, enabled, getRowId]);

  /**
   * Check if row is selected
   */
  const isRowSelected = useCallback(
    (rowId: string): boolean => {
      return selectedIds.includes(rowId);
    },
    [selectedIds]
  );

  /**
   * Toggle single row selection
   */
  const toggleRow = useCallback(
    (rowId: string) => {
      if (!enabled) return;

      const newIds = isRowSelected(rowId)
        ? selectedIds.filter((id) => id !== rowId)
        : [...selectedIds, rowId];

      if (controlledIds === undefined) {
        setInternalSelectedIds(newIds);
      }

      if (onSelectionChange) {
        const newRows = data.filter((row) => newIds.includes(getRowId(row)));
        onSelectionChange(newIds, newRows);
      }
    },
    [
      enabled,
      selectedIds,
      isRowSelected,
      controlledIds,
      onSelectionChange,
      data,
      getRowId,
    ]
  );

  /**
   * Toggle all rows selection
   */
  const toggleAll = useCallback(() => {
    if (!enabled) return;

    // Get all selectable row IDs (not disabled)
    const selectableIds = data
      .filter((row) => !isRowDisabled(row))
      .map((row) => getRowId(row));

    // If all are selected, deselect all; otherwise select all
    const allSelected = selectableIds.every((id) => selectedIds.includes(id));
    const newIds = allSelected ? [] : selectableIds;

    if (controlledIds === undefined) {
      setInternalSelectedIds(newIds);
    }

    if (onSelectionChange) {
      const newRows = data.filter((row) => newIds.includes(getRowId(row)));
      onSelectionChange(newIds, newRows);
    }
  }, [
    enabled,
    data,
    selectedIds,
    isRowDisabled,
    getRowId,
    controlledIds,
    onSelectionChange,
  ]);

  /**
   * Clear all selection
   */
  const clearSelection = useCallback(() => {
    if (!enabled) return;

    if (controlledIds === undefined) {
      setInternalSelectedIds([]);
    }

    if (onSelectionChange) {
      onSelectionChange([], []);
    }
  }, [enabled, controlledIds, onSelectionChange]);

  /**
   * Check if all rows are selected
   */
  const isAllSelected = useMemo(() => {
    if (!enabled || data.length === 0) return false;

    const selectableIds = data
      .filter((row) => !isRowDisabled(row))
      .map((row) => getRowId(row));

    return (
      selectableIds.length > 0 &&
      selectableIds.every((id) => selectedIds.includes(id))
    );
  }, [enabled, data, selectedIds, isRowDisabled, getRowId]);

  /**
   * Check if some (but not all) rows are selected
   */
  const isSomeSelected = useMemo(() => {
    return (
      enabled && selectedIds.length > 0 && selectedIds.length < data.length
    );
  }, [enabled, selectedIds.length, data.length]);

  return {
    selectedIds,
    selectedRows,
    isRowSelected,
    toggleRow,
    toggleAll,
    clearSelection,
    isAllSelected,
    isSomeSelected,
  };
}
