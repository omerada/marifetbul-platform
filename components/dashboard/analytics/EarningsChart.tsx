'use client';

/**
 * ================================================
 * EARNINGS CHART COMPONENT
 * ================================================
 * Line chart showing earnings trend over time
 * Includes period selector (7/30/90 days) and growth indicator
 *
 * @component
 * @since Story 1.3 - Wallet Analytics
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  getEarningsTrend,
  type EarningsTrendResponse,
} from '@/lib/api/dashboard-analytics-api';
import { TrendingUp, TrendingDown } from 'lucide-react';

type Period = 7 | 30 | 90;

export default function EarningsChart() {
  const [period, setPeriod] = useState<Period>(7);
  const [data, setData] = useState<EarningsTrendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);

        const response = await getEarningsTrend(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );

        setData(response);
      } catch (err) {
        console.error('Failed to load earnings trend:', err);
        setError('Kazanç verileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [period]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kazanç Trendi</CardTitle>
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
          <CardTitle>Kazanç Trendi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground py-8 text-center">
            {error || 'Veri yüklenemedi'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxEarnings = Math.max(...data.data.map((d) => d.earnings));
  const growthIsPositive = data.growthPercentage >= 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Kazanç Trendi</CardTitle>

          {/* Period Selector */}
          <div className="flex gap-2">
            <Button
              variant={period === 7 ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPeriod(7)}
            >
              7 Gün
            </Button>
            <Button
              variant={period === 30 ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPeriod(30)}
            >
              30 Gün
            </Button>
            <Button
              variant={period === 90 ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPeriod(90)}
            >
              90 Gün
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-muted-foreground text-sm">Toplam Kazanç</p>
            <p className="text-2xl font-bold">
              ₺
              {data.totalEarnings.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Toplam Sipariş</p>
            <p className="text-2xl font-bold">{data.totalOrders}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Günlük Ortalama</p>
            <p className="text-2xl font-bold">
              ₺
              {data.averageDaily.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Büyüme</p>
            <div className="flex items-center gap-1">
              {growthIsPositive ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              <p
                className={`text-2xl font-bold ${growthIsPositive ? 'text-green-500' : 'text-red-500'}`}
              >
                {Math.abs(data.growthPercentage).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Simple Bar Chart */}
        <div className="relative flex h-[300px] items-end gap-1">
          {data.data.map((point, index) => {
            const heightPercent =
              maxEarnings > 0 ? (point.earnings / maxEarnings) * 100 : 0;
            const isPeak = point.earnings === data.peakDay;

            return (
              <div
                key={index}
                className="group relative flex-1"
                style={{ height: '100%' }}
              >
                {/* Bar */}
                <div
                  className={`absolute bottom-0 w-full rounded-t transition-colors ${
                    isPeak
                      ? 'bg-primary'
                      : 'bg-primary/60 group-hover:bg-primary/80'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 transform group-hover:block">
                  <div className="bg-popover text-popover-foreground rounded-lg px-3 py-2 text-sm whitespace-nowrap shadow-lg">
                    <p className="font-semibold">
                      {new Date(point.date).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                    <p>
                      ₺
                      {point.earnings.toLocaleString('tr-TR', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {point.orderCount} sipariş
                    </p>
                  </div>
                  <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 transform">
                    <div className="border-t-popover border-4 border-transparent" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Labels (show every nth date) */}
        <div className="text-muted-foreground mt-2 flex text-xs">
          {data.data
            .filter((_, i) => {
              const step = period === 7 ? 1 : period === 30 ? 5 : 15;
              return i % step === 0 || i === data.data.length - 1;
            })
            .map((point, index) => (
              <div key={index} className="flex-1 text-center">
                {new Date(point.date).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'short',
                })}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
