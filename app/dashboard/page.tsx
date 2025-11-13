/**
 * ================================================
 * UNIFIED DASHBOARD ENTRY POINT
 * ================================================
 * Main dashboard page that renders unified dashboard based on user role
 * Single entry point for ALL user types (FREELANCER, EMPLOYER, ADMIN, MODERATOR)
 *
 * Sprint Day 9 - Dashboard Consolidation Complete
 * @version 3.0.0
 */

'use client';

import { Suspense, lazy } from 'react';
import { redirect } from 'next/navigation';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { Loading } from '@/components/ui';

export const dynamic = 'force-dynamic';

// Lazy load UnifiedDashboard for better performance
const UnifiedDashboard = lazy(() =>
  import('@/components/domains/dashboard').then((mod) => ({
    default: mod.UnifiedDashboard,
  }))
);

export default function DashboardPage() {
  const { user, isLoading } = useAuthStore();

  // Redirect to login if no user
  if (!isLoading && !user) {
    redirect('/login');
  }

  // Show loading during auth check
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loading size="lg" text="Yükleniyor..." />
      </div>
    );
  }

  // Render unified dashboard for ALL user roles
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <Loading size="lg" text="Dashboard yükleniyor..." />
        </div>
      }
    >
      <UnifiedDashboard />
    </Suspense>
  );
}
