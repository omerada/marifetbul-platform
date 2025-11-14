/**
 * ================================================
 * UNIFIED WALLET PAGE - TAB-BASED NAVIGATION
 * ================================================
 * Single wallet page with tab-based navigation
 * Consolidates: payouts/, withdrawals/, escrow/, bank-accounts/
 *
 * Sprint 1 - Story 3: Wallet Consolidation
 * @version 3.0.0
 * @created 2025-11-14
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { WalletDashboard } from '@/components/domains/wallet';
import { PayoutDashboard } from '@/components/domains/wallet/PayoutDashboard';
import { UnifiedPayoutHistory } from '@/components/domains/wallet';
import { EscrowList } from '@/components/domains/wallet';
import { BankAccountList, BankAccountForm } from '@/components/domains/wallet';
import { useWalletData } from '@/hooks/business/wallet/useWalletData';
import { usePayouts } from '@/hooks/business/wallet/usePayouts';
import { useBankAccounts } from '@/hooks/business/wallet/useBankAccounts';
import { useToast } from '@/hooks/core/useToast';
import {
  Wallet,
  Download,
  Shield,
  Building2,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

type WalletTab =
  | 'overview'
  | 'transactions'
  | 'payouts'
  | 'escrow'
  | 'accounts';

const TAB_CONFIG = {
  overview: {
    label: 'Genel Bakış',
    icon: Wallet,
    description: 'Bakiye ve özet',
  },
  transactions: {
    label: 'İşlemler',
    icon: TrendingUp,
    description: 'Gelir ve giderler',
  },
  payouts: {
    label: 'Para Çekme',
    icon: Download,
    description: 'Çekim talepleri',
  },
  escrow: {
    label: 'Emanet',
    icon: Shield,
    description: 'Güvenli ödeme',
  },
  accounts: {
    label: 'Banka Hesapları',
    icon: Building2,
    description: 'Hesap yönetimi',
  },
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

export function UnifiedWalletPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success: showSuccess } = useToast();

  // Get initial tab from URL query parameter
  const initialTab = (searchParams.get('tab') as WalletTab) || 'overview';
  const [activeTab, setActiveTab] = useState<WalletTab>(initialTab);
  const [showAddBankForm, setShowAddBankForm] = useState(false);

  // ========================================================================
  // DATA HOOKS
  // ========================================================================

  const {
    wallet,
    transactions,
    isLoading: walletLoading,
    refresh: refreshWallet,
    availableBalance,
  } = useWalletData(true, 30000);

  const {
    payouts,
    limits,
    eligibility,
    isLoading: payoutsLoading,
  } = usePayouts();

  const { refresh: refreshAccounts } = useBankAccounts();

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleTabChange = useCallback(
    (tab: string) => {
      const newTab = tab as WalletTab;
      setActiveTab(newTab);

      // Update URL without page refresh
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab);
      router.replace(url.pathname + url.search);

      logger.debug('[UnifiedWallet] Tab changed', { tab: newTab });
    },
    [router]
  );

  const handleAddBankAccount = useCallback(() => {
    setShowAddBankForm(true);
    setActiveTab('accounts');
  }, []);

  const handleBankAccountSuccess = useCallback(() => {
    showSuccess('Başarılı', 'Banka hesabı eklendi. Admin onayı bekleniyor.');
    setShowAddBankForm(false);
    refreshAccounts();
  }, [showSuccess, refreshAccounts]);

  const handleBankAccountCancel = useCallback(() => {
    setShowAddBankForm(false);
  }, []);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  // Sync tab with URL on mount
  useEffect(() => {
    const urlTab = searchParams.get('tab') as WalletTab;
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [searchParams, activeTab]);

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
            <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-100">
              Cüzdan
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kazançlarınızı yönetin ve takip edin
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          {(Object.keys(TAB_CONFIG) as WalletTab[]).map((tab) => {
            const config = TAB_CONFIG[tab];
            const Icon = config.icon;
            return (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{config.label}</span>
                <span className="sm:hidden">{config.label.split(' ')[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <WalletDashboard
            defaultView="overview"
            showAnalytics={true}
            balance={{
              availableBalance: availableBalance || 0,
              pendingBalance: wallet?.pendingBalance || 0,
              totalEarnings: wallet?.totalBalance || 0,
              pendingPayouts: wallet?.pendingBalance || 0,
            }}
            transactions={
              transactions as unknown as import('@/types/business/features/wallet').Transaction[]
            }
            isLoading={walletLoading}
            onRefresh={refreshWallet}
            onRequestPayout={() => setActiveTab('payouts')}
            onViewTransactions={() => setActiveTab('transactions')}
            onViewPayouts={() => setActiveTab('payouts')}
          />
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Tüm İşlemler</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gelir ve gider hareketlerinizi görüntüleyin
              </p>
            </div>
            {/* Transaction list will be added here */}
            <div className="text-center text-gray-500">
              İşlem listesi yakında eklenecek
            </div>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-6">
          <PayoutDashboard
            availableBalance={availableBalance || 0}
            limits={{
              currency: 'TRY',
              minAmount: limits?.minimumAmount || 50,
              maxAmount: limits?.maximumAmount || 10000,
              dailyLimit: limits?.dailyLimit || 5000,
              monthlyLimit: limits?.monthlyLimit || 50000,
            }}
            eligibility={{
              canRequestPayout: eligibility?.eligible || false,
              reason: eligibility?.reason || '',
              minimumBalance: limits?.minimumAmount || 50,
              availableBalance: eligibility?.availableBalance || 0,
              pendingPayouts: eligibility?.pendingPayouts || 0,
              nextEligibleDate: undefined,
            }}
            recentPayouts={payouts.slice(0, 5)}
            allPayouts={payouts}
            isLoading={payoutsLoading}
            onRequestPayout={() => {
              // Payout request will open modal
            }}
            onViewAllPayouts={() => {
              // Already in payouts tab
            }}
          />

          {/* Payout History */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Çekim Geçmişi</h3>
            <UnifiedPayoutHistory
              variant="advanced"
              payouts={payouts}
              isLoading={payoutsLoading}
            />
          </Card>
        </TabsContent>

        {/* Escrow Tab */}
        <TabsContent value="escrow" className="space-y-6">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Emanet İşlemleri</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Güvenli ödeme sistemi ile korunan tutarlar
                </p>
              </div>
            </div>
            <EscrowList transactions={[]} />
          </Card>
        </TabsContent>

        {/* Bank Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Banka Hesapları</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Para çekme işlemleri için banka hesaplarınızı yönetin
                </p>
              </div>
              {!showAddBankForm && (
                <Button
                  onClick={() => setShowAddBankForm(true)}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Hesap Ekle
                </Button>
              )}
            </div>

            {/* Add Account Form */}
            {showAddBankForm && (
              <div className="mb-6">
                <BankAccountForm
                  mode="create"
                  onSuccess={handleBankAccountSuccess}
                  onCancel={handleBankAccountCancel}
                />
              </div>
            )}

            {/* Account List */}
            <BankAccountList
              onAddNew={handleAddBankAccount}
              onAccountDeleted={() => {
                showSuccess('Başarılı', 'Banka hesabı kaldırıldı');
                refreshAccounts();
              }}
              onDefaultChanged={() => {
                showSuccess('Başarılı', 'Varsayılan hesap güncellendi');
                refreshAccounts();
              }}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default UnifiedWalletPage;
