/**
 * ================================================
 * UNIFIED DASHBOARD ENTRY POINT
 * ================================================
 * Main dashboard page that renders unified dashboard based on user role
 * No more redirects - single entry point for all user types
 *
 * Sprint Day 1 - Task 1.1: Dashboard Routing Consolidation
 * @version 2.0.0
 */

'use client';

import { Suspense, lazy } from 'react';
import { redirect } from 'next/navigation';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
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

  // Handle special roles with their own dedicated pages
  if (!isLoading && user) {
    if (user.role === 'ADMIN') {
      redirect('/admin');
    }
    if (user.role === 'MODERATOR') {
      redirect('/moderator');
    }
  }

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

  // Render unified dashboard for FREELANCER and EMPLOYER
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <Loading size="lg" text="Dashboard yükleniyor..." />
        </div>
      }
    >
      <UnifiedDashboard
        role={user?.role as 'FREELANCER' | 'EMPLOYER' | undefined}
      />
    </Suspense>
  );
}
