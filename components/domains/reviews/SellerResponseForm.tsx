'use client';

/**
 * ================================================
 * SELLER RESPONSE FORM
 * ================================================
 * Inline form component for sellers to respond to reviews
 * Supports create, edit, and delete operations
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1: Review System Completion
 */

'use client';

import { useState, useEffect } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import {
  addSellerResponse,
  updateSellerResponse,
  deleteSellerResponse,
} from '@/lib/api/review';
import type { Review } from '@/types/business/review';
import { cn } from '@/lib/utils';

export interface SellerResponseFormProps {
  review: Review;
  onSuccess?: (updatedReview: Review) => void;
  onCancel?: () => void;
  className?: string;
}

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

export function SellerResponseForm({
  review,
  onSuccess,
  onCancel,
  className,
}: SellerResponseFormProps) {
  const [mode, setMode] = useState<'view' | 'create' | 'edit'>('view');
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const hasResponse = !!review.sellerResponse;
  const charCount = responseText.length;
  const isValid = charCount >= MIN_LENGTH && charCount <= MAX_LENGTH;
  const charsRemaining = MAX_LENGTH - charCount;

  // Initialize form with existing response
  useEffect(() => {
    if (hasResponse && review.sellerResponse) {
      setResponseText(review.sellerResponse.responseText);
      setMode('view');
    } else {
      setMode(review.canRespond ? 'create' : 'view');
    }
  }, [review, hasResponse]);

  // Handle response submission (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

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

      setSuccessMessage(hasResponse ? 'Yanıt güncellendi' : 'Yanıt eklendi');
      setMode('view');
      onSuccess?.(updatedReview);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Yanıt kaydedilemedi';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle response deletion
  const handleDelete = async () => {
    if (!confirm('Yanıtı silmek istediğinizden emin misiniz?')) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      const updatedReview = await deleteSellerResponse(review.id);
      setResponseText('');
      setMode('create');
      setSuccessMessage('Yanıt silindi');
      onSuccess?.(updatedReview);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Yanıt silinemedi';
      setError(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle edit mode
  const handleEdit = () => {
    setMode('edit');
    setError(null);
    setSuccessMessage(null);
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasResponse && review.sellerResponse) {
      setResponseText(review.sellerResponse.responseText);
      setMode('view');
    } else {
      setResponseText('');
      setMode('create');
    }
    setError(null);
    onCancel?.();
  };

  // View mode - show existing response
  if (mode === 'view' && hasResponse && review.sellerResponse) {
    return (
      <div
        className={cn(
          'rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20',
          className
        )}
      >
        <div className="mb-2 flex items-center justify-between">
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
          >
            Satıcı Yanıtı
          </Badge>
          {review.canRespond && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                disabled={isDeleting}
              >
                Düzenle
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700 dark:text-red-400"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Siliniyor...
                  </>
                ) : (
                  'Sil'
                )}
              </Button>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {review.sellerResponse.responseText}
        </p>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {new Date(review.sellerResponse.createdAt).toLocaleDateString(
            'tr-TR'
          )}
          {review.sellerResponse.updatedAt !==
            review.sellerResponse.createdAt && (
            <span className="ml-2">(düzenlendi)</span>
          )}
        </p>
      </div>
    );
  }

  // Create/Edit mode - show form
  if (mode === 'create' || mode === 'edit') {
    return (
      <div
        className={cn(
          'rounded-lg border border-gray-200 p-4 dark:border-gray-700',
          className
        )}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {mode === 'create' ? 'Yanıt Yaz' : 'Yanıtı Düzenle'}
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Değerlendirmeye yanıt yazın..."
            rows={4}
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

          {/* Error Message */}
          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : mode === 'create' ? (
                'Yanıtla'
              ) : (
                'Güncelle'
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // No response and can't respond - show nothing or a message
  if (!review.canRespond) {
    return null;
  }

  // Show "Add Response" button
  return (
    <div className={cn('mt-4', className)}>
      <Button variant="outline" onClick={() => setMode('create')}>
        Yanıt Yaz
      </Button>
    </div>
  );
}
