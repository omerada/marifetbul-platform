'use client';

import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketplacePaginationProps {
  mode: 'jobs' | 'packages';
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export function MarketplacePagination({
  pagination,
  onPageChange,
}: MarketplacePaginationProps) {
  const { page, totalPages } = pagination;

  // Calculate which pages to show
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page Numbers */}
      {visiblePages.map((pageNum, index) => {
        if (pageNum === '...') {
          return (
            <span key={`dots-${index}`} className="px-2">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </span>
          );
        }

        const isCurrentPage = pageNum === page;

        return (
          <Button
            key={pageNum}
            variant={isCurrentPage ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onPageChange(Number(pageNum))}
            className={cn(
              'h-10 min-w-[2.5rem]',
              isCurrentPage && 'pointer-events-none'
            )}
          >
            {pageNum}
          </Button>
        );
      })}

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Page Info */}
      <span className="ml-4 text-sm text-gray-500">
        Sayfa {page} / {totalPages}
      </span>
    </div>
  );
}
