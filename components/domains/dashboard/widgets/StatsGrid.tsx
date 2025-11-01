/**
 * @fileoverview StatsGrid Widget - Responsive Statistics Grid Layout
 * @module components/domains/dashboard/widgets/StatsGrid
 *
 * Responsive grid container for statistics cards.
 * Handles layout, spacing, and animation for multiple stats cards.
 *
 * @created 2025-11-01
 * @sprint Sprint 1 - Day 3 - Task 5.2
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { StatsCard, StatsCardCompact } from './StatsCard';
import type { StatsGridProps } from '../types/dashboard.types';

/**
 * Gap size classes
 */
const gapClasses = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
};

/**
 * StatsGrid Component
 *
 * Responsive grid layout for statistics cards with:
 * - Configurable column counts per breakpoint
 * - Optional animation on mount
 * - Loading state support
 * - Empty state handling
 * - Flexible gap sizing
 *
 * @example
 * ```tsx
 * <StatsGrid
 *   stats={[
 *     { id: '1', title: 'Users', value: '1,234', icon: Users, iconColor: 'blue' },
 *     { id: '2', title: 'Revenue', value: '$45K', icon: DollarSign, iconColor: 'green' },
 *   ]}
 *   config={{
 *     columns: { mobile: 1, tablet: 2, desktop: 4 },
 *     gap: 'md',
 *     animate: true
 *   }}
 * />
 * ```
 */
export function StatsGrid({
  stats,
  config,
  isLoading = false,
  className,
}: StatsGridProps) {
  // Default configuration
  const columns = config?.columns || { mobile: 1, tablet: 2, desktop: 4 };
  const gap = config?.gap || 'md';
  const animate = config?.animate ?? true;

  // Column classes based on configuration
  const columnClasses = cn(
    // Mobile columns
    columns.mobile === 1 && 'grid-cols-1',
    columns.mobile === 2 && 'grid-cols-2',
    // Tablet columns
    columns.tablet === 2 && 'sm:grid-cols-2',
    columns.tablet === 3 && 'sm:grid-cols-3',
    // Desktop columns
    columns.desktop === 2 && 'lg:grid-cols-2',
    columns.desktop === 3 && 'lg:grid-cols-3',
    columns.desktop === 4 && 'lg:grid-cols-4'
  );

  // Empty state
  if (!isLoading && (!stats || stats.length === 0)) {
    return (
      <div
        className={cn(
          'rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50',
          className
        )}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No statistics available
        </p>
      </div>
    );
  }

  return (
    <div className={cn('grid', columnClasses, gapClasses[gap], className)}>
      {isLoading
        ? // Loading skeleton
          Array.from({ length: columns.desktop }).map((_, index) => (
            <StatsCard
              key={`skeleton-${index}`}
              data={{
                id: `skeleton-${index}`,
                title: '',
                value: '',
              }}
              isLoading={true}
            />
          ))
        : // Actual stats
          stats.map((stat, index) => (
            <div
              key={stat.id}
              className={cn(
                animate && 'animate-in fade-in-0 slide-in-from-bottom-4'
              )}
              style={
                animate
                  ? {
                      animationDelay: `${index * 75}ms`,
                      animationFillMode: 'backwards',
                    }
                  : undefined
              }
            >
              <StatsCard data={stat} />
            </div>
          ))}
    </div>
  );
}

/**
 * StatsGridCompact - Compact grid for smaller spaces
 *
 * Uses compact card variant, ideal for sidebars or limited spaces.
 *
 * @example
 * ```tsx
 * <StatsGridCompact
 *   stats={quickStats}
 *   columns={{ mobile: 1, tablet: 2, desktop: 2 }}
 * />
 * ```
 */
export function StatsGridCompact({
  stats,
  columns = { mobile: 1, tablet: 2, desktop: 2 },
  gap = 'sm',
  isLoading = false,
  className,
}: {
  stats: StatsGridProps['stats'];
  columns?: { mobile: 1 | 2; tablet: 2 | 3; desktop: 2 | 3 | 4 };
  gap?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
}) {
  const columnClasses = cn(
    columns.mobile === 1 && 'grid-cols-1',
    columns.mobile === 2 && 'grid-cols-2',
    columns.tablet === 2 && 'sm:grid-cols-2',
    columns.tablet === 3 && 'sm:grid-cols-3',
    columns.desktop === 2 && 'lg:grid-cols-2',
    columns.desktop === 3 && 'lg:grid-cols-3'
  );

  if (!isLoading && (!stats || stats.length === 0)) {
    return null;
  }

  return (
    <div className={cn('grid', columnClasses, gapClasses[gap], className)}>
      {isLoading
        ? Array.from({ length: columns.desktop }).map((_, index) => (
            <StatsCardCompact
              key={`compact-skeleton-${index}`}
              data={{ id: `skeleton-${index}`, title: '', value: '' }}
              isLoading={true}
            />
          ))
        : stats.map((stat) => <StatsCardCompact key={stat.id} data={stat} />)}
    </div>
  );
}

/**
 * StatsGridRow - Single row layout
 *
 * Forces all stats in a single horizontal row with scroll on overflow.
 * Useful for key metrics that should always be visible.
 *
 * @example
 * ```tsx
 * <StatsGridRow stats={keyMetrics} />
 * ```
 */
export function StatsGridRow({
  stats,
  isLoading = false,
  gap = 'md',
  className,
}: {
  stats: StatsGridProps['stats'];
  isLoading?: boolean;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  if (!isLoading && (!stats || stats.length === 0)) {
    return null;
  }

  return (
    <div
      className={cn('flex overflow-x-auto pb-2', gapClasses[gap], className)}
    >
      {isLoading
        ? Array.from({ length: 4 }).map((_, index) => (
            <div key={`row-skeleton-${index}`} className="min-w-[250px]">
              <StatsCard
                data={{ id: `skeleton-${index}`, title: '', value: '' }}
                isLoading={true}
              />
            </div>
          ))
        : stats.map((stat) => (
            <div key={stat.id} className="min-w-[250px]">
              <StatsCard data={stat} />
            </div>
          ))}
    </div>
  );
}

/**
 * Export default
 */
export default StatsGrid;
