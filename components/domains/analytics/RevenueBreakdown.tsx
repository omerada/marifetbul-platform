'use client';

/**
 * ================================================
 * REVENUE BREAKDOWN COMPONENT
 * ================================================
 * Pie chart and category breakdown showing revenue distribution
 * Displays top category and percentage breakdown
 *
 * @component
 * @since Story 1.3 - Wallet Analytics
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { logger } from '@/lib/shared/utils/logger';
import {
  getRevenueBreakdown,
  type RevenueBreakdownResponse,
} from '@/lib/api/dashboard-analytics-api';

export default function RevenueBreakdown() {
  const [data, setData] = useState<RevenueBreakdownResponse | null>(null);
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

        const response = await getRevenueBreakdown(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );

        setData(response);
      } catch (err) {
        logger.error('Failed to load revenue breakdown:', err);
        setError('Gelir dağılımı yüklenemedi');
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
          <CardTitle>Gelir Dağılımı (Kategori)</CardTitle>
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
          <CardTitle>Gelir Dağılımı (Kategori)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground py-8 text-center">
            {error || 'Veri yüklenemedi'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-orange-500',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gelir Dağılımı (Kategori)</CardTitle>

        {/* Top Category Highlight */}
        {data.topCategory && (
          <div className="bg-primary/10 mt-2 rounded-lg p-3">
            <p className="text-muted-foreground text-sm">
              En Çok Kazandıran Kategori
            </p>
            <p className="text-lg font-semibold">{data.topCategory}</p>
            <p className="text-primary text-sm">
              ₺
              {data.byCategory[0]?.amount.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
              })}{' '}
              ({data.topCategoryPercentage.toFixed(1)}%)
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Simple Pie Chart */}
          <div className="flex items-center justify-center">
            <div className="relative h-48 w-48">
              <svg viewBox="0 0 100 100" className="-rotate-90 transform">
                {data.byCategory.length > 0 ? (
                  (() => {
                    let currentAngle = 0;
                    return data.byCategory.map((item, index) => {
                      const percentage = item.percentage;
                      const angle = (percentage / 100) * 360;
                      const startAngle = currentAngle;
                      currentAngle += angle;

                      // Convert to radians
                      const startRad = (startAngle * Math.PI) / 180;
                      const endRad = (currentAngle * Math.PI) / 180;

                      // Calculate arc path
                      const x1 = 50 + 45 * Math.cos(startRad);
                      const y1 = 50 + 45 * Math.sin(startRad);
                      const x2 = 50 + 45 * Math.cos(endRad);
                      const y2 = 50 + 45 * Math.sin(endRad);

                      const largeArc = angle > 180 ? 1 : 0;

                      return (
                        <path
                          key={index}
                          d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          className={colors[index % colors.length].replace(
                            'bg-',
                            'fill-'
                          )}
                          opacity={0.9}
                        />
                      );
                    });
                  })()
                ) : (
                  <circle cx="50" cy="50" r="45" className="fill-gray-200" />
                )}

                {/* Center hole for donut effect */}
                <circle cx="50" cy="50" r="25" className="fill-background" />
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold">
                  ₺
                  {data.totalRevenue.toLocaleString('tr-TR', {
                    minimumFractionDigits: 0,
                  })}
                </p>
                <p className="text-muted-foreground text-xs">Toplam</p>
              </div>
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-3">
            {data.byCategory.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Henüz gelir verisi yok
              </p>
            ) : (
              data.byCategory.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  {/* Color indicator */}
                  <div
                    className={`h-4 w-4 rounded ${colors[index % colors.length]}`}
                  />

                  {/* Category info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">
                        {item.category}
                      </p>
                      <p className="text-primary text-sm font-semibold">
                        {item.percentage.toFixed(1)}%
                      </p>
                    </div>

                    <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
                      <span>
                        ₺
                        {item.amount.toLocaleString('tr-TR', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <span>{item.orderCount} sipariş</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bar Chart Alternative */}
        {data.byCategory.length > 0 && (
          <div className="mt-6 border-t pt-6">
            <p className="mb-3 text-sm font-medium">Kategori Karşılaştırması</p>
            <div className="space-y-2">
              {data.byCategory.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate">{item.category}</span>
                    <span className="font-medium">
                      ₺
                      {item.amount.toLocaleString('tr-TR', {
                        minimumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full ${colors[index % colors.length]}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
