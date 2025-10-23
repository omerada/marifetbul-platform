/**
 * ================================================
 * RATING DISTRIBUTION COMPONENT
 * ================================================
 * Visual bar chart showing rating distribution (1-5 stars)
 * Shows percentage breakdown of ratings
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint
 */

'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReviewStats } from '@/types/business/review';

interface RatingDistributionProps {
  stats: ReviewStats;
  onFilterByRating?: (rating: number) => void;
  className?: string;
}

export function RatingDistribution({
  stats,
  onFilterByRating,
  className,
}: RatingDistributionProps) {
  const { totalReviews, ratingDistribution } = stats;

  // Calculate percentages
  const distribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = ratingDistribution[rating] || 0;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { rating, count, percentage };
  });

  const handleClick = (rating: number) => {
    if (onFilterByRating) {
      onFilterByRating(rating);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="mb-3 text-sm font-semibold text-gray-900">
        Değerlendirme Dağılımı
      </h3>

      {distribution.map(({ rating, count, percentage }) => (
        <button
          key={rating}
          type="button"
          onClick={() => handleClick(rating)}
          disabled={!onFilterByRating || count === 0}
          className={cn(
            'group flex w-full items-center gap-3',
            onFilterByRating && count > 0
              ? 'cursor-pointer rounded-lg transition-colors hover:bg-gray-50'
              : 'cursor-default'
          )}
        >
          {/* Rating Label */}
          <div className="flex w-16 flex-shrink-0 items-center gap-1">
            <span className="text-sm font-medium text-gray-700">{rating}</span>
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          </div>

          {/* Progress Bar */}
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
            <div
              className={cn(
                'h-full bg-yellow-400 transition-all',
                onFilterByRating && count > 0 && 'group-hover:bg-yellow-500'
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Count */}
          <span className="w-12 text-right text-sm text-gray-600">{count}</span>
        </button>
      ))}

      {/* Summary */}
      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Toplam Değerlendirme</span>
          <span className="font-semibold text-gray-900">{totalReviews}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * ================================================
 * RATING BREAKDOWN COMPONENT
 * ================================================
 * Detailed breakdown of all rating categories
 */

interface RatingBreakdownProps {
  stats: ReviewStats;
  className?: string;
}

export function RatingBreakdown({ stats, className }: RatingBreakdownProps) {
  const categories = [
    { label: 'İletişim', value: stats.communicationAvg },
    { label: 'Kalite', value: stats.qualityAvg },
    { label: 'Teslimat', value: stats.deliveryAvg },
  ];

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="mb-3 text-sm font-semibold text-gray-900">
        Kategori Ortalamaları
      </h3>

      {categories.map((category) => (
        <div key={category.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{category.label}</span>
            <span className="font-semibold text-gray-900">
              {category.value.toFixed(1)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${(category.value / 5) * 100}%` }}
            />
          </div>
        </div>
      ))}

      {/* Verified Purchase Badge */}
      {stats.verifiedPurchaseCount > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{stats.verifiedPurchaseCount} Doğrulanmış Alım</span>
          </div>
        </div>
      )}
    </div>
  );
}
