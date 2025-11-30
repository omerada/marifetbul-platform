/**
 * ================================================
 * IYZICO PAYMENT FORM COMPONENT
 * ================================================
 * Secure, production-ready credit card payment form for Iyzico
 *
 * Features:
 * - Real-time card validation (Luhn algorithm)
 * - Card type auto-detection (Visa, Mastercard, Amex, Troy)
 * - Number formatting (4-4-4-4)
 * - Expiry date validation
 * - CVV validation
 * - Save card option
 * - Accessible (WCAG 2.1 AA)
 * - Responsive design
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Payment System
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  iyzicoPaymentSchema,
  formatCardNumber,
  detectCardType,
  type IyzicoPaymentFormData,
  type IyzicoCardType,
} from '@/lib/core/validations/payment';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  CreditCard,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';
import { useIyzicoPayment } from '@/hooks/business/useIyzicoPayment';

// ================================================
// TYPES
// ================================================

export interface IyzicoPaymentFormProps {
  orderId: string;
  amount: number;
  currency?: 'TRY';
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

interface CardBrandIconProps {
  type: IyzicoCardType;
}

// ================================================
// CARD BRAND ICONS
// ================================================

const CardBrandIcon: React.FC<CardBrandIconProps> = ({ type }) => {
  const getCardColor = () => {
    switch (type) {
      case 'VISA':
        return 'text-blue-600';
      case 'MASTERCARD':
        return 'text-red-600';
      case 'AMEX':
        return 'text-green-600';
      case 'TROY':
        return 'text-purple-600';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div
      className={`flex items-center gap-1 text-xs font-medium ${getCardColor()}`}
    >
      <CreditCard className="h-4 w-4" />
      <span>{type !== 'UNKNOWN' ? type : ''}</span>
    </div>
  );
};

// ================================================
// MAIN COMPONENT
// ================================================

export function IyzicoPaymentForm({
  orderId,
  amount,
  currency = 'TRY',
  onSuccess,
  onError,
  onCancel,
  isProcessing = false,
}: IyzicoPaymentFormProps) {
  const [cardType, setCardType] = useState<IyzicoCardType>('UNKNOWN');

  // Use unified Iyzico payment hook
  const {
    initiatePayment,
    isProcessing: isPaymentProcessing,
    error: paymentError,
  } = useIyzicoPayment({
    autoRedirect: true,
    debug: process.env.NODE_ENV === 'development',
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<IyzicoPaymentFormData>({
    resolver: zodResolver(iyzicoPaymentSchema),
    mode: 'onChange',
    defaultValues: {
      cardHolderName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvc: '',
      saveCard: false,
    },
  });

  const cardNumber = watch('cardNumber');

  // Auto-detect card type
  useEffect(() => {
    if (cardNumber) {
      const type = detectCardType(cardNumber);
      setCardType(type);
    } else {
      setCardType('UNKNOWN');
    }
  }, [cardNumber]);

  // Format card number input
  const handleCardNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\s/g, '');
      const formatted = formatCardNumber(value);
      setValue('cardNumber', formatted, { shouldValidate: true });
    },
    [setValue]
  );

  // Format expiry month input (auto-add leading zero)
  const handleExpiryMonthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length === 1 && parseInt(value) > 1) {
        value = '0' + value;
      }
      if (value.length > 2) {
        value = value.slice(0, 2);
      }
      setValue('expiryMonth', value, { shouldValidate: true });
    },
    [setValue]
  );

  // Format expiry year input (2 digits)
  const handleExpiryYearChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, '').slice(0, 2);
      setValue('expiryYear', value, { shouldValidate: true });
    },
    [setValue]
  );

  // Format CVC input (3-4 digits)
  const handleCvcChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const maxLength = cardType === 'AMEX' ? 4 : 3;
      const value = e.target.value.replace(/\D/g, '').slice(0, maxLength);
      setValue('cvc', value, { shouldValidate: true });
    },
    [setValue, cardType]
  );

  // Submit payment
  const onSubmit = async (data: IyzicoPaymentFormData) => {
    try {
      logger.info('IyzicoPaymentForm: Initiating payment', { orderId });

      const result = await initiatePayment({
        orderId,
        cardOptions: {
          cardHolderName: data.cardHolderName,
          cardNumber: data.cardNumber.replace(/\s/g, ''),
          expireMonth: data.expiryMonth,
          expireYear: data.expiryYear,
          cvc: data.cvc,
        },
      });

      if (result.success) {
        logger.info('IyzicoPaymentForm: Payment successful', {
          paymentId: result.paymentId,
        });
        toast.success('Ödeme başarılı!');
        onSuccess(result.paymentId!);
      } else if (result.requiresAction && result.nextActionUrl) {
        // Auto-redirect handled by hook
        logger.info('IyzicoPaymentForm: Redirecting to 3D Secure');
      } else {
        const errorMessage = result.error?.message || 'Ödeme işlemi başarısız';
        logger.error(
          'IyzicoPaymentForm: Payment failed',
          new Error(errorMessage)
        );
        toast.error(errorMessage);
        onError(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Ödeme işlemi sırasında bir hata oluştu';

      logger.error(
        'IyzicoPaymentForm: Payment error',
        error instanceof Error ? error : new Error(String(error))
      );
      toast.error(errorMessage);
      onError(errorMessage);
    }
  };

  // Show payment error from hook
  useEffect(() => {
    if (paymentError) {
      toast.error(paymentError.message);
      onError(paymentError.message);
    }
  }, [paymentError, onError]);

  const processing = isPaymentProcessing || isProcessing;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Kredi Kartı ile Öde
            </h3>
            <p className="text-sm text-gray-600">
              Güvenli ödeme - SSL ile korunmaktadır
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={processing}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri
        </Button>
      </div>

      {/* Payment Amount */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Ödenecek Tutar
          </span>
          <span className="text-2xl font-bold text-gray-900">
            {amount.toLocaleString('tr-TR', {
              style: 'currency',
              currency: currency || 'TRY',
            })}
          </span>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Card Holder Name */}
        <div>
          <label
            htmlFor="cardHolderName"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Kart Üzerindeki İsim
          </label>
          <Input
            id="cardHolderName"
            type="text"
            placeholder="AD SOYAD"
            {...register('cardHolderName')}
            disabled={processing}
            error={errors.cardHolderName?.message}
            className="uppercase"
            autoComplete="cc-name"
          />
        </div>

        {/* Card Number */}
        <div>
          <label
            htmlFor="cardNumber"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Kart Numarası
          </label>
          <div className="relative">
            <Input
              id="cardNumber"
              type="text"
              placeholder="0000 0000 0000 0000"
              {...register('cardNumber')}
              onChange={handleCardNumberChange}
              disabled={processing}
              error={errors.cardNumber?.message}
              maxLength={19}
              autoComplete="cc-number"
            />
            <div className="absolute top-1/2 right-3 -translate-y-1/2">
              <CardBrandIcon type={cardType} />
            </div>
          </div>
        </div>

        {/* Expiry Date & CVV */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="expiryMonth"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Ay
            </label>
            <Input
              id="expiryMonth"
              type="text"
              placeholder="MM"
              {...register('expiryMonth')}
              onChange={handleExpiryMonthChange}
              disabled={processing}
              error={errors.expiryMonth?.message}
              maxLength={2}
              autoComplete="cc-exp-month"
            />
          </div>

          <div>
            <label
              htmlFor="expiryYear"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Yıl
            </label>
            <Input
              id="expiryYear"
              type="text"
              placeholder="YY"
              {...register('expiryYear')}
              onChange={handleExpiryYearChange}
              disabled={processing}
              error={errors.expiryYear?.message}
              maxLength={2}
              autoComplete="cc-exp-year"
            />
          </div>

          <div>
            <label
              htmlFor="cvc"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              CVV
            </label>
            <Input
              id="cvc"
              type="text"
              placeholder={cardType === 'AMEX' ? '0000' : '000'}
              {...register('cvc')}
              onChange={handleCvcChange}
              disabled={processing}
              error={errors.cvc?.message}
              maxLength={cardType === 'AMEX' ? 4 : 3}
              autoComplete="cc-csc"
            />
          </div>
        </div>

        {/* Save Card Option */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <Checkbox
            id="saveCard"
            label="Kartımı gelecekteki ödemeler için kaydet"
            description="Kart bilgileriniz güvenli şekilde saklanır"
            {...register('saveCard')}
            disabled={processing}
          />
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          <Lock className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            Ödemeniz 256-bit SSL şifreleme ile korunmaktadır. Kart bilgileriniz
            hiçbir zaman sunucularımızda saklanmaz.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!isValid || processing}
          loading={processing}
          className="w-full"
        >
          {processing ? (
            <>
              <span className="animate-pulse">
                İşleminiz gerçekleştiriliyor...
              </span>
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Güvenli Ödeme Yap
            </>
          )}
        </Button>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-medium">Lütfen aşağıdaki hataları düzeltin:</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {Object.entries(errors).map(([key, error]) => (
                  <li key={key}>{error.message}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Success Indicator */}
        {isValid && !processing && (
          <div className="flex items-center gap-2 text-sm font-medium text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            Form doğrulandı, ödemeye hazır
          </div>
        )}
      </form>

      {/* Footer */}
      <div className="border-t pt-4 text-center text-xs text-gray-500">
        <p>
          İyzico güvenli ödeme altyapısı kullanılmaktadır.
          <br />
          PCI DSS Level 1 sertifikalı
        </p>
      </div>
    </div>
  );
}

export default IyzicoPaymentForm;
