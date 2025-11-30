'use client';

import React from 'react';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import logger from '@/lib/infrastructure/monitoring/logger';

interface ArticleRatingProps {
  articleId: string;
  currentRating?: number;
  averageRating?: number;
  ratingCount?: number;
  onRate?: (rating: number, feedback?: string) => void;
  className?: string;
}

export function ArticleRating({
  currentRating,
  averageRating = 0,
  ratingCount = 0,
  onRate,
  className,
}: ArticleRatingProps) {
  const [selectedRating, setSelectedRating] = React.useState(
    currentRating || 0
  );
  const [hoverRating, setHoverRating] = React.useState(0);
  const [feedback, setFeedback] = React.useState('');
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [hasRated, setHasRated] = React.useState(!!currentRating);

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    if (rating <= 3) {
      setShowFeedback(true);
    } else {
      setShowFeedback(false);
      handleSubmit(rating);
    }
  };

  const handleSubmit = async (
    rating: number = selectedRating,
    feedbackText: string = feedback
  ) => {
    if (!onRate || rating === 0) return;

    setIsSubmitting(true);
    try {
      await onRate(rating, feedbackText);
      setHasRated(true);
      setShowFeedback(false);
    } catch (error) {
      logger.error(
        'Rating submission failed', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFeedback = (isHelpful: boolean) => {
    const rating = isHelpful ? 5 : 2;
    setSelectedRating(rating);
    handleSubmit(rating);
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = (hoverRating || selectedRating) >= starValue;

      return (
        <button
          key={index}
          type="button"
          onClick={() => handleStarClick(starValue)}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          disabled={hasRated || isSubmitting}
          className={cn(
            'transition-colors',
            isActive ? 'text-yellow-400' : 'text-gray-300',
            !hasRated && !isSubmitting && 'hover:text-yellow-400',
            (hasRated || isSubmitting) && 'cursor-not-allowed opacity-50'
          )}
        >
          <Star className="h-6 w-6 fill-current" />
        </button>
      );
    });
  };

  if (hasRated) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="text-center">
          <div className="mb-2 flex justify-center gap-1">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={cn(
                  'h-5 w-5',
                  index < selectedRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                )}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Bu makaleyi {selectedRating} yýldýz ile deðerlendirdiniz.
            Teþekkürler!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="text-center">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Bu makale yararlý oldu mu?
        </h3>

        <p className="mb-4 text-sm text-gray-600">
          Deneyiminizi paylaþarak diðer kullanýcýlara yardýmcý olun
        </p>

        {/* Current Article Rating Display */}
        {averageRating > 0 && (
          <div className="mb-4 rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      'h-4 w-4',
                      index < Math.floor(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
              <span className="font-medium text-gray-900">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-gray-500">
                ({ratingCount} deðerlendirme)
              </span>
            </div>
          </div>
        )}

        {/* Quick Rating Buttons */}
        <div className="mb-6">
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => handleQuickFeedback(true)}
              disabled={isSubmitting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ThumbsUp className="h-4 w-4" />
              Evet, yararlý
            </Button>

            <Button
              onClick={() => handleQuickFeedback(false)}
              disabled={isSubmitting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ThumbsDown className="h-4 w-4" />
              Hayýr, yararlý deðil
            </Button>
          </div>
        </div>

        {/* Detailed Rating */}
        <div className="border-t pt-4">
          <p className="mb-3 text-sm text-gray-600">
            Daha detaylý deðerlendirme yapmak isterseniz:
          </p>

          <div className="mb-4 flex justify-center gap-1">{renderStars()}</div>

          {showFeedback && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Geri bildiriminiz (isteðe baðlý)
                </label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Bu makaleyi nasýl geliþtirebiliriz?"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting || selectedRating === 0}
                  className="flex-1"
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Deðerlendirmeyi Gönder'}
                </Button>

                <Button
                  onClick={() => {
                    setShowFeedback(false);
                    setSelectedRating(0);
                    setFeedback('');
                  }}
                  variant="outline"
                >
                  Ýptal
                </Button>
              </div>
            </div>
          )}

          {selectedRating > 0 && !showFeedback && (
            <div className="mt-4">
              <Button
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Deðerlendirmeyi Gönder'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Compact version for article cards
interface CompactArticleRatingProps {
  averageRating: number;
  ratingCount: number;
  onRate?: (isHelpful: boolean) => void;
  className?: string;
}

export function CompactArticleRating({
  averageRating,
  ratingCount,
  onRate,
  className,
}: CompactArticleRatingProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="flex items-center gap-1">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              className={cn(
                'h-3 w-3',
                index < Math.floor(averageRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              )}
            />
          ))}
        </div>
        <span className="text-xs text-gray-600">
          {averageRating.toFixed(1)} ({ratingCount})
        </span>
      </div>

      {onRate && (
        <div className="flex gap-1">
          <button
            onClick={() => onRate(true)}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors hover:bg-green-50 hover:text-green-600"
          >
            <ThumbsUp className="h-3 w-3" />
          </button>
          <button
            onClick={() => onRate(false)}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <ThumbsDown className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
