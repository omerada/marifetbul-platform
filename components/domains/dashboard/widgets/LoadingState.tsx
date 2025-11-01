/**
 * @fileoverview LoadingState Widget - Loading Skeleton Component
 * @module components/domains/dashboard/widgets/LoadingState
 *
 * Generic loading skeleton for dashboard sections.
 * Prevents layout shift during data loading.
 *
 * @created 2025-11-01
 * @sprint Sprint 1 - Day 3 - Task 5.5
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * LoadingState Component
 *
 * Simple animated skeleton loader with:
 * - Pulse animation
 * - Customizable shape
 * - Multiple line support
 * - Responsive sizing
 *
 * @example
 * ```tsx
 * <LoadingState lines={3} className="h-48" />
 * ```
 */
export function LoadingState({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'animate-pulse space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 rounded bg-gray-200 dark:bg-gray-700',
            i === 0 && 'w-3/4',
            i === 1 && 'w-full',
            i === 2 && 'w-2/3',
            i > 2 && 'w-5/6'
          )}
        />
      ))}
    </div>
  );
}

/**
 * CardLoadingSkeleton - Card-specific loading skeleton
 */
export function CardLoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

export default LoadingState;
