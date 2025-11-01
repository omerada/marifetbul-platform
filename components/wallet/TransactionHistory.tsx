/**
 * ================================================
 * TRANSACTION HISTORY COMPONENT
 * ================================================
 * @deprecated Use TransactionDisplay from @/components/domains/wallet/TransactionDisplay instead
 * This component will be removed in a future version.
 *
 * Comprehensive transaction history with advanced features
 *
 * Features:
 * - Advanced filters (type, date range, amount range)
 * - Real-time search
 * - Pagination
 * - Export functionality (CSV, Excel)
 * - Transaction details modal
 * - Responsive design
 * - Loading states
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 1
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Download,
  Filter,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/loading';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from '@/lib/shared/formatters';
import { cn } from '@/lib/utils';
import type {
  Transaction,
  TransactionType,
  TransactionFilters,
} from '@/types/business/features/wallet';

// ============================================================================
// TYPES
// ============================================================================

export interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
  error?: string | null;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onFilterChange?: (filters: TransactionFilters) => void;
  onExport?: (format: 'CSV' | 'EXCEL') => void;
  onRefresh?: () => void;
  className?: string;
}

interface FiltersPanelProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

// ============================================================================
// TRANSACTION TYPE LABELS
// ============================================================================

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  CREDIT: 'Gelen Para',
  DEBIT: 'Giden Para',
  ESCROW_HOLD: 'Emanet Tutuldu',
  ESCROW_RELEASE: 'Emanet Serbest',
  PAYOUT: 'Para Çekme',
  REFUND: 'İade',
  FEE: 'Komisyon',
};

const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  CREDIT: 'text-green-600 bg-green-100',
  DEBIT: 'text-red-600 bg-red-100',
  ESCROW_HOLD: 'text-yellow-600 bg-yellow-100',
  ESCROW_RELEASE: 'text-blue-600 bg-blue-100',
  PAYOUT: 'text-purple-600 bg-purple-100',
  REFUND: 'text-orange-600 bg-orange-100',
  FEE: 'text-gray-600 bg-gray-100',
};

// ============================================================================
// FILTERS PANEL
// ============================================================================

function FiltersPanel({
  filters,
  onFiltersChange,
  onClear,
  isOpen,
  onToggle,
}: FiltersPanelProps) {
  if (!isOpen) {
    return (
      <Button variant="outline" onClick={onToggle} className="w-full sm:w-auto">
        <Filter className="mr-2 h-4 w-4" />
        Filtreler
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtreler
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Transaction Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">İşlem Tipi</label>
            <select
              value={filters.type || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  type: e.target.value as TransactionType | undefined,
                })
              }
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              <option value="">Tümü</option>
              {Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Başlangıç Tarihi</label>
            <div className="relative">
              <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, startDate: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-2 pl-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
          </div>

          {/* End Date Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Bitiş Tarihi</label>
            <div className="relative">
              <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, endDate: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-2 pl-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Amount Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tutar Aralığı</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount || ''}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      minAmount: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 p-2 pl-8 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
              <div className="relative flex-1">
                <DollarSign className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount || ''}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      maxAmount: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 p-2 pl-8 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClear}>
            Temizle
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// TRANSACTION CARD
// ============================================================================

interface TransactionCardProps {
  transaction: Transaction;
  onClick?: () => void;
}

function TransactionCard({ transaction, onClick }: TransactionCardProps) {
  const isCredit = transaction.amount > 0;
  const typeLabel = TRANSACTION_TYPE_LABELS[transaction.type];
  const typeColor = TRANSACTION_TYPE_COLORS[transaction.type];

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        onClick && 'cursor-pointer hover:scale-[1.01]'
      )}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Type and Description */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={cn('text-xs', typeColor)}>{typeLabel}</Badge>
              {transaction.relatedEntityType && (
                <Badge variant="outline" className="text-xs">
                  {transaction.relatedEntityType}
                </Badge>
              )}
            </div>
            <p className="font-medium">{transaction.description}</p>
            <p className="text-xs text-gray-500">
              {formatRelativeTime(transaction.createdAt)}
              <span className="mx-2">•</span>
              {formatDate(transaction.createdAt, 'DATETIME')}
            </p>
          </div>

          {/* Right side - Amount */}
          <div className="text-right">
            <p
              className={cn(
                'text-2xl font-bold',
                isCredit ? 'text-green-600' : 'text-red-600'
              )}
            >
              {isCredit ? '+' : ''}
              {formatCurrency(
                Math.abs(transaction.amount),
                transaction.currency
              )}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Bakiye:{' '}
              {formatCurrency(transaction.balanceAfter, transaction.currency)}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        {transaction.relatedEntityId && (
          <div className="mt-3 border-t pt-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FileText className="h-3 w-3" />
              Referans: {transaction.relatedEntityId}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TransactionHistory({
  transactions,
  isLoading = false,
  error,
  totalCount = 0,
  currentPage = 0,
  pageSize = 20,
  onPageChange,
  onFilterChange,
  onExport,
  onRefresh,
  className,
}: TransactionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filter transactions by search query
  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;

    const query = searchQuery.toLowerCase();
    return transactions.filter(
      (tx) =>
        tx.description.toLowerCase().includes(query) ||
        tx.id.toLowerCase().includes(query) ||
        tx.relatedEntityId?.toLowerCase().includes(query)
    );
  }, [transactions, searchQuery]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters: TransactionFilters) => {
      setFilters(newFilters);
      onFilterChange?.(newFilters);
    },
    [onFilterChange]
  );

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setFilters({});
    onFilterChange?.({});
  }, [onFilterChange]);

  // Handle export
  const handleExport = useCallback(
    async (format: 'CSV' | 'EXCEL') => {
      setIsExporting(true);
      try {
        await onExport?.(format);
      } finally {
        setIsExporting(false);
      }
    },
    [onExport]
  );

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

  // Loading state
  if (isLoading && transactions.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <SkeletonCard variant="default" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} variant="compact" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="font-semibold text-red-900">
              İşlem geçmişi yüklenemedi
            </p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            {onRefresh && (
              <Button onClick={onRefresh} className="mt-4" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Tekrar Dene
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with Search and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="İşlem ara (açıklama, ID, referans)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtreler
          </Button>

          {onExport && (
            <div className="group relative">
              <Button
                variant="outline"
                size="sm"
                disabled={isExporting || transactions.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? 'İndiriliyor...' : 'İndir'}
              </Button>
              <div className="absolute top-full right-0 z-10 mt-1 hidden w-32 rounded-lg border bg-white shadow-lg group-hover:block">
                <button
                  onClick={() => handleExport('CSV')}
                  className="w-full p-2 text-left text-sm hover:bg-gray-50"
                >
                  CSV Olarak
                </button>
                <button
                  onClick={() => handleExport('EXCEL')}
                  className="w-full p-2 text-left text-sm hover:bg-gray-50"
                >
                  Excel Olarak
                </button>
              </div>
            </div>
          )}

          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <FiltersPanel
        filters={filters}
        onFiltersChange={handleFilterChange}
        onClear={handleClearFilters}
        isOpen={isFiltersOpen}
        onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
      />

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalCount}</p>
              <p className="text-sm text-gray-600">Toplam İşlem</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {transactions.filter((t) => t.amount > 0).length}
              </p>
              <p className="text-sm text-gray-600">Gelen İşlem</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {transactions.filter((t) => t.amount < 0).length}
              </p>
              <p className="text-sm text-gray-600">Giden İşlem</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p className="mb-2">İşlem bulunamadı</p>
            {searchQuery && (
              <p className="text-sm">
                &quot;{searchQuery}&quot; için sonuç yok
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={!hasPrevPage}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Önceki
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Sayfa {currentPage + 1} / {totalPages}
                </span>
                <span className="text-xs text-gray-400">
                  ({totalCount} işlem)
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={!hasNextPage}
              >
                Sonraki
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TransactionHistory;
