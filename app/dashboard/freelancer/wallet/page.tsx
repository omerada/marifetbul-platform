/**
 * ================================================
 * WALLET DASHBOARD PAGE - Main Wallet Overview
 * ================================================
 * Freelancer wallet dashboard showing balance, earnings chart,
 * and recent transactions
 *
 * Sprint 1 - Enhanced with real-time updates
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

'use client';

import {
  WalletBalanceCard,
  EarningsChart,
  RecentTransactionsWidget,
} from '@/components/domains/wallet';
import { EscrowViewer, CommissionBreakdown } from '@/components';
import {
  DollarSign,
  TrendingUp,
  ArrowRight,
  Building2,
  RefreshCw,
  Radio,
} from 'lucide-react';
import Link from 'next/link';
import {
  useWallet,
  useTransactions,
  useWalletPolling,
} from '@/hooks/business/wallet';
import { UnifiedLoading } from '@/components/ui/loading';
import { Button } from '@/components/ui';

// ================================================
// PAGE COMPONENT
// ================================================

export default function WalletPage() {
  const { wallet, isLoadingWallet, isLoadingBalance, error, refreshAll } =
    useWallet();

  const { transactions, isLoading: isLoadingTransactions } = useTransactions();

  // Setup real-time polling (30s interval)
  const { isPolling, pause, resume, lastPollTime } = useWalletPolling({
    interval: 30000,
    enabled: true,
    includeTransactions: true,
  });

  const isLoading = isLoadingWallet || isLoadingBalance;

  // Error state
  if (error && !isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h3 className="mb-2 text-lg font-semibold text-red-900">
            Cüzdan Yüklenemedi
          </h3>
          <p className="mb-4 text-sm text-red-700">{error}</p>
          <Button onClick={refreshAll} variant="outline">
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
              <DollarSign className="text-primary h-8 w-8" />
              Cüzdan
            </h1>
            <div className="mt-1 flex items-center gap-3">
              <p className="text-muted-foreground">
                Bakiyenizi yönetin, kazançlarınızı takip edin
              </p>
              {lastPollTime && (
                <span className="text-xs text-gray-500">
                  Son güncelleme: {lastPollTime.toLocaleTimeString('tr-TR')}
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Polling Status Indicator */}
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
              <Radio
                className={`h-4 w-4 ${isPolling ? 'animate-pulse text-green-500' : 'text-gray-400'}`}
              />
              <span className="text-xs text-gray-600">
                {isPolling ? 'Otomatik Güncelleme' : 'Durduruldu'}
              </span>
              <button
                onClick={isPolling ? pause : resume}
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                {isPolling ? 'Durdur' : 'Başlat'}
              </button>
            </div>

            <Button
              onClick={refreshAll}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Yenile
            </Button>
            <Link
              href="/dashboard/freelancer/wallet/bank-accounts"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Building2 className="h-4 w-4" />
              Banka Hesaplarım
            </Link>
            <Link
              href="/dashboard/freelancer/wallet/transactions"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              İşlem Geçmişi
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/freelancer/wallet/payouts"
              className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              Para Çek
              <TrendingUp className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && !wallet ? (
        <div className="py-12">
          <UnifiedLoading size="lg" text="Cüzdan yükleniyor..." />
        </div>
      ) : (
        <>
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column - Balance & Chart */}
            <div className="space-y-6 lg:col-span-2">
              {/* Balance Card */}
              <WalletBalanceCard />

              {/* Earnings Chart */}
              <EarningsChart />

              {/* Escrow Viewer */}
              <EscrowViewer
                transactions={transactions || []}
                isLoading={isLoadingTransactions}
              />
            </div>

            {/* Right Column - Analytics & Transactions */}
            <div className="space-y-6 lg:col-span-1">
              {/* Commission Breakdown */}
              <CommissionBreakdown
                transactions={transactions || []}
                isLoading={isLoadingTransactions}
                period="month"
              />

              {/* Recent Transactions */}
              <RecentTransactionsWidget />
            </div>
          </div>

          {/* Mobile Quick Actions */}
          <div className="mt-6 grid grid-cols-3 gap-3 md:hidden">
            <Link
              href="/dashboard/freelancer/wallet/bank-accounts"
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Banka Hesapları
            </Link>
            <Link
              href="/dashboard/freelancer/wallet/transactions"
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              İşlem Geçmişi
            </Link>
            <Link
              href="/dashboard/freelancer/wallet/payouts"
              className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-3 text-center text-sm font-medium text-white transition-colors"
            >
              Para Çek
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-8 rounded-lg border border-blue-100 bg-blue-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-semibold text-blue-900">
                  Cüzdan Nasıl Çalışır?
                </h3>
                <p className="mb-3 text-sm text-blue-700">
                  Tamamlanan işlerinizden kazandığınız ödemeler cüzdanınıza
                  yatırılır. Minimum çekim limitini geçtiğinizde para çekme
                  talebi oluşturabilirsiniz.
                </p>
                <Link
                  href="/help/wallet"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Detaylı Bilgi
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
