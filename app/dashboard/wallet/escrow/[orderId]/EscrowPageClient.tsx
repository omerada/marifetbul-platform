'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EscrowActions } from '@/components/domains/wallet';
import { DisputeCreationModal } from '@/components/domains/disputes';
import { releasePaymentFromEscrow } from '../actions';
import type { DisputeResponse } from '@/types/dispute';

interface EscrowPageClientProps {
  paymentId: string;
  orderId: string;
  orderNumber: string;
  status:
    | 'HELD'
    | 'FROZEN'
    | 'RELEASED'
    | 'REFUNDED'
    | 'PARTIALLY_REFUNDED'
    | 'PENDING_RELEASE';
  userRole: 'BUYER' | 'SELLER';
  canRelease: boolean;
  canDispute: boolean;
}

export function EscrowPageClient({
  paymentId,
  orderId,
  orderNumber,
  status,
  userRole,
  canRelease,
  canDispute,
}: EscrowPageClientProps) {
  const router = useRouter();
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  const handleReleasePayment = async (_paymentId: string) => {
    const result = await releasePaymentFromEscrow(orderId);
    if (!result.success) {
      throw new Error(result.message);
    }
    toast.success('Başarılı', { description: result.message });
  };

  const handleOpenDispute = (_paymentId: string) => {
    setIsDisputeModalOpen(true);
  };

  const handleDisputeSuccess = (_dispute: DisputeResponse) => {
    toast.success('İtiraz Oluşturuldu', {
      description:
        'İtirazınız başarıyla kaydedildi. Yönetim ekibi inceleyecektir.',
    });
    // Refresh the page to show updated status
    router.refresh();
  };

  return (
    <>
      <EscrowActions
        paymentId={paymentId}
        orderId={orderId}
        status={status}
        userRole={userRole}
        canRelease={canRelease}
        canDispute={canDispute}
        onRelease={handleReleasePayment}
        onDispute={handleOpenDispute}
      />

      <DisputeCreationModal
        orderId={orderId}
        orderNumber={orderNumber}
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        onSuccess={handleDisputeSuccess}
      />
    </>
  );
}
