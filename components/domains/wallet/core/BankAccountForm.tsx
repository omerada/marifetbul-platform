'use client';

/**
 * ================================================
 * BANK ACCOUNT FORM COMPONENT
 * ================================================
 * Complete form for adding/editing bank accounts
 *
 * Features:
 * - IBAN input with real-time validation
 * - Bank selection (auto-detected from IBAN or manual)
 * - Account holder name
 * - Account nickname (optional)
 * - Set as default account
 * - Form validation
 * - Loading states
 * - Error handling
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 5, 2025
 * @sprint Sprint 1 - Week 1 - Day 1-2: Bank Account Management
 */

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';
import { Switch } from '@/components/ui/Switch';
import { Alert } from '@/components/ui';
import { IBANInput } from './IBANInput';
import { BankSelector } from './BankSelector';
import {
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Building2,
  User,
  Tag,
} from 'lucide-react';
import {
  addBankAccount,
  type AddBankAccountRequest,
  type BankAccountResponse,
} from '@/lib/api/bank-accounts';
import {
  getBankFromIBAN,
  type BankInfo,
} from '@/lib/services/bank-info-service';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

export interface BankAccountFormData {
  iban: string;
  bankCode?: string;
  accountHolderName: string;
  nickname?: string;
  setAsDefault?: boolean;
}

export interface BankAccountFormProps {
  initialData?: Partial<BankAccountFormData>;
  mode?: 'create' | 'edit';
  onSuccess?: (bankAccount: BankAccountResponse) => void;
  onCancel?: () => void;
  className?: string;
}

// ================================================
// COMPONENT
// ================================================

