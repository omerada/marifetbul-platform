/**
 * ================================================
 * ADMIN WALLET TRANSACTIONS PAGE
 * ================================================
 * Admin page for viewing and managing all wallet transactions
 *
 * Route: /admin/wallet/transactions
 * Features:
 * - View all transactions across users with real-time data
 * - Advanced filtering with AdvancedTransactionFilters component
 * - Export to CSV/Excel
 * - Transaction details modal
 * - Real-time statistics from backend
 * - Pagination support
 *
 * Sprint Day 7 - Transaction Filters & Search
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Activity,
  Users,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/shared/utils/format';
import { cn } from '@/lib/utils';
import type {
  Transaction,
  TransactionFilter,
  PaginatedTransactionResponse,
} from '@/lib/api/validators';
import { AdvancedTransactionFilters } from '@/components/wallet/AdvancedTransactionFilters';
import type { TransactionFiltersState } from '@/components/wallet/AdvancedTransactionFilters';

// ============================================================================
// TYPES
// ============================================================================

interface TransactionStats {
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  uniqueUsers: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminWalletTransactionsPage() {
  // ==================== STATE ====================
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    totalTransactions: 0,
    totalIncome: 0,
    totalExpenses: 0,
    uniqueUsers: 0,
  });
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }>({
    currentPage: 0,
    totalPages: 0,
    pageSize: 20,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false,
  });

  const [filters, setFilters] = useState<TransactionFiltersState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== FETCH DATA ====================

  /**
   * Fetch transactions with filters
   */
  const fetchTransactions = useCallback(
    async (page: number = 0) => {
      setIsLoading(true);
      setError(null);

      try {
        // Build API filter from UI filters
        const _apiFilter: TransactionFilter = {
          page,
          size: 20,
          type: filters.types?.[0], // API supports single type for now
          startDate: filters.startDate,
          endDate: filters.endDate,
          minAmount: filters.minAmount,
          maxAmount: filters.maxAmount,
          search: filters.search,
        };

        // TODO: Replace with actual API call when admin wallet API is ready
        // const response = await adminWalletApi.getAllTransactions(_apiFilter);
        // setTransactions(response.content);
        // setPagination({...});

        // Mock API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock response
        const mockResponse: PaginatedTransactionResponse = {
          content: MOCK_TRANSACTIONS,
          totalElements: 1247,
          totalPages: 63,
          currentPage: page,
          pageSize: 20,
          hasNext: page < 62,
          hasPrevious: page > 0,
          isFirst: page === 0,
          isLast: page === 62,
        };

        setTransactions(mockResponse.content);
        setPagination({
          currentPage: mockResponse.currentPage,
          totalPages: mockResponse.totalPages,
          pageSize: mockResponse.pageSize,
          totalElements: mockResponse.totalElements,
          hasNext: mockResponse.hasNext,
          hasPrevious: mockResponse.hasPrevious,
        });

        // Update stats (in real app, fetch from analytics endpoint)
        setStats(MOCK_STATS);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        setError(
          'İşlemler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchTransactions(0);
  }, [fetchTransactions]);

  // ==================== HANDLERS ====================

  /**
   * Handle filter changes
   */
  const handleFiltersChange = (newFilters: TransactionFiltersState) => {
    setFilters(newFilters);
  };

  /**
   * Handle filter clear
   */
  const handleClearFilters = () => {
    setFilters({});
  };

  /**
   * Handle page change
   */
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchTransactions(newPage);
    }
  };

  /**
   * Export transactions
   */
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      // TODO: Implement export functionality
      // const blob = await adminWalletApi.exportTransactions(filters, format);
      // downloadBlob(blob, `transactions-${Date.now()}.${format}`);
      alert(`Export to ${format.toUpperCase()} coming soon`);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export işlemi başarısız oldu.');
    }
  };

  /**
   * Refresh data
   */
  const handleRefresh = () => {
    fetchTransactions(pagination.currentPage);
  };

  // ==================== HELPERS ====================

  /**
   * Get transaction type badge color
   */
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CREDIT':
      case 'ESCROW_RELEASE':
        return 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/30 dark:border-green-800';
      case 'DEBIT':
      case 'PAYOUT':
        return 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800';
      case 'ESCROW_HOLD':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-800';
      case 'COMMISSION':
        return 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-900/30 dark:border-purple-800';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  /**
   * Get transaction type label
   */
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CREDIT: 'Para Yükleme',
      DEBIT: 'Para Çekme',
      ESCROW_HOLD: 'Emanet Tutma',
      ESCROW_RELEASE: 'Emanet Serbest',
      PAYOUT: 'Ödeme',
      COMMISSION: 'Komisyon',
      REFUND: 'İade',
    };
    return labels[type] || type;
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Cüzdan İşlemleri
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Tüm kullanıcıların cüzdan işlemlerini görüntüleyin ve analiz edin
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            Yenile
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Toplam İşlem
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalTransactions.toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Income */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Toplam Gelir
                    </p>
                    <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(stats.totalIncome, 'TRY')}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <ArrowUpRight className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Expenses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Toplam Gider
                    </p>
                    <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(stats.totalExpenses, 'TRY')}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <ArrowDownRight className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Unique Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Aktif Kullanıcı
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.uniqueUsers.toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Advanced Filters */}
        <div className="mb-6">
          <AdvancedTransactionFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClear={handleClearFilters}
          />
        </div>

        {/* Export Actions */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {pagination.totalElements.toLocaleString('tr-TR')} işlem bulundu
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
              className="gap-2"
              size="sm"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('excel')}
              className="gap-2"
              size="sm"
            >
              <Download className="h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>İşlem Geçmişi</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                İşlem bulunamadı
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                          Tip
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                          Tutar
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                          Açıklama
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                          Tarih
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {transactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="px-4 py-4 font-mono text-sm text-gray-900 dark:text-white">
                            {transaction.id.slice(0, 8)}...
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                                getTypeColor(transaction.type)
                              )}
                            >
                              {getTypeLabel(transaction.type)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                'text-sm font-semibold',
                                transaction.amount >= 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              )}
                            >
                              {transaction.amount >= 0 ? '+' : ''}
                              {formatCurrency(
                                transaction.amount,
                                transaction.currency
                              )}
                            </span>
                          </td>
                          <td className="max-w-xs truncate px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {transaction.description}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(transaction.createdAt).toLocaleDateString(
                              'tr-TR',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <Button variant="ghost" size="sm">
                              Detay
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Sayfa {pagination.currentPage + 1} /{' '}
                      {pagination.totalPages}
                      {' • '}
                      {pagination.totalElements.toLocaleString('tr-TR')} toplam
                      işlem
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={!pagination.hasPrevious || isLoading}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Önceki
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={!pagination.hasNext || isLoading}
                        className="gap-1"
                      >
                        Sonraki
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// MOCK DATA (Replace with API calls)
// ============================================================================

