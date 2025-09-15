'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';
import SystemHealthWidget from '@/components/admin/SystemHealthWidget';
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
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-gray-200" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-64 rounded-lg bg-gray-200" />
            <div className="h-64 rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-800">
                Error loading dashboard: {error}
              </span>
              <Button variant="outline" size="sm" onClick={refresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Platform performansınızın genel bakışı
          </p>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Son 30 Gün
          </Button>
          <Button
            onClick={refresh}
            disabled={isLoading}
            variant="primary"
            size="sm"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Yenile
          </Button>
        </div>
      </div>

      {/* Demo Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-blue-900">
                Demo Admin Paneli
              </CardTitle>
              <p className="text-xs text-blue-700">
                Tüm veriler demo amaçlıdır ve gerçek platformu temsil eder
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs text-blue-700">
            <div className="flex items-center justify-between">
              <span>• Kullanıcı yönetimi sistemi</span>
              <CheckCircle className="h-3 w-3 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span>• Gerçek zamanlı analitik</span>
              <CheckCircle className="h-3 w-3 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span>• İçerik moderation sistemi</span>
              <CheckCircle className="h-3 w-3 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span>• Platform ayarları</span>
              <CheckCircle className="h-3 w-3 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health Alert */}
      {systemHealth?.status !== 'healthy' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800">
                Sistem Durumu: {systemHealth?.status || 'Bilinmiyor'}
              </span>
              {systemHealth?.issues && systemHealth.issues.length > 0 && (
                <Badge variant="secondary">
                  {systemHealth.issues.length} sorun
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const colorConfig = {
            blue: {
              text: 'text-blue-600',
              bg: 'bg-blue-50',
              border: 'border-blue-200',
            },
            green: {
              text: 'text-green-600',
              bg: 'bg-green-50',
              border: 'border-green-200',
            },
            orange: {
              text: 'text-orange-600',
              bg: 'bg-orange-50',
              border: 'border-orange-200',
            },
            purple: {
              text: 'text-purple-600',
              bg: 'bg-purple-50',
              border: 'border-purple-200',
            },
          };
          const colors = colorConfig[stat.color as keyof typeof colorConfig];

          return (
            <Card
              key={stat.title}
              className={`border ${colors.border} ${colors.bg} transition-all hover:shadow-md`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <div className="mt-2 flex items-center">
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <span className="ml-1 text-sm font-medium text-green-600">
                        +12.3%
                      </span>
                      <span className="ml-1 text-sm text-gray-500">
                        son 30 gün
                      </span>
                    </div>
                  </div>
                  <div className={`rounded-full p-3 ${colors.bg}`}>
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Charts and Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Performance Monitor */}
        <Card className="border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center space-x-2 text-base font-medium">
              <Gauge className="h-5 w-5" />
              <span>Performans İzleme</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceMonitor />
          </CardContent>
        </Card>

        {/* Enhanced Recent Activity */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Son Aktiviteler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    Yeni kullanıcı kaydı
                  </p>
                  <p className="text-xs text-gray-500">5 dakika önce</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Briefcase className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    Yeni iş ilanı yayınlandı
                  </p>
                  <p className="text-xs text-gray-500">15 dakika önce</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    Ödeme tamamlandı
                  </p>
                  <p className="text-xs text-gray-500">1 saat önce</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    İçerik raporlandı
                  </p>
                  <p className="text-xs text-gray-500">2 saat önce</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Alerts Section */}
      {alerts && alerts.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Son Uyarılar</span>
              <Badge
                variant="outline"
                className="border-orange-300 text-orange-600"
              >
                {alerts.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert: SecurityAlert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    alert.type === 'error'
                      ? 'border-red-200 bg-red-50'
                      : alert.type === 'warning'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        alert.type === 'error'
                          ? 'bg-red-500'
                          : alert.type === 'warning'
                            ? 'bg-orange-500'
                            : 'bg-blue-500'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        alert.priority === 'critical'
                          ? 'destructive'
                          : alert.priority === 'high'
                            ? 'warning'
                            : 'secondary'
                      }
                    >
                      {alert.priority === 'critical'
                        ? 'Kritik'
                        : alert.priority === 'high'
                          ? 'Yüksek'
                          : alert.priority === 'medium'
                            ? 'Orta'
                            : 'Düşük'}
                    </Badge>
                    {!alert.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alertAction(alert.id, 'read')}
                      >
                        Okundu İşaretle
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced System Health & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* System Health Widget */}
        <SystemHealthWidget className="lg:col-span-1" />

        {/* Pending Tasks */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Bekleyen Görevler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-gray-600">
                    Onay Bekleyen Kullanıcılar
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="border-orange-300 text-orange-600"
                >
                  23
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600">
                    Moderasyon Kuyruğu
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="border-red-300 text-red-600"
                >
                  12
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    Destek Talepleri
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="border-blue-300 text-blue-600"
                >
                  8
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-600">
                    Bekleyen Ödemeler
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="border-purple-300 text-purple-600"
                >
                  5
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Hızlı İşlemler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Users className="mr-2 h-4 w-4" />
                Kullanıcı Ekle
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                İş İlanı Onayla
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Eye className="mr-2 h-4 w-4" />
                İçerik İncele
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Rapor Oluştur
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Activity className="mr-2 h-4 w-4" />
                Sistem Logları
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
