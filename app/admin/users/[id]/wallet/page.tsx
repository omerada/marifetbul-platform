'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wallet, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { TransactionTable } from '@/components/wallet';
import { payoutAdminApi } from '@/lib/api/admin/payout-admin-api';
import { formatCurrency } from '@/lib/shared/utils/format';
import type { WalletResponse } from '@/types/business/features/wallet';

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Admin User Wallet View Page
 * View user's wallet balance and transaction history
 */
export default function AdminUserWalletPage({ params }: Props) {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [transactions, setTransactions] = useState<
    Array<Record<string, unknown>>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    params.then((p) => setUserId(p.id));
  }, [params]);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [walletData, transactionsData] = await Promise.all([
          payoutAdminApi.getUserWallet(userId),
          payoutAdminApi.getUserTransactions(userId, page, 20),
        ]);
        setWallet(walletData);
        // Map transactions to compatible format
        setTransactions(
          transactionsData.content as Array<Record<string, unknown>>
        );
      } catch (err) {
        console.error('Failed to fetch user wallet:', err);
        setError('Kullanıcı cüzdan bilgileri yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, page]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="h-32 rounded bg-gray-200"></div>
            <div className="h-32 rounded bg-gray-200"></div>
            <div className="h-32 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !wallet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/users')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kullanıcılara Dön
        </Button>
        <Card className="p-8 text-center">
          <p className="text-red-600">{error || 'Cüzdan bulunamadı'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/users')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kullanıcılara Dön
        </Button>

        <h1 className="text-3xl font-bold">Kullanıcı Cüzdanı</h1>
        <p className="text-muted-foreground mt-1">Kullanıcı ID: {userId}</p>
      </div>

      {/* Balance Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-1 text-sm">
                Kullanılabilir Bakiye
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(wallet.balance?.availableBalance || 0, 'TRY')}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <Wallet className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-1 text-sm">
                Bekleyen Bakiye
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(wallet.balance?.pendingBalance || 0, 'TRY')}
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-1 text-sm">
                Toplam Kazanç
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(wallet.balance?.totalEarnings || 0, 'TRY')}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-1 text-sm">
                Bekleyen Çekimler
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(wallet.balance?.pendingPayouts || 0, 'TRY')}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-bold">İşlem Geçmişi</h2>
        <TransactionTable
          transactions={transactions as any}
          emptyMessage="İşlem bulunamadı"
        />

        {/* Pagination */}
        {transactions.length >= 20 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Önceki
            </Button>
            <span className="text-sm">Sayfa {page + 1}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={transactions.length < 20}
            >
              Sonraki
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
