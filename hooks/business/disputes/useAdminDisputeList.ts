/**
 * useAdminDisputeList Hook
 * Fetch disputes for admin with filters and pagination
 */

import useSWR from 'swr';
import { getAllDisputes, getDisputesWithFilters } from '@/lib/api/disputes';
import type {
  DisputeResponse,
  DisputeFilters,
  PageResponse,
} from '@/types/dispute';

interface UseAdminDisputeListOptions {
  filters?: DisputeFilters;
  enableFilters?: boolean;
}

export function useAdminDisputeList(options: UseAdminDisputeListOptions = {}) {
  const { filters, enableFilters = false } = options;

  // Build cache key
  const cacheKey =
    enableFilters && filters
      ? `/api/v1/disputes/admin/search?${JSON.stringify(filters)}`
      : `/api/v1/disputes/admin/all`;

  const { data, error, isLoading, mutate } = useSWR<
    DisputeResponse[] | PageResponse<DisputeResponse>
  >(
    cacheKey,
    async () => {
      if (enableFilters && filters) {
        return getDisputesWithFilters(filters);
      }
      return getAllDisputes({ page: filters?.page, size: filters?.size });
    },
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  // Normalize response
  const disputes = Array.isArray(data)
    ? data
    : (data as PageResponse<DisputeResponse>)?.content || [];

  const pagination =
    !Array.isArray(data) && data
      ? {
          pageNumber: data.page,
          pageSize: data.size,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          first: data.first,
          last: data.last,
        }
      : null;

  return {
    disputes,
    pagination,
    isLoading,
    error,
    mutate,
  };
}
