/**
 * ================================================
 * WALLET ANALYTICS COMPONENT
 * ================================================
 * Comprehensive wallet analytics with charts and insights
 *
 * Features:
 * - Earnings trend line chart (Recharts)
 * - Transaction breakdown pie chart
 * - Monthly comparison bar chart
 * - Key metrics summary
 * - Period selector (7d, 30d, 90d, 1y)
 * - Responsive charts
 *
 * Sprint 1 - Epic 1.1 - Day 3
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/shared/formatters';
import type {
  Transaction,
  TransactionType,
} from '@/types/business/features/wallet';

// ============================================================================
// TYPES
// ============================================================================

export type AnalyticsPeriod = '7d' | '30d' | '90d' | '1y' | 'all';

export interface WalletAnalyticsProps {
  /** List of transactions for analytics */
  transactions: Transaction[];

  /** Loading state */
  isLoading?: boolean;

  /** Initial period */
  defaultPeriod?: AnalyticsPeriod;

  /** Currency code */
  currency?: string;

  /** Additional CSS classes */
  className?: string;
}

interface EarningsDataPoint {
  date: string;
  earnings: number;
  expenses: number;
  net: number;
}

interface TransactionBreakdown {
  type: string;
  amount: number;
  count: number;
  percentage: number;
}

interface MonthlyComparison {
  month: string;
  income: number;
  expenses: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  '7d': 'Son 7 Gün',
  '30d': 'Son 30 Gün',
  '90d': 'Son 90 Gün',
  '1y': 'Son 1 Yıl',
  all: 'Tüm Zamanlar',
};

const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  purple: '#8b5cf6',
  indigo: '#6366f1',
  pink: '#ec4899',
  gray: '#6b7280',
};

const TYPE_COLORS: Record<string, string> = {
  CREDIT: CHART_COLORS.success,
  DEBIT: CHART_COLORS.danger,
  ESCROW_HOLD: CHART_COLORS.warning,
  ESCROW_RELEASE: CHART_COLORS.success,
  PAYOUT: CHART_COLORS.primary,
  REFUND: CHART_COLORS.purple,
  FEE: CHART_COLORS.gray,
};

