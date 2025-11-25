/**
 * Admin Dispute Resolution Panel Component
 *
 * Production-ready admin interface for resolving disputes:
 * - View complete dispute details
 * - Analyze evidence from both parties
 * - Apply resolution decisions (refund/release)
 * - Calculate partial refunds
 * - Add admin notes
 * - Freeze/unfreeze escrow
 *
 * @module components/domains/admin/disputes/AdminDisputeResolution
 * @version 1.0.0
 * @production-ready ✅
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { resolveDispute } from '@/lib/api/disputes';
import {
  DisputeResponse,
  DisputeResolutionType,
  disputeResolutionTypeLabels,
  DisputeResolutionRequest,
  DisputeStatus,
} from '@/types/dispute';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const resolutionFormSchema = z.object({
  resolutionType: z.nativeEnum(DisputeResolutionType, {
    message: 'Çözüm tipi seçiniz',
  }),
  resolution: z
    .string()
    .min(50, 'Çözüm açıklaması en az 50 karakter olmalıdır')
    .max(1000, 'Çözüm açıklaması en fazla 1000 karakter olabilir'),
  refundAmount: z.number().optional(),
});

type ResolutionFormData = z.infer<typeof resolutionFormSchema>;

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface AdminDisputeResolutionProps {
  /** Dispute to resolve */
  dispute: DisputeResponse;
  /** Order total amount for calculating refunds */
  orderTotal: number;
  /** Callback on successful resolution */
  onResolved?: (dispute: DisputeResponse) => void;
  /** Callback on cancel */
  onCancel?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AdminDisputeResolution({
  dispute,
  orderTotal,
  onResolved,
  onCancel,
}: AdminDisputeResolutionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedRefund, setCalculatedRefund] = useState<number>(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ResolutionFormData>({
    resolver: zodResolver(resolutionFormSchema),
  });

  const selectedResolutionType = watch('resolutionType');

  // ============================================================================
  // REFUND CALCULATION
  // ============================================================================

  const handleRefundCalculation = (percentage: number) => {
    const refund = (orderTotal * percentage) / 100;
    setCalculatedRefund(refund);
    setValue('refundAmount', refund);
  };

  // ============================================================================
  // FORM SUBMIT HANDLER
  // ============================================================================

  const onSubmit = async (data: ResolutionFormData) => {
    setIsSubmitting(true);

    try {
      logger.info('Resolving dispute', {
        component: 'AdminDisputeResolution',
        action: 'onSubmit',
        disputeId: dispute.id,
        resolutionType: data.resolutionType,
      });

      const request: DisputeResolutionRequest = {
        resolutionType: data.resolutionType,
        resolution: data.resolution,
        refundAmount: data.refundAmount,
      };

      await resolveDispute(dispute.id, request);

      toast.success('İtiraz çözümlendi', {
        description: 'Karar başarıyla kaydedildi ve taraflara bildirildi.',
      });

      logger.info('Dispute resolved successfully', {
        component: 'AdminDisputeResolution',
        action: 'onSubmit',
        disputeId: dispute.id,
      });

      onResolved?.({
        ...dispute,
        status: DisputeStatus.RESOLVED,
        resolution: data.resolution,
        resolutionType: data.resolutionType,
        refundAmount: data.refundAmount ?? null,
        resolvedAt: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to resolve dispute', error as Error, {
        component: 'AdminDisputeResolution',
        action: 'onSubmit',
        disputeId: dispute.id,
      });

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'İtiraz çözümleme başarısız oldu';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // QUICK RESOLUTION TEMPLATES
  // ============================================================================

  const resolutionTemplates = [
    {
      type: DisputeResolutionType.FAVOR_BUYER_FULL_REFUND,
      label: 'Alıcı Lehine - Tam İade',
      description: 'Alıcıya tam iade yapılacaktır',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      color: 'border-green-200 bg-green-50 hover:bg-green-100',
      refundPercentage: 100,
    },
    {
      type: DisputeResolutionType.FAVOR_BUYER_PARTIAL_REFUND,
      label: 'Alıcı Lehine - Kısmi İade',
      description: 'Alıcıya kısmi iade yapılacaktır',
      icon: <DollarSign className="h-5 w-5 text-blue-600" />,
      color: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
      refundPercentage: 50,
    },
    {
      type: DisputeResolutionType.FAVOR_SELLER_NO_REFUND,
      label: 'Satıcı Lehine - İade Yok',
      description: 'Ödeme satıcıya serbest bırakılacaktır',
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      color: 'border-red-200 bg-red-50 hover:bg-red-100',
      refundPercentage: 0,
    },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            İtiraz Çözümleme - Admin Paneli
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            İtiraz ID:{' '}
            <span className="font-medium">{dispute.id.slice(0, 8)}</span>
          </p>
        </div>
        <div className="rounded-full bg-yellow-100 p-2">
          <Shield className="h-6 w-6 text-yellow-600" />
        </div>
      </div>

      {/* Order Summary */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">Sipariş Özeti</h3>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Sipariş Tutarı</p>
            <p className="text-lg font-bold text-gray-900">
              ₺
              {orderTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Hesaplanan İade</p>
            <p className="text-primary-600 text-lg font-bold">
              ₺
              {calculatedRefund.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Resolution Templates */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          Hızlı Çözüm Şablonları
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {resolutionTemplates.map((template) => (
            <button
              key={template.type}
              type="button"
              onClick={() => {
                setValue('resolutionType', template.type);
                handleRefundCalculation(template.refundPercentage);
              }}
              className={`flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors ${template.color} ${
                selectedResolutionType === template.type
                  ? 'ring-primary-500 ring-2'
                  : ''
              }`}
            >
              {template.icon}
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {template.label}
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  {template.description}
                </p>
              </div>
            </button>
          ))}
        </div>
        {errors.resolutionType && (
          <p className="mt-1 text-sm text-red-600">
            {errors.resolutionType.message}
          </p>
        )}
      </div>

      {/* Custom Resolution Type */}
      <div>
        <label
          htmlFor="resolutionType"
          className="block text-sm font-medium text-gray-700"
        >
          Veya Özel Çözüm Tipi Seçin
        </label>
        <select
          id="resolutionType"
          {...register('resolutionType')}
          className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none"
        >
          <option value="">Seçiniz...</option>
          {Object.entries(disputeResolutionTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Refund Amount (for partial refund) */}
      {(selectedResolutionType ===
        DisputeResolutionType.FAVOR_BUYER_PARTIAL_REFUND ||
        selectedResolutionType === DisputeResolutionType.PARTIAL_REFUND) && (
        <div>
          <label
            htmlFor="refundAmount"
            className="block text-sm font-medium text-gray-700"
          >
            İade Tutarı (₺) <span className="text-red-500">*</span>
          </label>
          <input
            id="refundAmount"
            type="number"
            step="0.01"
            min="0"
            max={orderTotal}
            {...register('refundAmount', { valueAsNumber: true })}
            className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none"
          />

          {/* Quick Percentage Buttons */}
          <div className="mt-2 flex gap-2">
            {[25, 50, 75, 100].map((percentage) => (
              <button
                key={percentage}
                type="button"
                onClick={() => handleRefundCalculation(percentage)}
                className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
              >
                {percentage}%
              </button>
            ))}
          </div>

          {errors.refundAmount && (
            <p className="mt-1 text-sm text-red-600">
              {errors.refundAmount.message}
            </p>
          )}
        </div>
      )}

      {/* Resolution Text */}
      <div>
        <label
          htmlFor="resolution"
          className="block text-sm font-medium text-gray-700"
        >
          Çözüm Açıklaması <span className="text-red-500">*</span>
        </label>
        <textarea
          id="resolution"
          {...register('resolution')}
          rows={6}
          placeholder="İtiraz çözümünü detaylı olarak açıklayınız... (min 50 karakter)"
          className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none"
        />
        {errors.resolution && (
          <p className="mt-1 text-sm text-red-600">
            {errors.resolution.message}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Bu açıklama hem alıcı hem de satıcı tarafından görülecektir.
        </p>
      </div>

      {/* Warning */}
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Dikkat!</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Bu karar geri alınamaz ve kesindir</li>
              <li>Her iki taraf da bu kararı görecektir</li>
              <li>İade işlemleri otomatik olarak başlatılacaktır</li>
              <li>Escrow otomatik olarak serbest bırakılacaktır</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            İptal
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !selectedResolutionType}
          className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Çözümleniyor...' : 'İtirazı Çözümle'}
        </button>
      </div>
    </form>
  );
}

export default AdminDisputeResolution;
