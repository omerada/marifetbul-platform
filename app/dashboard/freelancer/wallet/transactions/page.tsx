/**
 * ================================================
 * TRANSACTIONS PAGE - Transaction History
 * ================================================
 * Complete transaction history with filtering and export
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState } from 'react';
import {
  TransactionFilters,
  TransactionList,
} from '@/components/domains/wallet';
import { useTransactions } from '@/hooks/business/wallet';
import { Receipt, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// ================================================
// PAGE COMPONENT
// ================================================

export default function TransactionsPage() {
  // ==================== HOOKS ====================

  const {
    transactions,
    isLoading,
    filters,
    setFilters,
    clearFilters,
    currentPage,
    nextPage,
    previousPage,
    exportTransactions,
  } = useTransactions();

  // ==================== STATE ====================

  const [isExporting, setIsExporting] = useState(false);

  // ==================== HANDLERS ====================

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      await exportTransactions({
        format: 'CSV',
        dateRange: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0],
        },
        filters,
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <Link
            href="/dashboard/freelancer/wallet"
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
            <Receipt className="text-primary h-8 w-8" />
            İşlem Geçmişi
          </h1>
        </div>
        <p className="text-muted-foreground ml-14">
          Tüm cüzdan işlemlerinizi görüntüleyin ve filtreleyin
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <TransactionFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClear={clearFilters}
        />
      </div>

      {/* Export Button */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {transactions.length > 0
            ? `${transactions.length} işlem gösteriliyor`
            : 'İşlem bulunamadı'}
        </p>
        <button
          onClick={handleExport}
          disabled={isExporting || transactions.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Dışa Aktarılıyor...' : "Excel'e Aktar"}
        </button>
      </div>

      {/* Transaction List */}
      <TransactionList transactions={transactions} isLoading={isLoading} />

      {/* Pagination */}
      {transactions.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={previousPage}
            disabled={currentPage === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Önceki
          </button>
          <span className="text-muted-foreground text-sm">
            Sayfa {currentPage + 1}
          </span>
          <button
            onClick={nextPage}
            disabled={transactions.length < 20}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sonraki
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
