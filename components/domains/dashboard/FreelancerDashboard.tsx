'use client';

import React from 'react';
import { useDashboard } from '@/hooks';
import { useMessagingStore } from '@/lib/core/store/messaging';
import { useOrderStore } from '@/lib/core/store/orders';
import { useWebSocket } from '@/hooks';
import { FreelancerDashboard as FreelancerDashboardType } from '@/types';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { ActivityTimeline } from './ActivityTimeline';
import { QuickActions } from './QuickActions';
import { StatsCard } from './StatsCard';
import {
  RevenueChart,
  PackagePerformance,
  ClientStatistics,
} from '@/components/dashboard';
import { SkeletonDashboard as DashboardSkeleton } from '@/components/ui/UnifiedSkeleton';
import { ErrorState } from '@/components/shared/utilities';
import { logger } from '@/lib/shared/utils/logger';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  Plus,
  Search,
  Star,
  Eye,
  Clock,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface FreelancerDashboardProps {
  userId?: string;
}

export function FreelancerDashboard({ userId }: FreelancerDashboardProps) {
  const { dashboardData, isLoading, error, refreshDashboard } = useDashboard();

  // Real-time messaging and order tracking
  const { loadConversations } = useMessagingStore();
  const { loadOrders } = useOrderStore();
  const { isConnected } = useWebSocket();

  React.useEffect(() => {
    // Load initial data
    const loadInitialData = async () => {
      try {
        // Load data without blocking on failures
        const results = await Promise.allSettled([
          loadConversations().catch(() => {
            logger.debug(
              '[FreelancerDashboard] Conversations failed to load, continuing...'
            );
          }),
          loadOrders({ freelancerId: userId || 'me' }).catch(() => {
            logger.debug(
              '[FreelancerDashboard] Orders failed to load, continuing...'
            );
          }),
        ]);

        logger.debug(
          '[FreelancerDashboard] Initial data load results:',
          results
        );
      } catch (error) {
        // Log but don't block - dashboard should still render
        logger.error(
          '[FreelancerDashboard] Error loading initial data:',
          error
        );
      }
    };

    loadInitialData();
  }, [loadConversations, loadOrders, userId]);

  // userId available for future user-specific features

  if (isLoading) {
    return <DashboardSkeleton type="freelancer" />;
  }

  if (error) {
    return (
      <ErrorState
        message={error.message}
        onRetry={refreshDashboard}
        title="Dashboard Yüklenemedi"
      />
    );
  }

  // Provide default data structure if dashboard data is not available
  const data = (dashboardData as FreelancerDashboardType) || {
    stats: {
      totalEarnings: 0,
      currentMonthEarnings: 0,
      activeOrders: 0,
      completedJobs: 0,
      rating: 0,
      profileViews: 0,
      responseRate: 0,
    },
    quickStats: {
      pendingProposals: 0,
      messagesWaiting: 0,
      reviewsPending: 0,
    },
    recentOrders: [],
    recentProposals: [],
  };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="space-y-4 p-4 lg:space-y-6 lg:p-6"
    >
      {/* Connection Status - Compact */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="success" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Çevrimiçi
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Çevrimdışı
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <>
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
              href: '/marketplace/packages/create',
              icon: <Plus className="h-5 w-5" />,
              color: 'blue',
            },
            {
              label: 'İş İlanlarını Gör',
              href: '/marketplace/jobs',
              icon: <Search className="h-5 w-5" />,
              color: 'green',
            },
          ]}
        />

        {/* Charts Section */}
        {data.chartData && (
          <div className="space-y-6">
            {/* Revenue Chart */}
            {data.chartData.earnings && data.chartData.earnings.length > 0 && (
              <RevenueChart data={data.chartData.earnings} days={30} />
            )}

            {/* Package Performance & Client Statistics */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {data.chartData.packages &&
                data.chartData.packages.length > 0 && (
                  <PackagePerformance
                    data={data.chartData.packages}
                    maxItems={5}
                  />
                )}

              {data.chartData.clients &&
                data.chartData.clients.totalClients > 0 && (
                  <ClientStatistics data={data.chartData.clients} />
                )}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <Card>
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Son Aktiviteler
              </h2>
              <Button variant="ghost" size="sm">
                Tümünü Gör
              </Button>
            </div>
          </div>
          <div className="p-6">
            <ActivityTimeline showTitle={false} />
          </div>
        </Card>

        {/* Quick Stats Summary - Compact */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Bekleyen İşlemler
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
      </>
    </main>
  );
}
