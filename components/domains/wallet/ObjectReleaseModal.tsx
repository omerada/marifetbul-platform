/**
 * ================================================
 * OBJECT RELEASE MODAL
 * ================================================
 * Modal for buyer to object to automatic escrow release
 *
 * Features:
 * - Confirm objection with reason
 * - Opens dispute automatically
 * - Shows consequences of objection
 * - Success/error feedback
 *
 * Sprint 1 - Story 1.4: Escrow Auto-Release Dashboard Widget (5 SP)
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import { AlertTriangle, Shield, Check, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/shared/formatters';
import { apiClient } from '@/lib/infrastructure/api/client';
import { useToast } from '@/hooks/core/useToast';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { UpcomingReleaseItem } from '@/hooks/business/wallet/useUpcomingEscrowReleases';

// ============================================================================
// TYPES
// ============================================================================

export interface ObjectReleaseModalProps {
  /** Release item to object to */
  item: UpcomingReleaseItem | null;

  /** Whether modal is open */
  isOpen: boolean;

  /** Callback when modal is closed */
  onClose: () => void;

  /** Callback after successful objection */
  onSuccess?: () => void;
}

interface ObjectionRequest {
  reason: string;
}

interface ObjectionResponse {
  id: string;
  orderId: string;
  disputeOpened: boolean;
  disputeId?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ObjectReleaseModal({
  item,
  isOpen,
  onClose,
  onSuccess,
}: ObjectReleaseModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { error: showError } = useToast();

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleClose = () => {
    if (isSubmitting) return;
    setReason('');
    setShowSuccess(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!item || !reason.trim()) {
      showError('İtiraz Nedeni Gerekli', 'Lütfen itiraz nedeninizi belirtin.');
      return;
    }

    setIsSubmitting(true);

    try {
      logger.info('[ObjectReleaseModal] Submitting objection', {
        orderId: item.orderId,
        reasonLength: reason.length,
      });

      // Call backend endpoint: POST /api/v1/orders/{orderId}/object-release
      const response = await apiClient.post<ObjectionResponse>(
        `/orders/${item.orderId}/object-release`,
        {
          reason: reason.trim(),
        } as ObjectionRequest
      );

      logger.info('[ObjectReleaseModal] Objection successful', {
        objectionId: response.id,
        disputeOpened: response.disputeOpened,
        disputeId: response.disputeId,
      });

      setShowSuccess(true);

      // Auto-close after 2 seconds
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        handleClose();
      }, 2000);
    } catch (error) {
      logger.error(
        '[ObjectReleaseModal] Objection failed',
        error instanceof Error ? error : new Error(String(error)),
        { orderId: item.orderId }
      );

      showError(
        'İtiraz Başarısız',
        error instanceof Error
          ? error.message
          : 'İtiraz kaydedilemedi. Lütfen tekrar deneyin.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!showSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Otomatik Serbest Bırakmaya İtiraz
              </DialogTitle>
              <DialogDescription>
                Bu işleme itiraz etmek otomatik olarak bir ihtilaf süreci
                başlatır.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Order Info */}
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {item.orderTitle || `Sipariş #${item.orderId}`}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Sipariş No: {item.orderId}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(item.amount, item.currency)}
                    </div>
                    <Badge variant="warning" className="mt-1">
                      {item.hoursRemaining} saat kaldı
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Warning Box */}
              <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
                <h5 className="flex items-center gap-2 font-medium text-orange-900 dark:text-orange-200">
                  <AlertTriangle className="h-4 w-4" />
                  İtirazın Sonuçları
                </h5>
                <ul className="mt-2 space-y-1 text-sm text-orange-800 dark:text-orange-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-600">•</span>
                    <span>Otomatik serbest bırakma iptal edilecek</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-600">•</span>
                    <span>Sipariş için otomatik ihtilaf süreci başlayacak</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-600">•</span>
                    <span>
                      Emanet tutar, ihtilaf çözülene kadar dondurulacak
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-600">•</span>
                    <span>
                      Destek ekibi her iki tarafla da iletişime geçecek
                    </span>
                  </li>
                </ul>
              </div>

              {/* Reason Input */}
              <div>
                <label
                  htmlFor="objection-reason"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  İtiraz Nedeni <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="objection-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="İtiraz nedeninizi detaylı bir şekilde açıklayın..."
                  rows={4}
                  maxLength={500}
                  className="resize-none"
                  disabled={isSubmitting}
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {reason.length}/500 karakter
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                <X className="mr-2 h-4 w-4" />
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={handleSubmit}
                disabled={isSubmitting || !reason.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    İtiraz Kaydediliyor...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    İtiraz Et ve İhtilaf Başlat
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                İtiraz Kaydedildi
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                İhtilaf süreci başlatıldı. Destek ekibimiz en kısa sürede
                sizinle iletişime geçecek.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Shield className="h-4 w-4" />
                <span>Emanet tutar güvende</span>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ObjectReleaseModal;
