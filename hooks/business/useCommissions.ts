/**
 * ================================================
 * USE COMMISSIONS HOOK
 * ================================================
 * React hook for commission management (Admin only)
 *
 * Features:
 * - Commission transaction fetching
 * - Commission rule CRUD operations
 * - Statistics and analytics
 * - Real-time updates via SWR
 *
 * Sprint 1 - Task 1.1.4: Commission Management Hook
 * @version 1.0.0
 * @created 2025-11-14
 */

'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { commissionApi } from '@/lib/api/commission';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  CommissionTransaction,
  CommissionRule,
  CommissionRuleRequest,
  CommissionStats,
  CommissionAnalytics,
} from '@/lib/api/commission';
import type { PageResponse } from '@/types/backend-aligned';

// ============================================================================
// TYPES
// ============================================================================

export interface UseCommissionsOptions {
  /**
   * Page number for pagination (0-indexed)
   */
  page?: number;

  /**
   * Page size
   */
  size?: number;

  /**
   * Filter by seller ID
   */
  sellerId?: string;

  /**
   * Auto-refresh interval (ms)
   * Set to 0 to disable
   */
  refreshInterval?: number;
}

export interface UseCommissionsReturn {
  // Transaction data
  transactions: CommissionTransaction[];
  transactionsLoading: boolean;
  transactionsError: Error | null;
  transactionsPagination: PageResponse<CommissionTransaction> | null;

  // Rule data
  rules: CommissionRule[];
  rulesLoading: boolean;
  rulesError: Error | null;

  // Active rules
  activeRules: CommissionRule[];
  activeRulesLoading: boolean;

  // Statistics
  stats: CommissionStats | null;
  statsLoading: boolean;
  statsError: Error | null;

  // Analytics
  analytics: CommissionAnalytics | null;

  // Combined loading states
  isLoading: boolean;
  isLoadingStats: boolean;
  isLoadingAnalytics: boolean;

  // Combined error
  error: string | null;

  // Actions - Transactions
  fetchTransactions: (page?: number, size?: number) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  getTransactionById: (id: string) => Promise<CommissionTransaction>;
  getTransactionByPayment: (
    paymentId: string
  ) => Promise<CommissionTransaction>;
  getSellerTransactions: (
    sellerId: string,
    page?: number,
    size?: number
  ) => Promise<PageResponse<CommissionTransaction>>;

  // Actions - Rules
  fetchRules: () => Promise<void>;
  createRule: (request: CommissionRuleRequest) => Promise<CommissionRule>;
  updateRule: (
    ruleId: string,
    request: CommissionRuleRequest
  ) => Promise<CommissionRule>;
  deleteRule: (ruleId: string) => Promise<void>;
  activateRule: (ruleId: string) => Promise<CommissionRule>;
  deactivateRule: (ruleId: string) => Promise<CommissionRule>;
  refreshRules: () => Promise<void>;

  // Actions - Stats & Analytics
  fetchStats: (startDate: string, endDate: string) => Promise<CommissionStats>;
  fetchAnalytics: (
    startDate: string,
    endDate: string
  ) => Promise<CommissionAnalytics>;

