/**
 * ================================================
 * METRIC CARD - Shared Component
 * ================================================
 * Reusable card for displaying key metrics with trends
 * Used across all dashboard widgets for consistent stat display
 *
 * @module components/shared/dashboard
 * @since Sprint 1 - Story 4
 */

'use client';

import React, { type ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MetricCardProps {
  /** Metric label */
  label: string;

  /** Metric value (number or formatted string) */
  value: string | number;

  /** Optional previous value for comparison */
  previousValue?: string | number;

  /** Change percentage (if not calculated from previousValue) */
  change?: number;

  /** Trend direction */
  trend?: 'up' | 'down' | 'stable';

  /** Icon component */
  icon?: LucideIcon;

  /** Icon color */
  iconColor?: string;

  /** Is positive trend good? (default: true) */
  isPositiveTrendGood?: boolean;

  /** Additional description */
  description?: string;

  /** Format function for value */
  formatValue?: (value: number | string) => string;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS classes */
  className?: string;

  /** Custom footer content */
  footer?: ReactNode;
}

/**
 * Format number with locale
 */
function formatNumber(value: number): string {
  return new Intl.NumberFormat('tr-TR').format(value);
}

/**
 * Format currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate trend from values
 */
function calculateTrend(
  current: number | string,
  previous: number | string
): { change: number; trend: 'up' | 'down' | 'stable' } {
  const currentNum =
    typeof current === 'number' ? current : parseFloat(String(current));
  const previousNum =
    typeof previous === 'number' ? previous : parseFloat(String(previous));

  if (isNaN(currentNum) || isNaN(previousNum) || previousNum === 0) {
    return { change: 0, trend: 'stable' };
  }

  const change = ((currentNum - previousNum) / previousNum) * 100;

  return {
    change: Math.abs(change),
    trend: change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable',
  };
}

/**
 * Loading skeleton for metric card
 */
function MetricCardSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-gray-200"></div>
        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
      </div>
      <div className="h-8 w-32 rounded bg-gray-200"></div>
      <div className="h-4 w-20 rounded bg-gray-200"></div>
    </div>
  );
}

/**
 * Metric Card Component
 *
 * @example
 * ```tsx
 * <MetricCard
 *   label="Total Revenue"
 *   value={125000}
 *   previousValue={100000}
 *   icon={TrendingUp}
 *   formatValue={formatCurrency}
 *   description="Last 30 days"
 * />
 * ```
 */
export function MetricCard({
  label,
  value,
  previousValue,
  change: providedChange,
  trend: providedTrend,
  icon: Icon,
  iconColor = 'text-blue-600',
  isPositiveTrendGood = true,
  description,
  formatValue,
  loading = false,
  className,
  footer,
}: MetricCardProps) {
  // ================================================
  // CALCULATE TREND
  // ================================================

  let change = providedChange;
  let trend = providedTrend;

  if (previousValue !== undefined && change === undefined) {
    const calculated = calculateTrend(value, previousValue);
    change = calculated.change;
    trend = calculated.trend;
  }

  // ================================================
  // DETERMINE COLORS
  // ================================================

  const getTrendColor = () => {
    if (trend === 'stable') return 'text-gray-600';

    const isGoodTrend =
      (trend === 'up' && isPositiveTrendGood) ||
      (trend === 'down' && !isPositiveTrendGood);

    return isGoodTrend ? 'text-green-600' : 'text-red-600';
  };

  const getTrendBgColor = () => {
    if (trend === 'stable') return 'bg-gray-100';

    const isGoodTrend =
      (trend === 'up' && isPositiveTrendGood) ||
      (trend === 'down' && !isPositiveTrendGood);

    return isGoodTrend ? 'bg-green-100' : 'bg-red-100';
  };

  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  // ================================================
  // FORMAT VALUE
  // ================================================

  const formattedValue = formatValue
    ? formatValue(value)
    : typeof value === 'number'
      ? formatNumber(value)
      : value;

  // ================================================
  // RENDER
  // ================================================

  if (loading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-6">
          <MetricCardSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'overflow-hidden transition-shadow hover:shadow-md',
        className
      )}
    >
      <CardContent className="p-6">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm font-medium">{label}</p>

            {Icon && (
              <div className={cn('rounded-full bg-gray-100 p-2', iconColor)}>
                <Icon className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* Value */}
          <p className="text-2xl font-bold tracking-tight">{formattedValue}</p>

          {/* Trend & Description */}
          <div className="flex items-center justify-between">
            {change !== undefined && trend && (
              <Badge
                variant="secondary"
                className={cn(
                  'gap-1 font-medium',
                  getTrendBgColor(),
                  getTrendColor()
                )}
              >
                <TrendIcon className="h-3 w-3" />
                {formatPercentage(change)}
              </Badge>
            )}

            {description && (
              <p className="text-muted-foreground text-xs">{description}</p>
            )}
          </div>

          {/* Footer */}
          {footer && <div className="mt-4 border-t pt-3">{footer}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

export default MetricCard;
