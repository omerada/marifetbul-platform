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
import { PayoutDashboard } from '@/components/domains/wallet';
import { UnifiedPayoutHistory } from '@/components/domains/wallet';
import { EscrowList, EscrowBalanceCard } from '@/components/domains/wallet';
import { BankAccountList, BankAccountForm } from '@/components/domains/wallet';
import { RecentTransactionsWidget } from '@/components/domains/wallet';
import { UnifiedTransactionFilters } from '@/components/domains/wallet';
import { UpcomingAutoReleaseWidget } from '@/components/domains/wallet/widgets/UpcomingAutoReleaseWidget';
import { ObjectReleaseModal } from '@/components/domains/wallet/ObjectReleaseModal';
import type { TransactionFilters } from '@/types/business/features/wallet';
import { useWalletData } from '@/hooks/business/wallet/useWalletData';
import { usePayouts } from '@/hooks/business/wallet/usePayouts';
import { useBankAccounts } from '@/hooks/business/wallet/useBankAccounts';
import { useEscrowDetails } from '@/hooks/business/wallet/useEscrowDetails';
import { useUpcomingEscrowReleases } from '@/hooks/business/wallet/useUpcomingEscrowReleases';
import type { UpcomingReleaseItem } from '@/hooks/business/wallet/useUpcomingEscrowReleases';
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
import { Card } from '@/components/ui';
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
  const { success: showSuccess, toast } = useToast();

  // Get initial tab from URL query parameter
  const initialTab = (searchParams.get('tab') as WalletTab) || 'overview';
  const [activeTab, setActiveTab] = useState<WalletTab>(initialTab);
  const [showAddBankForm, setShowAddBankForm] = useState(false);
  const [transactionFilters, setTransactionFilters] =
    useState<TransactionFilters>({});

  // Object Release Modal State
  const [selectedReleaseItem, setSelectedReleaseItem] =
    useState<UpcomingReleaseItem | null>(null);
  const [showObjectReleaseModal, setShowObjectReleaseModal] = useState(false);

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

  const {
    escrowDetails,
    totalEscrow,
    isLoading: escrowLoading,
  } = useEscrowDetails();

  // Upcoming auto-release escrows (Story 1.4)
  const {
    items: upcomingReleases,
    isLoading: releasesLoading,
    error: releasesError,
    refresh: refreshReleases,
  } = useUpcomingEscrowReleases(true);

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

  const handleTransactionFiltersChange = useCallback(
    (newFilters: TransactionFilters) => {
      setTransactionFilters(newFilters);
    },
    []
  );

  const handleTransactionFiltersClear = useCallback(() => {
    setTransactionFilters({});
  }, []);

  // Object Release Handlers (Story 1.4)
  const handleObjectRelease = useCallback((item: UpcomingReleaseItem) => {
    setSelectedReleaseItem(item);
    setShowObjectReleaseModal(true);
  }, []);

  const handleObjectReleaseClose = useCallback(() => {
    setShowObjectReleaseModal(false);
    setSelectedReleaseItem(null);
  }, []);

  const handleObjectReleaseSuccess = useCallback(() => {
    logger.info('[UnifiedWallet] Object release successful, refreshing data');
    refreshWallet();
    refreshReleases();
    setShowObjectReleaseModal(false);
    setSelectedReleaseItem(null);
  }, [refreshWallet, refreshReleases]);

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
  // FILTER LOGIC
  // ========================================================================

  // Filter transactions based on active filters
  const filteredTransactions = useCallback(() => {
    if (!transactions) return [];

    let filtered = [...transactions];

    // Type filter
    if (transactionFilters.type) {
      filtered = filtered.filter((t) => t.type === transactionFilters.type);
    }

    // Date range filter
    if (transactionFilters.startDate) {
      const startDate = new Date(transactionFilters.startDate);
      filtered = filtered.filter((t) => new Date(t.createdAt) >= startDate);
    }
    if (transactionFilters.endDate) {
      const endDate = new Date(transactionFilters.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter((t) => new Date(t.createdAt) <= endDate);
    }

    // Amount filter
    if (transactionFilters.minAmount !== undefined) {
      filtered = filtered.filter(
        (t) => Math.abs(t.amount) >= transactionFilters.minAmount!
      );
    }
    if (transactionFilters.maxAmount !== undefined) {
      filtered = filtered.filter(
        (t) => Math.abs(t.amount) <= transactionFilters.maxAmount!
      );
    }

    return filtered;
  }, [transactions, transactionFilters]);

  const displayTransactions = filteredTransactions();

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
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Tüm İşlemler</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gelir ve gider hareketlerinizi görüntüleyin
              </p>
            </div>

            {/* Advanced Filters with URL Sync and Presets */}
            <div className="mb-6">
              <UnifiedTransactionFilters
                variant="advanced"
                filters={transactionFilters}
                onFiltersChange={handleTransactionFiltersChange}
                onClear={handleTransactionFiltersClear}
                totalCount={transactions?.length || 0}
                filteredCount={displayTransactions.length}
                defaultExpanded={false}
                syncWithUrl={true}
              />
            </div>

            {/* Transaction Display Component */}
            <RecentTransactionsWidget
              transactions={displayTransactions}
              isLoading={walletLoading}
              showTitle={false}
              showViewAll={false}
              emptyMessage="Henüz işlem geçmişiniz bulunmuyor"
            />
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
          {/* Escrow Balance Breakdown */}
          <EscrowBalanceCard
            totalBalance={wallet?.totalBalance || 0}
            availableBalance={availableBalance || 0}
            lockedBalance={totalEscrow}
            currency="TRY"
            escrowDetails={escrowDetails}
            isLoading={escrowLoading}
          />

          {/* Escrow Transaction List */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Emanet İşlemleri</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Güvenli ödeme sistemi ile korunan tutarlar
                </p>
              </div>
            </div>
            <EscrowList
              transactions={
                (transactions ||
                  []) as unknown as import('@/types/business/features/wallet').Transaction[]
              }
              isLoading={walletLoading}
              onReleaseRequest={(item) => {
                logger.info('[UnifiedWalletPage] Escrow release requested', {
                  escrowId: item.id,
                  orderId: item.orderId,
                });
                toast({
                  title: 'Emanet Serbest Bırakma',
                  description: 'İşlem için onay bekleniyor...',
                  type: 'info',
                });
              }}
              onDisputeRequest={(item) => {
                logger.info('[UnifiedWalletPage] Escrow dispute requested', {
                  escrowId: item.id,
                  orderId: item.orderId,
                });
                toast({
                  title: 'İtiraz Bildirimi',
                  description:
                    'Destek ekibimiz en kısa sürede iletişime geçecek',
                  type: 'info',
                });
              }}
              onItemClick={(item) => {
                if (item.orderId) {
                  router.push(`/dashboard/orders?orderId=${item.orderId}`);
                }
              }}
            />
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

      {/* Object Release Modal - Story 1.4 */}
      <ObjectReleaseModal
        item={selectedReleaseItem}
        isOpen={showObjectReleaseModal}
        onClose={handleObjectReleaseClose}
        onSuccess={handleObjectReleaseSuccess}
      />
    </div>
  );
}

export default UnifiedWalletPage;
