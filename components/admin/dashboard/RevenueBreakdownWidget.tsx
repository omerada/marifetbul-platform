'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Wallet,
  RefreshCw,
} from 'lucide-react';
import type { RevenueBreakdown } from '@/types/analytics';
import { logger } from '@/lib/shared/utils/logger';

interface RevenueBreakdownWidgetProps {
  period?: 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
}

export function RevenueBreakdownWidget({
  period = 'month',
  startDate,
  endDate,
}: RevenueBreakdownWidgetProps) {
  const [data, setData] = useState<RevenueBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBreakdown = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authHeader = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1];

      let url = `/api/v1/admin/analytics/revenue/breakdown`;

      if (period === 'today') {
        url += '/today';
      } else if (period === 'week') {
        url += '/week';
      } else if (period === 'month') {
        url += '/month';
      } else if (period === 'custom' && startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url, {
        headers: {
          ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Gelir analizi alınamadı');
      }

      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      logger.error('Revenue breakdown fetch error:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBreakdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, startDate, endDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT':
        return 'text-green-600 bg-green-50';
      case 'GOOD':
        return 'text-blue-600 bg-blue-50';
      case 'FAIR':
        return 'text-yellow-600 bg-yellow-50';
      case 'POOR':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'INCREASING':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'DECREASING':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gelir Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gelir Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="mb-2 h-12 w-12 text-red-400" />
            <p className="text-red-600">{error || 'Veri yüklenemedi'}</p>
            <Button onClick={fetchBreakdown} className="mt-4">
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Revenue Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Brüt Gelir</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.grossRevenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center space-x-2">
              {getTrendIcon(data.growth.trend)}
              <span
                className={`text-sm font-medium ${
                  data.growth.growthRate >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {formatPercentage(data.growth.growthRate)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Gelir</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.netRevenue)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                İade Sonrası: {formatCurrency(data.refunds.netAfterRefunds)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Platform Komisyonu
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.platformFee)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                Oran: {data.platformFees.feePercentage.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Satıcı Kazancı
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.sellerEarnings)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                {data.sellerStats.activeSellers} Aktif Satıcı
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods & Orders */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ödeme Yöntemleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Kredi Kartı</p>
                    <p className="text-sm text-gray-500">
                      {data.paymentMethods.creditCardCount} İşlem
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {formatCurrency(data.paymentMethods.creditCardRevenue)}
                  </p>
                  <p className="text-sm text-gray-500">
                    %{data.paymentMethods.creditCardPercentage.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="h-px bg-gray-200" />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wallet className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Cüzdan</p>
                    <p className="text-sm text-gray-500">
                      {data.paymentMethods.walletCount} İşlem
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {formatCurrency(data.paymentMethods.walletRevenue)}
                  </p>
                  <p className="text-sm text-gray-500">
                    %{data.paymentMethods.walletPercentage.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">Toplam</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(data.paymentMethods.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sipariş İstatistikleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Toplam Sipariş</p>
                <p className="text-lg font-bold text-gray-900">
                  {data.orders.totalOrders.toLocaleString('tr-TR')}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Başarılı Sipariş</p>
                <p className="text-lg font-semibold text-green-600">
                  {data.orders.successfulOrders.toLocaleString('tr-TR')}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">İade Edilen</p>
                <p className="text-lg font-semibold text-red-600">
                  {data.orders.refundedOrders.toLocaleString('tr-TR')}
                </p>
              </div>

              <div className="h-px bg-gray-200" />

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Ortalama Sipariş Değeri</p>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(data.orders.averageOrderValue)}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">İade Oranı</p>
                <Badge
                  variant={
                    data.refunds.refundRate > 5 ? 'destructive' : 'success'
                  }
                >
                  {data.refunds.refundRate.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sağlık Durumu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <Badge className={getHealthColor(data.health.overallStatus)}>
              {data.health.overallStatus === 'EXCELLENT' && 'Mükemmel'}
              {data.health.overallStatus === 'GOOD' && 'İyi'}
              {data.health.overallStatus === 'FAIR' && 'Orta'}
              {data.health.overallStatus === 'POOR' && 'Zayıf'}
            </Badge>
            {data.health.isHealthy ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="mb-1 text-sm text-gray-600">İade Oranı Sağlığı</p>
              <div className="flex items-center space-x-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-green-600"
                    style={{ width: `${data.health.refundRateHealth}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {data.health.refundRateHealth.toFixed(0)}
                </span>
              </div>
            </div>

            <div>
              <p className="mb-1 text-sm text-gray-600">Büyüme Sağlığı</p>
              <div className="flex items-center space-x-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${data.health.growthHealth}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {data.health.growthHealth.toFixed(0)}
                </span>
              </div>
            </div>

            <div>
              <p className="mb-1 text-sm text-gray-600">Çeşitlilik Sağlığı</p>
              <div className="flex items-center space-x-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-purple-600"
                    style={{
                      width: `${data.health.diversificationHealth}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {data.health.diversificationHealth.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
