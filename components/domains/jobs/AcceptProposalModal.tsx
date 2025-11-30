'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { PaymentMode } from '@/types/business/features/order';
import { getSellerPaymentStatus } from '@/lib/api/users';
import { PaymentModeSelector } from '@/components/domains/payments/PaymentModeSelector';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Alert, AlertDescription } from '@/components/ui';
import logger from '@/lib/infrastructure/monitoring/logger';

interface AcceptProposalModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when proposal is accepted with payment mode */
  onAccept: (paymentMode: PaymentMode) => Promise<void>;
  /** Proposal details */
  proposal: {
    id: string;
    proposedBudget: number;
    freelancerName: string;
    freelancerId: string;
  };
  /** Seller IBAN status (optional - will be fetched if not provided) */
  sellerHasIban?: boolean;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * ================================================
 * ACCEPT PROPOSAL MODAL - Dual Payment System
 * ================================================
 * Modal for accepting a job proposal with payment mode selection
 * 
 * Features:
 * - Payment mode selection (ESCROW_PROTECTED vs MANUAL_IBAN)
 * - Fee calculation and comparison
 * - Seller IBAN validation
 * - Clear acceptance confirmation
 * 
 * @version 1.0.0 - Dual Payment System
 * @author MarifetBul Development Team
 */
export function AcceptProposalModal({
  isOpen,
  onClose,
  onAccept,
  proposal,
  sellerHasIban: initialSellerHasIban,
  isLoading = false,
}: AcceptProposalModalProps) {
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(
    PaymentMode.ESCROW_PROTECTED
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellerHasIban, setSellerHasIban] = useState(initialSellerHasIban ?? false);
  const [isLoadingPaymentStatus, setIsLoadingPaymentStatus] = useState(
    initialSellerHasIban === undefined
  );

  // Fetch seller payment status if not provided
  useEffect(() => {
    if (initialSellerHasIban !== undefined || !isOpen) return;

    const fetchSellerPaymentStatus = async () => {
      try {
        const status = await getSellerPaymentStatus(proposal.freelancerId);
        setSellerHasIban(status.hasValidIban);
        logger.debug('Seller payment status fetched in modal:', { status });
      } catch (error) {
        logger.error(
          'Failed to fetch seller payment status in modal:',
          error
        );
        setSellerHasIban(false);
      } finally {
        setIsLoadingPaymentStatus(false);
      }
    };

    fetchSellerPaymentStatus();
  }, [proposal.freelancerId, initialSellerHasIban, isOpen]);

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      await onAccept(paymentMode);
      onClose();
    } catch (error) {
      logger.error(
        'Failed to accept proposal:',
        error
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
            Teklifi Kabul Et
          </DialogTitle>
          <DialogDescription>
            {proposal.freelancerName} adlı freelancer&apos;ın teklifini kabul
            etmek için ödeme yöntemini seçin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Proposal Summary */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-2 font-medium text-gray-900">Teklif Özeti</h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Freelancer:</span>
              <span className="font-semibold">{proposal.freelancerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Teklif Tutarı:</span>
              <span className="text-lg font-bold text-green-600">
                ₺{proposal.proposedBudget.toLocaleString('tr-TR')}
              </span>
            </div>
          </div>

          {/* Payment Mode Selection */}
          <div>
            <h3 className="mb-3 font-medium text-gray-900">
              Ödeme Yöntemi Seçin
            </h3>
            <PaymentModeSelector
              value={paymentMode}
              onChange={setPaymentMode}
              orderAmount={proposal.proposedBudget}
              platformFeePercentage={5}
              sellerHasIban={sellerHasIban}
              sellerName={proposal.freelancerName}
              disabled={isLoadingPaymentStatus}
            />
          </div>

          {/* Important Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Önemli:</strong> Teklifi kabul ettikten sonra sipariş
              oluşturulacak ve seçtiğiniz ödeme yöntemine göre işlem
              başlatılacaktır. Ödeme yöntemi daha sonra değiştirilemez.
            </AlertDescription>
          </Alert>
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
            onClick={handleAccept}
            disabled={
              isSubmitting ||
              isLoading ||
              (paymentMode === PaymentMode.MANUAL_IBAN && !sellerHasIban)
            }
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Kabul Ediliyor...' : 'Teklifi Kabul Et'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
