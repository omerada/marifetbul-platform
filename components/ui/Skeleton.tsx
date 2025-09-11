import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gradient-to-r from-gray-100 via-blue-50 to-gray-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',
        className
      )}
    />
  );
}
