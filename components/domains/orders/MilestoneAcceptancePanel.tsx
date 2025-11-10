'use client';

/**
 * ================================================
 * MILESTONE ACCEPTANCE PANEL
 * ================================================
 * Panel for buyer to accept or reject delivered milestone
 *
 * Features:
 * - View delivery notes and attachments
 * - Accept milestone (releases payment)
 * - Reject milestone (opens revision modal)
 * - 2-step confirmation for payment release
 * - Production-ready error handling
 *
 * @version 1.0.0
 * @sprint Sprint 1 - Story 1.3 (Milestone Delivery & Acceptance)
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
import {
  CheckCircle,
  RefreshCw,
  Package,
  FileText,
  AlertTriangle,
  Download,
} from 'lucide-react';
import type { OrderMilestone } from '@/types/business/features/milestone';
import { useMilestoneActions } from '@/hooks/business/useMilestones';
import { MilestoneRevisionModal } from '@/components/domains/orders';
import { formatDate } from '@/lib/shared/formatters';

// ================================================
// TYPES
// ================================================

export interface MilestoneAcceptancePanelProps {
  /** Milestone to review */
  milestone: OrderMilestone;
  /** Modal open state */
  isOpen: boolean;
  /** Close modal callback */
  onClose: () => void;
  /** Success callback */
  onSuccess?: (milestone: OrderMilestone) => void;
}

// ================================================
// COMPONENT
// ================================================

export function MilestoneAcceptancePanel({
  milestone,
  isOpen,
  onClose,
  onSuccess,
}: MilestoneAcceptancePanelProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const { acceptMilestone, isAccepting } = useMilestoneActions();

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setShowConfirmation(false);
      setShowRevisionModal(false);
    }
  }, [isOpen]);

  // Handle accept click (show confirmation first)
  const handleAcceptClick = () => {
    setShowConfirmation(true);
  };

  // Handle confirmed acceptance
  const handleConfirmAccept = async () => {
    try {
      const updatedMilestone = await acceptMilestone(milestone.id);
      onSuccess?.(updatedMilestone);
      onClose();
    } catch (error) {
      logger.error('Milestone acceptance failed', error as Error);
      // Error toast already shown by hook
    }
  };

  // Handle reject click (open revision modal)
  const handleRejectClick = () => {
    setShowRevisionModal(true);
  };

  // Handle revision success
  const handleRevisionSuccess = (updatedMilestone: OrderMilestone) => {
    onSuccess?.(updatedMilestone);
    onClose();
  };

  return (
    <>
      {/* Main Acceptance Panel */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Milestone İnceleme
            </DialogTitle>
            <DialogDescription>
              Teslim edilen milestone&apos;ı inceleyin ve onaylayın veya
              revizyon talep edin
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            {/* Milestone Info */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {milestone.title}
                  </h4>
                  {milestone.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {milestone.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Tutar:</span>
                      <span className="font-semibold text-gray-900">
                        {new Intl.NumberFormat('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        }).format(milestone.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Sıra:</span>
                      <Badge variant="outline">{milestone.sequence}</Badge>
                    </div>
                    {milestone.deliveredAt && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Teslim Tarihi:</span>
                        <span className="text-gray-900">
                          {formatDate(milestone.deliveredAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Notes */}
            {milestone.deliveryNotes && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <h4 className="font-semibold text-gray-900">
                    Teslim Notları
                  </h4>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="whitespace-pre-wrap text-sm text-gray-700">
                    {milestone.deliveryNotes}
                  </p>
                </div>
              </div>
            )}

            {/* Attachments */}
            {milestone.attachments && milestone.attachments.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-gray-500" />
                  <h4 className="font-semibold text-gray-900">
                    Ekler ({milestone.attachments.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {milestone.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Dosya {index + 1}
                          </p>
                          <p className="text-xs text-gray-500">{attachment}</p>
                        </div>
                      </div>
                      <UnifiedButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(attachment, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </UnifiedButton>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmation Step */}
            {showConfirmation ? (
              <div className="space-y-4 rounded-lg border-2 border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">
                      Ödeme Serbest Bırakılacak
                    </p>
                    <p className="mt-1 text-sm text-green-700">
                      Bu milestone&apos;ı onayladığınızda{' '}
                      <span className="font-semibold">
                        {new Intl.NumberFormat('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        }).format(milestone.amount)}
                      </span>{' '}
                      tutarındaki ödeme satıcıya aktarılacaktır. Bu işlem geri
                      alınamaz.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UnifiedButton
                    type="button"
                    variant="outline"
                    onClick={() => setShowConfirmation(false)}
                    disabled={isAccepting}
                    className="flex-1"
                  >
                    İptal
                  </UnifiedButton>
                  <UnifiedButton
                    type="button"
                    variant="default"
                    onClick={handleConfirmAccept}
                    disabled={isAccepting}
                    loading={isAccepting}
                    className="flex-1"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isAccepting ? 'Onaylanıyor...' : 'Ödemeyi Onayla'}
                  </UnifiedButton>
                </div>
              </div>
            ) : (
              <>
                {/* Payment Release Info */}
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-900">
                        Önemli Bilgilendirme
                      </p>
                      <ul className="mt-2 space-y-1 text-yellow-700">
                        <li>
                          • Milestone&apos;ı onayladığınızda ödeme otomatik
                          olarak satıcıya aktarılır
                        </li>
                        <li>
                          • İş beklentilerinizi karşılamıyorsa revizyon talep
                          edebilirsiniz
                        </li>
                        <li>
                          • Revizyon talebi milestone&apos;ı satıcıya geri
                          gönderir
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-center gap-3 border-t pt-4">
                  <UnifiedButton
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isAccepting}
                    className="w-full sm:w-auto"
                  >
                    Kapat
                  </UnifiedButton>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <UnifiedButton
                      type="button"
                      variant="outline"
                      onClick={handleRejectClick}
                      disabled={isAccepting}
                      className="flex-1 sm:flex-none"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Revizyon İste
                    </UnifiedButton>
                    <UnifiedButton
                      type="button"
                      variant="default"
                      onClick={handleAcceptClick}
                      disabled={isAccepting}
                      className="flex-1 sm:flex-none"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Onayla
                    </UnifiedButton>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Revision Modal */}
      <MilestoneRevisionModal
        milestone={milestone}
        isOpen={showRevisionModal}
        onClose={() => setShowRevisionModal(false)}
        onSuccess={handleRevisionSuccess}
      />
    </>
  );
}

export default MilestoneAcceptancePanel;
