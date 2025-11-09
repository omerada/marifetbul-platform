'use client';

/**
 * ================================================
 * REVIEW FLAG MODAL
 * ================================================
 * Modal component for users to flag inappropriate reviews
 * Supports multiple flag reasons and additional comments
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1: Review System Completion - Story 1.3
 */

'use client';

import { useState } from 'react';
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
import { Label } from '@/components/ui/Label';
import { AlertCircle, CheckCircle2, Loader2, Flag } from 'lucide-react';
import { flagReview } from '@/lib/api/review';
import { FlagReason } from '@/types/business/review';
import { cn } from '@/lib/utils';

export interface ReviewFlagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewId: string;
  reviewerName?: string;
  onSuccess?: () => void;
}

const FLAG_REASONS = [
  {
    value: FlagReason.SPAM,
    label: 'Spam veya Reklam',
    description: 'İçerik spam veya gereksiz reklam içeriyor',
  },
  {
    value: FlagReason.INAPPROPRIATE,
    label: 'Uygunsuz İçerik',
    description: 'İçerik topluluk kurallarına aykırı',
  },
  {
    value: FlagReason.FAKE,
    label: 'Sahte Değerlendirme',
    description: 'Bu bir sahte veya yanıltıcı değerlendirme',
  },
  {
    value: FlagReason.OFFENSIVE,
    label: 'Saldırgan veya Hakaret',
    description: 'İçerik saldırgan dil veya hakaret içeriyor',
  },
  {
    value: FlagReason.OTHER,
    label: 'Diğer',
    description: 'Başka bir sebep (lütfen açıklayın)',
  },
];

export function ReviewFlagModal({
  open,
  onOpenChange,
  reviewId,
  reviewerName,
  onSuccess,
}: ReviewFlagModalProps) {
  const [selectedReason, setSelectedReason] = useState<FlagReason | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isOtherSelected = selectedReason === FlagReason.OTHER;
  const isValid =
    selectedReason && (!isOtherSelected || description.trim().length >= 10);

  const handleSubmit = async () => {
    if (!isValid) {
      setError(
        isOtherSelected
          ? 'Lütfen "Diğer" seçeneği için açıklama girin (en az 10 karakter)'
          : 'Lütfen bir sebep seçin'
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await flagReview(reviewId, {
        reason: selectedReason,
        description: description.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1500);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Şikayet gönderilemedi. Lütfen tekrar deneyin.';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDescription('');
    setError(null);
    setSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-600" />
            <DialogTitle>Değerlendirmeyi Şikayet Et</DialogTitle>
          </div>
          <DialogDescription>
            {reviewerName
              ? `${reviewerName} tarafından yapılan değerlendirmeyi neden şikayet etmek istiyorsunuz?`
              : 'Bu değerlendirmeyi neden şikayet etmek istiyorsunuz?'}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          /* Success State */
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="mb-4 h-16 w-16 text-green-600" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Şikayetiniz Alındı
            </h3>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Moderasyon ekibimiz en kısa sürede inceleyecektir. Teşekkür
              ederiz.
            </p>
          </div>
        ) : (
          /* Form */
          <div className="space-y-6 py-4">
            {/* Flag Reasons */}
            <div>
              <Label className="mb-3 block text-sm font-medium text-gray-900 dark:text-gray-100">
                Şikayet Sebebi
              </Label>
              <div className="space-y-3">
                {FLAG_REASONS.map((reason) => (
                  <label
                    key={reason.value}
                    className={cn(
                      'flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-colors',
                      selectedReason === reason.value
                        ? 'border-primary-500 bg-primary-50 dark:border-primary-600 dark:bg-primary-900/10'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                    )}
                  >
                    <input
                      type="radio"
                      name="flagReason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) =>
                        setSelectedReason(e.target.value as FlagReason)
                      }
                      className="text-primary-600 focus:ring-primary-500 mt-1 h-4 w-4"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {reason.label}
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {reason.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Description */}
            {(isOtherSelected || selectedReason) && (
              <div>
                <Label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  Ek Açıklama {isOtherSelected && '(Zorunlu)'}
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isOtherSelected
                      ? 'Lütfen şikayet sebebinizi açıklayın...'
                      : 'Ek bilgi eklemek isterseniz yazabilirsiniz (opsiyonel)'
                  }
                  rows={4}
                  maxLength={500}
                  disabled={isSubmitting}
                  className={cn(
                    isOtherSelected &&
                      description.trim().length < 10 &&
                      description.trim().length > 0 &&
                      'border-yellow-500'
                  )}
                />
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  {isOtherSelected && description.trim().length < 10 && (
                    <span className="text-yellow-600">
                      En az {10 - description.trim().length} karakter daha
                    </span>
                  )}
                  <span className="ml-auto">{description.length}/500</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Warning */}
            <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
              <p className="font-medium">⚠️ Önemli:</p>
              <p className="mt-1 text-xs">
                Yanlış şikayetler hesabınıza kısıtlama getirebilir. Lütfen
                sadece gerçekten kurallara aykırı içerik için şikayet edin.
              </p>
            </div>
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="min-w-[120px] bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                'Şikayet Et'
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
