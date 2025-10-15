/**
 * useContentAppeals Hook
 *
 * Custom hook for managing content appeal system state.
 * Handles data fetching, filtering, and actions for content appeals.
 */

import { useState, useCallback, useEffect } from 'react';
import { logger } from '@/lib/shared/utils/logger';
import type {
  ContentAppeal,
  AppealStats,
  AppealFilters,
  AppealActionPayload,
} from '../types/appeal';
import { API_ENDPOINTS, DEFAULT_FILTERS } from '../constants/appealConstants';

interface UseContentAppealsReturn {
  // Data
  appeals: ContentAppeal[];
  stats: AppealStats | null;

  // UI State
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Filters
  filters: AppealFilters;
  setFilter: (key: keyof AppealFilters, value: string) => void;
  clearFilters: () => void;

  // Actions
  fetchAppeals: () => Promise<void>;
  fetchStats: () => Promise<void>;
  handleAppealAction: (
    appealId: string,
    payload: AppealActionPayload
  ) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export function useContentAppeals(): UseContentAppealsReturn {
  // Data state
  const [appeals, setAppeals] = useState<ContentAppeal[]>([]);
  const [stats, setStats] = useState<AppealStats | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<AppealFilters>(DEFAULT_FILTERS);

  /**
   * Fetch appeals from API with current filters
   */
  const fetchAppeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.priority !== 'all')
        params.append('priority', filters.priority);
      if (filters.reason !== 'all') params.append('reason', filters.reason);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`${API_ENDPOINTS.appeals}?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setAppeals(data.appeals || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'İtirazlar yüklenirken hata oluştu';
      logger.error('Error fetching appeals:', err);
      setError(errorMessage);
      setAppeals([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  /**
   * Fetch appeal statistics
   */
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.stats);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      logger.error('Error fetching stats:', err);
      // Don't set error for stats - it's not critical
    }
  }, []);

  /**
   * Handle appeal action (approve, reject, escalate, etc.)
   */
  const handleAppealAction = useCallback(
    async (
      appealId: string,
      payload: AppealActionPayload
    ): Promise<boolean> => {
      setIsSaving(true);
      setError(null);

      try {
        const response = await fetch(API_ENDPOINTS.action(appealId), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          // Refresh data after successful action
          await Promise.all([fetchAppeals(), fetchStats()]);
          return true;
        }

        throw new Error(data.message || 'İşlem başarısız oldu');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'İşlem sırasında hata oluştu';
        logger.error('Error processing appeal action:', err);
        setError(errorMessage);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [fetchAppeals, fetchStats]
  );

  /**
   * Update a specific filter
   */
  const setFilter = useCallback((key: keyof AppealFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    await Promise.all([fetchAppeals(), fetchStats()]);
  }, [fetchAppeals, fetchStats]);

  /**
   * Fetch data on mount and when filters change
   */
  useEffect(() => {
    fetchAppeals();
  }, [fetchAppeals]);

  /**
   * Fetch stats on mount
   */
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    // Data
    appeals,
    stats,

    // UI State
    isLoading,
    isSaving,
    error,

    // Filters
    filters,
    setFilter,
    clearFilters,

    // Actions
    fetchAppeals,
    fetchStats,
    handleAppealAction,
    refreshData,
  };
}
