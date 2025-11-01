'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import UnifiedButton from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Refund Request Modal Component
 *
 * Allows users to request refunds for their orders
 *
 * Features:
 * - Amount input with validation
 * - Refund reason selection
 * - Description textarea
 * - Real-time validation
 * - API integration
 * - Success/error handling
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 2
 */

export interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderTotal: number;
  alreadyRefunded: number;
  onSuccess?: () => void;
}

export interface RefundReason {
  value: string;
  label: string;
  description: string;
}

const REFUND_REASONS: RefundReason[] = [
  {
    value: 'ORDER_CANCELLED',
    label: 'Sipariş İptal Edildi',
    description: 'Satıcı veya alıcı siparişi iptal etti',
  },
  {
    value: 'SERVICE_NOT_PROVIDED',
    label: 'Hizmet Verilmedi',
    description: 'Satıcı hizmeti teslim etmedi',
  },
  {
    value: 'QUALITY_ISSUE',
    label: 'Kalite Sorunu',
    description: 'Teslim edilen iş kalitesiz',
  },
  {
    value: 'LATE_DELIVERY',
    label: 'Geç Teslimat',
    description: 'Sipariş süresinde teslim edilmedi',
  },
  {
    value: 'DISPUTE_RESOLUTION',
    label: 'Anlaşmazlık Çözümü',
    description: 'İhtilaflı sipariş için iade',
  },
  {
    value: 'OTHER',
    label: 'Diğer',
    description: 'Başka bir neden',
  },
];

export default function RefundRequestModal({
  isOpen,
  onClose,
  orderId,
  orderTotal,
  alreadyRefunded,
  onSuccess,
}: RefundRequestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    reason: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const maxRefundable = orderTotal - alreadyRefunded;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Amount validation
    if (!formData.amount) {
      newErrors.amount = 'İade tutarı zorunludur';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Geçerli bir tutar giriniz';
      } else if (amount > maxRefundable) {
        newErrors.amount = `Maksimum iade tutarı ₺${maxRefundable.toFixed(2)}`;
      }
    }

    // Reason validation
    if (!formData.reason) {
      newErrors.reason = 'İade nedeni seçiniz';
    }

    // Description validation
    if (!formData.description?.trim()) {
      newErrors.description = 'Açıklama zorunludur';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Açıklama en az 20 karakter olmalıdır';
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Açıklama en fazla 1000 karakter olabilir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/v1/refunds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount: parseFloat(formData.amount),
          reason: formData.reason,
          description: formData.description.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'İade talebi oluşturulamadı');
      }

      await response.json();

      toast.success('İade Talebi Oluşturuldu', {
        description:
          'İade talebiniz başarıyla oluşturuldu. Admin onayı bekleniyor.',
      });

      // Reset form
      setFormData({ amount: '', reason: '', description: '' });
      setErrors({});

      // Call success callback
      onSuccess?.();

      // Close modal
      onClose();
    } catch (error) {
      console.error('Refund request error:', error);
      toast.error('Hata', {
        description:
          error instanceof Error ? error.message : 'İade talebi oluşturulamadı',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const sanitized = value.replace(/[^\d.]/g, '');
    setFormData({ ...formData, amount: sanitized });
    if (errors.amount) {
      setErrors({ ...errors, amount: '' });
    }
  };

  const handleReasonChange = (value: string) => {
    setFormData({ ...formData, reason: value });
    if (errors.reason) {
      setErrors({ ...errors, reason: '' });
    }
  };

  const handleDescriptionChange = (value: string) => {
    setFormData({ ...formData, description: value });
    if (errors.description) {
      setErrors({ ...errors, description: '' });
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ amount: '', reason: '', description: '' });
      setErrors({});
      onClose();
    }
  };

  const selectedReason = REFUND_REASONS.find(
    (r) => r.value === formData.reason
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>İade Talebi Oluştur</DialogTitle>
          <DialogDescription>
            Sipariş için iade talebinde bulunun. Talebiniz admin tarafından
            incelenecektir.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Refund Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Toplam Tutar:</span>
                    <span>₺{orderTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">İade Edilen:</span>
                    <span className="text-red-600">
                      -₺{alreadyRefunded.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="font-semibold">İade Edilebilir:</span>
                    <span className="font-semibold text-green-600">
                      ₺{maxRefundable.toFixed(2)}
                    </span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                İade Tutarı <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                  ₺
                </span>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className={`pl-7 ${errors.amount ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            {/* Reason Select */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                İade Nedeni <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.reason}
                onValueChange={handleReasonChange}
              >
                <SelectTrigger
                  className={errors.reason ? 'border-red-500' : ''}
                  placeholder="Neden seçiniz..."
                />
                <SelectContent>
                  {REFUND_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedReason && (
                <p className="text-muted-foreground text-sm">
                  {selectedReason.description}
                </p>
              )}
              {errors.reason && (
                <p className="text-sm text-red-500">{errors.reason}</p>
              )}
            </div>

            {/* Description Textarea */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Açıklama <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="İade nedeninizi detaylı olarak açıklayınız... (En az 20 karakter)"
                value={formData.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                rows={4}
                maxLength={1000}
                className={errors.description ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              <div className="text-muted-foreground flex justify-between text-sm">
                <span>
                  {errors.description && (
                    <span className="text-red-500">{errors.description}</span>
                  )}
                </span>
                <span>{formData.description.length}/1000</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <UnifiedButton
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              İptal
            </UnifiedButton>
            <UnifiedButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                'Talep Gönder'
              )}
            </UnifiedButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
