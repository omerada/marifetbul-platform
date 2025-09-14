// Unified Loading components - PRODUCTION READY VERSION
import React, { memo } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Loading types
export type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'skeleton';
export type LoadingSize = 'sm' | 'md' | 'lg';
export type LoadingState = 'loading' | 'success' | 'error' | 'idle';

// Base loading props
interface BaseLoadingProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  className?: string;
  text?: string;
  state?: LoadingState;
}

// Main unified loading component - OPTIMIZED WITH MEMO
const UnifiedLoadingComponent = ({
  variant = 'spinner',
  size = 'md',
  className,
  text,
  state = 'loading',
}: BaseLoadingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const getStateColor = () => {
    switch (state) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const getIcon = () => {
    switch (state) {
      case 'loading':
        switch (variant) {
          case 'spinner':
            return (
              <Loader2 className={cn(sizeClasses[size], 'animate-spin')} />
            );
          case 'dots':
            return <DotSpinner size={size} />;
          case 'pulse':
            return <PulseLoader size={size} />;
          case 'skeleton':
            return <SkeletonLoader size={size} />;
          default:
            return (
              <Loader2 className={cn(sizeClasses[size], 'animate-spin')} />
            );
        }
      case 'success':
        return <Check className={cn(sizeClasses[size], 'text-green-600')} />;
      case 'error':
        return (
          <AlertCircle className={cn(sizeClasses[size], 'text-red-600')} />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {getIcon()}
      {text && (
        <span className={cn(textSizeClasses[size], getStateColor())}>
          {text}
        </span>
      )}
    </div>
  );
};

export const UnifiedLoading = memo(UnifiedLoadingComponent);

// Dot spinner component
function DotSpinner({ size }: { size: LoadingSize }) {
  const dotSize = {
    sm: 'h-1 w-1',
    md: 'h-1.5 w-1.5',
    lg: 'h-2 w-2',
  };

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(dotSize[size], 'animate-pulse rounded-full bg-current')}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s',
          }}
        />
      ))}
    </div>
  );
}

// Pulse loader component
function PulseLoader({ size }: { size: LoadingSize }) {
  const pulseSize = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      className={cn(
        pulseSize[size],
        'animate-pulse rounded-full bg-current opacity-75'
      )}
    />
  );
}

// Skeleton loader component
function SkeletonLoader({ size }: { size: LoadingSize }) {
  const skeletonSize = {
    sm: 'h-4 w-16',
    md: 'h-6 w-24',
    lg: 'h-8 w-32',
  };

  return (
    <div
      className={cn(
        skeletonSize[size],
        'animate-pulse rounded bg-gray-200 dark:bg-gray-700'
      )}
    />
  );
}

// Loading button component
interface LoadingButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function LoadingButton({
  children,
  loading = false,
  success = false,
  error = false,
  loadingText = 'Yükleniyor...',
  successText = 'Başarılı!',
  errorText = 'Hata!',
  className,
  onClick,
  disabled,
  type = 'button',
}: LoadingButtonProps) {
  const getContent = () => {
    if (loading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      );
    }
    if (success) {
      return (
        <>
          <Check className="mr-2 h-4 w-4" />
          {successText}
        </>
      );
    }
    if (error) {
      return (
        <>
          <AlertCircle className="mr-2 h-4 w-4" />
          {errorText}
        </>
      );
    }
    return children;
  };

  const getButtonStyle = () => {
    if (success) return 'bg-green-600 hover:bg-green-700 text-white';
    if (error) return 'bg-red-600 hover:bg-red-700 text-white';
    return 'bg-blue-600 hover:bg-blue-700 text-white';
  };

  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2 font-medium transition-colors',
        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-50',
        getButtonStyle(),
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {getContent()}
    </button>
  );
}

// Loading overlay for full screen
interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
  variant?: LoadingVariant;
  backdrop?: boolean;
}

export function LoadingOverlay({
  visible,
  text = 'Yükleniyor...',
  variant = 'spinner',
  backdrop = true,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        backdrop && 'bg-black/50 backdrop-blur-sm'
      )}
    >
      <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <UnifiedLoading variant={variant} size="lg" text={text} />
      </div>
    </div>
  );
}

// Loading card for skeleton content
interface LoadingCardProps {
  lines?: number;
  showAvatar?: boolean;
  showImage?: boolean;
  className?: string;
}

export function LoadingCard({
  lines = 3,
  showAvatar = false,
  showImage = false,
  className,
}: LoadingCardProps) {
  return (
    <div className={cn('animate-pulse rounded-lg border p-4', className)}>
      {showImage && <div className="mb-4 h-32 w-full rounded bg-gray-200" />}

      {showAvatar && (
        <div className="mb-4 flex items-center">
          <div className="mr-3 h-10 w-10 rounded-full bg-gray-200" />
          <div className="flex-1">
            <div className="mb-2 h-4 w-1/3 rounded bg-gray-200" />
            <div className="h-3 w-1/4 rounded bg-gray-200" />
          </div>
        </div>
      )}

      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-4 rounded bg-gray-200',
              index === lines - 1 ? 'w-2/3' : 'w-full'
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Progress loader with percentage
interface ProgressLoaderProps {
  progress: number;
  size?: LoadingSize;
  className?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

export function ProgressLoader({
  progress,
  size = 'md',
  className,
  showPercentage = true,
  color = 'blue',
}: ProgressLoaderProps) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full rounded-full bg-gray-200', sizeClasses[size])}>
        <div
          className={cn(
            'rounded-full transition-all duration-300',
            sizeClasses[size],
            colorClasses[color]
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showPercentage && (
        <div className={cn('mt-1 text-center', textSizeClasses[size])}>
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}

// Export all components
export { DotSpinner, PulseLoader, SkeletonLoader };
export default UnifiedLoadingComponent;
