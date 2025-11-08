'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  BarChart3,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/shared/formatters';
import type { CategorySummary } from '@/types/analytics';
import logger from '@/lib/infrastructure/monitoring/logger';

interface CategoryPerformanceSummaryProps {
  startDate?: string;
  endDate?: string;
}

export function CategoryPerformanceSummary({
  startDate,
  endDate,
}: CategoryPerformanceSummaryProps) {
  const [summary, setSummary] = useState<CategorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authHeader = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1];

      // Calculate default date range if not provided
      const end = endDate || new Date().toISOString().split('T')[0];
      const start =
        startDate ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];

      const response = await fetch(
        `/api/v1/admin/analytics/categories/summary?startDate=${start}&endDate=${end}`,
        {
          headers: {
            ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Kategori özeti alınamadı');
      }

      const result = await response.json();
      setSummary(result.data || result);
    } catch (err) {
      logger.error(
        'Category summary fetch error:',
        err instanceof Error ? err : new Error(String(err))
      );
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const calculateTotals = () => {
    return summary.reduce(
      (acc, cat) => ({
        totalOrders: acc.totalOrders + cat.totalOrders,
        totalRevenue: acc.totalRevenue + cat.totalRevenue,
        activePackages: acc.activePackages + cat.activePackages,
      }),
      { totalOrders: 0, totalRevenue: 0, activePackages: 0 }
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Kategori Performans Özeti</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || summary.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Kategori Performans Özeti</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="mb-2 h-12 w-12 text-red-400" />
            <p className="mb-4 text-red-600">{error || 'Veri bulunamadı'}</p>
            <Button onClick={fetchSummary}>Tekrar Dene</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totals = calculateTotals();
  const avgOrderValue =
    totals.totalOrders > 0 ? totals.totalRevenue / totals.totalOrders : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">
                Toplam Kategori
              </p>
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary.length}</p>
            <p className="mt-1 text-xs text-gray-500">
              {totals.activePackages} Aktif Paket
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">
                Toplam Sipariş
              </p>
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {totals.totalOrders.toLocaleString('tr-TR')}
            </p>
            <p className="mt-1 text-xs text-gray-500">Tüm kategoriler</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(totals.totalRevenue)}
            </p>
            <p className="mt-1 text-xs text-gray-500">Tüm kategoriler</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Ort. Sipariş</p>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(avgOrderValue)}
            </p>
            <p className="mt-1 text-xs text-gray-500">AOV</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori Detayları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Paket
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Sipariş
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Gelir
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    AOV
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Katkı
                  </th>
                </tr>
              </thead>
              <tbody>
                {summary.map((category) => {
                  const contribution =
                    totals.totalRevenue > 0
                      ? (category.totalRevenue / totals.totalRevenue) * 100
                      : 0;

                  return (
                    <tr
                      key={category.categoryId}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {category.categoryName}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700">
                        {category.activePackages.toLocaleString('tr-TR')}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {category.totalOrders.toLocaleString('tr-TR')}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(category.totalRevenue)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700">
                        {formatCurrency(category.averageOrderValue)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant="secondary">
                          {contribution.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-3 text-gray-900">Toplam</td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {totals.activePackages.toLocaleString('tr-TR')}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {totals.totalOrders.toLocaleString('tr-TR')}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatCurrency(totals.totalRevenue)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatCurrency(avgOrderValue)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
