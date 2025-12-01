/**
 * ================================================
 * UNIFIED STAT CARD COMPONENT
 * ================================================
 * Consolidated from 8 different inline implementations
 *
 * Sprint 1 - Day 1: Duplicate Component Elimination
 *
 * Previous locations (NOW REMOVED):
 * 1. components/admin/commission/CommissionDashboard.tsx (line 62)
 * 2. components/domains/wallet/CommissionBreakdown.tsx (line 347)
 * 3. components/domains/wallet/EscrowStatisticsWidget.tsx (line 125)
 * 4. components/domains/admin/refunds/RefundStatisticsDashboard.tsx (line 170)
 * 5. app/dashboard/refunds/page.tsx (line 280)
 * 6. app/dashboard/favorites/page.tsx (line 441)
 * 7. app/admin/refunds/page.tsx (line 357)
 * 8. Inline admin/system components (3 variations)
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Unified implementation
 * @created January 2025
 */

'use client';

import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from '@/components/ui';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export type StatCardColor =
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'red'
  | 'gray';
export type StatCardVariant = 'default' | 'compact' | 'detailed';
export type StatCardTrend = 'up' | 'down' | 'neutral';

export interface StatCardProps {
  /** Main label/title */
  label: string;
  /** Main value to display */
  value: string | number;

  /** Optional subtitle */
  subtitle?: string;
  /** Optional sub-value (secondary metric) */
  subValue?: string;
  /** Optional icon component */
  icon?: React.ReactNode;

  /** Color theme */
  color?: StatCardColor;
  /** Display variant */
  variant?: StatCardVariant;

  /** Click handler */
  onClick?: () => void;
  /** Active/selected state */
  active?: boolean;

  /** Loading state */
  isLoading?: boolean;
  /** Trend indicator */
  trend?: StatCardTrend;
  /** Optional badge */
  badge?: {
    text: string;
    variant?:
      | 'default'
      | 'secondary'
      | 'success'
      | 'warning'
      | 'destructive'
      | 'outline'
      | 'premium';
  };

  /** Custom className */
  className?: string;
  /** Test ID for E2E testing */
  testId?: string;
}

// ================================================
// COLOR MAPPINGS
// ================================================

const COLOR_CLASSES: Record<
  StatCardColor,
  {
    bg: string;
    text: string;
    border: string;
    iconBg: string;
  }
> = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    iconBg: 'bg-blue-500/10',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
    iconBg: 'bg-green-500/10',
  },
  yellow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
    iconBg: 'bg-yellow-500/10',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    iconBg: 'bg-purple-500/10',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    iconBg: 'bg-red-500/10',
  },
  gray: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
    iconBg: 'bg-gray-500/10',
  },
};

// ================================================
// COMPONENT
// ================================================

export function StatCard({
  label,
  value,
  subtitle,
  subValue,
  icon,
  color = 'blue',
  variant = 'default',
  onClick,
  active = false,
  isLoading = false,
  trend,
  badge,
  className,
  testId,
}: StatCardProps) {
  const colorClasses = COLOR_CLASSES[color];

  // ================================================
  // LOADING STATE
  // ================================================

  if (isLoading) {
    return (
      <Card
        className={cn('border transition-all', colorClasses.border, className)}
        data-testid={testId}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
            </div>
            {icon && (
              <div className="h-12 w-12 animate-pulse rounded-lg bg-gray-200" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ================================================
  // COMPACT VARIANT
  // ================================================

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'rounded-lg border p-4 transition-all',
          colorClasses.border,
          onClick && 'cursor-pointer hover:shadow-md',
          active && 'ring-2 ring-offset-2',
          active && colorClasses.text,
          className
        )}
        onClick={onClick}
        data-testid={testId}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                colorClasses.iconBg,
                colorClasses.text
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================================================
  // DETAILED VARIANT
  // ================================================

  if (variant === 'detailed') {
    return (
      <Card
        className={cn(
          'border transition-shadow hover:shadow-lg',
          colorClasses.border,
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        data-testid={testId}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {label}
          </CardTitle>
          <div className="text-gray-400">{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {value}
                </span>
                {trend && (
                  <TrendingUp
                    className={cn(
                      'h-4 w-4',
                      trend === 'up' && 'text-green-600',
                      trend === 'down' && 'rotate-180 text-red-600',
                      trend === 'neutral' && 'text-gray-400'
                    )}
                  />
                )}
              </div>
              {subtitle && (
                <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
              )}
              {subValue && (
                <p className="mt-1 text-sm font-medium text-gray-700">
                  {subValue}
                </p>
              )}
            </div>
            {badge && (
              <Badge
                variant={
                  (badge.variant === 'destructive'
                    ? 'destructive'
                    : badge.variant) as
                    | 'default'
                    | 'success'
                    | 'warning'
                    | 'secondary'
                    | 'outline'
                    | 'destructive'
                    | 'premium'
                    | undefined
                }
                className="ml-2"
              >
                {badge.text}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ================================================
  // DEFAULT VARIANT
  // ================================================

  return (
    <Card
      className={cn(
        'border p-6 transition-all',
        colorClasses.border,
        colorClasses.bg,
        onClick && 'cursor-pointer hover:shadow-md',
        active && 'ring-2 ring-offset-2',
        active && colorClasses.text,
        className
      )}
      onClick={onClick}
      data-testid={testId}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span
                className={cn(
                  'flex items-center text-sm',
                  trend === 'up' && 'text-green-600',
                  trend === 'down' && 'text-red-600'
                )}
              >
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : trend === 'down' ? (
                  <TrendingDown className="h-4 w-4" />
                ) : null}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          {subValue && <p className="mt-1 text-xs text-gray-500">{subValue}</p>}
        </div>
        {icon && (
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full p-3',
              colorClasses.iconBg
            )}
          >
            <div className={cn('h-6 w-6', colorClasses.text)}>{icon}</div>
          </div>
        )}
        {badge && (
          <Badge
            variant={
              (badge.variant === 'destructive'
                ? 'destructive'
                : badge.variant) as
                | 'default'
                | 'success'
                | 'warning'
                | 'secondary'
                | 'outline'
                | 'destructive'
                | 'premium'
                | undefined
            }
          >
            {badge.text}
          </Badge>
        )}
      </div>
    </Card>
  );
}

// ================================================
// LOADING SKELETON
// ================================================

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('border p-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
      </div>
    </Card>
  );
}
