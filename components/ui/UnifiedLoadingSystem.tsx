'use client';

import React, { memo, forwardRef } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ================================================
// UNIFIED LOADING SYSTEM - PRODUCTION READY
// ================================================
// Tek loading component tüm use case'leri destekler
// Replaces: UnifiedLoading, AdminLoadingSkeleton, AdminSpinnerLoading, LoadingCard, MarketplaceLoadingState

// Loading state types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type LoadingVariant =
  | 'spinner'
  | 'dots'
  | 'pulse'
  | 'skeleton'
  | 'progress'
  | 'wave';
export type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoadingSpeed = 'slow' | 'normal' | 'fast';

// Base loading props
interface BaseLoadingProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  speed?: LoadingSpeed;
  className?: string;
  text?: string;
  state?: LoadingState;
  color?: 'blue' | 'gray' | 'green' | 'red' | 'yellow' | 'purple';
}

// ================================================
// MAIN UNIFIED LOADING COMPONENT
// ================================================
const UnifiedLoadingComponent = forwardRef<HTMLDivElement, BaseLoadingProps>(
  (
    {
      variant = 'spinner',
      size = 'md',
      speed = 'normal',
      className,
      text,
      state = 'loading',
      color = 'blue',
    },
    ref
  ) => {
    const sizeClasses = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-10 w-10',
    };

    const textSizeClasses = {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    };

    const colorClasses = {
      blue: 'text-blue-600',
      gray: 'text-gray-600',
      green: 'text-green-600',
      red: 'text-red-600',
      yellow: 'text-yellow-600',
      purple: 'text-purple-600',
    };

    const speedClasses = {
      slow: 'duration-1000',
      normal: 'duration-700',
      fast: 'duration-300',
    };

    const getStateColor = () => {
      switch (state) {
        case 'success':
          return 'text-green-600';
        case 'error':
          return 'text-red-600';
        case 'loading':
          return colorClasses[color];
        default:
          return 'text-gray-600';
      }
    };

    const getIcon = () => {
      switch (state) {
        case 'loading':
          switch (variant) {
            case 'spinner':
              return (
                <Loader2
                  className={cn(
                    sizeClasses[size],
                    'animate-spin',
                    speedClasses[speed]
                  )}
                />
              );
            case 'dots':
              return <DotSpinner size={size} speed={speed} color={color} />;
            case 'pulse':
              return <PulseLoader size={size} speed={speed} color={color} />;
            case 'wave':
              return <WaveLoader size={size} speed={speed} color={color} />;
            case 'skeleton':
              return <SkeletonLoader size={size} className="w-24" />;
            case 'progress':
              return (
                <ProgressLoader
                  progress={0}
                  size={size}
                  color={color}
                  animated
                />
              );
            default:
              return (
                <Loader2
                  className={cn(
                    sizeClasses[size],
                    'animate-spin',
                    speedClasses[speed]
                  )}
                />
              );
          }
        case 'success':
          return <Check className={cn(sizeClasses[size], 'text-green-600')} />;
        case 'error':
          return <X className={cn(sizeClasses[size], 'text-red-600')} />;
        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center gap-2', className)}
      >
        {getIcon()}
        {text && (
          <span className={cn(textSizeClasses[size], getStateColor())}>
            {text}
          </span>
        )}
      </div>
    );
  }
);

UnifiedLoadingComponent.displayName = 'UnifiedLoading';
export const UnifiedLoading = memo(UnifiedLoadingComponent);

// ================================================
// SUB-COMPONENTS
// ================================================

// Dot spinner component
function DotSpinner({
  size,
  speed = 'normal',
  color = 'blue',
}: {
  size: LoadingSize;
  speed?: LoadingSpeed;
  color?: BaseLoadingProps['color'];
}) {
  const dotSize = {
    xs: 'h-0.5 w-0.5',
    sm: 'h-1 w-1',
    md: 'h-1.5 w-1.5',
    lg: 'h-2 w-2',
    xl: 'h-2.5 w-2.5',
  };

  const animationDuration = {
    slow: '1.6s',
    normal: '1.2s',
    fast: '0.8s',
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    gray: 'bg-gray-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
  };

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            dotSize[size],
            'animate-pulse rounded-full',
            colorClasses[color!]
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: animationDuration[speed],
          }}
        />
      ))}
    </div>
  );
}

