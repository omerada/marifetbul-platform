/**
 * ================================================
 * REQUEST REVISION MODAL
 * ================================================
 * Modal for buyers to request revisions on delivered work
 *
 * Features:
 * - Revision feedback textarea
 * - Character validation (min 20 chars)
 * - Revision count tracking
 * - Request revision API call
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
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

export interface RequestRevisionModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** The order to request revision for */
  order: Order;
  /** Callback after successful revision request */
  onSuccess?: (updatedOrder: Order) => void;
}

// ================================================
// CONSTANTS
// ================================================

const MIN_FEEDBACK_LENGTH = 20;

// ================================================
// COMPONENT
// ================================================

export function RequestRevisionModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: RequestRevisionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  // ================================================
  // COMPUTED VALUES
  // ================================================

  const remainingRevisions = order.revisions?.revisionsRemaining || 0;
  const revisionLimit = order.revisions?.revisionLimit || 0;
  const isValid = feedback.trim().length >= MIN_FEEDBACK_LENGTH;
  const characterCount = feedback.trim().length;

  // ================================================
  // HANDLERS
  // ================================================

  const handleRequestRevision = async () => {
    if (!isValid) {
      toast.error('Hata', {
        description: `Geri bildirim en az ${MIN_FEEDBACK_LENGTH} karakter olmalıdır.`,
      });
      return;
    }

    try {
      setIsLoading(true);

      const updatedOrder = await orderApi.requestRevision(order.id, {
        revisionNote: feedback.trim(),
      });

      toast.success('Revizyon talebi gönderildi!', {
        description: 'Satıcı geri bildiriminizi değerlendirecek.',
      });

      onSuccess?.(updatedOrder);
      onClose();
    } catch (error) {
      toast.error('Hata', {
        description:
          error instanceof Error
            ? error.message
            : 'Revizyon talebi gönderilemedi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFeedback('');
      onClose();
    }
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Revizyon Talep Et</DialogTitle>
          <DialogDescription>
            Teslim edilen işte yapılmasını istediğiniz değişiklikleri detaylı
            olarak belirtin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Info */}
          <div className="bg-muted/50 rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Sipariş Bilgileri</h3>
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Kalan Revizyon Hakkı:
                </span>
                <span
                  className={cn(
                    'font-medium',
                    remainingRevisions > 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {remainingRevisions} / {revisionLimit}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Note (if exists) */}
          {order.delivery?.deliveryNote && (
            <div>
              <Label className="mb-2 block text-sm font-medium">
                Satıcı Teslim Notu
              </Label>
              <div className="bg-muted/50 rounded-lg border p-4">
                <p className="text-sm whitespace-pre-wrap">
                  {order.delivery.deliveryNote}
                </p>
              </div>
            </div>
          )}

          {/* Revision Feedback */}
          <div>
            <Label
              htmlFor="feedback"
              className="mb-2 block text-sm font-medium"
            >
              Revizyon Talebi <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="feedback"
              placeholder="Neyin değiştirilmesini istiyorsunuz? Mümkün olduğunca detaylı açıklayın..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isLoading}
              rows={6}
              className={cn(
                'resize-none',
                !isValid && feedback.length > 0 && 'border-destructive'
              )}
            />
            <div className="mt-2 flex items-center justify-between">
              <p
                className={cn(
                  'text-xs',
                  isValid
                    ? 'text-muted-foreground'
                    : 'text-destructive font-medium'
                )}
              >
                {isValid
                  ? `${characterCount} karakter`
                  : `En az ${MIN_FEEDBACK_LENGTH} karakter gerekli (${characterCount}/${MIN_FEEDBACK_LENGTH})`}
              </p>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              Satıcının işini daha iyi anlaması için net ve yapıcı geri bildirim
              verin.
            </p>
          </div>

          {/* Revision Guidelines */}
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
              <AlertCircle className="h-4 w-4" />
              Revizyon Talep Rehberi
            </h4>
            <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
              <li>
                • <strong>Net olun:</strong> Hangi kısımların değişmesini
                istediğinizi açıkça belirtin
              </li>
              <li>
                • <strong>Spesifik olun:</strong> &quot;Daha iyi yap&quot;
                yerine neyin nasıl değişeceğini anlatın
              </li>
              <li>
                • <strong>Yapıcı olun:</strong> Eleştirilerinizi nazik ve yapıcı
                bir dille iletin
              </li>
              <li>
                • <strong>Referans verin:</strong> Mümkünse örnek veya referans
                paylaşın
              </li>
              <li>
                • <strong>Gerçekçi olun:</strong> Paket kapsamı dışında talepler
                ek ücrete tabidir
              </li>
            </ul>
          </div>

          {/* Warning if no revisions left */}
          {remainingRevisions === 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-900 dark:text-red-100">
                <AlertCircle className="h-4 w-4" />
                Revizyon Hakkınız Kalmadı
              </h4>
              <p className="text-xs text-red-800 dark:text-red-200">
                Bu sipariş için tüm revizyon haklarınızı kullandınız. Ek
                revizyon talepleri satıcı tarafından kabul edilebilir veya ek
                ücret gerektirebilir.
              </p>
            </div>
          )}

          {/* Important Notice */}
          <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950/20">
            <h4 className="mb-2 text-sm font-semibold text-yellow-900 dark:text-yellow-100">
              Önemli Bilgilendirme
            </h4>
            <ul className="space-y-1 text-xs text-yellow-800 dark:text-yellow-200">
              <li>
                • Revizyon talebi gönderildiğinde sipariş durumu
                IN_PROGRESS&apos;e döner
              </li>
              <li>• Satıcı geri bildiriminize göre işi güncelleyecektir</li>
              <li>• Teslimat süresi revizyon kapsamına göre uzayabilir</li>
              <li>
                • Gereksiz revizyon talepleri değerlendirmenizi etkileyebilir
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            İptal
          </Button>
          <Button
            type="button"
            onClick={handleRequestRevision}
            disabled={isLoading || !isValid}
            className="min-w-[140px]"
          >
            {isLoading ? 'Gönderiliyor...' : 'Revizyon Talep Et'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
