'use client';

/**
 * ================================================
 * REVIEW FORM COMPONENT
 * ================================================
 * Form for creating and editing reviews
 * Supports rating inputs, text input, and image uploads
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint
 */

'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { transformReviewResponse } from '@/lib/transformers/review.transformer';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui';
import { RatingCategory } from './RatingStars';
import { reviewApi } from '@/lib/api/review';
import logger from '@/lib/infrastructure/monitoring/logger';
import {
  createReviewSchema,
  updateReviewSchema,
  RATING_LABELS,
  RATING_DESCRIPTIONS,
} from '@/types/business/review';
import type {
  CreateReviewRequest,
  UpdateReviewRequest,
  Review,
  ReviewType,
} from '@/types/business/review';

interface ReviewFormProps {
  /**
   * Review to edit (for update mode)
   */
  review?: Review;

  /**
   * Order ID (for create mode)
   */
  orderId?: string;

  /**
   * Package ID (for create mode)
   */
  packageId?: string;

  /**
   * Review type
   */
  type: ReviewType;

  /**
   * Callback on successful submit
   */
  onSuccess?: (review: Review) => void;

  /**
   * Callback on cancel
   */
  onCancel?: () => void;

  /**
   * Custom className
   */
  className?: string;
}

type FormData = CreateReviewRequest | UpdateReviewRequest;

