'use client';

/**
 * Dashboard Stats Hook
 * Sprint 1: Dashboard System
 *
 * Provides real-time dashboard statistics with automatic refresh
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import logger from '@/lib/infrastructure/monitoring/logger';

interface DashboardStats {
  revenue?: {
    totalRevenue: number;
    netEarnings: number;
    totalOrders: number;
    averageOrderValue: number;
    availableBalance: number;
    pendingBalance: number;
  };
  packagePerformance?: {
    totalPackages: number;
    activePackages: number;
    totalViews: number;
    totalOrders: number;
    conversionRate: number;
  };
  performanceMetrics?: {
    averageRating: number;
    totalReviews: number;
    completionRate: number;
    onTimeDeliveryRate: number;
    responseRate: number;
    repeatCustomerRate: number;
  };
  orderSummary?: {
    totalOrders: number;
    completedOrders: number;
    inProgressOrders: number;
    totalSpent: number;
    averageOrderValue: number;
  };
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user?.userType) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const endpoint =
        user.userType === 'freelancer'
          ? '/api/v1/dashboard/seller/me'
          : '/api/v1/dashboard/buyer/me';

      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      const data = await response.json();

      if (data?.success && data?.data) {
        setStats(data.data);
      } else {
        setStats(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(errorMessage);
      logger.error('Dashboard stats error:', err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [user?.userType]);

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 5 minutes
    const interval = setInterval(
      () => {
        fetchStats();
      },
      5 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
