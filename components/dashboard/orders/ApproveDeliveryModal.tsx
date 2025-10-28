/**
 * ================================================
 * APPROVE DELIVERY MODAL
 * ================================================
 * Modal for buyers to approve delivery and provide rating/review
 *
 * Features:
 * - Delivery details display
 * - Star rating (1-5)
 * - Optional review text
 * - Approve confirmation
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button, Textarea, Label } from '@/components/ui';
import { orderApi } from '@/lib/api/orders';
import type { Order } from '@/lib/api/validators/order';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export interface ApproveDeliveryModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** The order to approve */
  order: Order;
  /** Callback after successful approval */
  onSuccess?: (updatedOrder: Order) => void;
}

// ================================================
// COMPONENT
// ================================================

export function ApproveDeliveryModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: ApproveDeliveryModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');

  // ================================================
  // HANDLERS
  // ================================================

  const handleApprove = async () => {
    try {
      setIsLoading(true);

      // Approve delivery
      const updatedOrder = await orderApi.approveDelivery(order.id);

      // TODO: Submit rating and review to rating API
      // await ratingApi.createRating({
      //   orderId: order.id,
      //   rating,
      //   review: review.trim(),
      // });

      toast.success('Teslimat onaylandı!', {
        description:
          'Ödeme satıcıya aktarılacak. Değerlendirmeniz için teşekkürler.',
      });

      onSuccess?.(updatedOrder);
      onClose();
    } catch (error) {
      toast.error('Hata', {
        description:
          error instanceof Error ? error.message : 'Teslimat onaylanamadı.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleStarHover = (value: number) => {
    setHoveredRating(value);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  // ================================================
  // RENDER HELPERS
  // ================================================

  const renderStars = () => {
    const stars = [];
    const displayRating = hoveredRating || rating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          onMouseLeave={handleStarLeave}
          className="focus:ring-primary rounded transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          disabled={isLoading}
        >
          <Star
            className={cn(
              'h-8 w-8 transition-colors',
              i <= displayRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-transparent text-gray-300'
            )}
          />
        </button>
      );
    }

    return stars;
  };

  const getRatingText = () => {
    switch (rating) {
      case 1:
        return 'Çok Kötü';
      case 2:
        return 'Kötü';
      case 3:
        return 'Orta';
      case 4:
        return 'İyi';
      case 5:
        return 'Mükemmel';
      default:
        return '';
    }
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Teslimatı Onayla</DialogTitle>
          <DialogDescription>
            Teslim edilen işi değerlendirin ve onaylayın. Onayladığınızda ödeme
            satıcıya aktarılacaktır.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Delivery Info */}
          <div className="bg-muted/50 rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Teslimat Bilgileri</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sipariş:</span>
                <span className="font-medium">#{order.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paket:</span>
                <span className="font-medium">
                  {order.packageDetails?.packageTitle ||
                    order.customDescription ||
                    'Özel Sipariş'}
                </span>
              </div>
              {order.delivery?.submittedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Teslim Tarihi:</span>
                  <span className="font-medium">
                    {new Date(order.delivery.submittedAt).toLocaleDateString(
                      'tr-TR',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Note */}
          {order.delivery?.deliveryNote && (
            <div>
              <Label className="mb-2 block text-sm font-medium">
                Satıcı Notu
              </Label>
              <div className="bg-muted/50 rounded-lg border p-4">
                <p className="text-sm whitespace-pre-wrap">
                  {order.delivery.deliveryNote}
                </p>
              </div>
            </div>
          )}

          {/* Delivery Files */}
          {order.delivery?.attachments &&
            order.delivery.attachments.length > 0 && (
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Teslim Edilen Dosyalar ({order.delivery.attachments.length})
                </Label>
                <div className="space-y-2">
                  {order.delivery.attachments.map((fileUrl, index) => {
                    const fileName =
                      fileUrl.split('/').pop() || `Dosya ${index + 1}`;
                    return (
                      <div
                        key={index}
                        className="bg-muted/50 flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded">
                            <span className="text-primary text-xs font-medium">
                              {fileName.split('.').pop()?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{fileName}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <a
                            href={fileUrl}
                            download={fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm"
                          >
                            İndir
                          </a>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Rating Section */}
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label className="mb-3 block text-sm font-medium">
                Değerlendirme <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                {renderStars()}
                <span className="text-muted-foreground ml-2 text-sm font-medium">
                  {getRatingText()}
                </span>
              </div>
            </div>

            <div>
              <Label
                htmlFor="review"
                className="mb-2 block text-sm font-medium"
              >
                Yorum (İsteğe Bağlı)
              </Label>
              <Textarea
                id="review"
                placeholder="İşi nasıl buldunuz? Deneyiminizi paylaşın..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                disabled={isLoading}
                rows={4}
                className="resize-none"
              />
              <p className="text-muted-foreground mt-2 text-xs">
                Yorumunuz diğer kullanıcılar ve satıcı tarafından görülebilecek.
              </p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
            <h4 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
              Önemli Bilgilendirme
            </h4>
            <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
              <li>• Onayladığınızda ödeme satıcıya aktarılacaktır</li>
              <li>• Bu işlem geri alınamaz</li>
              <li>
                • Teslimatla ilgili sorun varsa önce satıcıyla iletişime geçin
              </li>
              <li>
                • Revizyon talep etmek için &quot;Revizyon İste&quot; butonunu
                kullanın
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            İptal
          </Button>
          <Button
            type="button"
            onClick={handleApprove}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? 'Onaylanıyor...' : 'Teslimatı Onayla'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
