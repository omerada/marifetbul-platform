/**
 * ================================================
 * UNIFIED DASHBOARD COMPONENT
 * ================================================
 * Single dashboard component that adapts to user role
 * Replaces FreelancerDashboard, EmployerDashboard, MobileDashboard, DashboardClient
 *
 * Sprint 1 - Story 1.1: Dashboard Consolidation Complete
 * Sprint 1 - Story 1.2: Integrated State Management with useDashboard hook
 * All dashboard implementations merged successfully
 *
 * @author MarifetBul Development Team
 * @version 6.1.0 - Unified Dashboard with Centralized State Management
 * @refactored 2025-10-29 - Merged DashboardClient logic
 * @refactored 2025-10-29 - Integrated useDashboard store
 */

'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { useDashboard } from '@/hooks/business/useDashboard';
import { DashboardStats } from './DashboardStats';
import { DashboardCharts } from './DashboardCharts';
import { QuickActions } from './QuickActions';
import { ActivityTimeline } from './ActivityTimeline';
import { DashboardSkeleton } from './DashboardSkeleton';
import {
  Calendar,
  Bell,
  Settings,
  HelpCircle,
  Users,
  Briefcase,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

// ================================================
// TYPES
// ================================================

interface UnifiedDashboardProps {
  userId?: string;
  role?: 'FREELANCER' | 'EMPLOYER';
}

type DashboardView = 'overview' | 'freelancer' | 'employer';

// ================================================
// MAIN COMPONENT
// ================================================

export function UnifiedDashboard({
  userId: _userId,
  role: propRole,
}: UnifiedDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuthStore();

  // ================================================
  // STATE MANAGEMENT - Story 1.2
  // ================================================
  // Story 1.2: Centralized state management with useDashboard hook
  const {
    dashboardData,
    isLoading: dashboardLoading,
    isRefreshing,
    error: dashboardError,
    lastRefresh,
    retry,
    clearError,
    // updateDashboardOptimistic is available but will be used in Story 1.3 by child components
  } = useDashboard();

  // Smart routing based on user type and URL params
  const viewParam = searchParams.get('view') as DashboardView;

  // Helper to map backend role to view type
  const roleToView = (role?: string): DashboardView => {
    if (role === 'FREELANCER') return 'freelancer';
    if (role === 'EMPLOYER') return 'employer';
    return 'freelancer'; // Default fallback
  };

  const [currentView, setCurrentView] = useState<DashboardView>(() => {
    // Priority: URL param > propRole > user role
    if (viewParam) return viewParam;
    if (propRole) return roleToView(propRole);
    return roleToView(user?.role);
  });

  // Combined loading state
  const isLoading = authLoading || dashboardLoading;

  // User validation - must have user to render dashboard
  if (!user && !authLoading) {
    return <DashboardSkeleton />;
  }

  // Show loading state
  if (isLoading && !dashboardData) {
    return <DashboardSkeleton />;
  }

  // Show error state with retry option
  if (dashboardError && !dashboardData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Dashboard Yüklenemedi
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                {dashboardError.message}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => retry()}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                  {isRefreshing ? 'Yenileniyor...' : 'Tekrar Dene'}
                </button>
                <button
                  onClick={clearError}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Temizle
                </button>
              </div>
              {lastRefresh && (
                <p className="mt-4 text-xs text-gray-500">
                  Son güncelleme:{' '}
                  {new Date(lastRefresh).toLocaleTimeString('tr-TR')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // TypeScript guard - user is guaranteed to be non-null here
  if (!user) return null;

  // Update URL when view changes
  const handleViewChange = (view: DashboardView) => {
    setCurrentView(view);
    const params = new URLSearchParams(searchParams.toString());
    if (view === 'overview') {
      params.delete('view');
    } else {
      params.set('view', view);
    }
    const queryString = params.toString();
    router.push(`/dashboard${queryString ? `?${queryString}` : ''}`, {
      scroll: false,
    });
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'overview':
        return 'Genel Bakış';
      case 'freelancer':
        return 'Freelancer Dashboard';
      case 'employer':
        return 'İşveren Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const getViewDescription = () => {
    switch (currentView) {
      case 'overview':
        return 'Tüm aktivitelerinizi ve istatistiklerinizi görüntüleyin.';
      case 'freelancer':
        return 'Projelerinizi yönetin ve yeni fırsatları keşfedin.';
      case 'employer':
        return "İşlerinizi yönetin ve yetenekli freelancer'lar bulun.";
      default:
        return 'Platform aktivitelerinizi takip edin.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with View Toggle */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Hoş Geldin, {user?.fullName || user?.email}! 👋
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-gray-600">{getViewDescription()}</p>
                {isRefreshing && (
                  <span className="flex items-center gap-1 text-xs text-blue-600">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Yenileniyor...
                  </span>
                )}
                {lastRefresh && !isRefreshing && (
                  <span className="text-xs text-gray-500">
                    Son güncelleme:{' '}
                    {new Date(lastRefresh).toLocaleTimeString('tr-TR')}
                  </span>
                )}
              </div>
            </div>

            {/* View Toggle Buttons */}
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-lg bg-gray-100 p-1">
                <button
                  onClick={() => handleViewChange('overview')}
                  className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    currentView === 'overview'
                      ? 'scale-105 transform bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Genel Bakış
                </button>
                <button
                  onClick={() => handleViewChange('freelancer')}
                  className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    currentView === 'freelancer'
                      ? 'scale-105 transform bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Freelancer
                </button>
                <button
                  onClick={() => handleViewChange('employer')}
                  className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    currentView === 'employer'
                      ? 'scale-105 transform bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="mr-2 h-4 w-4" />
                  İşveren
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => retry()}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                  title="Dashboard'u yenile"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                  Yenile
                </button>
                <button className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
                  <Calendar className="h-4 w-4" />
                  Takvim
                </button>
                <button className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
                  <Bell className="h-4 w-4" />
                  Bildirimler
                </button>
                <button className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
                  <Settings className="h-4 w-4" />
                  Ayarlar
                </button>
              </div>
            </div>
          </div>

          {/* View Title */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {getViewTitle()}
            </h2>
          </div>
        </div>
      </div>

      {/* Main Content with Smooth Transitions */}
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Universal Stats Cards */}
        <div className="mb-8 transition-all duration-300 ease-in-out">
          <DashboardStats user={user} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Charts and Analytics */}
          <div className="space-y-8 lg:col-span-2">
            <div className="transition-all duration-300 ease-in-out">
              <DashboardCharts user={user} />
            </div>

            {/* Context-Aware Quick Actions */}
            <div className="transition-all duration-300 ease-in-out">
              <QuickActions user={user} />
            </div>
          </div>

          {/* Right Column - Activity and Recommendations */}
          <div className="space-y-8">
            <div className="transition-all duration-300 ease-in-out">
              <ActivityTimeline user={user} />
            </div>

            {/* Cross-Promotion Recommendations */}
            <Card>
              <CardContent>
                <div className="flex items-start space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    {currentView === 'freelancer' ? (
                      <Users className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-sm font-medium text-gray-900">
                      {currentView === 'freelancer'
                        ? 'İşveren olarak da kazanın'
                        : 'Freelancer olarak da hizmet verin'}
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                      {currentView === 'freelancer'
                        ? "Kendi projeleriniz için uzman freelancer'lar kiralayın."
                        : 'Uzmanlık alanınızda hizmet paketleri oluşturun.'}
                    </p>
                    <button
                      onClick={() =>
                        handleViewChange(
                          currentView === 'freelancer'
                            ? 'employer'
                            : 'freelancer'
                        )
                      }
                      className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      {currentView === 'freelancer'
                        ? 'İşveren Dashboard'
                        : 'Freelancer Dashboard'}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card>
              <CardContent>
                <div className="flex items-start space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-sm font-medium text-gray-900">
                      Yardıma mı ihtiyacınız var?
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                      Platform hakkında sorularınız varsa, yardım merkezimizi
                      ziyaret edin.
                    </p>
                    <button className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
                      Yardım Merkezi
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default export
export default UnifiedDashboard;
