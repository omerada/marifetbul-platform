/**
 * ================================================
 * WALLET ANALYTICS DEMO PAGE
 * ================================================
 * Demo page for testing wallet analytics components
 *
 * @page
 * @route /dashboard/freelancer/wallet/analytics
 * @since Story 1.3 - Wallet Analytics
 */

import { EarningsChart } from '@/components/domains/wallet';
import {
  RevenueBreakdown,
  TransactionSummary,
} from '@/components/domains/analytics';

export default function WalletAnalyticsPage() {
  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cüzdan Analitiği</h1>
          <p className="text-muted-foreground mt-1">
            Kazanç trendleri, gelir dağılımı ve işlem özetinizi görüntüleyin
          </p>
        </div>
      </div>

      {/* Earnings Trend - Full Width */}
      <EarningsChart />

      {/* Revenue & Transactions - 2 Columns */}
      <div className="grid gap-6 md:grid-cols-2">
        <RevenueBreakdown />
        <TransactionSummary />
      </div>
    </div>
  );
}
