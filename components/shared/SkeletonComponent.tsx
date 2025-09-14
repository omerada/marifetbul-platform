'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: number | string;
  height?: number | string;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  animation = 'pulse',
}: SkeletonProps) {
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse',
    none: '',
  };

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-md',
  };

  const baseClasses = cn(
    'bg-gray-200 dark:bg-gray-700',
    variantClasses[variant],
    animationClasses[animation]
  );

  const inlineStyles: React.CSSProperties = {};

  if (width !== undefined) {
    inlineStyles.width = typeof width === 'number' ? `${width}px` : width;
  }

  if (height !== undefined) {
    inlineStyles.height = typeof height === 'number' ? `${height}px` : height;
  }

  // Default boyutlar variant'a göre
  const defaultClasses = {
    text: !width && !height ? 'h-4 w-full' : '',
    circular: !width && !height ? 'h-10 w-10' : '',
    rectangular: !width && !height ? 'h-32 w-full' : '',
    rounded: !width && !height ? 'h-4 w-full' : '',
  };

  return (
    <div
      className={cn(baseClasses, defaultClasses[variant], className)}
      style={inlineStyles}
      role="status"
      aria-label="Yükleniyor..."
    />
  );
}

export default Skeleton;
