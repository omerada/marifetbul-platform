'use client';

/**
 * ================================================
 * REJECT PROPOSAL MODAL
 * ================================================
 * Production-ready modal for rejecting proposals with reason selection
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1: Proposal-to-Order Flow
 * @created 2025-11-10
 *
 * Features:
 * - Rejection reason selection (predefined options)
 * - Optional custom message to freelancer
 * - Proposal summary display
 * - Loading states and error handling
 * - Validation (reason required)
 * - Warning notice about irreversible action
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui';
import { Textarea } from '@/components/ui/Textarea';
import { XCircle, Loader2, AlertCircle } from 'lucide-react';
import type { ProposalResponse } from '@/types/backend-aligned';
import logger from '@/lib/infrastructure/monitoring/logger';
import { formatCurrency } from '@/lib/shared/formatters';

const REJECTION_REASONS = [
  { value: 'BUDGET_TOO_HIGH', label: 'Bütçe çok yüksek' },
  { value: 'TIMELINE_TOO_LONG', label: 'Teslimat süresi çok uzun' },
  { value: 'LACK_OF_EXPERIENCE', label: 'Yeterli deneyim yok' },
  { value: 'BETTER_PROPOSAL', label: 'Daha iyi bir teklif seçtim' },
  { value: 'PROJECT_CANCELLED', label: 'Proje iptal edildi' },
  { value: 'OTHER', label: 'Diğer' },
] as const;

export interface RejectProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (reason?: string, message?: string) => Promise<void>;
  proposal: ProposalResponse;
}

export function RejectProposalModal({
  isOpen,
  onClose,
  onReject,
  proposal,
}: RejectProposalModalProps) {
  const [reason, setReason] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      return;
    }

    try {
      setIsSubmitting(true);
      logger.info('Rejecting proposal', { proposalId: proposal.id, reason });
      await onReject(reason, message || undefined);
      
      // Reset form
      setReason('');
      setMessage('');
      onClose();
    } catch (error) {
      logger.error('Failed to reject proposal', error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      setMessage('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-6 w-6 text-red-600" />
            Teklifi Reddet
          </DialogTitle>
          <DialogDescription>
            Bu teklifi reddetmek istediğinizden emin misiniz? Freelancer
            bilgilendirilecektir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Proposal Summary */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-3 font-semibold text-gray-900">Teklif Özeti</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Freelancer:</span>
                <span className="font-medium text-gray-900">
                  {proposal.freelancerName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Teklif Tutarı:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(proposal.proposedBudget)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Teslimat Süresi:</span>
                <span className="font-medium text-gray-900">
                  {proposal.deliveryDays} gün
                </span>
              </div>
            </div>
          </div>

          {/* Rejection Reason */}
          <div>
            <label
              htmlFor="reason"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Ret Nedeni <span className="text-red-600">*</span>
            </label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Bir neden seçin...</option>
              {REJECTION_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Message */}
          <div>
            <label
              htmlFor="message"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              İsteğe Bağlı Mesaj
              <span className="ml-1 text-xs text-gray-500">(İsteğe bağlı)</span>
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Freelancer'a açıklama mesajı gönderin (isteğe bağlı)"
              rows={4}
              disabled={isSubmitting}
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500">
              Bu mesaj freelancer&apos;a bildirimle gönderilecektir.
            </p>
          </div>

          {/* Warning Notice */}
          <div className="rounded-lg bg-yellow-50 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
              <div>
                <h4 className="mb-1 font-medium text-yellow-900">Dikkat</h4>
                <p className="text-sm text-yellow-800">
                  Teklifi reddettikten sonra bu işlem geri alınamaz. Freelancer
                  bilgilendirilecek ve teklif durumu güncellenecektir.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            İptal
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting || !reason}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Reddediliyor...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Teklifi Reddet
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
