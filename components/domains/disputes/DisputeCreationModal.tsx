'use client';

/**
 * ================================================
 * DISPUTE CREATION MODAL
 * ================================================
 * Modal for creating a new dispute for an order
 *
 * Features:
 * - Dispute reason selection (dropdown)
 * - Description textarea with character limit
 * - Evidence upload (multiple files/images)
 * - Form validation with Zod
 * - API integration
 * - Loading states
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 1.2: Dispute Creation Modal
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { X, AlertCircle, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { raiseDispute } from '@/lib/api/disputes';
import {
  DisputeReason,
  disputeReasonLabels,
  type DisputeRequest,
  type DisputeResponse,
} from '@/types/dispute';
import { EvidenceUpload } from './EvidenceUpload';

// ================================================
// TYPES & VALIDATION
// ================================================

const disputeCreationSchema = z.object({
  reason: z.nativeEnum(DisputeReason).refine((val) => val !== undefined, {
    message: 'Lütfen bir itiraz nedeni seçin',
  }),
  description: z
    .string()
    .min(50, 'Açıklama en az 50 karakter olmalıdır')
    .max(2000, 'Açıklama en fazla 2000 karakter olabilir'),
  evidenceUrls: z.array(z.string().url()).optional(),
});

type DisputeCreationFormData = z.infer<typeof disputeCreationSchema>;

interface DisputeCreationModalProps {
  /** Order ID to create dispute for */
  orderId: string;
  /** Order number for display */
  orderNumber: string;
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when dispute is successfully created */
  onSuccess?: (dispute: DisputeResponse) => void;
}

// ================================================
// COMPONENT
// ================================================

export function DisputeCreationModal({
  orderId,
  orderNumber,
  isOpen,
  onClose,
  onSuccess,
}: DisputeCreationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedEvidenceUrls, setUploadedEvidenceUrls] = useState<string[]>(
    []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<DisputeCreationFormData>({
    resolver: zodResolver(disputeCreationSchema),
    defaultValues: {
      description: '',
      evidenceUrls: [],
    },
  });

  const description = watch('description');
  const descriptionLength = description?.length || 0;

  // Handle form submission
  const onSubmit = async (data: DisputeCreationFormData) => {
    try {
      setIsSubmitting(true);

      const request: DisputeRequest = {
        orderId,
        reason: data.reason,
        description: data.description,
        evidenceUrls: uploadedEvidenceUrls,
      };

      const dispute = await raiseDispute(request);

      toast.success('İtiraz Oluşturuldu', {
        description:
          'İtirazınız başarıyla oluşturuldu. Yönetim ekibi en kısa sürede inceleyecektir.',
      });

      // Reset form
      reset();
      setUploadedEvidenceUrls([]);

      // Call success callback
      if (onSuccess) {
        onSuccess(dispute);
      }

      // Close modal
      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'İtiraz oluşturulurken bir hata oluştu';
      toast.error('Hata', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    setUploadedEvidenceUrls([]);
    onClose();
  };

  // Handle evidence upload success (for future use in Story 1.3)
  const handleEvidenceUploaded = (urls: string[]) => {
    setUploadedEvidenceUrls(urls);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <Card className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                İtiraz Aç
              </h2>
              <p className="text-sm text-gray-600">
                Sipariş #{orderNumber} için itiraz oluşturun
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* Warning Message */}
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-yellow-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Önemli Bilgilendirme</p>
              <p className="mt-1">
                İtiraz süreci ciddi bir işlemdir. Lütfen geçerli bir neden
                belirtin ve kanıtlarınızı ekleyin. Yönetim ekibimiz
                inceleyecektir.
              </p>
            </div>
          </div>

          {/* Dispute Reason */}
          <div className="mb-6">
            <label
              htmlFor="reason"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              İtiraz Nedeni <span className="text-red-500">*</span>
            </label>
            <select
              id="reason"
              {...register('reason')}
              disabled={isSubmitting}
              className={`w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 ${
                errors.reason
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <option value="">Bir neden seçin...</option>
              {Object.entries(disputeReasonLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            {errors.reason && (
              <p className="mt-2 text-sm text-red-600">
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Detaylı Açıklama <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-xs ${
                  descriptionLength < 50
                    ? 'text-red-500'
                    : descriptionLength > 2000
                      ? 'text-red-500'
                      : 'text-gray-500'
                }`}
              >
                {descriptionLength}/2000 karakter
                {descriptionLength < 50 && ` (en az 50)`}
              </span>
            </div>
            <textarea
              id="description"
              {...register('description')}
              disabled={isSubmitting}
              rows={8}
              placeholder="İtirazınızı detaylı bir şekilde açıklayın. Ne oldu? Beklentiniz neydi? Nasıl bir çözüm bekliyorsunuz?"
              className={`w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 ${
                errors.description
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              <FileText className="mr-1 inline h-3 w-3" />
              Lütfen sorunu net bir şekilde açıklayın ve mümkünse zaman
              çizelgesi ekleyin.
            </p>
          </div>

          {/* Evidence Upload */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Kanıtlar (Opsiyonel)
            </label>
            <EvidenceUpload
              onFilesChange={handleEvidenceUploaded}
              disabled={isSubmitting}
              maxFiles={5}
              maxSizeMB={10}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Oluşturuluyor...
                </>
              ) : (
                'İtirazı Oluştur'
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>İpucu:</strong> İtirazınız oluşturulduktan sonra yönetim
              ekibimiz 24-48 saat içinde inceleyecektir. Süreci hızlandırmak
              için lütfen tüm gerekli bilgileri ve kanıtları ekleyin.
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default DisputeCreationModal;
