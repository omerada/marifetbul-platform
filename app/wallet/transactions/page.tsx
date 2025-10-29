/**
 * ================================================
 * TRANSACTION HISTORY PAGE
 * ================================================
 * Transaction history using new TransactionHistory component
 *
 * Features:
 * - Advanced filtering (type, date range, amount)
 * - Real-time search
 * - Pagination
 * - Export to CSV/Excel
 * - Responsive design
 * - Uses centralized formatters
 *
 * Route: /wallet/transactions
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 1 (Refactored)
 */

'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wallet as WalletIcon } from 'lucide-react';
import Button from '@/components/ui/UnifiedButton';
import {
  useTransactions,
  useWalletActions,
  useWalletUI,
} from '@/stores/walletStore';
import { TransactionHistory } from '@/components/wallet/TransactionHistory';
import type {
  Transaction,
  TransactionFilters,
} from '@/types/business/features/wallet';

/**
 * Transaction History Page Component
 *
 * Displays comprehensive transaction history with:
 * - Advanced filters (type, date range, amount)
 * - Real-time search
 * - Pagination
 * - Export functionality
 */
export default function TransactionHistoryPage() {
  const router = useRouter();
  const storeTransactions = useTransactions();
  const { fetchTransactions, exportTransactions } = useWalletActions();
  const { isLoadingTransactions, error } = useWalletUI();

  // Fetch transactions on mount
  useEffect(() => {
    fetchTransactions({}, 0);
  }, [fetchTransactions]);

  // Adapt transactions to expected type
  const adaptedTransactions = useMemo((): Transaction[] => {
    return storeTransactions.map((t) => ({
      id: t.id,
      walletId: t.walletId,
      type: t.type as unknown as import('@/types/business/features/wallet').TransactionType,
      amount: t.amount,
      currency: 'TRY',
      description: t.description,
      relatedEntityType: t.referenceId ? ('ORDER' as const) : undefined,
      relatedEntityId: t.referenceId,
      balanceAfter: t.balanceAfter,
      createdAt: t.createdAt,
      metadata: {},
    }));
  }, [storeTransactions]);

  // Handle filter changes
  const handleFilterChange = (filters: TransactionFilters) => {
    fetchTransactions(filters, 0);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchTransactions({}, page);
  };

  // Handle export
  const handleExport = async (format: 'CSV' | 'EXCEL') => {
    try {
      const blob = await exportTransactions({
        format,
        dateRange: {
          startDate: '',
          endDate: '',
        },
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const extension = format === 'CSV' ? 'csv' : 'xlsx';
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchTransactions({}, 0);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <WalletIcon className="text-primary h-8 w-8" />
              İşlem Geçmişi
            </h1>
            <p className="text-muted-foreground mt-1">
              Tüm cüzdan işlemlerinizi görüntüleyin ve yönetin
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History Component */}
      <TransactionHistory
        transactions={adaptedTransactions}
        isLoading={isLoadingTransactions}
        error={error}
        totalCount={storeTransactions.length}
        currentPage={0}
        pageSize={20}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        onExport={handleExport}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
