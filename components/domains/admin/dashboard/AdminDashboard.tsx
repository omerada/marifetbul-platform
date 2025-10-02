'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { PerformanceMonitor } from '@/components/shared/performance/PerformanceMonitor';
import SystemHealthWidget from './SystemHealthWidget';
import { useAdminDashboard } from '@/hooks';
import type { SecurityAlert } from '@/types';
import {
  Users,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Briefcase,
  Activity,
  ArrowUpRight,
  Eye,
  MessageSquare,
  Clock,
  Calendar,
  BarChart3,
  Gauge,
  ChevronRight,
} from 'lucide-react';

export function AdminDashboard() {
  const {
    stats,
    alerts,
    systemHealth,
    isLoading,
    error,
    refresh,
    alertAction,
  } = useAdminDashboard();

  if (isLoading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="space-y-3">
              <div className="h-8 w-64 rounded-lg bg-gray-200"></div>
              <div className="h-4 w-96 rounded bg-gray-200"></div>
            </div>
            <div className="flex space-x-3">
              <div className="h-10 w-32 rounded-lg bg-gray-200"></div>
              <div className="h-10 w-24 rounded-lg bg-gray-200"></div>
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 rounded-lg bg-white shadow" />
            ))}
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-80 rounded-lg bg-white shadow lg:col-span-2" />
            <div className="h-80 rounded-lg bg-white shadow" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
        <Card className="mx-auto mt-20 max-w-2xl border-0 bg-gradient-to-r from-red-50 to-red-100 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 shadow-lg">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-semibold text-red-900">
                  Panel Hatası
                </h3>
                <p className="text-red-700">
                  Panel verilerinizi yüklerken bir hatayla karşılaştık.
                </p>
                <div className="mt-4 rounded-lg bg-red-100 p-3">
                  <p className="font-mono text-sm text-red-800">{error}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={refresh}
                className="border-red-300 text-red-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tekrar Dene
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Toplam Kullanıcı',
      value: new Intl.NumberFormat('tr-TR').format(stats?.totalUsers || 0),
      change: `+${stats?.newUsersToday ?? 0} bugün`,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Aylık Gelir',
      value: `₺${new Intl.NumberFormat('tr-TR').format(stats?.monthlyRevenue || 0)}`,
      change: `%${stats?.revenueGrowth ?? 0} büyüme`,
      icon: DollarSign,
      color: 'green',
    },
    {
      title: 'Aktif Siparişler',
      value: new Intl.NumberFormat('tr-TR').format(stats?.pendingOrders || 0),
      change: `${stats?.completedOrders ?? 0} tamamlandı`,
      icon: ShoppingCart,
      color: 'orange',
    },
    {
      title: 'Dönüşüm Oranı',
      value: `%${stats?.conversionRate ?? 0}`,
      change: `%${stats?.userRetentionRate ?? 0} tutma oranı`,
      icon: TrendingUp,
      color: 'purple',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Yönetici Paneli
                </h1>
                <p className="text-gray-600">
                  Hoş geldiniz! Platformunuzda neler olduğunu görün.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span>Sistem Sağlıklı</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>
                  Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-gray-300">
                <Calendar className="mr-2 h-4 w-4" />
                Son 30 Gün
              </Button>
              <Button
                onClick={refresh}
                disabled={isLoading}
                variant="primary"
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                />
                Yenile
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Demo Info Card */}
        <Card className="border bg-blue-50 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 shadow-md">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-blue-900">
                  📊 Yönetici Paneli Demo
                </CardTitle>
                <p className="text-sm text-blue-700">
                  Bu, gerçek zamanlı özelliklerle yönetici panelinin bir
                  demonstrasyonudur
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-white/50 px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Kullanıcı Yönetimi
                    </span>
                  </div>
                  <Badge className="border-green-200 bg-green-100 text-green-700">
                    Aktif
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/50 px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Gerçek Zamanlı Analitik
                    </span>
                  </div>
                  <Badge className="border-green-200 bg-green-100 text-green-700">
                    Canlı
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-white/50 px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-blue-900">
                      İçerik Denetimi
                    </span>
                  </div>
                  <Badge className="border-green-200 bg-green-100 text-green-700">
                    Hazır
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/50 px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Platform Ayarları
                    </span>
                  </div>
                  <Badge className="border-green-200 bg-green-100 text-green-700">
                    Yapılandırıldı
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced System Health Alert */}
        {systemHealth?.status !== 'healthy' && (
          <Card className="border bg-orange-50 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 shadow-md">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-900">
                    Sistem Sağlık Uyarısı
                  </h3>
                  <p className="mt-1 text-orange-800">
                    Durum:{' '}
                    <span className="font-medium">
                      {systemHealth?.status || 'Bilinmiyor'}
                    </span>
                  </p>
                  {systemHealth?.issues && systemHealth.issues.length > 0 && (
                    <div className="mt-3">
                      <div className="mb-2 flex items-center space-x-2">
                        <Badge className="border-orange-200 bg-orange-100 text-orange-800">
                          {systemHealth.issues.length} sorun tespit edildi
                        </Badge>
                      </div>
                      <ul className="list-inside list-disc space-y-1 text-sm text-orange-700">
                        {systemHealth.issues.slice(0, 3).map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-300 text-orange-700"
                >
                  Detayları Gör
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const colorConfig = {
              blue: {
                iconBg: 'bg-blue-500',
              },
              green: {
                iconBg: 'bg-emerald-500',
              },
              orange: {
                iconBg: 'bg-orange-500',
              },
              purple: {
                iconBg: 'bg-purple-500',
              },
            };
            const colors = colorConfig[stat.color as keyof typeof colorConfig];

            return (
              <Card key={stat.title} className="bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-600">
                          {stat.title}
                        </p>
                      </div>
                      <p className="mb-2 text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-semibold text-green-600">
                            +12.3%
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          geçen aya göre
                        </span>
                      </div>
                      <div className="mt-3 text-xs text-gray-600">
                        {stat.change}
                      </div>
                    </div>
                    <div className={`rounded-lg p-3 ${colors.iconBg}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Enhanced Analytics & Activity Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Performance Monitor */}
          <Card className="bg-white shadow-sm lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Gauge className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Performans İzleyici
                  </CardTitle>
                  <p className="mt-1 text-sm text-gray-600">
                    Gerçek zamanlı sistem metrikleri
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Detayları Gör
              </Button>
            </CardHeader>
            <CardContent>
              <PerformanceMonitor />
            </CardContent>
          </Card>

          {/* Enhanced Recent Activity */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Canlı Aktivite
                  </CardTitle>
                  <p className="mt-1 text-sm text-gray-600">
                    Son platform olayları
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    icon: Users,
                    color: 'blue',
                    title: 'Yeni kullanıcı kaydı',
                    time: '2 dakika önce',
                    detail: 'Ahmet Yılmaz serbest çalışan olarak katıldı',
                  },
                  {
                    icon: Briefcase,
                    color: 'green',
                    title: 'İş ilanı yayınlandı',
                    time: '8 dakika önce',
                    detail: 'Web geliştirme projesi',
                  },
                  {
                    icon: DollarSign,
                    color: 'emerald',
                    title: 'Ödeme tamamlandı',
                    time: '15 dakika önce',
                    detail: '₺2,500 işlem',
                  },
                  {
                    icon: AlertTriangle,
                    color: 'red',
                    title: 'İçerik rapor edildi',
                    time: '32 dakika önce',
                    detail: 'İnceleme gerekli',
                  },
                ].map((activity, index) => {
                  const Icon = activity.icon;
                  const colorMap = {
                    blue: 'bg-blue-100 text-blue-600',
                    green: 'bg-green-100 text-green-600',
                    emerald: 'bg-emerald-100 text-emerald-600',
                    red: 'bg-red-100 text-red-600',
                  };

                  return (
                    <div
                      key={index}
                      className="flex items-start space-x-4 rounded-lg p-3 hover:bg-gray-50"
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorMap[activity.color as keyof typeof colorMap]}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                          {activity.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          {activity.detail}
                        </p>
                        <p className="mt-1 flex items-center text-xs text-gray-500">
                          <Clock className="mr-1 h-3 w-3" />
                          {activity.time}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Tüm Aktiviteleri Gör
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Alerts Section */}
        {alerts && alerts.length > 0 && (
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      Sistem Uyarıları
                    </CardTitle>
                    <p className="mt-1 text-sm text-gray-600">
                      Son bildirimler ve uyarılar
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="border-orange-200 bg-orange-100 px-3 py-1 text-orange-800">
                    {alerts.length} aktif
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300"
                  >
                    Tümünü Gör
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.slice(0, 4).map((alert: SecurityAlert) => {
                  const priorityConfig = {
                    critical: {
                      bg: 'bg-gradient-to-r from-red-50 to-red-100',
                      border: 'border-red-200',
                      dot: 'bg-red-500',
                      badge: 'bg-red-100 text-red-800 border-red-200',
                    },
                    high: {
                      bg: 'bg-gradient-to-r from-orange-50 to-orange-100',
                      border: 'border-orange-200',
                      dot: 'bg-orange-500',
                      badge: 'bg-orange-100 text-orange-800 border-orange-200',
                    },
                    medium: {
                      bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
                      border: 'border-yellow-200',
                      dot: 'bg-yellow-500',
                      badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    },
                    low: {
                      bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
                      border: 'border-blue-200',
                      dot: 'bg-blue-500',
                      badge: 'bg-blue-100 text-blue-800 border-blue-200',
                    },
                  };

                  const config =
                    priorityConfig[
                      alert.priority as keyof typeof priorityConfig
                    ] || priorityConfig.low;

                  return (
                    <div
                      key={alert.id}
                      className={`flex items-start justify-between rounded-xl border p-4 ${config.bg} ${config.border}`}
                    >
                      <div className="flex flex-1 items-start space-x-4">
                        <div
                          className={`h-3 w-3 rounded-full ${config.dot} mt-2`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center space-x-2">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {alert.title}
                            </h4>
                            <Badge
                              className={`${config.badge} px-2 py-0.5 text-xs`}
                            >
                              {alert.priority === 'critical'
                                ? 'Kritik'
                                : alert.priority === 'high'
                                  ? 'Yüksek'
                                  : alert.priority === 'medium'
                                    ? 'Orta'
                                    : 'Düşük'}
                            </Badge>
                          </div>
                          <p className="mb-2 text-sm text-gray-700">
                            {alert.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {new Date(alert.createdAt).toLocaleString(
                                  'tr-TR'
                                )}
                              </span>
                            </div>
                            {alert.category && (
                              <span className="rounded bg-gray-100 px-2 py-1">
                                {alert.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        {!alert.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alertAction(alert.id, 'read')}
                            className="px-3 py-1 text-xs"
                          >
                            Okundu İşaretle
                          </Button>
                        )}
                        <ChevronRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-600" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modern System Health & Management Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Enhanced System Health Widget */}
          <div className="lg:col-span-1">
            <SystemHealthWidget className="border bg-white shadow-md" />
          </div>

          {/* Enhanced Pending Tasks */}
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Bekleyen Görevler
                  </CardTitle>
                  <p className="mt-1 text-sm text-gray-600">
                    Dikkat gerektiren öğeler
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    icon: Clock,
                    label: 'Kullanıcı Onayları',
                    count: 23,
                    color: 'orange',
                  },
                  {
                    icon: AlertTriangle,
                    label: 'Denetim Kuyruğu',
                    count: 12,
                    color: 'red',
                  },
                  {
                    icon: MessageSquare,
                    label: 'Destek Talepleri',
                    count: 8,
                    color: 'blue',
                  },
                  {
                    icon: ShoppingCart,
                    label: 'Bekleyen Ödemeler',
                    count: 5,
                    color: 'purple',
                  },
                ].map((task, index) => {
                  const Icon = task.icon;
                  const colorMap = {
                    orange: 'text-orange-600 bg-orange-50 border-orange-200',
                    red: 'text-red-600 bg-red-50 border-red-200',
                    blue: 'text-blue-600 bg-blue-50 border-blue-200',
                    purple: 'text-purple-600 bg-purple-50 border-purple-200',
                  };

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorMap[task.color as keyof typeof colorMap]}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          {task.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={`${colorMap[task.color as keyof typeof colorMap]} px-2 py-1 text-xs font-semibold`}
                        >
                          {task.count}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-600" />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Tüm Görevleri Gör
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Quick Actions */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Hızlı İşlemler
                  </CardTitle>
                  <p className="mt-1 text-sm text-gray-600">
                    Sık kullanılan operasyonlar
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    icon: Users,
                    label: 'Kullanıcı Ekle',
                    href: '/admin/users',
                  },
                  {
                    icon: Briefcase,
                    label: 'İş Onayla',
                    href: '/admin/jobs',
                  },
                  {
                    icon: Eye,
                    label: 'İçerik İncele',
                    href: '/admin/moderation',
                  },
                  {
                    icon: BarChart3,
                    label: 'Rapor Oluştur',
                    href: '/admin/reports',
                  },
                  {
                    icon: Activity,
                    label: 'Sistem Günlükleri',
                    href: '/admin/logs',
                  },
                ].map((action, index) => {
                  const Icon = action.icon;

                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="h-12 w-full justify-start border-gray-200"
                    >
                      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                        <Icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-700">
                        {action.label}
                      </span>
                      <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
