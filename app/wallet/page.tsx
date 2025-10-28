/**
 * ================================================
 * WALLET OVERVIEW PAGE
 * ================================================
 * Main wallet page showing balance, transactions, and payout options
 *
 * Features:
 * - Wallet balance card with available/pending/total earned
 * - Quick stats grid
 * - Recent transactions (last 5)
 * - Payout request button
 * - Navigation to detailed pages
 *
 * Route: /wallet
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useWallet,
  useBalance,
  useTransactions,
  useWalletActions,
  useWalletUI,
} from '@/stores/walletStore';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';
import {
  Loader2,
  Wallet as WalletIcon,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { formatCurrency } from '@/lib/shared/utils/format';

/**
 * Wallet Overview Page Component
 */
export default function WalletPage() {
  const router = useRouter();
  const wallet = useWallet();
  const balance = useBalance();
  const transactions = useTransactions();
  const { fetchWallet } = useWalletActions();
  const { isLoadingWallet, error } = useWalletUI();

  // Fetch wallet data on mount
  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  // Loading state
  if (isLoadingWallet && !wallet) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-red-900">
            Cüzdan Yüklenemedi
          </h3>
          <p className="text-red-700">{error}</p>
          <Button
            onClick={() => fetchWallet()}
            className="mt-4"
            variant="outline"
          >
            Tekrar Dene
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <WalletIcon className="text-primary h-8 w-8" />
            Cüzdanım
          </h1>
          <p className="text-muted-foreground mt-1">
            Bakiyenizi ve işlemlerinizi yönetin
          </p>
        </div>
        <Button
          onClick={() => router.push('/wallet/payout-request')}
          className="w-full sm:w-auto"
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Para Çek
        </Button>
      </div>

      {/* Balance Card */}
      <Card className="from-primary/5 via-primary/10 to-primary/5 bg-gradient-to-br p-6">
        <div className="mb-6 flex items-start justify-between">
          <h2 className="text-xl font-semibold">Cüzdan Bakiyesi</h2>
          <div className="text-muted-foreground text-xs">
            Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Available Balance */}
          <div className="space-y-2">
            <p className="text-muted-foreground flex items-center gap-1 text-sm">
              <WalletIcon className="h-3 w-3" />
              Kullanılabilir Bakiye
            </p>
            <p className="text-primary text-4xl font-bold">
              {formatCurrency(balance?.availableBalance || 0)}
            </p>
            <p className="text-muted-foreground text-xs">
              Çekebileceğiniz tutar
            </p>
          </div>

          {/* Pending Balance */}
          <div className="space-y-2">
            <p className="text-muted-foreground flex items-center gap-1 text-sm">
              <Loader2 className="h-3 w-3" />
              Bekleyen Bakiye
            </p>
            <p className="text-3xl font-semibold text-yellow-600">
              {formatCurrency(balance?.pendingBalance || 0)}
            </p>
            <p className="text-muted-foreground text-xs">
              Emanette tutulan tutar
            </p>
          </div>

          {/* Total Earned */}
          <div className="space-y-2">
            <p className="text-muted-foreground flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3" />
              Toplam Kazanç
            </p>
            <p className="text-3xl font-semibold text-green-600">
              {formatCurrency(balance?.totalEarnings || 0)}
            </p>
            <p className="text-muted-foreground text-xs">
              Tüm zamanlar toplamı
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Toplam İşlem</p>
              <p className="text-2xl font-bold">{transactions.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Bekleyen Çekim</p>
              <p className="text-2xl font-bold">
                {balance?.pendingPayouts || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <Loader2 className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Tamamlanan Çekim</p>
              <p className="text-2xl font-bold">
                {balance?.totalEarnings
                  ? Math.floor(balance.totalEarnings / 1000)
                  : 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Son İşlemler</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/wallet/transactions')}
          >
            Tümünü Gör
          </Button>
        </div>

        {transactions.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center">
            <p>Henüz işlem bulunmuyor</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      transaction.amount > 0
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {transaction.amount > 0 ? '+' : '-'}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(transaction.createdAt).toLocaleDateString(
                        'tr-TR',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.amount > 0 ? '+' : ''}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Bakiye: {formatCurrency(transaction.balanceAfter)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push('/wallet/transactions')}
        >
          İşlem Geçmişi
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push('/wallet/payouts')}
        >
          Çekim Geçmişi
        </Button>
      </div>
    </div>
  );
}
