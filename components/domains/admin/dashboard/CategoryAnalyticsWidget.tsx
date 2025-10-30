'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  Package,
  ShoppingCart,
  DollarSign,
  RefreshCw,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import type { CategorySummary, CategoryRevenue } from '@/types/analytics';
import { logger } from '@/lib/shared/utils/logger';

interface CategoryAnalyticsWidgetProps {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export function CategoryAnalyticsWidget({
  startDate,
  endDate,
  limit = 10,
}: CategoryAnalyticsWidgetProps) {
  const [topByRevenue, setTopByRevenue] = useState<CategoryRevenue[]>([]);
  const [topByOrders, setTopByOrders] = useState<CategorySummary[]>([]);
  const [selectedView, setSelectedView] = useState<'revenue' | 'orders'>(
    'revenue'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryAnalytics = async () => {
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

      const [revenueResponse, ordersResponse] = await Promise.all([
        fetch(
          `/api/v1/admin/analytics/categories/top-revenue?startDate=${start}&endDate=${end}&limit=${limit}`,
          {
            headers: {
              ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        ),
        fetch(
          `/api/v1/admin/analytics/categories/top-orders?startDate=${start}&endDate=${end}&limit=${limit}`,
          {
            headers: {
              ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        ),
      ]);

      if (!revenueResponse.ok || !ordersResponse.ok) {
        throw new Error('Kategori analizi alınamadı');
      }

      const revenueData = await revenueResponse.json();
      const ordersData = await ordersResponse.json();

      setTopByRevenue(revenueData.data || revenueData);
      setTopByOrders(ordersData.data || ordersData);
    } catch (err) {
      logger.error('Category analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, limit]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getProgressBarColor = (index: number) => {
    if (index === 0) return 'bg-purple-600';
    if (index === 1) return 'bg-blue-600';
    if (index === 2) return 'bg-green-600';
    return 'bg-gray-400';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Kategori Analizi</span>
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Kategori Analizi</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="mb-2 h-12 w-12 text-red-400" />
            <p className="mb-4 text-red-600">{error}</p>
            <Button onClick={fetchCategoryAnalytics}>Tekrar Dene</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayData = selectedView === 'revenue' ? topByRevenue : topByOrders;
  const maxValue =
    selectedView === 'revenue'
      ? Math.max(...topByRevenue.map((c) => c.totalRevenue), 1)
      : Math.max(...topByOrders.map((c) => c.totalOrders), 1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>En İyi Performans Gösteren Kategoriler</span>
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant={selectedView === 'revenue' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('revenue')}
            >
              <DollarSign className="mr-1 h-4 w-4" />
              Gelir
            </Button>
            <Button
              variant={selectedView === 'orders' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('orders')}
            >
              <ShoppingCart className="mr-1 h-4 w-4" />
              Sipariş
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayData.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Package className="mx-auto mb-2 h-12 w-12 text-gray-300" />
              <p>Henüz kategori verisi yok</p>
            </div>
          ) : (
            displayData.map((category, index) => {
              const isRevenue = selectedView === 'revenue';
              const value = isRevenue
                ? (category as CategoryRevenue).totalRevenue
                : (category as CategorySummary).totalOrders;
              const percentage = (value / maxValue) * 100;
              const orderCount = isRevenue
                ? (category as CategoryRevenue).orderCount
                : (category as CategorySummary).totalOrders;
              const avgOrderValue = isRevenue
                ? (category as CategoryRevenue).averageOrderValue
                : (category as CategorySummary).averageOrderValue;
              const revenuePercentage = isRevenue
                ? (category as CategoryRevenue).revenuePercentage
                : undefined;

              return (
                <div key={category.categoryId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          index === 0
                            ? 'bg-purple-100 text-purple-600'
                            : index === 1
                              ? 'bg-blue-100 text-blue-600'
                              : index === 2
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span className="text-sm font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {category.categoryName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {orderCount.toLocaleString('tr-TR')} Sipariş
                          {avgOrderValue > 0 && (
                            <> • AOV: {formatCurrency(avgOrderValue)}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {isRevenue
                          ? formatCurrency(value)
                          : value.toLocaleString('tr-TR')}
                      </p>
                      {revenuePercentage !== undefined && (
                        <Badge variant="secondary" className="text-xs">
                          %{formatPercentage(revenuePercentage)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${getProgressBarColor(index)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {displayData.length > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="mb-1 text-sm text-gray-600">Toplam Kategori</p>
                <p className="text-2xl font-bold text-gray-900">
                  {displayData.length}
                </p>
              </div>
              <div className="text-center">
                <p className="mb-1 text-sm text-gray-600">
                  {selectedView === 'revenue'
                    ? 'Toplam Gelir'
                    : 'Toplam Sipariş'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedView === 'revenue'
                    ? formatCurrency(
                        topByRevenue.reduce(
                          (sum, cat) => sum + cat.totalRevenue,
                          0
                        )
                      )
                    : topByOrders
                        .reduce((sum, cat) => sum + cat.totalOrders, 0)
                        .toLocaleString('tr-TR')}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
