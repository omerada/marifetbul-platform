'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Mail, Bell, Eye, Clock } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/**
 * Notification Analytics Dashboard Component
 *
 * Comprehensive analytics dashboard for notification system including:
 * - System-wide metrics (admin only)
 * - Email delivery statistics
 * - Push notification metrics
 * - User engagement analytics
 * - Time-based trends
 *
 * Features:
 * - Interactive charts (Recharts)
 * - Period selection (7/30/90 days)
 * - Real-time data updates
 * - Responsive design
 * - Export capabilities
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-24
 */

interface NotificationAnalyticsDashboardProps {
  /**
   * Analytics data from API
   */
  analytics: NotificationAnalyticsData;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Period selection callback
   */
  onPeriodChange?: (period: '7d' | '30d' | '90d') => void;

  /**
   * Show system-wide metrics (admin only)
   */
  isAdmin?: boolean;
}

interface NotificationAnalyticsData {
  periodStart: string;
  periodEnd: string;
  totalSent: number;
  totalRead: number;
  totalUnread: number;
  readRate: number;
  avgReadTimeMinutes: number;
  emailStats: EmailStats;
  pushStats: PushStats;
  inAppStats: InAppStats;
  typeBreakdown: TypeBreakdown[];
  priorityBreakdown: PriorityBreakdown[];
  dailyTrends: DailyTrend[];
  hourlyDistribution: Record<number, number>;
  topPerformingTypes: TypePerformance[];
}

interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalFailed: number;
  totalBounced: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  avgSendTimeMs: number;
}

interface PushStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  avgDevicesPerUser: number;
}

interface InAppStats {
  totalCreated: number;
  totalRead: number;
  totalUnread: number;
  readRate: number;
  avgReadTimeMinutes: number;
}

interface TypeBreakdown {
  type: string;
  count: number;
  percentage: number;
  readCount: number;
  readRate: number;
}

interface PriorityBreakdown {
  priority: string;
  count: number;
  percentage: number;
  avgReadTimeMinutes: number;
}

interface DailyTrend {
  date: string;
  totalSent: number;
  totalRead: number;
  readRate: number;
  emailSent: number;
  pushSent: number;
}

interface TypePerformance {
  type: string;
  totalSent: number;
  engagementScore: number;
  avgReadTimeMinutes: number;
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  pink: '#ec4899',
  gray: '#6b7280',
};

const PIE_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.info,
  COLORS.purple,
  COLORS.pink,
  COLORS.gray,
];

