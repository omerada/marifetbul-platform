/**
 * ================================================
 * ADMIN MAIN DASHBOARD PAGE
 * ================================================
 * Entry point for admin panel - comprehensive platform overview
 *
 * Route: /admin
 * Access: Admin only (protected by middleware)
 *
 * Features:
 * - Platform-wide statistics
 * - Real-time system health monitoring
 * - Revenue & user analytics
 * - Search performance metrics
 * - Top performing packages
 * - Recent activity timeline
 * - Quick action shortcuts
 *
 * @version 1.0.0
 * @created 2025-11-17
 * @sprint Sprint 1: Admin Dashboard & User Management
 * @author MarifetBul Development Team
 */

'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { useAdminDashboard } from '@/hooks/business/useAdminDashboard';
import { AdminDashboardView } from '@/components/domains/dashboard/views/AdminDashboardView';
import { DashboardErrorBoundary } from '@/components/domains/dashboard';
import { adaptAdminDashboard } from '@/components/domains/dashboard/utils/dashboardAdapters';
import { Loading } from '@/components/ui';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { AdminDashboard } from '@/components/domains/dashboard/types/dashboard.types';

export const dynamic = 'force-dynamic';

/**
 * Admin Dashboard Page Component
 *
 * Renders comprehensive admin dashboard with:
 * - Auto-refresh every 5 minutes (via hook)
 * - Error boundary for graceful error handling
 * - Loading states
 * - Role-based access control
 * - Backend data transformation
 */
export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();

  // Fetch admin dashboard data from backend
  const {
    backendData,
    isLoading: dashboardLoading,
    error,
    refresh,
  } = useAdminDashboard();

  // Transform backend data to AdminDashboard type
  const transformedData = useMemo<AdminDashboard | null>(() => {
    if (!backendData) return null;

    try {
      // Convert AdminDashboardBackendDto to AdminDashboardApiResponse format
      // Handle optional fields with defaults
      const apiResponse = {
        ...backendData,
        searchMetrics: {
          totalSearches: backendData.searchMetrics?.totalSearches ?? 0,
          uniqueSearchers: backendData.searchMetrics?.uniqueSearchers ?? 0,
          zeroResultSearches:
            backendData.searchMetrics?.zeroResultSearches ?? 0,
          zeroResultRate: backendData.searchMetrics?.zeroResultRate ?? 0,
          clickThroughRate: backendData.searchMetrics?.clickThroughRate ?? 0,
          searchToOrderConversionRate:
            backendData.searchMetrics?.searchToOrderConversionRate ?? 0,
          conversionRate: backendData.searchMetrics?.conversionRate ?? 0,
          averageResultCount:
            backendData.searchMetrics?.averageResultCount ?? 0,
          topKeywords: backendData.searchMetrics?.topKeywords ?? [],
          zeroResultKeywords:
            backendData.searchMetrics?.zeroResultKeywords ?? [],
          searchesByCategory:
            backendData.searchMetrics?.searchesByCategory ?? {},
        },
        activityMetrics: {
          totalActivities: backendData.activityMetrics?.totalActivities ?? 0,
          apiCalls: backendData.activityMetrics?.apiCalls ?? 0,
          pageViews: backendData.activityMetrics?.pageViews ?? 0,
          averageResponseTime:
            backendData.activityMetrics?.averageResponseTime ?? 0,
          slowRequests: backendData.activityMetrics?.slowRequests ?? 0,
          errorRequests: backendData.activityMetrics?.errorRequests ?? 0,
          errorRate: backendData.activityMetrics?.errorRate ?? 0,
          activitiesByType: backendData.activityMetrics?.activitiesByType ?? {},
          activitiesByCategory:
            backendData.activityMetrics?.activitiesByCategory ?? {},
          activitiesByHour: backendData.activityMetrics?.activitiesByHour ?? {},
        },
        cacheAgeSeconds: backendData.cacheAgeSeconds ?? 0,
      };

      return adaptAdminDashboard(apiResponse);
    } catch (transformError) {
      logger.error(
        'Failed to transform admin dashboard data',
        transformError instanceof Error
          ? transformError
          : new Error(String(transformError))
      );
      return null;
    }
  }, [backendData]);

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && user && user.role !== 'ADMIN') {
      logger.warn('Non-admin user attempted to access admin dashboard', {
        userId: user.id,
        role: user.role,
      });
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Loading state during auth check
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loading size="lg" text="Yetki kontrol ediliyor..." />
      </div>
    );
  }

  // User not found or not admin
  if (!user || user.role !== 'ADMIN') {
    return null; // Will redirect in useEffect
  }

  // Convert error string to Error object if needed
  const errorObject = error ? new Error(error) : null;

  return (
    <DashboardErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <AdminDashboardView
          data={transformedData}
          isLoading={dashboardLoading}
          error={errorObject}
          onRefresh={refresh}
        />
      </div>
    </DashboardErrorBoundary>
  );
}
