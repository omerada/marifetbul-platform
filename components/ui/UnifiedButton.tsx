'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import {
  ButtonHTMLAttributes,
  ReactNode,
  useCallback,
  useState,
  useEffect,
  forwardRef,
} from 'react';

// ================================================
// UNIFIED BUTTON COMPONENT - PRODUCTION READY
// ================================================
// Tüm button use case'lerini destekleyen tek, kapsamlı component
// Replaces: ActionButton, SubmitButton, ve diğer button variants

interface UnifiedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // Appearance
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'destructive'
    | 'success'
    | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  // State
  loading?: boolean;
  success?: boolean;
  error?: boolean;

  // Icons & Content
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loadingIcon?: ReactNode;

  // Layout
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';

  // Interaction
  hapticFeedback?: boolean;
  hapticIntensity?: 'light' | 'medium' | 'heavy';

  // Loading states with custom texts
  loadingText?: string;
  successText?: string;
  errorText?: string;

  // Animation
  animatePress?: boolean;
  animationDuration?: 'fast' | 'normal' | 'slow';
}

export const UnifiedButton = forwardRef<HTMLButtonElement, UnifiedButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      success = false,
      error = false,
      leftIcon,
      rightIcon,
      loadingIcon,
      fullWidth = false,
      rounded = 'md',
      hapticFeedback = true,
      hapticIntensity = 'light',
      loadingText,
      successText,
      errorText,
      animatePress = true,
      animationDuration = 'normal',
      children,
      className,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const [mounted, setMounted] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const triggerHapticFeedback = useCallback(
      (intensity: 'light' | 'medium' | 'heavy') => {
        if (typeof window === 'undefined' || !hapticFeedback) return;

        try {
          if ('vibrate' in navigator) {
            const vibrationPatterns = {
              light: [10],
              medium: [20],
              heavy: [30],
            };
            navigator.vibrate(vibrationPatterns[intensity]);
          }
        } catch {
          // Silently fail if haptic feedback is not supported
        }
      },
      [hapticFeedback]
    );

    useEffect(() => {
      setMounted(true);
    }, []);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (hapticFeedback && !disabled && !loading && mounted) {
        triggerHapticFeedback(hapticIntensity);
      }

      if (animatePress) {
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 150);
      }

      onClick?.(e);
    };

    // Base classes
    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'font-medium',
      'transition-all',
      'duration-200',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-offset-2',
      'disabled:pointer-events-none',
      'disabled:opacity-50',
      'select-none',
    ];

    // Variant styles
    const variantClasses = {
      primary: [
        'bg-blue-600',
        'text-white',
        'hover:bg-blue-700',
        'active:bg-blue-800',
        'focus-visible:ring-blue-500',
        'shadow-sm',
        'hover:shadow-md',
      ],
      secondary: [
        'bg-gray-100',
        'text-gray-900',
        'hover:bg-gray-200',
        'active:bg-gray-300',
        'focus-visible:ring-gray-500',
        'border',
        'border-gray-200',
        'hover:border-gray-300',
      ],
      outline: [
        'border',
        'border-gray-300',
        'bg-transparent',
        'text-gray-700',
        'hover:bg-gray-50',
        'active:bg-gray-100',
        'focus-visible:ring-blue-500',
        'hover:border-gray-400',
      ],
      ghost: [
        'bg-transparent',
        'text-gray-700',
        'hover:bg-gray-100',
        'active:bg-gray-200',
        'focus-visible:ring-blue-500',
      ],
      destructive: [
        'bg-red-600',
        'text-white',
        'hover:bg-red-700',
        'active:bg-red-800',
        'focus-visible:ring-red-500',
        'shadow-sm',
        'hover:shadow-md',
      ],
      success: [
        'bg-green-600',
        'text-white',
        'hover:bg-green-700',
        'active:bg-green-800',
        'focus-visible:ring-green-500',
        'shadow-sm',
        'hover:shadow-md',
      ],
      warning: [
        'bg-yellow-500',
        'text-white',
        'hover:bg-yellow-600',
        'active:bg-yellow-700',
        'focus-visible:ring-yellow-500',
        'shadow-sm',
        'hover:shadow-md',
      ],
    };

    // Size classes
    const sizeClasses = {
      xs: ['h-6', 'px-2', 'text-xs', 'gap-1'],
      sm: ['h-8', 'px-3', 'text-sm', 'gap-1.5'],
      md: ['h-10', 'px-4', 'text-sm', 'gap-2'],
      lg: ['h-11', 'px-6', 'text-base', 'gap-2'],
      xl: ['h-12', 'px-8', 'text-lg', 'gap-2.5'],
    };

    // Rounded classes
    const roundedClasses = {
      none: [],
      sm: ['rounded-sm'],
      md: ['rounded-md'],
      lg: ['rounded-lg'],
      full: ['rounded-full'],
    };

    // Animation classes
    const animationClasses = {
      fast: ['duration-100'],
      normal: ['duration-200'],
      slow: ['duration-300'],
    };

    // State-specific variants
    const getStateVariant = () => {
      if (success) return 'success';
      if (error) return 'destructive';
      return variant;
    };

    // Content logic
    const getContent = () => {
      const stateIcon = loading
        ? loadingIcon || <Loader2 className="animate-spin" />
        : success
          ? leftIcon
          : error
            ? leftIcon
            : leftIcon;

      const stateText = loading
        ? loadingText
        : success
          ? successText
          : error
            ? errorText
            : children;

      return (
        <>
          {stateIcon && !rightIcon && (
            <span
              className={cn(
                size === 'xs'
                  ? 'h-3 w-3'
                  : size === 'sm'
                    ? 'h-4 w-4'
                    : 'h-4 w-4'
              )}
            >
              {stateIcon}
            </span>
          )}
          {stateText && <span>{stateText}</span>}
          {rightIcon && !loading && (
            <span
              className={cn(
                size === 'xs'
                  ? 'h-3 w-3'
                  : size === 'sm'
                    ? 'h-4 w-4'
                    : 'h-4 w-4'
              )}
            >
              {rightIcon}
            </span>
          )}
        </>
      );
    };

    const currentVariant = getStateVariant();

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[currentVariant],
          sizeClasses[size],
          roundedClasses[rounded],
          animationClasses[animationDuration],
          fullWidth && 'w-full',
          animatePress && isPressed && 'scale-95',
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {getContent()}
      </button>
    );
  }
);

