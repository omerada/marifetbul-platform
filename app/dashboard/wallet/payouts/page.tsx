'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { PayoutDashboard } from '@/components/domains/wallet/PayoutDashboard';
import { PayoutRequestFlow } from '@/components/domains/wallet/PayoutRequestFlow';
import { PayoutHistory } from '@/components/domains/wallet/PayoutHistory';
import { BankAccountManager } from '@/components/domains/wallet/BankAccountManager';
import { usePayouts } from '@/hooks/business/wallet/usePayouts';
import { useWalletStore } from '@/stores/walletStore';
import { Download, Clock, Building2 } from 'lucide-react';
import type { PayoutRequestData } from '@/components/domains/wallet/PayoutRequestFlow';

export default function PayoutSystemPage() {
  const [isRequestFlowOpen, setIsRequestFlowOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch payout data from hook
  const { payouts, limits, eligibility, isLoading, requestPayout, refresh } =
    usePayouts();

  // Get balance from wallet store
  const balance = useWalletStore((state) => state.balance);

  // Mock bank accounts for now (will be replaced with real data in Story 3.1)
  const bankAccounts = [
    {
      id: '1',
      bankName: 'Garanti Bankası',
      iban: 'TR98 0006 2000 1234 5678 9012 34',
      accountHolder: 'Kullanıcı Adı',
      isDefault: true,
      isVerified: true,
      createdAt: new Date().toISOString(),
    },
  ];

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
          <BankAccountManager accounts={bankAccounts} isLoading={isLoading} />
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
        bankAccounts={bankAccounts}
        onSubmit={handlePayoutRequest}
        onAddBankAccount={() => setActiveTab('accounts')}
      />
    </div>
  );
}
