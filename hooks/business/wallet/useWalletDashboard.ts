/**
 * ================================================
 * USE WALLET DASHBOARD HOOK
 * ================================================
 * Comprehensive wallet dashboard hook with real-time updates
 * Sprint 1 - Task 1.1.1
 *
 * Features:
 * - Real-time balance updates
 * - Escrow funds visibility
 * - Transaction history
 * - Auto-refresh capability
 * - Commission breakdown
 * - Error handling & retry
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { walletApi } from '@/lib/api/wallet';
import { logger } from '@/lib/shared/utils/logger';
import { toast } from 'sonner';
import type {
  Wallet,
  BalanceResponse,
  Transaction,
} from '@/lib/api/validators';

// ============================================================================
// TYPES
// ============================================================================

export interface WalletDashboardData {
  // Balance Information
  wallet: Wallet | null;
  balance: BalanceResponse | null;

  // Transactions
  transactions: Transaction[];
  recentTransactions: Transaction[];

  // Escrow Information
  escrowBalance: number;
  escrowTransactions: Transaction[];

  // Commission Information
  totalCommissions: number;
  monthlyCommissions: number;

  // Statistics
  stats: {
    totalTransactions: number;
    pendingPayouts: number;
    completedPayouts: number;
    averageTransaction: number;
    thisMonthEarnings: number;
    lastMonthEarnings: number;
    growthPercentage: number;
  };
}

export interface UseWalletDashboardOptions {
  /**
   * Auto-refresh interval in milliseconds
   * @default 30000 (30 seconds)
   */
  refreshInterval?: number;

  /**
   * Enable auto-refresh
   * @default true
   */
  autoRefresh?: boolean;

  /**
   * Number of recent transactions to fetch
   * @default 10
   */
  recentTransactionCount?: number;

  /**
   * Enable real-time updates via polling
   * @default false
   */
  enableRealTime?: boolean;

  /**
   * Callback when data is refreshed
   */
  onRefresh?: () => void;

  /**
   * Callback when error occurs
   */
  onError?: (error: Error) => void;
}

export interface UseWalletDashboardReturn {
  // Data
  data: WalletDashboardData;

  // State
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  lastUpdated: Date | null;

  // Actions
  refresh: () => Promise<void>;
  refetchBalance: () => Promise<void>;
  refetchTransactions: () => Promise<void>;

