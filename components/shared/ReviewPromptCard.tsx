'use client';

/**
 * ================================================
 * REVIEW PROMPT CARD COMPONENT
 * ================================================
 * Prompts users to leave a review after order completion
 * Supports skip and remind me later functionality with localStorage
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Story 3.1: Order Completion Review Prompt
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, MessageSquare, X, Clock, CheckCircle } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export interface ReviewPromptCardProps {
  orderId: string;
  packageId: string;
  packageTitle: string;
  sellerName: string;
  sellerAvatar?: string;
  completedAt?: string;
  className?: string;
  onDismiss?: () => void;
}

// LocalStorage keys
const REVIEW_PROMPT_PREFIX = 'review-prompt-dismissed-';
const REVIEW_PROMPT_REMIND_PREFIX = 'review-prompt-remind-';

export function ReviewPromptCard({
  orderId,
  packageId,
  packageTitle,
  sellerName,
  sellerAvatar,
  className,
  onDismiss,
}: ReviewPromptCardProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user dismissed this prompt permanently
    const dismissedKey = `${REVIEW_PROMPT_PREFIX}${orderId}`;
    const isDismissed = localStorage.getItem(dismissedKey) === 'true';

    if (isDismissed) {
      return;
    }

    // Check if user wants to be reminded later
    const remindKey = `${REVIEW_PROMPT_REMIND_PREFIX}${orderId}`;
    const remindAfter = localStorage.getItem(remindKey);

    if (remindAfter) {
      const remindDate = new Date(remindAfter);
      const now = new Date();

      if (now < remindDate) {
        // Not time to remind yet
        return;
      }
    }

    // Show the prompt
    setIsVisible(true);
    setIsAnimating(true);
  }, [orderId]);

  const handleWriteReview = () => {
    // Navigate to review submission page
    router.push(
      `/dashboard/buyer/orders/${orderId}/review?packageId=${packageId}`
    );
  };

  const handleRemindLater = () => {
    // Set reminder for 7 days from now
    const remindDate = new Date();
    remindDate.setDate(remindDate.getDate() + 7);

    const remindKey = `${REVIEW_PROMPT_REMIND_PREFIX}${orderId}`;
    localStorage.setItem(remindKey, remindDate.toISOString());

    handleClose();
  };

  const handleSkip = () => {
    // Permanently dismiss this prompt
    const dismissedKey = `${REVIEW_PROMPT_PREFIX}${orderId}`;
    localStorage.setItem(dismissedKey, 'true');

    handleClose();
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Card
      className={cn(
        'border-blue-200 bg-gradient-to-br from-blue-50 to-white transition-all duration-300',
        isAnimating
          ? 'animate-in slide-in-from-top-4 fade-in'
          : 'animate-out slide-out-to-top-4 fade-out',
        className
      )}
    >
      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Star className="h-6 w-6 fill-blue-500 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Deneyiminizi Paylaşın</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                Siparişiniz tamamlandı
              </p>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="rounded-md p-1 transition-colors hover:bg-gray-100"
            aria-label="Kapat"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Service Info */}
        <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-white p-4">
          {sellerAvatar && (
            <Image
              src={sellerAvatar}
              alt={sellerName}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <p className="font-medium text-gray-900">{packageTitle}</p>
            <p className="mt-1 text-sm text-gray-600">
              Hizmet Sağlayıcı: {sellerName}
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            <CheckCircle className="mr-2 inline h-4 w-4 text-green-500" />
            Değerlendirmeniz diğer kullanıcılara yardımcı olacak ve hizmet
            kalitesinin artmasına katkı sağlayacaktır.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleWriteReview}
              className="flex-1 gap-2"
              variant="primary"
            >
              <MessageSquare className="h-4 w-4" />
              Değerlendirme Yaz
            </Button>

            <Button
              onClick={handleRemindLater}
              variant="outline"
              className="gap-2"
            >
              <Clock className="h-4 w-4" />
              Sonra Hatırlat
            </Button>
          </div>

          <button
            onClick={handleSkip}
            className="w-full text-center text-sm text-gray-500 transition-colors hover:text-gray-700"
          >
            Şimdi değil
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
