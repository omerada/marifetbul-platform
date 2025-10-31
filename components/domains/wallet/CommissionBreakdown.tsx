/**
 * ================================================
 * COMMISSION BREAKDOWN WIDGET
 * ================================================
 * Sprint 1 - Task 1.1.5
 *
 * Displays commission breakdown and earnings analysis
 * Shows platform fees, net earnings, and commission rates
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip';
import { formatCurrency, formatPercentage } from '@/lib/shared/formatters';
import type { Transaction } from '@/lib/api/validators';

// ============================================================================
// TYPES
// ============================================================================

export interface CommissionBreakdownProps {
  /**
   * All transactions for analysis
   */
  transactions: Transaction[];

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Custom className
   */
  className?: string;

  /**
   * Time period for analysis
   * @default 'month'
   */
  period?: 'week' | 'month' | 'year' | 'all';
}

interface CommissionData {
  totalEarnings: number;
  platformFees: number;
  netEarnings: number;
  commissionRate: number;
  transactionCount: number;
  averageCommission: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: 'week' | 'month' | 'year' | 'all'
): Transaction[] {
  if (period === 'all') return transactions;

  const now = new Date();
  const cutoffDate = new Date();

  switch (period) {
    case 'week':
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return transactions.filter((t) => new Date(t.createdAt) >= cutoffDate);
}

function calculateCommissionData(transactions: Transaction[]): CommissionData {
  // Filter relevant transaction types
  const earningTransactions = transactions.filter(
    (t) => t.type === 'CREDIT' || t.type === 'ESCROW_RELEASE'
  );

  const feeTransactions = transactions.filter((t) => t.type === 'FEE');

  const totalEarnings = earningTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const platformFees = Math.abs(
    feeTransactions.reduce((sum, t) => sum + t.amount, 0)
  );
  const netEarnings = totalEarnings - platformFees;
  const commissionRate =
    totalEarnings > 0 ? (platformFees / totalEarnings) * 100 : 0;
  const averageCommission =
    feeTransactions.length > 0 ? platformFees / feeTransactions.length : 0;

  return {
    totalEarnings,
    platformFees,
    netEarnings,
    commissionRate,
    transactionCount: earningTransactions.length,
    averageCommission,
  };
}

// ============================================================================
// COMPONENTS
// ============================================================================

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  className = '',
}: {
  label: string;
  value: string;
  icon: typeof DollarSign;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}) {
  return (
    <div className={`rounded-lg border bg-white p-4 ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && trend !== 'neutral' && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CommissionBreakdown({
  transactions,
  isLoading = false,
  className = '',
  period = 'month',
}: CommissionBreakdownProps) {
  // Process commission data
  const commissionData = useMemo(() => {
    const filtered = filterTransactionsByPeriod(transactions, period);
    return calculateCommissionData(filtered);
  }, [transactions, period]);

  const periodLabels = {
    week: 'Son 7 Gün',
    month: 'Son 30 Gün',
    year: 'Son 1 Yıl',
    all: 'Tüm Zamanlar',
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-blue-600" />
            Komisyon Analizi
          </CardTitle>
          <Badge variant="secondary">{periodLabels[period]}</Badge>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Platform komisyonları ve net kazançlarınız
        </p>
      </CardHeader>

      <CardContent>
        {/* Key Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <StatCard
            label="Toplam Kazanç"
            value={formatCurrency(commissionData.totalEarnings, 'TRY')}
            icon={DollarSign}
            trend="up"
          />
          <StatCard
            label="Platform Ücreti"
            value={formatCurrency(commissionData.platformFees, 'TRY')}
            icon={Percent}
            trend="down"
          />
          <StatCard
            label="Net Kazanç"
            value={formatCurrency(commissionData.netEarnings, 'TRY')}
            icon={TrendingUp}
            trend="up"
            className="col-span-2"
          />
        </div>

        {/* Commission Rate */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Komisyon Oranı
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 cursor-help text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">
                      Toplam kazancınızdan alınan platform komisyonu yüzdesi
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-lg font-bold text-blue-600">
              {formatPercentage(commissionData.commissionRate / 100)}
            </span>
          </div>
          <Progress
            value={commissionData.commissionRate}
            className="h-2 bg-gray-100"
          />
        </div>

        {/* Breakdown Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 py-2">
            <span className="text-sm text-gray-600">İşlem Sayısı</span>
            <span className="text-sm font-semibold text-gray-900">
              {commissionData.transactionCount}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 py-2">
            <span className="text-sm text-gray-600">Ortalama Komisyon</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(commissionData.averageCommission, 'TRY')}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Net Kazanç Oranı</span>
            <span className="text-sm font-semibold text-green-600">
              {formatPercentage(1 - commissionData.commissionRate / 100)}
            </span>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="text-sm text-blue-900">
              <p className="mb-1 font-medium">Komisyon Sistemi</p>
              <p className="text-blue-700">
                Platform komisyonu her işlemden otomatik olarak kesilir. Daha
                fazla işlem yaptıkça özel indirim oranlarından
                yararlanabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CommissionBreakdown;
