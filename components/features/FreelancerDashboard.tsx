'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useMessagingStore } from '@/lib/store/messaging';
import { useOrderStore } from '@/lib/store/orders';
import { useWebSocket } from '@/hooks/useWebSocket';
import { FreelancerDashboard as FreelancerDashboardType } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ActivityTimeline } from '@/components/features/ActivityTimeline';
import { QuickActions } from '@/components/features/QuickActions';
import { StatsCard } from '@/components/features/StatsCard';
import { DashboardSkeleton } from '@/components/features/DashboardSkeleton';
import { ErrorState } from '@/components/features/ErrorState';
import { OrderTimeline } from '@/components/features/OrderTimeline';
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
  Package,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface FreelancerDashboardProps {
  userId?: string;
}

export function FreelancerDashboard({ userId }: FreelancerDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'messages' | 'orders'
  >('overview');
  const { dashboardData, isLoading, error, refreshDashboard } = useDashboard();

  // Real-time messaging and order tracking
  const { conversations, totalUnreadCount, loadConversations } =
    useMessagingStore();
  const { orders, loadOrders } = useOrderStore();
  const { isConnected, isConnecting } = useWebSocket();

  React.useEffect(() => {
    loadConversations();
    loadOrders();
  }, [loadConversations, loadOrders]);

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
      {/* Header with Connection Status */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl">
              Hoş Geldiniz! 👋
            </h1>
            <p className="text-base text-gray-600 lg:text-lg">
              İşlerinizi yönetin ve kazancınızı artırın
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isConnecting ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
                Bağlanıyor...
              </Badge>
            ) : isConnected ? (
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
            {totalUnreadCount > 0 && (
              <Badge variant="default" className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {totalUnreadCount} Okunmamış
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Genel Bakış', icon: TrendingUp },
            {
              id: 'messages',
              label: 'Mesajlar',
              icon: MessageCircle,
              badge: totalUnreadCount,
            },
            {
              id: 'orders',
              label: 'Siparişler',
              icon: Package,
              badge: orders.filter((o) => o.status === 'in_progress').length,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id as 'overview' | 'messages' | 'orders')
                }
                className={`inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.badge && tab.badge > 0 && (
                  <Badge variant="default" size="sm">
                    {tab.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
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
                <ActivityTimeline
                  items={data.recentProposals}
                  type="proposals"
                />
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
        </>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Mesajlar</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Sohbet
            </Button>
          </div>

          {conversations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {conversations.slice(0, 6).map((conversation) => (
                <Card key={conversation.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary-100 flex h-10 w-10 items-center justify-center rounded-full">
                        <Users className="text-primary-600 h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {conversation.participants
                            .filter((p) => p.userId !== 'current-user') // Filter out current user
                            .map((p) =>
                              `${p.user.firstName} ${p.user.lastName}`.trim()
                            )
                            .join(', ')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {conversation.lastMessage?.content.slice(0, 50)}...
                        </p>
                      </div>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="default">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Henüz mesajınız yok
              </h3>
              <p className="mt-2 text-gray-500">
                Müşterilerle iletişime geçmeye başlayın
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Siparişler</h2>
            <div className="flex gap-2">
              <Badge variant="success">
                {orders.filter((o) => o.status === 'completed').length}{' '}
                Tamamlandı
              </Badge>
              <Badge variant="warning">
                {orders.filter((o) => o.status === 'in_progress').length} Devam
                Ediyor
              </Badge>
              <Badge variant="secondary">
                {orders.filter((o) => o.status === 'pending').length} Bekliyor
              </Badge>
            </div>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <Card key={order.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">
                          {order.title}
                        </h3>
                        <Badge
                          variant={
                            order.status === 'completed'
                              ? 'success'
                              : order.status === 'in_progress'
                                ? 'warning'
                                : 'secondary'
                          }
                        >
                          {order.status === 'completed'
                            ? 'Tamamlandı'
                            : order.status === 'in_progress'
                              ? 'Devam Ediyor'
                              : 'Bekliyor'}
                        </Badge>
                      </div>
                      <p className="mt-2 text-gray-600">{order.description}</p>
                      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />₺
                          {order.amount.toLocaleString('tr-TR')}
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
                            <span className="text-gray-600">İlerleme</span>
                            <span className="font-medium">
                              {order.progress.percentage}%
                            </span>
                          </div>
                          <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all"
                              style={{ width: `${order.progress.percentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {order.timeline && order.timeline.length > 0 && (
                    <div className="mt-6">
                      <OrderTimeline order={order} compact />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Henüz siparişiniz yok
              </h3>
              <p className="mt-2 text-gray-500">
                İlk siparişinizi almak için teklif verin
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
