import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export function Loading({
  size = 'md',
  text,
  fullScreen = false,
  className,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const content = (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <Loader2
        className={cn('animate-spin text-blue-600', sizeClasses[size])}
      />
      {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-white">
        {content}
      </div>
    );
  }

  return content;
}

// Skeleton loading components
export function LoadingSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  );
}

export function LoadingCard() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="space-y-4">
        <LoadingSkeleton className="h-4 w-3/4" />
        <LoadingSkeleton className="h-4 w-1/2" />
        <LoadingSkeleton className="h-20 w-full" />
        <div className="flex space-x-2">
          <LoadingSkeleton className="h-6 w-16" />
          <LoadingSkeleton className="h-6 w-16" />
          <LoadingSkeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

export function LoadingText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
}
