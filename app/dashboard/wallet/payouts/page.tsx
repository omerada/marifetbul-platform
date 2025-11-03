'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { PayoutDashboard } from '@/components/domains/wallet/PayoutDashboard';
import { PayoutRequestFlow } from '@/components/domains/wallet/PayoutRequestFlow';
import { PayoutHistory } from '@/components/domains/wallet/PayoutHistory';
import { BankAccountManager } from '@/components/domains/wallet/BankAccountManager';
import { usePayouts } from '@/hooks/business/wallet/usePayouts';
import { useWalletStore } from '@/stores/walletStore';
import { Download, Clock, Building2 } from 'lucide-react';
import type { PayoutRequestData } from '@/components/domains/wallet/PayoutRequestFlow';
import {
  getBankAccounts,
  addBankAccount,
  setDefaultBankAccount,
  removeBankAccount,
  type BankAccountResponse,
  type AddBankAccountRequest,
} from '@/lib/api/bank-accounts';
import { useToast } from '@/hooks/core/useToast';
import type { BankAccount } from '@/components/domains/wallet/BankAccountManager';

export default function PayoutSystemPage() {
  const [isRequestFlowOpen, setIsRequestFlowOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bankAccounts, setBankAccounts] = useState<BankAccountResponse[]>([]);
  const [isBankAccountsLoading, setIsBankAccountsLoading] = useState(true);
  const { error: showErrorToast, success: showSuccessToast } = useToast();

  // Fetch payout data from hook
  const { payouts, limits, eligibility, isLoading, requestPayout, refresh } =
    usePayouts();

  // Get balance from wallet store
  const balance = useWalletStore((state) => state.balance);

  // Fetch bank accounts from API
  const loadBankAccounts = useCallback(async () => {
    try {
      setIsBankAccountsLoading(true);
      const accounts = await getBankAccounts();
      setBankAccounts(accounts);
    } catch (error) {
      console.error('Failed to load bank accounts:', error);
      showErrorToast('Hata', 'Banka hesapları yüklenirken bir hata oluştu');
      setBankAccounts([]);
    } finally {
      setIsBankAccountsLoading(false);
    }
  }, [showErrorToast]);

  useEffect(() => {
    loadBankAccounts();
  }, [loadBankAccounts]);

  // Handle add bank account
  const handleAddBankAccount = useCallback(
    async (account: Omit<BankAccount, 'id' | 'createdAt'>) => {
      try {
        const request: AddBankAccountRequest = {
          iban: account.iban.replace(/\s/g, '').toUpperCase(),
          accountHolder: account.accountHolder,
          bankName: account.bankName,
        };

        await addBankAccount(request);
        showSuccessToast(
          'Başarılı',
          'Banka hesabı eklendi. Admin onayı bekleniyor.'
        );
        await loadBankAccounts();
      } catch (error: unknown) {
        console.error('Failed to add bank account:', error);
        const errorMessage =
          error &&
          typeof error === 'object' &&
          'message' in error &&
          typeof error.message === 'string'
            ? error.message
            : 'Banka hesabı eklenirken bir hata oluştu';
        showErrorToast('Hata', errorMessage);
        throw error;
      }
    },
    [loadBankAccounts, showErrorToast, showSuccessToast]
  );

  // Handle set default bank account
  const handleSetDefaultAccount = useCallback(
    async (id: string) => {
      try {
        await setDefaultBankAccount(id);
        showSuccessToast('Başarılı', 'Varsayılan hesap güncellendi');
        await loadBankAccounts();
      } catch (error) {
        console.error('Failed to set default account:', error);
        showErrorToast('Hata', 'Varsayılan hesap ayarlanırken bir hata oluştu');
        throw error;
      }
    },
    [loadBankAccounts, showErrorToast, showSuccessToast]
  );

  // Handle delete bank account
  const handleDeleteBankAccount = useCallback(
    async (id: string) => {
      try {
        await removeBankAccount(id);
        showSuccessToast('Başarılı', 'Banka hesabı kaldırıldı');
        await loadBankAccounts();
      } catch (error) {
        console.error('Failed to delete bank account:', error);
        showErrorToast('Hata', 'Banka hesabı silinirken bir hata oluştu');
        throw error;
      }
    },
    [loadBankAccounts, showErrorToast, showSuccessToast]
  );

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
          Kazançlarınızı yönetin ve banka hesabınıza aktarın
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
            Geçmiş
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
          <PayoutHistory payouts={payouts} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="accounts">
          <BankAccountManager
            accounts={bankAccounts.map((account) => ({
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
            isLoading={isBankAccountsLoading}
            onAddAccount={handleAddBankAccount}
            onDeleteAccount={handleDeleteBankAccount}
            onSetDefault={handleSetDefaultAccount}
          />
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
