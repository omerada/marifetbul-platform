/**
 * ================================================
 * PAYOUT REQUEST WIZARD - Multi-step Payout Form
 * ================================================
 * Sprint 1 - Task 1.2
 *
 * Multi-step wizard for requesting payouts
 * Includes amount selection, bank account, and confirmation
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState } from 'react';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { formatCurrency } from '@/lib/shared/formatters';

// Simplified BankAccount type (matches PaymentMethod from API)
interface BankAccount {
  id: string;
  bankName: string;
  accountHolderName: string;
  iban?: string;
  accountNumber?: string;
}

// ============================================================================
// TYPES
// ============================================================================

export interface PayoutRequestWizardProps {
  /**
   * Available balance for payout
   */
  availableBalance: number;

  /**
   * User's bank accounts
   */
  bankAccounts: BankAccount[];

  /**
   * Minimum payout amount
   * @default 100
   */
  minAmount?: number;

  /**
   * Maximum payout amount (or available balance)
   */
  maxAmount?: number;

  /**
   * Platform fee percentage
   * @default 0
   */
  feePercentage?: number;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Callback when payout is requested
   */
  onSubmit: (data: PayoutRequestData) => Promise<void>;

  /**
   * Callback when wizard is cancelled
   */
  onCancel?: () => void;

  /**
   * Custom className
   */
  className?: string;
}

export interface PayoutRequestData {
  amount: number;
  bankAccountId: string;
  note?: string;
}

type WizardStep = 'amount' | 'bank-account' | 'confirmation';

// ============================================================================
// COMPONENTS
// ============================================================================

