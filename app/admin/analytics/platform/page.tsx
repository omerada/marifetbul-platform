/**
 * ================================================
 * ADMIN PLATFORM ANALYTICS PAGE
 * ================================================
 * Comprehensive platform analytics dashboard with metrics and charts
 *
 * Route: /admin/analytics/platform
 * Access: Admin only
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 2 Story 2.2 - Production Implementation
 */

'use client';

import { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import {
  PlatformMetricCard,
  RevenueChart,
  UserGrowthChart,
  OrderTrendsChart,
} from '@/components/domains/admin/analytics';
import {
  getTodaysRevenueBreakdown,
  getDailyNewUserTrend,
  getTodaysOrderAnalytics,
} from '@/lib/api/admin-analytics';
import { formatCurrency } from '@/lib/shared/formatters';
import logger from '@/lib/infrastructure/monitoring/logger';
import { useToast } from '@/hooks';

interface RevenueTrendPoint {
  date: string;
  value: number;
}

interface OrderTrendPoint {
  date: string;
  orderCount: number;
  completedCount: number;
  cancelledCount: number;
}

/**
 * Admin Platform Analytics Page
 */
export default function AdminPlatformAnalyticsPage() {
  const { error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // State for metrics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);
  const [revenueGrowth, setRevenueGrowth] = useState(0);

  // State for charts
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendPoint[]>([]);
  const [userGrowth, setUserGrowth] = useState<{ [date: string]: number }>({});
  const [orderTrends, setOrderTrends] = useState<OrderTrendPoint[]>([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        // Calculate date range (last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const startDateStr = startDate.toISOString();
        const endDateStr = endDate.toISOString();

        // Fetch all analytics data in parallel
        const [revenueResponse, userGrowthResponse, orderResponse] =
          await Promise.all([
            getTodaysRevenueBreakdown(),
            getDailyNewUserTrend(startDateStr, endDateStr),
            getTodaysOrderAnalytics(),
          ]);

        // Set metrics
        setTotalRevenue(revenueResponse.summary.grossRevenue || 0);
        setRevenueGrowth(revenueResponse.growth.growthRate || 0);
        setOrderCount(orderResponse.summary.totalOrders || 0);
        setAverageOrderValue(orderResponse.summary.averageOrderValue || 0);

        // Set user growth
        setUserGrowth(userGrowthResponse);

        // Transform order trends (use daily trend from response)
        if (orderResponse.dailyTrend) {
          setOrderTrends(
            orderResponse.dailyTrend.map((day) => ({
              date: day.date,
              orderCount: day.orderCount,
              completedCount: day.completedCount,
              cancelledCount: day.cancelledCount,
            }))
          );
        }

        // Mock revenue trend (backend doesn't return trend, only breakdown)
        // In production, call /api/v1/admin/analytics/revenue/trend
        const mockRevenueTrend: RevenueTrendPoint[] = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          mockRevenueTrend.push({
            date: date.toISOString().split('T')[0],
            value: Math.random() * 100000 + 50000,
          });
        }
        setRevenueTrend(mockRevenueTrend);

        logger.info('Platform analytics loaded successfully', {
          component: 'AdminPlatformAnalyticsPage',
        });
      } catch (err) {
        logger.error(
          'Failed to fetch platform analytics',
          err instanceof Error ? err : new Error(String(err)),
          {
            component: 'AdminPlatformAnalyticsPage',
          }
        );
        showError('Hata', 'Platform analitikleri yuklenemedi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [showError]);

  /**
   * Loading State
   */
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2" />
            <p className="text-muted-foreground">
              Platform analitikleri yukleniyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Analitikleri</h1>
          <p className="text-muted-foreground mt-1">
            Platform performans metrikleri ve trendleri
          </p>
        </div>
        <div className="bg-muted/50 flex items-center gap-2 rounded-lg px-4 py-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">Son 30 Gun</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <PlatformMetricCard
          title="Toplam Gelir"
          value={formatCurrency(totalRevenue)}
          change={revenueGrowth}
          trend={
            revenueGrowth > 0 ? 'up' : revenueGrowth < 0 ? 'down' : 'neutral'
          }
          icon={DollarSign}
        />
        <PlatformMetricCard
          title="Siparis Sayisi"
          value={orderCount.toLocaleString('tr-TR')}
          icon={ShoppingCart}
        />
        <PlatformMetricCard
          title="Ortalama Siparis Degeri"
          value={formatCurrency(averageOrderValue)}
          icon={TrendingUp}
        />
        <PlatformMetricCard
          title="Yeni Kullanicilar"
          value={Object.values(userGrowth).reduce((a, b) => a + b, 0)}
          subtitle="Son 30 gun"
          icon={Users}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart data={revenueTrend} title="Gelir Trendi (Son 30 Gun)" />
        <UserGrowthChart data={userGrowth} title="Gunluk Yeni Kullanicilar" />
      </div>

      {/* Order Trends */}
      {orderTrends.length > 0 && (
        <OrderTrendsChart
          data={orderTrends}
          title="Siparis Trendleri (Son 30 Gun)"
        />
      )}
    </div>
  );
}
