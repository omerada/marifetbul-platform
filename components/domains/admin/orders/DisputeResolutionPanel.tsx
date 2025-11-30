'use client';

/**
 * ================================================
 * DISPUTE RESOLUTION PANEL
 * ================================================
 * Admin panel component for resolving order disputes
 *
 * Features:
 * - Dispute details & evidence display
 * - Resolution decision form (buyer favor / seller favor / split)
 * - Refund amount calculation
 * - Admin notes & documentation
 * - Resolution history
 *
 * Backend Endpoint: POST /api/v1/admin/orders/:orderId/resolve
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1.2: Dispute Resolution UI
 */

'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui';
import { Button, Textarea, Label, Input } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Scale,
  FileText,
  DollarSign,
  Clock,
  User,
} from 'lucide-react';
import {
  orderApi,
  enrichOrder,
  unwrapOrderResponse,
  type OrderWithComputed,
} from '@/lib/api/orders';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { z } from 'zod';

// ================================================
// VALIDATION SCHEMA
// ================================================

const disputeResolutionSchema = z.object({
  decision: z.enum(['BUYER_FAVOR', 'SELLER_FAVOR', 'SPLIT', 'NO_RESOLUTION']),
  note: z
    .string()
    .min(20, 'Not en az 20 karakter olmalıdır')
    .max(1000, 'Not en fazla 1000 karakter olabilir'),
  refundAmount: z.number().min(0, "İade miktarı 0'dan küçük olamaz").optional(),
});

type DisputeResolutionInput = z.infer<typeof disputeResolutionSchema>;

// ================================================
// TYPES
// ================================================

export interface DisputeResolutionPanelProps {
  /** The disputed order */
  order: OrderWithComputed;
  /** Callback after successful resolution */
  onResolved?: (updatedOrder: OrderWithComputed) => void;
  /** Optional: Show in card or standalone */
  variant?: 'card' | 'standalone';
}

// Decision types
type DisputeDecision =
  | 'BUYER_FAVOR'
  | 'SELLER_FAVOR'
  | 'SPLIT'
  | 'NO_RESOLUTION';

