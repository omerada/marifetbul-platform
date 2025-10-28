/**
 * ================================================
 * PAYOUT REQUEST PAGE
 * ================================================
 * Standalone page for payout request with full form
 *
 * Route: /wallet/payout-request
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint: Wallet & Payout Complete
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { PayoutRequestModal } from '@/components/dashboard/freelancer/wallet/PayoutRequestModal';
import { useBalance, useWalletActions } from '@/stores/walletStore';
import { toast } from 'sonner';

/**
 * Payout Request Page Component
 */
export default function PayoutRequestPage() {
  const router = useRouter();
  const balance = useBalance();
  const { fetchBalance } = useWalletActions();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch balance on mount
  useEffect(() => {
    const loadBalance = async () => {
      try {
        await fetchBalance();
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        toast.error('Bakiye bilgisi yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };

    loadBalance();
  }, [fetchBalance]);

  // Handle success
  const handleSuccess = (_payoutId: string) => {
    toast.success('Para çekme talebiniz oluşturuldu!');
    // Redirect to payouts page after a short delay
    setTimeout(() => {
      router.push('/wallet/payouts');
    }, 1500);
  };

  // Handle error
  const handleError = (error: string) => {
    toast.error(error);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-6">
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

        <h1 className="text-3xl font-bold">Para Çekme Talebi</h1>
        <p className="text-muted-foreground mt-1">
          Bakiyenizi banka hesabınıza aktarın
        </p>
      </div>

      {/* Modal as page content */}
      <PayoutRequestModal
        isOpen={true}
        onClose={() => router.push('/wallet')}
        availableBalance={balance?.availableBalance || 0}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
}
