'use client';

'use client';

/**
 * @fileoverview DashboardSection Widget - Dashboard Content Section
 * @module components/domains/dashboard/widgets/DashboardSection
 *
 * Reusable dashboard section wrapper with:
 * - Title and icon
 * - Loading/error states
 * - Collapsible functionality
 * - Custom actions
 *
 * @created 2025-11-01
 * @sprint Sprint 1 - Day 1 - Task 1.2 - Migrated to UnifiedLoadingSystem
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Loading } from '@/components/ui';
import { SimpleErrorDisplay } from '@/components/ui/SimpleErrorDisplay';
import type { DashboardSectionProps } from '../types/dashboard.types';

/**
 * DashboardSection Component
 *
 * Flexible section wrapper with:
 * - Title with optional icon
 * - Subtitle
 * - Loading state (via UnifiedLoadingSystem)
 * - Error state with retry
 * - Collapsible functionality
 * - Custom actions area
 * - Responsive layout
 *
 * @example
 * ```tsx
 * <DashboardSection
 *   title="Recent Orders"
 *   subtitle="Last 30 days"
 *   icon={ShoppingCart}
 *   isLoading={isLoading}
 *   error={error}
 *   collapsible
 *   actions={
 *     <button>View All</button>
 *   }
 * >
 *   <OrderList orders={orders} />
 * </DashboardSection>
 * ```
 */
export function DashboardSection({
  title,
  subtitle,
  icon: Icon,
  children,
  isLoading = false,
  error,
  actions,
  className,
  collapsible = false,
  defaultCollapsed = false,
}: DashboardSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Icon + Title */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {Icon && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Icon className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
              {subtitle && (
                <p className="mt-0.5 truncate text-sm text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions + Collapse button */}
          <div className="flex flex-shrink-0 items-center gap-2">
            {actions}
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                aria-label={isCollapsed ? 'Genişlet' : 'Daralt'}
              >
                {isCollapsed ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronUp className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4">
          {/* Loading state - Modern UnifiedLoadingSystem */}
          {isLoading && (
            <Loading variant="skeleton" lines={3} className="border-0" />
          )}

          {/* Error state */}
          {!isLoading && error && <SimpleErrorDisplay error={error} />}

          {/* Actual content */}
          {!isLoading && !error && children}
        </div>
      )}
    </Card>
  );
}

export default DashboardSection;

/**
 * DashboardSection Component
 *
 * Flexible section wrapper with:
 * - Title with optional icon
 * - Subtitle
 * - Loading state
 * - Error state with retry
 * - Collapsible functionality
 * - Custom actions area
 * - Responsive layout
 *
 * @example
 * ```tsx
 * <DashboardSection
 *   title="Recent Orders"
 *   subtitle="Last 30 days"
 *   icon={ShoppingCart}
 *   isLoading={isLoading}
 *   error={error}
 *   collapsible
 *   actions={
 *     <button>View All</button>
 *   }
 * >
 *   <OrderList orders={orders} />
 * </DashboardSection>
 * ```
 */
export function DashboardSection({
  title,
  subtitle,
  icon: Icon,
  children,
  isLoading = false,
  error,
  actions,
  className,
  collapsible = false,
  defaultCollapsed = false,
}: DashboardSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Icon + Title */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {Icon && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Icon className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
              {subtitle && (
                <p className="mt-0.5 truncate text-sm text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions + Collapse button */}
          <div className="flex flex-shrink-0 items-center gap-2">
            {actions}
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                aria-label={isCollapsed ? 'Genişlet' : 'Daralt'}
              >
                {isCollapsed ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronUp className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4">
          {/* Loading state */}
          {isLoading && <LoadingState lines={3} className="border-0" />}

          {/* Error state */}
          {!isLoading && error && <SimpleErrorDisplay error={error} />}

          {/* Actual content */}
          {!isLoading && !error && children}
        </div>
      )}
    </Card>
  );
}

export default DashboardSection;