  // Global refresh
  refresh: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for commission management (Admin only)
 *
 * @example
 * ```tsx
 * function CommissionDashboard() {
 *   const {
 *     transactions,
 *     rules,
 *     createRule,
 *     stats,
 *   } = useCommissions({ page: 0, size: 20 });
 *
 *   return (
 *     <div>
 *       <h1>Transactions: {transactions.length}</h1>
 *       <h2>Active Rules: {rules.filter(r => r.isActive).length}</h2>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCommissions(
  options: UseCommissionsOptions = {}
): UseCommissionsReturn {
  const { page = 0, size = 20, sellerId, refreshInterval = 0 } = options;

  const [statsDateRange, setStatsDateRange] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);

  const [analytics, setAnalytics] = useState<CommissionAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // ========== SWR Data Fetching ==========

  // Fetch commission transactions
  const {
    data: transactionsPagination,
    error: transactionsError,
    isLoading: transactionsLoading,
    mutate: mutateTransactions,
  } = useSWR(
    ['commissions/transactions', page, size, sellerId],
    () => commissionApi.getCommissions(page, size, sellerId),
    {
      refreshInterval,
      revalidateOnFocus: true,
      onError: (error) => {
        logger.error('Failed to fetch commission transactions', error instanceof Error ? error : new Error(String(error)));
      },
    }
  );

  // Fetch commission rules
  const {
    data: rules,
    error: rulesError,
    isLoading: rulesLoading,
    mutate: mutateRules,
  } = useSWR('commissions/rules', () => commissionApi.getAllCommissionRules(), {
    refreshInterval,
    revalidateOnFocus: true,
    onError: (error) => {
      logger.error('Failed to fetch commission rules', error instanceof Error ? error : new Error(String(error)));
    },
  });

  // Fetch active rules
  const { data: activeRules, isLoading: activeRulesLoading } = useSWR(
    'commissions/rules/active',
    () => commissionApi.getActiveCommissionRules(),
    {
      refreshInterval,
      revalidateOnFocus: true,
    }
  );

  // Fetch statistics (only if date range is set)
  const {
    data: stats,
    error: statsError,
    isLoading: statsLoading,
    mutate: mutateStats,
  } = useSWR(
    statsDateRange
      ? ['commissions/stats', statsDateRange.startDate, statsDateRange.endDate]
      : null,
    () =>
      statsDateRange
        ? commissionApi.getCommissionStats(
            statsDateRange.startDate,
            statsDateRange.endDate
          )
        : null,
    {
      onError: (error) => {
        logger.error('Failed to fetch commission stats', error instanceof Error ? error : new Error(String(error)));
      },
    }
  );

  // ========== Action Handlers ==========

  /**
   * Refresh commission transactions
   */
  const refreshTransactions = useCallback(async () => {
    logger.debug('Refreshing commission transactions');
    await mutateTransactions();
  }, [mutateTransactions]);

  /**
   * Get transaction by ID
   */
  const getTransactionById = useCallback(
    async (id: string): Promise<CommissionTransaction> => {
      logger.debug('Fetching commission transaction', { id });
      return await commissionApi.getCommissionById(id);
    },
    []
  );

  /**
   * Get transaction by payment ID
   */
  const getTransactionByPayment = useCallback(
    async (paymentId: string): Promise<CommissionTransaction> => {
      logger.debug('Fetching commission by payment', { paymentId });
      return await commissionApi.getCommissionByPaymentId(paymentId);
    },
    []
  );

  /**
   * Get seller transactions
   */
  const getSellerTransactions = useCallback(
    async (
      sellerId: string,
      page = 0,
      size = 20
    ): Promise<PageResponse<CommissionTransaction>> => {
      logger.debug('Fetching seller commissions', { sellerId, page, size });
      return await commissionApi.getCommissionsBySeller(sellerId, page, size);
    },
    []
  );

  /**
   * Create commission rule
   */
  const createRule = useCallback(
    async (request: CommissionRuleRequest): Promise<CommissionRule> => {
      try {
        logger.debug('Creating commission rule', { request });

        const newRule = await commissionApi.createCommissionRule(request);

        // Refresh rules list
        await mutateRules();

        logger.info('Commission rule created', { ruleId: newRule.id });
        return newRule;
      } catch (error) {
        logger.error('Failed to create commission rule', error as Error);
        throw error;
      }
    },
    [mutateRules]
  );

  /**
   * Update commission rule
   */
  const updateRule = useCallback(
    async (
      ruleId: string,
      request: CommissionRuleRequest
    ): Promise<CommissionRule> => {
      try {
        logger.debug('Updating commission rule', { ruleId, request });

        const updatedRule = await commissionApi.updateCommissionRule(
          ruleId,
          request
        );

        // Refresh rules list
        await mutateRules();

        logger.info('Commission rule updated', { ruleId });
        return updatedRule;
      } catch (error) {
        logger.error('Failed to update commission rule', error as Error);
        throw error;
      }
    },
    [mutateRules]
  );

  /**
   * Delete commission rule
   */
  const deleteRule = useCallback(
    async (ruleId: string): Promise<void> => {
      try {
        logger.debug('Deleting commission rule', { ruleId });

        await commissionApi.deleteCommissionRule(ruleId);

        // Refresh rules list
        await mutateRules();

        logger.info('Commission rule deleted', { ruleId });
      } catch (error) {
        logger.error('Failed to delete commission rule', error as Error);
        throw error;
      }
    },
    [mutateRules]
  );

  /**
   * Activate commission rule
   */
  const activateRule = useCallback(
    async (ruleId: string): Promise<CommissionRule> => {
      try {
        logger.debug('Activating commission rule', { ruleId });

        const activatedRule =
          await commissionApi.activateCommissionRule(ruleId);

        // Refresh rules list
        await mutateRules();

        logger.info('Commission rule activated', { ruleId });
        return activatedRule;
      } catch (error) {
        logger.error('Failed to activate commission rule', error as Error);
        throw error;
      }
    },
    [mutateRules]
  );

  /**
   * Deactivate commission rule
   */
  const deactivateRule = useCallback(
    async (ruleId: string): Promise<CommissionRule> => {
      try {
        logger.debug('Deactivating commission rule', { ruleId });

        const deactivatedRule =
          await commissionApi.deactivateCommissionRule(ruleId);

        // Refresh rules list
        await mutateRules();

        logger.info('Commission rule deactivated', { ruleId });
        return deactivatedRule;
      } catch (error) {
        logger.error('Failed to deactivate commission rule', error as Error);
        throw error;
      }
    },
    [mutateRules]
  );

  /**
   * Refresh commission rules
   */
  const refreshRules = useCallback(async () => {
    logger.debug('Refreshing commission rules');
    await mutateRules();
  }, [mutateRules]);

  /**
   * Fetch commission statistics
   */
  const fetchStats = useCallback(
    async (startDate: string, endDate: string): Promise<CommissionStats> => {
      logger.debug('Fetching commission stats', { startDate, endDate });

      // Set date range to trigger SWR fetch
      setStatsDateRange({ startDate, endDate });

      // Fetch directly
      const stats = await commissionApi.getCommissionStats(startDate, endDate);

      // Update SWR cache
      await mutateStats(stats);

      return stats;
    },
    [mutateStats]
  );

  /**
   * Fetch commission analytics
   */
  const fetchAnalytics = useCallback(
    async (
      startDate: string,
      endDate: string
    ): Promise<CommissionAnalytics> => {
      logger.debug('Fetching commission analytics', { startDate, endDate });
      setIsLoadingAnalytics(true);
      try {
        const data = await commissionApi.getCommissionAnalytics(
          startDate,
          endDate
        );
        setAnalytics(data);
        return data;
      } finally {
        setIsLoadingAnalytics(false);
      }
    },
    []
  );

  // ========== Convenience Methods ==========

  /**
   * Fetch transactions with parameters
   */
  const fetchTransactions = useCallback(
    async (fetchPage: number = page, fetchSize: number = size) => {
      logger.debug('Fetching transactions', {
        page: fetchPage,
        size: fetchSize,
      });
      await mutateTransactions(
        commissionApi.getCommissions(fetchPage, fetchSize, sellerId)
      );
    },
    [page, size, sellerId, mutateTransactions]
  );

  /**
   * Fetch all rules
   */
  const fetchRules = useCallback(async () => {
    logger.debug('Fetching rules');
    await mutateRules();
  }, [mutateRules]);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    logger.debug('Refreshing all commission data');
    await Promise.all([mutateTransactions(), mutateRules(), mutateStats()]);
  }, [mutateTransactions, mutateRules, mutateStats]);

  // Combined loading state
  const isLoading = transactionsLoading || rulesLoading || activeRulesLoading;
  const isLoadingStats = statsLoading;

  // Combined error
  const error =
    transactionsError?.message ||
    rulesError?.message ||
    statsError?.message ||
    null;

  // ========== Return ==========

  return {
    // Transaction data
    transactions: transactionsPagination?.content || [],
    transactionsLoading,
    transactionsError: transactionsError as Error | null,
    transactionsPagination: transactionsPagination || null,

    // Rule data
    rules: rules || [],
    rulesLoading,
    rulesError: rulesError as Error | null,

    // Active rules
    activeRules: activeRules || [],
    activeRulesLoading,

    // Statistics
    stats: stats || null,
    statsLoading,
    statsError: statsError as Error | null,

    // Analytics
    analytics,

    // Combined loading states
    isLoading,
    isLoadingStats,
    isLoadingAnalytics,

    // Combined error
    error,

    // Actions - Transactions
    fetchTransactions,
    refreshTransactions,
    getTransactionById,
    getTransactionByPayment,
    getSellerTransactions,

    // Actions - Rules
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    activateRule,
    deactivateRule,
    refreshRules,

    // Actions - Stats & Analytics
    fetchStats,
    fetchAnalytics,

    // Global refresh
    refresh,
  };
}

export default useCommissions;
