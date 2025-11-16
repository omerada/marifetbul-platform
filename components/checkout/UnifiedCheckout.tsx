/**
 * ================================================
 * UNIFIED CHECKOUT COMPONENT
 * ================================================
 * Single checkout component supporting multiple payment methods
 * Replaces: CheckoutModal, PaymentForm, IyzicoCheckoutForm
 *
 * Features:
 * - Manual IBAN Transfer (NEW - Sprint 1.1)
 * - Iyzico Payment Gateway (3D Secure)
 * - Credit/Debit Card (if enabled)
 * - Order review and confirmation
 * - Multi-step checkout flow
 *
 * Sprint 1: Payment System Consolidation
 * @version 1.0.0
 * @created 2025-11-10
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Card,
  CardContent,
  UnifiedButton as Button,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui';
import { formatCurrency } from '@/lib/shared/formatters';
import {
  CreditCard,
  Building2,
  CheckCircle,
  AlertCircle,
  Package,
  Calendar,
} from 'lucide-react';
import type { OrderResponse } from '@/types/backend-aligned';
import IyzicoPaymentForm from '@/components/checkout/IyzicoPaymentForm';
import { confirmManualPayment } from '@/lib/api/orders';
import { useOrderMilestones } from '@/hooks/business/useMilestones';

// ================================================
// TYPES
// ================================================

export type PaymentMethod = 'MANUAL_IBAN' | 'IYZICO' | 'CREDIT_CARD';

export interface UnifiedCheckoutProps {
  /** Dialog open state */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Order to checkout */
  order: OrderResponse;
  /** Available payment methods */
  availableMethods?: PaymentMethod[];
  /** Success callback */
  onSuccess?: (orderId: string, paymentId?: string) => void;
  /** Error callback */
  onError?: (error: string) => void;
}

type CheckoutStep = 'review' | 'payment' | 'processing' | 'success';

// ================================================
// SUB-COMPONENTS
// ================================================

/**
 * Order Review Step
 */
interface OrderReviewProps {
  order: OrderResponse;
  onContinue: () => void;
  onCancel: () => void;
}

