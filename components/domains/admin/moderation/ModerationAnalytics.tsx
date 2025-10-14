'use client';

import { useState, useEffect, useCallback } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
import { logger } from '@/lib/shared/utils/logger';
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Target,
  Zap,
  Activity,
  UserCheck,
  FileText,
} from 'lucide-react';

// Types
interface ModerationAnalytics {
  overview: {
    totalActions: number;
    actionsToday: number;
    actionsTrend: number; // percentage change
    averageResponseTime: number; // minutes
    responseTrend: number;
    accuracyRate: number; // percentage
    accuracyTrend: number;
    activeContentFlags: number;
    flagsTrend: number;
  };
  actionBreakdown: {
    approved: number;
    rejected: number;
    escalated: number;
    autoApproved: number;
    autoRejected: number;
    pending: number;
  };
  categoryStats: Array<{
    category: string;
    totalActions: number;
    approvalRate: number;
    averageTime: number;
    accuracy: number;
    trend: number;
  }>;
  moderatorPerformance: Array<{
    moderatorId: string;
    moderatorName: string;
    totalActions: number;
    averageTime: number;
    accuracyRate: number;
    approvalRate: number;
    workload: 'light' | 'normal' | 'heavy' | 'overloaded';
    onlineStatus: 'online' | 'offline' | 'busy';
    lastActive: string;
  }>;
  timeSeriesData: {
    daily: Array<{
      date: string;
      actions: number;
      approved: number;
      rejected: number;
      escalated: number;
      averageTime: number;
      accuracy: number;
    }>;
    hourly: Array<{
      hour: number;
      actions: number;
      averageTime: number;
    }>;
  };
  contentTypes: Array<{
    type: 'job' | 'service' | 'review' | 'message' | 'profile';
    count: number;
    approvalRate: number;
    riskScore: number;
  }>;
  automationMetrics: {
    totalAutomated: number;
    automationRate: number; // percentage
    accuracyRate: number;
    falsePositiveRate: number;
    falseNegativeRate: number;
    timeSaved: number; // hours
    costSavings: number; // in currency
  };
  riskAnalysis: {
    highRiskUsers: number;
    highRiskContent: number;
    riskDistribution: Array<{
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      count: number;
      percentage: number;
    }>;
    riskTrends: Array<{
      date: string;
      riskScore: number;
      incidents: number;
    }>;
  };
  reportingData: {
    userReports: number;
    systemFlags: number;
    adminReviews: number;
    appealsCases: number;
    resolutionRate: number;
    escalationRate: number;
  };
}

interface AnalyticsFilters {
  dateRange: '1d' | '7d' | '30d' | '90d' | 'custom';
  startDate?: string;
  endDate?: string;
  moderators: string[];
  categories: string[];
  contentTypes: string[];
  actionTypes: string[];
}

