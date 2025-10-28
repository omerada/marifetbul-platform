/**
 * DisputeModal Component
 * Sprint 1: Order Dispute System - Updated
 *
 * Modal for raising disputes on orders using new API
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { raiseDispute } from '@/lib/api/disputes';
import type { DisputeRequest } from '@/types/dispute';
import DisputeForm from '@/components/forms/DisputeForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber?: string;
  onSuccess?: () => void;
}

export function DisputeModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  onSuccess,
}: DisputeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: DisputeRequest) => {
    setIsSubmitting(true);

    try {
      await raiseDispute(data);

      toast.success('İtiraz Başarıyla Gönderildi', {
        description:
          'İtirazınız alındı. Müşteri destek ekibimiz en kısa sürede inceleyecektir.',
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to raise dispute:', error);

      toast.error('İtiraz Gönderilemedi', {
        description: 'Bir hata oluştu. Lütfen tekrar deneyin.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>İtiraz Aç</DialogTitle>
          <DialogDescription>
            {orderNumber
              ? `${orderNumber} numaralı sipariş için itiraz açıyorsunuz.`
              : 'Siparişiniz için itiraz açıyorsunuz.'}
          </DialogDescription>
        </DialogHeader>

        <DisputeForm
          orderId={orderId}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
