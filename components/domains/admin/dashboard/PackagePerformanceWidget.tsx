'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  Package,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  AlertCircle,
  Award,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/shared/formatters';
import type { PackagePerformance } from '@/types/analytics';
import logger from '@/lib/infrastructure/monitoring/logger';

interface PackagePerformanceWidgetProps {
  categoryId?: number;
  limit?: number;
}

export function PackagePerformanceWidget({
  categoryId,
  limit = 10,
}: PackagePerformanceWidgetProps) {
  const [packages, setPackages] = useState<PackagePerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authHeader = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1];

      const url = categoryId
        ? `/api/v1/admin/analytics/packages/performance/category/${categoryId}?limit=${limit}`
        : `/api/v1/admin/analytics/packages/performance/top?limit=${limit}`;

      const response = await fetch(url, {
        headers: {
          ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Paket performans verileri alınamadı');
      }

      const result = await response.json();
      setPackages(result.data || result);
    } catch (err) {
      logger.error(
        'Package performance fetch error:',
        err instanceof Error ? err : new Error(String(err))
      );
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, limit]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'secondary';
    if (score >= 40) return 'warning';
    return 'destructive';
  };

  const getTrendIcon = (growthRate?: number) => {
    if (!growthRate) return null;
    if (growthRate > 5)
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (growthRate < -5)
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>En Yüksek Performanslı Paketler</span>
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

  if (error || packages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>En Yüksek Performanslı Paketler</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="mb-2 h-12 w-12 text-red-400" />
            <p className="mb-4 text-red-600">{error || 'Veri bulunamadı'}</p>
            <Button onClick={fetchPerformance}>Tekrar Dene</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>En Yüksek Performanslı Paketler</span>
          </div>
          <Button onClick={fetchPerformance} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {packages.map((pkg, index) => (
            <div
              key={pkg.packageId}
              className="rounded-lg border p-4 transition-colors hover:bg-gray-50"
            >
              {/* Header */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center space-x-2">
                    {index < 3 && (
                      <Award
                        className={`h-5 w-5 ${
                          index === 0
                            ? 'text-yellow-500'
                            : index === 1
                              ? 'text-gray-400'
                              : 'text-orange-400'
                        }`}
                      />
                    )}
                    <h3 className="font-semibold text-gray-900">
                      {pkg.packageTitle}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Kategori: {pkg.categoryId}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Satıcı: {pkg.sellerId}
                  </p>
                </div>
                <Badge
                  variant={getScoreBadgeVariant(
                    pkg.performance.performanceScore
                  )}
                >
                  {pkg.performance.performanceScore.toFixed(0)}/100
                </Badge>
              </div>

              {/* Stats Grid */}
              <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Sipariş</p>
                    <p className="text-sm font-semibold">
                      {formatNumber(pkg.metrics.orderCount)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">Gelir</p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(pkg.metrics.revenue)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-600">Dönüşüm</p>
                    <p className="text-sm font-semibold">
                      {pkg.rates.conversionRate.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-600">Görüntülenme</p>
                    <p className="text-sm font-semibold">
                      {formatNumber(pkg.metrics.viewCount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="border-t pt-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-gray-600">Performans Detayları</span>
                  {getTrendIcon(pkg.growth.revenueGrowth)}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-gray-600">Görüntülenme Büyüme</p>
                    <div className="flex items-center space-x-1">
                      <div
                        className={`h-2 rounded-full ${getScoreColor(
                          Math.min(100, Math.max(0, pkg.growth.viewGrowth + 50))
                        )}`}
                        style={{
                          width: `${Math.min(100, Math.abs(pkg.growth.viewGrowth))}%`,
                        }}
                      />
                      <span className="text-xs font-medium">
                        {pkg.growth.viewGrowth.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Sipariş Büyüme</p>
                    <div className="flex items-center space-x-1">
                      <div
                        className={`h-2 rounded-full ${getScoreColor(
                          Math.min(
                            100,
                            Math.max(0, pkg.growth.orderGrowth + 50)
                          )
                        )}`}
                        style={{
                          width: `${Math.min(100, Math.abs(pkg.growth.orderGrowth))}%`,
                        }}
                      />
                      <span className="text-xs font-medium">
                        {pkg.growth.orderGrowth.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Gelir Büyüme</p>
                    <div className="flex items-center space-x-1">
                      <div
                        className={`h-2 rounded-full ${getScoreColor(
                          Math.min(
                            100,
                            Math.max(0, pkg.growth.revenueGrowth + 50)
                          )
                        )}`}
                        style={{
                          width: `${Math.min(100, Math.abs(pkg.growth.revenueGrowth))}%`,
                        }}
                      />
                      <span className="text-xs font-medium">
                        {pkg.growth.revenueGrowth.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
