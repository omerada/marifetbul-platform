/**
 * useDisputeStatistics Hook
 * Fetch dispute statistics for admin dashboard
 */

import useSWR from 'swr';
import { getDisputeStatistics } from '@/lib/api/disputes';
import type { DisputeStatistics } from '@/types/dispute';

export function useDisputeStatistics() {
  const { data, error, isLoading, mutate } = useSWR<DisputeStatistics>(
    '/api/v1/disputes/admin/statistics',
    getDisputeStatistics,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  );

  return {
    statistics: data,
    isLoading,
    error,
    refresh: mutate,
  };
}
