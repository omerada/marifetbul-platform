/**
 * @fileoverview StatsCard Widget - Enhanced Statistics Card Component
 * @module components/domains/dashboard/widgets/StatsCard
 *
 * Unified, type-safe statistics card component.
 * Supports multiple variants, loading states, and click handlers.
 * Consolidates patterns from UnifiedDashboard, AdminDashboard, and ModeratorDashboard.
 *
 * @created 2025-11-01
 * @sprint Sprint 1 - Day 3 - Task 5.1
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { StatsCardProps } from '../types/dashboard.types';

/**
 * Icon color classes mapping
 */
const iconColorClasses: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  yellow:
    'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  purple:
    'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  orange:
    'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
};

/**
 * Trend color classes
 */
const trendColorClasses = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-600 dark:text-red-400',
  neutral: 'text-gray-600 dark:text-gray-400',
};

/**
 * Variant classes
 */
const variantClasses = {
  default:
    'border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
  outline:
    'border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800',
  filled:
    'bg-gradient-to-br from-white to-gray-50 border border-gray-100 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700',
};

/**
 * Size classes
 */
const sizeClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * StatsCard Component
 *
 * Enhanced statistics display card with:
 * - Icon with customizable colors
 * - Main value display
 * - Trend indicator with direction
 * - Loading skeleton
 * - Click handler support
 * - Multiple size variants
 * - Tooltip support
 * - Badge support
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <StatsCard
 *   data={{
 *     id: 'total-users',
 *     title: 'Total Users',
 *     value: '12,345',
 *     icon: Users,
 *     iconColor: 'blue',
 *     trend: {
 *       percentage: 12.5,
 *       direction: 'up',
 *       isPositive: true,
 *       label: 'vs last month'
 *     },
 *     metadata: {
 *       tooltip: 'Active users in the last 30 days',
 *       badge: 'New'
 *     }
 *   }}
 *   variant="filled"
 *   size="md"
 * />
 * ```
 */
export function StatsCard({
  data,
  isLoading = false,
  onClick,
  className,
  variant = 'default',
  size = 'md',
}: StatsCardProps) {
  const {
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor = 'blue',
    trend,
    metadata,
  } = data;

  // Loading skeleton
  if (isLoading) {
    return (
      <Card
        className={cn(
          variantClasses[variant],
          sizeClasses[size],
          'animate-pulse',
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-8 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </Card>
    );
  }

  // Main content
  return (
    <Card
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:scale-[1.02] hover:shadow-lg',
        !onClick && 'hover:shadow-md',
        className
      )}
      onClick={onClick || metadata?.onClick}
      title={metadata?.tooltip}
    >
      <div className="flex items-start justify-between">
        {/* Left side: Text content */}
        <div className="min-w-0 flex-1">
          {/* Title with optional badge */}
          <div className="mb-2 flex items-center gap-2">
            <p className="truncate text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            {metadata?.badge && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {metadata.badge}
              </span>
            )}
          </div>

          {/* Value */}
          <p className="mb-2 text-3xl font-bold text-gray-900 tabular-nums dark:text-gray-100">
            {value}
          </p>

          {/* Subtitle and Trend */}
          <div className="flex flex-wrap items-center gap-2">
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}

            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  trendColorClasses[trend.direction]
                )}
              >
                {/* Trend icon */}
                {trend.direction === 'up' && <TrendingUp className="h-4 w-4" />}
                {trend.direction === 'down' && (
                  <TrendingDown className="h-4 w-4" />
                )}
                {trend.direction === 'neutral' && <Minus className="h-4 w-4" />}

                {/* Trend percentage */}
                <span>
                  {trend.direction === 'up' && '+'}
                  {trend.percentage}%
                </span>

                {/* Trend label */}
                {trend.label && (
                  <span className="font-normal text-gray-500 dark:text-gray-400">
                    {trend.label}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Icon */}
        {Icon && (
          <div
            className={cn(
              'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg',
              iconColorClasses[iconColor] || iconColorClasses.gray
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * StatsCardCompact - Compact version for smaller spaces
 *
 * @example
 * ```tsx
 * <StatsCardCompact
 *   data={{
 *     id: 'quick-stat',
 *     title: 'Orders',
 *     value: '42'
 *   }}
 * />
 * ```
 */
export function StatsCardCompact({
  data,
  isLoading = false,
  className,
}: Omit<StatsCardProps, 'variant' | 'size'>) {
  const { title, value, icon: Icon, iconColor = 'blue' } = data;

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex animate-pulse items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800',
          className
        )}
      >
        <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
            iconColorClasses[iconColor] || iconColorClasses.gray
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <p className="text-xl font-bold text-gray-900 tabular-nums dark:text-gray-100">
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * Export default for convenience
 */
export default StatsCard;
