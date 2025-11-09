'use client';

/**
 * ================================================
 * REFUND CREATION FORM COMPONENT
 * ================================================
 * Form for creating refund requests from order page
 *
 * Features:
 * - Amount input with validation
 * - Reason category selection
 * - Description textarea
 * - Form validation
 * - Error handling
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 5, 2025
 * Sprint: Refund System Completion - Day 2.1
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { AlertCircle, DollarSign, FileText, Info } from 'lucide-react';
import { createRefund } from '@/lib/api/refunds';
import {
  RefundReasonCategory,
  getRefundReasonLabel,
} from '@/types/business/features/refund';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// VALIDATION SCHEMA
// ================================================

const refundSchema = z.object({
  amount: z
    .number()
    .positive("Tutar 0'dan büyük olmalıdır")
    .max(999999, 'Tutar çok yüksek'),
  reasonCategory: z
    .nativeEnum(RefundReasonCategory)
    .refine((val) => val !== undefined, 'Lütfen bir neden seçin'),
  description: z
    .string()
    .min(20, 'Açıklama en az 20 karakter olmalıdır')
    .max(1000, 'Açıklama en fazla 1000 karakter olabilir')
    .trim(),
});

type RefundFormData = z.infer<typeof refundSchema>;

// ================================================
// TYPES
// ================================================

interface RefundCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  maxAmount: number;
  onSuccess?: (refundId: string) => void;
}

// ================================================
// COMPONENT
// ================================================

export function RefundCreationForm({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  maxAmount,
  onSuccess,
}: RefundCreationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RefundFormData>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      amount: maxAmount,
      reasonCategory: undefined,
      description: '',
    },
  });

  const selectedAmount = watch('amount');

  // Handle form submission
  const onSubmit = async (data: RefundFormData) => {
    // Validate amount against order total
    if (data.amount > maxAmount) {
      toast.error('İade tutarı sipariş tutarından fazla olamaz');
      return;
    }

    setIsSubmitting(true);

    try {
      const refund = await createRefund({
        orderId,
        amount: data.amount,
        reasonCategory: data.reasonCategory,
        description: data.description,
      });

      toast.success('İade Talebi Oluşturuldu', {
        description: `İade talebiniz başarıyla oluşturuldu. Talep numarası: ${refund.id.slice(0, 8).toUpperCase()}`,
        duration: 5000,
      });

      reset();
      onClose();
      onSuccess?.(refund.id);
    } catch (error) {
      logger.error('Failed to create refund:', error as Error);
      toast.error('İade Talebi Oluşturulamadı', {
        description:
          'İade talebiniz oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  // Reason options
  const reasonOptions = Object.values(RefundReasonCategory).map((reason) => ({
    value: reason,
    label: getRefundReasonLabel(reason),
  }));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            İade Talebi Oluştur
          </DialogTitle>
          <DialogDescription>
            Sipariş <span className="font-semibold">{orderNumber}</span> için
            iade talebi oluşturun
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Amount Input */}
          <div>
            <Label htmlFor="amount" required>
              İade Tutarı
            </Label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-10"
                {...register('amount', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">
                {errors.amount.message}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Info className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                Maksimum: ₺{maxAmount.toLocaleString('tr-TR')}
              </span>
              {selectedAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setValue('amount', maxAmount)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  (Tümünü seç)
                </button>
              )}
            </div>
          </div>

          {/* Reason Category */}
          <div>
            <Label htmlFor="reasonCategory" required>
              İade Nedeni
            </Label>
            <select
              id="reasonCategory"
              {...register('reasonCategory')}
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Bir neden seçin</option>
              {reasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.reasonCategory && (
              <p className="mt-1 text-sm text-red-600">
                {errors.reasonCategory.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" required>
              Detaylı Açıklama
            </Label>
            <Textarea
              id="description"
              placeholder="İade talebinizin nedenini detaylı olarak açıklayın. Bu bilgi, talebinizin hızlı şekilde değerlendirilmesine yardımcı olacaktır..."
              rows={5}
              className="mt-2"
              {...register('description')}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              En az 20 karakter gereklidir
            </p>
          </div>

          {/* Info Alert */}
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="text-sm text-blue-900">
              <p className="font-medium">Önemli Bilgilendirme</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-blue-800">
                <li>İade talebiniz yönetici onayına gönderilecektir</li>
                <li>
                  Talep onaylandıktan sonra ödeme yönteminize iade edilecektir
                </li>
                <li>İade süreci genellikle 3-5 iş günü sürmektedir</li>
                <li>
                  Talep durumunu{' '}
                  <span className="font-semibold">İade Taleplerim</span>{' '}
                  sayfasından takip edebilirsiniz
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Gönderiliyor...' : 'İade Talebi Oluştur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
