'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout';
import { Card, CardContent, Loading } from '@/components/ui';
import useAuthStore from '@/lib/store/auth';
import {
  DashboardStats,
  QuickActions,
  ActivityTimeline,
  DashboardCharts,
} from '@/components/features';
import {
  Calendar,
  Bell,
  Settings,
  HelpCircle,
  Users,
  Briefcase,
} from 'lucide-react';

type DashboardView = 'overview' | 'freelancer' | 'employer';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading, refreshAuth } = useAuthStore();

  // Smart routing based on user type and URL params
  const viewParam = searchParams.get('view') as DashboardView;
  const [currentView, setCurrentView] = useState<DashboardView>(() => {
    if (viewParam) return viewParam;
    return user?.userType === 'freelancer' ? 'freelancer' : 'employer';
  });

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

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

  if (isLoading) {
    return (
      <AppLayout showFooter={false}>
        <div className="flex min-h-screen items-center justify-center">
          <Loading size="lg" text="Dashboard yükleniyor..." />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

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
        return 'Tüm aktivitelerinizi ve istatistiklerinizi görün.';
      case 'freelancer':
        return 'Projelerinizi yönetin ve yeni fırsatları keşfedin.';
      case 'employer':
        return 'İşlerinizi yönetin ve yetenekli freelancerları bulun.';
      default:
        return 'Platform aktivitelerinizi takip edin.';
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Header with View Toggle */}
        <div className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Hoş geldin, {user.firstName}! 👋
                </h1>
                <p className="mt-1 text-gray-600">{getViewDescription()}</p>
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
                          ? 'İşveren olarak da kazanç elde et'
                          : 'Freelancer olarak da hizmet ver'}
                      </h3>
                      <p className="mb-4 text-sm text-gray-600">
                        {currentView === 'freelancer'
                          ? 'Kendi projeleriniz için uzman freelancerları işe alın.'
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
                        Platform hakkında sorularınız varsa yardım merkezimizi
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
    </AppLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <AppLayout showFooter={false}>
          <div className="flex min-h-screen items-center justify-center">
            <Loading size="lg" text="Dashboard yükleniyor..." />
          </div>
        </AppLayout>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
