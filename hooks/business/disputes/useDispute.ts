/**
 * useDispute Hook
 * Fetch single dispute with auto-refresh
 */

import useSWR from 'swr';
import { getDispute } from '@/lib/api/disputes';
import type { DisputeResponse } from '@/types/dispute';

interface UseDisputeOptions {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
}

export function useDispute(
  disputeId: string | null,
  options: UseDisputeOptions = {}
) {
  const { refreshInterval = 0, revalidateOnFocus = true } = options;

  const { data, error, isLoading, mutate } = useSWR<DisputeResponse | null>(
    disputeId ? `/api/v1/disputes/${disputeId}` : null,
    disputeId ? () => getDispute(disputeId) : null,
    {
      refreshInterval,
      revalidateOnFocus,
    }
  );

  return {
    dispute: data,
    isLoading,
    error,
    mutate,
  };
}
