/**
 * OrderReviewButton Component
 * Displays a context-aware button for reviewing completed orders
 * Handles eligibility checks and various states (loading, disabled, error)
 */

'use client';

import React from 'react';
import { Star, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useReviewEligibility } from '@/hooks/business/useReviewEligibility';
import { useRouter } from 'next/navigation';

export interface OrderReviewButtonProps {
  orderId: string;
  orderStatus: string;
  orderTitle?: string;
  completedAt?: string;
  hasExistingReview?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onReviewStart?: () => void;
}

export function OrderReviewButton({
  orderId,
  orderStatus,
  orderTitle,
  completedAt,
  hasExistingReview = false,
  variant = 'primary',
  size = 'md',
  className = '',
  onReviewStart,
}: OrderReviewButtonProps) {
  const router = useRouter();
  const { canReview, isLoading, error } = useReviewEligibility({
    orderId,
    enabled: orderStatus === 'completed' && !hasExistingReview,
  });

  const handleClick = () => {
    if (onReviewStart) {
      onReviewStart();
    } else {
      router.push(`/dashboard/orders/${orderId}/review`);
    }
  };

  // Don't show button if order is not completed
  if (orderStatus !== 'completed') {
    return null;
  }

  // If user has already reviewed
  if (hasExistingReview) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span>Değerlendirme yapıldı</span>
      </div>
    );
  }

  // If still loading eligibility
  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Clock className="mr-2 h-4 w-4 animate-spin" />
        Kontrol ediliyor...
      </Button>
    );
  }

  // If there's an error checking eligibility
  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <AlertCircle className="h-4 w-4" />
        <span className="text-xs">{error}</span>
      </div>
    );
  }

  // If user cannot review (reasons determined by backend)
  if (!canReview) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <AlertCircle className="h-4 w-4" />
        <span>Değerlendirme yapılamıyor</span>
      </div>
    );
  }

  // Calculate days since completion for urgency indicator
  const daysSinceCompletion = completedAt
    ? Math.floor(
        (Date.now() - new Date(completedAt).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  // Show urgency if more than 7 days have passed
  const showUrgency = daysSinceCompletion > 7;

  return (
    <div className="space-y-2">
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={`w-full ${className}`}
      >
        <Star className="mr-2 h-4 w-4" />
        Değerlendirme Yap
      </Button>
      {showUrgency && daysSinceCompletion <= 30 && (
        <div className="flex items-center gap-2 text-xs text-orange-600">
          <Clock className="h-3 w-3" />
          <span>
            {30 - daysSinceCompletion} gün içinde değerlendirme yapabilirsiniz
          </span>
        </div>
      )}
      {orderTitle && (
        <div className="line-clamp-1 text-center text-xs text-gray-500">
          {orderTitle}
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for use in lists and cards
 */
export function OrderReviewButtonCompact({
  orderId,
  orderStatus,
  hasExistingReview = false,
  onReviewStart,
}: Pick<
  OrderReviewButtonProps,
  'orderId' | 'orderStatus' | 'hasExistingReview' | 'onReviewStart'
>) {
  const router = useRouter();
  const { canReview, isLoading } = useReviewEligibility({
    orderId,
    enabled: orderStatus === 'completed' && !hasExistingReview,
  });

  const handleClick = () => {
    if (onReviewStart) {
      onReviewStart();
    } else {
      router.push(`/dashboard/orders/${orderId}/review`);
    }
  };

  if (orderStatus !== 'completed') return null;
  if (hasExistingReview) {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600">
        <CheckCircle className="h-3 w-3" />
        Değerlendirildi
      </span>
    );
  }

  if (isLoading) {
    return (
      <span className="flex items-center gap-1 text-xs text-gray-500">
        <Clock className="h-3 w-3 animate-spin" />
        Kontrol ediliyor
      </span>
    );
  }

  if (!canReview) return null;

  return (
    <button
      onClick={handleClick}
      className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-xs font-medium"
    >
      <Star className="h-3 w-3" />
      Değerlendir
    </button>
  );
}
