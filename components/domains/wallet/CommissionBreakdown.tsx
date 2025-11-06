/**
 * ================================================
 * COMMISSION BREAKDOWN WIDGET - ENHANCED
 * ================================================
 * Sprint DAY 2 - Task 6: Commission Charts Enhancement
 *
 * Enhanced with:
 * - Recharts visualizations (Line & Pie charts)
 * - CSV export functionality
 * - Period comparison (week/month/year)
 * - Interactive tooltips
 * - Trend analysis
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Enhanced
 */

'use client';

import { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Info,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';
import { Button } from '@/components/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip';
import { formatCurrency, formatPercentage } from '@/lib/shared/formatters';
import logger from '@/lib/infrastructure/monitoring/logger';
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

  /**
   * Show charts
   * @default true
   */
  showCharts?: boolean;

  /**
   * Enable CSV export
   * @default true
   */
  enableExport?: boolean;
}

interface CommissionData {
  totalEarnings: number;
  platformFees: number;
  netEarnings: number;
  commissionRate: number;
  transactionCount: number;
  averageCommission: number;
}

interface TimeSeriesData {
  date: string;
  earnings: number;
  fees: number;
  net: number;
}

interface PieData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number; // Add index signature for Recharts
}

type ChartView = 'line' | 'pie' | 'bar';

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

/**
 * Prepare time series data for line/bar charts
 */
function prepareTimeSeriesData(transactions: Transaction[]): TimeSeriesData[] {
  // Group by date
  const groupedByDate = transactions.reduce<Record<string, Transaction[]>>(
    (acc, t) => {
      const date = new Date(t.createdAt).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(t);
      return acc;
    },
    {}
  );

  // Calculate per-date metrics
  return Object.entries(groupedByDate)
    .map(([date, dayTransactions]) => {
      const earnings = dayTransactions
        .filter((t) => t.type === 'CREDIT' || t.type === 'ESCROW_RELEASE')
        .reduce((sum, t) => sum + t.amount, 0);

      const fees = Math.abs(
        dayTransactions
          .filter((t) => t.type === 'FEE')
          .reduce((sum, t) => sum + t.amount, 0)
      );

      return {
        date: new Date(date).toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: 'short',
        }),
        earnings,
        fees,
        net: earnings - fees,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Prepare pie chart data
 */
function preparePieData(data: CommissionData): PieData[] {
  return [
    {
      name: 'Net Kazanç',
      value: data.netEarnings,
      color: '#10b981',
    },
    {
      name: 'Platform Ücreti',
      value: data.platformFees,
      color: '#ef4444',
    },
  ];
}

/**
 * Export data to CSV
 */
function exportToCSV(
  transactions: Transaction[],
  commissionData: CommissionData,
  period: string
) {
  try {
    // Prepare CSV content
    const headers = [
      'Tarih',
      'İşlem Tipi',
      'Tutar',
      'Komisyon',
      'Net Tutar',
      'Açıklama',
    ];

    const rows = transactions.map((t) => {
      const isFee = t.type === 'FEE';
      const isEarning = t.type === 'CREDIT' || t.type === 'ESCROW_RELEASE';
      const commission = isFee ? Math.abs(t.amount) : 0;
      const net = isEarning ? t.amount - commission : 0;

      return [
        new Date(t.createdAt).toLocaleString('tr-TR'),
        t.type,
        t.amount.toFixed(2),
        commission.toFixed(2),
        net.toFixed(2),
        t.description || '-',
      ];
    });

    // Add summary row
    rows.push([]);
    rows.push(['ÖZET', '', '', '', '', '']);
    rows.push([
      'Toplam Kazanç',
      '',
      commissionData.totalEarnings.toFixed(2),
      '',
      '',
      '',
    ]);
    rows.push([
      'Platform Ücreti',
      '',
      commissionData.platformFees.toFixed(2),
      '',
      '',
      '',
    ]);
    rows.push([
      'Net Kazanç',
      '',
      commissionData.netEarnings.toFixed(2),
      '',
      '',
      '',
    ]);
    rows.push([
      'Komisyon Oranı',
      '',
      `${commissionData.commissionRate.toFixed(2)}%`,
      '',
      '',
      '',
    ]);

    // Create CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const filename = `komisyon-raporu-${period}-${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logger.info('CSV export successful', { period, filename });
  } catch (error) {
    logger.error('CSV export failed', error instanceof Error ? error : new Error(String(error)));
    alert('CSV export başarısız oldu. Lütfen tekrar deneyin.');
  }
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
  showCharts = true,
  enableExport = true,
}: CommissionBreakdownProps) {
  // State
  const [chartView, setChartView] = useState<ChartView>('line');

  // Process commission data
  const commissionData = useMemo(() => {
    const filtered = filterTransactionsByPeriod(transactions, period);
    return calculateCommissionData(filtered);
  }, [transactions, period]);

  // Prepare chart data
  const timeSeriesData = useMemo(() => {
    const filtered = filterTransactionsByPeriod(transactions, period);
    return prepareTimeSeriesData(filtered);
  }, [transactions, period]);

  const pieData = useMemo(
    () => preparePieData(commissionData),
    [commissionData]
  );

  // Export handler
  const handleExport = () => {
    const filtered = filterTransactionsByPeriod(transactions, period);
    exportToCSV(filtered, commissionData, periodLabels[period]);
  };

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
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{periodLabels[period]}</Badge>
            {enableExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                CSV İndir
              </Button>
            )}
          </div>
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

        {/* Charts Section */}
        {showCharts && timeSeriesData.length > 0 && (
          <div className="mb-6">
            {/* Chart Toggle */}
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">
                Komisyon Trendleri
              </h4>
              <div className="flex gap-1 rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setChartView('line')}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    chartView === 'line'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="inline h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setChartView('pie')}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    chartView === 'pie'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <PieChartIcon className="inline h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Line Chart */}
            {chartView === 'line' && (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="#888"
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#888" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                      }}
                      formatter={(value: number) =>
                        formatCurrency(value, 'TRY')
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="earnings"
                      stroke="#3b82f6"
                      name="Kazanç"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="fees"
                      stroke="#ef4444"
                      name="Komisyon"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="net"
                      stroke="#10b981"
                      name="Net"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Pie Chart */}
            {chartView === 'pie' && (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number) =>
                        formatCurrency(value, 'TRY')
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

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
