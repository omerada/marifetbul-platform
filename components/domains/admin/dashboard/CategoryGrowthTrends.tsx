'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
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
import { formatCurrency } from '@/lib/shared/formatters';
import type { CategoryPerformance } from '@/types/analytics';
import logger from '@/lib/infrastructure/monitoring/logger';

interface CategoryGrowthTrendsProps {
  categoryId?: string;
  months?: number;
}

export function CategoryGrowthTrends({
  categoryId,
  months = 6,
}: CategoryGrowthTrendsProps) {
  const [trends, setTrends] = useState<CategoryPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrowthTrends = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authHeader = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1];

      const url = categoryId
        ? `/api/v1/admin/analytics/categories/${categoryId}/growth-trend?months=${months}`
        : `/api/v1/admin/analytics/categories/growth-trends?months=${months}&limit=10`;

      const response = await fetch(url, {
        headers: {
          ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Büyüme trendi alınamadı');
      }

      const result = await response.json();
      setTrends(Array.isArray(result.data) ? result.data : [result.data]);
    } catch (err) {
      logger.error(
        'Category growth trends fetch error:',
        err instanceof Error ? err : new Error(String(err))
      );
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowthTrends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, months]);

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: 'UP' | 'DOWN' | 'STABLE') => {
    switch (trend) {
      case 'UP':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'DOWN':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Büyüme Trendleri</span>
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
            <span>Büyüme Trendleri</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="mb-2 h-12 w-12 text-red-400" />
            <p className="mb-4 text-red-600">{error || 'Veri bulunamadı'}</p>
            <Button onClick={fetchGrowthTrends}>Tekrar Dene</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Büyüme Trendleri</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trends.map((trend) => (
            <div
              key={trend.categoryId}
              className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {trend.categoryName}
                  </h4>
                  <p className="text-sm text-gray-500">{trend.period}</p>
                </div>
                <Badge
                  className={getPerformanceColor(trend.trends.performanceScore)}
                >
                  {trend.trends.performanceScore.toFixed(0)} Puan
                </Badge>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="mb-1 text-xs text-gray-600">Sipariş</p>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(trend.trends.orderTrend)}
                    <span className="text-sm font-semibold text-gray-900">
                      {trend.metrics.orderCount.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs text-gray-600">Gelir</p>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(trend.trends.revenueTrend)}
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(trend.metrics.revenue)}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs text-gray-600">Paket</p>
                  <span className="text-sm font-semibold text-gray-900">
                    {trend.metrics.packageCount.toLocaleString('tr-TR')}
                  </span>
                </div>

                <div>
                  <p className="mb-1 text-xs text-gray-600">AOV</p>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(trend.metrics.avgOrderValue)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-xs text-gray-600">Dönüşüm Oranı</p>
                    <p className="text-sm font-medium text-gray-900">
                      {trend.metrics.conversionRate.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Büyüme Oranı</p>
                    <Badge
                      variant={
                        trend.metrics.growthRate >= 0
                          ? 'success'
                          : 'destructive'
                      }
                    >
                      {formatPercentage(trend.metrics.growthRate)}
                    </Badge>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {trend.trends.orderTrend === 'UP' && (
                    <Badge variant="success">📈 Sipariş Artışı</Badge>
                  )}
                  {trend.trends.revenueTrend === 'UP' && (
                    <Badge variant="success">💰 Gelir Artışı</Badge>
                  )}
                  {trend.trends.orderTrend === 'DOWN' && (
                    <Badge variant="destructive">⚠️ Sipariş Düşüşü</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
