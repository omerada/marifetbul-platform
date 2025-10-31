/**
 * ================================================
 * USE ORDER STATS HOOK
 * ================================================
 * Custom hook for fetching order statistics
 *
 * Features:
 * - Auto-refresh on mount
 * - Polling support
 * - Error handling
 * - Loading state
 * - TypeScript support
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2: Order System Enhancement
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { OrderStats } from '@/types/business/features/orders';
import { toast } from 'sonner';

// ================================================
// TYPES
// ================================================

interface UseOrderStatsOptions {
  /** Auto-load stats on mount */
  autoLoad?: boolean;
  /** Enable automatic polling */
  enablePolling?: boolean;
  /** Polling interval in milliseconds */
  pollingInterval?: number;
  /** Show error toast on failure */
  showErrorToast?: boolean;
}

interface UseOrderStatsReturn {
  /** Current statistics */
  stats: OrderStats | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Refresh statistics */
  refresh: () => Promise<void>;
  /** Clear error */
  clearError: () => void;
}

// ================================================
// HOOK
// ================================================

export function useOrderStats(
  options: UseOrderStatsOptions = {}
): UseOrderStatsReturn {
  const {
    autoLoad = true,
    enablePolling = false,
    pollingInterval = 30000, // 30 seconds
    showErrorToast = false,
  } = options;

  // ================================================
  // STATE
  // ================================================

  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ================================================
  // API FETCH
  // ================================================

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/v1/orders/stats/me', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('İstatistikler yüklenemedi');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMessage);

      if (showErrorToast) {
        toast.error('İstatistikler yüklenemedi', {
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [showErrorToast]);

  // ================================================
  // EFFECTS
  // ================================================

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      fetchStats();
    }
  }, [autoLoad, fetchStats]);

  // Polling
  useEffect(() => {
    if (!enablePolling) return;

    const interval = setInterval(() => {
      fetchStats();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [enablePolling, pollingInterval, fetchStats]);

  // ================================================
  // HANDLERS
  // ================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ================================================
  // RETURN
  // ================================================

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
    clearError,
  };
}
