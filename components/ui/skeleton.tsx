/**
 * Skeleton Component
 *
 * Loading placeholder with pulse animation
 * Prevents layout shift during data loading
 *
 * @example
 * ```tsx
 * <Skeleton className="h-4 w-[250px]" />
 * <Skeleton className="h-12 w-12 rounded-full" />
 * ```
 */

import { cn } from '@/lib/utils';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('bg-muted animate-pulse rounded-md', className)}
      {...props}
    />
  );
}
