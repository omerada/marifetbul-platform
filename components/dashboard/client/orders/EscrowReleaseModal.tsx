/**
 * ================================================
 * ESCROW RELEASE MODAL - Escrow Payment Release
 * ================================================
 * Modal for releasing escrowed payment to freelancer
 * Shows order details and confirms payment release
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState } from 'react';
import {
  X,
  Shield,
  AlertCircle,
  CheckCircle,
  DollarSign,
  User,
} from 'lucide-react';
import { paymentApi } from '@/lib/api';
import { formatCurrency } from '@/types/business/features/wallet';

// ================================================
// TYPES
// ================================================

export interface EscrowReleaseModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Callback to close the modal
   */
  onClose: () => void;

  /**
   * Order ID to release payment for
   */
  orderId: string;

  /**
   * Amount to release
   */
  amount: number;

  /**
   * Freelancer name
   */
  freelancerName: string;

  /**
   * Order title/description
   */
  orderTitle: string;

  /**
   * Callback on successful release
   */
  onSuccess?: () => void;

  /**
   * Callback on error
   */
  onError?: (error: string) => void;
}

// ================================================
// COMPONENT
// ================================================

export const EscrowReleaseModal: React.FC<EscrowReleaseModalProps> = ({
  isOpen,
  onClose,
  orderId,
  amount,
  freelancerName,
  orderTitle,
  onSuccess,
  onError,
}) => {
  // ==================== STATE ====================

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // ==================== HANDLERS ====================

  const handleRelease = async () => {
    if (!isConfirmed) {
      setError('Lütfen onay kutusunu işaretleyin');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Release payment from escrow
      await paymentApi.releaseEscrowPayment(orderId);

      setSuccess(true);
      onSuccess?.();

      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ödeme serbest bırakılamadı';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsConfirmed(false);
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  // ==================== RENDER ====================

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Ödemeyi Serbest Bırak
              </h2>
              <p className="text-sm text-gray-500">
                Emanet tutarı freelancer&apos;a aktarın
              </p>
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
          {/* Success Message */}
          {success && (
            <div className="mb-6 rounded-lg bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    Ödeme Serbest Bırakıldı!
                  </p>
                  <p className="text-sm text-green-700">
                    Freelancer ödemeyi alacak
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !success && (
            <div className="mb-6 rounded-lg bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-900">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!success && (
            <>
              {/* Order Details */}
              <div className="mb-6 space-y-4">
                {/* Order Title */}
                <div className="rounded-lg border bg-gray-50 p-4">
                  <h3 className="mb-2 text-sm font-medium text-gray-700">
                    Sipariş Detayları
                  </h3>
                  <p className="text-base font-semibold text-gray-900">
                    {orderTitle}
                  </p>
                </div>

                {/* Freelancer */}
                <div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Freelancer</p>
                    <p className="font-semibold text-gray-900">
                      {freelancerName}
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-700">
                        Serbest Bırakılacak Tutar
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="mb-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                  <div className="space-y-2 text-sm text-amber-900">
                    <p className="font-semibold">Önemli Bilgilendirme:</p>
                    <ul className="list-disc space-y-1 pl-5">
                      <li>
                        Bu işlem geri alınamaz. Ödeme doğrudan
                        freelancer&apos;ın cüzdanına aktarılacaktır.
                      </li>
                      <li>
                        İşi teslim aldığınızdan ve kaliteden memnun olduğunuzdan
                        emin olun.
                      </li>
                      <li>
                        Sorun yaşarsanız ödemeyi serbest bırakmadan önce destek
                        ekibimize başvurun.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <label className="mb-6 flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => {
                    setIsConfirmed(e.target.checked);
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    İşi onaylıyorum ve ödemeyi serbest bırakmak istiyorum
                  </p>
                  <p className="mt-1 text-gray-600">
                    Siparişin tamamlandığını, işin kalitesinden memnun
                    olduğunuzu onaylıyorsunuz.
                  </p>
                </div>
              </label>

              {/* Escrow Protection Info */}
              <div className="rounded-lg bg-blue-50 p-4 text-xs text-blue-800">
                <div className="flex items-start gap-2">
                  <Shield className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Emanet Koruma Sistemi</p>
                    <p className="mt-1">
                      Ödemeniz sipariş tamamlanana kadar güvenli bir şekilde
                      emanette tutuldu. Bu işlemle birlikte freelancer ödemeyi
                      alacak.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex gap-3 border-t bg-gray-50 p-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              İptal
            </button>
            <button
              onClick={handleRelease}
              disabled={isLoading || !isConfirmed}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Serbest Bırakılıyor...
                </span>
              ) : (
                'Ödemeyi Serbest Bırak'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

EscrowReleaseModal.displayName = 'EscrowReleaseModal';
