/**
 * ================================================
 * ACCEPT MILESTONE MODAL
 * ================================================
 * Employer modal for accepting delivered milestone
 * Sprint 1 - Story 1.5 (13 pts)
 *
 * Features:
 * - Review delivered work
 * - View attached files
 * - Confirm payment release
 * - Escrow warning
 * - Success state with confetti
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Milestone Payment System
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Alert, AlertDescription } from '@/components/ui';
import {
  CheckCircle2,
  AlertCircle,
  DollarSign,
  FileText,
  Download,
  Shield,
  Info,
} from 'lucide-react';
import { useMilestoneActions } from '@/hooks/business/useMilestones';
import type { OrderMilestone } from '@/types/business/features/milestone';
import { formatMilestoneAmount } from '@/types/business/features/milestone';
import { formatDate } from '@/lib/shared/utils/date';
import logger from '@/lib/infrastructure/monitoring/logger';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

export interface AcceptMilestoneModalProps {
  /** Milestone to accept */
  milestone: OrderMilestone;
  /** Close modal callback */
  onClose: () => void;
  /** Success callback (optional) */
  onSuccess?: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AcceptMilestoneModal Component
 *
 * @example
 * ```tsx
 * <AcceptMilestoneModal
 *   milestone={milestone}
 *   onClose={() => setShowModal(false)}
 *   onSuccess={() => refetchMilestones()}
 * />
 * ```
 */
export function AcceptMilestoneModal({
  milestone,
  onClose,
  onSuccess,
}: AcceptMilestoneModalProps) {
  const { acceptMilestone, isAccepting } = useMilestoneActions();

  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  // ========== SUBMIT ==========

  const handleAccept = useCallback(async () => {
    if (!confirmed) {
      setError('Lütfen ödeme serbest bırakma onayını işaretleyin');
      return;
    }

    try {
      setError('');

      await acceptMilestone(milestone.id);

      toast.success('Milestone onaylandı! 💰', {
        description: "Ödeme freelancer'a aktarıldı",
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      logger.error(
        '[AcceptMilestone] Accept failed',
        err instanceof Error ? err : new Error(String(err))
      );
      setError(
        err instanceof Error
          ? err.message
          : 'Milestone onaylanamadı. Lütfen tekrar deneyin.'
      );
    }
  }, [confirmed, acceptMilestone, milestone.id, onSuccess, onClose]);

  // ========== RENDER ==========

  const attachments = milestone.attachments || [];
  const hasAttachments = attachments.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card
          className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  Milestone&apos;ı Onayla
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  #{milestone.sequence} - {milestone.title}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-6 p-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Payment Info */}
            <div className="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-5">
              <div className="flex items-start gap-3">
                <DollarSign className="mt-0.5 h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Ödeme Tutarı</h3>
                  <p className="mt-1 text-2xl font-bold text-purple-600">
                    {formatMilestoneAmount(
                      milestone.amount,
                      milestone.currency
                    )}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Bu tutar escrow&apos;dan serbest bırakılacak ve
                    freelancer&apos;a aktarılacaktır.
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Notes */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText className="h-4 w-4" />
                Teslim Notları
              </label>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="whitespace-pre-wrap text-gray-700">
                  {milestone.deliveryNotes || 'Teslim notu bulunmuyor'}
                </p>
              </div>
              {milestone.deliveredAt && (
                <p className="mt-2 text-xs text-gray-500">
                  Teslim tarihi: {formatDate(milestone.deliveredAt)}
                </p>
              )}
            </div>

            {/* Attachments */}
            {hasAttachments && (
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Download className="h-4 w-4" />
                  Ek Dosyalar ({attachments.length})
                </label>
                <div className="space-y-2">
                  {attachments.map((url, index) => {
                    const fileName =
                      url.split('/').pop() || `Dosya ${index + 1}`;
                    return (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 transition-colors hover:bg-blue-100"
                      >
                        <Download className="h-5 w-5 flex-shrink-0 text-blue-600" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Görüntülemek için tıklayın
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Warning Alert */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Dikkat:</strong> Milestone&apos;ı onayladığınızda ödeme{' '}
                <strong>geri alınamaz</strong> şekilde freelancer&apos;a
                aktarılacaktır. İşin tamamlandığından emin olun.
              </AlertDescription>
            </Alert>

            {/* Confirmation Checkbox */}
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => {
                    setConfirmed(e.target.checked);
                    if (error) setError('');
                  }}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  disabled={isAccepting}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    İşi inceledim ve kabul ediyorum
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    {formatMilestoneAmount(
                      milestone.amount,
                      milestone.currency
                    )}{' '}
                    tutarının freelancer&apos;a aktarılmasını onaylıyorum. Bu
                    işlem geri alınamaz.
                  </p>
                </div>
              </label>
            </div>

            {/* Info Alert */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                İşte sorun varsa &quot;Revizyon İste&quot; butonuna basarak
                düzeltme talep edebilirsiniz.
              </AlertDescription>
            </Alert>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4">
            <Button onClick={onClose} variant="outline" disabled={isAccepting}>
              İptal
            </Button>
            <Button
              onClick={() => void handleAccept()}
              variant="primary"
              disabled={!confirmed || isAccepting}
              loading={isAccepting}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Onayla & Ödemeyi Serbest Bırak
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}

export default AcceptMilestoneModal;
