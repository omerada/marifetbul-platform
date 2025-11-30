/**
 * ================================================
 * PROPOSAL SUBMIT MODAL
 * ================================================
 * Modal for freelancers to submit job proposals
 *
 * Features:
 * - Bid amount validation
 * - Delivery time selection
 * - Cover letter editor
 * - Portfolio attachment
 * - Form validation
 *
 * Sprint 1 - Epic 1.1 - Story 1.1.1
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Send, Loader2, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/shared/formatters';
import { useProposals } from '@/hooks/business/proposals/useProposals';
import type { JobResponse } from '@/types/backend-aligned';

// ================================================
// TYPES & SCHEMA
// ================================================

const proposalSchema = z.object({
  bidAmount: z
    .number({
      message: 'Geçerli bir tutar giriniz',
    })
    .positive('Teklif tutarı pozitif olmalıdır')
    .min(50, 'Minimum teklif tutarı 50 TL olmalıdır'),
  deliveryDays: z
    .number({
      message: 'Geçerli bir süre giriniz',
    })
    .int('Tam sayı giriniz')
    .positive('Teslimat süresi pozitif olmalıdır')
    .min(1, 'Minimum 1 gün olmalıdır')
    .max(365, 'Maximum 365 gün olabilir'),
  coverLetter: z
    .string({
      message: 'Ön yazı gereklidir',
    })
    .min(50, 'Ön yazı en az 50 karakter olmalıdır')
    .max(5000, 'Ön yazı en fazla 5000 karakter olabilir'),

  attachments: z.array(z.string()).optional(),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

export interface ProposalSubmitModalProps {
  job: JobResponse;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ================================================
// COMPONENT
// ================================================

export function ProposalSubmitModal({
  job,
  isOpen,
  onClose,
  onSuccess,
}: ProposalSubmitModalProps) {
  const { createProposal, isCreating } = useProposals();
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      bidAmount: job.budgetMin || undefined,
      deliveryDays: 7,
      coverLetter: '',
      attachments: [],
    },
  });

  const bidAmount = watch('bidAmount');
  const coverLetterLength = watch('coverLetter')?.length || 0;

  // ================================================
  // HANDLERS
  // ================================================

  const handleClose = () => {
    if (!isCreating) {
      reset();
      setSelectedAttachments([]);
      onClose();
    }
  };

  const onSubmit = async (data: ProposalFormData) => {
    try {
      await createProposal({
        jobId: job.id,
        bidAmount: data.bidAmount,
        deliveryTime: data.deliveryDays,
        coverLetter: data.coverLetter,
        attachments: selectedAttachments,
      });

      toast.success('Teklif başarıyla gönderildi!', {
        description: 'İşveren teklifinizi inceleyecektir.',
      });

      reset();
      setSelectedAttachments([]);
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Teklif gönderilemedi', {
        description:
          error instanceof Error ? error.message : 'Bir hata oluştu',
      });
    }
  };

  // ================================================
  // VALIDATION HELPERS
  // ================================================

  const getBidValidationMessage = () => {
    if (!bidAmount) return null;

    const min = job.budgetMin || 0;
    const max = job.budgetMax || Infinity;

    if (bidAmount < min) {
      return `Minimum bütçe: ${formatCurrency(min, 'TRY')}`;
    }
    if (max !== Infinity && bidAmount > max) {
      return `Maximum bütçe: ${formatCurrency(max, 'TRY')}`;
    }
    return null;
  };

  const validationMessage = getBidValidationMessage();

  // ================================================
  // RENDER
  // ================================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b p-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">İş Teklifi Gönder</h2>
            <p className="mt-1 text-sm text-gray-600">{job.title}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Budget Info */}
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">İşveren Bütçesi</p>
            <p className="mt-1 text-lg font-semibold text-blue-700">
              {job.budgetType === 'FIXED'
                ? formatCurrency(job.budgetMax || job.budgetMin || 0, 'TRY')
                : `${formatCurrency(job.budgetMin || 0, 'TRY')} - ${formatCurrency(job.budgetMax || 0, 'TRY')}`}
            </p>
          </div>

          {/* Bid Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teklif Tutarınız <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ₺
                </span>
                <input
                  type="number"
                  step="0.01"
                  {...register('bidAmount', { valueAsNumber: true })}
                  className={`w-full rounded-lg border ${
                    errors.bidAmount || validationMessage
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  } py-2 pl-8 pr-4 focus:outline-none focus:ring-2`}
                  placeholder="Örn: 5000"
                  disabled={isCreating}
                />
              </div>
              {errors.bidAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.bidAmount.message}</p>
              )}
              {validationMessage && !errors.bidAmount && (
                <p className="mt-1 text-sm text-yellow-600">{validationMessage}</p>
              )}
            </div>
          </div>

          {/* Delivery Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teslimat Süresi (Gün) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register('deliveryDays', { valueAsNumber: true })}
              className={`mt-1 w-full rounded-lg border ${
                errors.deliveryDays
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              } px-4 py-2 focus:outline-none focus:ring-2`}
              placeholder="Örn: 7"
              disabled={isCreating}
            />
            {errors.deliveryDays && (
              <p className="mt-1 text-sm text-red-600">{errors.deliveryDays.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              İşi ne kadar sürede tamamlayabileceğinizi belirtin
            </p>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ön Yazı <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('coverLetter')}
              rows={8}
              className={`mt-1 w-full rounded-lg border ${
                errors.coverLetter
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              } px-4 py-2 focus:outline-none focus:ring-2`}
              placeholder="Neden bu iş için doğru kişi olduğunuzu, deneyimlerinizi ve yaklaşımınızı anlatın..."
              disabled={isCreating}
            />
            <div className="mt-1 flex items-center justify-between">
              <div>
                {errors.coverLetter && (
                  <p className="text-sm text-red-600">{errors.coverLetter.message}</p>
                )}
              </div>
              <p
                className={`text-xs ${
                  coverLetterLength < 50
                    ? 'text-red-500'
                    : coverLetterLength > 2000
                      ? 'text-red-500'
                      : 'text-gray-500'
                }`}
              >
                {coverLetterLength} / 2000 karakter (min: 50)
              </p>
            </div>
          </div>

          {/* Attachments (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Portfolio Öğeleri (Opsiyonel)
            </label>
            <div className="mt-2 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
              <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                İlgili portfolyo öğelerinizi ekleyebilirsiniz
              </p>
              <p className="text-xs text-gray-500">Yakında aktif olacak</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isCreating}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isCreating} className="min-w-[120px]">
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Teklif Gönder
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
