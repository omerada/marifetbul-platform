'use client';

/**
 * Accept Proposal Modal
 * Modal for accepting a proposal with optional message
 */

'use client';

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
import { CheckCircle, Loader2 } from 'lucide-react';
import type { ProposalResponse } from '@/types/backend-aligned';
import logger from '@/lib/infrastructure/monitoring/logger';

export interface AcceptProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (message?: string) => Promise<void>;
  proposal: ProposalResponse;
}

export function AcceptProposalModal({
  isOpen,
  onClose,
  onAccept,
  proposal,
}: AcceptProposalModalProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onAccept(message || undefined);
      onClose();
    } catch (error) {
      logger.error('Failed to accept proposal', error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Teklifi Kabul Et
          </DialogTitle>
          <DialogDescription>
            Bu teklifi kabul etmek istediğinizden emin misiniz? Freelancer
            bilgilendirilecek ve iş başlayacaktır.
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
                <span className="font-semibold text-green-600">
                  {formatBudget(proposal.proposedBudget)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Teslimat Süresi:</span>
                <span className="font-medium text-gray-900">
                  {proposal.deliveryDays} gün
                </span>
              </div>
              {proposal.milestones && proposal.milestones.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kilometre Taşları:</span>
                  <span className="font-medium text-gray-900">
                    {proposal.milestones.length} adet
                  </span>
                </div>
              )}
            </div>
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
              placeholder="Freelancer'a bir mesaj gönderin (örn: Başlangıç tarihi, beklentiler, vb.)"
              rows={4}
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500">
              Bu mesaj freelancer&apos;a bildirimle gönderilecektir.
            </p>
          </div>

          {/* Important Notice */}
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-blue-900">Önemli Notlar:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>
                  Teklifi kabul ettikten sonra freelancer ile çalışmaya
                  başlayabilirsiniz.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>
                  İş detayları ve ödeme planı mesajlaşma bölümünde
                  görüşülecektir.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>
                  Diğer tüm teklifler otomatik olarak reddedilecektir.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            İptal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Kabul Ediliyor...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Teklifi Kabul Et
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
