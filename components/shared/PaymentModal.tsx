'use client';

/**
 * PAYMENT MODAL - Iyzico Payment Integration
 * Modern payment modal with Iyzico Checkout
 */

import { useState } from 'react';
import { X, CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/shared/formatters';
import { useIyzicoCheckout } from '@/hooks/business/payment';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  description: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  amount,
  description,
  onSuccess,
  onError,
}) => {
  const {
    processPayment,
    isProcessing,
    error: paymentError,
  } = useIyzicoCheckout();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentToken, setPaymentToken] = useState('');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentToken) {
      onError?.('�deme bilgileri eksik');
      return;
    }
    const result = await processPayment(paymentToken);
    if (result.success && result.payment) {
      setPaymentSuccess(true);
      onSuccess?.(result.payment.id);
      setTimeout(() => handleClose(), 2000);
    } else if (result.error) {
      onError?.(result.error.message);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setPaymentToken('');
      setPaymentSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">G�venli �deme</h2>
              <p className="text-sm text-gray-500">Iyzico ile korumal�</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          {paymentSuccess && (
            <div className="mb-6 rounded-lg bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    �deme Ba�ar�l�!
                  </p>
                  <p className="text-sm text-green-700">��leminiz tamamland�</p>
                </div>
              </div>
            </div>
          )}
          {paymentError && !paymentSuccess && (
            <div className="mb-6 rounded-lg bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Hata</p>
                  <p className="text-sm text-red-700">{paymentError}</p>
                </div>
              </div>
            </div>
          )}
          <div className="mb-6 rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              ��lem Detaylar�
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sipari�</span>
                <span className="font-medium text-gray-900">
                  #{orderId.slice(0, 8)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">A��klama</span>
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
          {!paymentSuccess && (
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="rounded-lg border border-gray-300 p-4">
                <p className="text-center text-sm text-gray-600">
                  Iyzico �deme Formu
                </p>
                <p className="mt-2 text-center text-xs text-gray-500">
                  (Geli�tirme a�amas�nda)
                </p>
              </div>
              <button
                type="submit"
                disabled={isProcessing || !paymentToken}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    ��leniyor...
                  </span>
                ) : (
                  `${formatCurrency(amount)} �de`
                )}
              </button>
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <Lock className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>
                  �deme bilgileriniz SSL ile �ifrelenir ve PCI DSS
                  standartlar�na uygun olarak i�lenir.
                </p>
              </div>
            </form>
          )}
        </div>
        {paymentSuccess && (
          <div className="border-t bg-gray-50 p-6">
            <button
              onClick={handleClose}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Kapat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

PaymentModal.displayName = 'PaymentModal';
