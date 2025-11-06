/**
 * ================================================
 * WALLET POLLING HOOK - Real-time Updates
 * ================================================
 * Sprint 1 - Task 1.1.5
 *
 * Provides real-time wallet updates with automatic polling
 * Refreshes wallet data at specified intervals
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useWallet } from './useWallet';
import { useTransactions } from './useTransactions';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface UseWalletPollingOptions {
  /**
   * Polling interval in milliseconds
   * @default 30000 (30 seconds)
   */
  interval?: number;

  /**
   * Whether polling is enabled
   * @default true
   */
  enabled?: boolean;

  /**
   * Whether to poll transactions as well
   * @default true
   */
  includeTransactions?: boolean;

  /**
   * Callback when polling updates data
   */
  onUpdate?: () => void;

  /**
   * Callback when polling encounters an error
   */
  onError?: (error: string) => void;
}

export interface UseWalletPollingReturn {
  /**
   * Whether polling is currently active
   */
  isPolling: boolean;

  /**
   * Manually trigger a poll
   */
  poll: () => Promise<void>;

  /**
   * Pause polling
   */
  pause: () => void;

  /**
   * Resume polling
   */
  resume: () => void;

  /**
   * Last poll timestamp
   */
  lastPollTime: Date | null;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for real-time wallet updates with automatic polling
 *
 * @param options - Polling configuration options
 * @returns Polling state and controls
 *
 * @example
 * ```tsx
 * const { isPolling, pause, resume, lastPollTime } = useWalletPolling({
 *   interval: 30000, // 30 seconds
 *   enabled: true,
 *   onUpdate: () => logger.debug('Wallet updated!'),
 * });
 *
 * return (
 *   <div>
 *     <div>Polling: {isPolling ? 'Active' : 'Paused'}</div>
 *     <button onClick={isPolling ? pause : resume}>
 *       {isPolling ? 'Pause' : 'Resume'}
 *     </button>
 *     {lastPollTime && (
 *       <div>Last update: {lastPollTime.toLocaleTimeString()}</div>
 *     )}
 *   </div>
 * );
 * ```
 */
export const useWalletPolling = (
  options: UseWalletPollingOptions = {}
): UseWalletPollingReturn => {
  const {
    interval = 30000, // 30 seconds default
    enabled = true,
    includeTransactions = true,
    onUpdate,
    onError,
  } = options;

  // ==================== REFS ====================

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef = useRef(false);
  const lastPollTimeRef = useRef<Date | null>(null);
  const isMountedRef = useRef(true);

  // ==================== HOOKS ====================

  const { fetchWallet, fetchBalance, error: walletError } = useWallet(false);
  const { refresh: refreshTransactions } = useTransactions(false);

  // ==================== CALLBACKS ====================

  const poll = useCallback(async () => {
    if (isPausedRef.current || !isMountedRef.current) {
      return;
    }

    try {
      // Fetch wallet and balance
      await Promise.all([fetchWallet(), fetchBalance()]);

      // Optionally fetch transactions
      if (includeTransactions && refreshTransactions) {
        await refreshTransactions();
      }

      // Update last poll time
      lastPollTimeRef.current = new Date();

      // Trigger onUpdate callback
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Polling failed';

      if (onError) {
        onError(errorMessage);
      }

      logger.error('[useWalletPolling] Poll failed:', errorMessage);
    }
  }, [
    fetchWallet,
    fetchBalance,
    includeTransactions,
    refreshTransactions,
    onUpdate,
    onError,
  ]);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resume = useCallback(() => {
    isPausedRef.current = false;
    if (!intervalRef.current && enabled) {
      // Trigger immediate poll
      poll();

      // Setup interval
      intervalRef.current = setInterval(poll, interval);
    }
  }, [enabled, interval, poll]);

  // ==================== EFFECTS ====================

  // Setup polling
  useEffect(() => {
    if (!enabled) {
      pause();
      return;
    }

    // Initial poll
    poll();

    // Setup interval
    intervalRef.current = setInterval(poll, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, poll, pause]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle wallet errors
  useEffect(() => {
    if (walletError && onError) {
      onError(walletError);
    }
  }, [walletError, onError]);

  // ==================== RETURN ====================

  return {
    isPolling: !isPausedRef.current && enabled,
    poll,
    pause,
    resume,
    lastPollTime: lastPollTimeRef.current,
  };
};

export default useWalletPolling;