export function ReviewForm({
  review,
  orderId,
  packageId,
  type,
  onSuccess,
  onCancel,
  className,
}: ReviewFormProps) {
  const isEditMode = !!review;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(isEditMode ? updateReviewSchema : createReviewSchema),
    defaultValues: isEditMode
      ? {
          overallRating: review.overallRating,
          communicationRating: review.communicationRating,
          qualityRating: review.qualityRating,
          deliveryRating: review.deliveryRating,
          reviewText: review.reviewText,
        }
      : {
          orderId,
          packageId,
          type,
          overallRating: 0,
          communicationRating: 0,
          qualityRating: 0,
          deliveryRating: 0,
          reviewText: '',
        },
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Watch rating values for live preview
  const overallRating = watch('overallRating') || 0;
  const communicationRating = watch('communicationRating') || 0;
  const qualityRating = watch('qualityRating') || 0;
  const deliveryRating = watch('deliveryRating') || 0;
  const reviewText = watch('reviewText') || '';

  // Calculate character count
  const charCount = reviewText.length;
  const minChars = 50;
  const maxChars = 1000;
  const isTextValid = charCount >= minChars && charCount <= maxChars;

  // Handle image selection
  const handleImageSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      const newFiles = Array.from(files);
      const totalImages = images.length + newFiles.length;

      if (totalImages > 5) {
        setError('Maksimum 5 resim yükleyebilirsiniz');
        return;
      }

      // Validate file sizes (max 5MB each)
      const invalidFiles = newFiles.filter(
        (file) => file.size > 5 * 1024 * 1024
      );
      if (invalidFiles.length > 0) {
        setError('Her resim maksimum 5MB olabilir');
        return;
      }

      // Validate file types
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const invalidTypes = newFiles.filter(
        (file) => !validTypes.includes(file.type)
      );
      if (invalidTypes.length > 0) {
        setError('Sadece JPEG, PNG ve WebP formatları desteklenmektedir');
        return;
      }

      // Create preview URLs
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));

      setImages((prev) => [...prev, ...newFiles]);
      setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
      setError(null);
    },
    [images.length]
  );

  // Remove image
  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => {
      const url = prev[index];
      if (url) {
        URL.revokeObjectURL(url);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Submit handler
  const onSubmit = async (data: FormData) => {
    setError(null);

    try {
      let savedReview: Review;

      if (isEditMode) {
        // Update existing review
        const backendReview = await reviewApi.update(
          review.id,
          data as UpdateReviewRequest
        );
        savedReview = transformReviewResponse(backendReview);
      } else {
        // Create new review
        const backendReview = await reviewApi.create(
          data as CreateReviewRequest
        );
        savedReview = transformReviewResponse(backendReview);
      }

      // Upload images if any (only for new reviews or when adding to existing)
      if (images.length > 0 && savedReview.id) {
        setUploadingImages(true);
        try {
          await Promise.all(
            images.map((file) => reviewApi.uploadImage(savedReview.id, file))
          );
        } catch (uploadError) {
          logger.error('Image upload failed:', uploadError);
          setError('Değerlendirme kaydedildi ancak resimler yüklenemedi');
        } finally {
          setUploadingImages(false);
        }
      }

      // Cleanup preview URLs
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));

      onSuccess?.(savedReview);
    } catch (err) {
      logger.error('Review submission failed:', err instanceof Error ? err : new Error(String(err)));
      setError(
        err instanceof Error
          ? err.message
          : 'Değerlendirme kaydedilemedi. Lütfen tekrar deneyin.'
      );
    }
  };

  // Get rating description
  const getRatingDescription = (rating: number): string => {
    return RATING_DESCRIPTIONS[Math.round(rating)] || '';
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-6', className)}
    >
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <p>{error}</p>
        </Alert>
      )}

      {/* Rating Section */}
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Değerlendirme
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            Deneyiminizi 1-5 yıldız arasında değerlendirin
          </p>
        </div>

        {/* Overall Rating */}
        <div className="rounded-lg bg-gray-50 p-4">
          <RatingCategory
            label={RATING_LABELS.overall}
            value={overallRating}
            onChange={(value) => setValue('overallRating', value)}
            required
          />
          {overallRating > 0 && (
            <p className="mt-2 ml-auto text-right text-sm text-gray-600">
              {getRatingDescription(overallRating)}
            </p>
          )}
          {errors.overallRating && (
            <p className="mt-1 text-sm text-red-600">
              {errors.overallRating.message}
            </p>
          )}
        </div>

        {/* Category Ratings */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <RatingCategory
              label={RATING_LABELS.communication}
              value={communicationRating}
              onChange={(value) => setValue('communicationRating', value)}
              required
            />
            {errors.communicationRating && (
              <p className="mt-1 text-sm text-red-600">
                {errors.communicationRating.message}
              </p>
            )}
          </div>

          <div>
            <RatingCategory
              label={RATING_LABELS.quality}
              value={qualityRating}
              onChange={(value) => setValue('qualityRating', value)}
              required
            />
            {errors.qualityRating && (
              <p className="mt-1 text-sm text-red-600">
                {errors.qualityRating.message}
              </p>
            )}
          </div>

          <div>
            <RatingCategory
              label={RATING_LABELS.delivery}
              value={deliveryRating}
              onChange={(value) => setValue('deliveryRating', value)}
              required
            />
            {errors.deliveryRating && (
              <p className="mt-1 text-sm text-red-600">
                {errors.deliveryRating.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Review Text */}
      <div className="space-y-2">
        <Label htmlFor="reviewText" required>
          Değerlendirmeniz
        </Label>
        <Textarea
          id="reviewText"
          {...register('reviewText')}
          placeholder="Deneyiminizi detaylı bir şekilde anlatın... (En az 50 karakter)"
          rows={6}
          className={cn('resize-none', errors.reviewText && 'border-red-500')}
        />
        <div className="flex items-center justify-between text-sm">
          <div>
            {errors.reviewText && (
              <p className="text-red-600">{errors.reviewText.message}</p>
            )}
          </div>
          <p
            className={cn(
              'text-gray-600',
              charCount < minChars && 'text-red-600',
              charCount > maxChars && 'text-red-600',
              isTextValid && 'text-green-600'
            )}
          >
            {charCount} / {maxChars} karakter
            {charCount < minChars && ` (en az ${minChars} karakter gerekli)`}
          </p>
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-3">
        <Label>Resimler (Opsiyonel)</Label>
        <p className="text-sm text-gray-600">
          Değerlendirmenizi desteklemek için resim ekleyin (Maksimum 5 adet, her
          biri 5MB)
        </p>

        {/* Image Previews */}
        {imagePreviewUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {imagePreviewUrls.map((url, index) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded-lg border border-gray-200"
              >
                <Image
                  src={url}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {images.length < 5 && (
          <label
            htmlFor="image-upload"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-gray-400"
          >
            <ImageIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              Resim Yükle ({images.length}/5)
            </span>
            <input
              id="image-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || uploadingImages}
          >
            İptal
          </Button>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || uploadingImages || !isTextValid}
          className="min-w-[120px]"
        >
          {isSubmitting || uploadingImages ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploadingImages ? 'Resimler yükleniyor...' : 'Kaydediliyor...'}
            </>
          ) : isEditMode ? (
            'Güncelle'
          ) : (
            'Değerlendirmeyi Gönder'
          )}
        </Button>
      </div>
    </form>
  );
}
