/**
 * ================================================
 * PAYOUT REQUEST FLOW COMPONENT
 * ================================================
 * Multi-step flow for requesting payout (withdrawal)
 *
 * Features:
 * - Eligibility check
 * - Amount input with validation
 * - Bank account selection
 * - Payout method choice (Bank Transfer / Iyzico)
 * - Confirmation step
 * - Success/error handling
 * - Loading states
 *
 * Sprint 1 - Epic 1.3 - Days 6-7
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  CreditCard,
  Check,
  AlertCircle,
  Loader2,
  Info,
  ArrowRight,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { formatCurrency } from '@/lib/shared/utils/format';
import { PayoutMethod } from '@/types/business/features/wallet';

// ============================================================================
// TYPES
// ============================================================================

export interface PayoutRequestFlowProps {
  /** Whether dialog is open */
  isOpen: boolean;

  /** Callback when dialog is closed */
  onClose: () => void;

  /** Available balance */
  availableBalance: number;

  /** Payout limits */
  limits: {
    minimum: number;
    maximum: number;
  };

  /** Bank accounts (payment methods) */
  bankAccounts: BankAccount[];

  /** Callback when payout is requested */
  onSubmit: (data: PayoutRequestData) => Promise<void>;

  /** Callback to add new bank account */
  onAddBankAccount?: () => void;
}

export interface BankAccount {
  id: string;
  bankName: string;
  iban: string;
  accountHolder: string;
  isDefault: boolean;
}

export interface PayoutRequestData {
  amount: number;
  method: PayoutMethod;
  bankAccountId?: string;
  description?: string;
}

type FlowStep =
  | 'eligibility'
  | 'amount'
  | 'method'
  | 'confirm'
  | 'processing'
  | 'success'
  | 'error';

// ============================================================================
// CONSTANTS
// ============================================================================

