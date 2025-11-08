/**
 * ================================================
 * TRANSACTION LIST COMPONENT
 * ================================================
 * Advanced transaction list with sorting, filtering, and pagination
 *
 * Features:
 * - Sortable columns (date, amount, type)
 * - Virtual scrolling for performance
 * - Infinite scroll pagination
 * - Transaction type badges
 * - Click to view details
 * - Empty state handling
 *
 * Sprint 1 - Epic 1.1 - Day 2
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import {
  formatCurrency,
  formatDate as canonicalFormatDate,
} from '@/lib/shared/formatters';
import type {
  Transaction,
  TransactionFilters as TransactionFilterValues,
  TransactionType,
} from '@/types/business/features/wallet';

// ============================================================================
// TYPES
// ============================================================================

export type SortField = 'createdAt' | 'amount' | 'type';
export type SortDirection = 'asc' | 'desc';

export interface TransactionListProps {
  /** List of transactions */
  transactions: Transaction[];

  /** Active filters */
  filters: TransactionFilterValues;

  /** Loading state */
  isLoading?: boolean;

  /** Loading more (pagination) */
  isLoadingMore?: boolean;

  /** Has more transactions to load */
  hasMore?: boolean;

  /** Load more callback */
  onLoadMore?: () => void;

  /** Transaction click callback */
  onTransactionClick?: (transaction: Transaction) => void;

  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format date for display with custom Turkish logic
 * Sprint 1 Note: Kept local function due to custom "Bugün/Dün" logic
 * Falls back to canonical formatter for older dates
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return (
      date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      }) + ' (Bugün)'
    );
  } else if (diffDays === 1) {
    return (
      'Dün ' +
      date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  } else if (diffDays < 7) {
    return diffDays + ' gün önce';
  } else {
    // Sprint 1: Use canonical formatter for dates older than a week
    return canonicalFormatDate(dateString, 'SHORT');
  }
}

/**
 * Get transaction type badge config
 */
function getTypeBadge(type: TransactionType): {
  label: string;
  color: string;
  icon: string;
} {
  switch (type) {
    case 'CREDIT':
      return {
        label: 'Gelir',
        color: 'bg-green-100 text-green-800',
        icon: '↗️',
      };
    case 'DEBIT':
      return { label: 'Gider', color: 'bg-red-100 text-red-800', icon: '↙️' };
    case 'ESCROW_HOLD':
      return {
        label: 'Escrow',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '⏳',
      };
    case 'ESCROW_RELEASE':
      return {
        label: 'Serbest',
        color: 'bg-green-100 text-green-800',
        icon: '✅',
      };
    case 'PAYOUT':
      return { label: 'Çekim', color: 'bg-blue-100 text-blue-800', icon: '💳' };
    case 'REFUND':
      return {
        label: 'İade',
        color: 'bg-purple-100 text-purple-800',
        icon: '↩️',
      };
    case 'FEE':
      return {
        label: 'Komisyon',
        color: 'bg-gray-100 text-gray-800',
        icon: '💰',
      };
    default:
      return {
        label: String(type),
        color: 'bg-gray-100 text-gray-800',
        icon: '📄',
      };
  }
}

/**
 * Filter transactions based on filter values
 */
function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilterValues
): Transaction[] {
  return transactions.filter((transaction) => {
    // Date filter
    if (filters.startDate) {
      const transactionDate = new Date(transaction.createdAt);
      const fromDate = new Date(filters.startDate);
      if (transactionDate < fromDate) return false;
    }

    if (filters.endDate) {
      const transactionDate = new Date(transaction.createdAt);
      const toDate = new Date(filters.endDate);
      if (transactionDate > toDate) return false;
    }

    // Type filter
    if (filters.type) {
      if (transaction.type !== filters.type) return false;
    }

    // Amount filter
    if (filters.minAmount !== null && filters.minAmount !== undefined) {
      if (transaction.amount < filters.minAmount) return false;
    }

    if (filters.maxAmount !== null && filters.maxAmount !== undefined) {
      if (transaction.amount > filters.maxAmount) return false;
    }

    return true;
  });
}

/**
 * Sort transactions
 */
