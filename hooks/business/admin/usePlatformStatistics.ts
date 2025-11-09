'use client';

/**
 * ================================================
 * USE PLATFORM STATISTICS HOOK
 * ================================================
 * Hook for fetching and managing platform-wide statistics
 *
 * Features:
 * - Wallet statistics
 * - Payout metrics
 * - Transaction analytics
 * - User wallet metrics
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.2
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/infrastructure/api/client';
import { toast } from 'sonner';

export interface PlatformStatistics {
  // Wallet metrics
  totalWallets: number;
  activeWallets: number;
  totalBalance: number;
  totalPendingBalance: number;
  averageBalance: number;
  walletsWithBalance: number;
  frozenWallets: number;

  // Payout statistics
  totalPayouts: number;
  pendingPayouts: number;
  totalPayoutAmount: number;
  totalPendingPayouts: number;
  pendingPayoutCount: number;
  totalApprovedPayouts: number;
  approvedPayoutCount: number;
  totalCompletedPayouts: number;
  completedPayoutCount: number;

  // Transaction statistics
  totalTransactions: number;
  totalTransactionVolume: number;
  totalTransactionCount: number;
  averageTransactionAmount: number;
  totalPaymentReleased: number;
  paymentReleasedCount: number;
  totalPayoutsCompleted: number;
  payoutsCompletedCount: number;
  totalRefundsIssued: number;
  refundsIssuedCount: number;
  totalFeesCharged: number;
  feesChargedCount: number;

  // Growth metrics
  transactionVolumeGrowth: number;
  transactionVolumeGrowthPercentage: number;
  payoutVolumeGrowth: number;
  payoutVolumeGrowthPercentage: number;

  // Batch statistics
  pendingBatchCount: number;
  processingBatchCount: number;
  completedBatchCount: number;
  failedBatchCount: number;
}

interface UsePlatformStatisticsOptions {
  autoLoad?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UsePlatformStatisticsReturn {
  data: PlatformStatistics | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for platform statistics
 */
export function usePlatformStatistics(
  options: UsePlatformStatisticsOptions = {}
): UsePlatformStatisticsReturn {
  const { autoLoad = true, refreshInterval } = options;

  const [data, setData] = useState<PlatformStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch platform statistics
   */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get<PlatformStatistics>(
        '/api/v1/admin/wallets/statistics'
      );

      setData(response);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Platform istatistikleri yüklenirken hata oluştu';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh data
   */
  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      fetchData();
    }
  }, [autoLoad, fetchData]);

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh,
  };
}
