'use client';

/**
 * ================================================
 * USE WALLET DATA HOOK
 * ================================================
 * Custom hook for wallet data management
 *
 * Features:
 * - Fetch wallet and balance
 * - Auto-refresh every 30 seconds
 * - Real-time updates via WebSocket (Phase 2)
 * - Error handling
 * - Loading states
 *
 * Sprint 1 - Epic 1.1 - Day 1
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { walletApi } from '@/lib/api/wallet';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  Wallet,
  BalanceResponse,
  Transaction,
} from '@/lib/api/validators';

// ============================================================================
// TYPES
// ============================================================================

interface WalletData {
  wallet: Wallet | null;
  balance: BalanceResponse | null;
  transactions: Transaction[];
}

export interface UseWalletDataReturn {
  // Data
  wallet: Wallet | null;
  balance: BalanceResponse | null;
  transactions: Transaction[];

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingTransactions: boolean;

  // Error states
  error: Error | null;

  // Actions
  refresh: () => Promise<void>;
  loadTransactions: (page?: number, size?: number) => Promise<void>;
  clearError: () => void;

  // Computed values
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalPayouts: number;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for wallet data management
 *
 * @param autoRefresh - Enable auto-refresh every 30 seconds
 * @param refreshInterval - Refresh interval in milliseconds (default: 30000)
 *
 * @example
 * ```tsx
 * function WalletDashboard() {
 *   const {
 *     wallet,
 *     balance,
 *     isLoading,
 *     refresh,
 *     availableBalance,
 *     pendingBalance
 *   } = useWalletData(true);
 *
 *   if (isLoading) return <Loading />;
 *
 *   return (
 *     <div>
 *       <BalanceCard
 *         available={availableBalance}
 *         pending={pendingBalance}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function useWalletData(
  autoRefresh: boolean = true,
  refreshInterval: number = 30000
): UseWalletDataReturn {
  // ========================================================================
  // STATE
  // ========================================================================

  const [data, setData] = useState<WalletData>({
    wallet: null,
    balance: null,
    transactions: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const hasInitialized = useRef(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ========================================================================
  // FETCH WALLET DATA
  // ========================================================================

  const fetchWalletData = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      logger.debug('🔄 Fetching wallet data...', { isRefresh });

      // Fetch wallet and balance in parallel
      const { wallet, balance } = await walletApi.getWalletStats();

      setData((prev) => ({
        ...prev,
        wallet,
        balance,
      }));

      logger.debug('✅ Wallet data fetched successfully', { walletIdwalletid, balancebalanceavailableBalance,  });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to fetch wallet data');
      setError(error);
      logger.error('❌ Failed to fetch wallet data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // ========================================================================
  // FETCH TRANSACTIONS
  // ========================================================================

  const loadTransactions = useCallback(
    async (page: number = 0, size: number = 20) => {
      try {
        setIsLoadingTransactions(true);

        logger.debug('🔄 Fetching transactions...', { page, size });

        const transactions = await walletApi.getTransactions(page, size);

        setData((prev) => ({
          ...prev,
          transactions:
            page === 0 ? transactions : [...prev.transactions, ...transactions],
        }));

        logger.debug('✅ Transactions fetched successfully', { counttransactionslength,  });
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to fetch transactions');
        logger.error('❌ Failed to fetch transactions:', error);
        throw error;
      } finally {
        setIsLoadingTransactions(false);
      }
    },
    []
  );

  // ========================================================================
  // REFRESH
  // ========================================================================

  const refresh = useCallback(async () => {
    await fetchWalletData(true);
  }, [fetchWalletData]);

  // ========================================================================
  // CLEAR ERROR
  // ========================================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ========================================================================
  // INITIAL FETCH
  // ========================================================================

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchWalletData(false);
      loadTransactions(0, 20);
    }
  }, [fetchWalletData, loadTransactions]);

  // ========================================================================
  // AUTO-REFRESH
  // ========================================================================

  useEffect(() => {
    if (!autoRefresh) return;

    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set up new interval
    refreshIntervalRef.current = setInterval(() => {
      logger.debug('🔄 Auto-refreshing wallet data...');
      fetchWalletData(true);
    }, refreshInterval);

    // Cleanup
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchWalletData]);

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const availableBalance = data.balance?.availableBalance ?? 0;
  const pendingBalance = data.balance?.pendingBalance ?? 0;
  const totalEarnings = data.balance?.totalEarnings ?? 0;
  const totalPayouts = data.balance?.pendingPayouts ?? 0; // Use pendingPayouts as totalPayouts

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    // Data
    wallet: data.wallet,
    balance: data.balance,
    transactions: data.transactions,

    // Loading states
    isLoading,
    isRefreshing,
    isLoadingTransactions,

    // Error states
    error,

    // Actions
    refresh,
    loadTransactions,
    clearError,

    // Computed values
    availableBalance,
    pendingBalance,
    totalEarnings,
    totalPayouts,
  };
}

export default useWalletData;
