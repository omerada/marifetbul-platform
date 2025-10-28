/**
 * ================================================
 * EARNINGS CHART - Earnings Over Time Visualization
 * ================================================
 * Displays earnings trends over time with period selection
 * Uses CSS-based bar chart for responsive display
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useTransactions } from '@/hooks/business/wallet';
import {
  TransactionType,
  formatCurrency,
} from '@/types/business/features/wallet';

// ================================================
// TYPES
// ================================================

export type ChartPeriod = '7d' | '30d' | '90d';

export interface EarningsChartProps {
  /**
   * Custom className for styling
   */
  className?: string;

  /**
   * Default period to display
   * @default '30d'
   */
  defaultPeriod?: ChartPeriod;
}

interface ChartDataPoint {
  period: string;
  earnings: number;
  formattedEarnings: string;
  color: string;
}

// ================================================
// HELPERS
// ================================================

const PERIOD_CONFIG = {
  '7d': { label: 'Son 7 Gün', days: 7 },
  '30d': { label: 'Son 30 Gün', days: 30 },
  '90d': { label: 'Son 90 Gün', days: 90 },
};

function groupTransactionsByPeriod(
  transactions: Array<{
    createdAt: string;
    type: string; // Accept any transaction type string
    amount: number;
  }>,
  period: ChartPeriod
): ChartDataPoint[] {
  const now = new Date();
  const config = PERIOD_CONFIG[period];
  const data: ChartDataPoint[] = [];

  // Group by days for 7d, by weeks for 30d, by months for 90d
  const groupSize = period === '7d' ? 1 : period === '30d' ? 7 : 30;
  const numGroups = Math.ceil(config.days / groupSize);

  for (let i = numGroups - 1; i >= 0; i--) {
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() - i * groupSize);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - groupSize + 1);

    // Filter transactions in this period (only positive earnings)
    const periodTransactions = transactions.filter((t) => {
      const txDate = new Date(t.createdAt);
      return (
        txDate >= startDate &&
        txDate <= endDate &&
        (t.type === TransactionType.CREDIT ||
          t.type === TransactionType.ESCROW_RELEASE ||
          t.type === TransactionType.REFUND) &&
        t.amount > 0
      );
    });

    // Sum earnings
    const earnings = periodTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Format label
    let label = '';
    if (period === '7d') {
      label = startDate.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
      });
    } else if (period === '30d') {
      label = `${startDate.getDate()}-${endDate.getDate()} ${endDate.toLocaleDateString('tr-TR', { month: 'short' })}`;
    } else {
      label = startDate.toLocaleDateString('tr-TR', {
        month: 'short',
        year: 'numeric',
      });
    }

    data.push({
      period: label,
      earnings,
      formattedEarnings: formatCurrency(earnings),
      color: earnings > 0 ? 'bg-primary' : 'bg-gray-200',
    });
  }

  return data;
}

function calculateTrend(data: ChartDataPoint[]): {
  percentage: number;
  isPositive: boolean;
} {
  if (data.length < 2) return { percentage: 0, isPositive: true };

  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));

  const firstAvg =
    firstHalf.reduce((sum, d) => sum + d.earnings, 0) / firstHalf.length;
  const secondAvg =
    secondHalf.reduce((sum, d) => sum + d.earnings, 0) / secondHalf.length;

  if (firstAvg === 0) return { percentage: 0, isPositive: secondAvg > 0 };

  const percentage = ((secondAvg - firstAvg) / firstAvg) * 100;
  return {
    percentage: Math.abs(percentage),
    isPositive: percentage >= 0,
  };
}

// ================================================
// COMPONENT
// ================================================

export const EarningsChart: React.FC<EarningsChartProps> = ({
  className = '',
  defaultPeriod = '30d',
}) => {
  // ==================== STATE ====================

  const [selectedPeriod, setSelectedPeriod] =
    useState<ChartPeriod>(defaultPeriod);

  // ==================== HOOKS ====================

  const { transactions, isLoading } = useTransactions(true);

  // ==================== COMPUTED VALUES ====================

  const chartData = useMemo(
    () => groupTransactionsByPeriod(transactions, selectedPeriod),
    [transactions, selectedPeriod]
  );

  const maxValue = useMemo(
    () => Math.max(...chartData.map((d) => d.earnings), 1),
    [chartData]
  );

  const totalEarnings = useMemo(
    () => chartData.reduce((sum, d) => sum + d.earnings, 0),
    [chartData]
  );

  const trend = useMemo(() => calculateTrend(chartData), [chartData]);

  // ==================== RENDER ====================

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <TrendingUp className="text-primary h-5 w-5" />
            Kazanç Grafiği
          </CardTitle>

          {/* Period Selector */}
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
            {(Object.keys(PERIOD_CONFIG) as ChartPeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  selectedPeriod === period
                    ? 'text-primary bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {PERIOD_CONFIG[period].label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 flex items-center gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Toplam Kazanç</p>
            <p className="text-primary text-2xl font-bold">
              {formatCurrency(totalEarnings)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span
              className={`font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.percentage.toFixed(1)}%
            </span>
            <span className="text-muted-foreground">önceki döneme göre</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-muted-foreground animate-pulse">
              Yükleniyor...
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <Calendar className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-muted-foreground text-sm">
              Bu dönemde kazanç verisi bulunmamaktadır
            </p>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div className="relative mb-4 h-64">
              <div className="absolute inset-0 flex items-end justify-around gap-2 px-2">
                {chartData.map((data, index) => {
                  const height = (data.earnings / maxValue) * 100;
                  return (
                    <div
                      key={index}
                      className="group flex flex-1 flex-col items-center gap-2"
                    >
                      {/* Bar */}
                      <div className="flex h-full w-full items-end justify-center">
                        <div
                          className={`w-full ${data.color} relative rounded-t-md transition-all duration-500 group-hover:shadow-lg hover:opacity-80`}
                          style={{
                            height: `${Math.max(height, 2)}%`,
                            minHeight: data.earnings > 0 ? '8px' : '2px',
                          }}
                        >
                          {/* Tooltip on hover */}
                          <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="rounded-lg bg-gray-900 px-3 py-2 text-xs whitespace-nowrap text-white shadow-lg">
                              <div className="font-semibold">
                                {data.formattedEarnings}
                              </div>
                              <div className="text-[10px] text-gray-300">
                                {data.period}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X-Axis Labels */}
            <div className="flex items-center justify-around gap-2 px-2">
              {chartData.map((data, index) => (
                <div
                  key={index}
                  className="text-muted-foreground flex-1 text-center text-xs"
                >
                  {data.period}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

EarningsChart.displayName = 'EarningsChart';
