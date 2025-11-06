/**
 * ================================================
 * REFUND REQUEST FORM COMPONENT
 * ================================================
 * Form component for users to request refunds
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 31, 2025
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';
import {
  createRefund,
  RefundReasonCategory,
  getRefundReasonLabel,
  type CreateRefundRequest,
} from '@/lib/api/refunds';

// ================================================
// TYPES
// ================================================

interface RefundRequestFormProps {
  orderId: string;
  maxRefundAmount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ================================================
// COMPONENT
// ================================================

export function RefundRequestForm({
  orderId,
  maxRefundAmount,
  onSuccess,
  onCancel,
}: RefundRequestFormProps) {
  const [amount, setAmount] = useState(maxRefundAmount.toString());
  const [reasonCategory, setReasonCategory] = useState<RefundReasonCategory>(
    RefundReasonCategory.BUYER_REQUEST
  );
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ==================== VALIDATION ====================

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Geçerli bir tutar girin';
    } else if (amountNum > maxRefundAmount) {
      newErrors.amount = `Maksimum iade tutarı: ₺${maxRefundAmount.toLocaleString('tr-TR')}`;
    }

    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = 'Lütfen en az 10 karakter açıklama girin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== HANDLERS ====================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Lütfen form hatalarını düzeltin');
      return;
    }

    setIsSubmitting(true);

    try {
      const request: CreateRefundRequest = {
        orderId,
        amount: parseFloat(amount),
        reasonCategory,
        description: description.trim(),
      };

      await createRefund(request);
      toast.success('İade talebi oluşturuldu');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      logger.error('Failed to create refund:', error instanceof Error ? error : new Error(String(error)));
      toast.error('İade talebi oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const sanitized = value.replace(/[^0-9.]/g, '');
    setAmount(sanitized);
    if (errors.amount) {
      setErrors({ ...errors, amount: '' });
    }
  };

  // ==================== RENDER ====================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
        <div className="text-sm text-blue-900">
          <p className="font-medium">İade Talebi Hakkında</p>
          <p className="mt-1 text-blue-700">
            İade talebiniz yönetici onayına gönderilecektir. Onaylandıktan sonra
            ödeme yönteminize iade edilecektir.
          </p>
        </div>
      </div>

      {/* Refund Amount */}
      <div>
        <Label htmlFor="amount">
          İade Tutarı *
          <span className="text-muted-foreground ml-2 text-sm font-normal">
            (Maksimum: ₺{maxRefundAmount.toLocaleString('tr-TR')})
          </span>
        </Label>
        <div className="relative mt-2">
          <Input
            id="amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            className={errors.amount ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2">
            ₺
          </span>
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
        )}

        {/* Quick Amount Buttons */}
        <div className="mt-2 flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAmount((maxRefundAmount * 0.5).toFixed(2))}
            disabled={isSubmitting}
          >
            50%
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAmount((maxRefundAmount * 0.75).toFixed(2))}
            disabled={isSubmitting}
          >
            75%
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAmount(maxRefundAmount.toFixed(2))}
            disabled={isSubmitting}
          >
            Tümü
          </Button>
        </div>
      </div>

      {/* Reason Category */}
      <div>
        <Label htmlFor="reasonCategory">İade Nedeni *</Label>
        <select
          id="reasonCategory"
          value={reasonCategory}
          onChange={(e) =>
            setReasonCategory(e.target.value as RefundReasonCategory)
          }
          className="border-input bg-background ring-offset-background focus-visible:ring-ring mt-2 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          disabled={isSubmitting}
        >
          {Object.values(RefundReasonCategory).map((reason) => (
            <option key={reason} value={reason}>
              {getRefundReasonLabel(reason)}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">
          Açıklama *
          <span className="text-muted-foreground ml-2 text-sm font-normal">
            (Minimum 10 karakter)
          </span>
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) {
              setErrors({ ...errors, description: '' });
            }
          }}
          placeholder="İade talebinizin nedenini detaylı olarak açıklayın..."
          rows={5}
          className={`mt-2 ${errors.description ? 'border-red-500' : ''}`}
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="text-muted-foreground mt-1 text-xs">
          {description.length} karakter
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gönderiliyor...
            </>
          ) : (
            'İade Talebi Oluştur'
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            İptal
          </Button>
        )}
      </div>
    </form>
  );
}

export default RefundRequestForm;