  // Utilities
  formatBalance: (amount: number) => string;
  getBalanceColor: (amount: number) => string;
  canRequestPayout: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_OPTIONS: Required<UseWalletDashboardOptions> = {
  refreshInterval: 30000, // 30 seconds
  autoRefresh: true,
  recentTransactionCount: 10,
  enableRealTime: false,
  onRefresh: () => {},
  onError: () => {},
};

const RETRY_DELAYS = [1000, 2000, 5000]; // Retry delays in ms
const MAX_RETRIES = 3;

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useWalletDashboard(
  options: UseWalletDashboardOptions = {}
): UseWalletDashboardReturn {
  // Merge options with defaults (memoized to avoid re-renders)
  const opts = useMemo(
    () => ({ ...DEFAULT_OPTIONS, ...options }),
    [
      options.refreshInterval,
      options.autoRefresh,
      options.recentTransactionCount,
      options.enableRealTime,
    ]
  );

  // ==================== STATE ====================

  const [data, setData] = useState<WalletDashboardData>({
    wallet: null,
    balance: null,
    transactions: [],
    recentTransactions: [],
    escrowBalance: 0,
    escrowTransactions: [],
    totalCommissions: 0,
    monthlyCommissions: 0,
    stats: {
      totalTransactions: 0,
      pendingPayouts: 0,
      completedPayouts: 0,
      averageTransaction: 0,
      thisMonthEarnings: 0,
      lastMonthEarnings: 0,
      growthPercentage: 0,
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // ==================== REFS ====================

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  // ==================== CALCULATIONS ====================

  /**
   * Calculate escrow balance from transactions
   */
  const calculateEscrowBalance = useCallback(
    (transactions: Transaction[]): number => {
      return transactions
        .filter((t) => t.type === 'ESCROW_HOLD')
        .reduce((sum, t) => sum + t.amount, 0);
    },
    []
  );

  /**
   * Calculate commission totals
   */
  const calculateCommissions = useCallback(
    (
      transactions: Transaction[]
    ): {
      total: number;
      monthly: number;
    } => {
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const commissionTransactions = transactions.filter(
        (t) => t.type === 'FEE'
      );

      const total = commissionTransactions.reduce(
        (sum, t) => sum + Math.abs(t.amount),
        0
      );

      const monthly = commissionTransactions
        .filter((t) => {
          const txDate = new Date(t.createdAt);
          return (
            txDate.getMonth() === thisMonth && txDate.getFullYear() === thisYear
          );
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return { total, monthly };
    },
    []
  );

  /**
   * Calculate statistics
   */
  const calculateStats = useCallback(
    (transactions: Transaction[], balance: BalanceResponse | null) => {
      const now = new Date();
      const thisMonth = now.getMonth();
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const thisYear = now.getFullYear();
      const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

      // This month earnings
      const thisMonthEarnings = transactions
        .filter((t) => {
          const txDate = new Date(t.createdAt);
          return (
            t.type === 'CREDIT' &&
            txDate.getMonth() === thisMonth &&
            txDate.getFullYear() === thisYear
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      // Last month earnings
      const lastMonthEarnings = transactions
        .filter((t) => {
          const txDate = new Date(t.createdAt);
          return (
            t.type === 'CREDIT' &&
            txDate.getMonth() === lastMonth &&
            txDate.getFullYear() === lastMonthYear
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      // Growth percentage
      const growthPercentage =
        lastMonthEarnings > 0
          ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100
          : 0;

      // Average transaction
      const creditTransactions = transactions.filter(
        (t) => t.type === 'CREDIT'
      );
      const averageTransaction =
        creditTransactions.length > 0
          ? creditTransactions.reduce((sum, t) => sum + t.amount, 0) /
            creditTransactions.length
          : 0;

      return {
        totalTransactions: transactions.length,
        pendingPayouts: balance?.pendingPayouts || 0,
        completedPayouts: 0, // TODO: Calculate from payout history
        averageTransaction,
        thisMonthEarnings,
        lastMonthEarnings,
        growthPercentage,
      };
    },
    []
  );

  /**
   * Process and enrich data
   */
  const processData = useCallback(
    (
      wallet: Wallet,
      balance: BalanceResponse,
      transactions: Transaction[]
    ): WalletDashboardData => {
      // Filter escrow transactions
      const escrowTransactions = transactions.filter(
        (t) => t.type === 'ESCROW_HOLD' || t.type === 'ESCROW_RELEASE'
      );

      // Calculate commissions
      const commissions = calculateCommissions(transactions);

      // Calculate stats
      const stats = calculateStats(transactions, balance);

      return {
        wallet,
        balance,
        transactions,
        recentTransactions: transactions.slice(0, opts.recentTransactionCount),
        escrowBalance: calculateEscrowBalance(transactions),
        escrowTransactions,
        totalCommissions: commissions.total,
        monthlyCommissions: commissions.monthly,
        stats,
      };
    },
    [
      calculateCommissions,
      calculateEscrowBalance,
      calculateStats,
      opts.recentTransactionCount,
    ]
  );

  // ==================== DATA FETCHING ====================

  /**
   * Fetch all wallet data
   */
  const fetchWalletData = useCallback(
    async (isRefresh = false): Promise<void> => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        logger.debug('[useWalletDashboard] Fetching wallet data...');

        // Fetch all data in parallel
        const [walletStats, transactions] = await Promise.all([
          walletApi.getWalletStats(),
          walletApi.getTransactions(0, 50), // Fetch more for better stats
        ]);

        const { wallet, balance } = walletStats;

        // Process data
        const processedData = processData(wallet, balance, transactions);

        if (isMountedRef.current) {
          setData(processedData);
          setLastUpdated(new Date());
          retryCountRef.current = 0; // Reset retry count on success

          logger.debug('[useWalletDashboard] Data loaded successfully', {
            availableBalance: balance.availableBalance,
            transactionCount: transactions.length,
          });

          if (isRefresh) {
            toast.success('Cüzdan verileri güncellendi');
            opts.onRefresh?.();
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Bilinmeyen hata');

        logger.error(
          '[useWalletDashboard] Failed to fetch wallet data:',
          error
        );

        if (isMountedRef.current) {
          setError(error);
          opts.onError?.(error);

          // Retry logic
          if (retryCountRef.current < MAX_RETRIES) {
            const delay = RETRY_DELAYS[retryCountRef.current];
            logger.debug(`[useWalletDashboard] Retrying in ${delay}ms...`);

            setTimeout(() => {
              retryCountRef.current++;
              fetchWalletData(isRefresh);
            }, delay);
          } else {
            toast.error('Cüzdan verileri yüklenemedi', {
              description: error.message,
            });
          }
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [processData, opts]
  );

  /**
   * Refresh balance only (lightweight)
   */
  const refetchBalance = useCallback(async (): Promise<void> => {
    try {
      const balance = await walletApi.getBalance();

      if (isMountedRef.current) {
        setData((prev) => ({
          ...prev,
          balance,
        }));
        setLastUpdated(new Date());
      }
    } catch (err) {
      logger.error('[useWalletDashboard] Failed to refetch balance:', err);
    }
  }, []);

  /**
   * Refresh transactions only
   */
  const refetchTransactions = useCallback(async (): Promise<void> => {
    try {
      const transactions = await walletApi.getTransactions(0, 50);

      if (isMountedRef.current && data.balance) {
        const processedData = processData(
          data.wallet!,
          data.balance,
          transactions
        );
        setData(processedData);
        setLastUpdated(new Date());
      }
    } catch (err) {
      logger.error('[useWalletDashboard] Failed to refetch transactions:', err);
    }
  }, [data.wallet, data.balance, processData]);

  /**
   * Manual refresh
   */
  const refresh = useCallback(async (): Promise<void> => {
    await fetchWalletData(true);
  }, [fetchWalletData]);

  // ==================== EFFECTS ====================

  /**
   * Initial load
   */
  useEffect(() => {
    fetchWalletData(false);
  }, [fetchWalletData]);

  /**
   * Auto-refresh setup
   */
  useEffect(() => {
    if (opts.autoRefresh && opts.refreshInterval > 0) {
      logger.debug(
        `[useWalletDashboard] Setting up auto-refresh every ${opts.refreshInterval}ms`
      );

      refreshIntervalRef.current = setInterval(() => {
        if (opts.enableRealTime) {
          // Real-time: fetch only balance
          refetchBalance();
        } else {
          // Full refresh
          refresh();
        }
      }, opts.refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [
    opts.autoRefresh,
    opts.refreshInterval,
    opts.enableRealTime,
    refresh,
    refetchBalance,
  ]);

  /**
   * Cleanup
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // ==================== UTILITIES ====================

  /**
   * Format balance with currency
   */
  const formatBalance = useCallback((amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  /**
   * Get color class based on amount
   */
  const getBalanceColor = useCallback((amount: number): string => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-gray-600';
  }, []);

  /**
   * Can request payout
   */
  const canRequestPayout =
    data.balance !== null && data.balance.availableBalance > 0;

  // ==================== RETURN ====================

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
    refetchBalance,
    refetchTransactions,
    formatBalance,
    getBalanceColor,
    canRequestPayout,
  };
}

export default useWalletDashboard;
