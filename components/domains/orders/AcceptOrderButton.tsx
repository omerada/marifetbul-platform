'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { orderApi } from '@/lib/api/orders';
import logger from '@/lib/infrastructure/monitoring/logger';

interface AcceptOrderButtonProps {
  orderId: string;
  orderTitle: string;
  amount: number;
  onSuccess?: () => void;
}

export function AcceptOrderButton({
  orderId,
  orderTitle,
  amount,
  onSuccess,
}: AcceptOrderButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    try {
      setIsSubmitting(true);
      logger.info('Accepting order delivery', { orderId });

      const response = await orderApi.approveDelivery(orderId);

      if (!response.success) {
        const errorMsg =
          typeof response.error === 'string'
            ? response.error
            : 'Teslimat onaylanamadı';
        throw new Error(errorMsg);
      }

      toast.success('Sipariş başarıyla tamamlandı!', {
        description: "Ödeme freelancer'a aktarılacaktır.",
      });

      logger.info('Order delivery accepted successfully', { orderId });

      setIsOpen(false);
      onSuccess?.();
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Teslimat onaylanırken bir hata oluştu';
      toast.error('İşlem başarısız', {
        description: errorMessage,
      });
      logger.error('Failed to accept order delivery', new Error(errorMessage), {
        orderId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setIsOpen(true)}
        className="w-full"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Teslimi Onayla
      </Button>

      {/* Accept Confirmation Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teslimi Onayla</DialogTitle>
            <DialogDescription>
              Bu işlemi gerçekleştirmeden önce teslim edilen dosyaları kontrol
              edin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Order Info */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 font-medium text-gray-900">{orderTitle}</h4>
              <p className="text-sm text-gray-600">
                Sipariş Tutarı:{' '}
                <span className="font-semibold text-gray-900">
                  {amount.toLocaleString('tr-TR')} ₺
                </span>
              </p>
            </div>

            {/* Warning */}
            <div className="flex gap-3 rounded-lg bg-yellow-50 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Önemli Uyarı:</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>
                    Teslimi onayladıktan sonra ödeme freelancer&apos;a
                    aktarılacaktır
                  </li>
                  <li>Bu işlem geri alınamaz</li>
                  <li>
                    Herhangi bir sorun varsa &quot;Revizyon İste&quot; butonunu
                    kullanın
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirmation */}
            <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white p-4">
              <input
                type="checkbox"
                id="confirm-acceptance"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <label
                htmlFor="confirm-acceptance"
                className="text-sm text-gray-700"
              >
                Teslim edilen dosyaları inceledim ve siparişin tamamlandığını
                onaylıyorum.
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={isSubmitting}
              onClick={handleAccept}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Onayla ve Ödemeyi Yap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
