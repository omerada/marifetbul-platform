/**
 * ================================================
 * PAYOUT REQUEST MODAL
 * ================================================
 * Unified payout request modal with bank account selection
 *
 * Features:
 * - Visual bank account selection with cards
 * - Auto-select default bank account
 * - Eligibility checking and validation
 * - Maximum amount quick button
 * - Processing time display per bank
 * - Comprehensive error handling
 *
 * @author MarifetBul Development Team
 * @version 3.0.0 - Sprint 1: Consolidated from 3 versions
 */

'use client';

import { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  AlertCircle,
  Plus,
  Building2,
  Check,
} from 'lucide-react';
import { usePayouts } from '@/hooks/business/wallet';
import { useBankAccounts } from '@/hooks/business/wallet/usePaymentMethods';
import {
  PayoutMethod,
  formatCurrency,
  type PayoutRequest,
} from '@/types/business/features/wallet';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import Link from 'next/link';

// ================================================
// TYPES
// ================================================

export interface PayoutRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ================================================
// COMPONENT
// ================================================

export const PayoutRequestModal: React.FC<PayoutRequestModalProps> = ({
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

  const { bankAccounts, defaultPaymentMethod } = useBankAccounts();

  // ==================== STATE ====================

  const [amount, setAmount] = useState<string>('');
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<
    string | null
  >(null);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-select default bank account
  useEffect(() => {
    if (defaultPaymentMethod && !selectedBankAccountId) {
      setSelectedBankAccountId(defaultPaymentMethod.id);
    }
  }, [defaultPaymentMethod, selectedBankAccountId]);

  // ==================== VALIDATION ====================

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const numAmount = parseFloat(amount);

    // Amount validation
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Geçerli bir tutar girin';
    } else if (limits) {
      if (numAmount < limits.minimumAmount) {
        newErrors.amount = `Minimum çekim tutarı ${formatCurrency(limits.minimumAmount)}`;
      }
      if (numAmount > limits.maximumAmount) {
        newErrors.amount = `Maksimum çekim tutarı ${formatCurrency(limits.maximumAmount)}`;
      }
      if (eligibility && numAmount > eligibility.availableBalance) {
        newErrors.amount = 'Yetersiz bakiye';
      }
    }

    // Bank account validation
    if (!selectedBankAccountId) {
      newErrors.bankAccount = 'Lütfen bir banka hesabı seçin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== HANDLERS ====================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !canRequestPayout) return;

    try {
      const request: PayoutRequest = {
        amount: parseFloat(amount),
        method: PayoutMethod.BANK_TRANSFER,
        bankAccountId: selectedBankAccountId!,
        notes: notes.trim() || undefined,
      };

      await requestPayout(request);
      onSuccess?.();
      handleClose();
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : 'Para çekme talebi oluşturulamadı',
      });
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;

    setAmount('');
    setSelectedBankAccountId(null);
    setNotes('');
    setErrors({});
    onClose();
  };

  // ==================== RENDER ====================

  if (!isOpen) return null;

  const selectedAccount = bankAccounts.find(
    (acc) => acc.id === selectedBankAccountId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <DollarSign className="text-primary h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Para Çek</h2>
              <p className="text-muted-foreground text-sm">
                Cüzdanınızdan banka hesabınıza para transfer edin
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Eligibility Check */}
            {!canRequestPayout && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">
                    Para Çekme Yapılamıyor
                  </p>
                  <p className="text-sm text-red-700">{eligibilityReason}</p>
                </div>
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Available Balance */}
            {eligibility && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">
                    Çekilebilir Bakiye
                  </span>
                  <span className="text-2xl font-bold text-green-900">
                    {formatCurrency(eligibility.availableBalance)}
                  </span>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Çekilecek Tutar <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500">
                  ₺
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full rounded-lg border px-4 py-3 pl-8 text-lg font-semibold focus:ring-2 focus:outline-none ${
                    errors.amount
                      ? 'border-red-300 focus:ring-red-500'
                      : 'focus:ring-primary border-gray-300'
                  }`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={!canRequestPayout || isSubmitting}
                  aria-label="Çekilecek tutar"
                  aria-describedby="amount-help"
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  {errors.amount && (
                    <p className="text-xs text-red-600">{errors.amount}</p>
                  )}
                  {limits && !errors.amount && (
                    <p
                      id="amount-help"
                      className="text-muted-foreground text-xs"
                    >
                      Min: {formatCurrency(limits.minimumAmount)} - Max:{' '}
                      {formatCurrency(limits.maximumAmount)}
                    </p>
                  )}
                </div>
                {eligibility && eligibility.availableBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const maxAmount = Math.min(
                        eligibility.availableBalance,
                        limits?.maximumAmount || eligibility.availableBalance
                      );
                      setAmount(maxAmount.toFixed(2));
                    }}
                    disabled={!canRequestPayout || isSubmitting}
                    className="text-primary hover:text-primary/80 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    Maksimum Tutar
                  </button>
                )}
              </div>
            </div>

            {/* Bank Account Selection */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Banka Hesabı <span className="text-red-500">*</span>
                </label>
                <Link
                  href="/dashboard/wallet/bank-accounts/add"
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  <Plus className="mr-1 inline h-4 w-4" />
                  Hesap Ekle
                </Link>
              </div>

              {bankAccounts.length === 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
                  <Building2 className="mx-auto mb-2 h-8 w-8 text-amber-600" />
                  <p className="mb-2 text-sm font-medium text-amber-900">
                    Kayıtlı banka hesabınız yok
                  </p>
                  <Link
                    href="/dashboard/wallet/bank-accounts/add"
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    Banka Hesabı Ekle →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {bankAccounts.map((account) => {
                    const isSelected = selectedBankAccountId === account.id;

                    return (
                      <button
                        key={account.id}
                        type="button"
                        onClick={() => setSelectedBankAccountId(account.id)}
                        className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        disabled={isSubmitting}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                isSelected ? 'bg-primary/10' : 'bg-gray-100'
                              }`}
                            >
                              <Building2
                                className={`h-5 w-5 ${
                                  isSelected ? 'text-primary' : 'text-gray-600'
                                }`}
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {account.bankName}
                              </p>
                              <p className="text-muted-foreground font-mono text-sm">
                                {account.maskedIdentifier ||
                                  `**** ${account.accountLastFour || ''}`}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="text-primary h-5 w-5" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.bankAccount && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.bankAccount}
                </p>
              )}
            </div>

            {/* Notes (Optional) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Not (Opsiyonel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="focus:ring-primary w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:outline-none"
                placeholder="İsteğe bağlı açıklama ekleyin"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            {/* Processing Time Info */}
            {selectedAccount && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  ⏱️ Para transferi <strong>1-3 iş günü</strong> içinde{' '}
                  {selectedAccount.bankName} hesabınıza ulaşacaktır.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 flex-1"
              disabled={
                !canRequestPayout || isSubmitting || bankAccounts.length === 0
              }
            >
              {isSubmitting ? 'İşleniyor...' : 'Para Çekme Talebi Oluştur'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayoutRequestModal;
