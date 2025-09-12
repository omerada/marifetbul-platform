'use client';

import { cn } from '@/lib/utils';
import {
  HTMLAttributes,
  ReactNode,
  useEffect,
  useState,
  useCallback,
} from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost' | 'gradient';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  touchOptimized?: boolean;
  hapticFeedback?: boolean;
  loading?: boolean;
  disabled?: boolean;
  asChild?: boolean;
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({
  variant = 'default',
  padding = 'md',
  size = 'md',
  interactive = false,
  touchOptimized = false,
  hapticFeedback = false,
  loading = false,
  disabled = false,
  className,
  children,
  onClick,
  ...props
}: CardProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const triggerImpact = useCallback(
    (intensity: 'light' | 'medium' | 'heavy') => {
      if (typeof window === 'undefined') return;

      try {
        if ('vibrate' in navigator) {
          const vibrationPatterns = {
            light: [10],
            medium: [20],
            heavy: [30],
          };
          navigator.vibrate(vibrationPatterns[intensity]);
        }
      } catch (error) {
        // Silently fail if haptic feedback is not supported
      }
    },
    []
  );

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const shouldOptimizeForTouch =
    touchOptimized || (mounted && (isMobile || isTouchDevice));

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || loading) return;

    if (hapticFeedback && interactive && mounted) {
      triggerImpact('light');
    }

    onClick?.(e);
  };

  const baseClasses = cn(
    'rounded-lg bg-white transition-all duration-200',
    interactive && 'cursor-pointer',
    shouldOptimizeForTouch && interactive && 'touch-manipulation',
    disabled && 'opacity-50 cursor-not-allowed',
    loading && 'pointer-events-none'
  );

  const variantClasses = {
    default: 'border border-gray-200',
    elevated: 'shadow-md hover:shadow-lg',
    outlined: 'border-2 border-gray-300',
    ghost: 'border-0 shadow-none bg-transparent',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200',
  };

  const paddingClasses = {
    none: '',
    xs: 'p-2',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const interactiveClasses = interactive
    ? cn(
        'hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        shouldOptimizeForTouch && 'active:scale-98 active:shadow-sm',
        !shouldOptimizeForTouch && 'hover:transform hover:scale-[1.02]'
      )
    : '';

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        sizeClasses[size],
        interactiveClasses,
        className
      )}
      onClick={interactive ? handleClick : onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive && !disabled ? 0 : undefined}
      aria-disabled={disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: CardHeaderProps) {
  return (
    <h3
      className={cn(
        'text-lg leading-none font-semibold tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: CardContentProps) {
  return (
    <div className={cn('mb-4 last:mb-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn('mt-4 flex items-center justify-between', className)}
      {...props}
    >
      {children}
    </div>
  );
}
