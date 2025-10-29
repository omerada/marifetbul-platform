/**
 * ================================================
 * WALLET BALANCE CARD - Balance Display Component
 * ================================================
 * Displays current balance, pending balance, and available for payout
 * with tooltips and loading states
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState } from 'react';
import { useBalance } from '@/hooks/business/wallet';
import { RefreshCw, Wallet, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip';
import { PayoutRequestModal } from './PayoutRequestModal';

// ================================================
// TYPES
// ================================================

export interface WalletBalanceCardProps {
  /**
   * Whether to show the refresh button
   * @default true
   */
  showRefresh?: boolean;

  /**
   * Auto-refresh interval in milliseconds
   * @default undefined (no auto-refresh)
   */
  refreshInterval?: number;

  /**
   * Callback when refresh is clicked
   */
  onRefresh?: () => void;

  /**
   * Custom className for styling
   */
  className?: string;
}

// ================================================
// COMPONENT
// ================================================

export const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  showRefresh = true,
  refreshInterval,
  onRefresh,
  className = '',
}) => {
  // ==================== STATE ====================

  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  // ==================== HOOKS ====================

  const {
    balance,
    formattedAvailableBalance,
    formattedPendingBalance,
    formattedTotalBalance,
    formattedTotalEarnings,
    formattedPendingPayouts,
    isLoading,
    error,
    refresh,
  } = useBalance(true, refreshInterval);

  // ==================== HANDLERS ====================

  const handleRefresh = async () => {
    await refresh();
    onRefresh?.();
  };

  // ==================== RENDER ====================

  if (error) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p className="text-sm font-medium">Bakiye yüklenemedi</p>
            <p className="mt-1 text-xs text-red-500">{error}</p>
            {showRefresh && (
              <button
                onClick={handleRefresh}
                className="mt-3 inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm transition-colors hover:bg-gray-50"
              >
                <RefreshCw className="h-3 w-3" />
                Tekrar Dene
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading && !balance) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Wallet className="text-primary h-5 w-5" />
          Cüzdan Bakiyesi
        </CardTitle>
        {showRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 transition-colors hover:bg-gray-100 disabled:opacity-50"
            aria-label="Yenile"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Balance */}
        <div className="from-primary/10 to-primary/5 rounded-lg bg-gradient-to-br p-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <p className="text-muted-foreground mb-1 text-sm font-medium">
                    Kullanılabilir Bakiye
                  </p>
                  <p className="text-primary text-4xl font-bold">
                    {formattedAvailableBalance}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">
                  Para çekme talebinde bulunabileceğiniz miktar. Beklemedeki
                  ödemeler dahil değildir.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Balance Details Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Pending Balance */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help rounded-lg border border-amber-100 bg-amber-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-amber-700">
                    <Clock className="h-4 w-4" />
                    <p className="text-xs font-medium tracking-wide uppercase">
                      Bekleyen Bakiye
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-amber-900">
                    {formattedPendingBalance}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">
                  Devam eden işlerden bekleyen ödemeler. İş tamamlandıktan ve
                  onaylandıktan sonra kullanılabilir bakiyenize eklenecektir.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Available for Payout */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help rounded-lg border border-green-100 bg-green-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-green-700">
                    <DollarSign className="h-4 w-4" />
                    <p className="text-xs font-medium tracking-wide uppercase">
                      Toplam Bakiye
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {formattedTotalBalance}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">
                  Kullanılabilir ve bekleyen bakiyenizin toplamı.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Total Earnings Summary */}
        <div className="space-y-3 border-t pt-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-help items-center justify-between">
                  <div className="text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">Toplam Kazanç</span>
                  </div>
                  <span className="text-lg font-semibold">
                    {formattedTotalEarnings}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">
                  Platformda bugüne kadar kazandığınız toplam tutar.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Pending Payouts Info */}
          {balance && balance.pendingPayouts > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex cursor-help items-center justify-between text-amber-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Bekleyen Çekim
                      </span>
                    </div>
                    <span className="text-base font-semibold">
                      {formattedPendingPayouts}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    İşlemde olan para çekme taleplerinin toplam tutarı.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Payout Button */}
        <div className="border-t pt-4">
          <button
            onClick={() => setIsPayoutModalOpen(true)}
            disabled={!balance || balance.availableBalance < 100}
            className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            {balance && balance.availableBalance < 100
              ? 'Minimum çekim tutarı: 100 TL'
              : 'Para Çek'}
          </button>
        </div>
      </CardContent>

      {/* Payout Modal */}
      {balance && (
        <PayoutRequestModal
          isOpen={isPayoutModalOpen}
          onClose={() => setIsPayoutModalOpen(false)}
          onSuccess={() => {
            refresh();
          }}
        />
      )}
    </Card>
  );
};

WalletBalanceCard.displayName = 'WalletBalanceCard';
