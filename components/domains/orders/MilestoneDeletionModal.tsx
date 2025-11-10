'use client';

/**
 * ================================================
 * MILESTONE DELETION MODAL
 * ================================================
 * Confirmation modal for deleting a milestone
 *
 * Features:
 * - 2-step confirmation to prevent accidental deletion
 * - Cannot delete if status is DELIVERED or beyond
 * - Shows milestone details before deletion
 * - API integration with deleteMilestone
 * - Production-ready error handling
 *
 * @version 1.0.0
 * @sprint Sprint 2 - Story 2.3 (Milestone Deletion)
 * @author MarifetBul Development Team
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import logger from '@/lib/infrastructure/monitoring/logger';
import { Trash2, AlertTriangle, XCircle } from 'lucide-react';
import { useMilestoneActions } from '@/hooks/business/useMilestones';
import type { OrderMilestone } from '@/types/business/features/milestone';

// ================================================
// TYPES
// ================================================

export interface MilestoneDeletionModalProps {
  /** Milestone to delete */
  milestone: OrderMilestone;
  /** Order ID (for cache invalidation) */
  orderId: string;
  /** Currency */
  currency: string;
  /** Modal open state */
  isOpen: boolean;
  /** Close modal callback */
  onClose: () => void;
  /** Success callback */
  onSuccess?: () => void;
}

// ================================================
// CONSTANTS
// ================================================

// Non-deletable statuses
const NON_DELETABLE_STATUSES = ['DELIVERED', 'ACCEPTED', 'CANCELED'];

// ================================================
// COMPONENT
// ================================================

export function MilestoneDeletionModal({
  milestone,
  orderId,
  currency,
  isOpen,
  onClose,
  onSuccess,
}: MilestoneDeletionModalProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { deleteMilestone, isDeleting } = useMilestoneActions();

  // Check if deletable
  const isDeletable = !NON_DELETABLE_STATUSES.includes(milestone.status);

  // Reset confirmation when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setShowConfirmation(false);
    }
  }, [isOpen]);

  // Handle delete click (show confirmation first)
  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (!isDeletable) return;

    try {
      await deleteMilestone(milestone.id, orderId);
      onSuccess?.();
      onClose();
    } catch (error) {
      logger.error('Milestone deletion failed', error as Error);
      // Error toast already shown by hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Milestone Sil
          </DialogTitle>
          <DialogDescription>
            Bu milestone&apos;ı kalıcı olarak silmek istediğinizden emin
            misiniz?
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Milestone Info */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">#{milestone.sequence}</Badge>
                <span className="text-sm font-medium text-gray-700">
                  Milestone {milestone.sequence}
                </span>
              </div>
              <Badge
                variant={
                  milestone.status === 'PENDING'
                    ? 'secondary'
                    : milestone.status === 'IN_PROGRESS'
                    ? 'default'
                    : 'outline'
                }
              >
                {milestone.status}
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-gray-900">{milestone.title}</p>
              {milestone.description && (
                <p className="text-gray-600">{milestone.description}</p>
              )}
              <p className="text-gray-700">
                <span className="font-medium">Tutar:</span>{' '}
                {new Intl.NumberFormat('tr-TR', {
                  style: 'currency',
                  currency: currency || 'TRY',
                }).format(milestone.amount)}
              </p>
              {milestone.dueDate && (
                <p className="text-gray-700">
                  <span className="font-medium">Teslim Tarihi:</span>{' '}
                  {new Date(milestone.dueDate).toLocaleDateString('tr-TR')}
                </p>
              )}
            </div>
          </div>

          {/* Non-deletable warning */}
          {!isDeletable && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <div className="text-sm">
                <p className="font-medium text-red-900">Silinemez</p>
                <p className="mt-1 text-red-700">
                  Bu milestone {milestone.status} durumunda olduğu için
                  silinemez. Sadece PENDING veya IN_PROGRESS durumundaki
                  milestone&apos;lar silinebilir.
                </p>
              </div>
            </div>
          )}

          {/* Confirmation step */}
          {showConfirmation && isDeletable ? (
            <div className="space-y-4 rounded-lg border-2 border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900">
                    Kalıcı Silme İşlemi
                  </p>
                  <p className="mt-1 text-sm text-red-700">
                    Bu milestone kalıcı olarak silinecektir. Bu işlem geri
                    alınamaz. Silinen milestone verilerini kurtaramazsınız.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <UnifiedButton
                  type="button"
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  İptal
                </UnifiedButton>
                <UnifiedButton
                  type="button"
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  loading={isDeleting}
                  className="flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
                </UnifiedButton>
              </div>
            </div>
          ) : (
            isDeletable && (
              <>
                {/* Warning */}
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-900">Uyarı</p>
                      <ul className="mt-2 space-y-1 text-yellow-700">
                        <li>• Bu işlem geri alınamaz</li>
                        <li>• Milestone verileri kalıcı olarak silinir</li>
                        <li>
                          • Diğer milestone&apos;ların sıra numaraları
                          değişmez
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 border-t pt-4">
                  <UnifiedButton
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isDeleting}
                  >
                    İptal
                  </UnifiedButton>
                  <UnifiedButton
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sil
                  </UnifiedButton>
                </div>
              </>
            )
          )}

          {/* Non-deletable action */}
          {!isDeletable && (
            <div className="flex items-center justify-end border-t pt-4">
              <UnifiedButton
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Kapat
              </UnifiedButton>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MilestoneDeletionModal;
