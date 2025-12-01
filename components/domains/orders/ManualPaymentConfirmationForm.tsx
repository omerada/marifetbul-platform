/**
 * ================================================
 * MANUAL PAYMENT CONFIRMATION FORM
 * ================================================
 * Seller confirms receiving manual IBAN payment
 *
 * Features:
 * - Payment reference input
 * - Optional notes field
 * - Confirmation validation
 * - Error handling
 * - Success feedback
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Sprint 1 - Story 1.1 - IBAN Display & Manual Payment
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { confirmManualPayment } from '@/lib/api/orders';
import type { OrderResponse } from '@/types/backend-aligned';

// ================================================
// TYPES
// ================================================

export interface ManualPaymentConfirmationFormProps {
  /** Order ID */
  orderId: string;
  /** Order number for display */
  orderNumber: string;
  /** Order amount */
  orderAmount: number;
  /** Currency */
  currency?: string;
  /** Buyer name */
  buyerName?: string;
  /** Callback on successful confirmation */
  onSuccess?: (updatedOrder: OrderResponse) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Custom className */
  className?: string;
}

// ================================================
// COMPONENT
// ================================================

export function ManualPaymentConfirmationForm({
  orderId,
  orderNumber,
  orderAmount,
  currency = 'TRY',
  buyerName,
  onSuccess,
  onError,
  className,
}: ManualPaymentConfirmationFormProps) {
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Form validation
  const isValid = paymentReference.trim().length >= 3;

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      toast.error('Form Hatası', {
        description: 'Lütfen ödeme referansını giriniz (min 3 karakter)',
      });
      return;
    }

    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Call API to confirm manual payment
      const response = await confirmManualPayment(orderId, {
        paymentReference: paymentReference.trim(),
        notes: notes.trim() || undefined,
      });

      toast.success('Ödeme Onaylandı', {
        description:
          'Manuel ödeme başarıyla onaylandı. Sipariş durumu güncellendi.',
        duration: 5000,
      });

      // Reset form
      setPaymentReference('');
      setNotes('');
      setShowConfirmation(false);

      // Call success callback
      if (onSuccess) {
        // Extract data from ApiResponse wrapper if needed
        const data = 'data' in response ? response.data : response;
        onSuccess(data);
      }
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Ödeme onaylanamadı');

      toast.error('Hata', {
        description: err.message || 'Ödeme onaylanırken bir hata oluştu',
      });

      if (onError) {
        onError(err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel confirmation
  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  return (
    <Card
      className={cn('border-2 border-green-200 bg-green-50 p-6', className)}
    >
      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-200">
          <CreditCard className="h-6 w-6 text-green-700" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-green-900">
            Ödeme Onaylama
          </h3>
          <p className="text-sm text-green-700">
            {buyerName ? `${buyerName} tarafından` : 'Alıcı tarafından'} yapılan
            ödemeyi onaylayın
          </p>
        </div>
        <Badge variant="success" size="md">
          Onay Bekleniyor
        </Badge>
      </div>

      {/* Amount Info */}
      <div className="mb-4 rounded-lg border-2 border-green-300 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-green-800">
              Sipariş No
            </label>
            <p className="font-mono font-semibold text-green-900">
              {orderNumber}
            </p>
          </div>
          <div className="text-right">
            <label className="text-sm font-medium text-green-800">
              Beklenen Tutar
            </label>
            <p className="text-2xl font-bold text-green-900">
              {new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: currency,
              }).format(orderAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Payment Reference */}
        <div>
          <Label htmlFor="paymentReference" className="text-green-900">
            Ödeme Referansı / İşlem No <span className="text-red-600">*</span>
          </Label>
          <Input
            id="paymentReference"
            type="text"
            placeholder="Örn: TRX123456789 veya banka dekontu no"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            disabled={isSubmitting}
            className="mt-1"
            required
            minLength={3}
          />
          <p className="mt-1 text-xs text-green-700">
            Banka hesabınıza yansıyan işlem numarasını giriniz
          </p>
        </div>

        {/* Notes (Optional) */}
        <div>
          <Label htmlFor="notes" className="text-green-900">
            Notlar (Opsiyonel)
          </Label>
          <textarea
            id="notes"
            placeholder="Ek bilgiler, ödeme zamanı, vb. (opsiyonel)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSubmitting}
            className="mt-1 min-h-[80px] w-full rounded-md border border-gray-300 p-2 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
            maxLength={500}
          />
          <p className="mt-1 text-xs text-green-700">
            {notes.length}/500 karakter
          </p>
        </div>

        {/* Warning */}
        <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-700" />
            <div className="space-y-1 text-sm text-yellow-900">
              <p className="font-semibold">Dikkat:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Ödemeyi aldığınızdan emin olunuz</li>
                <li>Tutar ve sipariş numarasını kontrol ediniz</li>
                <li>Onayladıktan sonra sipariş başlatılacaktır</li>
                <li>
                  Yanlış onaylama durumunda destek ekibi ile iletişime geçiniz
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Confirmation Step */}
        {showConfirmation && (
          <div className="rounded-lg border-2 border-green-400 bg-green-100 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-700" />
              <div className="flex-1">
                <p className="font-semibold text-green-900">
                  Ödemeyi Onaylamak Üzeresiniz
                </p>
                <p className="mt-1 text-sm text-green-800">
                  <strong>
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: currency,
                    }).format(orderAmount)}
                  </strong>{' '}
                  tutarındaki ödemeyi aldığınızı ve onayladığınızı
                  belirtiyorsunuz.
                </p>
                <p className="mt-2 text-xs text-green-700">
                  Referans:{' '}
                  <span className="font-mono font-semibold">
                    {paymentReference}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!showConfirmation ? (
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              disabled={!isValid || isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Ödeme Onayı İçin Devam Et
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleCancelConfirmation}
                disabled={isSubmitting}
                className="flex-1"
              >
                İptal
              </Button>
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Onaylanıyor...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Ödemeyi Onayla
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-4 rounded-lg bg-green-100 p-3">
        <div className="flex items-start gap-2">
          <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-700" />
          <p className="text-xs text-green-800">
            <strong>İpucu:</strong> Ödeme onayladıktan sonra sipariş durumu
            "Ödendi" olarak güncellenir ve işe başlayabilirsiniz. Herhangi bir
            sorun yaşarsanız destek ekibi ile iletişime geçiniz.
          </p>
        </div>
      </div>
    </Card>
  );
}
