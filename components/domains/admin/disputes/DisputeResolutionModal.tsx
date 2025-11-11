'use client';

/**
 * DisputeResolutionModal Component
 * Sprint 1: Order Dispute System - Admin
 *
 * Admin modal for resolving disputes
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { resolveDispute } from '@/lib/api/disputes';
import {
  DisputeResolutionType,
  disputeResolutionTypeLabels,
  type DisputeResponse,
  type DisputeResolutionRequest,
} from '@/types/dispute';
import { Button } from '@/components/ui';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { AlertCircle, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import logger from '@/lib/infrastructure/monitoring/logger';

// Validation schema
const resolutionFormSchema = z.object({
  resolutionType: z
    .nativeEnum(DisputeResolutionType)
    .refine((val) => val !== undefined, {
      message: 'Lütfen bir çözüm türü seçin',
    }),
  resolution: z
    .string()
    .min(20, 'Çözüm açıklaması en az 20 karakter olmalıdır')
    .max(2000, 'Çözüm açıklaması en fazla 2000 karakter olabilir'),
  refundAmount: z.number().optional(),
});

type ResolutionFormData = z.infer<typeof resolutionFormSchema>;

interface DisputeResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispute: DisputeResponse | null;
  orderTotalAmount?: number;
  onSuccess?: () => void;
}

export default function DisputeResolutionModal({
  isOpen,
  onClose,
  dispute,
  orderTotalAmount = 0,
  onSuccess,
}: DisputeResolutionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedResolutionType, setSelectedResolutionType] =
    useState<DisputeResolutionType | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ResolutionFormData>({
    resolver: zodResolver(resolutionFormSchema),
    defaultValues: {
      resolution: '',
      refundAmount: 0,
    },
  });

  const onSubmit = async (data: ResolutionFormData) => {
    if (!dispute) return;

    // Validate refund amount
    const refundAmount = data.refundAmount || 0;
    if (refundAmount > orderTotalAmount) {
      toast.error('Hata', {
        description: 'İade tutarı sipariş toplamını aşamaz',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const request: DisputeResolutionRequest = {
        resolutionType: data.resolutionType,
        resolution: data.resolution,
        refundAmount: refundAmount > 0 ? refundAmount : undefined,
      };

      await resolveDispute(dispute.id, request);

      // Optimistic update - immediately notify success
      toast.success('İtiraz Çözümlendi', {
        description: 'İtiraz başarıyla çözümlendi ve taraflar bilgilendirildi.',
        duration: 4000,
      });

      // Immediately trigger success callback for UI update
      onSuccess?.();

      reset();
      onClose();
    } catch (error) {
      logger.error('Failed to resolve dispute:', error);

      toast.error('İtiraz Çözümlenemedi', {
        description: 'Bir hata oluştu. Lütfen tekrar deneyin.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedResolutionType(null);
    onClose();
  };

  const characterCount = watch('resolution')?.length || 0;
  const refundAmountValue = watch('refundAmount');
  const refundAmount = refundAmountValue ? Number(refundAmountValue) : 0;
  const includesRefund =
    selectedResolutionType &&
    selectedResolutionType !== DisputeResolutionType.FAVOR_SELLER_NO_REFUND;

  if (!dispute) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>İtirazı Çözümle</DialogTitle>
          <DialogDescription>
            #{dispute.orderId.slice(0, 8)}... numaralı sipariş itirazını
            çözümleyiniz
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Dispute Info */}
          <div className="bg-muted/50 space-y-2 rounded-lg border p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">İtiraz Eden:</span>
              <span className="font-medium">
                {dispute.raisedByUserFullName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Neden:</span>
              <span className="font-medium">{dispute.reasonDisplayName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sipariş Tutarı:</span>
              <span className="font-medium">
                {orderTotalAmount.toFixed(2)} TL
              </span>
            </div>
          </div>

          {/* Dispute Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">İtiraz Açıklaması</label>
            <div className="bg-muted/30 rounded-md border p-3 text-sm">
              {dispute.description}
            </div>
          </div>

          {/* Resolution Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Çözüm Türü *</label>
            <Select
              onValueChange={(value) => {
                setValue('resolutionType', value as DisputeResolutionType, {
                  shouldValidate: true,
                });
                setSelectedResolutionType(value as DisputeResolutionType);
              }}
            >
              <SelectTrigger
                className="w-full"
                placeholder="Çözüm türünü seçin"
              />
              <SelectContent>
                {Object.entries(disputeResolutionTypeLabels).map(
                  ([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            {errors.resolutionType && (
              <p className="text-sm text-red-500">
                {errors.resolutionType.message}
              </p>
            )}
          </div>

          {/* Refund Amount */}
          {includesRefund && (
            <div className="space-y-2">
              <label className="text-sm font-medium">İade Tutarı (TL)</label>
              <div className="relative">
                <div className="absolute top-1/2 left-3 -translate-y-1/2">
                  <DollarSign className="text-muted-foreground h-4 w-4" />
                </div>
                <Input
                  {...register('refundAmount')}
                  type="number"
                  step="0.01"
                  min="0"
                  max={orderTotalAmount}
                  placeholder="0.00"
                  className="pl-9"
                />
              </div>
              {refundAmount > orderTotalAmount && (
                <p className="text-sm text-red-500">
                  İade tutarı sipariş toplamını ({orderTotalAmount.toFixed(2)}{' '}
                  TL) aşamaz
                </p>
              )}
              {errors.refundAmount && (
                <p className="text-sm text-red-500">
                  {errors.refundAmount.message}
                </p>
              )}
            </div>
          )}

          {/* Resolution Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Çözüm Açıklaması *</label>
            <Textarea
              {...register('resolution')}
              placeholder="Kararınızı ve gerekçesini detaylı olarak açıklayın..."
              className="min-h-[150px] resize-none"
              maxLength={2000}
            />
            <div className="text-muted-foreground flex justify-between text-sm">
              <span>Her iki tarafa da gönderilecek açıklama</span>
              <span
                className={
                  characterCount < 20
                    ? 'text-red-500'
                    : characterCount > 1900
                      ? 'text-yellow-500'
                      : ''
                }
              >
                {characterCount} / 2000
              </span>
            </div>
            {errors.resolution && (
              <p className="text-sm text-red-500">
                {errors.resolution.message}
              </p>
            )}
          </div>

          {/* Warning */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Bu kararı verdikten sonra, sipariş otomatik olarak güncellenecek
              ve her iki taraf bilgilendirilecektir. İade tutarı belirtilmişse,
              ödeme sistemi üzerinden otomatik işlem yapılacaktır.
            </AlertDescription>
          </Alert>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Çözümleniyor...' : 'İtirazı Çözümle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
