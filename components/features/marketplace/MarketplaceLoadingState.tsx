'use client';

import { memo } from 'react';
import { Skeleton } from '@/components/shared/SkeletonComponent';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface MarketplaceLoadingStateProps {
  viewMode: 'grid' | 'list';
  itemCount?: number;
  showDescription?: boolean;
  showPricing?: boolean;
  showRating?: boolean;
  className?: string;
  'aria-label'?: string;
}

function MarketplaceLoadingStateComponent({
  viewMode,
  itemCount = 8,
  showDescription = true,
  showPricing = true,
  showRating = true,
  className,
  'aria-label': ariaLabel = 'Marketplace içeriği yükleniyor',
}: MarketplaceLoadingStateProps) {
  const items = Array.from({ length: itemCount }, (_, i) => i);

  if (viewMode === 'list') {
    return (
      <div
        className={cn('space-y-4', className)}
        role="status"
        aria-label={ariaLabel}
        data-testid="marketplace-loading-list"
      >
        {items.map((index) => (
          <Card
            key={`list-skeleton-${index}`}
            className="p-6"
            variant="default"
          >
            <div className="flex items-start gap-4">
              {/* Avatar/Logo */}
              <Skeleton variant="circular" width={64} height={64} />

              <div className="flex-1 space-y-3">
                {/* Header with title and price */}
                <div className="flex items-center justify-between">
                  <Skeleton variant="text" className="h-6 w-3/4" />
                  {showPricing && (
                    <Skeleton variant="text" className="h-5 w-20" />
                  )}
                </div>

                {/* Description lines */}
                {showDescription && (
                  <>
                    <Skeleton variant="text" className="h-4 w-full" />
                    <Skeleton variant="text" className="h-4 w-2/3" />
                  </>
                )}

                {/* Rating and additional info */}
                {showRating && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Skeleton
                        variant="rectangular"
                        width={80}
                        height={16}
                        className="rounded"
                      />
                    </div>
                    <Skeleton variant="text" className="h-4 w-24" />
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
      role="status"
      aria-label={ariaLabel}
      data-testid="marketplace-loading-grid"
    >
      {items.map((index) => (
        <Card
          key={`grid-skeleton-${index}`}
          variant="elevated"
          className="overflow-hidden"
          padding="none"
        >
          {/* Featured Image */}
          <Skeleton variant="rectangular" className="h-48 w-full" />

          <div className="space-y-4 p-6">
            {/* User/Company Info */}
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={40} height={40} />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="h-4 w-2/3" />
                <Skeleton variant="text" className="h-3 w-1/2" />
              </div>
            </div>

            {/* Title */}
            <Skeleton variant="text" className="h-5 w-full" />

            {/* Description */}
            {showDescription && (
              <>
                <Skeleton variant="text" className="h-4 w-4/5" />
                <Skeleton variant="text" className="h-4 w-3/5" />
              </>
            )}

            {/* Footer with rating and price */}
            <div className="flex items-center justify-between pt-2">
              {showRating && (
                <div className="flex items-center gap-1">
                  <Skeleton variant="circular" width={16} height={16} />
                  <Skeleton variant="text" className="h-4 w-12" />
                </div>
              )}

              {showPricing && <Skeleton variant="text" className="h-5 w-16" />}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export const MarketplaceLoadingState = memo(MarketplaceLoadingStateComponent);
export default MarketplaceLoadingState;
