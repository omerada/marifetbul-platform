'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useMessagingStore } from '@/lib/store/messaging';
import { useOrderStore } from '@/lib/store/orders';
import { useWebSocket } from '@/hooks/useWebSocket';
import { EmployerDashboard as EmployerDashboardType } from '@/types';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { isJobBudgetObject } from '@/lib/utils/typeGuards';
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
  MessageCircle,
  Users,
  Clock,
  Package,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface EmployerDashboardProps {
  userId?: string;
}

export function EmployerDashboard({}: EmployerDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { dashboardData, isLoading, error, refreshDashboard } = useDashboard();
  const { conversations } = useMessagingStore();
  const { orders } = useOrderStore();
  const { isConnected } = useWebSocket();

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
  const unreadCount = conversations.reduce(
    (total, conv) => total + (conv.unreadCount || 0),
    0
  );

  return (
    <div className="space-y-4 p-4 lg:space-y-6 lg:p-6">
      {/* Header with Connection Status */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl dark:text-gray-100">
              İşveren Paneli 👋
            </h1>
            <p className="text-base text-gray-600 lg:text-lg dark:text-gray-400">
              Projelerinizi yönetin ve yetenekli freelancer&apos;ları bulun
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge
                variant="default"
                className="flex items-center gap-1 bg-green-100 text-green-800"
              >
                <Wifi className="h-3 w-3" />
                Çevrimiçi
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-red-100 text-red-800"
              >
                <WifiOff className="h-3 w-3" />
                Bağlantı Kesildi
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="w-full">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Genel Bakış
              </div>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'messages'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Mesajlar
                {unreadCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 rounded-full bg-red-500 p-0 text-xs text-white"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'projects'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Projeler
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Aktif Projeler"
                  value={data.stats.activeJobs.toString()}
                  icon={<Briefcase className="h-6 w-6" />}
                />
                <StatsCard
                  title="Toplam Harcama"
                  value={`₺${data.stats.totalSpent.toLocaleString('tr-TR')}`}
                  icon={<DollarSign className="h-6 w-6" />}
                />
                <StatsCard
                  title="Kayıtlı Freelancer"
                  value={data.stats.savedFreelancers.toString()}
                  icon={<Users className="h-6 w-6" />}
                />
                <StatsCard
                  title="Tamamlanan Projeler"
                  value={data.stats.completedJobs.toString()}
                  icon={<CheckCircle className="h-6 w-6" />}
                />
              </div>

              {/* Quick Actions */}
              <Card className="p-6">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Hızlı İşlemler
                </h2>
                <QuickActions />
              </Card>

              {/* Active Projects */}
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Aktif Projeler
                  </h2>
                  <Button size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni İş İlanı
                  </Button>
                </div>
                <div className="space-y-4">
                  {data.activeJobs.slice(0, 3).map((job, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Aktif proje • ₺
                          {isJobBudgetObject(job.budget)
                            ? job.budget.amount.toLocaleString('tr-TR')
                            : job.budget.toLocaleString('tr-TR')}{' '}
                          {isJobBudgetObject(job.budget) &&
                          job.budget.type === 'hourly'
                            ? '/saat'
                            : ''}{' '}
                          bütçe
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Aktif
                        </span>
                        <Button size="sm" variant="outline">
                          Yönet
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Mesajlar ({conversations.length})
                </h2>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Mesaj
                </Button>
              </div>

              <div className="grid gap-4">
                {conversations.slice(0, 10).map((conversation) => (
                  <Card
                    key={conversation.id}
                    className="cursor-pointer p-4 transition-shadow hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary-100 flex h-10 w-10 items-center justify-center rounded-full">
                          <Users className="text-primary-600 h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {conversation.participants
                              .filter((p) => p.userId !== 'current-user')
                              .map((p) =>
                                `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim()
                              )
                              .join(', ')}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {conversation.lastMessage?.content.slice(0, 50)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {conversation.unreadCount &&
                          conversation.unreadCount > 0 && (
                            <Badge
                              variant="secondary"
                              className="h-5 w-5 rounded-full bg-red-500 p-0 text-xs text-white"
                            >
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        <span className="text-xs text-gray-400">
                          {conversation.lastMessage?.sentAt
                            ? new Date(
                                conversation.lastMessage.sentAt
                              ).toLocaleDateString('tr-TR')
                            : ''}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Projeler ({orders.length})
                </h2>
                <Button size="sm" variant="primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Proje
                </Button>
              </div>

              <div className="grid gap-4">
                {orders.slice(0, 10).map((order) => (
                  <Card
                    key={order.id}
                    className="p-6 transition-shadow hover:shadow-lg"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {order.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {order.description?.slice(0, 100)}...
                        </p>
                      </div>
                      <Badge
                        variant={
                          order.status === 'completed'
                            ? 'default'
                            : order.status === 'in_progress'
                              ? 'outline'
                              : order.status === 'pending'
                                ? 'secondary'
                                : 'secondary'
                        }
                        className={
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                        }
                      >
                        {order.status === 'completed'
                          ? 'Tamamlandı'
                          : order.status === 'in_progress'
                            ? 'Devam Ediyor'
                            : order.status === 'pending'
                              ? 'Beklemede'
                              : 'İptal'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />₺
                        {order.amount?.toLocaleString('tr-TR') || '0'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {order.deliveryDate
                          ? new Date(order.deliveryDate).toLocaleDateString(
                              'tr-TR'
                            )
                          : 'Belirsiz'}
                      </span>
                    </div>
                    {order.progress && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            İlerleme
                          </span>
                          <span className="font-medium">
                            {order.progress.percentage}%
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="bg-primary-500 h-full transition-all duration-300"
                            style={{ width: `${order.progress.percentage}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {order.progress.currentStage}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
