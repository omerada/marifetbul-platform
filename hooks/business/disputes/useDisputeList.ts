/**
 * useDisputeList Hook
 * Fetch user's disputes with pagination and filters
 */

import useSWR from 'swr';
import { getMyDisputes } from '@/lib/api/disputes';
import type { DisputeResponse } from '@/types/dispute';

interface UseDisputeListOptions {
  page?: number;
  size?: number;
  refreshInterval?: number;
}

export function useDisputeList(options: UseDisputeListOptions = {}) {
  const {
    page = 0,
    size = 10,
    refreshInterval = 30000, // Refresh every 30 seconds
  } = options;

  const { data, error, isLoading, mutate } = useSWR<DisputeResponse[]>(
    `/api/v1/disputes/my?page=${page}&size=${size}`,
    () => getMyDisputes({ page, size }),
    {
      refreshInterval,
      revalidateOnFocus: true,
    }
  );

  return {
    disputes: data || [],
    isLoading,
    error,
    mutate,
  };
}