const PAYOUT_METHODS: {
  value: PayoutMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: PayoutMethod.BANK_TRANSFER,
    label: 'Banka Transferi',
    description: '1-2 iş günü içinde banka hesabınıza',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    value: PayoutMethod.IYZICO_PAYOUT,
    label: 'Iyzico Hızlı Transfer',
    description: 'Aynı gün içinde (daha yüksek komisyon)',
    icon: <CreditCard className="h-5 w-5" />,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format IBAN for display (TR** **** **** **** **** **** **)
 */
function formatIBAN(iban: string): string {
  const cleaned = iban.replace(/\s/g, '');
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Validate amount
 */
function validateAmount(
  amount: number,
  limits: { minimum: number; maximum: number },
  availableBalance: number
): string | null {
  if (!amount || amount <= 0) {
    return 'Lütfen geçerli bir tutar girin';
  }
  if (amount < limits.minimum) {
    return `Minimum çekim tutarı: ${formatCurrency(limits.minimum)}`;
  }
  if (amount > limits.maximum) {
    return `Maximum çekim tutarı: ${formatCurrency(limits.maximum)}`;
  }
  if (amount > availableBalance) {
    return 'Yetersiz bakiye';
  }
  return null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PayoutRequestFlow({
  isOpen,
  onClose,
  availableBalance,
  limits,
  bankAccounts,
  onSubmit,
  onAddBankAccount,
}: PayoutRequestFlowProps) {
  // State
  const [step, setStep] = useState<FlowStep>('eligibility');
  const [amount, setAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<PayoutMethod>(
    PayoutMethod.BANK_TRANSFER
  );
  const [selectedBankAccountId, setSelectedBankAccountId] =
    useState<string>('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);

  // Check eligibility on open
  useEffect(() => {
    if (isOpen) {
      // Check if user is eligible
      if (availableBalance < limits.minimum) {
        setStep('eligibility');
      } else {
        setStep('amount');
      }

      // Select default bank account
      const defaultAccount = bankAccounts.find((acc) => acc.isDefault);
      if (defaultAccount) {
        setSelectedBankAccountId(defaultAccount.id);
      } else if (bankAccounts.length > 0) {
        setSelectedBankAccountId(bankAccounts[0].id);
      }
    }
  }, [isOpen, availableBalance, limits.minimum, bankAccounts]);

  // Reset state when dialog closes
  const handleClose = () => {
    setStep('eligibility');
    setAmount('');
    setSelectedMethod(PayoutMethod.BANK_TRANSFER);
    setDescription('');
    setError(null);
    setAmountError(null);
    onClose();
  };

  // Validate amount on change
  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numAmount = parseFloat(value);
    if (!isNaN(numAmount)) {
      const validationError = validateAmount(
        numAmount,
        limits,
        availableBalance
      );
      setAmountError(validationError);
    }
  };

  // Handle amount step
  const handleAmountNext = () => {
    const numAmount = parseFloat(amount);
    const validationError = validateAmount(numAmount, limits, availableBalance);

    if (validationError) {
      setAmountError(validationError);
      return;
    }

    setStep('method');
  };

  // Handle method step
  const handleMethodNext = () => {
    if (selectedMethod === 'BANK_TRANSFER' && !selectedBankAccountId) {
      setError('Lütfen bir banka hesabı seçin');
      return;
    }

    setStep('confirm');
  };

  // Handle confirmation
  const handleConfirm = async () => {
    try {
      setStep('processing');
      setError(null);

      const data: PayoutRequestData = {
        amount: parseFloat(amount),
        method: selectedMethod,
        bankAccountId:
          selectedMethod === 'BANK_TRANSFER'
            ? selectedBankAccountId
            : undefined,
        description: description.trim() || undefined,
      };

      await onSubmit(data);

      setStep('success');

      // Auto-close after 3 seconds
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ödeme talebi oluşturulurken bir hata oluştu'
      );
      setStep('error');
    }
  };

  // Get selected bank account
  const selectedBankAccount = bankAccounts.find(
    (acc) => acc.id === selectedBankAccountId
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl">
        {/* Eligibility Check */}
        {step === 'eligibility' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Çekim Yapılamıyor
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/20">
                <p className="mb-3 text-sm text-orange-900 dark:text-orange-100">
                  Çekim yapabilmek için minimum bakiye gereksinimi
                  karşılanmalıdır.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-orange-700 dark:text-orange-300">
                      Mevcut Bakiye:
                    </span>
                    <span className="font-medium text-orange-900 dark:text-orange-100">
                      {formatCurrency(availableBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700 dark:text-orange-300">
                      Minimum Çekim:
                    </span>
                    <span className="font-medium text-orange-900 dark:text-orange-100">
                      {formatCurrency(limits.minimum)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700 dark:text-orange-300">
                      Yetersiz Tutar:
                    </span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      {formatCurrency(limits.minimum - availableBalance)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                <div className="flex gap-3">
                  <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="mb-2">
                      <strong>Bakiye nasıl artırılır?</strong>
                    </p>
                    <ul className="ml-2 list-inside list-disc space-y-1">
                      <li>Sipariş tamamlayın ve onay alın</li>
                      <li>Emanetteki ödemeleri serbest bıraktırın</li>
                      <li>Daha fazla hizmet satın</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Kapat
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Amount Step */}
        {step === 'amount' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Çekim Tutarı
              </DialogTitle>
              <DialogDescription>
                Çekmek istediğiniz tutarı girin
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Balance Info */}
              <div className="bg-muted rounded-lg p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Kullanılabilir Bakiye
                  </span>
                  <span className="text-2xl font-bold">
                    {formatCurrency(availableBalance)}
                  </span>
                </div>
                <div className="text-muted-foreground text-xs">
                  Minimum: {formatCurrency(limits.minimum)} • Maximum:{' '}
                  {formatCurrency(limits.maximum)}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <Label
                  htmlFor="payout-amount"
                  className="mb-3 block text-base font-semibold"
                >
                  Çekim Tutarı <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                    ₺
                  </span>
                  <Input
                    id="payout-amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className={`pl-8 text-lg ${amountError ? 'border-red-500' : ''}`}
                    min={limits.minimum}
                    max={Math.min(limits.maximum, availableBalance)}
                    step="0.01"
                    autoFocus
                  />
                </div>
                {amountError && (
                  <p className="mt-2 text-sm text-red-600">{amountError}</p>
                )}
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <Label className="mb-2 block text-sm">Hızlı Seçim</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '₺100', value: 100 },
                    { label: '₺250', value: 250 },
                    { label: '₺500', value: 500 },
                    { label: 'Tümü', value: availableBalance },
                  ].map((option) => (
                    <Button
                      key={option.label}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleAmountChange(option.value.toString())
                      }
                      disabled={
                        option.value > availableBalance ||
                        option.value < limits.minimum
                      }
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                İptal
              </Button>
              <Button
                onClick={handleAmountNext}
                disabled={!!amountError || !amount}
              >
                Devam Et
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Method Selection Step */}
        {step === 'method' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Çekim Yöntemi
              </DialogTitle>
              <DialogDescription>
                Ödeme yönteminizi ve banka hesabınızı seçin
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Method Selection */}
              <div>
                <Label className="mb-3 block text-base font-semibold">
                  Çekim Yöntemi <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-3">
                  {PAYOUT_METHODS.map((method) => (
                    <label
                      key={method.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all ${
                        selectedMethod === method.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payoutMethod"
                        value={method.value}
                        checked={selectedMethod === method.value}
                        onChange={(e) =>
                          setSelectedMethod(e.target.value as PayoutMethod)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          {method.icon}
                          <span className="font-medium">{method.label}</span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {method.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bank Account Selection (only for BANK_TRANSFER) */}
              {selectedMethod === PayoutMethod.BANK_TRANSFER && (
                <div>
                  <Label className="mb-3 block text-base font-semibold">
                    Banka Hesabı <span className="text-red-500">*</span>
                  </Label>
                  {bankAccounts.length === 0 ? (
                    <div className="border-border rounded-lg border-2 border-dashed py-8 text-center">
                      <Building2 className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
                      <p className="text-muted-foreground mb-4 text-sm">
                        Henüz banka hesabı eklenmemiş
                      </p>
                      <Button onClick={onAddBankAccount} size="sm">
                        Banka Hesabı Ekle
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {bankAccounts.map((account) => (
                        <label
                          key={account.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all ${
                            selectedBankAccountId === account.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
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
                            className="mt-1"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="font-medium">
                                {account.bankName}
                              </span>
                              {account.isDefault && (
                                <span className="bg-primary/10 text-primary rounded px-2 py-0.5 text-xs">
                                  Varsayılan
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm">
                              {formatIBAN(account.iban)}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {account.accountHolder}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Description (optional) */}
              <div>
                <Label
                  htmlFor="payout-description"
                  className="mb-2 block text-sm"
                >
                  Açıklama (İsteğe Bağlı)
                </Label>
                <Input
                  id="payout-description"
                  placeholder="Örn: Ağustos ayı kazançları"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('amount')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri
              </Button>
              <Button
                onClick={handleMethodNext}
                disabled={
                  selectedMethod === 'BANK_TRANSFER' && !selectedBankAccountId
                }
              >
                Devam Et
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Confirmation Step */}
        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle>Çekim Talebi Onayı</DialogTitle>
              <DialogDescription>
                Lütfen çekim bilgilerinizi kontrol edin
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Amount */}
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-950/20">
                <div className="mb-1 text-sm text-green-700 dark:text-green-300">
                  Çekim Tutarı
                </div>
                <div className="text-4xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(parseFloat(amount))}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div className="border-border flex justify-between border-b py-2">
                  <span className="text-muted-foreground">Yöntem:</span>
                  <span className="font-medium">
                    {
                      PAYOUT_METHODS.find((m) => m.value === selectedMethod)
                        ?.label
                    }
                  </span>
                </div>

                {selectedMethod === 'BANK_TRANSFER' && selectedBankAccount && (
                  <>
                    <div className="border-border flex justify-between border-b py-2">
                      <span className="text-muted-foreground">Banka:</span>
                      <span className="font-medium">
                        {selectedBankAccount.bankName}
                      </span>
                    </div>
                    <div className="border-border flex justify-between border-b py-2">
                      <span className="text-muted-foreground">IBAN:</span>
                      <span className="font-mono text-xs">
                        {formatIBAN(selectedBankAccount.iban)}
                      </span>
                    </div>
                    <div className="border-border flex justify-between border-b py-2">
                      <span className="text-muted-foreground">
                        Hesap Sahibi:
                      </span>
                      <span className="font-medium">
                        {selectedBankAccount.accountHolder}
                      </span>
                    </div>
                  </>
                )}

                {description && (
                  <div className="border-border flex justify-between border-b py-2">
                    <span className="text-muted-foreground">Açıklama:</span>
                    <span className="font-medium">{description}</span>
                  </div>
                )}

                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Tahmini Süre:</span>
                  <span className="font-medium">
                    {selectedMethod === 'BANK_TRANSFER'
                      ? '1-2 iş günü'
                      : 'Aynı gün'}
                  </span>
                </div>
              </div>

              {/* Warning */}
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/20">
                <div className="flex gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-xs text-yellow-900 dark:text-yellow-100">
                    Çekim talebi onaylandıktan sonra iptal edilemez. Tutar,
                    belirtilen banka hesabına gönderilecektir.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('method')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri
              </Button>
              <Button
                onClick={handleConfirm}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" />
                Çekimi Onayla
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="py-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="text-primary h-12 w-12 animate-spin" />
              <div className="text-center">
                <h3 className="mb-1 font-semibold">İşleniyor...</h3>
                <p className="text-muted-foreground text-sm">
                  Çekim talebiniz oluşturuluyor, lütfen bekleyin.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex flex-col items-center justify-center gap-4"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/20">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center">
                <h3 className="mb-2 text-xl font-semibold">
                  Çekim Talebi Oluşturuldu!
                </h3>
                <p className="text-muted-foreground mb-1 text-sm">
                  {formatCurrency(parseFloat(amount))} tutarındaki çekim
                  talebiniz alınmıştır.
                </p>
                <p className="text-muted-foreground text-xs">
                  Çekim geçmişinizden durumu takip edebilirsiniz.
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Error Step */}
        {step === 'error' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Hata Oluştu
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
                <p className="text-sm text-red-900 dark:text-red-100">
                  {error || 'Bilinmeyen bir hata oluştu'}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Kapat
              </Button>
              <Button onClick={() => setStep('confirm')}>Tekrar Dene</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PayoutRequestFlow;