function StepIndicator({
  steps,
  currentStep,
}: {
  steps: Array<{ id: WizardStep; label: string }>;
  currentStep: WizardStep;
}) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = index < currentIndex;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isCompleted
                      ? 'border-green-500 bg-green-500 text-white'
                      : isActive
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 transition-colors ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PayoutRequestWizard({
  availableBalance,
  bankAccounts,
  minAmount = 100,
  maxAmount,
  feePercentage = 0,
  isLoading = false,
  onSubmit,
  onCancel,
  className = '',
}: PayoutRequestWizardProps) {
  // ==================== STATE ====================

  const [currentStep, setCurrentStep] = useState<WizardStep>('amount');
  const [amount, setAmount] = useState<string>('');
  const [selectedBankAccountId, setSelectedBankAccountId] =
    useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==================== COMPUTED ====================

  const actualMaxAmount = maxAmount || availableBalance;
  const numericAmount = parseFloat(amount) || 0;
  const fee = (numericAmount * feePercentage) / 100;
  const netAmount = numericAmount - fee;

  const selectedBankAccount = bankAccounts.find(
    (ba) => ba.id === selectedBankAccountId
  );

  const steps = [
    { id: 'amount' as WizardStep, label: 'Tutar' },
    { id: 'bank-account' as WizardStep, label: 'Banka Hesabı' },
    { id: 'confirmation' as WizardStep, label: 'Onay' },
  ];

  // ==================== VALIDATION ====================

  const validateAmount = (): boolean => {
    setError('');

    if (!numericAmount || numericAmount <= 0) {
      setError('Geçerli bir tutar girin');
      return false;
    }

    if (numericAmount < minAmount) {
      setError(`Minimum çekim tutarı ${formatCurrency(minAmount, 'TRY')}`);
      return false;
    }

    if (numericAmount > actualMaxAmount) {
      setError(
        `Maksimum çekim tutarı ${formatCurrency(actualMaxAmount, 'TRY')}`
      );
      return false;
    }

    return true;
  };

  const validateBankAccount = (): boolean => {
    setError('');

    if (!selectedBankAccountId) {
      setError('Bir banka hesabı seçin');
      return false;
    }

    return true;
  };

  // ==================== HANDLERS ====================

  const handleNext = () => {
    if (currentStep === 'amount') {
      if (!validateAmount()) return;
      setCurrentStep('bank-account');
    } else if (currentStep === 'bank-account') {
      if (!validateBankAccount()) return;
      setCurrentStep('confirmation');
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep === 'bank-account') {
      setCurrentStep('amount');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('bank-account');
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      await onSubmit({
        amount: numericAmount,
        bankAccountId: selectedBankAccountId,
        note: note || undefined,
      });

      // Success handled by parent
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Para çekme talebi oluşturulamadı'
      );
      setIsSubmitting(false);
    }
  };

  const handleQuickAmount = (percentage: number) => {
    const quickAmount = (availableBalance * percentage) / 100;
    setAmount(quickAmount.toFixed(2));
  };

  // ==================== RENDER ====================

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Para Çekme Talebi</CardTitle>
        <p className="text-sm text-gray-600">
          Cüzdanınızdan banka hesabınıza para transferi
        </p>
      </CardHeader>

      <CardContent>
        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Amount */}
        {currentStep === 'amount' && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="amount">Çekilecek Tutar</Label>
              <div className="relative mt-2">
                <Input
                  id="amount"
                  type="number"
                  min={minAmount}
                  max={actualMaxAmount}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`${minAmount} - ${actualMaxAmount} TL`}
                  className="pr-12 text-lg"
                />
                <span className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500">
                  TL
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Kullanılabilir Bakiye:{' '}
                <strong>{formatCurrency(availableBalance, 'TRY')}</strong>
              </p>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((percentage) => (
                <Button
                  key={percentage}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(percentage)}
                >
                  %{percentage}
                </Button>
              ))}
            </div>

            {/* Fee Info */}
            {feePercentage > 0 && numericAmount > 0 && (
              <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">İşlem Bedeli:</span>
                  <span className="font-medium">
                    {formatCurrency(numericAmount, 'TRY')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    İşlem Ücreti ({feePercentage}%):
                  </span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(fee, 'TRY')}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Net Tutar:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(netAmount, 'TRY')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Bank Account */}
        {currentStep === 'bank-account' && (
          <div className="space-y-6">
            <div>
              <Label>Banka Hesabı Seçin</Label>
              {bankAccounts.length === 0 ? (
                <Alert className="mt-2">
                  <Building2 className="h-4 w-4" />
                  <AlertDescription>
                    Henüz banka hesabı eklemediniz. Lütfen önce bir banka hesabı
                    ekleyin.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="mt-3 space-y-3">
                  {bankAccounts.map((account) => (
                    <label
                      key={account.id}
                      className={`relative flex cursor-pointer items-start space-x-3 rounded-lg border-2 p-4 transition-colors ${
                        selectedBankAccountId === account.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bankAccount"
                        value={account.id}
                        checked={selectedBankAccountId === account.id}
                        onChange={(e) =>
                          setSelectedBankAccountId(e.target.value)
                        }
                        className="mt-1 h-4 w-4 text-blue-600"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">{account.bankName}</div>
                        <div className="text-sm text-gray-600">
                          {account.accountHolderName}
                        </div>
                        <div className="font-mono text-sm text-gray-500">
                          {account.iban ||
                            `**** **** ${account.accountNumber?.slice(-4)}`}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="note">Not (İsteğe Bağlı)</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Para çekme için bir not ekleyin..."
                maxLength={200}
                className="mt-2"
              />
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 'confirmation' && (
          <div className="space-y-6">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-blue-900">
                Talep Özeti
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Çekilecek Tutar:</span>
                  <span className="text-xl font-bold">
                    {formatCurrency(numericAmount, 'TRY')}
                  </span>
                </div>

                {feePercentage > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">İşlem Ücreti:</span>
                      <span className="text-red-600">
                        -{formatCurrency(fee, 'TRY')}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-2">
                      <span className="font-semibold text-gray-700">
                        Net Tutar:
                      </span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(netAmount, 'TRY')}
                      </span>
                    </div>
                  </>
                )}

                <div className="mt-4 border-t border-blue-200 pt-4">
                  <p className="mb-1 text-sm text-gray-700">Hedef Hesap:</p>
                  <div className="rounded-lg bg-white p-3">
                    <p className="font-medium">
                      {selectedBankAccount?.bankName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedBankAccount?.accountHolderName}
                    </p>
                    <p className="font-mono text-sm text-gray-500">
                      {selectedBankAccount?.iban ||
                        selectedBankAccount?.accountNumber}
                    </p>
                  </div>
                </div>

                {note && (
                  <div className="mt-4">
                    <p className="mb-1 text-sm text-gray-700">Not:</p>
                    <p className="text-sm text-gray-600 italic">{note}</p>
                  </div>
                )}
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Para çekme talebiniz incelendikten sonra 1-3 iş günü içinde
                hesabınıza aktarılacaktır.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 'amount' ? onCancel : handleBack}
            disabled={isSubmitting || isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentStep === 'amount' ? 'İptal' : 'Geri'}
          </Button>

          {currentStep === 'confirmation' ? (
            <Button onClick={handleSubmit} disabled={isSubmitting || isLoading}>
              {isSubmitting ? 'Gönderiliyor...' : 'Talebi Onayla'}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={isLoading}>
              İleri
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PayoutRequestWizard;
