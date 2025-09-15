'use client';

import React, { ReactNode } from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { usePullToRefresh } from '@/hooks';
import { useHapticFeedback } from '@/hooks';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
  enabled?: boolean;
  className?: string;
  refreshText?: string;
  releaseText?: string;
  loadingText?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  resistance = 2.5,
  enabled = true,
  className,
  refreshText = 'Yenilemek için çekin',
  releaseText = 'Yenilemek için bırakın',
  loadingText = 'Yenileniyor...',
}: PullToRefreshProps) {
  const { triggerHaptic } = useHapticFeedback();

  const { isRefreshing, pullDistance, canRefresh, bindToElement } =
    usePullToRefresh({
      onRefresh: async () => {
        triggerHaptic('impact', 'medium');
        await onRefresh();
      },
      threshold,
      resistance,
      enabled,
    });

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldShowIndicator = pullDistance > 10;

  const getIndicatorText = () => {
    if (isRefreshing) return loadingText;
    if (canRefresh) return releaseText;
    return refreshText;
  };

  const getIndicatorIcon = () => {
    if (isRefreshing) {
      return (
        <RefreshCw
          className={cn(
            'h-5 w-5 transition-transform duration-200',
            'animate-spin text-blue-600'
          )}
        />
      );
    }

    return (
      <ChevronDown
        className={cn(
          'h-5 w-5 text-gray-600 transition-all duration-200',
          canRefresh && 'rotate-180 text-blue-600'
        )}
        style={{
          transform: `rotate(${canRefresh ? 180 : Math.min(progress * 180, 180)}deg)`,
        }}
      />
    );
  };

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      ref={bindToElement}
    >
      {/* Pull-to-refresh indicator */}
      <div
        className={cn(
          'absolute top-0 right-0 left-0 z-10 bg-white',
          'flex items-center justify-center',
          'transition-all duration-300 ease-out',
          'border-b border-gray-100',
          shouldShowIndicator ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          height: `${Math.max(pullDistance, 0)}px`,
          transform: `translateY(-${Math.max(threshold - pullDistance, 0)}px)`,
        }}
      >
        <div className="flex flex-col items-center space-y-2 py-2">
          {/* Progress circle */}
          <div className="relative">
            <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32">
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="none"
                stroke="rgb(229, 231, 235)"
                strokeWidth="2"
              />
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="none"
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * 12}`}
                strokeDashoffset={`${2 * Math.PI * 12 * (1 - progress)}`}
                strokeLinecap="round"
                className="transition-all duration-200"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {getIndicatorIcon()}
            </div>
          </div>

          {/* Status text */}
          <span
            className={cn(
              'text-xs font-medium transition-colors duration-200',
              canRefresh ? 'text-blue-600' : 'text-gray-600',
              isRefreshing && 'text-blue-600'
            )}
          >
            {getIndicatorText()}
          </span>
        </div>
      </div>

      {/* Content with pull transform */}
      <div
        className={cn(
          'transition-transform duration-200 ease-out',
          enabled && pullDistance > 0 && 'will-change-transform'
        )}
        style={{
          transform: enabled
            ? `translateY(${Math.max(pullDistance, 0)}px)`
            : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Enhanced version with custom animations
interface AnimatedPullToRefreshProps extends PullToRefreshProps {
  animationType?: 'default' | 'elastic' | 'bounce';
  showProgressBar?: boolean;
}

export function AnimatedPullToRefresh({
  animationType = 'default',
  showProgressBar = false,
  ...props
}: AnimatedPullToRefreshProps) {
  const animationClasses = {
    default: 'ease-out',
    elastic: 'ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]',
    bounce: 'ease-[cubic-bezier(0.68,-0.6,0.32,1.6)]',
  };

  return (
    <div className="relative">
      {showProgressBar && (
        <div className="absolute top-0 right-0 left-0 z-20 h-1 bg-gray-100">
          <div
            className="h-full bg-blue-500 transition-all duration-200"
            style={{
              width: `${Math.min(100, 100)}%`,
            }}
          />
        </div>
      )}

      <PullToRefresh
        {...props}
        className={cn(
          props.className,
          `transition-transform duration-300 ${animationClasses[animationType]}`
        )}
      />
    </div>
  );
}

// Hook for easy integration
export function usePullToRefreshComponent(onRefresh: () => Promise<void>) {
  return {
    PullToRefreshWrapper: ({
      children,
      ...props
    }: Omit<PullToRefreshProps, 'onRefresh'>) => (
      <PullToRefresh onRefresh={onRefresh} {...props}>
        {children}
      </PullToRefresh>
    ),
  };
}
