import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/shared/utils/logger';

export interface ReviewEligibility {
  canReview: boolean;
  isLoading: boolean;
  error: string | null;
  checkEligibility: () => Promise<void>;
}

export interface UseReviewEligibilityOptions {
  orderId: string | null;
  enabled?: boolean;
}

/**
 * Hook to check if a user can review a specific order
 * Queries the /api/v1/user/reviews/can-review/{orderId} endpoint
 */
export function useReviewEligibility({
  orderId,
  enabled = true,
}: UseReviewEligibilityOptions): ReviewEligibility {
  const [canReview, setCanReview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEligibility = useCallback(async () => {
    if (!orderId || !enabled) {
      setCanReview(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/v1/user/reviews/can-review/${orderId}`,
        {
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Giriş yapmanız gerekiyor');
        }
        if (response.status === 404) {
          throw new Error('Sipariş bulunamadı');
        }
        throw new Error('Değerlendirme uygunluğu kontrol edilemedi');
      }

      const data = await response.json();
      // Backend directly returns boolean in data field
      setCanReview(data === true || data.data === true);

      logger.debug('Review eligibility checked', {
        orderId,
        canReview: data === true || data.data === true,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMessage);
      setCanReview(false);

      logger.error(
        'Failed to check review eligibility',
        err instanceof Error ? err : new Error(errorMessage),
        { orderId }
      );
    } finally {
      setIsLoading(false);
    }
  }, [orderId, enabled]);

  // Auto-check on mount and when orderId changes
  useEffect(() => {
    if (orderId && enabled) {
      checkEligibility();
    }
  }, [orderId, enabled, checkEligibility]);

  return {
    canReview,
    isLoading,
    error,
    checkEligibility,
  };
}