interface DecisionOption {
  value: DisputeDecision;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// ================================================
// CONSTANTS
// ================================================

const DECISION_OPTIONS: DecisionOption[] = [
  {
    value: 'BUYER_FAVOR',
    label: 'Alıcı Lehine',
    description: 'Tam iade - Alıcı haklı',
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'text-green-600',
  },
  {
    value: 'SELLER_FAVOR',
    label: 'Satıcı Lehine',
    description: 'İade yok - Satıcı haklı',
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'text-blue-600',
  },
  {
    value: 'SPLIT',
    label: 'Kısmi İade',
    description: 'Her iki taraf da kısmen haklı',
    icon: <Scale className="h-5 w-5" />,
    color: 'text-amber-600',
  },
  {
    value: 'NO_RESOLUTION',
    label: 'Karar Verilemedi',
    description: 'Daha fazla bilgi gerekli',
    icon: <XCircle className="h-5 w-5" />,
    color: 'text-gray-600',
  },
];

// ================================================
// COMPONENT
// ================================================

export function DisputeResolutionPanel({
  order,
  onResolved,
  variant = 'card',
}: DisputeResolutionPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<
    DisputeDecision | ''
  >('');
  const [adminNote, setAdminNote] = useState('');
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [errors, setErrors] = useState<
    Partial<Record<keyof DisputeResolutionInput, string>>
  >({});

  // Calculate amounts
  const orderTotal = order.financials.total;
  const maxRefund = orderTotal;

  // ================================================
  // HANDLERS
  // ================================================

  const validateForm = (): boolean => {
    try {
      const refundNum = refundAmount ? parseFloat(refundAmount) : undefined;

      disputeResolutionSchema.parse({
        decision: selectedDecision,
        note: adminNote,
        refundAmount: refundNum,
      });

      // Additional validation: refund amount should not exceed order total
      if (refundNum && refundNum > maxRefund) {
        setErrors({
          refundAmount: `İade miktarı sipariş toplamını (${maxRefund} TL) geçemez`,
        });
        return false;
      }

      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof DisputeResolutionInput, string>> =
          {};
        const zodError = err as z.ZodError<DisputeResolutionInput>;
        zodError.issues.forEach((error: z.ZodIssue) => {
          if (error.path[0]) {
            newErrors[error.path[0] as keyof DisputeResolutionInput] =
              error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const calculateRefundAmount = (decision: DisputeDecision): number => {
    switch (decision) {
      case 'BUYER_FAVOR':
        return orderTotal;
      case 'SELLER_FAVOR':
        return 0;
      case 'SPLIT':
        return refundAmount ? parseFloat(refundAmount) : orderTotal / 2;
      case 'NO_RESOLUTION':
        return 0;
      default:
        return 0;
    }
  };

  const handleDecisionChange = (decision: DisputeDecision) => {
    setSelectedDecision(decision);

    // Auto-fill refund amount based on decision
    if (decision === 'BUYER_FAVOR') {
      setRefundAmount(orderTotal.toString());
    } else if (decision === 'SELLER_FAVOR' || decision === 'NO_RESOLUTION') {
      setRefundAmount('0');
    } else if (decision === 'SPLIT' && !refundAmount) {
      setRefundAmount((orderTotal / 2).toFixed(2));
    }
  };

  const handleResolve = async () => {
    if (!validateForm()) {
      toast.error('Form Hatası', {
        description: 'Lütfen tüm alanları doğru şekilde doldurun.',
      });
      return;
    }

    const finalRefundAmount = calculateRefundAmount(
      selectedDecision as DisputeDecision
    );

    try {
      setIsLoading(true);

      const response = await orderApi.resolveDispute(order.id, {
        decision: selectedDecision,
        note: adminNote,
        refundAmount: finalRefundAmount > 0 ? finalRefundAmount : undefined,
      });

      const data = unwrapOrderResponse(response);
      const updatedOrder = enrichOrder(data);

      toast.success('Anlaşmazlık Çözümlendi!', {
        description: `Karar: ${DECISION_OPTIONS.find((opt) => opt.value === selectedDecision)?.label}. İade: ${finalRefundAmount} TL`,
      });

      onResolved?.(updatedOrder);

      // Reset form
      setSelectedDecision('');
      setAdminNote('');
      setRefundAmount('');
      setErrors({});
    } catch (error) {
      toast.error('Hata', {
        description:
          error instanceof Error ? error.message : 'Anlaşmazlık çözümlenemedi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ================================================
  // RENDER HELPERS
  // ================================================

  const renderDisputeInfo = () => (
    <div className="space-y-4">
      {/* Order Info */}
      <div className="rounded-lg border bg-gray-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">Sipariş Bilgileri</h4>
          <Badge variant="destructive">Anlaşmazlık</Badge>
        </div>

        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Sipariş No:</span>
            <span className="font-medium text-gray-900">
              {order.orderNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Toplam Tutar:</span>
            <span className="font-semibold text-gray-900">
              {orderTotal.toFixed(2)} {order.financials.currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">
              <User className="mr-1 inline-block h-4 w-4" />
              Alıcı:
            </span>
            <span className="font-medium text-gray-900">
              {order.buyer.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">
              <User className="mr-1 inline-block h-4 w-4" />
              Satıcı:
            </span>
            <span className="font-medium text-gray-900">
              {order.seller.name}
            </span>
          </div>
        </div>
      </div>

      {/* Dispute Details */}
      {order.notes && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="mb-2 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-amber-600" />
            <h4 className="font-semibold text-amber-900">
              Anlaşmazlık Detayları
            </h4>
          </div>
          <p className="text-sm whitespace-pre-wrap text-amber-800">
            {order.notes}
          </p>
        </div>
      )}

      {/* Delivery Info */}
      {order.delivery?.deliveryNote && (
        <div className="rounded-lg border bg-blue-50 p-4">
          <div className="mb-2 flex items-center">
            <FileText className="mr-2 h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Teslimat Bilgisi</h4>
          </div>
          <p className="text-sm whitespace-pre-wrap text-blue-800">
            {order.delivery.deliveryNote}
          </p>
        </div>
      )}
    </div>
  );

  const renderResolutionForm = () => (
    <div className="space-y-6">
      {/* Decision Selection */}
      <div className="space-y-3">
        <Label className="required text-base">Karar</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {DECISION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleDecisionChange(option.value)}
              disabled={isLoading}
              className={cn(
                'flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all',
                'hover:border-primary hover:bg-primary/5',
                'focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none',
                selectedDecision === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 bg-white',
                isLoading && 'cursor-not-allowed opacity-50'
              )}
            >
              <div className={cn('mt-0.5', option.color)}>{option.icon}</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{option.label}</p>
                <p className="mt-1 text-xs text-gray-600">
                  {option.description}
                </p>
              </div>
            </button>
          ))}
        </div>
        {errors.decision && (
          <p className="text-sm text-red-500">{errors.decision}</p>
        )}
      </div>

      {/* Refund Amount (for SPLIT decision) */}
      {selectedDecision === 'SPLIT' && (
        <div className="space-y-2">
          <Label htmlFor="refundAmount" className="flex items-center">
            <DollarSign className="mr-1 h-4 w-4" />
            İade Miktarı
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="refundAmount"
              type="number"
              step="0.01"
              min="0"
              max={maxRefund}
              placeholder="0.00"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              disabled={isLoading}
              className={cn(errors.refundAmount && 'border-red-500')}
            />
            <span className="text-sm font-medium text-gray-600">
              {order.financials.currency}
            </span>
          </div>
          {errors.refundAmount && (
            <p className="text-sm text-red-500">{errors.refundAmount}</p>
          )}
          <p className="text-xs text-gray-500">
            Maksimum: {maxRefund.toFixed(2)} {order.financials.currency}
          </p>
        </div>
      )}

      {/* Admin Note */}
      <div className="space-y-2">
        <Label htmlFor="adminNote" className="required">
          Yönetici Notu
        </Label>
        <Textarea
          id="adminNote"
          placeholder="Kararınızın gerekçesini detaylı şekilde açıklayın. Bu not her iki tarafa da gönderilecektir."
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          rows={6}
          disabled={isLoading}
          className={cn(errors.note && 'border-red-500')}
        />
        {errors.note && <p className="text-sm text-red-500">{errors.note}</p>}
        <p className="text-xs text-gray-500">
          {adminNote.length}/1000 karakter
        </p>
      </div>

      {/* Summary */}
      {selectedDecision && (
        <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
          <h4 className="mb-3 font-semibold text-purple-900">Karar Özeti</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-700">Karar:</span>
              <span className="font-semibold text-purple-900">
                {
                  DECISION_OPTIONS.find((opt) => opt.value === selectedDecision)
                    ?.label
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-700">İade Tutarı:</span>
              <span className="font-semibold text-purple-900">
                {calculateRefundAmount(selectedDecision).toFixed(2)}{' '}
                {order.financials.currency}
              </span>
            </div>
            {selectedDecision === 'SELLER_FAVOR' &&
              order.financials.sellerEarnings && (
                <div className="flex justify-between">
                  <span className="text-purple-700">Satıcı Kazancı:</span>
                  <span className="font-semibold text-green-700">
                    {order.financials.sellerEarnings.toFixed(2)}{' '}
                    {order.financials.currency}
                  </span>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );

  // ================================================
  // RENDER
  // ================================================

  const content = (
    <div className="space-y-6">
      {renderDisputeInfo()}
      <div className="border-t pt-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          <Scale className="mr-2 inline-block h-5 w-5" />
          Karar Ver
        </h3>
        {renderResolutionForm()}
      </div>
    </div>
  );

  if (variant === 'standalone') {
    return (
      <div className="space-y-6">
        {content}
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleResolve}
            loading={isLoading}
            disabled={!selectedDecision || !adminNote}
            size="lg"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Kararı Onayla ve Gönder
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Scale className="mr-2 h-6 w-6 text-amber-600" />
          Anlaşmazlık Çözüm Paneli
        </CardTitle>
        <p className="mt-2 text-sm text-gray-600">
          Sipariş #{order.orderNumber} için anlaşmazlığı inceleyin ve karar
          verin
        </p>
      </CardHeader>
      <CardContent>{content}</CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="mr-1 h-4 w-4" />
          Son güncelleme: {new Date(order.updatedAt).toLocaleString('tr-TR')}
        </div>
        <Button
          onClick={handleResolve}
          loading={isLoading}
          disabled={!selectedDecision || !adminNote}
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          Kararı Onayla ve Gönder
        </Button>
      </CardFooter>
    </Card>
  );
}

export default DisputeResolutionPanel;
