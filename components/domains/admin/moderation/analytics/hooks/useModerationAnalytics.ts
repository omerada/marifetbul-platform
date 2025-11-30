/**
 * Moderation Analytics Hook
 *
 * Custom hook for managing moderation analytics state and data fetching.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  ModerationAnalytics,
  AnalyticsFilters,
  ExportFormat,
} from '../types/moderationAnalytics';
import {
  API_ENDPOINTS,
  DEFAULT_FILTERS,
} from '../constants/analyticsConstants';

interface UseModerationAnalyticsReturn {
  analytics: ModerationAnalytics | null;
  isLoading: boolean;
  error: string | null;
  filters: AnalyticsFilters;
  refreshInterval: number | null;
  setFilter: <K extends keyof AnalyticsFilters>(
    key: K,
    value: AnalyticsFilters[K]
  ) => void;
  clearFilters: () => void;
  setRefreshInterval: (interval: number | null) => void;
  refreshData: () => Promise<void>;
  exportData: (format: ExportFormat) => Promise<void>;
}

export function useModerationAnalytics(): UseModerationAnalyticsReturn {
  const [analytics, setAnalytics] = useState<ModerationAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>(DEFAULT_FILTERS);
  const [refreshInterval, setRefreshIntervalState] = useState<number | null>(
    null
  );

  /**
   * Fetch analytics data from API
   */
  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('period', filters.dateRange);

      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.moderators.length > 0) {
        params.append('moderators', filters.moderators.join(','));
      }
      if (filters.categories.length > 0) {
        params.append('categories', filters.categories.join(','));
      }
      if (filters.contentTypes.length > 0) {
        params.append('contentTypes', filters.contentTypes.join(','));
      }
      if (filters.actionTypes.length > 0) {
        params.append('actionTypes', filters.actionTypes.join(','));
      }

      const response = await fetch(`${API_ENDPOINTS.analytics}?${params}`);

      if (!response.ok) {
        throw new Error('Analitik veriler yüklenemedi');
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu';
      logger.error('Error fetching analytics:', err instanceof Error ? err : new Error(String(err)));
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  /**
   * Export analytics data
   */
  const exportData = useCallback(
    async (format: ExportFormat) => {
      try {
        const params = new URLSearchParams();
        params.append('format', format);
        params.append('period', filters.dateRange);

        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);

        const response = await fetch(`${API_ENDPOINTS.export}?${params}`);

        if (!response.ok) {
          throw new Error('Veri dışa aktarılamadı');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `moderation-analytics-${format}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);

      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Dışa aktarma başarısız';
        logger.error('Error exporting data:', err instanceof Error ? err : new Error(String(err)));
        setError(message);
      }
    },
    [filters]
  );

  /**
   * Update single filter
   */
  const setFilter = useCallback(
    <K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  /**
   * Reset all filters to defaults
   */
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  /**
   * Set auto-refresh interval
   */
  const setRefreshInterval = useCallback((interval: number | null) => {
    setRefreshIntervalState(interval);
  }, []);

  /**
   * Manual refresh
   */
  const refreshData = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Setup auto-refresh interval
  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(fetchAnalytics, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    filters,
    refreshInterval,
    setFilter,
    clearFilters,
    setRefreshInterval,
    refreshData,
    exportData,
  };
}
