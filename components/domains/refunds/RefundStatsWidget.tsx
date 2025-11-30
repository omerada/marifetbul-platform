'use client';

/**
 * ================================================
 * REFUND STATS WIDGET
 * ================================================
 * Dashboard widget to display refund statistics
 *
 * Features:
 * - Total refunds count
 * - Pending refunds count
 * - Approved refunds count
 * - Total refund amount
 * - Visual indicators (icons, colors)
 * - Real-time updates via SWR
 * - Click to expand details
 * - Loading skeleton
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Dashboard Enhancement (Story 3.2)
 */

import React, { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui';
import { useMyRefunds } from '@/hooks/business/useRefunds';
import { RefundStatus } from '@/types/business/features/refund';
import {
  RotateCcw,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
} from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export interface RefundStatsWidgetProps {
  /** Custom className */
  className?: string;

  /** Show trend indicators */
  showTrend?: boolean;

  /** Click handler for stats cards */
  onStatClick?: (stat: RefundStatType) => void;

  /** Enable compact mode */
  compact?: boolean;
}

export type RefundStatType = 'total' | 'pending' | 'approved' | 'amount';

interface RefundStatCard {
  id: RefundStatType;
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  trend?: number;
  trendLabel?: string;
}

// ================================================
// STAT CARD SUB-COMPONENT
// ================================================

interface StatCardProps {
  stat: RefundStatCard;
  onClick?: () => void;
  showTrend?: boolean;
  compact?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  stat,
  onClick,
  showTrend = false,
  compact = false,
}) => {
  const Icon = stat.icon;
  const isClickable = !!onClick;

  const TrendIcon =
    stat.trend && stat.trend > 0
      ? TrendingUp
      : stat.trend && stat.trend < 0
        ? TrendingDown
        : Minus;

  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-white p-4 text-left transition-all',
        'dark:border-gray-700 dark:bg-gray-800',
        isClickable &&
          'cursor-pointer hover:scale-105 hover:shadow-lg active:scale-100',
        !isClickable && 'cursor-default',
        compact ? 'p-3' : 'p-4'
      )}
      aria-label={`${stat.label}: ${stat.value}`}
    >
      {/* Background gradient */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5',
          stat.bgColor
        )}
      />

      <div className="relative flex items-start justify-between">
        {/* Icon */}
        <div className={cn('rounded-lg p-2', stat.bgColor)}>
          <Icon className={cn('h-5 w-5', stat.color)} />
        </div>

        {/* Trend indicator */}
        {showTrend && stat.trend !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              stat.trend > 0 && 'text-green-600 dark:text-green-400',
              stat.trend < 0 && 'text-red-600 dark:text-red-400',
              stat.trend === 0 && 'text-gray-500 dark:text-gray-400'
            )}
          >
            <TrendIcon className="h-3 w-3" />
            <span>
              {stat.trend > 0 && '+'}
              {stat.trend}%
            </span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-3">
        <p
          className={cn(
            'font-bold text-gray-900 dark:text-gray-100',
            compact ? 'text-xl' : 'text-2xl'
          )}
        >
          {stat.value}
        </p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {stat.label}
        </p>
        {stat.trendLabel && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            {stat.trendLabel}
          </p>
        )}
      </div>
    </button>
  );
};

// ================================================
// LOADING SKELETON
// ================================================

const StatsLoadingSkeleton: React.FC<{ compact?: boolean }> = ({
  compact = false,
}) => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className={cn(
          'rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
          compact ? 'p-3' : 'p-4'
        )}
      >
        <div className="flex items-start justify-between">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="mt-3 space-y-2">
          <Skeleton className={cn('w-20', compact ? 'h-6' : 'h-8')} />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    ))}
  </div>
);

// ================================================
// MAIN COMPONENT
// ================================================

/**
 * RefundStatsWidget Component
 *
 * Displays refund statistics with visual indicators
 *
 * @example
 * ```tsx
 * <RefundStatsWidget showTrend onStatClick={(stat) => console.log(stat)} />
 * ```
 */
export const RefundStatsWidget: React.FC<RefundStatsWidgetProps> = ({
  className,
  showTrend = false,
  onStatClick,
  compact = false,
}) => {
  const { refunds, isLoading, error } = useMyRefunds();

  // Calculate statistics
  const stats = useMemo<RefundStatCard[]>(() => {
    if (!refunds) return [];

    const totalCount = refunds.length;
    const pendingCount = refunds.filter(
      (r) => r.status === RefundStatus.PENDING
    ).length;
    const approvedCount = refunds.filter(
      (r) => r.status === RefundStatus.APPROVED
    ).length;
    const totalAmount = refunds.reduce((sum, r) => sum + r.amount, 0);

    return [
      {
        id: 'total',
        label: 'Toplam İade',
        value: totalCount,
        icon: RotateCcw,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        trendLabel: 'Tüm zamanlar',
      },
      {
        id: 'pending',
        label: 'Bekleyen',
        value: pendingCount,
        icon: Clock,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        trendLabel: 'İnceleme aşamasında',
      },
      {
        id: 'approved',
        label: 'Onaylanan',
        value: approvedCount,
        icon: CheckCircle,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        trendLabel: 'Başarılı iadeler',
      },
      {
        id: 'amount',
        label: 'Toplam Tutar',
        value: new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(totalAmount),
        icon: DollarSign,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        trendLabel: 'İade edilen tutar',
      },
    ];
  }, [refunds]);

  // Loading state
  if (isLoading) {
    logger.debug('RefundStatsWidget: Loading stats');
    return (
      <div className={className}>
        <StatsLoadingSkeleton compact={compact} />
      </div>
    );
  }

  // Error state
  if (error) {
    logger.error('RefundStatsWidget: Error loading stats', error);
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            İstatistikler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (!refunds || refunds.length === 0) {
    logger.debug('RefundStatsWidget: No refunds found');
    return (
      <div className={className}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            {
              label: 'Toplam İade',
              value: 0,
              icon: RotateCcw,
              color: 'text-blue-600',
              bgColor: 'bg-blue-100',
            },
            {
              label: 'Bekleyen',
              value: 0,
              icon: Clock,
              color: 'text-orange-600',
              bgColor: 'bg-orange-100',
            },
            {
              label: 'Onaylanan',
              value: 0,
              icon: CheckCircle,
              color: 'text-green-600',
              bgColor: 'bg-green-100',
            },
            {
              label: 'Toplam Tutar',
              value: '₺0',
              icon: DollarSign,
              color: 'text-purple-600',
              bgColor: 'bg-purple-100',
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={cn(
                  'rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
                  compact ? 'p-3' : 'p-4'
                )}
              >
                <div className={cn('rounded-lg p-2', stat.bgColor)}>
                  <Icon className={cn('h-5 w-5', stat.color)} />
                </div>
                <div className="mt-3">
                  <p
                    className={cn(
                      'font-bold text-gray-900 dark:text-gray-100',
                      compact ? 'text-xl' : 'text-2xl'
                    )}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Henüz iade talebiniz yok
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Success state
  logger.debug('RefundStatsWidget: Displaying stats', {
    statsCount: stats.length,
  });

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            stat={stat}
            onClick={onStatClick ? () => onStatClick(stat.id) : undefined}
            showTrend={showTrend}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
};

// ================================================
// DEFAULT EXPORT
// ================================================

export default RefundStatsWidget;
