/**
 * ================================================
 * ADMIN WALLET TRANSACTIONS PAGE
 * ================================================
 * Admin page for viewing and managing all wallet transactions
 *
 * Route: /admin/wallet/transactions
 * Features:
 * - View all transactions across users
 * - Advanced filtering (user, type, date, amount)
 * - Export to CSV/Excel
 * - Transaction details modal
 * - User wallet quick view
 * - Real-time statistics
 *
 * Sprint Day 6 - Wallet Admin Pages
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Search,
  Activity,
  Users,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button, Input } from '@/components/ui';
import { formatCurrency } from '@/lib/shared/utils/format';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/lib/api/validators';

// ============================================================================
// TYPES
// ============================================================================

interface TransactionStats {
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  uniqueUsers: number;
}

interface TransactionFilters {
  userId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
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
  // Add more mock data as needed
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminWalletTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(
    MOCK_TRANSACTIONS
  );
  const [stats] = useState<TransactionStats>(MOCK_STATS);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch transactions with filters
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const data = await adminWalletApi.getAllTransactions(filters);
      // setTransactions(data.content);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTransactions(MOCK_TRANSACTIONS);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Export transactions
  const handleExport = async (_format: 'csv' | 'excel') => {
    try {
      // TODO: Implement export functionality
      alert('Export functionality coming soon');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Get transaction type badge color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CREDIT':
      case 'ESCROW_RELEASE':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'DEBIT':
      case 'PAYOUT':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'ESCROW_HOLD':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'COMMISSION':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  // Get transaction type label
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CREDIT: 'Para Yükleme',
      DEBIT: 'Para Çekme',
      ESCROW_HOLD: 'Emanet Tutma',
      ESCROW_RELEASE: 'Emanet Serbest Bırakma',
      PAYOUT: 'Ödeme',
      COMMISSION: 'Komisyon',
      REFUND: 'İade',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Cüzdan İşlemleri
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Tüm kullanıcıların cüzdan işlemlerini görüntüleyin ve analiz edin
          </p>
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

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Kullanıcı ID, işlem ID veya açıklama ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <Button
                variant={showFilters ? 'primary' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtrele
              </Button>

              {/* Export */}
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Dışa Aktar
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                {/* Transaction Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    İşlem Tipi
                  </label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, type: e.target.value || undefined })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  >
                    <option value="">Tümü</option>
                    <option value="CREDIT">Para Yükleme</option>
                    <option value="DEBIT">Para Çekme</option>
                    <option value="ESCROW_HOLD">Emanet Tutma</option>
                    <option value="ESCROW_RELEASE">Emanet Serbest Bırakma</option>
                    <option value="PAYOUT">Ödeme</option>
                    <option value="COMMISSION">Komisyon</option>
                    <option value="REFUND">İade</option>
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Başlangıç Tarihi
                  </label>
                  <Input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bitiş Tarihi
                  </label>
                  <Input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
                    }
                  />
                </div>

                {/* Amount Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Tutar (₺)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minAmount || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        minAmount: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Tutar (₺)
                  </label>
                  <Input
                    type="number"
                    placeholder="∞"
                    value={filters.maxAmount || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        maxAmount: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>

                {/* Actions */}
                <div className="flex items-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({})}
                    className="flex-1"
                  >
                    Temizle
                  </Button>
                  <Button onClick={fetchTransactions} className="flex-1">
                    Uygula
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tip
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tutar
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Açıklama
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white font-mono">
                          {transaction.id.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
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
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          {transaction.description}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.createdAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
