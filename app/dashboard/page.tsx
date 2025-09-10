'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout';
import { Card, CardContent, Loading } from '@/components/ui';
import useAuthStore from '@/lib/store/auth';
import {
  DashboardStats,
  QuickActions,
  ActivityTimeline,
  DashboardCharts,
} from '@/components/features';
import { Calendar, Bell, Settings, HelpCircle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshAuth } = useAuthStore();

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

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

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Hoş geldin, {user.firstName}! 👋
                </h1>
                <p className="mt-1 text-gray-600">
                  {user.userType === 'freelancer'
                    ? 'Projelerinizi yönetin ve yeni fırsatları keşfedin.'
                    : 'İşlerinizi yönetin ve yetenekli freelancerları bulun.'}
                </p>
              </div>
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
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="mb-8">
            <DashboardStats user={user} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column - Charts */}
            <div className="space-y-8 lg:col-span-2">
              <DashboardCharts user={user} />

              {/* Quick Actions */}
              <QuickActions user={user} />
            </div>

            {/* Right Column - Activity */}
            <div className="space-y-8">
              <ActivityTimeline user={user} />

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
