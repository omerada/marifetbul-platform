'use client';

/**
 * ================================================
 * USE COMMISSION HOOK
 * ================================================
 * Hook for commission-related operations
 *
 * Sprint Day 1 - Task 5: Commission API Integration
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getCommissionsBySeller,
  getCommissionStats,
  getCommissionAnalytics,
  type CommissionTransaction,
  type CommissionStats,
  type CommissionAnalytics,
} from '@/lib/api/commission';
import logger from '@/lib/infrastructure/monitoring/logger';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

export interface UseCommissionOptions {
  /**
   * Auto-load data on mount
   * @default true
   */
  autoLoad?: boolean;

  /**
   * Period for stats (days)
   * @default 30
   */
  period?: number;
}

export interface UseCommissionReturn {
  // Data
  commissions: CommissionTransaction[];
  stats: CommissionStats | null;
  analytics: CommissionAnalytics | null;

  // States
  isLoading: boolean;
  isLoadingStats: boolean;
  isLoadingAnalytics: boolean;
  error: string | null;

  // Actions
  loadCommissions: (page?: number, size?: number) => Promise<void>;
  loadStats: (startDate: string, endDate: string) => Promise<void>;
  loadAnalytics: (startDate: string, endDate: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get date range for period
 */
function getDateRangeForPeriod(days: number): {
  startDate: string;
  endDate: string;
} {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useCommission(
  options: UseCommissionOptions = {}
): UseCommissionReturn {
  const { autoLoad = true, period = 30 } = options;
  const { user } = useAuthStore();

  // State
  const [commissions, setCommissions] = useState<CommissionTransaction[]>([]);
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [analytics, setAnalytics] = useState<CommissionAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  /**
   * Load user's commissions
   */
  const loadCommissions = useCallback(
    async (page = 0, size = 20) => {
      if (!user?.id) {
        logger.warn('Cannot load commissions: user not found');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        logger.debug('Loading commissions', { userId: user.id, page, size });

        const response = await getCommissionsBySeller(user.id, page, size);

        setCommissions(response.content);
        setCurrentPage(response.pageNumber);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        setHasNext(response.hasNext);

        logger.info('Commissions loaded successfully', {
          count: response.content.length,
          total: response.totalElements,
        });
      } catch (err) {
        const errorMessage = 'Komisyon bilgileri yüklenemedi';
        setError(errorMessage);
        logger.error(
          'Failed to load commissions',
          err instanceof Error ? err : new Error(String(err))
        );
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  /**
   * Load commission stats
   */
  const loadStats = useCallback(async (startDate: string, endDate: string) => {
    try {
      setIsLoadingStats(true);
      setError(null);

      logger.debug('Loading commission stats', { startDate, endDate });

      const statsData = await getCommissionStats(startDate, endDate);
      setStats(statsData);

      logger.info('Commission stats loaded successfully');
    } catch (err) {
      const errorMessage = 'Komisyon istatistikleri yüklenemedi';
      setError(errorMessage);
      logger.error(
        'Failed to load commission stats',
        err instanceof Error ? err : new Error(String(err))
      );
      // Don't show toast for stats - it's supplementary data
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  /**
   * Load commission analytics
   */
  const loadAnalytics = useCallback(
    async (startDate: string, endDate: string) => {
      try {
        setIsLoadingAnalytics(true);
        setError(null);

        logger.debug('Loading commission analytics', { startDate, endDate });

        const analyticsData = await getCommissionAnalytics(startDate, endDate);
        setAnalytics(analyticsData);

        logger.info('Commission analytics loaded successfully');
      } catch (err) {
        const errorMessage = 'Komisyon analizleri yüklenemedi';
        setError(errorMessage);
        logger.error(
          'Failed to load commission analytics',
          err instanceof Error ? err : new Error(String(err))
        );
        // Don't show toast for analytics - it's supplementary data
      } finally {
        setIsLoadingAnalytics(false);
      }
    },
    []
  );

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    const { startDate, endDate } = getDateRangeForPeriod(period);

    await Promise.all([
      loadCommissions(currentPage),
      loadStats(startDate, endDate),
      loadAnalytics(startDate, endDate),
    ]);
  }, [loadCommissions, loadStats, loadAnalytics, currentPage, period]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && user?.id) {
      const { startDate, endDate } = getDateRangeForPeriod(period);

      loadCommissions();
      loadStats(startDate, endDate);
      loadAnalytics(startDate, endDate);
    }
  }, [autoLoad, user?.id, period, loadCommissions, loadStats, loadAnalytics]);

  return {
    // Data
    commissions,
    stats,
    analytics,

    // States
    isLoading,
    isLoadingStats,
    isLoadingAnalytics,
    error,

    // Actions
    loadCommissions,
    loadStats,
    loadAnalytics,
    refresh,
    clearError,

    // Pagination
    currentPage,
    totalPages,
    totalElements,
    hasNext,
  };
}

export default useCommission;