export const BankAccountForm: React.FC<BankAccountFormProps> = ({
  initialData,
  mode = 'create',
  onSuccess,
  onCancel,
  className = '',
}) => {
  // Form state
  const [iban, setIban] = useState(initialData?.iban || '');
  const [ibanValid, setIbanValid] = useState(false);
  const [detectedBank, setDetectedBank] = useState<BankInfo | null>(null);
  const [selectedBank, setSelectedBank] = useState<BankInfo | null>(null);
  const [accountHolderName, setAccountHolderName] = useState(
    initialData?.accountHolderName || ''
  );
  const [nickname, setNickname] = useState(initialData?.nickname || '');
  const [setAsDefault, setSetAsDefault] = useState(
    initialData?.setAsDefault || false
  );

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBankSelector, setShowBankSelector] = useState(false);

  // ==================== EFFECTS ====================

  // Detect bank from IBAN
  useEffect(() => {
    if (iban && ibanValid) {
      const bank = getBankFromIBAN(iban);
      setDetectedBank(bank);

      if (bank) {
        setSelectedBank(bank);
        setShowBankSelector(false);
      } else {
        setShowBankSelector(true);
      }
    } else {
      setDetectedBank(null);
      setSelectedBank(null);
    }
  }, [iban, ibanValid]);

  // ==================== VALIDATION ====================

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // IBAN validation
    if (!iban) {
      newErrors.iban = 'IBAN numarası zorunludur';
    } else if (!ibanValid) {
      newErrors.iban = 'Geçerli bir IBAN numarası giriniz';
    }

    // Account holder name validation
    if (!accountHolderName.trim()) {
      newErrors.accountHolderName = 'Hesap sahibi adı zorunludur';
    } else if (accountHolderName.trim().length < 3) {
      newErrors.accountHolderName =
        'Hesap sahibi adı en az 3 karakter olmalıdır';
    }

    // Bank selection validation
    if (!selectedBank && !detectedBank) {
      newErrors.bank = 'Lütfen bir banka seçiniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== HANDLERS ====================

  const handleIbanChange = (value: string, isValid: boolean) => {
    setIban(value);
    setIbanValid(isValid);

    // Clear IBAN error when user types
    if (errors.iban) {
      setErrors((prev) => {
        const { iban: _iban, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Form Hataları', {
        description: 'Lütfen tüm alanları doğru şekilde doldurun',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData: AddBankAccountRequest = {
        iban: iban.replace(/\s/g, ''),
        accountHolder: accountHolderName.trim(),
        bankCode: selectedBank?.code || detectedBank?.code,
        bankName: selectedBank?.name || detectedBank?.name,
      };

      logger.info('Submitting bank account', { requestData });

      const response = await addBankAccount(requestData);

      toast.success('Başarılı!', {
        description: 'Banka hesabınız başarıyla eklendi',
      });

      if (onSuccess) {
        onSuccess(response);
      }

      // Reset form
      resetForm();
    } catch (error) {
      logger.error('Failed to add bank account', error as Error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Banka hesabı eklenirken bir hata oluştu';

      toast.error('Hata', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        'Formda yaptığınız değişiklikler kaydedilmeyecek. Devam etmek istiyor musunuz?'
      )
    ) {
      resetForm();
      if (onCancel) {
        onCancel();
      }
    }
  };

  const resetForm = () => {
    setIban('');
    setIbanValid(false);
    setDetectedBank(null);
    setSelectedBank(null);
    setAccountHolderName('');
    setNickname('');
    setSetAsDefault(false);
    setErrors({});
  };

  // ==================== RENDER ====================

  const isFormValid = ibanValid && accountHolderName.trim().length >= 3;

  return (
    <Card className={`p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Building2 className="h-6 w-6 text-purple-600" />
            {mode === 'create'
              ? 'Yeni Banka Hesabı Ekle'
              : 'Banka Hesabını Düzenle'}
          </h2>
          <p className="text-gray-600">
            IBAN numaranızı girerek banka hesabınızı ekleyin
          </p>
        </div>

        {/* IBAN Input */}
        <div>
          <IBANInput
            value={iban}
            onChange={handleIbanChange}
            label="IBAN Numarası"
            placeholder="TR00 0000 0000 0000 0000 0000 00"
            required
            disabled={isSubmitting}
            showBankInfo={true}
            validateOnChange={true}
          />
          {errors.iban && (
            <p className="mt-1 text-sm text-red-600">{errors.iban}</p>
          )}
        </div>

        {/* Bank Selector (shown if bank not detected) */}
        {showBankSelector && !detectedBank && (
          <div>
            <BankSelector
              value={selectedBank}
              onChange={setSelectedBank}
              label="Banka Seçin"
              placeholder="Banka adı ile ara..."
              required
              disabled={isSubmitting}
              error={errors.bank}
            />
            <p className="mt-1 text-xs text-gray-600">
              IBAN&apos;dan banka tespit edilemedi. Lütfen manuel olarak seçin.
            </p>
          </div>
        )}

        {/* Bank Info Display (if detected) */}
        {detectedBank && (
          <Alert variant="success" className="flex items-start gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-green-900">
                Banka Tespit Edildi
              </p>
              <p className="text-sm text-green-700">
                {detectedBank.name} ({detectedBank.code})
              </p>
              {detectedBank.shortName && (
                <p className="text-xs text-green-600">
                  {detectedBank.shortName}
                </p>
              )}
            </div>
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </Alert>
        )}

        {/* Account Holder Name */}
        <div>
          <Label htmlFor="accountHolderName">
            <User className="mr-2 inline-block h-4 w-4" />
            Hesap Sahibi Adı Soyadı
            <span className="text-red-600">*</span>
          </Label>
          <Input
            id="accountHolderName"
            type="text"
            value={accountHolderName}
            onChange={(e) => {
              setAccountHolderName(e.target.value);
              if (errors.accountHolderName) {
                setErrors((prev) => {
                  const { accountHolderName: _accountHolderName, ...rest } =
                    prev;
                  return rest;
                });
              }
            }}
            placeholder="Ad Soyad (IBAN'daki isim ile aynı olmalı)"
            disabled={isSubmitting}
            className={errors.accountHolderName ? 'border-red-500' : ''}
          />
          {errors.accountHolderName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.accountHolderName}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-600">
            IBAN&apos;a kayıtlı ad soyad ile aynı olmalıdır
          </p>
        </div>

        {/* Nickname (Optional) */}
        <div>
          <Label htmlFor="nickname">
            <Tag className="mr-2 inline-block h-4 w-4" />
            Hesap İsmi (İsteğe Bağlı)
          </Label>
          <Input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Örn: İş Hesabım, Tasarruf Hesabı"
            disabled={isSubmitting}
            maxLength={50}
          />
          <p className="mt-1 text-xs text-gray-600">
            Bu hesabı hatırlamanızı kolaylaştıracak bir isim verin
          </p>
        </div>

        {/* Set as Default */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div>
            <Label htmlFor="setAsDefault" className="text-base font-medium">
              Varsayılan Hesap Olarak Ayarla
            </Label>
            <p className="text-sm text-gray-600">
              Ödemeler bu hesaba otomatik olarak yapılacak
            </p>
          </div>
          <Switch
            id="setAsDefault"
            checked={setAsDefault}
            onCheckedChange={setSetAsDefault}
            disabled={isSubmitting}
          />
        </div>

        {/* Info Alert */}
        <Alert
          variant="default"
          className="flex items-start gap-3 border-blue-200 bg-blue-50"
        >
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">Güvenlik Bilgisi</p>
            <p className="mt-1 text-blue-700">
              Banka hesap bilgileriniz güvenli bir şekilde saklanır ve sadece
              ödeme işlemlerinde kullanılır. IBAN numaranız maskeli olarak
              gösterilir.
            </p>
          </div>
        </Alert>

        {/* Form Actions */}
        <div className="flex gap-3 border-t border-gray-200 pt-6">
          <Button
            type="submit"
            variant="primary"
            disabled={!isFormValid || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {mode === 'create' ? 'Hesabı Ekle' : 'Değişiklikleri Kaydet'}
              </>
            )}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              İptal
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default BankAccountForm;
