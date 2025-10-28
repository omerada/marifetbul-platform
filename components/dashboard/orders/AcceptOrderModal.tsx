/**
 * ================================================
 * ACCEPT ORDER MODAL
 * ================================================
 * Modal for seller to accept an order
 *
 * Features:
 * - Order summary display
 * - Accept/decline actions
 * - Terms confirmation
 * - Real-time feedback
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 2: Seller Order Actions
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui';
import { Button } from '@/components/ui';
import { Checkbox } from '@/components/ui';
import {
  CheckCircle,
  Clock,
  DollarSign,
  AlertCircle,
  Package,
} from 'lucide-react';
import { orderApi } from '@/lib/api/orders';
import type { Order } from '@/lib/api/validators/order';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export interface AcceptOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onSuccess?: (order: Order) => void;
}

// ================================================
// COMPONENT
// ================================================

export function AcceptOrderModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: AcceptOrderModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // ================================================
  // HANDLERS
  // ================================================

  const handleAccept = async () => {
    if (!termsAccepted) {
      toast.error('Koşulları kabul etmelisiniz');
      return;
    }

    try {
      setIsLoading(true);
      const updatedOrder = await orderApi.acceptOrder(order.id);

      toast.success('Sipariş kabul edildi!', {
        description: 'Artık işe başlayabilirsiniz.',
      });

      onSuccess?.(updatedOrder);
      onClose();
    } catch (error) {
      toast.error('Hata', {
        description:
          error instanceof Error ? error.message : 'Sipariş kabul edilemedi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    // TODO: Implement decline/cancel flow
    toast.info('İptal İşlemi', {
      description: 'Sipariş iptal özelliği yakında eklenecek.',
    });
    onClose();
  };

  // ================================================
  // HELPER FUNCTIONS
  // ================================================

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Siparişi Kabul Et
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Summary */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 font-semibold text-gray-900">Sipariş Özeti</h3>

            <div className="space-y-3">
              {/* Order Number */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sipariş No:</span>
                <span className="font-medium text-gray-900">
                  #{order.orderNumber}
                </span>
              </div>

              {/* Package/Service */}
              <div className="flex items-start justify-between">
                <span className="text-sm text-gray-600">
                  <Package className="mr-1 inline-block h-4 w-4" />
                  Paket/Hizmet:
                </span>
                <span className="max-w-xs text-right font-medium text-gray-900">
                  {order.packageDetails?.packageTitle ||
                    order.customDescription ||
                    'Özel Sipariş'}
                </span>
              </div>

              {/* Buyer */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Alıcı:</span>
                <span className="font-medium text-gray-900">
                  {order.buyer?.fullName || order.buyer?.username || 'Alıcı'}
                </span>
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  <DollarSign className="mr-1 inline-block h-4 w-4" />
                  Tutar:
                </span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(
                    order.financials.total,
                    order.financials.currency
                  )}
                </span>
              </div>

              {/* Your Earnings */}
              <div className="flex items-center justify-between rounded bg-green-50 p-2">
                <span className="text-sm font-medium text-green-800">
                  Sizin Kazancınız:
                </span>
                <span className="text-lg font-bold text-green-800">
                  {formatCurrency(
                    order.financials.sellerEarnings,
                    order.financials.currency
                  )}
                </span>
              </div>

              {/* Deadline */}
              {order.deadline && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    <Clock className="mr-1 inline-block h-4 w-4" />
                    Teslim Tarihi:
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatDate(order.deadline)}
                  </span>
                </div>
              )}

              {/* Delivery Days */}
              {order.packageDetails?.deliveryDays && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Teslimat Süresi:
                  </span>
                  <span className="font-medium text-gray-900">
                    {order.packageDetails.deliveryDays} gün
                  </span>
                </div>
              )}

              {/* Revisions */}
              {order.revisions && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Revizyon Hakkı:</span>
                  <span className="font-medium text-gray-900">
                    {order.revisions.revisionLimit} revizyon
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Requirements */}
          {order.requirements && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-900">
                Müşteri Gereksinimleri
              </h3>
              <p className="text-sm whitespace-pre-wrap text-blue-800">
                {order.requirements}
              </p>
            </div>
          )}

          {/* Important Info */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
              <div className="text-sm text-yellow-800">
                <p className="mb-2 font-semibold">Önemli Bilgiler:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Siparişi kabul ettiğinizde ödeme escrow&apos;a alınır</li>
                  <li>Belirlenen süre içinde teslimat yapmalısınız</li>
                  <li>
                    Teslimat sonrası müşteri onayı ile ödeme hesabınıza
                    aktarılır
                  </li>
                  <li>Revizyon talepleri paket kapsamında ücretsiz yapılır</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Terms Acceptance */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              disabled={isLoading}
            />
            <label
              htmlFor="terms"
              className={cn(
                'text-sm leading-relaxed',
                termsAccepted ? 'text-gray-900' : 'text-gray-600'
              )}
            >
              Sipariş koşullarını okudum ve kabul ediyorum. Belirlenen süre
              içinde kaliteli teslimat yapacağımı taahhüt ediyorum.
            </label>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={isLoading}
          >
            İptal Et
          </Button>
          <Button
            variant="primary"
            onClick={handleAccept}
            disabled={!termsAccepted || isLoading}
            className="min-w-32"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Kabul Ediliyor...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Kabul Et
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AcceptOrderModal;
