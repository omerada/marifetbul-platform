'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, X } from 'lucide-react';
import { useReviews } from '@/hooks';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Textarea } from '@/components/ui/Textarea';
import logger from '@/lib/infrastructure/monitoring/logger';

const replySchema = z.object({
  content: z
    .string()
    .min(10, 'Yanıt en az 10 karakter olmalıdır')
    .max(1000, 'Yanıt en fazla 1000 karakter olabilir'),
});

type ReplyFormData = z.infer<typeof replySchema>;

interface ReviewReplyProps {
  reviewId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export function ReviewReply({
  reviewId,
  onSubmit,
  onCancel,
}: ReviewReplyProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { replyToReview } = useReviews();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    mode: 'onChange',
  });

  const handleFormSubmit = async (data: ReplyFormData) => {
    setIsSubmitting(true);

    try {
      await replyToReview(reviewId, data.content);

      reset();
      onSubmit();
    } catch (error) {
      logger.error('Yanıt gönderilirken hata:', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-muted/30 rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-medium">İncelemeyi Yanıtla</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <Textarea
            {...register('content')}
            placeholder="Yanıtınızı yazın..."
            className="min-h-[100px] resize-none"
            disabled={isSubmitting}
          />
          {errors.content && (
            <p className="text-destructive mt-1 text-xs">
              {errors.content.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs">
            Yanıtınız herkes tarafından görülebilir.
          </p>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!isValid || isSubmitting}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Gönderiliyor...' : 'Yanıtla'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
