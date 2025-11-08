/**
 * ================================================
 * ADMIN WALLET TRANSACTIONS PAGE
 * ================================================
 * Admin interface for viewing and managing all wallet transactions
 *
 * Route: /admin/wallets/transactions
 * Sprint 1 - Day 1: Route consolidated from /admin/wallet -> /admin/wallets
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
import logger from '@/lib/infrastructure/monitoring/logger';
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
import { formatCurrency } from '@/lib/shared/formatters';
import { cn } from '@/lib/utils';
import { AdvancedTransactionFilters } from '@/components/domains/wallet';
import type { TransactionFiltersState } from '@/components/domains/wallet/core/AdvancedTransactionFilters';
import {
  walletAdminApi,
  type TransactionResponse,
} from '@/lib/api/admin/wallet-admin-api';

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
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
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
        const apiFilter = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: filters.types?.[0] as any, // Backend supports specific transaction types
          startDate: filters.startDate,
          endDate: filters.endDate,
          minAmount: filters.minAmount,
          maxAmount: filters.maxAmount,
          page,
          size: 20,
        };

        // Fetch transactions from backend
        const response = await walletAdminApi.getAllTransactions(apiFilter);

        setTransactions(response.content);
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          pageSize: response.pageSize,
          totalElements: response.totalElements,
          hasNext: !response.last,
          hasPrevious: !response.first,
        });

        // Calculate stats from response
        const income = response.content
          .filter((t) => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0);
        const expenses = response.content
          .filter((t) => t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const uniqueWallets = new Set(response.content.map((t) => t.walletId))
          .size;

        setStats({
          totalTransactions: response.totalElements,
          totalIncome: income,
          totalExpenses: expenses,
          uniqueUsers: uniqueWallets,
        });
      } catch (err) {
        logger.error(
          'Failed to fetch wallet transactions',
          err instanceof Error ? err : new Error(String(err)),
          {
            component: 'AdminWalletTransactionsPage',
            action: 'fetchTransactions',
            page,
            filters,
          }
        );
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
      // Prepare headers with Turkish labels
      const headers = [
        'İşlem ID',
        'Cüzdan ID',
        'İşlem Tipi',
        'Tutar (₺)',
        'Önceki Bakiye (₺)',
        'Sonraki Bakiye (₺)',
        'Açıklama',
        'Ödeme Referansı',
        'Tarih',
      ];

      // Type labels in Turkish
      const typeLabels: Record<string, string> = {
        CREDIT: 'Ödeme Alındı',
        DEBIT: 'Ödeme Gönderildi',
        ESCROW_HOLD: 'Escrow Beklemede',
        ESCROW_RELEASE: 'Escrow Serbest Bırakıldı',
        COMMISSION: 'Komisyon',
        REFUND: 'İade',
        WITHDRAWAL: 'Para Çekimi',
        DEPOSIT: 'Para Yatırma',
        PAYOUT: 'Ödeme Talebi',
      };

      // Map transactions to CSV rows
      const rows = transactions.map((t) => [
        t.id,
        t.walletId,
        typeLabels[t.type] || t.type,
        t.amount.toFixed(2),
        t.balanceBefore.toFixed(2),
        t.balanceAfter.toFixed(2),
        t.description || '-',
        t.referenceId || t.paymentId || '-',
        new Date(t.createdAt).toLocaleString('tr-TR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      ]);

      // Escape CSV values properly
      const escapeCSV = (value: string): string => {
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // Create CSV content with BOM for Excel UTF-8 support
      const csvContent =
        '\uFEFF' +
        [
          headers.map(escapeCSV).join(','),
          ...rows.map((row) => row.map(escapeCSV).join(',')),
        ].join('\n');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `marifetbul_${format === 'excel' ? 'excel_' : ''}islemler_${timestamp}.csv`;

      // Download CSV
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;',
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      logger.error(
        'Failed to export transactions',
        err instanceof Error ? err : new Error(String(err)),
        {
          component: 'AdminWalletTransactionsPage',
          action: 'handleExport',
          format,
        }
      );
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
                              {formatCurrency(transaction.amount)}
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
