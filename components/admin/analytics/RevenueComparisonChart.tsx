/**
 * ================================================
 * REVENUE COMPARISON CHART
 * ================================================
 * Visual comparison between revenue periods
 *
 * Features:
 * - Side-by-side comparison
 * - Percentage changes
 * - Performance indicators
 * - Trend visualization
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.3
 */

'use client';

import { Card } from '@/components/ui/Card';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  DollarSign,
  ShoppingCart,
} from 'lucide-react';
import { RevenueComparisonDto } from '@/lib/api/admin-analytics';
import { formatCurrency } from '@/lib/utils';

interface RevenueComparisonChartProps {
  data: RevenueComparisonDto;
  isLoading?: boolean;
}

/**
 * Revenue Comparison Chart Component
 */
export function RevenueComparisonChart({
  data,
  isLoading,
}: RevenueComparisonChartProps) {
  if (isLoading) {
    return <RevenueComparisonSkeleton />;
  }

  const { currentPeriod, previousPeriod, comparison, performance } = data;

  // Get performance color and icon
  const getPerformanceIndicator = () => {
    if (performance.trend === 'IMPROVING') {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: TrendingUp,
        label: 'Gelişiyor',
      };
    } else if (performance.trend === 'DECLINING') {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: TrendingDown,
        label: 'Düşüyor',
      };
    }
    return {
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: Minus,
      label: 'Sabit',
    };
  };

  const performanceInfo = getPerformanceIndicator();
  const PerformanceIcon = performanceInfo.icon;

  // Get significance badge
  const getSignificanceBadge = () => {
    const colors = {
      HIGH: 'bg-red-100 text-red-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-blue-100 text-blue-800',
      NONE: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      HIGH: 'Yüksek',
      MEDIUM: 'Orta',
      LOW: 'Düşük',
      NONE: 'Önemsiz',
    };
    return (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${
          colors[performance.significance]
        }`}
      >
        {labels[performance.significance]} Etki
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <Card
        className={`p-6 ${performanceInfo.bgColor} ${performanceInfo.borderColor}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-full bg-white p-3 ${performanceInfo.borderColor} border`}
            >
              <PerformanceIcon className={`h-6 w-6 ${performanceInfo.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Performans: {performanceInfo.label}
              </h3>
              <p className="text-muted-foreground text-sm">
                {data.comparisonType.replace(/_/g, ' ')} Karşılaştırması
              </p>
            </div>
          </div>
          {getSignificanceBadge()}
        </div>
      </Card>

      {/* Period Comparison */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Previous Period */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="text-muted-foreground h-5 w-5" />
            <h4 className="font-semibold">Önceki Dönem</h4>
          </div>
          <p className="text-muted-foreground mb-4 text-sm">
            {new Date(previousPeriod.startDate).toLocaleDateString('tr-TR')} -{' '}
            {new Date(previousPeriod.endDate).toLocaleDateString('tr-TR')}
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-1 text-sm">Gelir</p>
              <p className="text-3xl font-bold">
                {formatCurrency(previousPeriod.revenue)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground mb-1 text-sm">Sipariş</p>
                <p className="text-xl font-semibold">
                  {previousPeriod.orders.toLocaleString('tr-TR')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-sm">Ort. Değer</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(previousPeriod.averageOrderValue)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Current Period */}
        <Card className="border-primary border-2 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="text-primary h-5 w-5" />
            <h4 className="text-primary font-semibold">Güncel Dönem</h4>
          </div>
          <p className="text-muted-foreground mb-4 text-sm">
            {new Date(currentPeriod.startDate).toLocaleDateString('tr-TR')} -{' '}
            {new Date(currentPeriod.endDate).toLocaleDateString('tr-TR')}
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-1 text-sm">Gelir</p>
              <p className="text-primary text-3xl font-bold">
                {formatCurrency(currentPeriod.revenue)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground mb-1 text-sm">Sipariş</p>
                <p className="text-xl font-semibold">
                  {currentPeriod.orders.toLocaleString('tr-TR')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-sm">Ort. Değer</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(currentPeriod.averageOrderValue)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Change Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Revenue Change */}
        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <DollarSign className="text-muted-foreground h-5 w-5" />
            <h4 className="font-semibold">Gelir Değişimi</h4>
          </div>
          <div className="flex items-center gap-2">
            {comparison.revenueChangePercentage >= 0 ? (
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-red-600" />
            )}
            <p
              className={`text-2xl font-bold ${
                comparison.revenueChangePercentage >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {Math.abs(comparison.revenueChangePercentage).toFixed(1)}%
            </p>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            {comparison.revenueChange >= 0 ? '+' : ''}
            {formatCurrency(Math.abs(comparison.revenueChange))}
          </p>
        </Card>

        {/* Orders Change */}
        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <ShoppingCart className="text-muted-foreground h-5 w-5" />
            <h4 className="font-semibold">Sipariş Değişimi</h4>
          </div>
          <div className="flex items-center gap-2">
            {comparison.ordersChangePercentage >= 0 ? (
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-red-600" />
            )}
            <p
              className={`text-2xl font-bold ${
                comparison.ordersChangePercentage >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {Math.abs(comparison.ordersChangePercentage).toFixed(1)}%
            </p>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            {comparison.ordersChange >= 0 ? '+' : ''}
            {Math.abs(comparison.ordersChange).toLocaleString('tr-TR')} sipariş
          </p>
        </Card>

        {/* AOV Change */}
        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <DollarSign className="text-muted-foreground h-5 w-5" />
            <h4 className="font-semibold">Ortalama Değer Değişimi</h4>
          </div>
          <div className="flex items-center gap-2">
            {comparison.aovChangePercentage >= 0 ? (
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-red-600" />
            )}
            <p
              className={`text-2xl font-bold ${
                comparison.aovChangePercentage >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {Math.abs(comparison.aovChangePercentage).toFixed(1)}%
            </p>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            {comparison.aovChange >= 0 ? '+' : ''}
            {formatCurrency(Math.abs(comparison.aovChange))}
          </p>
        </Card>
      </div>
    </div>
  );
}

/**
 * Loading skeleton
 */
function RevenueComparisonSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <Card className="p-6">
        <div className="h-16 rounded bg-gray-200" />
      </Card>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="p-6">
            <div className="h-48 rounded bg-gray-200" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="h-24 rounded bg-gray-200" />
          </Card>
        ))}
      </div>
    </div>
  );
}
