/**
 * LIST SKELETON COMPONENT
 * ================================================
 * Reusable loading skeleton for list layouts
 * Sprint EPIC 4 - Story 4.1: Loading States Enhancement
 *
 * Features:
 * - Card list, simple list, feed list variants
 * - Configurable item count
 * - Avatar, thumbnail, action support
 * - Compact/standard modes
 */

'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';

export type ListVariant = 'card' | 'simple' | 'feed' | 'compact';

export interface ListSkeletonProps {
  /** List variant style */
  variant?: ListVariant;
  /** Number of items */
  items?: number;
  /** Show avatar/thumbnail */
  showAvatar?: boolean;
  /** Show action buttons */
  showActions?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function ListSkeleton({
  variant = 'card',
  items = 5,
  showAvatar = true,
  showActions = true,
  className,
}: ListSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <ListItemSkeleton
          key={index}
          variant={variant}
          showAvatar={showAvatar}
          showActions={showActions}
        />
      ))}
    </div>
  );
}

/**
 * Individual List Item Skeleton
 */
function ListItemSkeleton({
  variant,
  showAvatar,
  showActions,
}: Pick<ListSkeletonProps, 'variant' | 'showAvatar' | 'showActions'>) {
  // Card variant - full card with padding
  if (variant === 'card') {
    return (
      <Card className="p-4 sm:p-6">
        <div className="flex gap-4">
          {/* Avatar/Thumbnail */}
          {showAvatar && (
            <Skeleton className="h-12 w-12 flex-shrink-0 rounded-full sm:h-16 sm:w-16" />
          )}

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Simple variant - minimal styling
  if (variant === 'simple') {
    return (
      <div className="flex items-center gap-4 rounded-lg border p-4">
        {showAvatar && (
          <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
        )}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        {showActions && <Skeleton className="h-8 w-8 rounded" />}
      </div>
    );
  }

  // Feed variant - like social media posts
  if (variant === 'feed') {
    return (
      <Card className="p-4">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Image */}
        <Skeleton className="mt-4 h-48 w-full rounded-lg" />

        {/* Actions */}
        {showActions && (
          <div className="mt-4 flex gap-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        )}
      </Card>
    );
  }

  // Compact variant - dense layout
  return (
    <div className="flex items-center gap-3 rounded border px-3 py-2">
      {showAvatar && <Skeleton className="h-8 w-8 rounded-full" />}
      <div className="flex-1">
        <Skeleton className="h-4 w-3/4" />
      </div>
      {showActions && <Skeleton className="h-6 w-6 rounded" />}
    </div>
  );
}

/**
 * Order List Skeleton
 * Pre-configured for order listings
 */
export function OrderListSkeleton({
  items = 5,
  className,
}: Pick<ListSkeletonProps, 'items' | 'className'>) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Package List Skeleton
 * Pre-configured for package browsing
 */
export function PackageListSkeleton({
  items = 6,
  className,
}: Pick<ListSkeletonProps, 'items' | 'className'>) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default ListSkeleton;
