'use client';

/**
 * ============================================================================
 * UnifiedRefundRequestModal Component
 * ============================================================================
 * Unified refund request modal supporting both order-based and payment-based flows
 *
 * Sprint 1.4: Consolidates RefundRequestModal from payments and refunds domains
 *
 * Features:
 * - ✅ Order-based refund requests (default)
 * - ✅ Payment-based refund requests (with paymentId)
 * - ✅ Predefined refund reasons dropdown
 * - ✅ Already refunded amount tracking
 * - ✅ Currency support with symbol display
 * - ✅ Hook-based or direct API integration
 * - ✅ Comprehensive validation
 * - ✅ Toast notifications
 * - ✅ Loading states
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 1.4 (Unified)
 * ============================================================================
 */

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
import { useRefund } from '@/hooks/business/payment';

// ============================================================================
// TYPES
// ============================================================================

export interface UnifiedRefundRequestModalProps {
  // Display control
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;

  // Order information (required)
  orderId: string;
  orderTitle?: string;
  orderTotal: number;
  alreadyRefunded?: number; // default: 0

  // Payment information (optional - for payment-based flow)
  paymentId?: string;
  currency?: string; // default: 'TRY'

  // API integration mode
  useHook?: boolean; // default: false (direct API), true (use useRefund hook)

  // Customization
  showReasonDropdown?: boolean; // default: true (predefined reasons)
  minDescriptionLength?: number; // default: 20
  maxDescriptionLength?: number; // default: 1000
}

export interface RefundReason {
  value: string;
  label: string;
  description: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

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

const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UnifiedRefundRequestModal({
  isOpen,
  onClose,
  onSuccess,
  orderId,
  orderTitle,
  orderTotal,
  alreadyRefunded = 0,
  paymentId,
  currency = 'TRY',
  useHook: useHookMode = false,
  showReasonDropdown = true,
  minDescriptionLength = 20,
  maxDescriptionLength = 1000,
}: UnifiedRefundRequestModalProps) {
  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    reason: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hook integration (only used if useHookMode is true)
  const hookRefund = useRefund();
  const {
    requestRefund: hookRequestRefund,
    isRefunding: hookIsRefunding,
    error: hookError,
    clearError: hookClearError,
  } = useHookMode
    ? hookRefund
    : {
        requestRefund: null,
        isRefunding: false,
        error: null,
        clearError: () => {},
      };

  // Calculate max refundable amount
  const maxRefundable = orderTotal - alreadyRefunded;

  // Get currency symbol
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

  // Validate form
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
        newErrors.amount = `Maksimum iade tutarı ${currencySymbol}${maxRefundable.toFixed(2)}`;
      }
    }

    // Reason validation
    if (showReasonDropdown) {
      if (!formData.reason) {
        newErrors.reason = 'İade nedeni seçiniz';
      }
    } else {
      if (!formData.reason?.trim()) {
        newErrors.reason = 'İade nedeni zorunludur';
      } else if (formData.reason.trim().length < 10) {
        newErrors.reason = 'İade nedeni en az 10 karakter olmalıdır';
      }
    }

    // Description validation
    if (!formData.description?.trim()) {
      newErrors.description = 'Açıklama zorunludur';
    } else if (formData.description.length < minDescriptionLength) {
      newErrors.description = `Açıklama en az ${minDescriptionLength} karakter olmalıdır`;
    } else if (formData.description.length > maxDescriptionLength) {
      newErrors.description = `Açıklama en fazla ${maxDescriptionLength} karakter olabilir`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit with hook mode
  const handleSubmitWithHook = async () => {
    if (!paymentId || !hookRequestRefund) {
      toast.error('Hata', {
        description: 'Payment ID gerekli (hook mode için)',
      });
      return false;
    }

    const amount = parseFloat(formData.amount);
    const success = await hookRequestRefund(
      paymentId,
      amount,
      formData.description.trim()
    );

    if (success) {
      toast.success('İade Talebi Oluşturuldu', {
        description:
          'İade talebiniz başarıyla oluşturuldu. Admin onayı bekleniyor.',
      });
      return true;
    }

    if (hookError) {
      toast.error('Hata', {
        description: hookError,
      });
    }

    return false;
  };

  // Handle submit with direct API
  const handleSubmitWithAPI = async () => {
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

      return true;
    } catch (error) {
      console.error('Refund request error:', error);
      toast.error('Hata', {
        description:
          error instanceof Error ? error.message : 'İade talebi oluşturulamadı',
      });
      return false;
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const success = useHookMode
        ? await handleSubmitWithHook()
        : await handleSubmitWithAPI();

      if (success) {
        // Reset form
        setFormData({ amount: '', reason: '', description: '' });
        setErrors({});

        // Call success callback
        onSuccess?.();

        // Close modal
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle field changes
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

  // Handle close
  const handleClose = () => {
    if (!isSubmitting && !hookIsRefunding) {
      setFormData({ amount: '', reason: '', description: '' });
      setErrors({});
      if (useHookMode) {
        hookClearError();
      }
      onClose();
    }
  };

  // Get selected reason details
  const selectedReason = showReasonDropdown
    ? REFUND_REASONS.find((r) => r.value === formData.reason)
    : null;

  // Determine if submitting
  const isLoading = isSubmitting || hookIsRefunding;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>İade Talebi Oluştur</DialogTitle>
          <DialogDescription>
            {orderTitle || 'Sipariş'} için iade talebinde bulunun. Talebiniz
            admin tarafından incelenecektir.
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
                    <span>
                      {currencySymbol}
                      {orderTotal.toFixed(2)}
                    </span>
                  </div>
                  {alreadyRefunded > 0 && (
                    <div className="flex justify-between">
                      <span className="font-medium">İade Edilen:</span>
                      <span className="text-red-600">
                        -{currencySymbol}
                        {alreadyRefunded.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-1">
                    <span className="font-semibold">İade Edilebilir:</span>
                    <span className="font-semibold text-green-600">
                      {currencySymbol}
                      {maxRefundable.toFixed(2)}
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
                  {currencySymbol}
                </span>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className={`pl-7 ${errors.amount ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            {/* Reason - Dropdown or Text Input */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                İade Nedeni <span className="text-red-500">*</span>
              </Label>
              {showReasonDropdown ? (
                <>
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
                </>
              ) : (
                <Input
                  id="reason"
                  type="text"
                  placeholder="İade nedeninizi yazınız... (En az 10 karakter)"
                  value={formData.reason}
                  onChange={(e) => handleReasonChange(e.target.value)}
                  className={errors.reason ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
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
                placeholder={`İade nedeninizi detaylı olarak açıklayınız... (En az ${minDescriptionLength} karakter)`}
                value={formData.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                rows={4}
                maxLength={maxDescriptionLength}
                className={errors.description ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              <div className="text-muted-foreground flex justify-between text-sm">
                <span>
                  {errors.description && (
                    <span className="text-red-500">{errors.description}</span>
                  )}
                </span>
                <span>
                  {formData.description.length}/{maxDescriptionLength}
                </span>
              </div>
            </div>

            {/* Hook Error Display */}
            {useHookMode && hookError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{hookError}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <UnifiedButton
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              İptal
            </UnifiedButton>
            <UnifiedButton type="submit" disabled={isLoading}>
              {isLoading ? (
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

export default UnifiedRefundRequestModal;
