/**
 * useModerationData Hook
 *
 * Custom hook for fetching moderation queue and stats data.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';
import {
  buildQueryParams,
  buildFetchHeaders,
} from '../utils/moderationHelpers';
import type {
  ModerationItem,
  ModerationStats,
  ModerationFilters,
  Pagination,
  UseModerationDataReturn,
} from '../types/moderationTypes';

export function useModerationData(
  filters: ModerationFilters,
  pagination: Pagination
): UseModerationDataReturn {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModerationQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = buildQueryParams(
        filters,
        pagination.page,
        pagination.limit
      );

      const response = await fetch(`/api/v1/admin/moderation/queue?${params}`, {
        headers: buildFetchHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Moderasyon kuyruğu alınamadı');
      }

      const data = await response.json();
      setItems(data.data.items);

      // Note: pagination state managed in parent component
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(errorMessage);
      logger.error('Moderasyon kuyruğu alınamadı:', err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  const fetchModerationStats = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/admin/moderation/stats', {
        headers: buildFetchHeaders(),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      logger.error('Moderasyon istatistikleri alınamadı:', err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  // Fetch queue when filters or pagination change
  useEffect(() => {
    fetchModerationQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filters]);

  // Fetch stats on mount
  useEffect(() => {
    fetchModerationStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetch = useCallback(() => {
    fetchModerationQueue();
    fetchModerationStats();
  }, [fetchModerationQueue, fetchModerationStats]);

  return {
    items,
    stats,
    isLoading,
    error,
    refetch,
  };
}