const MOCK_STATS: TransactionStats = {
  totalTransactions: 1247,
  totalIncome: 125430.5,
  totalExpenses: 78920.75,
  uniqueUsers: 342,
};

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    walletId: 'wallet-1',
    type: 'CREDIT',
    amount: 500.0,
    currency: 'TRY',
    balanceBefore: 1000.0,
    balanceAfter: 1500.0,
    description: 'Order #1234 completed',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    walletId: 'wallet-2',
    type: 'DEBIT',
    amount: -250.0,
    currency: 'TRY',
    balanceBefore: 1500.0,
    balanceAfter: 1250.0,
    description: 'Withdrawal request',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    walletId: 'wallet-3',
    type: 'ESCROW_HOLD',
    amount: -300.0,
    currency: 'TRY',
    balanceBefore: 2000.0,
    balanceAfter: 1700.0,
    description: 'Escrow hold for Order #5678',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '4',
    walletId: 'wallet-4',
    type: 'COMMISSION',
    amount: -50.0,
    currency: 'TRY',
    balanceBefore: 1000.0,
    balanceAfter: 950.0,
    description: 'Platform commission',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: '5',
    walletId: 'wallet-5',
    type: 'ESCROW_RELEASE',
    amount: 300.0,
    currency: 'TRY',
    balanceBefore: 500.0,
    balanceAfter: 800.0,
    description: 'Escrow release for Order #5678',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
];
