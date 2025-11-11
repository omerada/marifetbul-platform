'use client';

/**
 * ================================================
 * TRANSACTIONS HOOK - Transaction History Management
 * ================================================
 * Hook for managing transaction history with filtering and pagination
 * Provides transaction list, filters, and export capabilities
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useWalletStore } from '@/stores/walletStore';
import { useEffect, useState, useCallback } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { Transaction } from '@/lib/api/validators';
import type {
  TransactionFilters,
  TransactionExportOptions,
} from '@/types/business/features/wallet';

// ================================================
// HOOK INTERFACE
// ================================================

export interface UseTransactionsReturn {
  // State
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  filters: TransactionFilters;

  // Actions
  fetchTransactions: (
    filters?: TransactionFilters,
    page?: number
  ) => Promise<void>;
  setFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  exportTransactions: (options: TransactionExportOptions) => Promise<void>;
  refresh: () => Promise<void>;
}

// ================================================
// MAIN HOOK
// ================================================

/**
 * Hook for managing transaction history
 * Supports filtering, pagination, and export
 *
 * @param autoFetch - Whether to automatically fetch transactions on mount (default: true)
 * @param initialFilters - Initial filter values
 * @returns Transaction state and management functions
 *
 * @example
 * ```tsx
 * const {
 *   transactions,
 *   isLoading,
 *   filters,
 *   setFilters,
 *   nextPage,
 *   exportTransactions
 * } = useTransactions();
 *
 * return (
 *   <div>
 *     <TransactionFilters filters={filters} onChange={setFilters} />
 *     <TransactionList transactions={transactions} loading={isLoading} />
 *     <Pagination onNext={nextPage} />
 *     <button onClick={() => exportTransactions({ format: 'csv' })}>
 *       Excel'e Aktar
 *     </button>
 *   </div>
 * );
 * ```
 */
export const useTransactions = (
  autoFetch = true,
  initialFilters?: TransactionFilters
): UseTransactionsReturn => {
  // ==================== LOCAL STATE ====================

  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFiltersState] = useState<TransactionFilters>(
    initialFilters || {}
  );

  // ==================== SELECTORS ====================

  const transactions = useWalletStore((state) => state.transactions);
  const isLoading = useWalletStore((state) => state.ui.isLoadingTransactions);
  const error = useWalletStore((state) => state.ui.error);

  // ==================== ACTIONS ====================

  const fetchTransactions = useWalletStore((state) => state.fetchTransactions);
  const exportTransactionsAction = useWalletStore(
    (state) => state.exportTransactions
  );

  // ==================== EFFECTS ====================

  // Auto-fetch transactions on mount
  useEffect(() => {
    if (autoFetch) {
      fetchTransactions(filters, currentPage);
    }
  }, [autoFetch, filters, currentPage, fetchTransactions]);

  // ==================== CALLBACKS ====================

  const setFilters = useCallback((newFilters: TransactionFilters) => {
    setFiltersState(newFilters);
    setCurrentPage(0); // Reset to first page when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setCurrentPage(0);
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const previousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(0, page));
  }, []);

  const exportTransactions = useCallback(
    async (options: TransactionExportOptions) => {
      try {
        const blob = await exportTransactionsAction(options);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.${
          options.format
        }`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        logger.error('Failed to export transactions:', error);
        throw error;
      }
    },
    [exportTransactionsAction]
  );

  const refresh = useCallback(async () => {
    await fetchTransactions(filters, currentPage);
  }, [fetchTransactions, filters, currentPage]);

  // ==================== RETURN ====================

  return {
    // State
    transactions,
    isLoading,
    error,
    currentPage,
    filters,

    // Actions
    fetchTransactions,
    setFilters,
    clearFilters,
    nextPage,
    previousPage,
    goToPage,
    exportTransactions,
    refresh,
  };
};
