/**
 * ================================================
 * USE ESCROW LIST HOOK
 * ================================================
 * Hook for fetching and managing escrow payment list
 *
 * Features:
 * - Fetch active escrow payments
 * - Filter by status
 * - Real-time updates with SWR
 * - Error handling
 * - Loading states
 *
 * Sprint 1 - Day 2 - Escrow Dashboard Enhancement
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import useSWR from 'swr';
import { apiClient } from '@/lib/infrastructure/api/client';
import type { EscrowPaymentDetails } from '@/types/business/features/wallet';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface UseEscrowListOptions {
  status?: 'HELD' | 'PENDING_RELEASE' | 'RELEASED' | 'DISPUTED' | 'all';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseEscrowListReturn {
  escrows: EscrowPaymentDetails[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  mutate: (data?: EscrowPaymentDetails[]) => Promise<void>;
}

// ============================================================================
// FETCHER
// ============================================================================

async function fetchEscrowList(
  status?: string
): Promise<EscrowPaymentDetails[]> {
  try {
    const url =
      status && status !== 'all'
        ? `/wallet/escrow?status=${status}`
        : '/wallet/escrow';

    const response = await apiClient.get<EscrowPaymentDetails[]>(url);
    return response;
  } catch (error) {
    logger.error(
      'Failed to fetch escrow list', error instanceof Error ? error : new Error(String(error)), { status }
    );
    throw error;
  }
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for fetching escrow payment list
 *
 * @example
 * ```tsx
 * const { escrows, isLoading, error, refresh } = useEscrowList({
 *   status: 'HELD',
 *   autoRefresh: true,
 * });
 * ```
 */
export function useEscrowList(
  options: UseEscrowListOptions = {}
): UseEscrowListReturn {
  const {
    status = 'all',
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;

  const { data, error, isLoading, mutate } = useSWR<EscrowPaymentDetails[]>(
    ['escrow-list', status],
    () => fetchEscrowList(status),
    {
      refreshInterval: autoRefresh ? refreshInterval : 0,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  const refresh = async () => {
    await mutate();
  };

  return {
    escrows: data || [],
    isLoading,
    error: error || null,
    refresh,
    mutate: async (newData?: EscrowPaymentDetails[]) => {
      await mutate(newData, false);
    },
  };
}

export default useEscrowList;
