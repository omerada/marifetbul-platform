/**
 * ================================================
 * REVIEW FORM MODAL
 * ================================================
 * Modal component for creating and editing reviews
 * Triggered from order completion or review edit action
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint - Production Ready
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { ReviewForm } from '@/components/shared/ReviewForm';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { reviewApi } from '@/lib/api/review';
import { ReviewType, type Review } from '@/types/business/review';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export interface ReviewFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId?: string;
  packageId: string;
  packageTitle: string;
  packageImage?: string;
  _sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  completedAt?: Date;
  editMode?: boolean;
  existingReviewId?: string;
  onSuccess?: (reviewId: string) => void;
  onCancel?: () => void;
}

type ModalStep = 'info' | 'form' | 'success' | 'error';

export function ReviewFormModal({
  open,
  onOpenChange,
  orderId,
  packageId,
  packageTitle,
  packageImage,
  _sellerId,
  sellerName,
  sellerAvatar,
  completedAt,
  editMode = false,
  existingReviewId,
  onSuccess,
  onCancel,
}: ReviewFormModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<ModalStep>('info');
  const [canReview, setCanReview] = useState<boolean>(true);
  const [ineligibilityReason, setIneligibilityReason] = useState<string | null>(
    null
  );
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [progress, setProgress] = useState(0);

  // Check if user can review (only for new reviews)
  useEffect(() => {
    const checkEligibility = async () => {
      if (!orderId || editMode) {
        setCanReview(true);
        return;
      }

      setCheckingEligibility(true);
      try {
        const canReviewOrder = await reviewApi.canReviewOrder(orderId);
        setCanReview(canReviewOrder);
        setIneligibilityReason(
          canReviewOrder ? null : 'Değerlendirme yapamazsınız'
        );
      } catch (error) {
        console.error('Error checking review eligibility:', error);
        setCanReview(false);
        setIneligibilityReason('Değerlendirme uygunluğu kontrol edilemedi');
      } finally {
        setCheckingEligibility(false);
      }
    };

    if (open && !editMode) {
      checkEligibility();
    }
  }, [open, orderId, editMode]);

  // Handle review success
  const handleReviewSuccess = (review: Review) => {
    setCurrentStep('success');
    if (review && review.id) {
      onSuccess?.(review.id);
      // Update progress to 100%
      setProgress(100);

      // Analytics tracking
      if (typeof window !== 'undefined') {
        const gtag = (
          window as Window & { gtag?: (...args: unknown[]) => void }
        ).gtag;
        if (gtag) {
          gtag('event', 'review_submitted', {
            event_category: 'Review',
            event_label: 'Order Review',
            value: review.overallRating,
          });
        }
      }
    }
  };

  // Handle close
  const handleClose = () => {
    if (currentStep === 'form' && progress > 0) {
      const confirmClose = window.confirm(
        'Değerlendirmeniz henüz tamamlanmadı. Çıkmak istediğinizden emin misiniz?'
      );
      if (!confirmClose) return;
    }
    setCurrentStep('info');
    setProgress(0);
    onOpenChange(false);
    onCancel?.();
  };

  // Handle start review
  const handleStartReview = () => {
    setCurrentStep('form');
  };

  // Handle view review
  const handleViewReview = () => {
    if (editMode && existingReviewId) {
      router.push(`/dashboard/reviews?highlight=${existingReviewId}`);
    } else {
      router.push('/dashboard/reviews');
    }
    handleClose();
  };

  // Render content based on current step
  const renderContent = () => {
    switch (currentStep) {
      case 'info':
        return (
          <div className="space-y-6">
            {/* Order/Package Info */}
            <div className="flex items-start gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              {packageImage && (
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                  <Image
                    src={packageImage}
                    alt={packageTitle}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="mb-1 line-clamp-2 font-semibold text-gray-900">
                  {packageTitle}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {sellerAvatar && (
                    <div className="relative h-6 w-6 overflow-hidden rounded-full">
                      <Image
                        src={sellerAvatar}
                        alt={sellerName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <span className="font-medium">{sellerName}</span>
                </div>
                {completedAt && (
                  <p className="mt-1 text-xs text-gray-500">
                    Tamamlandı:{' '}
                    {formatDistanceToNow(completedAt, {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Eligibility Check */}
            {checkingEligibility && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}

            {!checkingEligibility && !canReview && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                  <div>
                    <h4 className="mb-1 font-medium text-red-900">
                      Değerlendirme Yapılamaz
                    </h4>
                    <p className="text-sm text-red-800">
                      {ineligibilityReason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!checkingEligibility && canReview && (
              <>
                {/* Review Guidelines */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">
                    {editMode
                      ? 'Değerlendirmenizi Güncelleyin'
                      : 'Değerlendirme Yapın'}
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                      <span>
                        4 farklı kategoride (İletişim, Kalite, Hizmet, Teslimat)
                        puan verin
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                      <span>
                        Deneyiminizi detaylı şekilde açıklayın (minimum 50
                        karakter)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                      <span>
                        İsteğe bağlı olarak görseller ekleyebilirsiniz (maksimum
                        5)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                      <span>
                        Değerlendirmenizi oluşturulduktan sonra 30 gün içinde
                        düzenleyebilirsiniz
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Quality Tips */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h4 className="mb-2 font-medium text-blue-900">
                    💡 Kaliteli Değerlendirme İpuçları
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Objektif ve yapıcı olun</li>
                    <li>• Spesifik örnekler verin</li>
                    <li>• Projenin güçlü ve zayıf yönlerini belirtin</li>
                    <li>• Diğer alıcılara yardımcı olacak bilgiler paylaşın</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleStartReview} className="flex-1 gap-2">
                    <Star className="h-4 w-4" />
                    {editMode ? 'Güncellemeye Başla' : 'Değerlendirmeye Başla'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                </div>
              </>
            )}
          </div>
        );

      case 'form':
        return (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">İlerleme Durumu</span>
                <Badge variant={progress >= 100 ? 'default' : 'outline'}>
                  %{progress}
                </Badge>
              </div>
              <Progress value={progress} className="h-2" />
              {progress < 100 && (
                <p className="text-xs text-gray-500">
                  Tüm alanları doldurarak değerlendirmenizi tamamlayın
                </p>
              )}
            </div>

            {/* Review Form */}
            <ReviewForm
              packageId={packageId}
              orderId={orderId}
              type={ReviewType.PACKAGE}
              onSuccess={handleReviewSuccess}
              onCancel={handleClose}
            />
          </div>
        );

      case 'success':
        return (
          <div className="space-y-6 py-8 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">
                {editMode ? 'Değerlendirme Güncellendi!' : 'Teşekkür Ederiz!'}
              </h3>
              <p className="text-gray-600">
                {editMode
                  ? 'Değerlendirmeniz başarıyla güncellendi.'
                  : 'Değerlendirmeniz başarıyla gönderildi ve incelemeye alındı.'}
              </p>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <p>
                Değerlendirmeniz moderasyon sürecinden geçtikten sonra
                yayınlanacak ve diğer kullanıcılar tarafından görülebilecektir.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={handleViewReview} className="w-full">
                Değerlendirmelerimi Görüntüle
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full"
              >
                Kapat
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-6 py-8 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">
                Bir Hata Oluştu
              </h3>
              <p className="text-gray-600">
                Değerlendirmeniz gönderilirken bir hata oluştu. Lütfen tekrar
                deneyin.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={() => setCurrentStep('form')} className="w-full">
                Tekrar Dene
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full"
              >
                Kapat
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={`max-h-[90vh] max-w-3xl overflow-y-auto ${
          currentStep === 'form' ? 'sm:max-w-4xl' : ''
        }`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            {currentStep === 'info' &&
              (editMode ? 'Değerlendirmeyi Düzenle' : 'Değerlendirme Yaz')}
            {currentStep === 'form' && 'Değerlendirmenizi Tamamlayın'}
            {currentStep === 'success' && 'Başarılı!'}
            {currentStep === 'error' && 'Hata'}
          </DialogTitle>
          {currentStep === 'info' && (
            <DialogDescription>
              {editMode
                ? 'Değerlendirmenizi güncelleyerek deneyiminizi daha iyi yansıtabilirsiniz.'
                : 'Deneyiminizi paylaşarak diğer kullanıcılara yardımcı olun.'}
            </DialogDescription>
          )}
        </DialogHeader>

        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
