'use client';

import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { FreelancerDashboard as FreelancerDashboardType } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ActivityTimeline } from '@/components/features/ActivityTimeline';
import { QuickActions } from '@/components/features/QuickActions';
import { StatsCard } from '@/components/features/StatsCard';
import { DashboardSkeleton } from '@/components/features/DashboardSkeleton';
import { ErrorState } from '@/components/features/ErrorState';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  Plus,
  Search,
  MessageCircle,
  Star,
  Eye,
  Clock,
} from 'lucide-react';

interface FreelancerDashboardProps {
  userId?: string;
}

export function FreelancerDashboard({ userId }: FreelancerDashboardProps) {
  const { dashboardData, isLoading, error, refreshDashboard } = useDashboard();

  // For future use when we need user-specific data
  console.log('Dashboard for user:', userId);

  if (isLoading) {
    return <DashboardSkeleton type="freelancer" />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={refreshDashboard}
        title="Dashboard Yüklenemedi"
      />
    );
  }

  if (!dashboardData) {
    return (
      <ErrorState
        message="Dashboard verileri bulunamadı"
        onRetry={refreshDashboard}
      />
    );
  }

  const data = dashboardData as FreelancerDashboardType;

  return (
    <div className="space-y-4 p-4 lg:space-y-6 lg:p-6">
      {/* Welcome Section */}
      <div className="mb-6 lg:mb-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl">
          Hoş Geldiniz! 👋
        </h1>
        <p className="text-base text-gray-600 lg:text-lg">
          İşlerinizi yönetin ve kazancınızı artırın
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <StatsCard
          title="Toplam Kazanç"
          value={`₺${data.stats.totalEarnings.toLocaleString('tr-TR')}`}
          subtitle={`Bu ay: ₺${data.stats.currentMonthEarnings.toLocaleString('tr-TR')}`}
          change="+12%"
          changeType="positive"
          icon={<DollarSign className="h-5 w-5" />}
          iconColor="green"
        />
        <StatsCard
          title="Bu Ay"
          value={`₺${data.stats.currentMonthEarnings.toLocaleString('tr-TR')}`}
          subtitle="Aylık gelir"
          change="+8%"
          changeType="positive"
          icon={<TrendingUp className="h-5 w-5" />}
          iconColor="blue"
        />
        <StatsCard
          title="Aktif Siparişler"
          value={data.stats.activeOrders.toString()}
          subtitle="Devam eden işler"
          icon={<ShoppingCart className="h-5 w-5" />}
          iconColor="orange"
        />
        <StatsCard
          title="Tamamlanan İşler"
          value={data.stats.completedJobs.toString()}
          subtitle={`${data.stats.rating} ⭐ ortalama puan`}
          icon={<CheckCircle className="h-5 w-5" />}
          iconColor="purple"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-yellow-100 p-3">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Ortalama Puan</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {data.stats.rating}
              </p>
              <p className="text-sm text-gray-500">
                {data.stats.completedJobs} değerlendirme
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-blue-100 p-3">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Profil Görüntüleme
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {data.stats.profileViews}
              </p>
              <p className="text-sm text-gray-500">Bu hafta +8%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-green-100 p-3">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Yanıt Oranı</h3>
              <p className="text-2xl font-bold text-green-600">
                {data.stats.responseRate}%
              </p>
              <p className="text-sm text-gray-500">24 saat içinde</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActions
        title="Hızlı Eylemler"
        actions={[
          {
            label: 'Yeni Paket Ekle',
            href: '/packages/create',
            icon: <Plus className="h-5 w-5" />,
            color: 'blue',
          },
          {
            label: 'İş İlanlarını Gör',
            href: '/jobs',
            icon: <Search className="h-5 w-5" />,
            color: 'green',
          },
          {
            label: 'Mesajlarım',
            href: '/messages',
            icon: <MessageCircle className="h-5 w-5" />,
            color: 'purple',
            badge:
              data.quickStats.messagesWaiting > 0
                ? data.quickStats.messagesWaiting
                : undefined,
          },
        ]}
      />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Son Siparişler
              </h2>
              <Button variant="ghost" size="sm">
                Tümünü Gör
              </Button>
            </div>
          </div>
          <div className="p-6">
            <ActivityTimeline items={data.recentOrders} type="orders" />
          </div>
        </Card>

        <Card>
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Son Teklifler
              </h2>
              <Button variant="ghost" size="sm">
                Tümünü Gör
              </Button>
            </div>
          </div>
          <div className="p-6">
            <ActivityTimeline items={data.recentProposals} type="proposals" />
          </div>
        </Card>
      </div>

      {/* Quick Stats Summary */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Bekleyen İşlemler
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Bekleyen Teklifler
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {data.quickStats.pendingProposals}
              </p>
            </div>
            <Button size="sm" variant="outline">
              Görüntüle
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-purple-50 p-4">
            <div>
              <p className="text-sm font-medium text-purple-900">
                Okunmamış Mesajlar
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {data.quickStats.messagesWaiting}
              </p>
            </div>
            <Button size="sm" variant="outline">
              Mesajlar
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-4">
            <div>
              <p className="text-sm font-medium text-yellow-900">
                Bekleyen Değerlendirmeler
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {data.quickStats.reviewsPending}
              </p>
            </div>
            <Button size="sm" variant="outline">
              İncele
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
