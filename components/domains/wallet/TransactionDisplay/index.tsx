'use client';

/**
 * ================================================
 * TRANSACTION DISPLAY - Unified Component
 * ================================================
 * Consolidated transaction display component with multiple view modes
 *
 * Features:
 * - Three view modes: table, list, card
 * - Advanced filters
 * - Pagination
 * - Export functionality
 * - Responsive design
 * - Loading states
 *
 * @author MarifetBul Development Team
 * @version 3.0.0 - Sprint Consolidation
 * @replaces TransactionHistory, TransactionTable, TransactionList
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/loading';
import type {
  Transaction,
  TransactionFilters,
} from '@/types/business/features/wallet';
import logger from '@/lib/infrastructure/monitoring/logger';

import { TableView } from './TableView';
import { ListView } from './ListView';
import { CardView } from './CardView';
import { TransactionToolbar } from './Toolbar';
import { UnifiedTransactionFilters } from '../core/UnifiedTransactionFilters';

// ================================================
// TYPES
// ================================================

export type ViewMode = 'table' | 'list' | 'card';

export interface TransactionDisplayProps {
  /** Array of transactions to display */
  transactions: Transaction[];

  /** View mode - defaults to 'table' on desktop, 'card' on mobile */
  viewMode?: ViewMode;

  /** Allow view mode switching */
  allowViewModeChange?: boolean;

  /** Loading state */
  isLoading?: boolean;

  /** Error message */
  error?: string | null;

  /** Total count for pagination */
  totalCount?: number;

  /** Current page (0-indexed) */
  currentPage?: number;

  /** Page size */
  pageSize?: number;

  /** Show filters panel */
  showFilters?: boolean;

  /** Show export button */
  showExport?: boolean;

  /** Show refresh button */
  showRefresh?: boolean;

  /** Show pagination */
  showPagination?: boolean;

  /** Enable transaction click */
  onTransactionClick?: (transaction: Transaction) => void;

  /** Page change handler */
  onPageChange?: (page: number) => void;

  /** Filter change handler */
  onFilterChange?: (filters: TransactionFilters) => void;

  /** Export handler */
  onExport?: (format: 'CSV' | 'EXCEL') => void;

  /** Refresh handler */
  onRefresh?: () => void;

  /** Empty state message */
  emptyMessage?: string;

  /** Custom className */
  className?: string;
}

// ================================================
// MAIN COMPONENT
// ================================================

export function TransactionDisplay({
  transactions,
  viewMode: initialViewMode,
  allowViewModeChange = true,
  isLoading = false,
  error = null,
  totalCount,
  currentPage = 0,
  pageSize = 20,
  showFilters = true,
  showExport = true,
  showRefresh = true,
  showPagination = true,
  onTransactionClick,
  onPageChange,
  onFilterChange,
  onExport,
  onRefresh,
  emptyMessage = 'İşlem bulunamadı',
  className,
}: TransactionDisplayProps) {
  // Auto-detect view mode based on screen size
  const [viewMode, setViewMode] = useState<ViewMode>(
    initialViewMode ||
      (typeof window !== 'undefined' && window.innerWidth < 768
        ? 'card'
        : 'table')
  );

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({});

  // Handle filter changes
  const handleFilterChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  // Handle filter clear
  const handleFilterClear = () => {
    setFilters({});
    onFilterChange?.({});
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={className}>
        <SkeletonCard />
        <div className="mt-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={`border-red-200 bg-red-50 p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p className="font-semibold">Hata</p>
          <p className="text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  // Empty state
  if (!transactions || transactions.length === 0) {
    return (
      <Card className={`p-12 text-center ${className}`}>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Toolbar */}
      <TransactionToolbar
        viewMode={viewMode}
        onViewModeChange={allowViewModeChange ? setViewMode : undefined}
        showFilters={showFilters}
        showExport={showExport}
        showRefresh={showRefresh}
        filtersOpen={filtersOpen}
        onFiltersToggle={() => setFiltersOpen(!filtersOpen)}
        onExport={onExport}
        onRefresh={onRefresh}
      />

      {/* Filters Panel */}
      {showFilters && filtersOpen && (
        <div className="mb-4">
          <UnifiedTransactionFilters
            variant="advanced"
            filters={filters}
            onFiltersChange={handleFilterChange}
            onClear={handleFilterClear}
            totalCount={totalCount}
            filteredCount={transactions.length}
            defaultExpanded={filtersOpen}
          />
        </div>
      )}

      {/* Transaction View */}
      <div className="mt-4">
        {viewMode === 'table' && (
          <TableView
            transactions={transactions}
            onTransactionClick={onTransactionClick}
          />
        )}

        {viewMode === 'list' && (
          <ListView
            transactions={transactions}
            onTransactionClick={onTransactionClick}
          />
        )}

        {viewMode === 'card' && (
          <CardView
            transactions={transactions}
            onTransactionClick={onTransactionClick}
          />
        )}
      </div>

      {/* Pagination */}
      {showPagination && totalCount && totalCount > pageSize && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {totalCount} işlemden {currentPage * pageSize + 1}-
            {Math.min((currentPage + 1) * pageSize, totalCount)} arası
            gösteriliyor
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 0}
              className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              Önceki
            </button>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={(currentPage + 1) * pageSize >= totalCount}
              className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export child components for direct use if needed
export { TableView } from './TableView';
export { ListView } from './ListView';
export { CardView } from './CardView';
export { TransactionToolbar } from './Toolbar';

// Re-export types
export type {
  Transaction,
  TransactionFilters as TransactionFiltersType,
} from '@/types/business/features/wallet';