// Pulse loader component
function PulseLoader({
  size,
  speed = 'normal',
  color = 'blue',
}: {
  size: LoadingSize;
  speed?: LoadingSpeed;
  color?: BaseLoadingProps['color'];
}) {
  const pulseSize = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10',
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    gray: 'bg-gray-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
  };

  const animationDuration = {
    slow: 'duration-1000',
    normal: 'duration-700',
    fast: 'duration-500',
  };

  return (
    <div
      className={cn(
        pulseSize[size],
        'animate-pulse rounded-full opacity-75',
        colorClasses[color!],
        animationDuration[speed]
      )}
    />
  );
}

// Wave loader component
function WaveLoader({
  size,
  speed = 'normal',
  color = 'blue',
}: {
  size: LoadingSize;
  speed?: LoadingSpeed;
  color?: BaseLoadingProps['color'];
}) {
  const barCount = 5;
  const barHeight = {
    xs: 'h-2',
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-6',
    xl: 'h-8',
  };

  const barWidth = {
    xs: 'w-0.5',
    sm: 'w-1',
    md: 'w-1',
    lg: 'w-1.5',
    xl: 'w-2',
  };

  const animationDuration = {
    slow: '1.2s',
    normal: '0.8s',
    fast: '0.5s',
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    gray: 'bg-gray-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
  };

  return (
    <div className="flex items-end space-x-0.5">
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            barWidth[size],
            barHeight[size],
            'animate-pulse rounded-sm',
            colorClasses[color!]
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: animationDuration[speed],
          }}
        />
      ))}
    </div>
  );
}

// Skeleton loader component
function SkeletonLoader({
  size,
  className,
  lines = 1,
}: {
  size: LoadingSize;
  className?: string;
  lines?: number;
}) {
  const skeletonHeight = {
    xs: 'h-3',
    sm: 'h-4',
    md: 'h-5',
    lg: 'h-6',
    xl: 'h-8',
  };

  if (lines === 1) {
    return (
      <div
        className={cn(
          'animate-pulse rounded bg-gray-200 dark:bg-gray-700',
          skeletonHeight[size],
          className
        )}
      />
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'animate-pulse rounded bg-gray-200 dark:bg-gray-700',
            skeletonHeight[size],
            index === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

// ================================================
// SPECIALIZED LOADING COMPONENTS
// ================================================

// Progress loader with percentage
interface ProgressLoaderProps {
  progress: number;
  size?: LoadingSize;
  className?: string;
  showPercentage?: boolean;
  color?: BaseLoadingProps['color'];
  animated?: boolean;
}

export const ProgressLoader = memo<ProgressLoaderProps>(
  ({
    progress,
    size = 'md',
    className,
    showPercentage = false,
    color = 'blue',
    animated = false,
  }) => {
    const sizeClasses = {
      xs: 'h-1',
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
      xl: 'h-5',
    };

    const colorClasses = {
      blue: 'bg-blue-600',
      gray: 'bg-gray-600',
      green: 'bg-green-600',
      red: 'bg-red-600',
      yellow: 'bg-yellow-600',
      purple: 'bg-purple-600',
    };

    const textSizeClasses = {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    };

    const progressValue = Math.min(100, Math.max(0, progress));

    return (
      <div className={cn('w-full', className)}>
        <div
          className={cn(
            'w-full rounded-full bg-gray-200 dark:bg-gray-700',
            sizeClasses[size]
          )}
        >
          <div
            className={cn(
              'rounded-full transition-all duration-300',
              sizeClasses[size],
              colorClasses[color],
              animated && 'animate-pulse'
            )}
            style={{ width: `${progressValue}%` }}
          />
        </div>
        {showPercentage && (
          <div className={cn('mt-1 text-center', textSizeClasses[size])}>
            {Math.round(progressValue)}%
          </div>
        )}
      </div>
    );
  }
);

ProgressLoader.displayName = 'ProgressLoader';

// Loading overlay for full screen
interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
  variant?: LoadingVariant;
  backdrop?: boolean;
  backdropBlur?: boolean;
  size?: LoadingSize;
  color?: BaseLoadingProps['color'];
}

export const LoadingOverlay = memo<LoadingOverlayProps>(
  ({
    visible,
    text = 'Yükleniyor...',
    variant = 'spinner',
    backdrop = true,
    backdropBlur = true,
    size = 'lg',
    color = 'blue',
  }) => {
    if (!visible) return null;

    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          backdrop && 'bg-black/50',
          backdropBlur && 'backdrop-blur-sm'
        )}
      >
        <div className="rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <UnifiedLoading
            variant={variant}
            size={size}
            text={text}
            color={color}
          />
        </div>
      </div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';

// Loading card for skeleton content
interface LoadingCardProps {
  lines?: number;
  showAvatar?: boolean;
  showImage?: boolean;
  imageHeight?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingCard = memo<LoadingCardProps>(
  ({
    lines = 3,
    showAvatar = false,
    showImage = false,
    imageHeight = 'md',
    className,
  }) => {
    const imageHeights = {
      sm: 'h-24',
      md: 'h-32',
      lg: 'h-48',
    };

    return (
      <div className={cn('animate-pulse rounded-lg border p-4', className)}>
        {showImage && (
          <div
            className={cn(
              'mb-4 w-full rounded bg-gray-200 dark:bg-gray-700',
              imageHeights[imageHeight]
            )}
          />
        )}

        {showAvatar && (
          <div className="mb-4 flex items-center">
            <div className="mr-3 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
              <div className="mb-2 h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        )}

        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-4 rounded bg-gray-200 dark:bg-gray-700',
                index === lines - 1 ? 'w-2/3' : 'w-full'
              )}
            />
          ))}
        </div>
      </div>
    );
  }
);

