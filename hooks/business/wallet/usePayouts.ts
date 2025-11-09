'use client';

/**
 * ================================================
 * PAYOUTS HOOK - Payout Management Hook
 * ================================================
 * Hook for managing payout requests and history
 * Includes eligibility checks and request handling
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useWalletStore } from '@/stores/walletStore';
import { useEffect, useState, useCallback } from 'react';
import type {
  Payout,
  PayoutRequest,
  PayoutEligibilityResponse,
  PayoutLimitsResponse,
} from '@/types/business/features/wallet';

// ================================================
// HOOK INTERFACE
// ================================================

export interface UsePayoutsReturn {
  // State
  payouts: Payout[];
  eligibility: PayoutEligibilityResponse | null;
  limits: PayoutLimitsResponse | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  currentPage: number;

  // Actions
  fetchPayouts: (page?: number) => Promise<void>;
  fetchEligibility: () => Promise<void>;
  fetchLimits: () => Promise<void>;
  requestPayout: (request: PayoutRequest) => Promise<Payout>;
  cancelPayout: (payoutId: string) => Promise<void>;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  refresh: () => Promise<void>;

  // Computed
  canRequestPayout: boolean;
  eligibilityReason: string | null;
}

// ================================================
// MAIN HOOK
// ================================================

/**
 * Hook for managing payout requests and history
 * Handles eligibility checks, limits, and request submission
 *
 * @param autoFetch - Whether to automatically fetch data on mount (default: true)
 * @returns Payout state and management functions
 *
 * @example
 * ```tsx
 * const {
 *   payouts,
 *   eligibility,
 *   limits,
 *   canRequestPayout,
 *   requestPayout,
 *   isSubmitting
 * } = usePayouts();
 *
 * const handleRequest = async () => {
 *   if (!canRequestPayout) return;
 *
 *   await requestPayout({
 *     amount: 500,
 *     method: PayoutMethod.BANK_TRANSFER,
 *     iban: 'TR...'
 *   });
 * };
 *
 * return (
 *   <div>
 *     <PayoutEligibilityBanner eligibility={eligibility} />
 *     <PayoutRequestForm
 *       onSubmit={handleRequest}
 *       disabled={!canRequestPayout || isSubmitting}
 *       limits={limits}
 *     />
 *     <PayoutHistory payouts={payouts} />
 *   </div>
 * );
 * ```
 */
export const usePayouts = (autoFetch = true): UsePayoutsReturn => {
  // ==================== LOCAL STATE ====================

  const [currentPage, setCurrentPage] = useState(0);

  // ==================== SELECTORS ====================

  const payouts = useWalletStore((state) => state.payouts);
  const eligibility = useWalletStore((state) => state.eligibility);
  const limits = useWalletStore((state) => state.limits);
  const isLoading = useWalletStore((state) => state.ui.isLoadingPayouts);
  const isSubmitting = useWalletStore((state) => state.ui.isSubmittingPayout);
  const error = useWalletStore((state) => state.ui.error);

  // ==================== ACTIONS ====================

  const fetchPayouts = useWalletStore((state) => state.fetchPayouts);
  const fetchEligibility = useWalletStore((state) => state.fetchEligibility);
  const fetchLimits = useWalletStore((state) => state.fetchLimits);
  const requestPayoutAction = useWalletStore((state) => state.requestPayout);
  const cancelPayoutAction = useWalletStore((state) => state.cancelPayout);

  // ==================== EFFECTS ====================

  // Auto-fetch data on mount
  useEffect(() => {
    if (autoFetch) {
      Promise.all([
        fetchPayouts(currentPage),
        fetchEligibility(),
        fetchLimits(),
      ]);
    }
  }, [autoFetch, currentPage, fetchPayouts, fetchEligibility, fetchLimits]);

  // ==================== CALLBACKS ====================

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const previousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(0, page));
  }, []);

  const requestPayout = useCallback(
    async (request: PayoutRequest): Promise<Payout> => {
      const payout = await requestPayoutAction(request);
      // Refresh eligibility and limits after request
      await Promise.all([fetchEligibility(), fetchLimits()]);
      return payout;
    },
    [requestPayoutAction, fetchEligibility, fetchLimits]
  );

  const cancelPayout = useCallback(
    async (payoutId: string) => {
      await cancelPayoutAction(payoutId);
      // Refresh data after cancellation
      await Promise.all([
        fetchPayouts(currentPage),
        fetchEligibility(),
        fetchLimits(),
      ]);
    },
    [
      cancelPayoutAction,
      fetchPayouts,
      currentPage,
      fetchEligibility,
      fetchLimits,
    ]
  );

  const refresh = useCallback(async () => {
    await Promise.all([
      fetchPayouts(currentPage),
      fetchEligibility(),
      fetchLimits(),
    ]);
  }, [fetchPayouts, currentPage, fetchEligibility, fetchLimits]);

  // ==================== COMPUTED VALUES ====================

  const canRequestPayout = eligibility?.eligible ?? false;
  const eligibilityReason = eligibility?.reason ?? null;

  // ==================== RETURN ====================

  return {
    // State
    payouts,
    eligibility,
    limits,
    isLoading,
    isSubmitting,
    error,
    currentPage,

    // Actions
    fetchPayouts,
    fetchEligibility,
    fetchLimits,
    requestPayout,
    cancelPayout,
    nextPage,
    previousPage,
    goToPage,
    refresh,

    // Computed
    canRequestPayout,
    eligibilityReason,
  };
};
