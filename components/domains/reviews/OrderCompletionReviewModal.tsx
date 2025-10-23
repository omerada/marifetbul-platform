/**
 * ================================================
 * ORDER COMPLETION REVIEW MODAL
 * ================================================
 * Modal component that prompts users to leave a review
 * after completing an order
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, X, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { ReviewForm } from '@/components/shared/ReviewForm';
import { ReviewType } from '@/types/business/review';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface OrderCompletionReviewModalProps {
  orderId: string;
  packageId: string;
  packageTitle: string;
  packageImage?: string;
  _sellerId: string;
  sellerName: string;
  completedAt: Date;
  reviewDeadline: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewSubmitted?: () => void;
  onRemindLater?: () => void;
}

export function OrderCompletionReviewModal({
  orderId,
  packageId,
  packageTitle,
  packageImage,
  _sellerId,
  sellerName,
  completedAt,
  reviewDeadline,
  open,
  onOpenChange,
  onReviewSubmitted,
  onRemindLater,
}: OrderCompletionReviewModalProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Calculate days until deadline
  const daysUntilDeadline = Math.ceil(
    (reviewDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Format completed time
  const completedTimeAgo = formatDistanceToNow(completedAt, {
    addSuffix: true,
    locale: tr,
  });

  // Handle review success
  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    onOpenChange(false);
    onReviewSubmitted?.();
  };

  // Handle remind later
  const handleRemindLater = () => {
    onOpenChange(false);
    onRemindLater?.();
  };

  // Handle skip
  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {!showReviewForm ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                Siparişiniz Tamamlandı!
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Order Info */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
                {packageImage && (
                  <div className="relative flex-shrink-0 w-20 h-20 rounded-lg bg-gray-200 overflow-hidden">
                    <Image
                      src={packageImage}
                      alt={packageTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {packageTitle}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Satıcı: <span className="font-medium">{sellerName}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Tamamlandı {completedTimeAgo}
                  </p>
                </div>
              </div>

              {/* Review Prompt */}
              <div className="space-y-3">
                <p className="text-gray-700">
                  <span className="font-semibold">{sellerName}</span> ile çalışma deneyiminiz nasıldı?
                  Değerlendirmeniz diğer kullanıcıların doğru kararlar almasına yardımcı olur.
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-600 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <Calendar className="w-4 h-4 flex-shrink-0 text-blue-600" />
                  <span>
                    {daysUntilDeadline > 0 ? (
                      <>
                        Değerlendirme için <span className="font-semibold">{daysUntilDeadline} gün</span> süreniz var
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-red-600">Değerlendirme süresi dolmak üzere!</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Neden değerlendirme yapmalısınız?</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-500" />
                    <span>Topluluk için güvenilir bir kaynak oluşturun</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-500" />
                    <span>Satıcıların gelişmesine katkı sağlayın</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-500" />
                    <span>Deneyiminizi paylaşarak diğerlerine yardımcı olun</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={() => setShowReviewForm(true)}
                  className="flex-1 gap-2"
                >
                  <Star className="w-4 h-4" />
                  Değerlendirme Yaz
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRemindLater}
                  className="flex-1"
                >
                  Daha Sonra Hatırlat
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="sm:w-auto"
                >
                  <X className="w-4 h-4 mr-2" />
                  Atla
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Değerlendirme Yaz</DialogTitle>
            </DialogHeader>
            <ReviewForm
              packageId={packageId}
              orderId={orderId}
              type={ReviewType.PACKAGE}
              onSuccess={handleReviewSuccess}
              onCancel={() => setShowReviewForm(false)}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
