/**
 * @fileoverview DashboardHeader Widget - Dashboard Page Header
 * @module components/domains/dashboard/widgets/DashboardHeader
 *
 * Reusable dashboard page header with:
 * - Title and subtitle
 * - Period selector
 * - Refresh button
 * - Custom actions slot
 *
 * @created 2025-11-01
 * @sprint Sprint 1 - Day 3 - Task 5.5
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw, Calendar } from 'lucide-react';
import type { DashboardHeaderProps } from '../types/dashboard.types';

/**
 * DashboardHeader Component
 *
 * Consistent dashboard page header with:
 * - Title and subtitle
 * - Period selector dropdown
 * - Refresh button
 * - Custom actions area
 * - Responsive layout
 *
 * @example
 * ```tsx
 * <DashboardHeader
 *   role="ADMIN"
 *   title="Admin Dashboard"
 *   subtitle="System overview and metrics"
 *   period={{
 *     current: 30,
 *     options: [7, 30, 90],
 *     onChange: (days) => setDays(days)
 *   }}
 *   refresh={{
 *     onClick: () => refetch(),
 *     isLoading: isRefreshing
 *   }}
 * />
 * ```
 */
export function DashboardHeader({
  role: _role,
  title,
  subtitle,
  period,
  refresh,
  actions,
  className,
}: DashboardHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      {/* Left side: Title and subtitle */}
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-gray-100">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right side: Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Period selector */}
        {period && (
          <div className="relative">
            <select
              value={period.current}
              onChange={(e) => period.onChange(Number(e.target.value))}
              className="appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 pr-10 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
            >
              {period.options.map((days) => (
                <option key={days} value={days}>
                  Son {days} gün
                </option>
              ))}
            </select>
            <Calendar className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        )}

        {/* Refresh button */}
        {refresh && (
          <button
            onClick={refresh.onClick}
            disabled={refresh.isLoading}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
            title="Yenile"
          >
            <RefreshCw
              className={cn('h-4 w-4', refresh.isLoading && 'animate-spin')}
            />
            <span className="hidden sm:inline">Yenile</span>
          </button>
        )}

        {/* Custom actions */}
        {actions}
      </div>
    </div>
  );
}

export default DashboardHeader;
