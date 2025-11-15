/**
 * ================================================
 * REJECT MILESTONE MODAL
 * ================================================
 * Employer modal for requesting milestone revision
 * Sprint 1 - Story 1.6 (8 pts)
 *
 * Features:
 * - Rejection reason (required)
 * - Character count
 * - Validation
 * - Warning about revision request
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Milestone Payment System
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { XCircle, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { useMilestoneActions } from '@/hooks/business/useMilestones';
import type { OrderMilestone } from '@/types/business/features/milestone';
import logger from '@/lib/infrastructure/monitoring/logger';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

export interface RejectMilestoneModalProps {
  /** Milestone to reject */
  milestone: OrderMilestone;
  /** Close modal callback */
  onClose: () => void;
  /** Success callback (optional) */
  onSuccess?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MIN_REASON_LENGTH = 20;
const MAX_REASON_LENGTH = 500;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * RejectMilestoneModal Component
 *
 * @example
 * ```tsx
 * <RejectMilestoneModal
 *   milestone={milestone}
 *   onClose={() => setShowModal(false)}
 *   onSuccess={() => refetchMilestones()}
 * />
 * ```
 */
export function RejectMilestoneModal({
  milestone,
  onClose,
  onSuccess,
}: RejectMilestoneModalProps) {
  const { rejectMilestone, isRejecting } = useMilestoneActions();

  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  // ========== VALIDATION ==========

  const validateReason = useCallback((text: string): string => {
    if (text.trim().length < MIN_REASON_LENGTH) {
      return `Revizyon nedeni en az ${MIN_REASON_LENGTH} karakter olmalıdır`;
    }
    if (text.length > MAX_REASON_LENGTH) {
      return `Revizyon nedeni en fazla ${MAX_REASON_LENGTH} karakter olabilir`;
    }
    return '';
  }, []);

  // ========== SUBMIT ==========

  const handleReject = useCallback(async () => {
    const validationError = validateReason(reason);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError('');

      await rejectMilestone(milestone.id, reason.trim());

      toast.success('Revizyon istendi 🔄', {
        description: 'Freelancer bilgilendirildi',
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      logger.error(
        '[RejectMilestone] Reject failed',
        err instanceof Error ? err : new Error(String(err))
      );
      setError(
        err instanceof Error
          ? err.message
          : 'Revizyon isteği gönderilemedi. Lütfen tekrar deneyin.'
      );
    }
  }, [
    reason,
    validateReason,
    rejectMilestone,
    milestone.id,
    onSuccess,
    onClose,
  ]);

  // ========== REASON CHANGE ==========

  const handleReasonChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setReason(value);

      // Clear error when user starts typing
      if (error) {
        setError('');
      }

      // Show validation error in real-time
      if (value.length > MAX_REASON_LENGTH) {
        setError(`Maksimum ${MAX_REASON_LENGTH} karakter`);
      }
    },
    [error]
  );

  // ========== RENDER ==========

  const canSubmit =
    reason.trim().length >= MIN_REASON_LENGTH &&
    reason.length <= MAX_REASON_LENGTH &&
    !isRejecting;

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
          className="relative w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b px-6 py-4">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  Revizyon İste
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

            {/* Info Alert */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Teslim edilen işte eksiklik veya hata varsa, freelancer&apos;dan
                revizyon isteyebilirsiniz. Lütfen neyin düzeltilmesi gerektiğini
                detaylı olarak açıklayın.
              </AlertDescription>
            </Alert>

            {/* Reason Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Revizyon Nedeni <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={handleReasonChange}
                placeholder="Neyin değiştirilmesi gerektiğini detaylı olarak açıklayın..."
                rows={6}
                className={`w-full rounded-lg border px-4 py-3 transition-shadow focus:border-transparent focus:ring-2 focus:ring-red-500 ${
                  error && reason.length > 0
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                disabled={isRejecting}
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Min {MIN_REASON_LENGTH} karakter gerekli
                </p>
                <span
                  className={`text-sm ${
                    reason.length > MAX_REASON_LENGTH
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}
                >
                  {reason.length} / {MAX_REASON_LENGTH}
                </span>
              </div>
            </div>

            {/* Warning Alert */}
            <Alert>
              <RefreshCw className="h-4 w-4" />
              <AlertDescription>
                <strong>Not:</strong> Revizyon isteğiniz freelancer&apos;a
                iletilecek. Milestone durumu &quot;Revizyon İstendi&quot; olarak
                güncellenecektir.
              </AlertDescription>
            </Alert>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4">
            <Button onClick={onClose} variant="outline" disabled={isRejecting}>
              İptal
            </Button>
            <Button
              onClick={() => void handleReject()}
              variant="destructive"
              disabled={!canSubmit}
              loading={isRejecting}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Revizyon İste
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}

export default RejectMilestoneModal;
