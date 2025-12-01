'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  HTMLAttributes,
  ReactNode,
  useEffect,
  useState,
  useCallback,
  forwardRef,
} from 'react';

// ================================================
// CLEAN BASE CARD COMPONENT
// ================================================
// Simple, focused, reusable card component following SRP

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

// ================================================
// HOOKS
// ================================================

function useHapticFeedback() {
  const triggerImpact = useCallback(
    (intensity: 'light' | 'medium' | 'heavy') => {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const duration =
          intensity === 'light' ? 10 : intensity === 'medium' ? 25 : 50;
        navigator.vibrate(duration);
      }
    },
    []
  );

  return { triggerImpact };
}

// ================================================
// UTILITY COMPONENTS

// ================================================
// MAIN COMPONENTS
// ================================================

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
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
    },
    ref
  ) => {
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const { triggerImpact } = useHapticFeedback();

    useEffect(() => {
      setMounted(true);
      setIsMobile(window.innerWidth < 768);
      setIsTouchDevice(
        'ontouchstart' in window || navigator.maxTouchPoints > 0
      );
    }, []);

    const shouldOptimizeForTouch =
      touchOptimized || (mounted && (isMobile || isTouchDevice));

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled || loading) return;

        if (hapticFeedback && interactive && mounted) {
          triggerImpact('light');
        }

        onClick?.(e);
      },
      [
        disabled,
        loading,
        hapticFeedback,
        interactive,
        mounted,
        onClick,
        triggerImpact,
      ]
    );

    const baseClasses = cn(
      'rounded-lg bg-card text-card-foreground transition-all duration-200',
      interactive && 'cursor-pointer hover:shadow-md',
      shouldOptimizeForTouch && interactive && 'active:scale-[0.98]',
      loading && 'opacity-50 pointer-events-none',
      disabled && 'opacity-50 cursor-not-allowed',

      // Variant styles
      {
        'border border-border shadow-sm': variant === 'default',
        'border border-border shadow-lg': variant === 'elevated',
        'border-2 border-border': variant === 'outlined',
        'border-none shadow-none bg-transparent': variant === 'ghost',
        'bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20':
          variant === 'gradient',
      },

      // Padding styles
      {
        'p-0': padding === 'none',
        'p-2': padding === 'xs',
        'p-3': padding === 'sm',
        'p-4': padding === 'md',
        'p-6': padding === 'lg',
        'p-8': padding === 'xl',
      },

      // Size styles
      {
        'min-h-[120px]': size === 'sm',
        'min-h-[160px]': size === 'md',
        'min-h-[200px]': size === 'lg',
      },

      className
    );

    if (loading) {
      return (
        <div ref={ref} className={baseClasses} {...props}>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className={baseClasses} onClick={handleClick} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

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

export function CardDescription({
  className,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <p className={cn('text-muted-foreground text-sm', className)} {...props}>
      {children}
    </p>
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
