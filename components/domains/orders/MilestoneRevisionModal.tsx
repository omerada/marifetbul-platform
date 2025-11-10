'use client';

/**
 * ================================================
 * MILESTONE REVISION MODAL
 * ================================================
 * Modal for buyer to request milestone revision
 *
 * Features:
 * - Revision reason textarea
 * - Character counter
 * - Validation
 * - Optimistic updates
 *
 * @version 1.0.0
 * @sprint Sprint 1 - Story 3 (Milestone Revision UI)
 * @author MarifetBul Development Team
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import logger from '@/lib/infrastructure/monitoring/logger';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { OrderMilestone } from '@/types/business/features/milestone';
import { useMilestoneActions } from '@/hooks/business/useMilestones';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export interface MilestoneRevisionModalProps {
  /** Milestone to request revision for */
  milestone: OrderMilestone;
  /** Modal open state */
  isOpen: boolean;
  /** Close modal callback */
  onClose: () => void;
  /** Success callback */
  onSuccess?: (milestone: OrderMilestone) => void;
}

// ================================================
// CONSTANTS
// ================================================

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 500;

// ================================================
// COMPONENT
// ================================================

export function MilestoneRevisionModal({
  milestone,
  isOpen,
  onClose,
  onSuccess,
}: MilestoneRevisionModalProps) {
  const [reason, setReason] = useState('');
  const { rejectMilestone, isRejecting } = useMilestoneActions();

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setReason('');
    }
  }, [isOpen]);

  // Validation
  const isValid = reason.trim().length >= MIN_REASON_LENGTH;
  const remainingChars = MAX_REASON_LENGTH - reason.length;

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) return;

    try {
      const updatedMilestone = await rejectMilestone(
        milestone.id,
        reason.trim()
      );
      onSuccess?.(updatedMilestone);
      onClose();
    } catch (error) {
      logger.error('Revision request failed', error as Error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Revizyon Talebi</DialogTitle>
          <DialogDescription>
            Milestone&apos;ı reddet ve satıcıdan revizyon talep et
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* Warning Alert */}
          <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
            <div className="text-sm">
              <p className="font-medium text-yellow-900">
                Revizyon Talebi Gönderilecek
              </p>
              <p className="mt-1 text-yellow-700">
                Milestone reddedilecek ve satıcıdan revizyon istenecektir.
                Lütfen nedenini açıkça belirtin.
              </p>
            </div>
          </div>

          {/* Milestone Info */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="mb-2 text-sm font-medium text-gray-900">
              Milestone Bilgisi
            </h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Başlık:</span> {milestone.title}
              </p>
              <p>
                <span className="font-medium">Tutar:</span>{' '}
                {new Intl.NumberFormat('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                }).format(milestone.amount)}
              </p>
              <p>
                <span className="font-medium">Sıra:</span> {milestone.sequence}
              </p>
            </div>
          </div>

          {/* Reason Field */}
          <div className="space-y-2">
            <Label htmlFor="revision-reason" required>
              Revizyon Nedeni
            </Label>
            <Textarea
              id="revision-reason"
              value={reason}
              onChange={(e) =>
                setReason(e.target.value.slice(0, MAX_REASON_LENGTH))
              }
              placeholder="Lütfen nelerin değiştirilmesini istediğinizi detaylı bir şekilde açıklayın..."
              rows={5}
              className={cn(
                'resize-none',
                reason.trim().length > 0 &&
                  !isValid &&
                  'border-red-300 focus:border-red-500'
              )}
              disabled={isRejecting}
              required
            />

            {/* Character Counter */}
            <div className="flex items-center justify-between text-sm">
              <span
                className={cn(
                  'text-gray-500',
                  reason.trim().length > 0 && !isValid && 'text-red-600'
                )}
              >
                {reason.trim().length > 0 && !isValid && (
                  <>En az {MIN_REASON_LENGTH} karakter gerekli</>
                )}
              </span>
              <span
                className={cn(
                  'text-gray-500',
                  remainingChars < 50 && 'text-yellow-600',
                  remainingChars === 0 && 'text-red-600'
                )}
              >
                {remainingChars} / {MAX_REASON_LENGTH}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <UnifiedButton
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isRejecting}
            >
              İptal
            </UnifiedButton>
            <UnifiedButton
              type="submit"
              variant="destructive"
              disabled={!isValid || isRejecting}
              loading={isRejecting}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {isRejecting ? 'Gönderiliyor...' : 'Revizyon Talep Et'}
            </UnifiedButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default MilestoneRevisionModal;
