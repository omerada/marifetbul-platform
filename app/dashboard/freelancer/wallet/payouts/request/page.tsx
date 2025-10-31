/**
 * ================================================
 * PAYOUT REQUEST PAGE
 * ================================================
 * Sprint 1 - Task 1.2.2
 *
 * Create new payout request with wizard
 * Includes eligibility check and bank account validation
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { UnifiedLoading } from '@/components/ui/loading';
import { PayoutRequestWizard } from '@/components';
import { useWallet } from '@/hooks/business/wallet';
import { useBankAccounts } from '@/hooks/business/wallet/usePaymentMethods';
import { requestPayout, checkPayoutEligibility } from '@/lib/api/wallet';
import type { PayoutRequestData } from '@/components/domains/wallet/PayoutRequestWizard';
import { formatCurrency } from '@/lib/shared/formatters';

// ============================================================================
// TYPES
// ============================================================================

interface PayoutEligibility {
  eligible: boolean;
  minAmount: number;
  maxAmount: number;
  availableBalance: number;
  reason?: string;
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function PayoutRequestPage() {
  // ==================== HOOKS ====================

  const router = useRouter();
  const { balance, isLoadingBalance } = useWallet();
  const { bankAccounts, isLoading: isLoadingBankAccounts } = useBankAccounts();

  // ==================== STATE ====================

  const [eligibility, setEligibility] = useState<PayoutEligibility | null>(
    null
  );
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // ==================== EFFECTS ====================

  useEffect(() => {
    checkEligibility();
  }, []);

  // ==================== HANDLERS ====================

  const checkEligibility = async () => {
    try {
      setIsCheckingEligibility(true);
      setError('');

      const result = await checkPayoutEligibility();

      setEligibility({
        eligible: result.eligible,
        minAmount: result.minimumAmount,
        maxAmount: result.maximumAmount,
        availableBalance: result.availableBalance,
        reason: result.reason,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Uygunluk kontrolü yapılamadı'
      );
      setEligibility(null);
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  const handleSubmit = async (data: PayoutRequestData) => {
    try {
      await requestPayout({
        amount: data.amount,
        method: 'BANK_TRANSFER',
        bankAccountInfo: data.bankAccountId, // Use bankAccountInfo field
      });

      setSuccess(true);

      // Redirect to payout history after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/freelancer/wallet/payouts');
      }, 2000);
    } catch (err) {
      throw err; // Let wizard handle the error
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/freelancer/wallet');
  };

  // ==================== LOADING STATE ====================

  if (isCheckingEligibility || isLoadingBalance || isLoadingBankAccounts) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <Link
            href="/dashboard/freelancer/wallet"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Cüzdana Dön
          </Link>
        </div>

        <div className="flex min-h-[400px] items-center justify-center">
          <UnifiedLoading size="lg" text="Kontroller yapılıyor..." />
        </div>
      </div>
    );
  }

  // ==================== SUCCESS STATE ====================

  if (success) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Talep Başarıyla Oluşturuldu!
            </h2>
            <p className="mb-6 text-center text-gray-600">
              Para çekme talebiniz alındı. İnceleme sonrası 1-3 iş günü içinde
              hesabınıza aktarılacaktır.
            </p>
            <p className="text-sm text-gray-500">Yönlendiriliyorsunuz...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== ERROR STATE ====================

  if (error && !eligibility) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <Link
            href="/dashboard/freelancer/wallet"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Cüzdana Dön
          </Link>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // ==================== NOT ELIGIBLE STATE ====================

  if (eligibility && !eligibility.eligible) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <Link
            href="/dashboard/freelancer/wallet"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Cüzdana Dön
          </Link>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="mx-auto max-w-md text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                Para Çekme Yapılamıyor
              </h2>
              <p className="mb-6 text-gray-600">
                {eligibility.reason ||
                  'Şu anda para çekme işlemi yapamazsınız.'}
              </p>

              {eligibility.availableBalance > 0 && (
                <div className="mb-6 rounded-lg bg-gray-50 p-4">
                  <div className="mb-2 text-sm text-gray-600">
                    Kullanılabilir Bakiye
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(eligibility.availableBalance, 'TRY')}
                  </div>
                  {eligibility.minAmount && (
                    <div className="mt-2 text-sm text-gray-600">
                      Minimum çekim:{' '}
                      {formatCurrency(eligibility.minAmount, 'TRY')}
                    </div>
                  )}
                </div>
              )}

              <Link
                href="/dashboard/freelancer/wallet"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
              >
                Cüzdana Dön
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== NO BANK ACCOUNTS STATE ====================

  if (bankAccounts.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <Link
            href="/dashboard/freelancer/wallet"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Cüzdana Dön
          </Link>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="mx-auto max-w-md text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <AlertCircle className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                Banka Hesabı Gerekli
              </h2>
              <p className="mb-6 text-gray-600">
                Para çekebilmek için önce bir banka hesabı eklemeniz
                gerekmektedir.
              </p>

              <Link
                href="/dashboard/freelancer/wallet/bank-accounts"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
              >
                Banka Hesabı Ekle
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== MAIN WIZARD STATE ====================

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/freelancer/wallet"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Cüzdana Dön
        </Link>
      </div>

      {/* Info Alert */}
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Para çekme talebiniz 1-3 iş günü içinde incelenip onaylandıktan sonra
          hesabınıza aktarılacaktır.
        </AlertDescription>
      </Alert>

      {/* Wizard */}
      <PayoutRequestWizard
        availableBalance={
          eligibility?.availableBalance || balance?.availableBalance || 0
        }
        bankAccounts={bankAccounts.map((ba) => ({
          id: ba.id,
          bankName: ba.bankName || 'Bilinmeyen Banka',
          accountHolderName: ba.nickname || ba.bankName || 'Hesap Sahibi',
          iban: ba.maskedIdentifier,
          accountNumber: ba.accountLastFour,
        }))}
        minAmount={eligibility?.minAmount || 100}
        maxAmount={eligibility?.maxAmount}
        feePercentage={0}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
