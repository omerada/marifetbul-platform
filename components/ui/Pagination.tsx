'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { UnifiedButton as Button } from './UnifiedButton';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showSizeChanger?: boolean;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showQuickJumper?: boolean;
  showTotal?: boolean;
  total?: number;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showSizeChanger = false,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showQuickJumper = false,
  showTotal = true,
  total = 0,
  className,
  disabled = false,
  size = 'md',
}: PaginationProps) {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2; // Number of pages to show on each side of current page

    if (totalPages <= 7) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= delta + 3) {
        // Current page is near the beginning
        for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
          pages.push(i);
        }
        if (totalPages > 5) {
          pages.push('...');
        }
      } else if (currentPage >= totalPages - delta - 2) {
        // Current page is near the end
        if (totalPages > 5) {
          pages.push('...');
        }
        for (let i = Math.max(totalPages - 4, 2); i <= totalPages - 1; i++) {
          pages.push(i);
        }
      } else {
        // Current page is in the middle
        pages.push('...');
        for (let i = currentPage - delta; i <= currentPage + delta; i++) {
          pages.push(i);
        }
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (disabled || page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    onPageChange(page);
  };

  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };

  const pageNumbers = getPageNumbers();

  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      {/* Total count */}
      {showTotal && total > 0 && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">{total.toLocaleString()}</span> sonuç
          bulundu
          {pageSize && (
            <>
              {' '}
              • Sayfa {currentPage} / {totalPages}
            </>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Page size selector */}
        {showSizeChanger && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sayfa başı:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              disabled={disabled}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pagination controls */}
        <div className="flex items-center gap-1">
          {/* Previous button */}
          <Button
            variant="outline"
            size={size}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={disabled || currentPage === 1}
            className={cn(sizeClasses[size])}
            aria-label="Önceki sayfa"
          >
            <ChevronLeft className={iconSizeClasses[size]} />
          </Button>

          {/* Page numbers */}
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span
                  className={cn(
                    'flex items-center justify-center',
                    sizeClasses[size]
                  )}
                >
                  <MoreHorizontal className={iconSizeClasses[size]} />
                </span>
              ) : (
                <Button
                  variant={page === currentPage ? 'primary' : 'outline'}
                  size={size}
                  onClick={() => handlePageChange(page as number)}
                  disabled={disabled}
                  className={cn(sizeClasses[size])}
                  aria-label={`Sayfa ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}

          {/* Next button */}
          <Button
            variant="outline"
            size={size}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={disabled || currentPage === totalPages}
            className={cn(sizeClasses[size])}
            aria-label="Sonraki sayfa"
          >
            <ChevronRight className={iconSizeClasses[size]} />
          </Button>
        </div>

        {/* Quick jumper */}
        {showQuickJumper && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Git:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              disabled={disabled}
              className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const page = parseInt(e.currentTarget.value);
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                    e.currentTarget.value = '';
                  }
                }
              }}
              placeholder="Sayfa"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Mobile-optimized pagination component
interface MobilePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  showTotal?: boolean;
  total?: number;
  className?: string;
}

export function MobilePagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  showTotal = true,
  total = 0,
  className,
}: MobilePaginationProps) {
  const handlePageChange = (page: number) => {
    if (disabled || page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    onPageChange(page);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Total and page info */}
      {showTotal && total > 0 && (
        <div className="text-center text-sm text-gray-600">
          <span className="font-medium">{total.toLocaleString()}</span> sonuç
          <span className="mx-2">•</span>
          Sayfa {currentPage} / {totalPages}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className="max-w-24 flex-1"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Önceki
        </Button>

        <div className="flex items-center gap-1">
          {/* Show current page and nearby pages */}
          {currentPage > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={disabled}
              className="h-8 w-8 p-0"
            >
              {currentPage - 1}
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            disabled={disabled}
            className="h-8 w-8 p-0"
            aria-current="page"
          >
            {currentPage}
          </Button>

          {currentPage < totalPages && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={disabled}
              className="h-8 w-8 p-0"
            >
              {currentPage + 1}
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className="max-w-24 flex-1"
        >
          Sonraki
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {/* Jump to first/last for longer pagination */}
      {totalPages > 5 && (
        <div className="flex justify-center gap-2">
          {currentPage > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={disabled}
              className="text-xs"
            >
              İlk Sayfa
            </Button>
          )}
          {currentPage < totalPages - 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={disabled}
              className="text-xs"
            >
              Son Sayfa
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
