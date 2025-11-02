'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { PayoutDashboard } from '@/components/domains/wallet/PayoutDashboard';
import { PayoutRequestFlow } from '@/components/domains/wallet/PayoutRequestFlow';
import { PayoutHistory } from '@/components/domains/wallet/PayoutHistory';
import { BankAccountManager } from '@/components/domains/wallet/BankAccountManager';
import { PayoutStatus, PayoutMethod } from '@/types/business/features/wallet';
import { Download, Clock, Building2 } from 'lucide-react';

export default function PayoutSystemPage() {
  const [isRequestFlowOpen, setIsRequestFlowOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Download className="text-primary h-8 w-8" />
          <h1 className="text-3xl font-bold">Payout System - Days 6-7</h1>
        </div>
        <p className="text-muted-foreground">
          Complete payout/withdrawal system demo
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
            History
          </TabsTrigger>
          <TabsTrigger value="accounts">
            <Building2 className="mr-2 h-4 w-4" />
            Accounts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <p className="text-muted-foreground">
            PayoutDashboard will render here
          </p>
        </TabsContent>
        <TabsContent value="history">
          <p className="text-muted-foreground">
            PayoutHistory will render here
          </p>
        </TabsContent>
        <TabsContent value="accounts">
          <p className="text-muted-foreground">
            BankAccountManager will render here
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
