'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import type { PackageTrend } from '@/types/analytics';
import { logger } from '@/lib/shared/utils/logger';

interface PackageTrendChartProps {
  packageId: string;
  days?: number;
}

export function PackageTrendChart({
  packageId,
  days = 30,
}: PackageTrendChartProps) {
  const [trends, setTrends] = useState<PackageTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authHeader = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1];

      const response = await fetch(
        `/api/v1/admin/analytics/packages/${packageId}/trend?days=${days}`,
        {
          headers: {
            ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Paket trend verileri alınamadı');
      }

      const result = await response.json();
      setTrends(result.data || result);
    } catch (err) {
      logger.error('Package trend fetch error:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId, days]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  const getTrendIcon = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < -5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const calculateStats = () => {
    if (trends.length === 0) return null;

    const totalViews = trends.reduce((sum, t) => sum + t.views, 0);
    const totalOrders = trends.reduce((sum, t) => sum + t.orders, 0);
    const totalRevenue = trends.reduce((sum, t) => sum + t.revenue, 0);
    const avgConversion =
      trends.reduce((sum, t) => sum + t.conversionRate, 0) / trends.length;

    return {
      totalViews,
      totalOrders,
      totalRevenue,
      avgConversion,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    };
  };

  const getMaxValues = () => {
    if (trends.length === 0)
      return { maxViews: 1, maxOrders: 1, maxRevenue: 1 };

    return {
      maxViews: Math.max(...trends.map((t) => t.views)),
      maxOrders: Math.max(...trends.map((t) => t.orders)),
      maxRevenue: Math.max(...trends.map((t) => t.revenue)),
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Paket Trend Analizi</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Paket Trend Analizi</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="mb-2 h-12 w-12 text-red-400" />
            <p className="mb-4 text-red-600">{error || 'Veri bulunamadı'}</p>
            <Button onClick={fetchTrends}>Tekrar Dene</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = calculateStats();
  const maxValues = getMaxValues();

  if (!stats) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Paket Trend Analizi ({days} Gün)</span>
          </div>
          <Button onClick={fetchTrends} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-3">
            <p className="mb-1 text-xs text-gray-600">Toplam Görüntülenme</p>
            <p className="text-xl font-bold text-gray-900">
              {stats.totalViews.toLocaleString('tr-TR')}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="mb-1 text-xs text-gray-600">Toplam Sipariş</p>
            <p className="text-xl font-bold text-gray-900">
              {stats.totalOrders.toLocaleString('tr-TR')}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="mb-1 text-xs text-gray-600">Toplam Gelir</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="mb-1 text-xs text-gray-600">Ort. Dönüşüm</p>
            <p className="text-xl font-bold text-gray-900">
              {stats.avgConversion.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Günlük Trend</h3>

          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {trends
                .slice()
                .reverse()
                .map((trend, index, arr) => {
                  const prevTrend = index > 0 ? arr[index - 1] : trend;

                  return (
                    <div
                      key={trend.date}
                      className="grid grid-cols-12 items-center gap-2 border-b border-gray-100 py-2 hover:bg-gray-50"
                    >
                      {/* Date */}
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(trend.date)}
                        </p>
                      </div>

                      {/* Views */}
                      <div className="col-span-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-xs text-gray-600">
                                Görüntülenme
                              </span>
                              <span className="text-xs font-semibold">
                                {trend.views.toLocaleString('tr-TR')}
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-blue-500"
                                style={{
                                  width: `${(trend.views / maxValues.maxViews) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                          {getTrendIcon(trend.views, prevTrend.views)}
                        </div>
                      </div>

                      {/* Orders */}
                      <div className="col-span-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-xs text-gray-600">
                                Sipariş
                              </span>
                              <span className="text-xs font-semibold">
                                {trend.orders.toLocaleString('tr-TR')}
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-green-500"
                                style={{
                                  width: `${(trend.orders / maxValues.maxOrders) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                          {getTrendIcon(trend.orders, prevTrend.orders)}
                        </div>
                      </div>

                      {/* Revenue */}
                      <div className="col-span-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-xs text-gray-600">
                                Gelir
                              </span>
                              <span className="text-xs font-semibold">
                                {formatCurrency(trend.revenue)}
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-purple-500"
                                style={{
                                  width: `${(trend.revenue / maxValues.maxRevenue) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                          {getTrendIcon(trend.revenue, prevTrend.revenue)}
                        </div>
                      </div>

                      {/* Conversion Rate */}
                      <div className="col-span-1">
                        <Badge variant="secondary">
                          {trend.conversionRate.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
