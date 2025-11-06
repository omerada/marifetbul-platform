/**
 * TABLE SKELETON COMPONENT
 * ================================================
 * Reusable loading skeleton for table layouts
 * Sprint EPIC 4 - Story 4.1: Loading States Enhancement
 *
 * Features:
 * - Configurable rows and columns
 * - Header skeleton support
 * - Compact/standard variants
 * - Action column support
 */

'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';
import { cn } from '@/lib/utils';

export interface TableSkeletonProps {
  /** Number of rows to display */
  rows?: number;
  /** Number of columns */
  columns?: number;
  /** Show header row */
  showHeader?: boolean;
  /** Show action column at the end */
  showActions?: boolean;
  /** Compact mode (smaller rows) */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 5,
  showHeader = true,
  showActions = true,
  compact = false,
  className,
}: TableSkeletonProps) {
  const rowHeight = compact ? 'h-12' : 'h-16';
  const cellPadding = compact ? 'p-3' : 'p-4';

  return (
    <div className={cn('w-full overflow-hidden rounded-lg border', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header Skeleton */}
          {showHeader && (
            <thead className="bg-muted/50 border-b">
              <tr>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <th
                    key={`header-${colIndex}`}
                    className={cn('text-left', cellPadding)}
                  >
                    <Skeleton
                      className={cn('h-4', colIndex === 0 ? 'w-32' : 'w-24')}
                    />
                  </th>
                ))}
                {showActions && (
                  <th className={cn('text-right', cellPadding)}>
                    <Skeleton className="ml-auto h-4 w-20" />
                  </th>
                )}
              </tr>
            </thead>
          )}

          {/* Body Skeleton */}
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr
                key={`row-${rowIndex}`}
                className={cn('border-b last:border-b-0', rowHeight)}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={cellPadding}
                  >
                    {colIndex === 0 ? (
                      // First column - typically ID or primary field
                      <Skeleton className="h-5 w-28" />
                    ) : colIndex === columns - 1 ? (
                      // Last data column - typically status badge
                      <Skeleton className="h-6 w-20 rounded-full" />
                    ) : (
                      // Middle columns - text
                      <Skeleton className={cn('h-4', getRandomWidth())} />
                    )}
                  </td>
                ))}
                {showActions && (
                  <td className={cn('text-right', cellPadding)}>
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Generate random width classes for variety
 */
function getRandomWidth(): string {
  const widths = ['w-24', 'w-32', 'w-36', 'w-40', 'w-48'];
  return widths[Math.floor(Math.random() * widths.length)];
}

/**
 * Compact Table Skeleton
 * Pre-configured for dense layouts
 */
export function TableSkeletonCompact(
  props: Omit<TableSkeletonProps, 'compact'>
) {
  return <TableSkeleton {...props} compact={true} />;
}

/**
 * Stats Table Skeleton
 * For statistics/analytics tables
 */
export function StatsTableSkeleton({
  rows = 5,
  className,
}: Pick<TableSkeletonProps, 'rows' | 'className'>) {
  return (
    <div className={cn('w-full space-y-3', className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-10 w-10 rounded" />
        </div>
      ))}
    </div>
  );
}

export default TableSkeleton;
