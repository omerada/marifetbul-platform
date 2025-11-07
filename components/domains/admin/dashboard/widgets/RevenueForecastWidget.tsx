/**
 * ================================================
 * REVENUE FORECAST WIDGET - PRODUCTION READY
 * ================================================
 * Consolidated revenue forecast widget (Presentation Component)
 *
 * This consolidates:
 * - components/admin/analytics/RevenueForecastWidget.tsx (props-based, 333 lines)
 * - components/domains/admin/dashboard/RevenueForecastChart.tsx (hook-based, 426 lines)
 *
 * Architecture:
 * - Pure presentation component (receives data via props)
 * - Companion container: RevenueForecastContainer (handles data fetching)
 * - Type-safe with RevenueForecastDto
 * - Production-ready error handling
 *
 * Features:
 * - Predicted revenue with confidence intervals
 * - Trend indicators
 * - Historical comparison
 * - Visual forecast visualization
 * - Dark mode support
 * - Responsive design
 *
 * @module components/domains/admin/dashboard/widgets
 * @since Sprint 2.2 - Code Consolidation
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  BarChart3,
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export interface RevenueForecastDto {
  predicted: {
    amount: number;
    date: string;
    period: string;
  };
  confidence: {
    lower: number;
    upper: number;
    level: number;
  };
  trend: {
    direction: 'UP' | 'DOWN' | 'STABLE';
    strength: 'STRONG' | 'MODERATE' | 'WEAK';
    confidence: number;
  };
  historicalAverage: number;
  basedOnDays: number;
}

export interface RevenueForecastWidgetProps {
  /** Revenue forecast data */
  data: RevenueForecastDto;

  /** Loading state */
  isLoading?: boolean;

  /** Error state */
  error?: string | null;

  /** Refresh callback */
  onRefresh?: () => void;

  /** Additional CSS classes */
  className?: string;
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Format currency for Turkish locale
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get trend color and icon
 */
function getTrendIndicator(direction: 'UP' | 'DOWN' | 'STABLE') {
  switch (direction) {
    case 'UP':
      return {
        icon: <TrendingUp className="h-5 w-5" />,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        label: 'Yükseliş',
      };
    case 'DOWN':
      return {
        icon: <TrendingDown className="h-5 w-5" />,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        label: 'Düşüş',
      };
    default:
      return {
        icon: <Minus className="h-5 w-5" />,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-900/30',
        label: 'Stabil',
      };
  }
}

/**
 * Get strength badge color
 */
function getStrengthColor(strength: string): string {
  switch (strength) {
    case 'STRONG':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'MODERATE':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'WEAK':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

/**
 * Get strength label
 */
function getStrengthLabel(strength: string): string {
  switch (strength) {
    case 'STRONG':
      return 'Güçlü';
    case 'MODERATE':
      return 'Orta';
    case 'WEAK':
      return 'Zayıf';
    default:
      return 'Bilinmiyor';
  }
}

// ================================================
// SKELETON COMPONENT
// ================================================

function RevenueForecastSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ================================================
// MAIN COMPONENT
// ================================================

/**
 * Revenue Forecast Widget - Presentation Component
 *
 * @example
 * ```tsx
 * // Direct usage with data
 * <RevenueForecastWidget
 *   data={forecastData}
 *   isLoading={false}
 *   onRefresh={handleRefresh}
 * />
 *
 * // Or use container for automatic data fetching
 * <RevenueForecastContainer forecastDays={7} />
 * ```
 */
export function RevenueForecastWidget({
  data,
  isLoading = false,
  error = null,
  onRefresh,
  className,
}: RevenueForecastWidgetProps) {
  // ================================================
  // LOADING STATE
  // ================================================

  if (isLoading) {
    return <RevenueForecastSkeleton />;
  }

  // ================================================
  // ERROR STATE
  // ================================================

  if (error) {
    return (
      <Card
        className={cn(
          'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
          className
        )}
      >
        <CardContent className="flex items-center gap-3 p-6">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <div className="flex-1">
            <p className="font-medium text-red-900 dark:text-red-100">
              Tahmin yüklenirken hata
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </CardContent>
      </Card>
    );
  }

  // ================================================
  // MAIN RENDER
  // ================================================

  const { predicted, confidence, trend, historicalAverage, basedOnDays } = data;

  const trendIndicator = getTrendIndicator(trend.direction);
  const confidencePercentage = confidence.level * 100;
  const variance =
    ((predicted.amount - historicalAverage) / historicalAverage) * 100;

  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Gelir Tahmini
          </CardTitle>
          <Badge
            className={cn('font-medium', getStrengthColor(trend.strength))}
          >
            {getStrengthLabel(trend.strength)} Trend
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Prediction */}
        <div className="flex items-center gap-6">
          <div
            className={cn(
              'flex h-20 w-20 items-center justify-center rounded-full',
              trendIndicator.bgColor
            )}
          >
            {trendIndicator.icon}
          </div>
          <div className="flex-1">
            <p className="text-muted-foreground text-sm font-medium">
              Tahmin Edilen Gelir
            </p>
            <p className="text-3xl font-bold">
              {formatCurrency(predicted.amount)}
            </p>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <span className={trendIndicator.color}>
                {trendIndicator.label}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{predicted.period}</span>
            </div>
          </div>
        </div>

        {/* Confidence Interval */}
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Güven Aralığı
              </span>
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
              >
                %{confidencePercentage.toFixed(0)}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700 dark:text-blue-300">
                  Alt Limit
                </span>
                <span className="font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(confidence.lower)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900/50">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-400"
                  style={{ width: `${confidencePercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700 dark:text-blue-300">
                  Üst Limit
                </span>
                <span className="font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(confidence.upper)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Historical Average */}
          <Card className="bg-gray-50 dark:bg-gray-900/20">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-muted-foreground text-sm font-medium">
                  Geçmiş Ortalama
                </span>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrency(historicalAverage)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Son {basedOnDays} gün
              </p>
            </CardContent>
          </Card>

          {/* Variance */}
          <Card
            className={cn(
              'transition-colors',
              variance > 0
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-red-50 dark:bg-red-900/20'
            )}
          >
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-muted-foreground text-sm font-medium">
                  Varyans
                </span>
              </div>
              <p
                className={cn(
                  'text-2xl font-bold',
                  variance > 0
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                )}
              >
                {variance >= 0 ? '+' : ''}
                {variance.toFixed(1)}%
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Ortalamadan sapma
              </p>
            </CardContent>
          </Card>

          {/* Trend Confidence */}
          <Card className="bg-purple-50 dark:bg-purple-900/20">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-muted-foreground text-sm font-medium">
                  Trend Güveni
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                %{(trend.confidence * 100).toFixed(0)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Model güvenilirliği
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Warning if low confidence */}
        {trend.confidence < 0.7 && (
          <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div className="flex-1">
              <p className="font-medium text-yellow-900 dark:text-yellow-100">
                Düşük Güven Seviyesi
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Tahmin, sınırlı veri nedeniyle daha az güvenilir olabilir.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RevenueForecastWidget;
