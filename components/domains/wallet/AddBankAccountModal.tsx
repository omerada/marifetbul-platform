/**
 * ================================================
 * ADD BANK ACCOUNT MODAL
 * ================================================
 * Modal for adding new bank account for payouts
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState } from 'react';
import { X, Building2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useBankAccounts } from '@/hooks/business/wallet/usePaymentMethods';
import {
  validateIBAN,
  PaymentMethodType,
  type AddPaymentMethodRequest,
} from '@/lib/api/payment-method';
import { formatIBAN } from '@/lib/utils/iban-validator';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';

// ================================================
// TYPES
// ================================================

export interface AddBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  bankName: string;
  iban: string;
  accountHolderName: string;
  nickname: string;
  isDefault: boolean;
}

// ================================================
// COMPONENT
// ================================================

export const AddBankAccountModal: React.FC<AddBankAccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // ==================== HOOKS ====================

  const { add, bankAccounts } = useBankAccounts();

  // ==================== STATE ====================

  const [formData, setFormData] = useState<FormData>({
    bankName: '',
    iban: '',
    accountHolderName: '',
    nickname: '',
    isDefault: bankAccounts.length === 0, // Auto-default if first account
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIBAN, setShowIBAN] = useState(false);

  // ==================== VALIDATION ====================

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Bank name validation
    if (!formData.bankName || formData.bankName.trim().length < 2) {
      newErrors.bankName = 'Banka adı en az 2 karakter olmalıdır';
    }

    // IBAN validation
    if (!formData.iban) {
      newErrors.iban = 'IBAN numarası gerekli';
    } else {
      const cleanIBAN = formData.iban.replace(/\s/g, '');
      if (!validateIBAN(cleanIBAN)) {
        newErrors.iban =
          'Geçersiz IBAN formatı (TR00 0000 0000 0000 0000 0000 00)';
      }
    }

    // Account holder validation
    if (
      !formData.accountHolderName ||
      formData.accountHolderName.trim().length < 3
    ) {
      newErrors.accountHolderName =
        'Hesap sahibi adı en az 3 karakter olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== HANDLERS ====================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const cleanIBAN = formData.iban.replace(/\s/g, '');

      const request: AddPaymentMethodRequest = {
        type: PaymentMethodType.BANK_TRANSFER,
        bankName: formData.bankName.trim(),
        iban: cleanIBAN,
        accountHolderName: formData.accountHolderName.trim(),
        nickname: formData.nickname.trim() || undefined,
        isDefault: formData.isDefault,
      };

      await add(request);

      onSuccess?.();
      handleClose();
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error ? error.message : 'Banka hesabı eklenemedi',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;

    setFormData({
      bankName: '',
      iban: '',
      accountHolderName: '',
      nickname: '',
      isDefault: false,
    });
    setErrors({});
    setShowIBAN(false);
    onClose();
  };

  const handleIBANChange = (value: string) => {
    // Auto-format IBAN as user types
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    const formatted = formatIBAN(cleaned);
    setFormData({ ...formData, iban: formatted });
  };

  // ==================== RENDER ====================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Building2 className="text-primary h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Banka Hesabı Ekle
              </h2>
              <p className="text-muted-foreground text-sm">
                Para çekme işlemleri için banka hesabı ekleyin
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
          <div className="space-y-5">
            {/* Submit Error */}
            {errors.submit && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Bank Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Banka Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) =>
                  setFormData({ ...formData, bankName: e.target.value })
                }
                className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:outline-none ${
                  errors.bankName
                    ? 'border-red-300 focus:ring-red-500'
                    : 'focus:ring-primary border-gray-300'
                }`}
                placeholder="Örn: Ziraat Bankası, Garanti BBVA"
                disabled={isSubmitting}
              />
              {errors.bankName && (
                <p className="mt-1 text-xs text-red-600">{errors.bankName}</p>
              )}
            </div>

            {/* IBAN */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                IBAN <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showIBAN ? 'text' : 'password'}
                  value={formData.iban}
                  onChange={(e) => handleIBANChange(e.target.value)}
                  className={`w-full rounded-lg border px-4 py-3 pr-12 font-mono focus:ring-2 focus:outline-none ${
                    errors.iban
                      ? 'border-red-300 focus:ring-red-500'
                      : 'focus:ring-primary border-gray-300'
                  }`}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  maxLength={32} // TR + 26 digits + 5 spaces
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowIBAN(!showIBAN)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showIBAN ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.iban && (
                <p className="mt-1 text-xs text-red-600">{errors.iban}</p>
              )}
              <p className="text-muted-foreground mt-1 text-xs">
                Türk bankalarına ait IBAN numarası girin
              </p>
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Hesap Sahibi Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.accountHolderName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accountHolderName: e.target.value,
                  })
                }
                className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:outline-none ${
                  errors.accountHolderName
                    ? 'border-red-300 focus:ring-red-500'
                    : 'focus:ring-primary border-gray-300'
                }`}
                placeholder="Ad Soyad"
                disabled={isSubmitting}
              />
              {errors.accountHolderName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.accountHolderName}
                </p>
              )}
              <p className="text-muted-foreground mt-1 text-xs">
                Hesap sahibinin tam adı (kimlikle uyumlu olmalı)
              </p>
            </div>

            {/* Nickname (Optional) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Takma Ad (Opsiyonel)
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) =>
                  setFormData({ ...formData, nickname: e.target.value })
                }
                className="focus:ring-primary w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:outline-none"
                placeholder="Örn: Ana Hesap, Maaş Hesabı"
                disabled={isSubmitting}
              />
              <p className="text-muted-foreground mt-1 text-xs">
                Hesabı kolayca tanımlamak için bir ad verin
              </p>
            </div>

            {/* Set as Default */}
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) =>
                  setFormData({ ...formData, isDefault: e.target.checked })
                }
                className="text-primary focus:ring-primary mt-1 h-4 w-4 rounded border-gray-300"
                disabled={isSubmitting || bankAccounts.length === 0}
              />
              <label htmlFor="isDefault" className="flex-1 cursor-pointer">
                <p className="font-medium text-gray-900">
                  Varsayılan hesap olarak ayarla
                </p>
                <p className="text-muted-foreground text-xs">
                  {bankAccounts.length === 0
                    ? 'İlk hesabınız otomatik olarak varsayılan olacak'
                    : 'Bu hesap para çekme işlemlerinde otomatik kullanılacak'}
                </p>
              </label>
            </div>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Ekleniyor...' : 'Hesap Ekle'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBankAccountModal;
