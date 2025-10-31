/**
 * ================================================
 * REVENUE FORECAST WIDGET
 * ================================================
 * Revenue forecasting and prediction visualization
 *
 * Features:
 * - Predicted revenue
 * - Confidence intervals
 * - Trend indicators
 * - Historical comparison
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.3
 */

'use client';

import { Card } from '@/components/ui/Card';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  BarChart3,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { RevenueForecastDto } from '@/lib/api/admin-analytics';
import { formatCurrency } from '@/lib/utils';

interface RevenueForecastWidgetProps {
  data: RevenueForecastDto;
  isLoading?: boolean;
}

/**
 * Revenue Forecast Widget Component
 */
export function RevenueForecastWidget({
  data,
  isLoading,
}: RevenueForecastWidgetProps) {
  if (isLoading) {
    return <RevenueForecastSkeleton />;
  }

  const { predicted, confidence, trend, historicalAverage, basedOnDays } = data;

  // Get trend icon and color
  const getTrendIndicator = () => {
    if (trend.direction === 'UP') {
      return {
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        label: 'Yukarı',
      };
    } else if (trend.direction === 'DOWN') {
      return {
        icon: TrendingDown,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        label: 'Aşağı',
      };
    }
    return {
      icon: Minus,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      label: 'Sabit',
    };
  };

  const trendInfo = getTrendIndicator();
  const TrendIcon = trendInfo.icon;

  // Calculate confidence range
  const confidenceRange = confidence.upper - confidence.lower;
  const confidencePercentage = confidence.level * 100;

  // Get reliability badge color
  const getReliabilityColor = () => {
    if (trend.reliability >= 0.8) return 'text-green-600 bg-green-50';
    if (trend.reliability >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Forecast Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white p-3">
              <Target className="text-primary h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Gelir Tahmini</h3>
              <p className="text-muted-foreground text-sm">
                {new Date(data.startDate).toLocaleDateString('tr-TR')} -{' '}
                {new Date(data.endDate).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${trendInfo.bgColor}`}
          >
            <TrendIcon className={`h-4 w-4 ${trendInfo.color}`} />
            <span className={`text-sm font-medium ${trendInfo.color}`}>
              {trendInfo.label} Trend
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Predicted Revenue */}
          <div>
            <p className="text-muted-foreground mb-2 text-sm">Tahmini Gelir</p>
            <p className="text-primary text-3xl font-bold">
              {formatCurrency(predicted.revenue)}
            </p>
          </div>

          {/* Predicted Orders */}
          <div>
            <p className="text-muted-foreground mb-2 text-sm">
              Tahmini Sipariş
            </p>
            <p className="text-3xl font-bold">
              {predicted.orderCount.toLocaleString('tr-TR')}
            </p>
          </div>

          {/* Predicted AOV */}
          <div>
            <p className="text-muted-foreground mb-2 text-sm">
              Tahmini Ort. Değer
            </p>
            <p className="text-3xl font-bold">
              {formatCurrency(predicted.averageOrderValue)}
            </p>
          </div>
        </div>
      </Card>

      {/* Confidence & Reliability */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Confidence Interval */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="text-muted-foreground h-5 w-5" />
            <h4 className="font-semibold">Güven Aralığı</h4>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-1 text-sm">Alt Limit</p>
              <p className="text-xl font-semibold">
                {formatCurrency(confidence.lower)}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground mb-1 text-sm">Üst Limit</p>
              <p className="text-xl font-semibold">
                {formatCurrency(confidence.upper)}
              </p>
            </div>

            <div className="border-t pt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-muted-foreground text-sm">Güven Seviyesi</p>
                <p className="text-sm font-medium">
                  {confidencePercentage.toFixed(0)}%
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${confidencePercentage}%` }}
                />
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                Aralık: {formatCurrency(confidenceRange)}
              </p>
            </div>
          </div>
        </Card>

        {/* Trend Analysis */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="text-muted-foreground h-5 w-5" />
            <h4 className="font-semibold">Trend Analizi</h4>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Yön</p>
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-1 ${trendInfo.bgColor}`}
              >
                <TrendIcon className={`h-4 w-4 ${trendInfo.color}`} />
                <span className={`text-sm font-medium ${trendInfo.color}`}>
                  {trendInfo.label}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Güç</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="bg-primary h-full"
                    style={{ width: `${trend.strength * 100}%` }}
                  />
                </div>
                <p className="text-sm font-medium">
                  {(trend.strength * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Güvenilirlik</p>
              <div
                className={`rounded-full px-3 py-1 ${getReliabilityColor()}`}
              >
                <p className="text-sm font-medium">
                  {(trend.reliability * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            {trend.reliability < 0.6 && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Düşük güvenilirlik: Tahminler dikkatle değerlendirilmelidir
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Historical Comparison */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="text-muted-foreground h-5 w-5" />
          <h4 className="font-semibold">Geçmiş Veri Karşılaştırması</h4>
        </div>

        <p className="text-muted-foreground mb-4 text-sm">
          Son {basedOnDays} günlük veriye dayalı tahmin
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              Geçmiş Günlük Ortalama Gelir
            </p>
            <p className="text-2xl font-bold">
              {formatCurrency(historicalAverage.dailyRevenue)}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              Geçmiş Günlük Ortalama Sipariş
            </p>
            <p className="text-2xl font-bold">
              {historicalAverage.dailyOrders.toLocaleString('tr-TR')}
            </p>
          </div>
        </div>

        <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Tahmini vs Geçmiş Ort.
            </p>
            <p
              className={`text-lg font-semibold ${
                predicted.revenue > historicalAverage.dailyRevenue * basedOnDays
                  ? 'text-green-600'
                  : predicted.revenue <
                      historicalAverage.dailyRevenue * basedOnDays
                    ? 'text-red-600'
                    : 'text-gray-600'
              }`}
            >
              {(
                ((predicted.revenue -
                  historicalAverage.dailyRevenue * basedOnDays) /
                  (historicalAverage.dailyRevenue * basedOnDays)) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Loading skeleton
 */
function RevenueForecastSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <Card className="p-6">
        <div className="h-32 rounded bg-gray-200" />
      </Card>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="p-6">
            <div className="h-48 rounded bg-gray-200" />
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <div className="h-32 rounded bg-gray-200" />
      </Card>
    </div>
  );
}
