/**
 * TablePagination Component
 *
 * Pagination controls for user table
 */

'use client';

import React from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card, CardContent } from '@/components/ui/Card';
import { ChevronRight } from 'lucide-react';
import { TablePaginationProps } from '../types/userTableTypes';
import { generatePageNumbers } from '../utils/userTableHelpers';

export function TablePagination({
  pagination,
  onPageChange,
  isLoading,
}: TablePaginationProps) {
  const pageNumbers = generatePageNumbers(
    pagination.currentPage,
    pagination.totalPages
  );

  const startItem = (pagination.currentPage - 1) * pagination.pageSize + 1;
  const endItem = Math.min(
    pagination.currentPage * pagination.pageSize,
    pagination.total
  );

  return (
    <Card className="border-0 bg-gradient-to-r from-white to-gray-50 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          {/* Items Info */}
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{startItem}</span> -{' '}
            <span className="font-medium text-gray-900">{endItem}</span>{' '}
            arasında{' '}
            <span className="font-medium text-gray-900">
              {pagination.total}
            </span>{' '}
            kullanıcı gösteriliyor
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center space-x-3">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1 || isLoading}
              className="border-gray-300 hover:border-blue-300 hover:bg-blue-50"
            >
              <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
              Önceki
            </Button>

            {/* Page Number Buttons */}
            <div className="flex items-center space-x-2">
              {pageNumbers.map((page) => (
                <Button
                  key={page}
                  variant={
                    page === pagination.currentPage ? 'primary' : 'outline'
                  }
                  size="sm"
                  onClick={() => onPageChange(page)}
                  disabled={isLoading}
                  className={
                    page === pagination.currentPage
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 hover:border-blue-300'
                  }
                >
                  {page}
                </Button>
              ))}
            </div>

            {/* Next Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={
                pagination.currentPage === pagination.totalPages || isLoading
              }
              className="border-gray-300 hover:border-blue-300 hover:bg-blue-50"
            >
              Sonraki
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