function OrderReview({ order, onContinue, onCancel }: OrderReviewProps) {
  const subtotal = order.netAmount || order.totalAmount;
  const tax = order.platformFee || 0;
  const discount = 0;
  const total = order.totalAmount;

  // Fetch milestones for this order (if any)
  const { milestones, isLoading: loadingMilestones } = useOrderMilestones(
    order.id
  );
  const hasMilestones = milestones && milestones.length > 0;

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Sipariş Özeti</h3>

          {/* Package/Job Info */}
          <div className="mb-4 border-b pb-4">
            <p className="font-medium">
              {order.packageTitle || order.jobTitle || 'Hizmet'}
            </p>
            {order.packageId && (
              <p className="text-muted-foreground text-sm">
                Paket ID: {order.packageId}
              </p>
            )}
            {order.jobId && (
              <p className="text-muted-foreground text-sm">
                İş ID: {order.jobId}
              </p>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alt Toplam</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            {tax > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">KDV (%18)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            )}

            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>İndirim</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}

            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Toplam</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestone Preview - STORY 1.3 */}
      {hasMilestones && !loadingMilestones && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">
                Aşamalı Ödeme Planı
              </h3>
            </div>

            <Alert className="mb-4 border-blue-200 bg-white">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900">
                Milestone Tabanlı Ödeme
              </AlertTitle>
              <AlertDescription className="text-blue-700">
                Bu sipariş {milestones.length} aşamaya bölünmüştür. Her aşama
                için ayrı ödeme yapacak ve teslim edilen işi onaylayacaksınız.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {milestones.map((milestone, index) => {
                const dueDate = milestone.dueDate
                  ? new Date(milestone.dueDate).toLocaleDateString('tr-TR')
                  : 'Belirtilmemiş';

                return (
                  <div
                    key={milestone.id}
                    className="flex items-start gap-3 rounded-lg border border-blue-200 bg-white p-4"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">
                        {milestone.title}
                      </p>
                      {milestone.description && (
                        <p className="mt-1 text-sm text-gray-600">
                          {milestone.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {dueDate}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-blue-200 bg-blue-50 text-blue-700"
                        >
                          {formatCurrency(milestone.amount)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-center text-sm text-blue-700">
              Toplam ödeme her aşamada {milestones.length} kere gerçekleşecektir
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          İptal
        </Button>
        <Button onClick={onContinue} className="flex-1">
          Ödemeye Geç
        </Button>
      </div>
    </div>
  );
}

/**
 * Payment Method Selection
 */
interface PaymentMethodSelectProps {
  selectedMethod: PaymentMethod | null;
  availableMethods: PaymentMethod[];
  onSelect: (method: PaymentMethod) => void;
}

function PaymentMethodSelect({
  selectedMethod,
  availableMethods,
  onSelect,
}: PaymentMethodSelectProps) {
  const methods = [
    {
      id: 'MANUAL_IBAN' as PaymentMethod,
      name: 'Banka Havalesi / IBAN',
      description: 'Satıcının IBAN hesabına manuel transfer',
      icon: Building2,
      badge: 'Önerilen',
      badgeVariant: 'default' as const,
    },
    {
      id: 'IYZICO' as PaymentMethod,
      name: 'Kredi/Banka Kartı (Iyzico)',
      description: '3D Secure ile güvenli ödeme',
      icon: CreditCard,
      badge: 'Güvenli',
      badgeVariant: 'secondary' as const,
    },
  ];

  const filteredMethods = methods.filter((m) =>
    availableMethods.includes(m.id)
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Ödeme Yöntemi Seçin</h3>

      <div className="space-y-3">
        {filteredMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`rounded-lg p-2 ${
                    isSelected
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{method.name}</h4>
                    {method.badge && (
                      <Badge variant={method.badgeVariant} size="sm">
                        {method.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {method.description}
                  </p>
                </div>

                {isSelected && (
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Manual IBAN Payment Instructions
 */
interface ManualIBANPaymentProps {
  order: OrderResponse;
  sellerIBAN: string;
  sellerName: string;
  onConfirm: () => void;
  onBack: () => void;
  isProcessing: boolean;
}

function ManualIBANPayment({
  order,
  sellerIBAN,
  sellerName,
  onConfirm,
  onBack,
  isProcessing,
}: ManualIBANPaymentProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-900">Ödeme Talimatları</h4>
              <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800">
                <li>Aşağıdaki IBAN numarasına ödemeyi yapın</li>
                <li>Açıklama kısmına sipariş numarasını yazın</li>
                <li>
                  Ödeme yaptıktan sonra "Ödemeyi Yaptım" butonuna tıklayın
                </li>
                <li>Satıcı ödemeyi onayladıktan sonra sipariş başlayacak</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IBAN Details */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="mb-4 font-semibold">Ödeme Bilgileri</h4>

          <div className="space-y-3">
            <div>
              <label className="text-muted-foreground mb-1 block text-sm">
                Alıcı Adı
              </label>
              <div className="rounded-lg bg-gray-50 p-3 font-mono font-semibold">
                {sellerName}
              </div>
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block text-sm">
                IBAN Numarası
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg bg-gray-50 p-3 font-mono font-semibold">
                  {sellerIBAN}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(sellerIBAN);
                    toast.success('IBAN kopyalandı');
                  }}
                >
                  Kopyala
                </Button>
              </div>
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block text-sm">
                Tutar
              </label>
              <div className="rounded-lg bg-gray-50 p-3 text-lg font-bold">
                {formatCurrency(order.totalAmount)}
              </div>
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block text-sm">
                Açıklama
              </label>
              <div className="rounded-lg bg-gray-50 p-3 font-mono">
                Sipariş: {order.orderNumber}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Checkbox */}
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1"
        />
        <span className="text-sm">
          Yukarıdaki bilgilere göre ödemeyi yaptığımı ve satıcının onayını
          beklediğimi kabul ediyorum. Ödeme onaylanmadan sipariş
          başlamayacaktır.
        </span>
      </label>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1"
        >
          Geri
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!agreed || isProcessing}
          loading={isProcessing}
          className="flex-1"
        >
          Ödemeyi Yaptım
        </Button>
      </div>
    </div>
  );
}

/**
 * Success Screen
 */
interface SuccessScreenProps {
  order: OrderResponse;
  paymentMethod: PaymentMethod;
  onClose: () => void;
}

function SuccessScreen({ order, paymentMethod, onClose }: SuccessScreenProps) {
  const router = useRouter();

  const handleViewOrder = () => {
    router.push(`/dashboard/orders/${order.id}`);
    onClose();
  };

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>

      <div>
        <h3 className="mb-2 text-xl font-bold">
          {paymentMethod === 'MANUAL_IBAN'
            ? 'Ödeme Bildiriminiz Alındı'
            : 'Ödeme Başarılı'}
        </h3>
        <p className="text-muted-foreground">
          {paymentMethod === 'MANUAL_IBAN'
            ? 'Satıcı ödemeyi onayladığında sipariş başlayacak. E-posta ile bilgilendirileceksiniz.'
            : 'Siparişiniz oluşturuldu ve satıcıya bildirildi.'}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sipariş No</span>
              <span className="font-semibold">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Toplam Tutar</span>
              <span className="font-semibold">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Durum</span>
              <Badge variant="warning">
                {paymentMethod === 'MANUAL_IBAN' ? 'Ödeme Bekliyor' : 'Ödendi'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Kapat
        </Button>
        <Button onClick={handleViewOrder} className="flex-1">
          Siparişi Görüntüle
        </Button>
      </div>
    </div>
  );
}

// ================================================
// MAIN COMPONENT
// ================================================

export function UnifiedCheckout({
  isOpen,
  onClose,
  order,
  availableMethods = ['MANUAL_IBAN', 'IYZICO'],
  onSuccess,
  onError,
}: UnifiedCheckoutProps) {
  const [step, setStep] = useState<CheckoutStep>('review');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock seller data (will be fetched from API in next step)
  const sellerIBAN = order.sellerIban || 'TR33 0006 1005 1978 6457 8413 26';
  const sellerName = order.sellerName || 'Satıcı Adı';

  // Reset on close
  const handleClose = () => {
    setStep('review');
    setSelectedMethod(null);
    setIsProcessing(false);
    onClose();
  };

  // Handle payment method selection and proceed
  const handleMethodSelected = (method: PaymentMethod) => {
    setSelectedMethod(method);
    // Auto-proceed to payment details
    setTimeout(() => setStep('payment'), 100);
  };

  // Handle manual IBAN confirmation
  const handleManualPaymentConfirm = async () => {
    setIsProcessing(true);

    try {
      await confirmManualPayment({
        orderId: order.id,
        paymentMethod: 'MANUAL_TRANSFER',
      });

      setStep('success');
      toast.success('Ödeme bildiriminiz alındı');
      onSuccess?.(order.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Bir hata oluştu';
      toast.error(message);
      onError?.(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const router = useRouter();

  // Handle Iyzico payment success
  const handleIyzicoSuccess = () => {
    toast.success('Ödeme başarıyla tamamlandı!');
    router.push(`/checkout/callback?orderId=${order.id}&status=success`);
    onSuccess?.(order.id);
  };

  // Handle Iyzico payment error
  const handleIyzicoError = (error: string) => {
    toast.error(error || 'Ödeme işlemi başarısız oldu');
    onError?.(error);
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 'review':
        return (
          <OrderReview
            order={order}
            onContinue={() => setStep('payment')}
            onCancel={handleClose}
          />
        );

      case 'payment':
        if (!selectedMethod) {
          return (
            <PaymentMethodSelect
              selectedMethod={selectedMethod}
              availableMethods={availableMethods}
              onSelect={handleMethodSelected}
            />
          );
        }

        if (selectedMethod === 'MANUAL_IBAN') {
          return (
            <ManualIBANPayment
              order={order}
              sellerIBAN={sellerIBAN}
              sellerName={sellerName}
              onConfirm={handleManualPaymentConfirm}
              onBack={() => setSelectedMethod(null)}
              isProcessing={isProcessing}
            />
          );
        }

        if (selectedMethod === 'IYZICO') {
          return (
            <IyzicoPaymentForm
              orderId={order.id}
              amount={order.totalAmount}
              currency="TRY"
              onSuccess={handleIyzicoSuccess}
              onError={handleIyzicoError}
              onCancel={() => setSelectedMethod(null)}
              isProcessing={isProcessing}
            />
          );
        }

        return null;

      case 'success':
        return (
          <SuccessScreen
            order={order}
            paymentMethod={selectedMethod!}
            onClose={handleClose}
          />
        );

      default:
        return null;
    }
  };

  // Step titles
  const stepTitles: Record<CheckoutStep, string> = {
    review: 'Sipariş Özeti',
    payment: selectedMethod ? 'Ödeme Bilgileri' : 'Ödeme Yöntemi',
    processing: 'İşleniyor...',
    success: 'Tamamlandı',
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{stepTitles[step]}</DialogTitle>
        </DialogHeader>

        <div className="py-4">{renderStepContent()}</div>
      </DialogContent>
    </Dialog>
  );
}
