/**
 * ================================================
 * AUTO REFRESH HOOK
 * ================================================
 * Provides automatic refresh functionality with polling
 * Handles background updates for real-time data
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '@/lib/shared/utils/logger';

// ================================================
// TYPES
// ================================================

export interface UseAutoRefreshOptions {
  /**
   * Refresh interval in milliseconds
   * @default 30000 (30 seconds)
   */
  interval?: number;

  /**
   * Whether to start refreshing immediately
   * @default true
   */
  enabled?: boolean;

  /**
   * Whether to refresh on window focus
   * @default true
   */
  refreshOnFocus?: boolean;

  /**
   * Whether to refresh on network reconnect
   * @default true
   */
  refreshOnReconnect?: boolean;

  /**
   * Callback when refresh starts
   */
  onRefreshStart?: () => void;

  /**
   * Callback when refresh completes successfully
   */
  onRefreshSuccess?: () => void;

  /**
   * Callback when refresh fails
   */
  onRefreshError?: (error: Error) => void;
}

export interface UseAutoRefreshResult {
  /**
   * Whether refresh is currently in progress
   */
  isRefreshing: boolean;

  /**
   * Manually trigger a refresh
   */
  refresh: () => Promise<void>;

  /**
   * Start auto-refresh
   */
  start: () => void;

  /**
   * Stop auto-refresh
   */
  stop: () => void;

  /**
   * Time until next refresh (seconds)
   */
  timeUntilRefresh: number;

  /**
   * Last refresh timestamp
   */
  lastRefresh: Date | null;
}

// ================================================
// HOOK
// ================================================

/**
 * Hook for automatic data refresh with polling
 *
 * @example
 * ```tsx
 * const { isRefreshing, refresh, timeUntilRefresh } = useAutoRefresh(
 *   async () => {
 *     const data = await fetchData();
 *     setData(data);
 *   },
 *   { interval: 30000 }
 * );
 * ```
 */
export function useAutoRefresh(
  refreshFn: () => Promise<void>,
  options: UseAutoRefreshOptions = {}
): UseAutoRefreshResult {
  const {
    interval = 30000, // 30 seconds default
    enabled = true,
    refreshOnFocus = true,
    refreshOnReconnect = true,
    onRefreshStart,
    onRefreshSuccess,
    onRefreshError,
  } = options;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(
    Math.floor(interval / 1000)
  );
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const refreshFnRef = useRef(refreshFn);

  // Update ref when function changes
  useEffect(() => {
    refreshFnRef.current = refreshFn;
  }, [refreshFn]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      onRefreshStart?.();

      await refreshFnRef.current();

      setLastRefresh(new Date());
      setTimeUntilRefresh(Math.floor(interval / 1000));
      onRefreshSuccess?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Refresh failed');
      onRefreshError?.(err);
      logger.error('Auto-refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    isRefreshing,
    interval,
    onRefreshStart,
    onRefreshSuccess,
    onRefreshError,
  ]);

  // Start auto-refresh
  const start = useCallback(() => {
    setIsEnabled(true);
  }, []);

  // Stop auto-refresh
  const stop = useCallback(() => {
    setIsEnabled(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  // Setup auto-refresh interval
  useEffect(() => {
    if (!isEnabled) {
      stop();
      return;
    }

    // Initial refresh
    refresh();

    // Setup polling interval
    intervalRef.current = setInterval(() => {
      refresh();
    }, interval);

    // Setup countdown interval (1 second)
    countdownRef.current = setInterval(() => {
      setTimeUntilRefresh((prev) => {
        if (prev <= 1) {
          return Math.floor(interval / 1000);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isEnabled, interval, refresh, stop]);

  // Refresh on window focus
  useEffect(() => {
    if (!refreshOnFocus || !isEnabled) return;

    const handleFocus = () => {
      // Only refresh if last refresh was more than 5 seconds ago
      const timeSinceLastRefresh = lastRefresh
        ? Date.now() - lastRefresh.getTime()
        : Infinity;

      if (timeSinceLastRefresh > 5000) {
        refresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshOnFocus, isEnabled, lastRefresh, refresh]);

  // Refresh on network reconnect
  useEffect(() => {
    if (!refreshOnReconnect || !isEnabled) return;

    const handleOnline = () => {
      refresh();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [refreshOnReconnect, isEnabled, refresh]);

  return {
    isRefreshing,
    refresh,
    start,
    stop,
    timeUntilRefresh,
    lastRefresh,
  };
}

export default useAutoRefresh;
