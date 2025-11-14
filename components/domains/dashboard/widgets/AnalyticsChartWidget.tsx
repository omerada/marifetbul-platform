/**
 * ================================================
 * ANALYTICS CHART WIDGET
 * ================================================
 * Unified analytics chart widget for dashboard
 * Supports earnings trend, revenue breakdown, and transaction summary
 *
 * Sprint 1 - Story 4: Analytics Integration
 * @version 1.0.0
 * @created 2025-11-14
 */

'use client';

import { memo, useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/loading';
import { SimpleErrorDisplay } from '@/components/ui/SimpleErrorDisplay';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  getEarningsTrend,
  getRevenueBreakdown,
  getTransactionSummary,
  type EarningsTrendResponse,
  type RevenueBreakdownResponse,
  type TransactionSummaryResponse,
} from '@/lib/api/dashboard-analytics-api';
import { formatCurrency } from '@/lib/shared/formatters';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export type AnalyticsChartType = 'earnings' | 'revenue' | 'transactions';
export type DateRange = '7d' | '30d' | '90d' | '1y';

export interface AnalyticsChartWidgetProps {
  /** Chart type to display */
  chartType?: AnalyticsChartType;
  /** Allow switching between chart types */
  allowTypeSwitch?: boolean;
  /** Default date range */
  defaultRange?: DateRange;
  /** Show date range selector */
  showRangeSelector?: boolean;
  /** Custom title override */
  title?: string;
  /** Compact mode (reduced padding/margins) */
  compact?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CHART_COLORS = {
  primary: '#3b82f6', // blue-500
  success: '#10b981', // green-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  info: '#6366f1', // indigo-500
  purple: '#a855f7', // purple-500
  pink: '#ec4899', // pink-500
  teal: '#14b8a6', // teal-500
};

const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.info,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
  CHART_COLORS.teal,
];