const TYPE_LABELS: Record<TransactionType, string> = {
  CREDIT: 'Gelir',
  DEBIT: 'Gider',
  ESCROW_HOLD: 'Escrow',
  ESCROW_RELEASE: 'Serbest',
  PAYOUT: 'Çekim',
  REFUND: 'İade',
  FEE: 'Komisyon',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Filter transactions by period
 */
function filterByPeriod(
  transactions: Transaction[],
  period: AnalyticsPeriod
): Transaction[] {
  if (period === 'all') return transactions;

  const now = new Date();
  const cutoffDate = new Date();

  switch (period) {
    case '7d':
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      cutoffDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      cutoffDate.setDate(now.getDate() - 90);
      break;
    case '1y':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return transactions.filter((t) => new Date(t.createdAt) >= cutoffDate);
}

/**
 * Generate earnings trend data
 */
function generateEarningsTrend(
  transactions: Transaction[],
  period: AnalyticsPeriod
): EarningsDataPoint[] {
  const filtered = filterByPeriod(transactions, period);

  // Group by date
  const grouped = new Map<string, { earnings: number; expenses: number }>();

  filtered.forEach((transaction) => {
    const date = new Date(transaction.createdAt).toISOString().split('T')[0];
    const isCredit =
      transaction.type === 'CREDIT' || transaction.type === 'ESCROW_RELEASE';

    if (!grouped.has(date)) {
      grouped.set(date, { earnings: 0, expenses: 0 });
    }

    const group = grouped.get(date)!;
    if (isCredit) {
      group.earnings += transaction.amount;
    } else {
      group.expenses += transaction.amount;
    }
  });

  // Convert to array and sort
  return Array.from(grouped.entries())
    .map(([date, values]) => ({
      date: new Date(date).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
      }),
      earnings: values.earnings,
      expenses: values.expenses,
      net: values.earnings - values.expenses,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Generate transaction breakdown
 */
function generateTransactionBreakdown(
  transactions: Transaction[],
  period: AnalyticsPeriod
): TransactionBreakdown[] {
  const filtered = filterByPeriod(transactions, period);

  const breakdown = new Map<
    TransactionType,
    { amount: number; count: number }
  >();
  let totalAmount = 0;

  filtered.forEach((transaction) => {
    if (!breakdown.has(transaction.type)) {
      breakdown.set(transaction.type, { amount: 0, count: 0 });
    }

    const group = breakdown.get(transaction.type)!;
    group.amount += transaction.amount;
    group.count += 1;
    totalAmount += transaction.amount;
  });

  return Array.from(breakdown.entries())
    .map(([type, values]) => ({
      type: TYPE_LABELS[type],
      amount: values.amount,
      count: values.count,
      percentage: totalAmount > 0 ? (values.amount / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Generate monthly comparison
 */
function generateMonthlyComparison(
  transactions: Transaction[]
): MonthlyComparison[] {
  const grouped = new Map<string, { income: number; expenses: number }>();

  transactions.forEach((transaction) => {
    const date = new Date(transaction.createdAt);
    const month = date.toLocaleDateString('tr-TR', {
      month: 'short',
      year: 'numeric',
    });
    const isCredit =
      transaction.type === 'CREDIT' || transaction.type === 'ESCROW_RELEASE';

    if (!grouped.has(month)) {
      grouped.set(month, { income: 0, expenses: 0 });
    }

    const group = grouped.get(month)!;
    if (isCredit) {
      group.income += transaction.amount;
    } else {
      group.expenses += transaction.amount;
    }
  });

  return Array.from(grouped.entries())
    .map(([month, values]) => ({
      month,
      income: values.income,
      expenses: values.expenses,
    }))
    .slice(-6); // Last 6 months
}

/**
 * Calculate key metrics
 */
function calculateMetrics(
  transactions: Transaction[],
  period: AnalyticsPeriod
) {
  const filtered = filterByPeriod(transactions, period);

  let totalIncome = 0;
  let totalExpenses = 0;
  let transactionCount = 0;

  filtered.forEach((transaction) => {
    const isCredit =
      transaction.type === 'CREDIT' || transaction.type === 'ESCROW_RELEASE';

    if (isCredit) {
      totalIncome += transaction.amount;
    } else {
      totalExpenses += transaction.amount;
    }

    transactionCount++;
  });

  const netIncome = totalIncome - totalExpenses;
  const averageTransaction =
    transactionCount > 0 ? totalIncome / transactionCount : 0;

  return {
    totalIncome,
    totalExpenses,
    netIncome,
    transactionCount,
    averageTransaction,
  };
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Metric card component
 */
function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  trendValue,
  currency,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  trend?: 'up' | 'down';
  trendValue?: string;
  currency: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="rounded-lg bg-blue-50 p-2">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          {trend && trendValue && (
            <div
              className={`flex items-center space-x-1 text-sm font-medium ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <p className="mb-1 text-2xl font-bold text-gray-900">
          {formatCurrency(value, currency)}
        </p>
        <p className="text-sm text-gray-600">{label}</p>
      </CardContent>
    </Card>
  );
}

/**
 * Custom tooltip for charts
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-sm font-medium text-gray-900">{label}</p>
      {payload.map((entry, index: number) => (
        <div key={index} className="flex items-center space-x-2 text-sm">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(entry.value, 'TRY')}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * WalletAnalytics Component
 *
 * Comprehensive analytics dashboard with charts
 *
 * @example
 * ```tsx
 * <WalletAnalytics
 *   transactions={transactions}
 *   defaultPeriod="30d"
 *   currency="TRY"
 * />
 * ```
 */
export function WalletAnalytics({
  transactions,
  isLoading = false,
  defaultPeriod = '30d',
  currency = 'TRY',
  className = '',
}: WalletAnalyticsProps) {
  // ========================================================================
  // STATE
  // ========================================================================

  const [selectedPeriod, setSelectedPeriod] =
    useState<AnalyticsPeriod>(defaultPeriod);

  // ========================================================================
  // COMPUTED DATA
  // ========================================================================

  const earningsTrend = useMemo(
    () => generateEarningsTrend(transactions, selectedPeriod),
    [transactions, selectedPeriod]
  );

  const transactionBreakdown = useMemo(
    () => generateTransactionBreakdown(transactions, selectedPeriod),
    [transactions, selectedPeriod]
  );

  const monthlyComparison = useMemo(
    () => generateMonthlyComparison(transactions),
    [transactions]
  );

  const metrics = useMemo(
    () => calculateMetrics(transactions, selectedPeriod),
    [transactions, selectedPeriod]
  );

  // ========================================================================
  // LOADING STATE
  // ========================================================================

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Analitikler yükleniyor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ========================================================================
  // EMPTY STATE
  // ========================================================================

  if (transactions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="text-center">
            <TrendingUp className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p className="mb-1 font-medium text-gray-900">
              Henüz analitik verisi yok
            </p>
            <p className="text-sm text-gray-600">
              İşlemleriniz gerçekleştikçe burada analitikler görünecek
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Period Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Cüzdan Analitiği</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {(Object.keys(PERIOD_LABELS) as AnalyticsPeriod[]).map(
                (period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {PERIOD_LABELS[period]}
                  </Button>
                )
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={TrendingUp}
          label="Toplam Gelir"
          value={metrics.totalIncome}
          trend="up"
          trendValue="+12%"
          currency={currency}
        />
        <MetricCard
          icon={TrendingDown}
          label="Toplam Gider"
          value={metrics.totalExpenses}
          currency={currency}
        />
        <MetricCard
          icon={DollarSign}
          label="Net Gelir"
          value={metrics.netIncome}
          trend={metrics.netIncome >= 0 ? 'up' : 'down'}
          trendValue={
            metrics.netIncome >= 0
              ? '+' +
                ((metrics.netIncome / metrics.totalIncome) * 100).toFixed(1) +
                '%'
              : '-' +
                Math.abs(
                  (metrics.netIncome / metrics.totalIncome) * 100
                ).toFixed(1) +
                '%'
          }
          currency={currency}
        />
        <MetricCard
          icon={Calendar}
          label="İşlem Sayısı"
          value={metrics.transactionCount}
          currency=""
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Earnings Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Gelir Trendi</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={earningsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    name="Gelir"
                    stroke={CHART_COLORS.success}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    name="Gider"
                    stroke={CHART_COLORS.danger}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transaction Breakdown Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>İşlem Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={
                      transactionBreakdown as unknown as Array<
                        Record<string, string | number>
                      >
                    }
                    dataKey="amount"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                    labelLine={{ stroke: '#9ca3af' }}
                  >
                    {transactionBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          TYPE_COLORS[
                            Object.keys(TYPE_LABELS)[
                              Object.values(TYPE_LABELS).indexOf(entry.type)
                            ]
                          ] || CHART_COLORS.gray
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Comparison Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Aylık Karşılaştırma</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="income"
                    name="Gelir"
                    fill={CHART_COLORS.success}
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Gider"
                    fill={CHART_COLORS.danger}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default WalletAnalytics;
