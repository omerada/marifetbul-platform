/**
 * ================================================
 * USE TABLE PAGINATION HOOK
 * ================================================
 * Sprint 2 - Story 1.4: Pagination Implementation
 *
 * Handles client-side and server-side table pagination
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-19
 */

'use client';

import { useState, useMemo } from 'react';
import type { PaginationOptions, UseTablePaginationReturn } from '../types';

interface UseTablePaginationProps<T> {
  data: T[];
  options?: PaginationOptions;
}

/**
 * Hook for table pagination functionality
 *
 * @example
 * ```tsx
 * const { paginatedData, currentPage, goToPage } = useTablePagination({
 *   data: users,
 *   options: {
 *     enabled: true,
 *     pageSize: 20,
 *     currentPage: 0,
 *     serverSide: false,
 *   }
 * });
 * ```
 */
export function useTablePagination<T>({
  data,
  options = {},
}: UseTablePaginationProps<T>): UseTablePaginationReturn<T> {
  const {
    enabled = true,
    currentPage: controlledPage,
    pageSize: initialPageSize = 20,
    totalItems,
    serverSide = false,
    onPageChange,
  } = options;

  const [internalPage, setInternalPage] = useState(controlledPage ?? 0);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  // Use controlled or internal page
  const currentPage = controlledPage ?? internalPage;

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!enabled) return 1;

    const total = serverSide && totalItems ? totalItems : data.length;
    return Math.ceil(total / pageSize) || 1;
  }, [enabled, serverSide, totalItems, data.length, pageSize]);

  /**
   * Go to specific page
   */
  const goToPage = (page: number) => {
    if (!enabled) return;

    const newPage = Math.max(0, Math.min(page, totalPages - 1));

    if (controlledPage === undefined) {
      setInternalPage(newPage);
    }

    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  /**
   * Go to next page
   */
  const nextPage = () => {
    goToPage(currentPage + 1);
  };

  /**
   * Go to previous page
   */
  const prevPage = () => {
    goToPage(currentPage - 1);
  };

  /**
   * Change page size
   */
  const setPageSize = (size: number) => {
    setPageSizeState(size);
    // Reset to first page when page size changes
    goToPage(0);
  };

  /**
   * Check if can navigate
   */
  const canGoNext = currentPage < totalPages - 1;
  const canGoPrev = currentPage > 0;

  /**
   * Paginate data (client-side only)
   */
  const paginatedData = useMemo(() => {
    if (!enabled || serverSide) {
      return data;
    }

    const start = currentPage * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, currentPage, pageSize, enabled, serverSide]);

  return {
    paginatedData,
    currentPage,
    totalPages,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    canGoNext,
    canGoPrev,
  };
}
