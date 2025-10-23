/**
 * ================================================
 * RATING STARS COMPONENT
 * ================================================
 * Interactive star rating display and input component
 * Supports read-only and interactive modes
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint
 */

'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  /**
   * Current rating value (1-5)
   */
  value: number;

  /**
   * Callback when rating changes (interactive mode)
   */
  onChange?: (value: number) => void;

  /**
   * Read-only mode (no interaction)
   */
  readonly?: boolean;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Show rating number next to stars
   */
  showValue?: boolean;

  /**
   * Custom className
   */
  className?: string;

  /**
   * Show half stars (for display only)
   */
  allowHalf?: boolean;
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

export function RatingStars({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
  className,
  allowHalf = false,
}: RatingStarsProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const isInteractive = !readonly && onChange;
  const displayValue = hoverValue ?? value;

  const handleClick = (starValue: number) => {
    if (isInteractive) {
      onChange?.(starValue);
    }
  };

  const handleMouseEnter = (starValue: number) => {
    if (isInteractive) {
      setHoverValue(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (isInteractive) {
      setHoverValue(null);
    }
  };

  const renderStar = (index: number) => {
    const starValue = index + 1;
    const isFilled = displayValue >= starValue;
    const isHalfFilled =
      allowHalf && displayValue >= starValue - 0.5 && displayValue < starValue;

    return (
      <button
        key={index}
        type="button"
        onClick={() => handleClick(starValue)}
        onMouseEnter={() => handleMouseEnter(starValue)}
        onMouseLeave={handleMouseLeave}
        disabled={!isInteractive}
        className={cn(
          'relative transition-all',
          isInteractive && 'cursor-pointer hover:scale-110',
          !isInteractive && 'cursor-default'
        )}
        aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
      >
        <Star
          className={cn(
            sizeClasses[size],
            'transition-colors',
            isFilled
              ? 'fill-yellow-400 text-yellow-400'
              : isHalfFilled
                ? 'fill-yellow-400/50 text-yellow-400'
                : 'fill-none text-gray-300',
            isInteractive && hoverValue !== null && 'text-yellow-400'
          )}
        />
      </button>
    );
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => renderStar(index))}
      </div>

      {showValue && (
        <span
          className={cn('font-semibold text-gray-700', textSizeClasses[size])}
        >
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

/**
 * ================================================
 * RATING CATEGORY COMPONENT
 * ================================================
 * Single rating category with label and stars
 */

interface RatingCategoryProps {
  label: string;
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  required?: boolean;
}

export function RatingCategory({
  label,
  value,
  onChange,
  readonly = false,
  required = false,
}: RatingCategoryProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <RatingStars
        value={value}
        onChange={onChange}
        readonly={readonly}
        size="lg"
      />
    </div>
  );
}

/**
 * ================================================
 * RATING SUMMARY COMPONENT
 * ================================================
 * Compact rating display with average and count
 */

interface RatingSummaryProps {
  averageRating: number;
  totalReviews: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingSummary({
  averageRating,
  totalReviews,
  size = 'md',
  className,
}: RatingSummaryProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <RatingStars value={averageRating} readonly size={size} allowHalf />
      <div className={cn('flex items-baseline gap-1', textSizeClasses[size])}>
        <span className="font-bold text-gray-900">
          {averageRating.toFixed(1)}
        </span>
        <span className="text-gray-500">({totalReviews} değerlendirme)</span>
      </div>
    </div>
  );
}