export default function NotificationAnalyticsDashboard({
  analytics,
  isLoading = false,
  onPeriodChange,
}: NotificationAnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>(
    '30d'
  );

  const handlePeriodChange = (period: '7d' | '30d' | '90d') => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  // Prepare hourly distribution data
  const hourlyData = Object.entries(analytics.hourlyDistribution || {}).map(
    ([hour, count]) => ({
      hour: parseInt(hour),
      count: count,
      label: `${hour}:00`,
    })
  );

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Analytics yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Bildirim Analitiği
          </h2>
          <p className="text-gray-600">
            {new Date(analytics.periodStart).toLocaleDateString('tr-TR')} -{' '}
            {new Date(analytics.periodEnd).toLocaleDateString('tr-TR')}
          </p>
        </div>

        {/* Period selector */}
        <div className="flex gap-2">
          <button
            onClick={() => handlePeriodChange('7d')}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              selectedPeriod === '7d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            7 Gün
          </button>
          <button
            onClick={() => handlePeriodChange('30d')}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              selectedPeriod === '30d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            30 Gün
          </button>
          <button
            onClick={() => handlePeriodChange('90d')}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              selectedPeriod === '90d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            90 Gün
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Gönderim
            </CardTitle>
            <Bell className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalSent.toLocaleString('tr-TR')}
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {analytics.totalUnread} okunmamış
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Okunma Oranı</CardTitle>
            <Eye className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.readRate.toFixed(1)}%
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {analytics.totalRead.toLocaleString('tr-TR')} okundu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              E-posta Açılma
            </CardTitle>
            <Mail className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.emailStats.openRate.toFixed(1)}%
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {analytics.emailStats.totalOpened.toLocaleString('tr-TR')} açılma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ort. Okuma Süresi
            </CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(analytics.avgReadTimeMinutes)} dk
            </div>
            <p className="mt-1 text-xs text-gray-600">Ortalama süre</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="email">E-posta</TabsTrigger>
          <TabsTrigger value="push">Push</TabsTrigger>
          <TabsTrigger value="trends">Trendler</TabsTrigger>
          <TabsTrigger value="performance">Performans</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Bildirim Türleri</CardTitle>
                <p className="text-sm text-gray-600">Türe göre dağılım</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.typeBreakdown.map(
                        (item: TypeBreakdown) => ({ ...item, name: item.type })
                      )}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="type"
                    >
                      {analytics.typeBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Priority Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Öncelik Dağılımı</CardTitle>
                <p className="text-sm text-gray-600">
                  Önceliğe göre bildirimler
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.priorityBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Hourly Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Saatlik Dağılım</CardTitle>
              <p className="text-sm text-gray-600">
                Gün içinde bildirim yoğunluğu
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Teslimat Oranı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {analytics.emailStats.deliveryRate.toFixed(1)}%
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  {analytics.emailStats.totalDelivered} /{' '}
                  {analytics.emailStats.totalSent}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Açılma Oranı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {analytics.emailStats.openRate.toFixed(1)}%
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  {analytics.emailStats.totalOpened} açılma
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Tıklama Oranı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {analytics.emailStats.clickRate.toFixed(1)}%
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  {analytics.emailStats.totalClicked} tıklama
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>E-posta Metrikleri</CardTitle>
              <CardDescription>Detaylı e-posta istatistikleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Başarısız Gönderimler
                  </span>
                  <span className="text-sm font-semibold text-red-600">
                    {analytics.emailStats.totalFailed}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Geri Dönenler (Bounce)
                  </span>
                  <span className="text-sm font-semibold text-orange-600">
                    {analytics.emailStats.totalBounced} (
                    {analytics.emailStats.bounceRate.toFixed(1)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Ortalama Gönderim Süresi
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    {Math.round(analytics.emailStats.avgSendTimeMs)} ms
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Push Tab */}
        <TabsContent value="push" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Push Bildirim İstatistikleri</CardTitle>
                <p className="text-sm text-gray-600">
                  Push gönderim metrikleri
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Toplam Gönderim</span>
                  <span className="text-lg font-bold">
                    {analytics.pushStats.totalSent}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Teslimat Oranı</span>
                  <span className="text-lg font-bold text-green-600">
                    {analytics.pushStats.deliveryRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Başarısız</span>
                  <span className="text-lg font-bold text-red-600">
                    {analytics.pushStats.totalFailed}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uygulama İçi Bildirimler</CardTitle>
                <p className="text-sm text-gray-600">
                  In-app notification metrikleri
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Toplam Oluşturulan
                  </span>
                  <span className="text-lg font-bold">
                    {analytics.inAppStats.totalCreated}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Okunma Oranı</span>
                  <span className="text-lg font-bold text-blue-600">
                    {analytics.inAppStats.readRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Okunmamış</span>
                  <span className="text-lg font-bold text-orange-600">
                    {analytics.inAppStats.totalUnread}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Günlük Trendler</CardTitle>
              <p className="text-sm text-gray-600">
                Zaman içinde bildirim aktivitesi
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={analytics.dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('tr-TR', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString('tr-TR')
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalSent"
                    stroke={COLORS.primary}
                    name="Gönderilen"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalRead"
                    stroke={COLORS.success}
                    name="Okunan"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="emailSent"
                    stroke={COLORS.warning}
                    name="E-posta"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="pushSent"
                    stroke={COLORS.info}
                    name="Push"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>En Yüksek Performans</CardTitle>
              <p className="text-sm text-gray-600">
                En iyi etkileşim alan bildirim türleri
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPerformingTypes.map((type, index) => (
                  <div key={type.type} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-medium">{type.type}</span>
                        <span className="text-sm text-gray-600">
                          {type.totalSent} gönderim
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-2 flex-1 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-blue-600"
                            style={{
                              width: `${Math.min(type.engagementScore, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-blue-600">
                          {type.engagementScore.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
