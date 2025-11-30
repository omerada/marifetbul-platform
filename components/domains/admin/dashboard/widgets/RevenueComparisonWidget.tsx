/**
 * ================================================
 * REVENUE COMPARISON WIDGET - PRODUCTION READY
 * ================================================
 * Consolidated revenue comparison widget (Presentation Component)
 *
 * This consolidates:
 * - components/admin/analytics/RevenueComparisonChart.tsx (props-based, 305 lines)
 * - components/domains/admin/dashboard/RevenueComparisonWidget.tsx (hook-based, 443 lines)
 *
 * Architecture:
 * - Pure presentation component (receives data via props)
 * - Companion container: RevenueComparisonContainer (handles data fetching)
 * - Type-safe with RevenueComparisonDto
 * - Production-ready error handling
 *
 * Features:
 * - Side-by-side period comparison
 * - Percentage changes with trend indicators
 * - Performance metrics
 * - Visual trend visualization
 * - Dark mode support
 * - Responsive design
 *
 * @module components/domains/admin/dashboard/widgets
 * @since Sprint 2.2 - Code Consolidation
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercentage } from '@/lib/shared/formatters';

// ================================================
// TYPES
// ================================================

// Local DTO for widget (presentation layer)
export interface RevenueComparisonDto {
  currentPeriod: {
    label: string;
    revenue: number;
    transactions: number;
    averageOrderValue: number;
  };
  previousPeriod: {
    label: string;
    revenue: number;
    transactions: number;
    averageOrderValue: number;
  };
  comparison: {
    revenueChange: number;
    revenueChangePercentage: number;
    transactionsChange: number;
    transactionsChangePercentage: number;
    aovChange: number;
    aovChangePercentage: number;
  };
  performance: {
    status: 'EXCELLENT' | 'GOOD' | 'DECLINING' | 'CRITICAL';
    message: string;
  };
}

export interface RevenueComparisonWidgetProps {
  /** Revenue comparison data */
  data: RevenueComparisonDto;

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
// REMOVED: Local utility functions (Sprint 1 - Cleanup)
// ================================================
// Now using canonical formatters from @/lib/shared/formatters
// ================================================

/**
 * Get performance color classes
 */
function getPerformanceColor(status: string): string {
  switch (status) {
    case 'EXCELLENT':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'GOOD':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'DECLINING':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

/**
 * Get trend icon and color
 */
function getTrendIndicator(changePercentage: number) {
  if (changePercentage > 0) {
    return {
      icon: <ArrowUpRight className="h-4 w-4" />,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    };
  } else if (changePercentage < 0) {
    return {
      icon: <ArrowDownRight className="h-4 w-4" />,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    };
  }
  return {
    icon: <Minus className="h-4 w-4" />,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
  };
}

// ================================================
// SKELETON COMPONENT
// ================================================

function RevenueComparisonSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Badge Skeleton */}
        <div className="h-8 w-32 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />

        {/* Comparison Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-8 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </Card>
          ))}
        </div>

        {/* Metrics Skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
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
 * Revenue Comparison Widget - Presentation Component
 *
 * @example
 * ```tsx
 * // Direct usage with data
 * <RevenueComparisonWidget
 *   data={comparisonData}
 *   isLoading={false}
 *   onRefresh={handleRefresh}
 * />
 *
 * // Or use container for automatic data fetching
 * <RevenueComparisonContainer comparisonType="week" />
 * ```
 */
export function RevenueComparisonWidget({
  data,
  isLoading = false,
  error = null,
  onRefresh,
  className,
}: RevenueComparisonWidgetProps) {
  // ================================================
  // LOADING STATE
  // ================================================

  if (isLoading) {
    return <RevenueComparisonSkeleton />;
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
              Karşılaştırma yüklenirken hata
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

  const { currentPeriod, previousPeriod, comparison, performance } = data;

  const revenueIndicator = getTrendIndicator(
    comparison.revenueChangePercentage
  );
  const transactionsIndicator = getTrendIndicator(
    comparison.transactionsChangePercentage
  );
  const aovIndicator = getTrendIndicator(comparison.aovChangePercentage);

  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Dönem Karşılaştırması
          </CardTitle>
          <Badge
            className={cn(
              'font-medium',
              getPerformanceColor(performance.status)
            )}
          >
            {performance.message}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Period Comparison Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Current Period */}
          <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  {currentPeriod.label}
                </span>
                <CheckCircle2 className="ml-auto h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Gelir
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatCurrency(currentPeriod.revenue)}
                  </p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700 dark:text-blue-300">
                    {currentPeriod.transactions.toLocaleString('tr-TR')} işlem
                  </span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    {formatCurrency(currentPeriod.averageOrderValue)} AOV
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Previous Period */}
          <Card className="bg-gray-50 dark:bg-gray-900/20">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {previousPeriod.label}
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gelir
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(previousPeriod.revenue)}
                  </p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {previousPeriod.transactions.toLocaleString('tr-TR')} işlem
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(previousPeriod.averageOrderValue)} AOV
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Metrics */}
        <div className="space-y-3">
          {/* Revenue Change */}
          <div
            className={cn(
              'flex items-center justify-between rounded-lg p-4',
              revenueIndicator.bgColor
            )}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white p-2 dark:bg-gray-800">
                <DollarSign className={cn('h-5 w-5', revenueIndicator.color)} />
              </div>
              <div>
                <p className="text-sm font-medium">Gelir Değişimi</p>
                <p className={cn('text-2xl font-bold', revenueIndicator.color)}>
                  {formatCurrency(Math.abs(comparison.revenueChange))}
                </p>
              </div>
            </div>
            <div
              className={cn(
                'flex items-center gap-1 font-bold',
                revenueIndicator.color
              )}
            >
              {revenueIndicator.icon}
              <span>
                {formatPercentage(comparison.revenueChangePercentage / 100)}
              </span>
            </div>
          </div>

          {/* Transactions Change */}
          <div
            className={cn(
              'flex items-center justify-between rounded-lg p-4',
              transactionsIndicator.bgColor
            )}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white p-2 dark:bg-gray-800">
                <ShoppingCart
                  className={cn('h-5 w-5', transactionsIndicator.color)}
                />
              </div>
              <div>
                <p className="text-sm font-medium">İşlem Değişimi</p>
                <p
                  className={cn(
                    'text-2xl font-bold',
                    transactionsIndicator.color
                  )}
                >
                  {Math.abs(comparison.transactionsChange).toLocaleString(
                    'tr-TR'
                  )}
                </p>
              </div>
            </div>
            <div
              className={cn(
                'flex items-center gap-1 font-bold',
                transactionsIndicator.color
              )}
            >
              {transactionsIndicator.icon}
              <span>
                {formatPercentage(
                  comparison.transactionsChangePercentage / 100
                )}
              </span>
            </div>
          </div>

          {/* AOV Change */}
          <div
            className={cn(
              'flex items-center justify-between rounded-lg p-4',
              aovIndicator.bgColor
            )}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white p-2 dark:bg-gray-800">
                <TrendingUp className={cn('h-5 w-5', aovIndicator.color)} />
              </div>
              <div>
                <p className="text-sm font-medium">Ortalama Sipariş Değeri</p>
                <p className={cn('text-2xl font-bold', aovIndicator.color)}>
                  {formatCurrency(Math.abs(comparison.aovChange))}
                </p>
              </div>
            </div>
            <div
              className={cn(
                'flex items-center gap-1 font-bold',
                aovIndicator.color
              )}
            >
              {aovIndicator.icon}
              <span>
                {formatPercentage(comparison.aovChangePercentage / 100)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RevenueComparisonWidget;