LoadingCard.displayName = 'LoadingCard';

// Loading page skeleton
interface LoadingPageSkeletonProps {
  hasHeader?: boolean;
  hasSidebar?: boolean;
  contentLines?: number;
  className?: string;
}

export const LoadingPageSkeleton = memo<LoadingPageSkeletonProps>(
  ({ hasHeader = true, hasSidebar = false, contentLines = 6, className }) => {
    return (
      <div className={cn('animate-pulse', className)}>
        {hasHeader && (
          <div className="mb-6 h-16 w-full rounded bg-gray-200 dark:bg-gray-700" />
        )}

        <div
          className={cn(
            'flex gap-6',
            hasSidebar ? 'grid-cols-4' : 'grid-cols-1'
          )}
        >
          {hasSidebar && (
            <div className="w-64 space-y-3">
              <div className="h-8 w-full rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-6 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          )}

          <div className="flex-1 space-y-4">
            {Array.from({ length: contentLines }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-6 rounded bg-gray-200 dark:bg-gray-700',
                  index % 3 === 2 ? 'w-3/4' : 'w-full'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

LoadingPageSkeleton.displayName = 'LoadingPageSkeleton';

// ================================================
// HOOKS
// ================================================

// Hook for managing loading states
export function useLoadingState(initialState: LoadingState = 'idle') {
  const [state, setState] = React.useState<LoadingState>(initialState);

  const setLoading = React.useCallback(() => setState('loading'), []);
  const setSuccess = React.useCallback(() => setState('success'), []);
  const setError = React.useCallback(() => setState('error'), []);
  const setIdle = React.useCallback(() => setState('idle'), []);

  const isLoading = state === 'loading';
  const isSuccess = state === 'success';
  const isError = state === 'error';
  const isIdle = state === 'idle';

  return {
    state,
    setState,
    setLoading,
    setSuccess,
    setError,
    setIdle,
    isLoading,
    isSuccess,
    isError,
    isIdle,
  };
}

// Export default
export { UnifiedLoading as default };

export const LoadingButton = ({
  loading = true,
  children,
  className,
  disabled,
  ...props
}: {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button disabled={disabled || loading} className={className} {...props}>
    {loading && <UnifiedLoading variant="spinner" size="sm" />}
    {children}
  </button>
);
