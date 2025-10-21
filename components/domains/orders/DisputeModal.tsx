/**
 * Modal for opening a dispute on an order
 * Used by both freelancer and employer when issues arise
 */

'use client';

import React, { useState } from 'react';
import { X, AlertCircle, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { useUIStore } from '@/lib/core/store/domains/ui/uiStore';
import { useOrderStore } from '@/lib/core/store/orders';
import type { DisputeReason } from '@/types/business/features/orders';
import { logger } from '@/lib/shared/utils/logger';

interface DisputeModalProps {
  orderId: string;
  orderTitle: string;
  userRole: 'buyer' | 'seller';
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface DisputeReasonOption {
  value: DisputeReason;
  label: string;
  description: string;
}

const DISPUTE_REASONS: DisputeReasonOption[] = [
  {
    value: 'not_delivered',
    label: 'Teslim Edilmedi',
    description: 'İş sözleşmeye uygun şekilde teslim edilmedi',
  },
  {
    value: 'poor_quality',
    label: 'Kalitesiz Çalışma',
    description: 'Teslim edilen iş kalite standartlarını karşılamıyor',
  },
  {
    value: 'not_as_described',
    label: 'Anlaşmaya Uygun Değil',
    description: 'Teslim edilen iş başlangıçta anlaşılan şekilde değil',
  },
  {
    value: 'payment_issue',
    label: 'Ödeme Sorunu',
    description: 'Ödeme ile ilgili bir sorun var',
  },
  {
    value: 'communication_issue',
    label: 'İletişim Sorunu',
    description: 'Karşı taraf ile iletişim kurulamıyor',
  },
  {
    value: 'other',
    label: 'Diğer',
    description: 'Yukarıdakilerden farklı bir sorun',
  },
];

export function DisputeModal({
  orderId,
  orderTitle,
  userRole,
  isOpen,
  onClose,
  onSuccess,
}: DisputeModalProps) {
  const [selectedReason, setSelectedReason] = useState<DisputeReason | ''>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addToast } = useUIStore();
  const { createDispute } = useOrderStore();

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedReason('');
      setDescription('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!selectedReason) {
      setError('Lütfen bir anlaşmazlık nedeni seçin');
      return;
    }

    if (!description.trim()) {
      setError('Lütfen anlaşmazlık açıklamasını girin');
      return;
    }

    if (description.trim().length < 50) {
      setError('Açıklama en az 50 karakter olmalıdır');
      return;
    }

    try {
      setIsSubmitting(true);

      await createDispute(orderId, {
        orderId,
        initiatedBy: userRole,
        reason: selectedReason,
        description: description.trim(),
        evidence: [], // Evidence can be added later via order detail page
      } as Omit<import('@/types').OrderDispute, 'id' | 'createdAt' | 'status'>);

      addToast({
        type: 'success',
        title: 'Anlaşmazlık Açıldı',
        description:
          'Anlaşmazlık kaydınız alındı. Destek ekibimiz en kısa sürede inceleyecektir.',
        duration: 5000,
      });

      logger.info('Dispute created successfully', {
        orderId,
        reason: selectedReason,
        initiatedBy: userRole,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Anlaşmazlık açılamadı';
      setError(errorMessage);

      addToast({
        type: 'error',
        title: 'Hata',
        description: errorMessage,
        duration: 5000,
      });

      logger.error(
        'Failed to create dispute',
        err instanceof Error ? err : new Error(errorMessage)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedReasonData = DISPUTE_REASONS.find(
    (r) => r.value === selectedReason
  );

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Anlaşmazlık Aç
            </h2>
            <p className="mt-1 text-sm text-gray-600">{orderTitle}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Warning Banner */}
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900">
                Önemli Bilgilendirme
              </p>
              <p className="mt-1 text-sm text-orange-800">
                Anlaşmazlık açmak, siparişi askıya alır ve destek ekibimizin
                incelemesini gerektirir. Lütfen önce karşı tarafla iletişime
                geçmeyi deneyin. Anlaşmazlık açıldıktan sonra, destek ekibimiz
                1-3 iş günü içinde size geri dönüş yapacaktır.
              </p>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="mb-6">
            <Label htmlFor="dispute-reason" className="mb-3">
              Anlaşmazlık Nedeni <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2">
              {DISPUTE_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all ${
                    selectedReason === reason.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="dispute-reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) =>
                      setSelectedReason(e.target.value as DisputeReason)
                    }
                    className="mt-0.5 h-4 w-4 text-blue-600"
                    disabled={isSubmitting}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{reason.label}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {reason.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <Label htmlFor="dispute-description" className="mb-2">
              Detaylı Açıklama <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="dispute-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lütfen sorunu detaylı bir şekilde açıklayın. Ne oldu, ne bekliyordunuz, hangi adımları attınız? Mümkün olduğunca spesifik olun. (En az 50 karakter)"
              rows={6}
              disabled={isSubmitting}
              className={`resize-none ${
                description.length > 0 && description.length < 50
                  ? 'border-orange-300 focus:border-orange-500'
                  : ''
              }`}
            />
            <div className="mt-2 flex items-center justify-between text-sm">
              <p className="text-gray-600">
                {selectedReasonData && (
                  <span className="font-medium">
                    {selectedReasonData.label}
                  </span>
                )}
              </p>
              <p
                className={`${
                  description.length < 50 ? 'text-orange-600' : 'text-gray-500'
                }`}
              >
                {description.length} / 50 karakter
              </p>
            </div>
          </div>

          {/* Evidence Note */}
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <FileText className="h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Kanıt Dosyaları
              </p>
              <p className="mt-1 text-sm text-blue-800">
                Anlaşmazlık açıldıktan sonra, sipariş detay sayfasından ekran
                görüntüleri, mesajlaşma kayıtları ve diğer kanıt dosyalarını
                ekleyebilirsiniz.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={
                isSubmitting ||
                !selectedReason ||
                !description.trim() ||
                description.length < 50
              }
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Anlaşmazlık Aç
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Admin Escalation Info */}
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <h3 className="text-sm font-medium text-gray-900">
            Süreç Nasıl İşler?
          </h3>
          <ol className="mt-3 space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="font-medium text-gray-900">1.</span>
              <span>
                Anlaşmazlık açıldıktan sonra sipariş askıya alınır ve ödemeler
                dondurulur.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-gray-900">2.</span>
              <span>
                Destek ekibimiz her iki taraftan da bilgi ve kanıt talep eder.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-gray-900">3.</span>
              <span>
                İnceleme sonunda karar verilir: Alıcı lehine, satıcı lehine veya
                kısmi iade.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-gray-900">4.</span>
              <span>
                Karar her iki tarafa bildirilir ve ödeme/iade işlemi
                gerçekleştirilir.
              </span>
            </li>
          </ol>
        </div>
      </Card>
    </div>
  );
}
