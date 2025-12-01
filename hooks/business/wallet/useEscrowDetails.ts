/**
 * ================================================
 * USE ESCROW DETAILS HOOK
 * ================================================
 * Fetch escrow breakdown details from wallet API
 * Sprint 1 - Story 2.1 (Wallet Escrow Breakdown)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Milestone Payment System
 */

'use client';

import useSWR from 'swr';
import { walletClient as walletApiClient } from '@/lib/api/clients/wallet.client';
import type { EscrowDetail } from '@/components/domains/wallet/EscrowBalanceCard';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

interface EscrowDetailsResponse {
  /** Total locked in escrow */
  totalEscrow: number;
  /** Currency code */
  currency: string;
  /** List of escrow holds per order */
  escrowDetails: Array<{
    orderId: string; // UUID from backend
    orderTitle: string;
    totalAmount: number;
    currency: string;
    milestoneCount: number;
    milestones: Array<{
      id: string; // UUID from backend
      title: string;
      amount: number;
      status: string;
    }>;
  }>;
}

export interface UseEscrowDetailsReturn {
  /** Escrow details data */
  escrowDetails: EscrowDetail[];
  /** Total locked amount */
  totalEscrow: number;
  /** Currency code */
  currency: string;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Refresh function */
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to fetch escrow details breakdown
 *
 * @param enabled - Enable/disable the hook
 * @param refreshInterval - Auto-refresh interval in ms (default: 30000)
 *
 * @example
 * ```tsx
 * const { escrowDetails, totalEscrow, isLoading } = useEscrowDetails();
 *
 * <EscrowBalanceCard
 *   lockedBalance={totalEscrow}
 *   escrowDetails={escrowDetails}
 *   isLoading={isLoading}
 * />
 * ```
 */
export function useEscrowDetails(
  enabled = true,
  refreshInterval = 30000
): UseEscrowDetailsReturn {
  const { data, error, isLoading, mutate } = useSWR<EscrowDetailsResponse>(
    enabled ? '/api/v1/wallet/escrow-details' : null,
    async () => {
      try {
        const response: any = await (walletApiClient as any).get(
          '/escrow-details'
        );

        logger.info('[useEscrowDetails] Fetched escrow details', {
          totalEscrow: response.data?.totalEscrow,
          orderCount: response.data?.escrowDetails?.length,
        });

        return response.data;
      } catch (err) {
        logger.error(
          '[useEscrowDetails] Failed to fetch escrow details',
          err instanceof Error ? err : new Error(String(err))
        );
        throw err;
      }
    },
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    escrowDetails: data?.escrowDetails || [],
    totalEscrow: data?.totalEscrow || 0,
    currency: data?.currency || 'TRY',
    isLoading,
    error: error || null,
    refresh: () => void mutate(),
  };
}

export default useEscrowDetails;
