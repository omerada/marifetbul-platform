/**
 * ================================================
 * TRANSACTION HISTORY PAGE
 * ================================================
 * Detailed transaction history with filters and pagination
 *
 * Features:
 * - Paginated transaction list
 * - Filter by type (CREDIT, DEBIT, etc.)
 * - Filter by date range
 * - Export to CSV
 * - Search by description
 *
 * Route: /wallet/transactions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useTransactions,
  useWalletActions,
  useWalletUI,
} from '@/stores/walletStore';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';
import {
  Loader2,
  Download,
  Filter,
  Search,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { formatCurrency } from '@/lib/shared/utils/format';
import type { TransactionType } from '@/types/business/features/wallet';

/**
 * Transaction History Page Component
 */
export default function TransactionHistoryPage() {
  const router = useRouter();
  const transactions = useTransactions();
  const { fetchTransactions, exportTransactions } = useWalletActions();
  const { isLoadingTransactions, error } = useWalletUI();

  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<{
    type?: TransactionType | 'ALL';
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }>({
    type: 'ALL',
    dateFrom: '',
    dateTo: '',
    search: '',
  });
  const [isExporting, setIsExporting] = useState(false);

  // Fetch transactions on mount and when page changes
  useEffect(() => {
    const filterParams =
      filters.type === 'ALL' ? {} : { type: filters.type as TransactionType };
    fetchTransactions(filterParams, page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportTransactions({
        format: 'CSV',
        dateRange: {
          startDate: filters.dateFrom || '',
          endDate: filters.dateTo || '',
        },
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setPage(0);
    const filterParams =
      filters.type === 'ALL' ? {} : { type: filters.type as TransactionType };
    fetchTransactions(filterParams, 0);
  };

  // Filter transactions by type and search
  const filteredTransactions = transactions.filter((tx) => {
    // Type filter
    if (filters.type !== 'ALL' && tx.type !== filters.type) {
      return false;
    }

    // Search filter
    if (
      filters.search &&
      !tx.description.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">İşlem Geçmişi</h1>
            <p className="text-muted-foreground mt-1">
              Tüm cüzdan işlemlerinizi görüntüleyin
            </p>
          </div>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting || transactions.length === 0}
          variant="outline"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Dışa Aktarılıyor...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              CSV İndir
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="text-muted-foreground h-4 w-4" />
          <h3 className="font-semibold">Filtreler</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Type Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium">İşlem Tipi</label>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  type: e.target.value as TransactionType | 'ALL',
                })
              }
              className="w-full rounded-lg border p-2"
            >
              <option value="ALL">Tümü</option>
              <option value="CREDIT">Gelen</option>
              <option value="DEBIT">Giden</option>
              <option value="PAYMENT_RECEIVED">Ödeme Alındı</option>
              <option value="PAYMENT_RELEASED">Ödeme Serbest Bırakıldı</option>
              <option value="PAYOUT_REQUESTED">Çekim Talep Edildi</option>
              <option value="PAYOUT_COMPLETED">Çekim Tamamlandı</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="mb-2 block text-sm font-medium">Başlangıç</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
              className="w-full rounded-lg border p-2"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="mb-2 block text-sm font-medium">Bitiş</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
              className="w-full rounded-lg border p-2"
            />
          </div>

          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-medium">Ara</label>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="İşlem açıklaması..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full rounded-lg border p-2 pl-10"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={handleSearch} size="sm">
            Filtrele
          </Button>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="p-6">
        {isLoadingTransactions && transactions.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-600">
            <p>{error}</p>
            <Button
              onClick={() => {
                const filterParams =
                  !filters.type || filters.type === 'ALL'
                    ? {}
                    : { type: filters.type };
                fetchTransactions(filterParams, page);
              }}
              className="mt-4"
              variant="outline"
            >
              Tekrar Dene
            </Button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center">
            <p>İşlem bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table Header */}
            <div className="text-muted-foreground hidden gap-4 border-b pb-3 text-sm font-semibold md:grid md:grid-cols-5">
              <div>Tarih</div>
              <div>Tip</div>
              <div>Açıklama</div>
              <div className="text-right">Tutar</div>
              <div className="text-right">Bakiye</div>
            </div>

            {/* Table Rows */}
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="hover:bg-muted/50 grid grid-cols-1 gap-4 rounded-lg border p-4 transition-colors md:grid-cols-5"
              >
                {/* Date */}
                <div>
                  <span className="text-muted-foreground text-xs font-semibold md:hidden">
                    Tarih:{' '}
                  </span>
                  <span className="text-sm">
                    {new Date(transaction.createdAt).toLocaleDateString(
                      'tr-TR',
                      {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }
                    )}
                  </span>
                  <div className="text-muted-foreground text-xs">
                    {new Date(transaction.createdAt).toLocaleTimeString(
                      'tr-TR',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <span className="text-muted-foreground text-xs font-semibold md:hidden">
                    Tip:{' '}
                  </span>
                  <div className="flex items-center gap-2">
                    {transaction.amount > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        transaction.amount > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <span className="text-muted-foreground text-xs font-semibold md:hidden">
                    Açıklama:{' '}
                  </span>
                  <span className="text-sm">{transaction.description}</span>
                </div>

                {/* Amount */}
                <div className="text-left md:text-right">
                  <span className="text-muted-foreground text-xs font-semibold md:hidden">
                    Tutar:{' '}
                  </span>
                  <span
                    className={`font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.amount > 0 ? '+' : ''}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>

                {/* Balance After */}
                <div className="text-left md:text-right">
                  <span className="text-muted-foreground text-xs font-semibold md:hidden">
                    Bakiye:{' '}
                  </span>
                  <span className="text-sm font-medium">
                    {formatCurrency(transaction.balanceAfter)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <Button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              variant="outline"
              size="sm"
            >
              Önceki
            </Button>
            <span className="text-muted-foreground text-sm">
              Sayfa {page + 1}
            </span>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={filteredTransactions.length < 20}
              variant="outline"
              size="sm"
            >
              Sonraki
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