const RANGE_CONFIG: Record<DateRange, { label: string; days: number }> = {
  '7d': { label: 'Son 7 Gün', days: 7 },
  '30d': { label: 'Son 30 Gün', days: 30 },
  '90d': { label: 'Son 90 Gün', days: 90 },
  '1y': { label: 'Son 1 Yıl', days: 365 },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDateRange(range: DateRange): {
  startDate: string;
  endDate: string;
} {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - RANGE_CONFIG[range].days);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AnalyticsChartWidget = memo<AnalyticsChartWidgetProps>(
  function AnalyticsChartWidget({
    chartType = 'earnings',
    allowTypeSwitch = true,
    defaultRange = '30d',
    showRangeSelector = true,
    title,
    compact = false,
  }) {
    const [activeChart, setActiveChart] =
      useState<AnalyticsChartType>(chartType);
    const [activeRange, setActiveRange] = useState<DateRange>(defaultRange);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Data states
    const [earningsData, setEarningsData] =
      useState<EarningsTrendResponse | null>(null);
    const [revenueData, setRevenueData] =
      useState<RevenueBreakdownResponse | null>(null);
    const [transactionData, setTransactionData] =
      useState<TransactionSummaryResponse | null>(null);

    // Fetch data on mount and when range changes
    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const { startDate, endDate } = getDateRange(activeRange);

          if (activeChart === 'earnings') {
            const data = await getEarningsTrend(startDate, endDate);
            setEarningsData(data);
          } else if (activeChart === 'revenue') {
            const data = await getRevenueBreakdown(startDate, endDate);
            setRevenueData(data);
          } else if (activeChart === 'transactions') {
            const data = await getTransactionSummary(startDate, endDate);
            setTransactionData(data);
          }
        } catch (err) {
          logger.error(
            `Failed to fetch analytics data: ${chartType}`,
            err as Error
          );
          setError('Veri yüklenirken hata oluştu. Lütfen tekrar deneyin.');
        } finally {
          setIsLoading(false);
        }
      };

      void fetchData();
    }, [activeChart, activeRange, chartType]);

    // Render chart based on type
    const renderChart = () => {
      if (isLoading) {
        return (
          <div className="flex h-80 items-center justify-center">
            <Loading size="lg" text="Yükleniyor..." />
          </div>
        );
      }

      if (error) {
        return (
          <div className="flex h-80 items-center justify-center">
            <SimpleErrorDisplay message={error} />
          </div>
        );
      }

      if (activeChart === 'earnings' && earningsData) {
        return (
          <div>
            <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-gray-600">Toplam Kazanç</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earningsData.totalEarnings, 'TRY')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Sipariş</p>
                <p className="text-2xl font-bold text-gray-900">
                  {earningsData.totalOrders}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Günlük Ortalama</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earningsData.averageDaily, 'TRY')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Büyüme</p>
                <p
                  className={`text-2xl font-bold ${
                    earningsData.growthPercentage >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {earningsData.growthPercentage >= 0 ? '+' : ''}
                  {earningsData.growthPercentage.toFixed(1)}%
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={earningsData.data}>
                <defs>
                  <linearGradient
                    id="colorEarnings"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={CHART_COLORS.primary}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={CHART_COLORS.primary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  style={{ fontSize: '12px' }}
                />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value, 'TRY')}
                  labelFormatter={(label) => `Tarih: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke={CHART_COLORS.primary}
                  fillOpacity={1}
                  fill="url(#colorEarnings)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );
      }

      if (activeChart === 'revenue' && revenueData) {
        return (
          <div>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Toplam Gelir</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(revenueData.totalRevenue, 'TRY')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">En Çok Kazandıran</p>
                <p className="text-lg font-bold text-gray-900">
                  {revenueData.topCategory || 'Veri yok'}
                </p>
                <p className="text-sm text-gray-600">
                  %{revenueData.topCategoryPercentage.toFixed(1)}
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={
                    revenueData.byCategory as unknown as Record<
                      string,
                      unknown
                    >[]
                  }
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                  label
                >
                  {revenueData.byCategory.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value, 'TRY')}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      }

      if (activeChart === 'transactions' && transactionData) {
        const chartData = [
          {
            name: 'Gelir',
            value: transactionData.totalIncome,
            color: CHART_COLORS.success,
          },
          {
            name: 'Gider',
            value: transactionData.totalExpenses,
            color: CHART_COLORS.danger,
          },
        ];

        return (
          <div>
            <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-gray-600">Toplam Gelir</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(transactionData.totalIncome, 'TRY')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Gider</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(transactionData.totalExpenses, 'TRY')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Net Bakiye</p>
                <p
                  className={`text-2xl font-bold ${
                    transactionData.netBalance >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatCurrency(transactionData.netBalance, 'TRY')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Büyüme</p>
                <p
                  className={`text-2xl font-bold ${
                    transactionData.incomeGrowthPercentage >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {transactionData.incomeGrowthPercentage >= 0 ? '+' : ''}
                  {transactionData.incomeGrowthPercentage.toFixed(1)}%
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" style={{ fontSize: '12px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value, 'TRY')}
                />
                <Bar dataKey="value" fill={CHART_COLORS.primary}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }

      return null;
    };

    // Title text
    const getTitle = () => {
      if (title) return title;

      switch (activeChart) {
        case 'earnings':
          return 'Kazanç Trendi';
        case 'revenue':
          return 'Gelir Dağılımı';
        case 'transactions':
          return 'İşlem Özeti';
        default:
          return 'Analitikler';
      }
    };

    // Icon
    const getIcon = () => {
      switch (activeChart) {
        case 'earnings':
          return TrendingUp;
        case 'revenue':
          return PieChartIcon;
        case 'transactions':
          return BarChart3;
        default:
          return TrendingUp;
      }
    };

    const Icon = getIcon();

    return (
      <Card className={compact ? 'p-4' : 'p-6'}>
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
              <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getTitle()}
            </h3>
          </div>

          {/* Date Range Selector */}
          {showRangeSelector && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={activeRange}
                onChange={(e) => setActiveRange(e.target.value as DateRange)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {Object.entries(RANGE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Chart Type Tabs */}
        {allowTypeSwitch && (
          <Tabs
            value={activeChart}
            onValueChange={(value) =>
              setActiveChart(value as AnalyticsChartType)
            }
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="earnings">Kazanç</TabsTrigger>
              <TabsTrigger value="revenue">Gelir</TabsTrigger>
              <TabsTrigger value="transactions">İşlemler</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Chart Content */}
        {renderChart()}
      </Card>
    );
  }
);
