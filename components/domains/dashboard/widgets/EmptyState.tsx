/**
 * @fileoverview EmptyState Widget - Empty State Component
 * @module components/domains/dashboard/widgets/EmptyState
 *
 * Displays empty state with icon, message, and optional action.
 * Used when there's no data to display.
 *
 * @created 2025-11-01
 * @sprint Sprint 1 - Day 3 - Task 5.5
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';
import type { EmptyStateProps } from '../types/dashboard.types';

/**
 * EmptyState Component
 *
 * Simple, consistent empty state display with:
 * - Optional icon
 * - Title and description
 * - Optional action button
 * - Responsive sizing
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Package}
 *   title="No packages found"
 *   description="Create your first package to get started"
 *   action={{
 *     label: 'Create Package',
 *     onClick: () => router.push('/packages/new')
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50',
        className
      )}
    >
      {/* Icon */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
      </div>

      {/* Title */}
      <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="mb-6 max-w-sm text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}

      {/* Action button */}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-900"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
