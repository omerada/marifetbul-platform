/**
 * ================================================
 * CREATE DISPUTE MODAL - DEPRECATED
 * ================================================
 * @deprecated Since 2025-11-07 - Sprint 3: Duplicate Cleanup
 *
 * **Replaced by:** DisputeCreationModal.tsx (components/domains/disputes/)
 *
 * **Reason for Deprecation:**
 * - Duplicate functionality with DisputeCreationModal
 * - DisputeCreationModal has more features (evidence upload, better validation)
 * - DisputeCreationModal is actively used (2 locations found)
 * - This modal is unused (no imports found in codebase)
 * - DisputeCreationModal is more comprehensive (334 lines vs 179 lines)
 *
 * **Active Usage:**
 * - app/dashboard/orders/[id]/page.tsx → Uses DisputeCreationModal ✓
 * - app/dashboard/wallet/escrow/[orderId]/EscrowPageClient.tsx → Uses DisputeCreationModal ✓
 *
 * **Migration:**
 * ```tsx
 * // Old (UNUSED):
 * import { CreateDisputeModal } from '@/components/disputes/CreateDisputeModal';
 * <CreateDisputeModal
 *   orderId={orderId}
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   onSuccess={onSuccess}
 * />
 *
 * // New (ACTIVE):
 * import { DisputeCreationModal } from '@/components/domains/disputes';
 * <DisputeCreationModal
 *   orderId={orderId}
 *   orderNumber={orderNumber}
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   onSuccess={onSuccess}
 * />
 * ```
 *
 * **Timeline:** Will be DELETED in Sprint 4 - NO ACTIVE USAGE FOUND
 *
 * @version 1.0.0 (DEPRECATED - UNUSED)
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { useCreateDispute } from '@/hooks/business/disputes';
import { createDisputeSchema } from '@/lib/validation/dispute-validation';
import { DisputeReason, disputeReasonLabels } from '@/types/dispute';
import type { CreateDisputeFormData } from '@/types/dispute';

interface CreateDisputeModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateDisputeModal({
  orderId,
  isOpen,
  onClose,
  onSuccess,
}: CreateDisputeModalProps) {
  const [selectedReason, setSelectedReason] = useState<DisputeReason | ''>('');
  const { createDispute, isLoading, error: createError } = useCreateDispute();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateDisputeFormData>({
    resolver: zodResolver(createDisputeSchema),
    defaultValues: {
      orderId,
      description: '',
    },
  });

  const handleReasonChange = (value: string) => {
    const reason = value as DisputeReason;
    setSelectedReason(reason);
    setValue('reason', reason, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateDisputeFormData) => {
    try {
      await createDispute(data);
      reset();
      setSelectedReason('');
      onSuccess?.();
      onClose();
    } catch (err) {
      // Error handled by useCreateDispute hook
      console.error('Failed to create dispute:', err);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>İtiraz Oluştur</DialogTitle>
          <DialogDescription>
            Siparişle ilgili bir sorun mu yaşadınız? İtiraz açarak sorununuzu
            çözüme kavuşturabiliriz.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              İtiraz Nedeni <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedReason} onValueChange={handleReasonChange}>
              <SelectTrigger
                className={errors.reason ? 'border-red-500' : ''}
              />
              <SelectContent>
                {Object.entries(disputeReasonLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reason && (
              <p className="text-sm text-red-500">{errors.reason.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Açıklama <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Sorununuzu detaylı bir şekilde açıklayın (min. 50 karakter)"
              rows={6}
              className={errors.description ? 'border-red-500' : ''}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Lütfen sorununuzu mümkün olduğunca detaylı açıklayın. Bu, çözüm
              sürecini hızlandıracaktır.
            </p>
          </div>

          {/* Error Alert */}
          {createError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {typeof createError === 'string'
                  ? createError
                  : 'İtiraz oluşturulurken bir hata oluştu'}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                'İtiraz Oluştur'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
