'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  DollarSign,
  Eye,
  MessageSquare,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Award,
  Clock,
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { FreelancerAnalytics, EmployerAnalytics } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Sprint8AnalyticsDashboardProps {
  userType: 'freelancer' | 'employer';
  className?: string;
}

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

const timeRangeOptions = [
  { value: '7d' as TimeRange, label: 'Son 7 Gün' },
  { value: '30d' as TimeRange, label: 'Son 30 Gün' },
  { value: '90d' as TimeRange, label: 'Son 3 Ay' },
  { value: '1y' as TimeRange, label: 'Son 1 Yıl' },
  { value: 'all' as TimeRange, label: 'Tüm Zamanlar' },
];

export function Sprint8AnalyticsDashboard({
  userType,
  className,
}: Sprint8AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const { analytics, isLoading, error, refresh, exportData } =
    useAnalytics(userType);

  const handleExport = async () => {
    try {
      await exportData({
        format: 'pdf',
        sections: ['overview', 'charts'],
        timeframe: { period: 'month' },
        includeCharts: true,
        includeRawData: false,
      });
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleRefresh = () => {
    refresh();
  };

  // Calculate insights from analytics data
  const insights = useMemo(() => {
    if (!analytics) return null;

    // Analytics doğrudan FreelancerAnalytics veya EmployerAnalytics tipinde
    const data = analytics;

    if (!data || !data.overview) return null;

    const overview = data.overview;

    // Type guard ile userType'a göre data structure'ını belirle
    if (userType === 'freelancer' && 'totalEarnings' in overview) {
      const freelancerData = data as FreelancerAnalytics;
      const trends = {
        revenue:
          (freelancerData.earnings?.totalEarnings || 0) > 0 ? 'up' : 'stable',
        projects: Number(overview.completedOrders || 0) > 0 ? 'up' : 'stable',
        rating:
          Number(overview.clientSatisfaction || 0) >= 4.5
            ? 'excellent'
            : Number(overview.clientSatisfaction || 0) >= 4.0
              ? 'good'
              : 'needs-improvement',
        responses: 'fast', // responseTime string olduğu için basit yaklaşım
      };

      return {
        data: {
          revenue: {
            current: freelancerData.earnings?.totalEarnings || 0,
            previous: (freelancerData.earnings?.totalEarnings || 0) * 0.8, // Mock previous value
          },
          totalProjects: overview.completedOrders || 0,
          activeProjects: overview.activeOrders || 0,
          completedProjects: overview.completedOrders || 0,
          averageRating: overview.clientSatisfaction || 0,
          averageResponseTime: 2, // Mock response time in hours
          profileViews: overview.profileViews || 0,
          repeatClientRate: overview.repeatClientRate || 0,
          topCategories:
            (freelancerData.orders as Record<string, unknown>)
              ?.ordersByCategory &&
            Array.isArray(
              (freelancerData.orders as Record<string, unknown>)
                .ordersByCategory
            )
              ? (
                  (freelancerData.orders as Record<string, unknown>)
                    .ordersByCategory as Record<string, unknown>[]
                ).map((cat: Record<string, unknown>) => ({
                  name: (cat.category as string) || 'Unknown',
                  count: (cat.count as number) || 0,
                }))
              : [],
        },
        trends,
      };
    }

    if (userType === 'employer' && 'totalSpent' in overview) {
      const employerData = data as EmployerAnalytics;
      const overviewData = overview as Record<string, unknown>; // Type assertion for unknown properties
      const trends = {
        revenue: employerData.spending?.total
          ? employerData.spending.total > 0
            ? 'up'
            : 'stable'
          : 'stable',
        projects:
          (overviewData.completedProjects as number) > 0 ? 'up' : 'stable',
        rating: 4.5, // Mock rating
        responses: 'fast',
      };

      return {
        data: {
          revenue: {
            current: employerData.spending?.total || 0,
            previous: (employerData.spending?.total || 0) * 0.8,
          },
          totalProjects: overviewData.completedProjects || 0,
          activeProjects: overviewData.activeProjects || 0,
          completedProjects: overviewData.completedProjects || 0,
          averageRating: 4.5, // Mock rating
          averageResponseTime: 12, // Mock response time
          profileViews: 0, // Not applicable for employers
          repeatClientRate: 75, // Mock value
          topCategories: Array.isArray(employerData.projects)
            ? employerData.projects
                .filter((p): p is Record<string, unknown> =>
                  Boolean(p && typeof p === 'object')
                )
                .map((cat) => ({
                  name: (cat.category as string) || 'Unknown',
                  count: (cat.count as number) || 0,
                }))
            : [],
        },
        trends,
      };
    }

    return null;
  }, [analytics, userType]);

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="bg-muted h-32 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <p className="text-destructive mb-4">
            Analitik veriler yüklenirken hata oluştu.
          </p>
          <Button onClick={handleRefresh}>Tekrar Dene</Button>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <BarChart3 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-medium">Analitik Veri Bulunamadı</h3>
          <p className="text-muted-foreground">
            {userType === 'freelancer'
              ? 'Henüz proje tamamlamadınız.'
              : 'Henüz proje oluşturmadınız.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { data, trends } = insights;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            {userType === 'freelancer'
              ? 'Freelancer performansınızı izleyin'
              : 'İşveren aktivitelerinizi takip edin'}
          </p>
        </div>

        <div className="flex gap-2">
          {/* Time Range Selector */}
          <div className="bg-muted flex gap-1 rounded-lg p-1">
            {timeRangeOptions.map((option) => (
              <Button
                key={option.value}
                variant={timeRange === option.value ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(option.value)}
                className="text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue/Spent */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {userType === 'freelancer' ? 'Gelir' : 'Harcama'}
              </CardTitle>
              <DollarSign className="text-muted-foreground h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{data.revenue.current.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {trends.revenue === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={
                  trends.revenue === 'up' ? 'text-green-600' : 'text-red-600'
                }
              >
                %
                {Math.abs(
                  ((data.revenue.current - data.revenue.previous) /
                    data.revenue.previous) *
                    100 || 0
                ).toFixed(1)}
              </span>
              <span className="text-muted-foreground">önceki döneme göre</span>
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {userType === 'freelancer'
                  ? 'Tamamlanan Projeler'
                  : 'Aktif Projeler'}
              </CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(data.totalProjects as number) || 0}
            </div>
            <div className="text-muted-foreground text-xs">
              {(data.activeProjects as number) || 0} aktif proje
            </div>
          </CardContent>
        </Card>

        {/* Rating */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Ortalama Puan
              </CardTitle>
              <Star className="text-muted-foreground h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof data.averageRating === 'number'
                ? data.averageRating.toFixed(1)
                : '0.0'}
            </div>
            <div className="flex items-center gap-1">
              <Badge
                variant={
                  trends.rating === 'excellent'
                    ? 'default'
                    : trends.rating === 'good'
                      ? 'secondary'
                      : 'outline'
                }
                className="text-xs"
              >
                {trends.rating === 'excellent'
                  ? 'Mükemmel'
                  : trends.rating === 'good'
                    ? 'İyi'
                    : 'Gelişmeli'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Response Time / Profile Views */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {userType === 'freelancer'
                  ? 'Yanıt Süresi'
                  : 'Profil Görüntüleme'}
              </CardTitle>
              {userType === 'freelancer' ? (
                <MessageSquare className="text-muted-foreground h-4 w-4" />
              ) : (
                <Eye className="text-muted-foreground h-4 w-4" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userType === 'freelancer'
                ? `${(data.averageResponseTime as number) || 0}sa`
                : (data.profileViews as number) || 0}
            </div>
            <div className="text-muted-foreground text-xs">
              {userType === 'freelancer'
                ? trends.responses === 'fast'
                  ? 'Hızlı yanıt'
                  : 'Yavaş yanıt'
                : 'Bu dönemde'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {userType === 'freelancer' ? 'Gelir Trendi' : 'Harcama Trendi'}
              </CardTitle>
              <LineChart className="text-muted-foreground h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground flex h-64 items-center justify-center">
              <div className="text-center">
                <BarChart3 className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm">Chart Component Placeholder</p>
                <p className="text-xs">Recharts ile implement edilecek</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Categories */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Proje Kategorileri</CardTitle>
              <PieChart className="text-muted-foreground h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topCategories.map(
                (category: { name: string; count: number }) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{category.name}</span>
                      <span className="font-medium">
                        {category.count} proje
                      </span>
                    </div>
                    <div className="bg-muted h-2 w-full rounded-full">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${(category.count / ((data.totalProjects as number) || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performans İçgörüleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="flex items-center gap-2 text-sm font-medium">
                <Award className="h-4 w-4 text-yellow-500" />
                En İyi Performans
              </h4>
              <div className="text-muted-foreground space-y-1 text-xs">
                <div>
                  • Ortalama puan:{' '}
                  {typeof data.averageRating === 'number'
                    ? data.averageRating.toFixed(1)
                    : '0.0'}
                  /5
                </div>
                <div>
                  • Tamamlanma oranı: %
                  {(
                    (((data.completedProjects as number) || 0) /
                      ((data.totalProjects as number) || 1)) *
                    100
                  ).toFixed(1)}
                </div>
                <div>
                  • Tekrar çalışma oranı: %
                  {(data.repeatClientRate as number) || 0}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Gelişim Alanları
              </h4>
              <div className="text-muted-foreground space-y-1 text-xs">
                <div>• Yanıt süresini iyileştir</div>
                <div>• Daha fazla kategori dene</div>
                <div>• Müşteri memnuniyetini artır</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-green-500" />
                Öneriler
              </h4>
              <div className="text-muted-foreground space-y-1 text-xs">
                <div>• Profili güncel tut</div>
                <div>• Portfolyoyu genişlet</div>
                <div>• Aktif ol ve hızlı yanıtla</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
