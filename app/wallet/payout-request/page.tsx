/**
 * ================================================
 * PAYOUT REQUEST PAGE
 * ================================================
 * Comprehensive payout request page with form and history
 *
 * Route: /wallet/payout-request
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 1: Wallet & Payment Flow
 */

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/UnifiedButton';
import { PayoutRequest } from '@/components/wallet/PayoutRequest';
import { PayoutHistory } from '@/components/wallet/PayoutHistory';
import { useBalance, useWalletActions } from '@/stores/walletStore';
import { useEffect, useState } from 'react';
import type {
  PayoutRequest as PayoutRequestData,
  Payout,
  PayoutEligibility,
  PayoutLimits,
} from '@/types/business/features/wallet';

/**
 * Payout Request Page Component
 */
export default function PayoutRequestPage() {
  const router = useRouter();
  const balance = useBalance();
  const { fetchBalance } = useWalletActions();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [eligibility, setEligibility] = useState<
    PayoutEligibility | undefined
  >();
  const [limits] = useState<PayoutLimits>({
    minAmount: 100,
    maxAmount: 50000,
    dailyLimit: 50000,
    monthlyLimit: 200000,
    currency: 'TRY',
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await fetchBalance();
        // TODO: Fetch payouts from API
        // TODO: Fetch eligibility from API
        setPayouts([]);
      } catch (err) {
        setError('Veri yüklenirken hata oluştu');
        console.error('Fetch data error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchBalance]);

  // Check eligibility
  const handleCheckEligibility = async (): Promise<PayoutEligibility> => {
    setIsLoading(true);
    try {
      // TODO: Call API to check eligibility
      const result: PayoutEligibility = {
        canRequestPayout: true,
        reason: 'Eligible',
        availableBalance: balance?.availableBalance || 0,
        pendingPayouts: 0,
        minimumBalance: 100,
      };
      setEligibility(result);
      return result;
    } catch (err) {
      setError('Uygunluk kontrolü yapılamadı');
      console.error('Check eligibility error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Submit payout request
  const handleSubmit = async (request: PayoutRequestData) => {
    try {
      // TODO: Call API to submit payout request
      console.log('Submitting payout request:', request);

      await fetchBalance();

      // TODO: Refresh payouts list
      alert('Para çekme talebi başarıyla gönderildi!');
    } catch (err) {
      console.error('Submit payout error:', err);
      throw err;
    }
  };

  // Cancel payout
  const handleCancel = async (payoutId: string) => {
    try {
      // TODO: Call API to cancel payout
      console.log('Cancelling payout:', payoutId);

      // TODO: Refresh payouts list
      alert('Para çekme talebi iptal edildi!');
    } catch (err) {
      console.error('Cancel payout error:', err);
      throw err;
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchBalance();
    // TODO: Refresh payouts list
  };

  // Export payouts
  const handleExport = (format: 'csv' | 'excel') => {
    // TODO: Implement export functionality
    console.log('Exporting payouts as', format);
  };

  return (
    <div className="container mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/wallet')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cüzdana Dön
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Payout Request Form */}
        <div>
          <PayoutRequest
            availableBalance={balance?.availableBalance || 0}
            pendingPayouts={0}
            limits={limits}
            eligibility={eligibility}
            onSubmit={handleSubmit}
            onCheckEligibility={handleCheckEligibility}
            onRefresh={handleRefresh}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* Payout History */}
        <div className="lg:col-span-1">
          <PayoutHistory
            payouts={payouts}
            isLoading={isLoading}
            error={error}
            onCancel={handleCancel}
            onRefresh={handleRefresh}
            onExport={handleExport}
          />
        </div>
      </div>
    </div>
  );
}
