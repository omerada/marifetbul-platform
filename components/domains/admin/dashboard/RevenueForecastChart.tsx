'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  TrendingUp,
  AlertTriangle,
  Target,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import type { RevenueForecast } from '@/types/analytics';
import { logger } from '@/lib/shared/utils/logger';

interface RevenueForecastChartProps {
  forecastDays?: number;
  historicalDays?: number;
}

export function RevenueForecastChart({
  forecastDays = 7,
  historicalDays = 30,
}: RevenueForecastChartProps) {
  const [data, setData] = useState<RevenueForecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authHeader = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1];

      const response = await fetch(
        `/api/v1/admin/analytics/revenue/forecast?forecastDays=${forecastDays}&historicalDays=${historicalDays}`,
        {
          headers: {
            ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Tahmin verileri alınamadı');
      }

      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      logger.error('Revenue forecast fetch error:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forecastDays, historicalDays]);

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

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'text-green-600 bg-green-50';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50';
      case 'HIGH':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'UPWARD':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'DOWNWARD':
        return <TrendingUp className="h-5 w-5 rotate-180 text-red-600" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gelir Tahmini</CardTitle>
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
          <CardTitle>Gelir Tahmini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="mb-2 h-12 w-12 text-red-400" />
            <p className="text-red-600">{error || 'Veri yüklenemedi'}</p>
            <Button onClick={fetchForecast} className="mt-4">
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Forecast Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">
                Tahmin Edilen Gelir
              </p>
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.summary.predictedRevenue)}
            </p>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-500">Alt Sınır</span>
              <span className="font-medium text-gray-700">
                {formatCurrency(data.summary.lowerBound)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Üst Sınır</span>
              <span className="font-medium text-gray-700">
                {formatCurrency(data.summary.upperBound)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">
                Beklenen Büyüme
              </p>
              {getTrendIcon(data.trend.direction)}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.summary.expectedGrowth)}
            </p>
            <div className="mt-2">
              <Badge
                variant={
                  data.summary.expectedGrowthRate >= 0
                    ? 'success'
                    : 'destructive'
                }
              >
                {formatPercentage(data.summary.expectedGrowthRate)}
              </Badge>
              <p className="mt-1 text-xs text-gray-500">
                Güven: %{data.summary.confidenceLevel.toFixed(0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Risk Seviyesi</p>
              <AlertTriangle
                className={`h-5 w-5 ${
                  data.risk.riskLevel === 'HIGH'
                    ? 'text-red-600'
                    : data.risk.riskLevel === 'MEDIUM'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                }`}
              />
            </div>
            <Badge className={getRiskColor(data.risk.riskLevel)}>
              {data.risk.riskLevel === 'HIGH' && 'Yüksek'}
              {data.risk.riskLevel === 'MEDIUM' && 'Orta'}
              {data.risk.riskLevel === 'LOW' && 'Düşük'}
            </Badge>
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Volatilite</span>
                <span className="font-medium text-gray-700">
                  {data.risk.volatilityScore.toFixed(0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Belirsizlik</span>
                <span className="font-medium text-gray-700">
                  {data.risk.uncertaintyScore.toFixed(0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Senaryo Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Optimistic */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-900">
                    İyimser Senaryo
                  </span>
                </div>
                <Badge variant="success">
                  %{data.scenarios.optimistic.probability.toFixed(0)} İhtimal
                </Badge>
              </div>
              <p className="mb-1 text-2xl font-bold text-green-900">
                {formatCurrency(data.scenarios.optimistic.predictedRevenue)}
              </p>
              <p className="text-sm text-green-700">
                {data.scenarios.optimistic.assumptions}
              </p>
            </div>

            {/* Realistic */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">
                    Gerçekçi Senaryo
                  </span>
                </div>
                <Badge variant="default">
                  %{data.scenarios.realistic.probability.toFixed(0)} İhtimal
                </Badge>
              </div>
              <p className="mb-1 text-2xl font-bold text-blue-900">
                {formatCurrency(data.scenarios.realistic.predictedRevenue)}
              </p>
              <p className="text-sm text-blue-700">
                {data.scenarios.realistic.assumptions}
              </p>
            </div>

            {/* Pessimistic */}
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 rotate-180 text-red-600" />
                  <span className="font-semibold text-red-900">
                    Kötümser Senaryo
                  </span>
                </div>
                <Badge variant="destructive">
                  %{data.scenarios.pessimistic.probability.toFixed(0)} İhtimal
                </Badge>
              </div>
              <p className="mb-1 text-2xl font-bold text-red-900">
                {formatCurrency(data.scenarios.pessimistic.predictedRevenue)}
              </p>
              <p className="text-sm text-red-700">
                {data.scenarios.pessimistic.assumptions}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {data.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Öneriler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recommendations.actionItems &&
                data.recommendations.actionItems.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">
                      Aksiyon Öğeleri
                    </h4>
                    <ul className="space-y-2">
                      {data.recommendations.actionItems.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 text-sm text-gray-700"
                        >
                          <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {data.recommendations.opportunities &&
                data.recommendations.opportunities.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">
                      Fırsatlar
                    </h4>
                    <ul className="space-y-2">
                      {data.recommendations.opportunities.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 text-sm text-green-700"
                        >
                          <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {data.recommendations.warnings &&
                data.recommendations.warnings.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">Uyarılar</h4>
                    <ul className="space-y-2">
                      {data.recommendations.warnings.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 text-sm text-amber-700"
                        >
                          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Accuracy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Model Doğruluğu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="mb-1 text-sm text-gray-600">R² Skoru</p>
              <p className="text-lg font-bold text-gray-900">
                {data.accuracy.rSquared.toFixed(3)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600">MAPE</p>
              <p className="text-lg font-bold text-gray-900">
                {data.accuracy.mape.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600">MAE</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(data.accuracy.mae)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600">Güvenilirlik</p>
              <Badge
                variant={
                  data.accuracy.reliability === 'HIGH'
                    ? 'success'
                    : data.accuracy.reliability === 'MEDIUM'
                      ? 'warning'
                      : 'destructive'
                }
              >
                {data.accuracy.reliability === 'HIGH' && 'Yüksek'}
                {data.accuracy.reliability === 'MEDIUM' && 'Orta'}
                {data.accuracy.reliability === 'LOW' && 'Düşük'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
