'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Textarea } from '@/components/ui/Textarea';
import { orderApi } from '@/lib/api/orders';
import logger from '@/lib/infrastructure/monitoring/logger';

const revisionSchema = z.object({
  reason: z
    .string()
    .min(20, 'Revizyon sebebi en az 20 karakter olmalıdır')
    .max(1000, 'Revizyon sebebi en fazla 1000 karakter olabilir'),
});

type RevisionFormData = z.infer<typeof revisionSchema>;

interface RequestRevisionButtonProps {
  orderId: string;
  orderTitle: string;
  onSuccess?: () => void;
}

export function RequestRevisionButton({
  orderId,
  orderTitle,
  onSuccess,
}: RequestRevisionButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RevisionFormData>({
    resolver: zodResolver(revisionSchema),
  });

  const onSubmit = async (data: RevisionFormData) => {
    try {
      setIsSubmitting(true);
      logger.info('Requesting order revision', { orderId });

      const response = await orderApi.requestRevision(orderId, {
        revisionNote: data.reason,
      });

      if (!response.success) {
        const errorMsg =
          typeof response.error === 'string'
            ? response.error
            : 'Revizyon talebi gönderilemedi';
        throw new Error(errorMsg);
      }

      toast.success('Revizyon talebi gönderildi', {
        description: 'Freelancer bilgilendirildi ve düzeltmeleri yapacaktır.',
      });

      logger.info('Order revision requested successfully', { orderId });

      setIsOpen(false);
      reset();
      onSuccess?.();
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Revizyon talebi gönderilirken bir hata oluştu';
      toast.error('İşlem başarısız', {
        description: errorMessage,
      });
      logger.error('Failed to request order revision', {
        orderId,
        error: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(true)}
        className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Revizyon İste
      </Button>

      {/* Revision Request Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revizyon Talebi</DialogTitle>
            <DialogDescription>
              Teslimdeki eksik veya yanlış kısımları detaylı olarak açıklayın.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Order Info */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-medium text-gray-900">{orderTitle}</h4>
            </div>

            {/* Warning */}
            <div className="flex gap-3 rounded-lg bg-blue-50 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Revizyon Hakkında:</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>
                    Hangi kısımların düzeltilmesi gerektiğini net belirtin
                  </li>
                  <li>
                    Freelancer düzeltmeleri yapıp yeniden teslim edecektir
                  </li>
                  <li>Revizyon süreci sipariş süresini uzatabilir</li>
                </ul>
              </div>
            </div>

            {/* Revision Reason */}
            <div>
              <label
                htmlFor="reason"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Revizyon Sebebi *
              </label>
              <Textarea
                id="reason"
                rows={6}
                placeholder="Örnek: Logo tasarımında renk tonları istendiği gibi olmamış. Ayrıca yazı tipinin daha modern bir font ile değiştirilmesini istiyorum..."
                {...register('reason')}
                className={errors.reason ? 'border-red-300' : ''}
                disabled={isSubmitting}
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.reason.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                En az 20, en fazla 1000 karakter (mevcut:{' '}
                {register('reason').name ? '0' : '0'})
              </p>
            </div>
          </form>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsOpen(false);
                reset();
              }}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              onClick={handleSubmit(onSubmit)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Revizyon Talebi Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
