// ================================================
// UNIFIED SKELETON SYSTEM
// ================================================
// Consolidated skeleton/loading components eliminating duplicates
// Replaces: JobDetailSkeleton, DashboardSkeleton, CardLoadingSkeleton, ComponentLoadingSkeleton

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

// ================================================
// BASE SKELETON COMPONENT
// ================================================

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'rounded' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'default',
  width,
  height,
  animation = 'pulse',
  ...props
}: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) {
  const variantClasses = {
    default: 'rounded-md',
    rounded: 'rounded-lg',
    circular: 'rounded-full',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse', // Could add wave animation later
    none: '',
  };

  const style = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && {
      height: typeof height === 'number' ? `${height}px` : height,
    }),
  };

  return (
    <div
      className={cn(
        'bg-muted',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      {...props}
    />
  );
}

// ================================================
// PRESET SKELETON COMPONENTS
// ================================================

export function SkeletonText({
  lines = 1,
  className,
  width = 'full',
}: {
  lines?: number;
  className?: string;
  width?: 'full' | '3/4' | '1/2' | '1/3' | '1/4';
}) {
  const widthClasses = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '1/4': 'w-1/4',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? widthClasses['3/4'] : widthClasses[width]
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({
  size = 'md',
  className,
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <Skeleton variant="circular" className={cn(sizeClasses[size], className)} />
  );
}

export function SkeletonButton({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-8 w-16',
    md: 'h-10 w-20',
    lg: 'h-12 w-24',
  };

  return <Skeleton className={cn(sizeClasses[size], className)} />;
}

export function SkeletonImage({
  aspectRatio = 'square',
  size = 'md',
  className,
}: {
  aspectRatio?: 'square' | 'video' | 'wide' | 'tall';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-32',
    md: 'w-48',
    lg: 'w-64',
    xl: 'w-80',
  };

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[16/9]',
    tall: 'aspect-[9/16]',
  };

  return (
    <Skeleton
      className={cn(sizeClasses[size], aspectClasses[aspectRatio], className)}
    />
  );
}

// ================================================
// CARD SKELETON PATTERNS
// ================================================

export function SkeletonCard({
  variant = 'default',
  className,
}: {
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}) {
  if (variant === 'compact') {
    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-center space-x-3">
          <SkeletonAvatar size="sm" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className={cn('p-6', className)}>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="mb-2 h-6 w-3/4" />
              <SkeletonText lines={2} width="full" />
            </div>
            <SkeletonButton />
          </div>

          <SkeletonImage aspectRatio="video" size="md" />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SkeletonAvatar size="xs" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex space-x-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-12 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-3">
        <SkeletonImage aspectRatio="video" size="md" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

// ================================================
// DASHBOARD SKELETON PATTERNS
// ================================================

export function SkeletonDashboard({
  type = 'freelancer', // eslint-disable-line @typescript-eslint/no-unused-vars
  className,
}: {
  type?: 'freelancer' | 'employer' | 'admin';
  className?: string;
}) {
  // Different dashboard layouts could be implemented based on type
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-12" />
                </div>
              </div>
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="mb-4 h-6 w-32" />
            <div className="space-y-3">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="flex items-center space-x-3">
                  <SkeletonAvatar size="sm" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ================================================
// JOB DETAIL SKELETON PATTERN
// ================================================

export function SkeletonJobDetail({ className }: { className?: string }) {
  return (
    <div className={cn('mx-auto max-w-6xl space-y-8 p-6', className)}>
      {/* Header Section */}
      <Card className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-6 w-16" />
            </div>

            <div className="mb-4 flex items-center space-x-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Tags */}
            <div className="mb-4 flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-6 w-16" />
              ))}
            </div>

            <SkeletonText lines={3} />
          </div>

          <div className="ml-6 space-y-3">
            <SkeletonButton size="lg" />
            <SkeletonButton size="md" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <SkeletonText lines={5} />
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start">
                    <Skeleton className="mt-0.5 mr-2 h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-6 w-16" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Employer Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center">
                <SkeletonAvatar size="lg" className="mr-4" />
                <div>
                  <Skeleton className="mb-1 h-5 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>

              <div className="mb-4 space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>

              <SkeletonButton className="mb-2" />
              <SkeletonButton />
            </CardContent>
          </Card>

          {/* Project Info */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Similar Jobs */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="border-b border-gray-100 pb-3 last:border-b-0"
                  >
                    <Skeleton className="mb-1 h-4 w-3/4" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ================================================
// GRID/LIST SKELETON PATTERNS
// ================================================

export function SkeletonGrid({
  items = 6,
  columns = 3,
  variant = 'default',
  className,
}: {
  items?: number;
  columns?: 1 | 2 | 3 | 4;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', gridClasses[columns], className)}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  );
}

export function SkeletonList({
  items = 5,
  variant = 'default',
  className,
}: {
  items?: number;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  );
}

// ================================================
// COMPONENT SKELETON (GENERIC)
// ================================================

export function SkeletonComponent({
  lines = 3,
  hasImage = false,
  hasActions = false,
  className,
}: {
  lines?: number;
  hasImage?: boolean;
  hasActions?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4 p-4', className)}>
      {hasImage && <SkeletonImage aspectRatio="video" size="md" />}
      <SkeletonText lines={lines} />
      {hasActions && (
        <div className="flex space-x-2">
          <SkeletonButton size="sm" />
          <SkeletonButton size="sm" />
        </div>
      )}
    </div>
  );
}

// ================================================
// PAGE SKELETON (FULL PAGE)
// ================================================

export function SkeletonPage({
  layout = 'default',
  className,
}: {
  layout?: 'default' | 'dashboard' | 'detail' | 'grid';
  className?: string;
}) {
  if (layout === 'dashboard') {
    return <SkeletonDashboard className={className} />;
  }

  if (layout === 'detail') {
    return <SkeletonJobDetail className={className} />;
  }

  if (layout === 'grid') {
    return (
      <div className={cn('space-y-6 p-6', className)}>
        <Skeleton className="h-8 w-48" />
        <SkeletonGrid items={9} columns={3} />
      </div>
    );
  }

  // Default layout
  return (
    <div className={cn('space-y-6 p-6', className)}>
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} variant="detailed" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} variant="compact" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ================================================
// EXPORTS
// ================================================

export const UnifiedSkeletonSystem = {
  // Base components
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonImage,

  // Card patterns
  SkeletonCard,

  // Page patterns
  SkeletonDashboard,
  SkeletonJobDetail,
  SkeletonPage,

  // Layout patterns
  SkeletonGrid,
  SkeletonList,
  SkeletonComponent,
};

export default UnifiedSkeletonSystem;
