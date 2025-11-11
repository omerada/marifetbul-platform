'use client';

/**
 * Unified Dashboard Orchestrator
 * Routes to role-specific dashboard views
 * Sprint 1 - Day 9 + Task 1.3
 */

import React, { useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { useDashboard } from '@/hooks/business/useDashboard';
import {
  approveComment,
  rejectComment,
  markCommentAsSpam,
} from '@/lib/api/moderation';
import logger from '@/lib/infrastructure/monitoring/logger';
import { DashboardSkeleton } from './DashboardSkeleton';
import { DashboardErrorBoundary } from './DashboardErrorBoundary';
import {
  FreelancerDashboardView,
  EmployerDashboardView,
  AdminDashboardView,
  ModeratorDashboardView,
} from './views';
import type { UserRole, ModeratorDashboard } from './types/dashboard.types';
import { RefreshCw, AlertCircle } from 'lucide-react';

export interface UnifiedDashboardProps {
  userId?: string;
  role?: UserRole;
  className?: string;
}

export function UnifiedDashboard({
  userId: _userId,
  role: propRole,
  className,
}: UnifiedDashboardProps) {
  const { user, isLoading: authLoading } = useAuthStore();
  const {
    dashboardData,
    isLoading: dashboardLoading,
    isRefreshing,
    error: dashboardError,
    retry,
  } = useDashboard();

  const userRole: UserRole = useMemo(() => {
    if (propRole) return propRole;
    if (user?.role) return user.role as UserRole;
    return 'FREELANCER';
  }, [propRole, user?.role]);

  // SPRINT 1 - Task 1.3: Moderation Action Handler
  const handleModerateAction = useCallback(
    async (itemId: string, action: 'approve' | 'reject' | 'spam') => {
      try {
        logger.debug('[UnifiedDashboard] Moderating item', { itemId, action });

        // Call appropriate API endpoint based on action
        switch (action) {
          case 'approve':
            await approveComment(itemId);
            logger.info('[UnifiedDashboard] Item approved', { itemId });
            break;
          case 'reject':
            await rejectComment(itemId, 'Rejected by moderator');
            logger.info('[UnifiedDashboard] Item rejected', { itemId });
            break;
          case 'spam':
            await markCommentAsSpam(itemId);
            logger.info('[UnifiedDashboard] Item marked as spam', { itemId });
            break;
          default:
            logger.warn('[UnifiedDashboard] Unknown action', { action });
        }

        // Refresh dashboard data after action
        await retry();

        // Show success toast notification
        const actionLabels = {
          approve: 'onayland�',
          reject: 'reddedildi',
          spam: 'spam olarak i�aretlendi',
        };
        toast.success(`��erik ba�ar�yla ${actionLabels[action]}`);
      } catch (error) {
        logger.error(
          '[UnifiedDashboard] Moderation action failed',
          error,
          { itemId, action }
        );

        // Show error toast notification
        toast.error('Moderasyon i�lemi ba�ar�s�z oldu. L�tfen tekrar deneyin.');
      }
    },
    [retry]
  );

  const isLoading = authLoading || dashboardLoading;

  if (isLoading && !dashboardData) {
    return (
      <div className={className}>
        <DashboardSkeleton />
      </div>
    );
  }

  if (!user && !authLoading) {
    return (
      <div className={className}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h2 className="mb-2 text-xl font-semibold">Oturum Gerekli</h2>
            <p className="text-gray-600">Dashboard i�in giri� yapmal�s�n�z.</p>
          </div>
        </div>
      </div>
    );
  }

  if (dashboardError && !dashboardData) {
    return (
      <div className={className}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-red-600" />
              <h3 className="mb-2 text-lg font-semibold">Y�klenemedi</h3>
              <p className="mb-4 text-sm text-gray-600">
                {dashboardError.message || 'Bir hata olu�tu.'}
              </p>
              <button
                onClick={() => retry()}
                disabled={isRefreshing}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                {isRefreshing ? 'Yenileniyor...' : 'Tekrar Dene'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (userRole) {
      case 'ADMIN':
        return (
          <AdminDashboardView
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data={dashboardData as any}
            isLoading={isLoading || isRefreshing}
            error={dashboardError ? new Error(dashboardError.message) : null}
            onRefresh={retry}
          />
        );
      case 'MODERATOR':
        return (
          <ModeratorDashboardView
            data={dashboardData as ModeratorDashboard}
            isLoading={isLoading || isRefreshing}
            error={dashboardError ? new Error(dashboardError.message) : null}
            onRefresh={retry}
            onModerate={handleModerateAction}
          />
        );
      case 'EMPLOYER':
        return (
          <EmployerDashboardView
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data={dashboardData as any}
            isLoading={isLoading || isRefreshing}
            error={dashboardError?.message || null}
            onRefresh={retry}
          />
        );
      case 'FREELANCER':
      default:
        return (
          <FreelancerDashboardView
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data={dashboardData as any}
            isLoading={isLoading || isRefreshing}
            error={dashboardError?.message || null}
            onRefresh={retry}
          />
        );
    }
  };

  return (
    <DashboardErrorBoundary>
      <div className={className}>{renderView()}</div>
    </DashboardErrorBoundary>
  );
}

export default UnifiedDashboard;
