'use client';

/**
 * ================================================
 * TRANSACTION SUMMARY COMPONENT
 * ================================================
 * Income vs expenses summary with wallet balances
 * Shows transaction breakdown and growth indicators
 *
 * @component
 * @since Story 1.3 - Wallet Analytics
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  getTransactionSummary,
  type TransactionSummaryResponse,
} from '@/lib/api/dashboard-analytics-api';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
} from 'lucide-react';

export default function TransactionSummary() {
  const [data, setData] = useState<TransactionSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // Last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const response = await getTransactionSummary(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );

        setData(response);
      } catch (err) {
        console.error('Failed to load transaction summary:', err);
        setError('İşlem özeti yüklenemedi');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>İşlem Özeti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>İşlem Özeti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground py-8 text-center">
            {error || 'Veri yüklenemedi'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const growthIsPositive = data.incomeGrowthPercentage >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>İşlem Özeti (Son 30 Gün)</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Balance Card */}
        <div className="from-primary/10 to-primary/5 rounded-lg bg-gradient-to-r p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-1 text-sm">Net Bakiye</p>
              <p className="text-3xl font-bold">
                ₺
                {data.netBalance.toLocaleString('tr-TR', {
                  minimumFractionDigits: 2,
                })}
              </p>
              <div className="mt-2 flex items-center gap-2">
                {growthIsPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${growthIsPositive ? 'text-green-500' : 'text-red-500'}`}
                >
                  {Math.abs(data.incomeGrowthPercentage).toFixed(1)}% büyüme
                </span>
              </div>
            </div>
            <Wallet className="text-primary/30 h-12 w-12" />
          </div>
        </div>

        {/* Income vs Expenses */}
        <div className="grid grid-cols-2 gap-4">
          {/* Income */}
          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-green-500" />
              <p className="text-muted-foreground text-sm font-medium">Gelir</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              ₺
              {data.totalIncome.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {data.incomeTransactionCount} işlem
            </p>
          </div>

          {/* Expenses */}
          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center gap-2">
              <ArrowDownCircle className="h-5 w-5 text-red-500" />
              <p className="text-muted-foreground text-sm font-medium">Gider</p>
            </div>
            <p className="text-2xl font-bold text-red-600">
              ₺
              {data.totalExpenses.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {data.expenseTransactionCount} işlem
            </p>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Gider Dağılımı</p>

          {/* Orders Income */}
          <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">Sipariş Gelirleri</span>
            </div>
            <span className="text-sm font-semibold text-green-600">
              ₺
              {data.ordersIncome.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Payouts */}
          <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-sm">Çekim İşlemleri</span>
            </div>
            <span className="text-sm font-semibold text-blue-600">
              -₺
              {data.payoutsExpense.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Fees */}
          <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950/20">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span className="text-sm">Platform Ücretleri</span>
            </div>
            <span className="text-sm font-semibold text-yellow-600">
              -₺
              {data.feesExpense.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Refunds */}
          {data.refundsExpense > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-red-50 p-3 dark:bg-red-950/20">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-sm">İade İşlemleri</span>
              </div>
              <span className="text-sm font-semibold text-red-600">
                -₺
                {data.refundsExpense.toLocaleString('tr-TR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          )}
        </div>

        {/* Wallet Balances */}
        <div className="border-t pt-4">
          <p className="mb-3 text-sm font-medium">Cüzdan Bakiyeleri</p>
          <div className="grid grid-cols-3 gap-3">
            {/* Available */}
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
              <div className="mb-1 flex items-center gap-1">
                <Wallet className="text-muted-foreground h-3 w-3" />
                <p className="text-muted-foreground text-xs">Kullanılabilir</p>
              </div>
              <p className="text-lg font-bold">
                ₺
                {data.availableBalance.toLocaleString('tr-TR', {
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>

            {/* Pending */}
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
              <div className="mb-1 flex items-center gap-1">
                <Clock className="text-muted-foreground h-3 w-3" />
                <p className="text-muted-foreground text-xs">Bekleyen</p>
              </div>
              <p className="text-lg font-bold">
                ₺
                {data.pendingBalance.toLocaleString('tr-TR', {
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>

            {/* Escrow */}
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
              <div className="mb-1 flex items-center gap-1">
                <ArrowUpCircle className="text-muted-foreground h-3 w-3" />
                <p className="text-muted-foreground text-xs">Emanet</p>
              </div>
              <p className="text-lg font-bold">
                ₺
                {data.escrowBalance.toLocaleString('tr-TR', {
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Previous Period Comparison */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-muted-foreground mb-1 text-xs">
            Önceki Dönem Karşılaştırması
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm">Önceki 30 Gün Geliri:</span>
            <span className="text-sm font-semibold">
              ₺
              {data.previousPeriodIncome.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