UnifiedButton.displayName = 'UnifiedButton';

// Export legacy Button for compatibility
export const Button = UnifiedButton;

// Convenience components for common use cases
export const PrimaryButton = forwardRef<
  HTMLButtonElement,
  Omit<UnifiedButtonProps, 'variant'>
>((props, ref) => <UnifiedButton ref={ref} variant="primary" {...props} />);

export const SecondaryButton = forwardRef<
  HTMLButtonElement,
  Omit<UnifiedButtonProps, 'variant'>
>((props, ref) => <UnifiedButton ref={ref} variant="secondary" {...props} />);

export const DestructiveButton = forwardRef<
  HTMLButtonElement,
  Omit<UnifiedButtonProps, 'variant'>
>((props, ref) => <UnifiedButton ref={ref} variant="destructive" {...props} />);

export const LoadingButton = forwardRef<HTMLButtonElement, UnifiedButtonProps>(
  ({ loading = true, loadingText = 'Yükleniyor...', ...props }, ref) => (
    <UnifiedButton
      ref={ref}
      loading={loading}
      loadingText={loadingText}
      {...props}
    />
  )
);

PrimaryButton.displayName = 'PrimaryButton';
SecondaryButton.displayName = 'SecondaryButton';
DestructiveButton.displayName = 'DestructiveButton';
LoadingButton.displayName = 'LoadingButton';

export default UnifiedButton;
