'use client';

/**
 * Modal for employer to request revision on delivered work
 * Sends work back to freelancer with specific revision requirements
 *
 * REFACTORED: Now uses BaseOrderModal for consistent structure
 * Version: 2.0.0 - Sprint 6: Modal Standardization
 */

'use client';

import React, { useState, useCallback } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { DialogFooter } from '@/components/ui/Dialog';
import { useOrder } from '@/hooks/business/useOrder';
import {
  BaseOrderModal,
  BaseOrderModalProps,
  orderHelpers,
} from './BaseOrderModal';

// ================================================
// TYPES
// ================================================

export interface RequestRevisionModalProps extends BaseOrderModalProps {
  /** Optional delivery note from previous submission */
  deliveryNote?: string;
}

// ================================================
// COMPONENT
// ================================================

export function RequestRevisionModal({
  orderId,
  order,
  deliveryNote,
  isOpen,
  onClose,
  onSuccess,
}: RequestRevisionModalProps) {
  const [revisionNote, setRevisionNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { requestRevision, isLoading } = useOrder({
    onSuccess: () => {
      onSuccess?.();
      handleClose();
    },
  });

  const handleClose = useCallback(() => {
    if (isLoading) return;
    setRevisionNote('');
    setError(null);
    onClose();
  }, [isLoading, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!revisionNote.trim()) {
        setError('Lütfen revizyon detaylarını yazın');
        return;
      }

      const { current, max } = orderHelpers.getRevisionInfo(order);

      if (current >= max) {
        setError(`Maksimum revizyon sayısına (${max}) ulaşıldı`);
        return;
      }

      try {
        await requestRevision(orderId, { revisionNote: revisionNote.trim() });
      } catch {
        // Error is handled in the hook
      }
    },
    [orderId, revisionNote, order, requestRevision]
  );

  // Extract order data using helpers
  const orderTitle = orderHelpers.getOrderTitle(order);
  const { current, max, remaining } = orderHelpers.getRevisionInfo(order);

  return (
    <BaseOrderModal
      isOpen={isOpen}
      onClose={handleClose}
      orderId={orderId}
      order={order}
      title="Revizyon Talep Et"
      description={orderTitle}
      icon={RefreshCw}
      iconColor="text-orange-600"
      variant="card"
      preventCloseOnLoading
      isLoading={isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {/* Revision Count Info */}
        <div
          className={`rounded-lg border p-4 ${
            remaining <= 1
              ? 'border-red-200 bg-red-50'
              : 'border-blue-200 bg-blue-50'
          }`}
        >
          <div className="flex gap-3">
            <AlertCircle
              className={`h-5 w-5 flex-shrink-0 ${
                remaining <= 1 ? 'text-red-600' : 'text-blue-600'
              }`}
            />
            <div className="flex-1">
              <h3
                className={`font-medium ${
                  remaining <= 1 ? 'text-red-900' : 'text-blue-900'
                }`}
              >
                Revizyon Hakkı
              </h3>
              <p
                className={`mt-2 text-sm ${
                  remaining <= 1 ? 'text-red-800' : 'text-blue-800'
                }`}
              >
                <strong>{remaining}</strong> / {max} revizyon hakkı kaldı
              </p>
              {remaining <= 1 && (
                <p className="mt-2 text-sm text-red-800">
                  Bu son revizyon hakkınız. Dikkatli değerlendirin.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Previous Delivery Note */}
        {deliveryNote && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-medium text-gray-900">
              Freelancer&apos;ın Teslimat Notu
            </h3>
            <p className="mt-2 text-sm whitespace-pre-wrap text-gray-700">
              {deliveryNote}
            </p>
          </div>
        )}

        {/* Revision Note */}
        <div>
          <Label htmlFor="revisionNote" className="mb-2">
            Revizyon Detayları <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="revisionNote"
            value={revisionNote}
            onChange={(e) => setRevisionNote(e.target.value)}
            placeholder="Nelerin değiştirilmesi gerektiğini detaylı açıklayın..."
            rows={8}
            className="w-full"
            disabled={isLoading}
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            Freelancer&apos;ın işi doğru yapabilmesi için net ve açık talimatlar
            verin
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Revizyon Süreci</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>
                  Talep gönderildiğinde sipariş tekrar &quot;devam ediyor&quot;
                  durumuna geçer
                </li>
                <li>Freelancer revize edilmiş işi tekrar teslim edecek</li>
                <li>Ödeme escrow hesabında kalır</li>
                <li>Net talimatlar revizyon süresini kısaltır</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <DialogFooter className="flex gap-3">
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
            disabled={isLoading || current >= max}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Revizyon Talep Et
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </BaseOrderModal>
  );
}

export default RequestRevisionModal;
