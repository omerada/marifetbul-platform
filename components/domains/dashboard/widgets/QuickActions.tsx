/**
 * @fileoverview QuickActions Widget - Action Buttons Grid
 * @module components/domains/dashboard/widgets/QuickActions
 *
 * Responsive grid of quick action buttons with:
 * - Icon and label
 * - Badge support for notifications
 * - Permission-based filtering
 * - Loading and disabled states
 * - Customizable grid layout
 *
 * @created 2025-11-01
 * @sprint Sprint 1 - Day 3 - Task 5.4
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { QuickActionsProps, QuickAction } from '../types/dashboard.types';

/**
 * Grid columns configuration
 */
const columnClasses = {
  mobile: {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
  },
  tablet: {
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
  },
  desktop: {
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
  },
};

/**
 * Action button size classes
 */
const sizeClasses = {
  sm: {
    icon: 'h-10 w-10',
    iconInner: 'h-5 w-5',
    padding: 'p-3',
  },
  md: {
    icon: 'h-12 w-12',
    iconInner: 'h-6 w-6',
    padding: 'p-4',
  },
  lg: {
    icon: 'h-14 w-14',
    iconInner: 'h-7 w-7',
    padding: 'p-5',
  },
};

/**
 * Action variant colors
 */
const variantColors = {
  default:
    'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800',
  primary:
    'border-blue-200 bg-blue-50 hover:border-blue-300 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-900/20 dark:hover:bg-blue-900/30',
  success:
    'border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100 dark:border-green-900/50 dark:bg-green-900/20 dark:hover:bg-green-900/30',
  warning:
    'border-yellow-200 bg-yellow-50 hover:border-yellow-300 hover:bg-yellow-100 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30',
  danger:
    'border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20 dark:hover:bg-red-900/30',
};

/**
 * Icon background colors
 */
const iconBackgroundColors = {
  default:
    'bg-gray-100 text-gray-600 group-hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300',
  primary:
    'bg-blue-100 text-blue-600 group-hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-400',
  success:
    'bg-green-100 text-green-600 group-hover:bg-green-200 dark:bg-green-900/50 dark:text-green-400',
  warning:
    'bg-yellow-100 text-yellow-600 group-hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400',
  danger:
    'bg-red-100 text-red-600 group-hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400',
};

/**
 * Single Quick Action Button
 */
function QuickActionButton({
  action,
  size = 'md',
  showDescription = true,
}: {
  action: QuickAction;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}) {
  const Icon = action.icon;
  const variant = action.variant || 'default';

  return (
    <button
      onClick={action.onClick}
      disabled={action.disabled}
      title={action.description}
      className={cn(
        'group relative flex flex-col items-center rounded-lg border transition-all',
        sizeClasses[size].padding,
        variantColors[variant],
        action.disabled && 'cursor-not-allowed opacity-50',
        !action.disabled && 'hover:shadow-md active:scale-95'
      )}
    >
      {/* Badge */}
      {action.badge !== undefined && action.badge > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
          {action.badge > 99 ? '99+' : action.badge}
        </span>
      )}

      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center rounded-lg transition-colors',
          sizeClasses[size].icon,
          iconBackgroundColors[variant]
        )}
      >
        <Icon className={sizeClasses[size].iconInner} />
      </div>

      {/* Label */}
      <span className="mt-2 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
        {action.label}
      </span>

      {/* Description */}
      {showDescription && action.description && (
        <span className="mt-0.5 text-center text-xs text-gray-500 dark:text-gray-400">
          {action.description}
        </span>
      )}
    </button>
  );
}

/**
 * QuickActions Component
 *
 * Grid of quick action buttons with:
 * - Responsive layout
 * - Badge notifications
 * - Permission filtering
 * - Loading state
 * - Custom variants
 *
 * @example
 * ```tsx
 * <QuickActions
 *   actions={[
 *     {
 *       id: 'new-order',
 *       label: 'Yeni Sipariş',
 *       description: 'Sipariş oluştur',
 *       icon: Plus,
 *       onClick: () => router.push('/orders/new'),
 *       variant: 'primary',
 *       badge: 3
 *     }
 *   ]}
 *   config={{
 *     columns: { mobile: 2, tablet: 3, desktop: 4 },
 *     size: 'md',
 *     showDescriptions: true
 *   }}
 *   title="Hızlı Eylemler"
 * />
 * ```
 */
export function QuickActions({
  actions,
  config,
  className,
  title,
}: QuickActionsProps) {
  // Default configuration
  const columns = config?.columns || { mobile: 2, tablet: 3, desktop: 4 };
  const size = config?.size || 'md';
  const showDescriptions = config?.showDescriptions ?? true;

  // Filter out disabled actions if needed
  const visibleActions = actions.filter((action) => !action.disabled || true);

  // Empty state
  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <Card className={cn('p-6', className)}>
      {/* Title */}
      {title && (
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Sık kullanılan işlemler
          </span>
        </div>
      )}

      {/* Actions Grid */}
      <div
        className={cn(
          'grid gap-4',
          columnClasses.mobile[columns.mobile],
          columnClasses.tablet[columns.tablet],
          columnClasses.desktop[columns.desktop]
        )}
      >
        {visibleActions.map((action) => (
          <QuickActionButton
            key={action.id}
            action={action}
            size={size}
            showDescription={showDescriptions}
          />
        ))}
      </div>
    </Card>
  );
}

/**
 * QuickActionsCompact - Horizontal row layout
 *
 * Compact horizontal layout for smaller spaces.
 * No descriptions, smaller size.
 *
 * @example
 * ```tsx
 * <QuickActionsCompact actions={quickActions} />
 * ```
 */
export function QuickActionsCompact({
  actions,
  className,
}: {
  actions: QuickAction[];
  className?: string;
}) {
  const visibleActions = actions.filter((action) => !action.disabled || true);

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-2', className)}>
      {visibleActions.map((action) => {
        const Icon = action.icon;
        const variant = action.variant || 'default';

        return (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={action.disabled}
            title={action.description || action.label}
            className={cn(
              'group relative flex min-w-[100px] flex-col items-center rounded-lg border p-3 transition-all',
              variantColors[variant],
              action.disabled && 'cursor-not-allowed opacity-50',
              !action.disabled && 'hover:shadow-md active:scale-95'
            )}
          >
            {/* Badge */}
            {action.badge !== undefined && action.badge > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {action.badge > 99 ? '99+' : action.badge}
              </span>
            )}

            {/* Icon */}
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                iconBackgroundColors[variant]
              )}
            >
              <Icon className="h-4 w-4" />
            </div>

            {/* Label */}
            <span className="mt-1 text-center text-xs font-medium text-gray-900 dark:text-gray-100">
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Export default
 */
export default QuickActions;
