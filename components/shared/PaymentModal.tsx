/**
 * ================================================
 * PAYMENT MODAL - Stripe Payment Integration
 * ================================================
 * Modern payment modal with Stripe Elements
 * Handles payment intent creation and confirmation
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState, useEffect } from 'react';
import { X, CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentApi } from '@/lib/api';
import { formatCurrency } from '@/types/business/features/wallet';
import { StripeProvider } from '@/components/providers';

// ================================================
// TYPES
// ================================================

export interface PaymentModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Callback to close the modal
   */
  onClose: () => void;

  /**
   * Order ID for the payment
   */
  orderId: string;

  /**
   * Payment amount in TRY
   */
  amount: number;

  /**
   * Order description
   */
  description: string;

  /**
   * Callback on successful payment
   */
  onSuccess?: (paymentId: string) => void;

  /**
   * Callback on payment error
   */
  onError?: (error: string) => void;
}

// ================================================
// CARD ELEMENT STYLES
// ================================================

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      fontFamily: 'system-ui, sans-serif',
      '::placeholder': {
        color: '#9ca3af',
      },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
};

// ================================================
// PAYMENT FORM COMPONENT (Inner - with Stripe hooks)
// ================================================

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  clientSecret,
  amount,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    try {
      setIsProcessing(true);

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ödeme başarısız oldu';
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card Element */}
      <div className="rounded-lg border border-gray-300 p-4">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            İşleniyor...
          </span>
        ) : (
          `${formatCurrency(amount)} Öde`
        )}
      </button>
    </form>
  );
};

// ================================================
// COMPONENT
// ================================================

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  amount,
  description,
  onSuccess,
  onError,
}) => {
  // ==================== STATE ====================

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // ==================== EFFECTS ====================

  // Create payment intent when modal opens
  useEffect(() => {
    if (isOpen && !clientSecret) {
      createPaymentIntent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ==================== HANDLERS ====================

  const createPaymentIntent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await paymentApi.createPaymentIntent({
        orderId,
        amount,
        currency: 'TRY',
      });
      setClientSecret(response.clientSecret);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ödeme başlatılamadı';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPayment = async () => {
    // Test payment using test card
    try {
      setIsLoading(true);
      setError(null);

      if (!clientSecret) {
        throw new Error('Payment intent not created');
      }

      // Extract payment intent ID from client secret
      const paymentIntentId = clientSecret.split('_secret_')[0];

      // Confirm payment (in production, this would be done via Stripe.js)
      await paymentApi.confirmPaymentIntent(paymentIntentId);

      setPaymentSuccess(true);
      onSuccess?.(paymentIntentId);

      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ödeme başarısız oldu';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setPaymentSuccess(true);
    onSuccess?.(paymentIntentId);

    // Close modal after success
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    onError?.(errorMessage);
  };

  const handleClose = () => {
    if (!isLoading) {
      setClientSecret(null);
      setError(null);
      setPaymentSuccess(false);
      onClose();
    }
  };

  // ==================== RENDER ====================

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Güvenli Ödeme</h2>
              <p className="text-sm text-gray-500">Stripe ile korumalı</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Payment Success */}
          {paymentSuccess && (
            <div className="mb-6 rounded-lg bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    Ödeme Başarılı!
                  </p>
                  <p className="text-sm text-green-700">İşleminiz tamamlandı</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !paymentSuccess && (
            <div className="mb-6 rounded-lg bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Hata</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="mb-6 rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              İşlem Detayları
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sipariş</span>
                <span className="font-medium text-gray-900">
                  #{orderId.slice(0, 8)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Açıklama</span>
                <span className="font-medium text-gray-900">{description}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-gray-900">
                    Toplam Tutar
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          {!paymentSuccess && clientSecret && (
            <div className="space-y-4">
              {/* Stripe Payment Form */}
              <StripeProvider>
                <PaymentForm
                  clientSecret={clientSecret}
                  amount={amount}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </StripeProvider>

              {/* Test Payment Button (Development) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="border-t pt-4">
                  <button
                    onClick={handleTestPayment}
                    disabled={isLoading}
                    className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Test Ödeme (Backend)
                  </button>
                </div>
              )}

              {/* Security Notice */}
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <Lock className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>
                  Ödeme bilgileriniz SSL ile şifrelenir ve PCI DSS
                  standartlarına uygun olarak işlenir. Kart bilgileriniz hiçbir
                  zaman sunucularımızda saklanmaz.
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !clientSecret && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
              <p className="text-sm text-gray-600">Ödeme hazırlanıyor...</p>
            </div>
          )}
        </div>

        {/* Footer - Only show close button when not in payment form */}
        {(!clientSecret || paymentSuccess) && (
          <div className="border-t bg-gray-50 p-6">
            <button
              onClick={handleClose}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              {paymentSuccess ? 'Kapat' : 'İptal'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

PaymentModal.displayName = 'PaymentModal';
