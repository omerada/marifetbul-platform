'use client';

import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { EmployerDashboard as EmployerDashboardType } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QuickActions } from '@/components/features/QuickActions';
import { StatsCard } from '@/components/features/StatsCard';
import { DashboardSkeleton } from '@/components/features/DashboardSkeleton';
import { ErrorState } from '@/components/features/ErrorState';
import {
  DollarSign,
  TrendingUp,
  Briefcase,
  CheckCircle,
  Plus,
  Search,
  MessageCircle,
  Users,
  Clock,
} from 'lucide-react';

interface EmployerDashboardProps {
  userId?: string;
}

export function EmployerDashboard({ userId }: EmployerDashboardProps) {
  const { dashboardData, isLoading, error, refreshDashboard } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton type="employer" />;
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

  const data = dashboardData as EmployerDashboardType;

  return (
    <div className="space-y-4 p-4 lg:space-y-6 lg:p-6">
      {/* Welcome Section */}
      <div className="mb-6 lg:mb-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl">
          Hoş Geldiniz! 👋
        </h1>
        <p className="text-base text-gray-600 lg:text-lg">
          Projelerinizi yönetin ve yetenekli freelancer&apos;ları bulun
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <StatsCard
          title="Toplam Harcama"
          value={`₺${data.stats.totalSpent.toLocaleString('tr-TR')}`}
          subtitle={`Bu ay: ₺${data.stats.currentMonthSpending.toLocaleString('tr-TR')}`}
          change="+15%"
          changeType="positive"
          icon={<DollarSign className="h-5 w-5" />}
          iconColor="green"
        />
        <StatsCard
          title="Bu Ay"
          value={`₺${data.stats.currentMonthSpending.toLocaleString('tr-TR')}`}
          subtitle="Aylık harcama"
          change="+8%"
          changeType="positive"
          icon={<TrendingUp className="h-5 w-5" />}
          iconColor="blue"
        />
        <StatsCard
          title="Aktif İş İlanları"
          value={data.stats.activeJobs.toString()}
          subtitle={`${data.quickStats.proposalsReceived} teklif aldı`}
          icon={<Briefcase className="h-5 w-5" />}
          iconColor="orange"
        />
        <StatsCard
          title="Tamamlanan İşler"
          value={data.stats.completedJobs.toString()}
          subtitle={`Ort. maliyet: ₺${data.stats.avgProjectCost.toLocaleString('tr-TR')}`}
          icon={<CheckCircle className="h-5 w-5" />}
          iconColor="purple"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-blue-100 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Kayıtlı Freelancer
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {data.stats.savedFreelancers}
              </p>
              <p className="text-sm text-gray-500">Favori listende</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-purple-100 p-3">
              <MessageCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Mesajlar</h3>
              <p className="text-2xl font-bold text-purple-600">
                {data.quickStats.messagesWaiting}
              </p>
              <p className="text-sm text-gray-500">Yeni mesaj</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-orange-100 p-3">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Süresi Dolan</h3>
              <p className="text-2xl font-bold text-orange-600">
                {data.quickStats.jobsExpiringSoon}
              </p>
              <p className="text-sm text-gray-500">İş ilanı</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActions
        title="Hızlı Eylemler"
        actions={[
          {
            label: 'Yeni İş İlanı',
            href: '/jobs/create',
            icon: <Plus className="h-5 w-5" />,
            color: 'blue',
          },
          {
            label: 'Freelancer Ara',
            href: '/marketplace',
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

      {/* Active Jobs & Recent Hires */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Aktif İş İlanları
              </h2>
              <Button variant="ghost" size="sm">
                Tümünü Gör
              </Button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.activeJobs.map((job, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600">
                      {job.proposalsCount} teklif • ₺
                      {job.budget.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Son tarih:{' '}
                      {job.deadline
                        ? new Date(job.deadline).toLocaleDateString()
                        : 'Belirtilmemiş'}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Görüntüle
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Son İşe Alımlar
              </h2>
              <Button variant="ghost" size="sm">
                Tümünü Gör
              </Button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.recentHires.map((hire, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {hire.jobTitle}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ₺{hire.amount.toLocaleString('tr-TR')} •{' '}
                      {new Date(hire.startDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Profil
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Stats Summary */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Güncel Durum
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Alınan Teklifler
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {data.quickStats.proposalsReceived}
              </p>
            </div>
            <Button size="sm" variant="outline">
              İncele
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

          <div className="flex items-center justify-between rounded-lg bg-orange-50 p-4">
            <div>
              <p className="text-sm font-medium text-orange-900">
                Yaklaşan Son Tarihler
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {data.quickStats.jobsExpiringSoon}
              </p>
            </div>
            <Button size="sm" variant="outline">
              Uzat
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
