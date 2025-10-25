/**
 * ================================================
 * REQUEST PAYOUT MODAL - Payout Request Form
 * ================================================
 * Modal for creating new payout requests with validation
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState } from 'react';
import { X, DollarSign, CreditCard, AlertCircle } from 'lucide-react';
import { usePayouts } from '@/hooks/business/wallet';
import {
  PayoutMethod,
  formatCurrency,
  maskIBAN,
  type PayoutRequest,
} from '@/types/business/features/wallet';

// ================================================
// TYPES
// ================================================

export interface RequestPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ================================================
// COMPONENT
// ================================================

export const RequestPayoutModal: React.FC<RequestPayoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // ==================== HOOKS ====================

  const {
    eligibility,
    limits,
    canRequestPayout,
    eligibilityReason,
    requestPayout,
    isSubmitting,
  } = usePayouts(true);

  // ==================== STATE ====================

  const [formData, setFormData] = useState<Partial<PayoutRequest>>({
    amount: undefined,
    method: PayoutMethod.BANK_TRANSFER,
    bankAccountInfo: {
      bankName: '',
      iban: '',
      accountHolder: '',
    },
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showIBAN, setShowIBAN] = useState(false);

  // ==================== VALIDATION ====================

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Amount validation
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Geçerli bir tutar girin';
    } else if (limits) {
      if (formData.amount < limits.minimumAmount) {
        newErrors.amount = `Minimum çekim tutarı ${formatCurrency(limits.minimumAmount)}`;
      }
      if (formData.amount > limits.maximumAmount) {
        newErrors.amount = `Maksimum çekim tutarı ${formatCurrency(limits.maximumAmount)}`;
      }
      if (eligibility && formData.amount > eligibility.availableBalance) {
        newErrors.amount = 'Yetersiz bakiye';
      }
    }

    // IBAN validation (Turkish IBAN format)
    if (formData.method === PayoutMethod.BANK_TRANSFER) {
      if (!formData.bankAccountInfo?.iban) {
        newErrors.iban = 'IBAN numarası gerekli';
      } else {
        const cleanIBAN = formData.bankAccountInfo.iban.replace(/\s/g, '');
        if (!/^TR\d{2}[A-Z0-9]{22}$/.test(cleanIBAN)) {
          newErrors.iban =
            'Geçersiz IBAN formatı (TR00 0000 0000 0000 0000 0000 00)';
        }
      }

      if (
        !formData.bankAccountInfo?.bankName ||
        formData.bankAccountInfo.bankName.trim().length < 2
      ) {
        newErrors.bankName = 'Banka adı gerekli';
      }

      if (
        !formData.bankAccountInfo?.accountHolder ||
        formData.bankAccountInfo.accountHolder.trim().length < 3
      ) {
        newErrors.accountHolder = 'Hesap sahibi adı gerekli';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== HANDLERS ====================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !canRequestPayout) return;

    try {
      await requestPayout(formData as PayoutRequest);
      onSuccess?.();
      onClose();
      // Reset form
      setFormData({
        amount: undefined,
        method: PayoutMethod.BANK_TRANSFER,
        bankAccountInfo: {
          bankName: '',
          iban: '',
          accountHolder: '',
        },
        notes: '',
      });
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : 'Para çekme talebi oluşturulamadı',
      });
    }
  };

  const handleIBANChange = (value: string) => {
    // Auto-format IBAN with spaces
    let formatted = value.replace(/\s/g, '').toUpperCase();
    if (formatted.startsWith('TR')) {
      formatted = formatted.match(/.{1,4}/g)?.join(' ') || formatted;
    }
    setFormData({
      ...formData,
      bankAccountInfo: {
        bankName: formData.bankAccountInfo?.bankName || '',
        iban: formatted,
        accountHolder: formData.bankAccountInfo?.accountHolder || '',
      },
    });
  };

  // ==================== RENDER ====================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <DollarSign className="text-primary h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Para Çekme Talebi
                </h2>
                <p className="text-muted-foreground text-sm">
                  Bakiyenizi banka hesabınıza aktarın
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Eligibility Warning */}
            {!canRequestPayout && eligibilityReason && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900">
                    Para Çekme Yapılamıyor
                  </p>
                  <p className="mt-1 text-sm text-amber-700">
                    {eligibilityReason}
                  </p>
                </div>
              </div>
            )}

            {/* Available Balance Info */}
            {eligibility && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="mb-1 text-sm text-green-700">
                  Çekilebilir Bakiye
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(eligibility.availableBalance)}
                </p>
                {limits && (
                  <p className="mt-2 text-xs text-green-600">
                    Min: {formatCurrency(limits.minimumAmount)} - Max:{' '}
                    {formatCurrency(limits.maximumAmount)}
                  </p>
                )}
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Çekilecek Tutar <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value),
                    })
                  }
                  className={`w-full border py-3 pr-12 pl-10 ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-primary rounded-lg focus:ring-2 focus:outline-none`}
                  placeholder="0,00"
                  disabled={!canRequestPayout}
                />
                <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                  ₺
                </div>
                <div className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-500">
                  TL
                </div>
              </div>
              {errors.amount && (
                <p className="mt-1 text-xs text-red-600">{errors.amount}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Ödeme Yöntemi <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      method: PayoutMethod.BANK_TRANSFER,
                    })
                  }
                  className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                    formData.method === PayoutMethod.BANK_TRANSFER
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={!canRequestPayout}
                >
                  <CreditCard className="text-primary h-5 w-5" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">Banka Transferi</p>
                    <p className="text-muted-foreground text-xs">
                      1-3 iş günü içinde
                    </p>
                  </div>
                  {formData.method === PayoutMethod.BANK_TRANSFER && (
                    <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Bank Details */}
            {formData.method === PayoutMethod.BANK_TRANSFER && (
              <>
                {/* IBAN */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    IBAN <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={
                        showIBAN
                          ? formData.bankAccountInfo?.iban
                          : maskIBAN(formData.bankAccountInfo?.iban || '')
                      }
                      onChange={(e) => handleIBANChange(e.target.value)}
                      onFocus={() => setShowIBAN(true)}
                      onBlur={() => setShowIBAN(false)}
                      className={`w-full border px-4 py-3 ${
                        errors.iban ? 'border-red-300' : 'border-gray-300'
                      } focus:ring-primary rounded-lg font-mono text-sm focus:ring-2 focus:outline-none`}
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                      maxLength={32}
                      disabled={!canRequestPayout}
                    />
                  </div>
                  {errors.iban && (
                    <p className="mt-1 text-xs text-red-600">{errors.iban}</p>
                  )}
                </div>

                {/* Bank Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Banka Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccountInfo?.bankName || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankAccountInfo: {
                          bankName: e.target.value,
                          iban: formData.bankAccountInfo?.iban || '',
                          accountHolder:
                            formData.bankAccountInfo?.accountHolder || '',
                        },
                      })
                    }
                    className={`w-full border px-4 py-3 ${
                      errors.bankName ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-primary rounded-lg focus:ring-2 focus:outline-none`}
                    placeholder="Örn: Ziraat Bankası"
                    disabled={!canRequestPayout}
                  />
                  {errors.bankName && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.bankName}
                    </p>
                  )}
                </div>

                {/* Account Holder Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Hesap Sahibi Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccountInfo?.accountHolder || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankAccountInfo: {
                          bankName: formData.bankAccountInfo?.bankName || '',
                          iban: formData.bankAccountInfo?.iban || '',
                          accountHolder: e.target.value,
                        },
                      })
                    }
                    className={`w-full border px-4 py-3 ${
                      errors.accountHolder
                        ? 'border-red-300'
                        : 'border-gray-300'
                    } focus:ring-primary rounded-lg focus:ring-2 focus:outline-none`}
                    placeholder="Ad Soyad"
                    disabled={!canRequestPayout}
                  />
                  {errors.accountHolder && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.accountHolder}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Notes (Optional) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Notlar (Opsiyonel)
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="focus:ring-primary w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:outline-none"
                placeholder="Varsa eklemek istediğiniz notlar..."
                disabled={!canRequestPayout}
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 border-t pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={!canRequestPayout || isSubmitting}
                className="bg-primary hover:bg-primary/90 flex-1 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Talep Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

RequestPayoutModal.displayName = 'RequestPayoutModal';
