/**
 * ================================================
 * COMMENT PAGINATION COMPONENT
 * ================================================
 * Pagination controls for comment lists
 * Supports page navigation and items per page
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

// ================================================
// TYPES
// ================================================

export interface CommentPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  loading?: boolean;
}

// ================================================
// CONSTANTS
// ================================================

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

// ================================================
// COMPONENT
// ================================================

export function CommentPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  loading = false,
}: CommentPaginationProps) {
  // ================================================
  // COMPUTED
  // ================================================

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Generate page numbers to display
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // ================================================
  // HANDLERS
  // ================================================

  const handlePageClick = (page: number) => {
    if (page !== currentPage && !loading) {
      onPageChange(page);
    }
  };

  const handleFirstPage = () => {
    if (canGoPrevious && !loading) {
      onPageChange(1);
    }
  };

  const handlePreviousPage = () => {
    if (canGoPrevious && !loading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (canGoNext && !loading) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLastPage = () => {
    if (canGoNext && !loading) {
      onPageChange(totalPages);
    }
  };

  // ================================================
  // RENDER - No Pagination Needed
  // ================================================

  if (totalPages <= 1) {
    return null;
  }

  // ================================================
  // RENDER - Main
  // ================================================

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      {/* Items Info */}
      <div className="text-sm text-gray-600">
        <span className="font-medium">{startItem}</span>
        {' - '}
        <span className="font-medium">{endItem}</span>
        {' / '}
        <span className="font-medium">{totalItems}</span> yorum gösteriliyor
      </div>

      {/* Page Navigation */}
      <div className="flex items-center gap-2">
        {/* First Page */}
        <button
          onClick={handleFirstPage}
          disabled={!canGoPrevious || loading}
          className="rounded-lg border border-gray-300 p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="İlk sayfa"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={handlePreviousPage}
          disabled={!canGoPrevious || loading}
          className="rounded-lg border border-gray-300 p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Önceki sayfa"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) =>
            typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => handlePageClick(page)}
                disabled={loading}
                className={`min-w-[2.5rem] rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="px-2 text-gray-400">
                {page}
              </span>
            )
          )}
        </div>

        {/* Next Page */}
        <button
          onClick={handleNextPage}
          disabled={!canGoNext || loading}
          className="rounded-lg border border-gray-300 p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Sonraki sayfa"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={handleLastPage}
          disabled={!canGoNext || loading}
          className="rounded-lg border border-gray-300 p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Son sayfa"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>

      {/* Items Per Page */}
      {showItemsPerPage && onItemsPerPageChange && (
        <div className="flex items-center gap-2">
          <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
            Sayfa başına:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default CommentPagination;
