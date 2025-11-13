'use client';

/**
 * Dashboard Snapshots Hook
 *
 * Provides lightweight dashboard snapshots with caching and auto-refresh.
 * Used for quick stats, header widgets, and real-time updates.
 *
 * Backend endpoints:
 * - GET /api/v1/dashboard/admin/snapshot → PlatformSnapshot
 * - GET /api/v1/dashboard/seller/me/snapshot → SellerSnapshot
 * - GET /api/v1/dashboard/buyer/me/snapshot → BuyerSnapshot
 *
 * @sprint Sprint 1 - Story 2: Dashboard Snapshot System
 * @version 1.0.0
 * @date November 6, 2025
 * @author MarifetBul Team
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  PlatformSnapshot,
  SellerSnapshot,
  BuyerSnapshot,
  SnapshotState,
} from '@/types/backend/dashboard';

// ==================== Platform Snapshot Hook ====================

/**
 * Hook for platform-wide snapshot (Admin only)
 *
 * Features:
 * - Auto-refresh every 5 minutes (matches backend cache TTL)
 * - Error handling with retry
 * - Loading states
 * - Manual refresh capability
 *
 * @param autoRefresh Enable automatic refresh (default: true)
 * @param refreshInterval Refresh interval in ms (default: 5 minutes)
 */
export function usePlatformSnapshot(
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000 // 5 minutes
): SnapshotState<PlatformSnapshot> & { refresh: () => Promise<void> } {
  const [state, setState] = useState<SnapshotState<PlatformSnapshot>>({
    data: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSnapshot = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/v1/dashboard/admin/snapshot', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch platform snapshot: ${response.status}`
        );
      }

      const result = await response.json();

      if (result?.success && result?.data) {
        setState({
          data: result.data,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch platform snapshot';

      setState({
        data: null,
        isLoading: false,
        error: errorMessage,
        lastUpdated: null,
      });

      logger.error(
        'Platform snapshot error:',
        err instanceof Error ? err : new Error(String(err))
      );
    }
  }, []);

  useEffect(() => {
    fetchSnapshot();

    if (!autoRefresh) {
      return;
    }

    // Auto-refresh at specified interval
    const interval = setInterval(fetchSnapshot, refreshInterval);

    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchSnapshot, autoRefresh, refreshInterval]);

  return {
    ...state,
    refresh: fetchSnapshot,
  };
}

// ==================== Seller Snapshot Hook ====================

/**
 * Hook for seller performance snapshot
 *
 * Features:
 * - Auto-refresh every 2 minutes (matches backend cache TTL)
 * - Automatic user context from auth store
 * - Error handling with retry
 * - Loading states
 *
 * @param autoRefresh Enable automatic refresh (default: true)
 * @param refreshInterval Refresh interval in ms (default: 2 minutes)
 */
export function useSellerSnapshot(
  autoRefresh = true,
  refreshInterval = 2 * 60 * 1000 // 2 minutes
): SnapshotState<SellerSnapshot> & { refresh: () => Promise<void> } {
  const { user } = useAuthStore();
  const [state, setState] = useState<SnapshotState<SellerSnapshot>>({
    data: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSnapshot = useCallback(async () => {
    if (!user || user.userType !== 'freelancer') {
      setState({
        data: null,
        isLoading: false,
        error: 'User is not a seller',
        lastUpdated: null,
      });
      return;
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/v1/dashboard/seller/me/snapshot', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch seller snapshot: ${response.status}`);
      }

      const result = await response.json();

      if (result?.success && result?.data) {
        setState({
          data: result.data,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch seller snapshot';

      setState({
        data: null,
        isLoading: false,
        error: errorMessage,
        lastUpdated: null,
      });

      logger.error(
        'Seller snapshot error:',
        err instanceof Error ? err : new Error(String(err))
      );
    }
  }, [user]);

  useEffect(() => {
    fetchSnapshot();

    if (!autoRefresh) {
      return;
    }

    // Auto-refresh at specified interval
    const interval = setInterval(fetchSnapshot, refreshInterval);

    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchSnapshot, autoRefresh, refreshInterval]);

  return {
    ...state,
    refresh: fetchSnapshot,
  };
}

// ==================== Buyer Snapshot Hook ====================

/**
 * Hook for buyer activity snapshot
 *
 * Features:
 * - Auto-refresh every 2 minutes (matches backend cache TTL)
 * - Automatic user context from auth store
 * - Error handling with retry
 * - Loading states
 *
 * @param autoRefresh Enable automatic refresh (default: true)
 * @param refreshInterval Refresh interval in ms (default: 2 minutes)
 */
export function useBuyerSnapshot(
  autoRefresh = true,
  refreshInterval = 2 * 60 * 1000 // 2 minutes
): SnapshotState<BuyerSnapshot> & { refresh: () => Promise<void> } {
  const { user } = useAuthStore();
  const [state, setState] = useState<SnapshotState<BuyerSnapshot>>({
    data: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSnapshot = useCallback(async () => {
    if (!user || user.userType !== 'employer') {
      setState({
        data: null,
        isLoading: false,
        error: 'User is not a buyer',
        lastUpdated: null,
      });
      return;
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/v1/dashboard/buyer/me/snapshot', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch buyer snapshot: ${response.status}`);
      }

      const result = await response.json();

      if (result?.success && result?.data) {
        setState({
          data: result.data,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch buyer snapshot';

      setState({
        data: null,
        isLoading: false,
        error: errorMessage,
        lastUpdated: null,
      });

      logger.error(
        'Buyer snapshot error:',
        err instanceof Error ? err : new Error(String(err))
      );
    }
  }, [user]);

  useEffect(() => {
    fetchSnapshot();

    if (!autoRefresh) {
      return;
    }

    // Auto-refresh at specified interval
    const interval = setInterval(fetchSnapshot, refreshInterval);

    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchSnapshot, autoRefresh, refreshInterval]);

  return {
    ...state,
    refresh: fetchSnapshot,
  };
}

// ==================== Unified Snapshot Hook ====================

/**
 * Unified hook that automatically selects the right snapshot based on user role
 *
 * Returns:
 * - Platform snapshot for admins
 * - Seller snapshot for freelancers
 * - Buyer snapshot for employers
 * - null for unauthenticated users
 *
 * @param autoRefresh Enable automatic refresh (default: true)
 */
export function useDashboardSnapshot(autoRefresh = true) {
  const { user } = useAuthStore();

  const platformSnapshot = usePlatformSnapshot(
    autoRefresh && user?.role === 'ADMIN',
    5 * 60 * 1000
  );

  const sellerSnapshot = useSellerSnapshot(
    autoRefresh && user?.userType === 'freelancer',
    2 * 60 * 1000
  );

  const buyerSnapshot = useBuyerSnapshot(
    autoRefresh && user?.userType === 'employer',
    2 * 60 * 1000
  );

  // Return appropriate snapshot based on user role
  if (user?.role === 'ADMIN') {
    return {
      type: 'platform' as const,
      ...platformSnapshot,
    };
  }

  if (user?.userType === 'freelancer') {
    return {
      type: 'seller' as const,
      ...sellerSnapshot,
    };
  }

  if (user?.userType === 'employer') {
    return {
      type: 'buyer' as const,
      ...buyerSnapshot,
    };
  }

  return {
    type: 'none' as const,
    data: null,
    isLoading: false,
    error: 'User not authenticated',
    lastUpdated: null,
    refresh: async () => {},
  };
}