export default function ModerationAnalytics() {
  const [analytics, setAnalytics] = useState<ModerationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: '7d',
    moderators: [],
    categories: [],
    contentTypes: [],
    actionTypes: [],
  });
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('period', filters.dateRange);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.moderators.length > 0)
        params.append('moderators', filters.moderators.join(','));
      if (filters.categories.length > 0)
        params.append('categories', filters.categories.join(','));
      if (filters.contentTypes.length > 0)
        params.append('contentTypes', filters.contentTypes.join(','));
      if (filters.actionTypes.length > 0)
        params.append('actionTypes', filters.actionTypes.join(','));

      const response = await fetch(`/api/moderation/analytics?${params}`);
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      logger.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh setup
  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(fetchAnalytics, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchAnalytics]);

  const exportData = async (format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      params.append('period', filters.dateRange);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(
        `/api/moderation/analytics/export?${params}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `moderation-analytics-${format}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      logger.error('Error exporting data:', error);
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes.toFixed(1)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins.toFixed(0)}m`;
  };

  const getWorkloadColor = (workload: string) => {
    switch (workload) {
      case 'light':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'heavy':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overloaded':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2">Analitik veriler yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="py-8 text-center">
          <BarChart3 className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <p className="text-gray-500">Analitik veriler yüklenemedi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Moderasyon Analitikleri
          </h1>
          <p className="text-gray-600">
            Detaylı moderasyon performansı ve trend analizi
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={filters.dateRange}
            onChange={(e) =>
              setFilters({
                ...filters,
                dateRange: e.target.value as '1d' | '7d' | '30d' | '90d',
              })
            }
            className="rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="1d">Son 24 Saat</option>
            <option value="7d">Son 7 Gün</option>
            <option value="30d">Son 30 Gün</option>
            <option value="90d">Son 90 Gün</option>
            <option value="custom">Özel Tarih</option>
          </select>

          <select
            value={refreshInterval || ''}
            onChange={(e) =>
              setRefreshInterval(
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Manuel Yenileme</option>
            <option value="30">30 saniye</option>
            <option value="60">1 dakika</option>
            <option value="300">5 dakika</option>
          </select>

          <Button
            variant="outline"
            onClick={fetchAnalytics}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Yenile
          </Button>

          <Button
            variant="outline"
            onClick={() => exportData('xlsx')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam İşlem</p>
                <p className="text-2xl font-bold">
                  {formatNumber(analytics.overview.totalActions)}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  {getTrendIcon(analytics.overview.actionsTrend)}
                  <span
                    className={`text-sm ${getTrendColor(analytics.overview.actionsTrend)}`}
                  >
                    {Math.abs(analytics.overview.actionsTrend).toFixed(1)}%
                  </span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ortalama Yanıt Süresi</p>
                <p className="text-2xl font-bold">
                  {formatDuration(analytics.overview.averageResponseTime)}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  {getTrendIcon(analytics.overview.responseTrend)}
                  <span
                    className={`text-sm ${getTrendColor(analytics.overview.responseTrend)}`}
                  >
                    {Math.abs(analytics.overview.responseTrend).toFixed(1)}%
                  </span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Doğruluk Oranı</p>
                <p className="text-2xl font-bold">
                  {analytics.overview.accuracyRate.toFixed(1)}%
                </p>
                <div className="mt-1 flex items-center gap-1">
                  {getTrendIcon(analytics.overview.accuracyTrend)}
                  <span
                    className={`text-sm ${getTrendColor(analytics.overview.accuracyTrend)}`}
                  >
                    {Math.abs(analytics.overview.accuracyTrend).toFixed(1)}%
                  </span>
                </div>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktif Bayraklar</p>
                <p className="text-2xl font-bold">
                  {formatNumber(analytics.overview.activeContentFlags)}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  {getTrendIcon(analytics.overview.flagsTrend)}
                  <span
                    className={`text-sm ${getTrendColor(analytics.overview.flagsTrend)}`}
                  >
                    {Math.abs(analytics.overview.flagsTrend).toFixed(1)}%
                  </span>
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="moderators" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Moderatörler
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Otomasyon
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risk Analizi
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Raporlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Action Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>İşlem Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Onaylandı</span>
                    </div>
                    <span className="font-medium">
                      {analytics.actionBreakdown.approved}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Reddedildi</span>
                    </div>
                    <span className="font-medium">
                      {analytics.actionBreakdown.rejected}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span>Yükseltildi</span>
                    </div>
                    <span className="font-medium">
                      {analytics.actionBreakdown.escalated}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span>Otomatik Onay</span>
                    </div>
                    <span className="font-medium">
                      {analytics.actionBreakdown.autoApproved}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-500" />
                      <span>Otomatik Red</span>
                    </div>
                    <span className="font-medium">
                      {analytics.actionBreakdown.autoRejected}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>Beklemede</span>
                    </div>
                    <span className="font-medium">
                      {analytics.actionBreakdown.pending}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Kategori İstatistikleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.categoryStats.map((category) => (
                    <div key={category.category} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {category.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {category.totalActions}
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            {category.approvalRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${category.approvalRate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Types */}
            <Card>
              <CardHeader>
                <CardTitle>İçerik Türleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.contentTypes.map((contentType) => (
                    <div
                      key={contentType.type}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="capitalize">{contentType.type}</span>
                        <Badge
                          className={`border ${getRiskColor(contentType.riskScore > 0.7 ? 'high' : contentType.riskScore > 0.4 ? 'medium' : 'low')}`}
                        >
                          Risk: {(contentType.riskScore * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {contentType.count}
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          {contentType.approvalRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time Series Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Günlük Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <BarChart3 className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-gray-500">
                      Grafik verisi burada gösterilecek
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="moderators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderatör Performansı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left">Moderatör</th>
                      <th className="p-3 text-left">İşlem Sayısı</th>
                      <th className="p-3 text-left">Ort. Süre</th>
                      <th className="p-3 text-left">Doğruluk</th>
                      <th className="p-3 text-left">İş Yükü</th>
                      <th className="p-3 text-left">Durum</th>
                      <th className="p-3 text-left">Son Aktivite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.moderatorPerformance.map((moderator) => (
                      <tr
                        key={moderator.moderatorId}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-3 font-medium">
                          {moderator.moderatorName}
                        </td>
                        <td className="p-3">{moderator.totalActions}</td>
                        <td className="p-3">
                          {formatDuration(moderator.averageTime)}
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-medium ${
                              moderator.accuracyRate >= 90
                                ? 'text-green-600'
                                : moderator.accuracyRate >= 75
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                            }`}
                          >
                            {moderator.accuracyRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-3">
                          <Badge
                            className={`border ${getWorkloadColor(moderator.workload)}`}
                          >
                            {moderator.workload}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            className={`border ${getStatusColor(moderator.onlineStatus)}`}
                          >
                            {moderator.onlineStatus}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {new Date(moderator.lastActive).toLocaleDateString(
                            'tr-TR'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Otomasyon Metrikleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Toplam Otomatik İşlem</span>
                    <span className="font-bold">
                      {analytics.automationMetrics.totalAutomated}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Otomasyon Oranı</span>
                    <span className="font-bold text-blue-600">
                      {analytics.automationMetrics.automationRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Doğruluk Oranı</span>
                    <span className="font-bold text-green-600">
                      {analytics.automationMetrics.accuracyRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Yanlış Pozitif Oranı</span>
                    <span className="font-bold text-red-600">
                      {analytics.automationMetrics.falsePositiveRate.toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tasarruf Edilen Süre</span>
                    <span className="font-bold text-purple-600">
                      {analytics.automationMetrics.timeSaved.toFixed(1)} saat
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maliyet Tasarrufu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="mb-2 text-3xl font-bold text-green-600">
                    ₺{analytics.automationMetrics.costSavings.toLocaleString()}
                  </div>
                  <div className="text-gray-600">Bu ay tasarruf</div>
                  <div className="mt-4 text-sm text-gray-500">
                    Otomasyon sayesinde manual işçilik maliyetinde azalma
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Risk Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.riskAnalysis.riskDistribution.map((risk) => (
                    <div key={risk.riskLevel} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`border ${getRiskColor(risk.riskLevel)}`}
                          >
                            {risk.riskLevel}
                          </Badge>
                          <span>{risk.count} öğe</span>
                        </div>
                        <span className="font-medium">
                          {risk.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full ${
                            risk.riskLevel === 'critical'
                              ? 'bg-red-500'
                              : risk.riskLevel === 'high'
                                ? 'bg-orange-500'
                                : risk.riskLevel === 'medium'
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                          }`}
                          style={{ width: `${risk.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Yüksek Risk Özetı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Yüksek Riskli Kullanıcılar</span>
                    <span className="font-bold text-red-600">
                      {analytics.riskAnalysis.highRiskUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Yüksek Riskli İçerik</span>
                    <span className="font-bold text-red-600">
                      {analytics.riskAnalysis.highRiskContent}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Raporlama Verileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.reportingData.userReports}
                  </div>
                  <div className="text-sm text-gray-600">
                    Kullanıcı Raporları
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.reportingData.systemFlags}
                  </div>
                  <div className="text-sm text-gray-600">Sistem Bayrakları</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.reportingData.adminReviews}
                  </div>
                  <div className="text-sm text-gray-600">
                    Admin İncelemeleri
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {analytics.reportingData.appealsCases}
                  </div>
                  <div className="text-sm text-gray-600">İtiraz Vakaları</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">
                    {analytics.reportingData.resolutionRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Çözüm Oranı</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {analytics.reportingData.escalationRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Yükseltme Oranı</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
