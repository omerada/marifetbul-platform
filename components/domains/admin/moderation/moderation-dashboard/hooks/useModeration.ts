/**
 * useModeration Hook
 *
 * Custom hook for moderation dashboard state and logic
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';
import { filterItems } from '../utils/moderationHelpers';
import { DEFAULT_FILTERS, EMPTY_STATS } from '../utils/moderationConstants';
import type {
  ModerationStats,
  ModerationItem,
  ModerationFilters,
  ModerationAction,
} from '../types/moderationDashboardTypes';

export function useModeration() {
  // State
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [filters, setFilters] = useState<ModerationFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(true);

  // Computed: Filtered items
  const filteredItems = filterItems(items, filters);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [statsResponse, itemsResponse] = await Promise.all([
        fetch('/api/v1/admin/moderation/stats', {
          method: 'GET',
          credentials: 'include',
        }),
        fetch('/api/v1/admin/moderation/items', {
          method: 'GET',
          credentials: 'include',
        }),
      ]);

      if (!statsResponse.ok || !itemsResponse.ok) {
        throw new Error('Failed to fetch moderation data');
      }

      const statsData = await statsResponse.json();
      const itemsData = await itemsResponse.json();

      setStats(statsData.data);
      setItems(itemsData.data || []);
    } catch (error) {
      logger.error(
        'Error fetching moderation data:',
        error instanceof Error ? error : new Error(String(error))
      );
      setStats(EMPTY_STATS);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update filter
  const updateFilter = useCallback(
    (key: keyof ModerationFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Update search
  const updateSearch = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  // Handle item action
  const handleItemAction = useCallback(
    async (itemId: string, action: ModerationAction) => {
      try {
        // Optimistic update
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  status:
                    action === 'approve'
                      ? 'approved'
                      : action === 'reject'
                        ? 'rejected'
                        : 'escalated',
                  reviewedAt: new Date(),
                  reviewedBy: 'current_admin',
                }
              : item
          )
        );

        // API call
        await fetch(`/api/v1/admin/moderation/items/${itemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ action }),
        });
      } catch (error) {
        logger.error(
          `Failed to ${action} item:`,
          error instanceof Error ? error : new Error(String(error))
        );
        // Revert on error
        fetchData();
      }
    },
    [fetchData]
  );

  return {
    stats,
    items,
    filteredItems,
    filters,
    isLoading,
    updateFilter,
    updateSearch,
    refresh: fetchData,
    handleItemAction,
  };
}
