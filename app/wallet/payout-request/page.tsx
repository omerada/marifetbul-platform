/**
 * ================================================
 * PAYOUT REQUEST PAGE
 * ================================================
 * Standalone page for payout request with full form
 *
 * Route: /wallet/payout-request
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 14: Payment & Payout System
 */

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import { PayoutRequestForm, PayoutHistoryTable } from '@/components/wallet';
import { useBalance, useWalletActions } from '@/stores/walletStore';
import { useEffect } from 'react';

/**
 * Payout Request Page Component
 */
export default function PayoutRequestPage() {
  const router = useRouter();
  const balance = useBalance();
  const { fetchBalance } = useWalletActions();

  // Fetch balance on mount
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return (
    <div className="container mx-auto max-w-5xl p-6">
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

        <h1 className="text-3xl font-bold">Para Çekme</h1>
        <p className="text-muted-foreground mt-1">
          Bakiyenizi banka hesabınıza aktarın ve geçmiş işlemlerinizi
          görüntüleyin
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payout Request Form */}
        <div>
          <PayoutRequestForm
            availableBalance={balance?.availableBalance || 0}
            onSuccess={() => {
              fetchBalance();
            }}
          />
        </div>

        {/* Payout History */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Para Çekme Geçmişi</h2>
          <PayoutHistoryTable />
        </div>
      </div>
    </div>
  );
}
