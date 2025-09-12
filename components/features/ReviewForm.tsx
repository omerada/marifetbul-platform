'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Star, MessageSquare, Clock, Users, DollarSign } from 'lucide-react';
import { reviewSchema, type ReviewFormData } from '@/lib/validations/reviews';
import { useReviewForm } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Progress } from '@/components/ui/Progress';
import { Alert, AlertDescription } from '../ui/Alert';
import { Label } from '../ui/Label';
import { Switch } from '../ui/Switch';

interface ReviewFormProps {
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  revieweeName: string;
  projectTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const categoryIcons = {
  communication: MessageSquare,
  quality: Star,
  timing: Clock,
  professionalism: Users,
  value: DollarSign,
};

const categoryLabels = {
  communication: 'İletişim',
  quality: 'Kalite',
  timing: 'Zamanlama',
  professionalism: 'Profesyonellik',
  value: 'Değer',
};

export function ReviewForm({
  orderId,
  reviewerId,
  revieweeId,
  revieweeName,
  projectTitle,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState({
    communication: 0,
    quality: 0,
    timing: 0,
    professionalism: 0,
    value: 0,
  });

  const { submitReview, isSubmitting, submitError, clearError } =
    useReviewForm();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      orderId,
      reviewerId,
      revieweeId,
      rating: 0,
      categories: categoryRatings,
      comment: '',
      isPublic: true,
    },
  });

  const handleRatingChange = (rating: number) => {
    setOverallRating(rating);
    form.setValue('rating', rating);
  };

  const handleCategoryRatingChange = (
    category: keyof typeof categoryRatings,
    rating: number
  ) => {
    const newRatings = { ...categoryRatings, [category]: rating };
    setCategoryRatings(newRatings);
    form.setValue('categories', newRatings);
  };

  const onSubmit = async (data: ReviewFormData) => {
    clearError();

    try {
      const response = await submitReview(data);

      if (response.success) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Review submission error:', error);
    }
  };

  const calculateProgress = () => {
    const hasRating = overallRating > 0;
    const hasComment = form.watch('comment').length >= 10;
    const hasCategoryRatings = Object.values(categoryRatings).every(
      (rating) => rating > 0
    );

    let progress = 0;
    if (hasRating) progress += 40;
    if (hasComment) progress += 30;
    if (hasCategoryRatings) progress += 30;

    return progress;
  };

  const isFormValid = overallRating > 0 && form.watch('comment').length >= 10;

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          İnceleme Yaz
        </CardTitle>
        <div className="text-muted-foreground space-y-1 text-sm">
          <p>
            <strong>{revieweeName}</strong> için inceleme yazıyorsunuz
          </p>
          <p>Proje: {projectTitle}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tamamlanma Durumu</span>
            <span>{calculateProgress()}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Genel Değerlendirme</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className={`rounded p-1 transition-colors ${
                    star <= overallRating
                      ? 'text-yellow-500 hover:text-yellow-600'
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                >
                  <Star
                    className="h-8 w-8"
                    fill={star <= overallRating ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
              <span className="text-muted-foreground ml-2 text-sm">
                {overallRating > 0 ? `${overallRating}/5` : 'Puan verin'}
              </span>
            </div>
          </div>

          {/* Category Ratings */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Kategori Değerlendirmeleri
            </Label>
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(categoryLabels).map(([category, label]) => {
                const Icon =
                  categoryIcons[category as keyof typeof categoryIcons];
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="text-muted-foreground h-4 w-4" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            handleCategoryRatingChange(
                              category as keyof typeof categoryRatings,
                              star
                            )
                          }
                          className={`rounded p-0.5 transition-colors ${
                            star <=
                            categoryRatings[
                              category as keyof typeof categoryRatings
                            ]
                              ? 'text-yellow-500 hover:text-yellow-600'
                              : 'text-gray-300 hover:text-gray-400'
                          }`}
                        >
                          <Star
                            className="h-5 w-5"
                            fill={
                              star <=
                              categoryRatings[
                                category as keyof typeof categoryRatings
                              ]
                                ? 'currentColor'
                                : 'none'
                            }
                          />
                        </button>
                      ))}
                      <span className="text-muted-foreground ml-1 text-xs">
                        {categoryRatings[
                          category as keyof typeof categoryRatings
                        ] || 0}
                        /5
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-base font-medium">
              Yorumunuz
            </Label>
            <Textarea
              id="comment"
              placeholder="Deneyiminizi detaylı bir şekilde paylaşın... (En az 10 karakter)"
              className="min-h-[120px] resize-none"
              {...form.register('comment')}
            />
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>
                {form.watch('comment')?.length >= 10
                  ? '✓ Yeterli detay'
                  : `${Math.max(0, 10 - (form.watch('comment')?.length || 0))} karakter daha`}
              </span>
              <span>{form.watch('comment')?.length || 0}/2000</span>
            </div>
          </div>

          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Herkese Açık</Label>
              <p className="text-muted-foreground text-xs">
                İncelemeniz diğer kullanıcılar tarafından görülebilsin mi?
              </p>
            </div>
            <Switch
              checked={form.watch('isPublic')}
              onCheckedChange={(checked: boolean) =>
                form.setValue('isPublic', checked)
              }
            />
          </div>

          {/* Error Alert */}
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Form Errors */}
          {form.formState.errors.comment && (
            <Alert variant="destructive">
              <AlertDescription>
                {form.formState.errors.comment.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Gönderiliyor...' : 'İnceleme Gönder'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial"
              >
                İptal
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
