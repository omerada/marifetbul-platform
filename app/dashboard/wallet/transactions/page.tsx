'use client';

/**
 * ================================================
 * WALLET TRANSACTIONS PAGE
 * ================================================
 * Comprehensive transaction history page
 *
 * Route: /dashboard/wallet/transactions
 * Access: Authenticated Freelancers only
 *
 * Features:
 * - Full transaction history
 * - Advanced filtering (type, date range, amount)
 * - Multiple view modes (table, list, card)
 * - Export to CSV/PDF
 * - Pagination
 * - Search functionality
 * - Transaction details modal
 * - Real-time updates
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Task 1.2
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wallet, Download, RefreshCw, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { useWalletData } from '@/hooks/business/wallet/useWalletData';
import { TransactionDisplay } from '@/components/domains/wallet/TransactionDisplay';
import { UnifiedTransactionFilters } from '@/components/domains/wallet/core/UnifiedTransactionFilters';
import { exportTransactions } from '@/lib/utils/export-transactions';
import type {
  Transaction,
  TransactionFilters,
} from '@/types/business/features/wallet';

// ================================================
// CONSTANTS
// ================================================

const PAGE_SIZE = 20;

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Filter transactions based on criteria
 */
function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
  let filtered = [...transactions];

  // Filter by type
  if (filters.type) {
    filtered = filtered.filter((t) => t.type === filters.type);
  }

  // Filter by date range
  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    filtered = filtered.filter((t) => new Date(t.createdAt) >= startDate);
  }

  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    endDate.setHours(23, 59, 59, 999); // End of day
    filtered = filtered.filter((t) => new Date(t.createdAt) <= endDate);
  }

  // Filter by amount range
  if (filters.minAmount !== undefined) {
    filtered = filtered.filter((t) => t.amount >= filters.minAmount!);
  }

  if (filters.maxAmount !== undefined) {
    filtered = filtered.filter((t) => t.amount <= filters.maxAmount!);
  }

  return filtered;
}

/**
 * Paginate transactions
 */
function paginateTransactions(
  transactions: Transaction[],
  page: number,
  pageSize: number
): Transaction[] {
  const start = page * pageSize;
  const end = start + pageSize;
  return transactions.slice(start, end);
}

// ================================================
// MAIN COMPONENT
// ================================================

export default function WalletTransactionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const {
    transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useWalletData();

  // Manual refetch handler
  const refetch = () => {
    // Trigger manual refetch if needed
    window.location.reload();
  };

  const [filters, setFilters] = useState<TransactionFilters>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // Check auth and role
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (!authLoading && user?.role !== 'FREELANCER') {
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  // Apply filters and pagination
  const filteredTransactions = filterTransactions(
    (transactions || []) as Transaction[],
    filters
  );
  const paginatedTransactions = paginateTransactions(
    filteredTransactions,
    currentPage,
    PAGE_SIZE
  );
  const totalCount = filteredTransactions.length;

  // Handle filter changes
  const handleFilterChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setCurrentPage(0); // Reset to first page when filters change
  };

  // Handle filter clear
  const handleFilterClear = () => {
    setFilters({});
    setCurrentPage(0);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) return;

    setIsExporting(true);
    try {
      exportTransactions(filteredTransactions, 'csv');
    } catch (_error) {
      // CSV export failed - silent fail for user experience
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF
  const handleExportPDF = async () => {
    if (!filteredTransactions || filteredTransactions.length === 0) return;

    setIsExporting(true);
    try {
      await exportTransactions(filteredTransactions, 'pdf');
    } catch (_error) {
      // PDF export failed - silent fail for user experience
    } finally {
      setIsExporting(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // Loading state
  if (authLoading || transactionsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-6 h-8 w-64" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (transactionsError) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Card className="border-red-200 bg-red-50 p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-red-100 p-4">
              <Wallet className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              İşlemler Yüklenemedi
            </h2>
            <p className="mb-6 text-gray-600">
              {transactionsError?.message || 'Bir hata oluştu'}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Dashboard&apos;a Dön
              </Button>
              <Button onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Tekrar Dene
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/wallet')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cüzdana Dön
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">İşlem Geçmişi</h1>
          <p className="text-gray-600">
            Tüm cüzdan işlemlerinizi görüntüleyin ve dışa aktarın
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={transactionsLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${transactionsLoading ? 'animate-spin' : ''}`}
            />
            Yenile
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={
              isExporting ||
              !filteredTransactions ||
              filteredTransactions.length === 0
            }
          >
            <Download className="mr-2 h-4 w-4" />
            CSV İndir
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={
              isExporting ||
              !filteredTransactions ||
              filteredTransactions.length === 0
            }
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF İndir
          </Button>
          <Wallet className="h-12 w-12 text-blue-600" />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Toplam İşlem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Filtrelenmiş İşlem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {filteredTransactions.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Sayfa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.ceil(totalCount / PAGE_SIZE) || 1} / {currentPage + 1}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <UnifiedTransactionFilters
          variant="advanced"
          filters={filters}
          onFiltersChange={handleFilterChange}
          onClear={handleFilterClear}
          totalCount={transactions?.length || 0}
          filteredCount={filteredTransactions.length}
          defaultExpanded={false}
          syncWithUrl={true}
        />
      </div>

      {/* Transaction Display */}
      <TransactionDisplay
        transactions={paginatedTransactions}
        viewMode="table"
        allowViewModeChange={true}
        isLoading={transactionsLoading}
        error={transactionsError}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        showFilters={false} // Already shown above
        showExport={false} // Already in header
        showRefresh={false} // Already in header
        showPagination={true}
        onPageChange={handlePageChange}
        emptyMessage="Henüz işlem bulunmuyor"
      />

      {/* Empty State for Filtered Results */}
      {!transactionsLoading &&
        filteredTransactions.length === 0 &&
        transactions &&
        transactions.length > 0 && (
          <Card className="mt-6 border-yellow-200 bg-yellow-50 p-6">
            <div className="text-center">
              <p className="mb-2 font-semibold text-yellow-900">
                Filtrelere uygun işlem bulunamadı
              </p>
              <p className="mb-4 text-sm text-yellow-700">
                Farklı filtre seçenekleri deneyebilirsiniz
              </p>
              <Button variant="outline" onClick={handleFilterClear}>
                Filtreleri Temizle
              </Button>
            </div>
          </Card>
        )}
    </div>
  );
}