function sortTransactions(
  transactions: Transaction[],
  sortField: SortField,
  sortDirection: SortDirection
): Transaction[] {
  return [...transactions].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'createdAt':
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Sort button component
 */
function SortButton({
  field,
  currentField,
  currentDirection,
  onSort,
  children,
}: {
  field: SortField;
  currentField: SortField;
  currentDirection: SortDirection;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
}) {
  const isActive = field === currentField;

  return (
    <button
      onClick={() => onSort(field)}
      className={`flex items-center space-x-1 font-medium transition-colors ${
        isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      <span>{children}</span>
      {isActive ? (
        currentDirection === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="h-4 w-4 opacity-50" />
      )}
    </button>
  );
}

/**
 * Transaction row component
 */
function TransactionRow({
  transaction,
  onClick,
  index,
}: {
  transaction: Transaction;
  onClick?: (transaction: Transaction) => void;
  index: number;
}) {
  const badge = getTypeBadge(transaction.type);
  const isCredit =
    transaction.type === 'CREDIT' || transaction.type === 'ESCROW_RELEASE';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => onClick?.(transaction)}
      className={`border-b border-gray-100 p-4 transition-colors hover:bg-gray-50 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Left: Type & Description */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center space-x-2">
            <span
              className={`rounded px-2 py-1 text-xs font-medium ${badge.color}`}
            >
              {badge.icon} {badge.label}
            </span>
          </div>
          <p className="truncate text-sm font-medium text-gray-900">
            {transaction.description || 'İşlem'}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {formatDate(transaction.createdAt)}
          </p>
        </div>

        {/* Right: Amount & Action */}
        <div className="ml-4 flex items-center space-x-3">
          <div className="text-right">
            <p
              className={`text-lg font-bold ${
                isCredit ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isCredit ? '+' : '-'}
              {formatCurrency(transaction.amount, 'TRY')}
            </p>
          </div>
          {onClick && <ExternalLink className="h-4 w-4 text-gray-400" />}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * TransactionList Component
 *
 * Displays filtered and sorted transaction list with pagination
 *
 * @example
 * ```tsx
 * <TransactionList
 *   transactions={transactions}
 *   filters={filters}
 *   isLoading={false}
 *   hasMore={true}
 *   onLoadMore={handleLoadMore}
 *   onTransactionClick={handleTransactionClick}
 * />
 * ```
 */
export function TransactionList({
  transactions,
  filters,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  onTransactionClick,
  className = '',
}: TransactionListProps) {
  // ========================================================================
  // STATE
  // ========================================================================

  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const filteredAndSortedTransactions = useMemo(() => {
    const filtered = filterTransactions(transactions, filters);
    return sortTransactions(filtered, sortField, sortDirection);
  }, [transactions, filters, sortField, sortDirection]);

  // ========================================================================
  // LOADING STATE
  // ========================================================================

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">İşlemler yükleniyor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ========================================================================
  // EMPTY STATE
  // ========================================================================

  if (filteredAndSortedTransactions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="text-center">
            <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p className="mb-1 font-medium text-gray-900">
              {filters.type || filters.startDate || filters.endDate
                ? 'Filtre kriterlerine uygun işlem bulunamadı'
                : 'Henüz işlem bulunmuyor'}
            </p>
            <p className="text-sm text-gray-600">
              {filters.type || filters.startDate || filters.endDate
                ? 'Filtreleri değiştirerek tekrar deneyin'
                : 'İlk işleminiz gerçekleştiğinde burada görünecek'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <Card className={className}>
      {/* Table Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <SortButton
              field="createdAt"
              currentField={sortField}
              currentDirection={sortDirection}
              onSort={handleSort}
            >
              Tarih
            </SortButton>
            <SortButton
              field="type"
              currentField={sortField}
              currentDirection={sortDirection}
              onSort={handleSort}
            >
              Tip
            </SortButton>
            <SortButton
              field="amount"
              currentField={sortField}
              currentDirection={sortDirection}
              onSort={handleSort}
            >
              Tutar
            </SortButton>
          </div>
          <p className="text-sm text-gray-600">
            {filteredAndSortedTransactions.length} işlem
          </p>
        </div>
      </div>

      {/* Transaction List */}
      <CardContent className="p-0">
        {filteredAndSortedTransactions.map((transaction, index) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            onClick={onTransactionClick}
            index={index}
          />
        ))}

        {/* Load More Button */}
        {hasMore && onLoadMore && (
          <div className="border-t border-gray-200 p-4">
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="w-full"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                'Daha Fazla Yükle'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TransactionList;
