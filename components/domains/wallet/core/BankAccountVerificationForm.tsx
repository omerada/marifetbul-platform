/**
 * ================================================
 * BANK ACCOUNT VERIFICATION FORM
 * ================================================
 * Complete bank account setup and verification
 *
 * Features:
 * - IBAN input with validation
 * - Bank selection with autocomplete
 * - Account holder name input
 * - Verification status display
 * - Form validation
 * - Save functionality
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 30, 2025
 * @sprint Sprint 1 - Story 1.3 - Task 3 (1 story point)
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { IBANInput } from './IBANInput';
import { BankSelector } from './BankSelector';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  BankInfo,
  IBANValidationResult,
} from '@/lib/utils/iban-validator';

// ================================================
// TYPES
// ================================================

export interface BankAccountData {
  iban: string;
  bankCode: string;
  bankName: string;
  accountHolderName: string;
  isVerified: boolean;
  verifiedAt?: Date;
}

export interface BankAccountVerificationFormProps {
  initialData?: Partial<BankAccountData>;
  onSave: (data: BankAccountData) => Promise<void>;
  onVerify?: (data: BankAccountData) => Promise<boolean>;
  className?: string;
}

// ================================================
// COMPONENT
// ================================================

export const BankAccountVerificationForm: React.FC<
  BankAccountVerificationFormProps
> = ({ initialData, onSave, onVerify, className = '' }) => {
  const [iban, setIban] = useState(initialData?.iban || '');
  const [ibanValid, setIbanValid] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankInfo | null>(null);
  const [accountHolderName, setAccountHolderName] = useState(
    initialData?.accountHolderName || ''
  );
  const [isVerified, setIsVerified] = useState(
    initialData?.isVerified || false
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ==================== HANDLERS ====================

  const handleIBANChange = (value: string, valid: boolean) => {
    setIban(value);
    setIbanValid(valid);
    if (errors.iban) {
      setErrors((prev) => ({ ...prev, iban: '' }));
    }
  };

  const handleIBANValidation = (result: IBANValidationResult) => {
    if (result.isValid && result.bankInfo) {
      setSelectedBank(result.bankInfo);
    }
  };

  const handleBankChange = (bank: BankInfo | null) => {
    setSelectedBank(bank);
    if (errors.bank) {
      setErrors((prev) => ({ ...prev, bank: '' }));
    }
  };

  const handleAccountHolderNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAccountHolderName(e.target.value);
    if (errors.accountHolderName) {
      setErrors((prev) => ({ ...prev, accountHolderName: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!iban) {
      newErrors.iban = 'IBAN numarası gerekli';
    } else if (!ibanValid) {
      newErrors.iban = 'Geçerli bir IBAN numarası girin';
    }

    if (!selectedBank) {
      newErrors.bank = 'Banka seçimi gerekli';
    }

    if (!accountHolderName.trim()) {
      newErrors.accountHolderName = 'Hesap sahibi adı gerekli';
    } else if (accountHolderName.trim().length < 3) {
      newErrors.accountHolderName = 'Hesap sahibi adı en az 3 karakter olmalı';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerify = async () => {
    if (!validateForm()) {
      toast.error('Lütfen tüm alanları doğru şekilde doldurun');
      return;
    }

    if (!onVerify) {
      toast.info('Doğrulama özelliği henüz aktif değil');
      return;
    }

    setIsVerifying(true);
    try {
      const accountData: BankAccountData = {
        iban,
        bankCode: selectedBank!.code,
        bankName: selectedBank!.name,
        accountHolderName: accountHolderName.trim(),
        isVerified: false,
      };

      const verified = await onVerify(accountData);
      setIsVerified(verified);

      if (verified) {
        toast.success('Banka hesabı doğrulandı!');
      } else {
        toast.error('Hesap doğrulanamadı. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (error) {
      logger.error('Verification failed:', error instanceof Error ? error : new Error(String(error)));
      toast.error('Doğrulama sırasında bir hata oluştu');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Lütfen tüm alanları doğru şekilde doldurun');
      return;
    }

    setIsSaving(true);
    try {
      const accountData: BankAccountData = {
        iban,
        bankCode: selectedBank!.code,
        bankName: selectedBank!.name,
        accountHolderName: accountHolderName.trim(),
        isVerified,
        verifiedAt: isVerified ? new Date() : undefined,
      };

      await onSave(accountData);
      toast.success('Banka hesap bilgileri kaydedildi');
    } catch (error) {
      logger.error('Save failed:', error instanceof Error ? error : new Error(String(error)));
      toast.error('Kaydetme sırasında bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== RENDER ====================

  const canSave =
    ibanValid && selectedBank && accountHolderName.trim().length >= 3;

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Banka Hesap Bilgileri
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Para çekme işlemleri için banka hesabınızı ekleyin
            </p>
          </div>
          {isVerified && (
            <Badge variant="success" className="gap-1">
              <ShieldCheck className="h-4 w-4" />
              Doğrulanmış
            </Badge>
          )}
        </div>

        {/* IBAN Input */}
        <IBANInput
          value={iban}
          onChange={handleIBANChange}
          onValidation={handleIBANValidation}
          label="IBAN Numarası"
          required
          showBankInfo={true}
          validateOnChange={true}
        />
        {errors.iban && <p className="text-sm text-red-600">{errors.iban}</p>}

        {/* Bank Selector */}
        <BankSelector
          value={selectedBank}
          onChange={handleBankChange}
          label="Banka"
          required
          error={errors.bank}
        />

        {/* Account Holder Name */}
        <div className="space-y-2">
          <Label htmlFor="accountHolderName">
            Hesap Sahibi Adı
            <span className="text-red-600">*</span>
          </Label>
          <Input
            id="accountHolderName"
            type="text"
            value={accountHolderName}
            onChange={handleAccountHolderNameChange}
            placeholder="Adınız Soyadınız"
            className={errors.accountHolderName ? 'border-red-500' : ''}
          />
          {errors.accountHolderName ? (
            <p className="text-sm text-red-600">{errors.accountHolderName}</p>
          ) : (
            <p className="text-xs text-gray-600">
              IBAN&apos;a kayıtlı isim ile aynı olmalıdır
            </p>
          )}
        </div>

        {/* Verification Info */}
        {!isVerified && onVerify && canSave && (
          <div className="rounded-lg bg-yellow-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-900">
                  Hesap Doğrulaması
                </p>
                <p className="mt-1 text-sm text-yellow-800">
                  Banka hesabınızı doğrulayarak para çekme işlemlerini
                  hızlandırabilirsiniz. Doğrulama işlemi birkaç dakika
                  sürebilir.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Verified Info */}
        {isVerified && (
          <div className="rounded-lg bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-semibold text-green-900">Hesap Doğrulandı</p>
                <p className="mt-1 text-sm text-green-800">
                  Banka hesabınız başarıyla doğrulandı. Para çekme işlemleri
                  daha hızlı işleme alınacaktır.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 border-t border-gray-200 pt-4">
          {!isVerified && onVerify && (
            <Button
              variant="outline"
              onClick={handleVerify}
              disabled={!canSave || isVerifying || isSaving}
              className="flex-1"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Doğrulanıyor...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Hesabı Doğrula
                </>
              )}
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!canSave || isSaving || isVerifying}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </>
            )}
          </Button>
        </div>

        {/* Security Note */}
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-gray-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Güvenlik Notu</p>
              <p className="mt-1 text-xs text-gray-700">
                Banka hesap bilgileriniz güvenli bir şekilde saklanır ve
                yalnızca ödeme işlemlerinde kullanılır. Bilgileriniz üçüncü
                taraflarla paylaşılmaz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BankAccountVerificationForm;
