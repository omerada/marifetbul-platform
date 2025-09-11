import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-muted animate-pulse rounded-md bg-gray-200 dark:bg-gray-800',
        className
      )}
    />
  );
}
