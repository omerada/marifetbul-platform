/**
 * ================================================
 * SELLER RESPONSE MODAL
 * ================================================
 * Modal dialog for sellers to respond to reviews
 * Alternative to inline form for better mobile UX
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1: Review System Completion
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { AlertCircle, Loader2, Star } from 'lucide-react';
import { addSellerResponse, updateSellerResponse } from '@/lib/api/review';
import type { Review } from '@/types/business/review';
import { cn } from '@/lib/utils';

export interface SellerResponseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: Review;
  onSuccess?: (updatedReview: Review) => void;
}

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

export function SellerResponseModal({
  open,
  onOpenChange,
  review,
  onSuccess,
}: SellerResponseModalProps) {
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasResponse = !!review.sellerResponse;
  const charCount = responseText.length;
  const isValid = charCount >= MIN_LENGTH && charCount <= MAX_LENGTH;
  const charsRemaining = MAX_LENGTH - charCount;

  // Initialize with existing response if editing
  useEffect(() => {
    if (hasResponse && review.sellerResponse) {
      setResponseText(review.sellerResponse.responseText);
    } else {
      setResponseText('');
    }
    setError(null);
  }, [review, hasResponse, open]);

  const handleSubmit = async () => {
    setError(null);

    if (!isValid) {
      setError(`Yanıt ${MIN_LENGTH}-${MAX_LENGTH} karakter arasında olmalıdır`);
      return;
    }

    setIsSubmitting(true);

    try {
      const data = { responseText };
      const updatedReview = hasResponse
        ? await updateSellerResponse(review.id, data)
        : await addSellerResponse(review.id, data);

      onSuccess?.(updatedReview);
      onOpenChange(false);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Yanıt kaydedilemedi';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasResponse && review.sellerResponse) {
      setResponseText(review.sellerResponse.responseText);
    } else {
      setResponseText('');
    }
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {hasResponse ? 'Yanıtı Düzenle' : 'Değerlendirmeye Yanıt Yaz'}
          </DialogTitle>
          <DialogDescription>
            Müşterinize profesyonel bir yanıt verin. Bu yanıt herkese açık
            olacaktır.
          </DialogDescription>
        </DialogHeader>

        {/* Original Review Summary */}
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {review.reviewerName}
              </span>
              <Badge variant="secondary" className="text-xs">
                {review.verifiedPurchase && '✓ Doğrulanmış Alıcı'}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">
                {review.overallRating.toFixed(1)}
              </span>
            </div>
          </div>
          <p className="line-clamp-3 text-sm text-gray-700 dark:text-gray-300">
            {review.reviewText}
          </p>
        </div>

        {/* Response Form */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="response-text"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
            >
              Yanıtınız
            </label>
            <Textarea
              id="response-text"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Değerlendirme için teşekkür ederim..."
              rows={6}
              maxLength={MAX_LENGTH}
              disabled={isSubmitting}
              className={cn(
                'w-full',
                charCount > 0 && charCount < MIN_LENGTH && 'border-yellow-500',
                charCount > MAX_LENGTH && 'border-red-500'
              )}
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs">
                <span
                  className={cn(
                    'font-medium',
                    charCount < MIN_LENGTH && 'text-yellow-600',
                    charCount >= MIN_LENGTH &&
                      charCount <= MAX_LENGTH &&
                      'text-green-600',
                    charCount > MAX_LENGTH && 'text-red-600'
                  )}
                >
                  {charCount}/{MAX_LENGTH}
                </span>
                {charCount > 0 && charCount < MIN_LENGTH && (
                  <span className="ml-2 text-gray-500">
                    (En az {MIN_LENGTH - charCount} karakter daha)
                  </span>
                )}
                {charsRemaining < 50 && charsRemaining > 0 && (
                  <span className="ml-2 text-gray-500">
                    ({charsRemaining} karakter kaldı)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
            <p className="mb-1 font-medium">💡 Yanıt İpuçları:</p>
            <ul className="ml-4 list-disc space-y-1 text-xs">
              <li>Müşterinize teşekkür edin</li>
              <li>Olumlu geri bildirimlere değinin</li>
              <li>Olumsuz konularda çözüm önerileri sunun</li>
              <li>Profesyonel ve nazik bir dil kullanın</li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : hasResponse ? (
              'Güncelle'
            ) : (
              'Yanıtla'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
