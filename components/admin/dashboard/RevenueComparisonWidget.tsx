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
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { RevenueComparison } from '@/types/analytics';
import { logger } from '@/lib/shared/utils/logger';

interface RevenueComparisonWidgetProps {
  comparisonType?: 'today' | 'week' | 'month';
}

export function RevenueComparisonWidget({
  comparisonType = 'week',
}: RevenueComparisonWidgetProps) {
  const [data, setData] = useState<RevenueComparison | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authHeader = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1];

      let url = `/api/v1/admin/analytics/revenue/compare`;

      if (comparisonType === 'today') {
        url += '/today-vs-yesterday';
      } else if (comparisonType === 'week') {
        url += '/this-week-vs-last-week';
      } else if (comparisonType === 'month') {
        url += '/this-month-vs-last-month';
      }

      const response = await fetch(url, {
        headers: {
          ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Karşılaştırma verileri alınamadı');
      }

      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      logger.error('Revenue comparison fetch error:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparisonType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'UP':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'DOWN':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'EXCELLENT':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'GOOD':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'FAIR':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'POOR':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Karşılaştırma Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Karşılaştırma Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="mb-2 h-12 w-12 text-red-400" />
            <p className="text-red-600">{error || 'Veri yüklenemedi'}</p>
            <Button onClick={fetchComparison} className="mt-4">
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card
        className={`border-2 ${getPerformanceColor(data.performance.overallPerformance)}`}
      >
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Genel Performans
              </p>
              <p className="text-3xl font-bold">
                {data.performance.overallPerformance === 'EXCELLENT' &&
                  'Mükemmel'}
                {data.performance.overallPerformance === 'GOOD' && 'İyi'}
                {data.performance.overallPerformance === 'FAIR' && 'Orta'}
                {data.performance.overallPerformance === 'POOR' && 'Zayıf'}
              </p>
            </div>
            <div className="text-right">
              <p className="mb-1 text-sm text-gray-600">Puan</p>
              <div className="flex items-center justify-end space-x-2">
                <div className="text-3xl font-bold">
                  {data.performance.performanceScore}
                </div>
                <div className="text-lg text-gray-400">/100</div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant={
                data.performance.momentum === 'ACCELERATING'
                  ? 'success'
                  : data.performance.momentum === 'DECELERATING'
                    ? 'destructive'
                    : 'default'
              }
            >
              {data.performance.momentum === 'ACCELERATING' && 'Hızlanıyor'}
              {data.performance.momentum === 'DECELERATING' && 'Yavaşlıyor'}
              {data.performance.momentum === 'STABLE' && 'Stabil'}
            </Badge>
            <span className="text-sm text-gray-500">
              Momentum: {data.performance.momentumScore.toFixed(0)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Revenue Comparison */}
        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Gelir</p>
              {getDirectionIcon(data.comparison.revenueDirection)}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.currentPeriod.totalRevenue)}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Önceki: {formatCurrency(data.previousPeriod.totalRevenue)}
              </span>
              <Badge
                variant={
                  data.comparison.revenueGrowthRate >= 0
                    ? 'success'
                    : 'destructive'
                }
              >
                {formatPercentage(data.comparison.revenueGrowthRate)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Orders Comparison */}
        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Sipariş</p>
              {getDirectionIcon(data.comparison.orderDirection)}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {data.currentPeriod.orderCount.toLocaleString('tr-TR')}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Önceki: {data.previousPeriod.orderCount.toLocaleString('tr-TR')}
              </span>
              <Badge
                variant={
                  data.comparison.orderGrowthRate >= 0
                    ? 'success'
                    : 'destructive'
                }
              >
                {formatPercentage(data.comparison.orderGrowthRate)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Buyers Comparison */}
        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Alıcı</p>
              {getDirectionIcon(data.comparison.buyerDirection)}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {data.currentPeriod.buyerCount.toLocaleString('tr-TR')}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Önceki: {data.previousPeriod.buyerCount.toLocaleString('tr-TR')}
              </span>
              <Badge
                variant={
                  data.comparison.buyerGrowthRate >= 0
                    ? 'success'
                    : 'destructive'
                }
              >
                {formatPercentage(data.comparison.buyerGrowthRate)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* AOV Comparison */}
        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">
                Ortalama Sipariş Değeri
              </p>
              {getDirectionIcon(data.comparison.aovDirection)}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.currentPeriod.averageOrderValue)}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Önceki: {formatCurrency(data.previousPeriod.averageOrderValue)}
              </span>
              <Badge
                variant={
                  data.comparison.aovGrowthRate >= 0 ? 'success' : 'destructive'
                }
              >
                {formatPercentage(data.comparison.aovGrowthRate)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Improvements & Declines */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.performance.improvements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>İyileşmeler</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.performance.improvements.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-2 text-sm text-green-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {data.performance.declines.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <XCircle className="h-5 w-5 text-red-600" />
                <span>Düşüşler</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.performance.declines.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-2 text-sm text-red-700"
                  >
                    <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Insights */}
      {data.insights && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Önemli Bulgular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.insights.keyFindings &&
                data.insights.keyFindings.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">
                      Ana Bulgular
                    </h4>
                    <ul className="space-y-1">
                      {data.insights.keyFindings.map((finding, index) => (
                        <li key={index} className="text-sm text-gray-700">
                          • {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {data.insights.positiveIndicators &&
                data.insights.positiveIndicators.length > 0 && (
                  <div className="rounded-lg bg-green-50 p-3">
                    <h4 className="mb-2 font-medium text-green-900">
                      Pozitif Göstergeler
                    </h4>
                    <ul className="space-y-1">
                      {data.insights.positiveIndicators.map(
                        (indicator, index) => (
                          <li key={index} className="text-sm text-green-700">
                            ✓ {indicator}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {data.insights.concerningIndicators &&
                data.insights.concerningIndicators.length > 0 && (
                  <div className="rounded-lg bg-amber-50 p-3">
                    <h4 className="mb-2 font-medium text-amber-900">
                      Dikkat Edilmesi Gerekenler
                    </h4>
                    <ul className="space-y-1">
                      {data.insights.concerningIndicators.map(
                        (indicator, index) => (
                          <li key={index} className="text-sm text-amber-700">
                            ⚠ {indicator}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {data.insights.recommendations &&
                data.insights.recommendations.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">Öneriler</h4>
                    <ul className="space-y-1">
                      {data.insights.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-blue-700">
                          → {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
