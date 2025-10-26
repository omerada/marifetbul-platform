/**
 * ================================================
 * PAYOUT REQUEST MODAL - Payout Request Form
 * ================================================
 * Modal for creating payout requests with validation
 * Checks eligibility and displays available balance
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState, useEffect } from 'react';
import { X, DollarSign, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { payoutApi } from '@/lib/api';
import type { PayoutEligibility } from '@/lib/api/validators';
import { formatCurrency } from '@/types/business/features/wallet';

// ================================================
// TYPES
// ================================================

export interface PayoutRequestModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Callback to close the modal
   */
  onClose: () => void;

  /**
   * Available balance for payout
   */
  availableBalance: number;

  /**
   * Callback on successful payout request
   */
  onSuccess?: (payoutId: string) => void;

  /**
   * Callback on error
   */
  onError?: (error: string) => void;
}

// ================================================
// CONSTANTS
// ================================================

const MIN_PAYOUT_AMOUNT = 100; // Minimum 100 TL
const MAX_PAYOUT_AMOUNT = 50000; // Maximum 50,000 TL

// ================================================
// COMPONENT
// ================================================

export const PayoutRequestModal: React.FC<PayoutRequestModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  onSuccess,
  onError,
}) => {
  // ==================== STATE ====================

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'BANK_TRANSFER' | 'STRIPE'>(
    'BANK_TRANSFER'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<PayoutEligibility | null>(
    null
  );
  const [success, setSuccess] = useState(false);

  // ==================== EFFECTS ====================

  // Check eligibility when modal opens
  useEffect(() => {
    if (isOpen) {
      checkEligibility();
    } else {
      // Reset form when modal closes
      setAmount('');
      setMethod('BANK_TRANSFER');
      setError(null);
      setSuccess(false);
      setEligibility(null);
    }
  }, [isOpen]);

  // ==================== HANDLERS ====================

  const checkEligibility = async () => {
    try {
      setIsCheckingEligibility(true);
      const result = await payoutApi.checkPayoutEligibility();
      setEligibility(result);

      if (!result.eligible && result.reason) {
        setError(result.reason);
      }
    } catch (err) {
      console.error('Failed to check eligibility:', err);
      // Continue even if eligibility check fails
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  const validateAmount = (): string | null => {
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount)) {
      return 'Lütfen geçerli bir tutar girin';
    }

    if (numAmount < MIN_PAYOUT_AMOUNT) {
      return `Minimum para çekme tutarı ${formatCurrency(MIN_PAYOUT_AMOUNT)}`;
    }

    if (numAmount > MAX_PAYOUT_AMOUNT) {
      return `Maksimum para çekme tutarı ${formatCurrency(MAX_PAYOUT_AMOUNT)}`;
    }

    if (numAmount > availableBalance) {
      return 'Yetersiz bakiye';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const validationError = validateAmount();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!eligibility?.eligible) {
      setError('Para çekme talebinde bulunamazsınız');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const payout = await payoutApi.createPayout({
        amount: parseFloat(amount),
        method,
      });

      setSuccess(true);
      onSuccess?.(payout.id);

      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Para çekme talebi oluşturulamadı';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
      setError(null);
    }
  };

  const setMaxAmount = () => {
    setAmount(Math.min(availableBalance, MAX_PAYOUT_AMOUNT).toString());
    setError(null);
  };

  const handleClose = () => {
    if (!isLoading) {
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Para Çekme Talebi
              </h2>
              <p className="text-sm text-gray-500">
                Bakiyenizi banka hesabınıza aktarın
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
                    Talep Oluşturuldu!
                  </p>
                  <p className="text-sm text-green-700">
                    Talebiniz inceleniyor
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

          {/* Eligibility Warning */}
          {eligibility && !eligibility.eligible && !success && (
            <div className="mb-6 rounded-lg bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900">
                    Para Çekme Koşulları Sağlanmıyor
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    {eligibility.reason ||
                      'Şu anda para çekme talebinde bulunamazsınız'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Balance Info */}
          <div className="mb-6 rounded-lg border bg-gray-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">
                Bakiye Bilgisi
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Kullanılabilir Bakiye</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(availableBalance)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Minimum Tutar</span>
                <span className="text-gray-900">
                  {formatCurrency(MIN_PAYOUT_AMOUNT)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Maksimum Tutar</span>
                <span className="text-gray-900">
                  {formatCurrency(MAX_PAYOUT_AMOUNT)}
                </span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isCheckingEligibility && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-green-600"></div>
              <p className="text-sm text-gray-600">Kontrol ediliyor...</p>
            </div>
          )}

          {/* Form */}
          {!success && !isCheckingEligibility && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount Input */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Çekilecek Tutar (TRY)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    disabled={isLoading || !eligibility?.eligible}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-20 text-lg font-semibold focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={setMaxAmount}
                    disabled={isLoading || !eligibility?.eligible}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    MAX
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {amount &&
                    !isNaN(parseFloat(amount)) &&
                    `≈ ${formatCurrency(parseFloat(amount))}`}
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Ödeme Yöntemi
                </label>
                <select
                  value={method}
                  onChange={(e) =>
                    setMethod(e.target.value as 'BANK_TRANSFER' | 'STRIPE')
                  }
                  disabled={isLoading || !eligibility?.eligible}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="BANK_TRANSFER">Banka Havalesi (EFT)</option>
                  <option value="STRIPE">Stripe (Hızlı Transfer)</option>
                </select>
              </div>

              {/* Bank Account Note */}
              {method === 'BANK_TRANSFER' && (
                <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                  <p className="font-medium">Not:</p>
                  <p className="mt-1">
                    Para transferi, kayıtlı banka hesabınıza yapılacaktır. Banka
                    hesabı eklemek için profil ayarlarınıza gidin.
                  </p>
                </div>
              )}

              {/* Processing Time */}
              <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                <p className="font-medium">İşlem Süresi:</p>
                <p className="mt-1">
                  {method === 'BANK_TRANSFER'
                    ? '1-3 iş günü içinde hesabınıza aktarılacaktır'
                    : 'Genellikle 24 saat içinde tamamlanır'}
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!success && !isCheckingEligibility && (
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
              onClick={handleSubmit}
              disabled={isLoading || !amount || !eligibility?.eligible}
              className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Oluşturuluyor...
                </span>
              ) : (
                'Talep Oluştur'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

PayoutRequestModal.displayName = 'PayoutRequestModal';
