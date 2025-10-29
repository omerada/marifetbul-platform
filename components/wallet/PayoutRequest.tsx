/**
 * ================================================
 * PAYOUT REQUEST COMPONENT
 * ================================================
 * Comprehensive payout request form with validation and bank account management
 *
 * Features:
 * - Amount input with real-time validation
 * - Min/max limits display
 * - Eligibility checking
 * - Bank account selection/management
 * - Multiple payment methods (Bank Transfer, PayPal)
 * - Fee calculation preview
 * - Estimated arrival date
 * - Request tracking
 * - Loading states
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 1
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Building2,
  Info,
  Plus,
  RefreshCw,
  TrendingUp,
  Calendar,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/loading';
import {
  formatCurrency,
  formatDate,
  formatIBAN,
} from '@/lib/shared/formatters';
import { cn } from '@/lib/utils';
import type {
  PayoutRequest as PayoutRequestData,
  PayoutLimits,
  PayoutEligibility,
} from '@/types/business/features/wallet';
import { PayoutMethod } from '@/types/business/features/wallet';

// ============================================================================
// TYPES
// ============================================================================

export interface PayoutRequestProps {
  availableBalance: number;
  pendingPayouts?: number;
  limits?: PayoutLimits;
  eligibility?: PayoutEligibility;
  onSubmit: (request: PayoutRequestData) => Promise<void>;
  onCheckEligibility?: () => Promise<PayoutEligibility>;
  onRefresh?: () => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

interface BankAccount {
  id: string;
  bankName: string;
  iban: string;
  accountHolder: string;
  isDefault: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_LIMITS: PayoutLimits = {
  minAmount: 100,
  maxAmount: 50000,
  dailyLimit: 50000,
  monthlyLimit: 200000,
  currency: 'TRY',
};

const PLATFORM_FEE_PERCENT = 2.5; // %2.5 platform fee
const PROCESSING_DAYS = 3; // 3 business days

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateEstimatedArrival(): Date {
  const date = new Date();
  let daysAdded = 0;

  while (daysAdded < PROCESSING_DAYS) {
    date.setDate(date.getDate() + 1);
    // Skip weekends
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      daysAdded++;
    }
  }

  return date;
}

function calculateFee(amount: number): number {
  return Math.round(amount * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
}

// ============================================================================
// AMOUNT INPUT COMPONENT
// ============================================================================

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  availableBalance: number;
  limits: PayoutLimits;
  disabled?: boolean;
  errors?: ValidationError[];
}

function AmountInput({
  value,
  onChange,
  availableBalance,
  limits,
  disabled,
  errors,
}: AmountInputProps) {
  const numValue = parseFloat(value) || 0;
  const fee = calculateFee(numValue);
  const netAmount = numValue - fee;

  const handleMaxAmount = () => {
    const maxAllowed = Math.min(
      availableBalance,
      limits.maxAmount,
      limits.dailyLimit
    );
    onChange(maxAllowed.toFixed(2));
  };

  const amountError = errors?.find((e) => e.field === 'amount');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Çekilecek Tutar</label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleMaxAmount}
          disabled={disabled || availableBalance === 0}
          className="h-auto p-1 text-xs"
        >
          Maksimum Tutar
        </Button>
      </div>

      <div className="relative">
        <DollarSign className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="number"
          step="0.01"
          min={limits.minAmount}
          max={Math.min(availableBalance, limits.maxAmount)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
          disabled={disabled}
          className={cn(
            'w-full rounded-lg border border-gray-300 py-3 pr-20 pl-10 text-lg font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none',
            amountError &&
              'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            disabled && 'cursor-not-allowed bg-gray-50 opacity-60'
          )}
        />
        <div className="absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium text-gray-500">
          {limits.currency}
        </div>
      </div>

      {amountError && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{amountError.message}</span>
        </div>
      )}

      {/* Fee and Net Amount */}
      {numValue > 0 && !amountError && (
        <div className="space-y-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Platform Ücreti (%{PLATFORM_FEE_PERCENT})
            </span>
            <span className="font-medium text-red-600">
              -{formatCurrency(fee, limits.currency)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-blue-200 pt-2">
            <span className="font-semibold text-gray-700">
              Alacağınız Tutar
            </span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(netAmount, limits.currency)}
            </span>
          </div>
        </div>
      )}

      {/* Limits Info */}
      <div className="space-y-1 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>Minimum:</span>
          <span className="font-medium">
            {formatCurrency(limits.minAmount, limits.currency)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Maksimum:</span>
          <span className="font-medium">
            {formatCurrency(limits.maxAmount, limits.currency)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Günlük Limit:</span>
          <span className="font-medium">
            {formatCurrency(limits.dailyLimit, limits.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PAYMENT METHOD SELECTOR
// ============================================================================

interface PaymentMethodSelectorProps {
  selectedMethod: PayoutMethod;
  onMethodChange: (method: PayoutMethod) => void;
  disabled?: boolean;
}

function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  disabled,
}: PaymentMethodSelectorProps) {
  const methods: Array<{
    value: PayoutMethod;
    label: string;
    icon: React.ElementType;
    description: string;
  }> = [
    {
      value: PayoutMethod.BANK_TRANSFER,
      label: 'Banka Havalesi',
      icon: Building2,
      description: 'EFT ile banka hesabınıza',
    },
    {
      value: PayoutMethod.STRIPE,
      label: 'Stripe',
      icon: CreditCard,
      description: 'Stripe hesabınıza',
    },
  ];

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Para Çekme Yöntemi</label>
      <div className="grid gap-3 sm:grid-cols-2">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.value;

          return (
            <button
              key={method.value}
              type="button"
              onClick={() => onMethodChange(method.value)}
              disabled={disabled}
              className={cn(
                'flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all',
                isSelected
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                  : 'border-gray-200 hover:border-gray-300',
                disabled && 'cursor-not-allowed opacity-60'
              )}
            >
              <div
                className={cn(
                  'rounded-lg p-2',
                  isSelected
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{method.label}</span>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  {method.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// BANK ACCOUNT SELECTOR
// ============================================================================

interface BankAccountSelectorProps {
  accounts: BankAccount[];
  selectedAccountId: string;
  onAccountChange: (accountId: string) => void;
  onAddNew: () => void;
  disabled?: boolean;
  errors?: ValidationError[];
}

function BankAccountSelector({
  accounts,
  selectedAccountId,
  onAccountChange,
  onAddNew,
  disabled,
  errors,
}: BankAccountSelectorProps) {
  const accountError = errors?.find((e) => e.field === 'bankAccount');

  if (accounts.length === 0) {
    return (
      <div className="space-y-3">
        <label className="text-sm font-medium">Banka Hesabı</label>
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 font-semibold text-gray-900">
            Banka Hesabı Bulunamadı
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Para çekebilmek için önce bir banka hesabı eklemelisiniz
          </p>
          <Button
            type="button"
            onClick={onAddNew}
            className="mt-4"
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Banka Hesabı Ekle
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Banka Hesabı</label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAddNew}
          disabled={disabled}
          className="h-auto p-1 text-xs"
        >
          <Plus className="mr-1 h-3 w-3" />
          Yeni Ekle
        </Button>
      </div>

      <div className="space-y-2">
        {accounts.map((account) => {
          const isSelected = selectedAccountId === account.id;

          return (
            <button
              key={account.id}
              type="button"
              onClick={() => onAccountChange(account.id)}
              disabled={disabled}
              className={cn(
                'flex w-full items-start gap-3 rounded-lg border-2 p-3 text-left transition-all',
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300',
                disabled && 'cursor-not-allowed opacity-60'
              )}
            >
              <div
                className={cn(
                  'rounded-full p-2',
                  isSelected
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{account.bankName}</span>
                  {account.isDefault && (
                    <Badge variant="outline" className="text-xs">
                      Varsayılan
                    </Badge>
                  )}
                </div>
                <p className="mt-1 truncate text-sm text-gray-600">
                  {formatIBAN(account.iban)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {account.accountHolder}
                </p>
              </div>
              {isSelected && (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-blue-600" />
              )}
            </button>
          );
        })}
      </div>

      {accountError && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{accountError.message}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ELIGIBILITY CHECKER
// ============================================================================

interface EligibilityCheckerProps {
  eligibility?: PayoutEligibility;
  onCheck?: () => void;
  isLoading?: boolean;
}

function EligibilityChecker({
  eligibility,
  onCheck,
  isLoading,
}: EligibilityCheckerProps) {
  if (!eligibility) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Uygunluk kontrolü yapılmamış
              </p>
              {onCheck && (
                <Button
                  onClick={onCheck}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                      Kontrol Ediliyor...
                    </>
                  ) : (
                    'Uygunluğu Kontrol Et'
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!eligibility.canRequestPayout) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">
                Para Çekme Yapılamıyor
              </p>
              <p className="mt-1 text-sm text-red-700">{eligibility.reason}</p>
              {eligibility.nextEligibleDate && (
                <p className="mt-2 text-xs text-red-600">
                  Sonraki uygun tarih:{' '}
                  {formatDate(eligibility.nextEligibleDate, 'FULL')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">
              Para Çekme İşlemi Yapabilirsiniz
            </p>
            <div className="mt-2 grid gap-2 text-xs text-green-700 sm:grid-cols-2">
              <div>
                Kullanılabilir Bakiye:{' '}
                {formatCurrency(eligibility.availableBalance, 'TRY')}
              </div>
              <div>Bekleyen Çekimler: {eligibility.pendingPayouts}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PayoutRequest({
  availableBalance,
  pendingPayouts = 0,
  limits = DEFAULT_LIMITS,
  eligibility,
  onSubmit,
  onCheckEligibility,
  onRefresh,
  isLoading = false,
  error,
  className,
}: PayoutRequestProps) {
  const router = useRouter();

  // Form state
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PayoutMethod>(
    PayoutMethod.BANK_TRANSFER
  );
  const [bankAccountId, setBankAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );

  // Mock bank accounts (in real app, fetch from API)
  const [bankAccounts] = useState<BankAccount[]>([
    {
      id: '1',
      bankName: 'Ziraat Bankası',
      iban: 'TR330006100519786457841326',
      accountHolder: 'Ahmet Yılmaz',
      isDefault: true,
    },
    {
      id: '2',
      bankName: 'İş Bankası',
      iban: 'TR640006400000145379124587',
      accountHolder: 'Ahmet Yılmaz',
      isDefault: false,
    },
  ]);

  // Auto-select default bank account
  useEffect(() => {
    const defaultAccount = bankAccounts.find((acc) => acc.isDefault);
    if (defaultAccount && !bankAccountId) {
      setBankAccountId(defaultAccount.id);
    }
  }, [bankAccounts, bankAccountId]);

  // Validate form
  const validateForm = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount)) {
      errors.push({ field: 'amount', message: 'Geçerli bir tutar giriniz' });
    } else if (numAmount < limits.minAmount) {
      errors.push({
        field: 'amount',
        message: `Minimum tutar ${formatCurrency(limits.minAmount, limits.currency)}`,
      });
    } else if (numAmount > limits.maxAmount) {
      errors.push({
        field: 'amount',
        message: `Maksimum tutar ${formatCurrency(limits.maxAmount, limits.currency)}`,
      });
    } else if (numAmount > availableBalance) {
      errors.push({ field: 'amount', message: 'Yetersiz bakiye' });
    }

    if (method === PayoutMethod.BANK_TRANSFER && !bankAccountId) {
      errors.push({ field: 'bankAccount', message: 'Banka hesabı seçiniz' });
    }

    return errors;
  }, [amount, limits, availableBalance, method, bankAccountId]);

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    setValidationErrors(errors);

    if (errors.length > 0) return;

    setIsSubmitting(true);

    try {
      const selectedAccount = bankAccounts.find(
        (acc) => acc.id === bankAccountId
      );

      const requestData: PayoutRequestData = {
        amount: parseFloat(amount),
        method,
        bankAccountId:
          method === PayoutMethod.BANK_TRANSFER ? bankAccountId : undefined,
        bankAccountInfo: selectedAccount
          ? {
              bankName: selectedAccount.bankName,
              iban: selectedAccount.iban,
              accountHolder: selectedAccount.accountHolder,
            }
          : undefined,
        notes: notes || undefined,
      };

      await onSubmit(requestData);

      // Reset form on success
      setAmount('');
      setNotes('');
      setValidationErrors([]);
    } catch (err) {
      console.error('Payout request failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estimated arrival
  const estimatedArrival = useMemo(() => calculateEstimatedArrival(), []);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <SkeletonCard variant="default" />
        <SkeletonCard variant="detailed" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Para Çekme İsteği</h2>
          <p className="mt-1 text-sm text-gray-600">
            Kazançlarınızı banka hesabınıza aktarın
          </p>
        </div>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Balance Card */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kullanılabilir Bakiye</p>
              <p className="mt-1 text-3xl font-bold text-blue-900">
                {formatCurrency(availableBalance, limits.currency)}
              </p>
              {pendingPayouts > 0 && (
                <div className="mt-2 flex items-center gap-1 text-sm text-yellow-700">
                  <Clock className="h-4 w-4" />
                  <span>{pendingPayouts} bekleyen çekim</span>
                </div>
              )}
            </div>
            <div className="rounded-full bg-blue-200 p-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eligibility Check */}
      <EligibilityChecker
        eligibility={eligibility}
        onCheck={onCheckEligibility}
        isLoading={isLoading}
      />

      {/* Global Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-900">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>İşlem Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Input */}
            <AmountInput
              value={amount}
              onChange={setAmount}
              availableBalance={availableBalance}
              limits={limits}
              disabled={isSubmitting || !eligibility?.canRequestPayout}
              errors={validationErrors}
            />

            {/* Payment Method */}
            <PaymentMethodSelector
              selectedMethod={method}
              onMethodChange={setMethod}
              disabled={isSubmitting || !eligibility?.canRequestPayout}
            />

            {/* Bank Account (only for BANK_TRANSFER) */}
            {method === PayoutMethod.BANK_TRANSFER && (
              <BankAccountSelector
                accounts={bankAccounts}
                selectedAccountId={bankAccountId}
                onAccountChange={setBankAccountId}
                onAddNew={() => {
                  // Navigate to add bank account page with return URL
                  const returnUrl = encodeURIComponent(
                    window.location.pathname
                  );
                  router.push(
                    `/dashboard/wallet/bank-accounts/add?returnUrl=${returnUrl}`
                  );
                }}
                disabled={isSubmitting || !eligibility?.canRequestPayout}
                errors={validationErrors}
              />
            )}

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Not (Opsiyonel)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="İşlemle ilgili notlarınız..."
                rows={3}
                maxLength={500}
                disabled={isSubmitting || !eligibility?.canRequestPayout}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
              <p className="text-xs text-gray-500">
                {notes.length}/500 karakter
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Tahmini Varış
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    {formatDate(estimatedArrival.toISOString(), 'FULL')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Güvenli İşlem
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    256-bit SSL şifreleme ile korunur
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={
            isSubmitting ||
            !amount ||
            !eligibility?.canRequestPayout ||
            (method === PayoutMethod.BANK_TRANSFER && !bankAccountId)
          }
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              İşleniyor...
            </>
          ) : (
            <>
              <DollarSign className="mr-2 h-5 w-5" />
              Para Çekme İsteği Gönder
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

export default PayoutRequest;
