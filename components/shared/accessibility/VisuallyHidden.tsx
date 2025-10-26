'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * VisuallyHidden - Hide content visually but keep it accessible to screen readers
 *
 * Content is:
 * - Hidden from sighted users
 * - Still in the DOM and accessible to screen readers
 * - Still keyboard navigable
 *
 * Use cases:
 * - Icon-only buttons (provide text label)
 * - Form labels that are visually represented by placeholders
 * - Additional context for screen reader users
 *
 * Usage:
 * ```tsx
 * <button>
 *   <SearchIcon />
 *   <VisuallyHidden>Search packages</VisuallyHidden>
 * </button>
 * ```
 *
 * @see https://www.a11yproject.com/posts/how-to-hide-content/
 */

interface VisuallyHiddenProps {
  /**
   * Content to hide visually
   */
  children: React.ReactNode;

  /**
   * HTML element to render (default: span)
   */
  as?: React.ElementType;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Whether to show content on focus (for skip links)
   */
  focusable?: boolean;
}

export function VisuallyHidden({
  children,
  as: Component = 'span',
  className,
  focusable = false,
}: VisuallyHiddenProps) {
  return (
    <Component
      className={cn('sr-only', focusable && 'focus:not-sr-only', className)}
    >
      {children}
    </Component>
  );
}

/**
 * ScreenReaderOnly - Alias for VisuallyHidden
 */
export const ScreenReaderOnly = VisuallyHidden;

/**
 * AriaLabel - Provides accessible label without visual text
 *
 * For simple icon buttons, prefer using aria-label attribute directly.
 * Use this component when you need conditional or complex labels.
 *
 * Usage:
 * ```tsx
 * <button>
 *   <HeartIcon />
 *   <AriaLabel>
 *     {isFavorited ? 'Remove from favorites' : 'Add to favorites'}
 *   </AriaLabel>
 * </button>
 * ```
 */
interface AriaLabelProps {
  children: string;
}

export function AriaLabel({ children }: AriaLabelProps) {
  return <VisuallyHidden>{children}</VisuallyHidden>;
}

/**
 * RequiredIndicator - Accessible required field indicator
 *
 * Shows asterisk visually and announces "required" to screen readers.
 *
 * Usage:
 * ```tsx
 * <label htmlFor="email">
 *   Email Address
 *   <RequiredIndicator />
 * </label>
 * <input id="email" required aria-required="true" />
 * ```
 */
export function RequiredIndicator() {
  return (
    <span className="ml-1 text-red-500" aria-hidden="true">
      *<VisuallyHidden>required</VisuallyHidden>
    </span>
  );
}

/**
 * LoadingIndicator - Accessible loading state
 *
 * Shows visual spinner and announces loading state to screen readers.
 *
 * Usage:
 * ```tsx
 * {isLoading && <LoadingIndicator text="Loading packages" />}
 * ```
 */
interface LoadingIndicatorProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingIndicator({
  text = 'Loading',
  size = 'md',
  className,
}: LoadingIndicatorProps) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn('flex items-center justify-center', className)}
    >
      <div
        className={cn(
          'border-primary animate-spin rounded-full border-t-transparent',
          sizes[size]
        )}
        aria-hidden="true"
      />
      <VisuallyHidden>{text}...</VisuallyHidden>
    </div>
  );
}

export default VisuallyHidden;
