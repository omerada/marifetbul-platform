/**
 * ================================================
 * PAYOUT REQUEST FORM
 * ================================================
 * Form for requesting payouts
 *
 * Features:
 * - Amount input with validation
 * - Bank account selection
 * - Fee calculation preview
 * - Available balance display
 * - Net amount calculation
 * - Form validation
 * - Loading states
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 5, 2025
 * @sprint Sprint 1 - Week 1 - Day 3-4: Payout Request Flow
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import {
  Wallet,
  Building2,
  AlertCircle,
  Info,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  getBankAccounts,
  type BankAccountResponse,
  BankAccountStatus,
} from '@/lib/api/bank-accounts';
import { requestPayout } from '@/lib/api/payouts';
import {
  payoutService,
  PAYOUT_CONFIG,
  type PayoutFeeCalculation,
} from '@/lib/services/payout-service';
import { logger } from '@/lib/shared/utils/logger';

// ================================================
// TYPES
// ================================================

export interface PayoutRequestFormProps {
  availableBalance: number;
  onSuccess?: (payoutId: string) => void;
  onCancel?: () => void;
  className?: string;
}

// ================================================
// COMPONENT
// ================================================

export const PayoutRequestForm: React.FC<PayoutRequestFormProps> = ({
  availableBalance,
  onSuccess,
  onCancel,
  className = '',
}) => {
  // Form state
  const [amount, setAmount] = useState<string>('');
  const [bankAccountId, setBankAccountId] = useState<string>('');
  const [description, setDescription] = useState('');

  // Data state
  const [bankAccounts, setBankAccounts] = useState<BankAccountResponse[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ==================== EFFECTS ====================

  useEffect(() => {
    loadBankAccounts();
  }, []);

  // Auto-select default bank account
  useEffect(() => {
    if (bankAccounts.length > 0 && !bankAccountId) {
      const defaultAccount = bankAccounts.find((a) => a.isDefault);
      if (defaultAccount) {
        setBankAccountId(defaultAccount.id);
      }
    }
  }, [bankAccounts, bankAccountId]);

  // ==================== DATA LOADING ====================

  const loadBankAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const accounts = await getBankAccounts();
      const verifiedAccounts = accounts.filter(
        (a) => a.status === BankAccountStatus.VERIFIED
      );
      setBankAccounts(verifiedAccounts);
    } catch (error) {
      logger.error('Failed to load bank accounts', error as Error);
      toast.error('Hata', {
        description: 'Banka hesapları yüklenirken bir hata oluştu',
      });
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  // ==================== CALCULATIONS ====================

  const numericAmount = useMemo(() => {
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  }, [amount]);

  const feeCalculation: PayoutFeeCalculation | null = useMemo(() => {
    if (numericAmount > 0) {
      return payoutService.calculateFees(numericAmount);
    }
    return null;
  }, [numericAmount]);

  const eligibility = useMemo(() => {
    return payoutService.checkEligibility(availableBalance, bankAccounts);
  }, [availableBalance, bankAccounts]);

  const validation = useMemo(() => {
    if (numericAmount === 0 && !bankAccountId) {
      return { valid: true, errors: [], warnings: [] };
    }
    return payoutService.validatePayoutRequest(
      numericAmount,
      bankAccountId,
      availableBalance,
      bankAccounts
    );
  }, [numericAmount, bankAccountId, availableBalance, bankAccounts]);

  // ==================== HANDLERS ====================

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const sanitized = value.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      return;
    }

    setAmount(sanitized);

    // Clear amount error
    if (errors.amount) {
      setErrors((prev) => {
        const { amount: _amount, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleMaxClick = () => {
    const maxAmount = payoutService.getMaxWithdrawableAmount(availableBalance);
    setAmount(maxAmount.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!validation.valid) {
      toast.error('Form Hataları', {
        description:
          validation.errors[0] || 'Lütfen tüm alanları doğru doldurun',
      });
      return;
    }

    if (!eligibility.eligible) {
      toast.error('Ödeme Talebi Oluşturulamadı', {
        description: eligibility.reasons[0],
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await requestPayout({
        amount: numericAmount,
        bankAccountId,
        description: description.trim() || undefined,
      });

      payoutService.logPayoutAction('payout_requested', {
        payoutId: response.id,
        amount: numericAmount,
        bankAccountId,
      });

      toast.success('Ödeme Talebi Oluşturuldu', {
        description: `${payoutService.formatAmount(numericAmount)} tutarında ödeme talebiniz alındı`,
      });

      if (onSuccess) {
        onSuccess(response.id);
      }

      // Reset form
      setAmount('');
      setDescription('');
    } catch (error) {
      logger.error('Failed to request payout', error as Error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Ödeme talebi oluşturulurken bir hata oluştu';

      toast.error('Hata', { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== RENDER ====================

  // Not eligible
  if (!eligibility.eligible) {
    return (
      <Card className={`p-6 ${className}`}>
        <Alert variant="warning" className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <div className="flex-1">
            <p className="font-medium text-yellow-900">
              Ödeme Talebi Oluşturamazsınız
            </p>
            <ul className="mt-2 space-y-1 text-sm text-yellow-700">
              {eligibility.reasons.map((reason, i) => (
                <li key={i}>• {reason}</li>
              ))}
            </ul>
          </div>
        </Alert>
      </Card>
    );
  }

  // Loading bank accounts
  if (isLoadingAccounts) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          <p className="text-gray-600">Banka hesapları yükleniyor...</p>
        </div>
      </Card>
    );
  }

  const selectedAccount = bankAccounts.find((a) => a.id === bankAccountId);

  return (
    <Card className={`p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Wallet className="h-6 w-6 text-purple-600" />
            Para Çekme Talebi
          </h2>
          <p className="text-gray-600">Kazancınızı banka hesabınıza çekin</p>
        </div>

        {/* Available Balance */}
        <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-900">
                Kullanılabilir Bakiye
              </p>
              <p className="mt-1 text-3xl font-bold text-purple-600">
                {payoutService.formatAmount(
                  payoutService.getMaxWithdrawableAmount(availableBalance)
                )}
              </p>
              <p className="mt-1 text-xs text-purple-700">
                Toplam: {payoutService.formatAmount(availableBalance)} (
                {payoutService.formatAmount(
                  PAYOUT_CONFIG.MINIMUM_WALLET_BALANCE
                )}{' '}
                rezerv)
              </p>
            </div>
            <div className="rounded-full bg-purple-600 p-3">
              <Wallet className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <Label htmlFor="amount">
            Çekmek İstediğiniz Tutar
            <span className="text-red-600">*</span>
          </Label>
          <div className="relative mt-2">
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              disabled={isSubmitting}
              className={`pr-24 text-right text-lg font-semibold ${
                errors.amount || validation.errors.length > 0
                  ? 'border-red-500'
                  : ''
              }`}
            />
            <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2">
              <span className="text-sm font-medium text-gray-500">TRY</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleMaxClick}
                disabled={isSubmitting}
                className="h-6 px-2 text-xs"
              >
                MAX
              </Button>
            </div>
          </div>

          {/* Amount limits */}
          <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
            <span>
              Min: {payoutService.formatAmount(PAYOUT_CONFIG.MINIMUM_AMOUNT)}
            </span>
            <span>
              Max:{' '}
              {payoutService.formatAmount(
                payoutService.getMaxWithdrawableAmount(availableBalance)
              )}
            </span>
          </div>

          {validation.errors.length > 0 && (
            <p className="mt-1 text-sm text-red-600">{validation.errors[0]}</p>
          )}
        </div>

        {/* Bank Account Selection */}
        <div>
          <Label htmlFor="bankAccount">
            Banka Hesabı Seçin
            <span className="text-red-600">*</span>
          </Label>
          <Select value={bankAccountId} onValueChange={setBankAccountId}>
            <SelectTrigger
              className="mt-2"
              placeholder="Banka hesabı seçin..."
            />
            <SelectContent>
              {bankAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{account.bankName}</span>
                    <span className="font-mono text-sm text-gray-600">
                      {account.maskedIban}
                    </span>
                    {account.isDefault && (
                      <Badge variant="default" className="ml-2 text-xs">
                        Varsayılan
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedAccount && (
            <div className="mt-2 rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-gray-700">
                  <span className="font-medium">
                    {selectedAccount.bankName}
                  </span>{' '}
                  - {selectedAccount.accountHolder}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Description (Optional) */}
        <div>
          <Label htmlFor="description">Açıklama (İsteğe Bağlı)</Label>
          <Input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Bu ödeme için bir not ekleyin"
            disabled={isSubmitting}
            maxLength={200}
          />
        </div>

        {/* Fee Calculation */}
        {feeCalculation && feeCalculation.requestedAmount > 0 && (
          <Card className="border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-blue-900">
              <Info className="h-5 w-5" />
              Ücret Hesaplaması
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Talep Edilen Tutar:</span>
                <span className="font-medium text-blue-900">
                  {payoutService.formatAmount(feeCalculation.requestedAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between text-red-700">
                <span className="flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" />
                  Platform Ücreti (%
                  {PAYOUT_CONFIG.PLATFORM_FEE_PERCENTAGE * 100}):
                </span>
                <span className="font-medium">
                  -{payoutService.formatAmount(feeCalculation.platformFee)}
                </span>
              </div>

              <div className="flex items-center justify-between text-red-700">
                <span className="flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" />
                  İşlem Ücreti:
                </span>
                <span className="font-medium">
                  -{payoutService.formatAmount(feeCalculation.processingFee)}
                </span>
              </div>

              <div className="border-t border-blue-300 pt-2">
                <div className="flex justify-between">
                  <span className="font-medium text-blue-900">
                    Toplam Ücret:
                  </span>
                  <span className="font-bold text-red-600">
                    -{payoutService.formatAmount(feeCalculation.totalFees)}
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-green-100 p-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 font-semibold text-green-900">
                    <TrendingUp className="h-5 w-5" />
                    Alacağınız Net Tutar:
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    {payoutService.formatAmount(feeCalculation.netAmount)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Processing Time Info */}
        {numericAmount > 0 && (
          <Alert
            variant="default"
            className="flex items-start gap-3 border-purple-200 bg-purple-50"
          >
            <Clock className="h-5 w-5 text-purple-600" />
            <div className="text-sm text-purple-900">
              <p className="font-medium">Tahmini İşlem Süresi</p>
              <p className="mt-1 text-purple-700">
                {payoutService.estimateProcessingTime(numericAmount)} içinde
                hesabınıza yatırılacak
              </p>
            </div>
          </Alert>
        )}

        {/* Warnings */}
        {validation.warnings.length > 0 && (
          <Alert variant="warning" className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div className="text-sm text-yellow-900">
              <ul className="space-y-1">
                {validation.warnings.map((warning, i) => (
                  <li key={i}>• {warning}</li>
                ))}
              </ul>
            </div>
          </Alert>
        )}

        {/* Form Actions */}
        <div className="flex gap-3 border-t border-gray-200 pt-6">
          <Button
            type="submit"
            variant="primary"
            disabled={!validation.valid || isSubmitting || numericAmount === 0}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                İşleniyor...
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                Ödeme Talebi Oluştur
              </>
            )}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              İptal
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default PayoutRequestForm;
