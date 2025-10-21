/**
 * Modal for employer to approve completed delivery
 * Confirms work acceptance and releases payment from escrow
 */

'use client';

import React, { useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { useOrder } from '@/hooks/business/useOrder';

interface ApproveDeliveryModalProps {
  orderId: string;
  orderTitle: string;
  deliveryNote?: string;
  attachments?: string[];
  freelancerName: string;
  amount: number;
  currency: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ApproveDeliveryModal({
  orderId,
  orderTitle,
  deliveryNote,
  attachments,
  freelancerName,
  amount,
  currency,
  isOpen,
  onClose,
  onSuccess,
}: ApproveDeliveryModalProps) {
  const [feedback, setFeedback] = useState('');

  const { approveDelivery, isLoading } = useOrder({
    onSuccess: () => {
      onSuccess?.();
      handleClose();
    },
  });

  const handleClose = useCallback(() => {
    if (isLoading) return;
    setFeedback('');
    onClose();
  }, [isLoading, onClose]);

  const handleApprove = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        await approveDelivery(orderId);
      } catch {
        // Error is handled in the hook
      }
    },
    [orderId, approveDelivery]
  );

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Teslimatı Onayla
            </h2>
            <p className="mt-1 text-sm text-gray-600">{orderTitle}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleApprove} className="space-y-6 p-6">
          {/* Delivery Info */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-900">
                  Teslimat Bilgileri
                </h3>
                <p className="mt-2 text-sm text-blue-800">
                  <strong>Freelancer:</strong> {freelancerName}
                </p>
                {deliveryNote && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-blue-900">
                      Teslimat Notu:
                    </p>
                    <p className="mt-1 text-sm whitespace-pre-wrap text-blue-800">
                      {deliveryNote}
                    </p>
                  </div>
                )}
                {attachments && attachments.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-blue-900">
                      Dosyalar: {attachments.length} adet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
              <div className="flex-1">
                <h3 className="font-medium text-green-900">Ödeme Bilgisi</h3>
                <p className="mt-2 text-sm text-green-800">
                  Onayladığınızda{' '}
                  <strong>
                    {amount} {currency}
                  </strong>{' '}
                  escrow hesabından freelancer&apos;a aktarılacaktır.
                </p>
              </div>
            </div>
          </div>

          {/* Feedback (Optional) */}
          <div>
            <Label htmlFor="feedback" className="mb-2">
              Geri Bildirim (Opsiyonel)
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="İşle ilgili görüşlerinizi paylaşın..."
              rows={4}
              className="w-full"
              disabled={isLoading}
            />
            <p className="mt-2 text-sm text-gray-500">
              Freelancer&apos;a yapıcı geri bildirim verin
            </p>
          </div>

          {/* Important Notice */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
              <div className="flex-1 text-sm text-yellow-800">
                <p className="font-medium">Önemli Bilgilendirme</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Onayladığınızda sipariş tamamlanmış sayılır</li>
                  <li>Ödeme freelancer hesabına aktarılır</li>
                  <li>Bu işlem geri alınamaz</li>
                  <li>Sorun varsa önce revizyon talep edin</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4 animate-spin" />
                  Onaylanıyor...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Teslimatı Onayla
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
