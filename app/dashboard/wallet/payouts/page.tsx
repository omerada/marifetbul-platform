'use client';

import { useState, useEffect, useCallback } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { PayoutDashboard } from '@/components/domains/wallet/PayoutDashboard';
import { PayoutRequestFlow } from '@/components/domains/wallet/PayoutRequestFlow';
import {
  UnifiedPayoutHistory,
  BankAccountForm,
  BankAccountList,
} from '@/components/domains/wallet';
import { usePayouts } from '@/hooks/business/wallet/usePayouts';
import { useWalletStore } from '@/stores/walletStore';
import { Download, Clock, Building2, Plus } from 'lucide-react';
import type { PayoutRequestData } from '@/components/domains/wallet/PayoutRequestFlow';
import {
  getBankAccounts,
  type BankAccountResponse,
} from '@/lib/api/bank-accounts';
import { useToast } from '@/hooks/core/useToast';
import { Button } from '@/components/ui';

export default function PayoutSystemPage() {
  const [isRequestFlowOpen, setIsRequestFlowOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);
  const { error: showErrorToast, success: showSuccessToast } = useToast();

  // Fetch payout data from hook
  const { payouts, limits, eligibility, isLoading, requestPayout, refresh } =
    usePayouts();

  // Get balance from wallet store
  const balance = useWalletStore((state) => state.balance);

  // Fetch bank accounts from API (will be handled by BankAccountList internally)
  const [bankAccounts, setBankAccounts] = useState<BankAccountResponse[]>([]);

  const loadBankAccounts = useCallback(async () => {
    try {
      const accounts = await getBankAccounts();
      setBankAccounts(accounts);
    } catch (error) {
      logger.error(
        'Failed to load bank accounts for payout',
        error,
        { component: 'PayoutSystemPage', action: 'loadBankAccounts' }
      );
      showErrorToast('Hata', 'Banka hesaplarý yüklenirken bir hata oluþtu');
      setBankAccounts([]);
    }
  }, [showErrorToast]);

  useEffect(() => {
    loadBankAccounts();
  }, [loadBankAccounts]);

  // Handle payout request
  const handlePayoutRequest = async (data: PayoutRequestData) => {
    await requestPayout({
      amount: data.amount,
      method: data.method,
      bankAccountId: data.bankAccountId,
      notes: data.description,
    });
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Download className="text-primary h-8 w-8" />
          <h1 className="text-3xl font-bold">Para Çekme Sistemi</h1>
        </div>
        <p className="text-muted-foreground">
          Kazançlarýnýzý yönetin ve banka hesabýnýza aktarýn
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">
            <Download className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="mr-2 h-4 w-4" />
            Geçmiþ
          </TabsTrigger>
          <TabsTrigger value="accounts">
            <Building2 className="mr-2 h-4 w-4" />
            Hesaplar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <PayoutDashboard
            availableBalance={balance?.availableBalance || 0}
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
            isLoading={isLoading}
            onRequestPayout={() => setIsRequestFlowOpen(true)}
            onViewAllPayouts={() => setActiveTab('history')}
          />
        </TabsContent>

        <TabsContent value="history">
          <UnifiedPayoutHistory
            variant="advanced"
            payouts={payouts}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="accounts">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Banka Hesaplarý</h3>
                <p className="text-muted-foreground text-sm">
                  Çekim iþlemleri için banka hesaplarýnýzý yönetin
                </p>
              </div>
              {!showAddAccountForm && (
                <Button onClick={() => setShowAddAccountForm(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Hesap Ekle
                </Button>
              )}
            </div>

            {/* Add Account Form */}
            {showAddAccountForm && (
              <BankAccountForm
                mode="create"
                onSuccess={() => {
                  showSuccessToast(
                    'Baþarýlý',
                    'Banka hesabý eklendi. Admin onayý bekleniyor.'
                  );
                  setShowAddAccountForm(false);
                  loadBankAccounts();
                }}
                onCancel={() => setShowAddAccountForm(false)}
              />
            )}

            {/* Account List */}
            <BankAccountList
              onAddNew={() => setShowAddAccountForm(true)}
              onAccountDeleted={() => {
                showSuccessToast('Baþarýlý', 'Banka hesabý kaldýrýldý');
                loadBankAccounts();
              }}
              onDefaultChanged={() => {
                showSuccessToast('Baþarýlý', 'Varsayýlan hesap güncellendi');
                loadBankAccounts();
              }}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Payout Request Flow Modal */}
      <PayoutRequestFlow
        isOpen={isRequestFlowOpen}
        onClose={() => {
          setIsRequestFlowOpen(false);
          refresh();
        }}
        availableBalance={balance?.availableBalance || 0}
        limits={{
          minimum: limits?.minimumAmount || 50,
          maximum: limits?.maximumAmount || 10000,
        }}
        bankAccounts={bankAccounts.map((account) => ({
          id: account.id,
          bankName: account.bankName,
          iban: account.iban,
          accountHolder: account.accountHolder,
          isDefault: account.isDefault,
          isVerified: account.status === 'VERIFIED',
          status: account.status,
          rejectionReason: account.rejectionReason,
          createdAt: account.createdAt,
        }))}
        onSubmit={handlePayoutRequest}
        onAddBankAccount={() => setActiveTab('accounts')}
      />
    </div>
  );
}
