/**
 * ================================================
 * ADMIN REVIEW STATS WIDGET
 * ================================================
 * Comprehensive statistics widget for admin dashboard
 * Shows review metrics, trends, and charts
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint - Production Ready
 */

'use client';

import { useEffect, useState } from 'react';
import {
  Star,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Flag,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import UnifiedSkeleton from '@/components/ui/UnifiedLoadingSystem';
import { reviewApi } from '@/lib/api/review';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { PlatformReviewStats } from '@/types/business/review';

interface AdminReviewStatsWidgetProps {
  className?: string;
  refreshInterval?: number; // milliseconds
}

export function AdminReviewStatsWidget({
  className,
  refreshInterval = 30000, // 30 seconds
}: AdminReviewStatsWidgetProps) {
  const [stats, setStats] = useState<PlatformReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stats from backend
  const fetchStats = async () => {
    try {
      setError(null);
      const platformStats = await reviewApi.getPlatformStats();
      setStats(platformStats);
    } catch (err) {
      logger.error('Error fetching review stats:', err instanceof Error ? err : new Error(String(err)));
      setError('İstatistikler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle>Değerlendirme İstatistikleri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <UnifiedSkeleton variant="skeleton" className="h-4 w-1/3" />
                <UnifiedSkeleton variant="skeleton" className="h-8 w-1/2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle>Değerlendirme İstatistikleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error || 'Veri yüklenemedi'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatTrend = (value: number) => {
    const isPositive = value >= 0;
    return {
      value: Math.abs(value),
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      bgColor: isPositive ? 'bg-green-50' : 'bg-red-50',
    };
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Reviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Değerlendirme
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalReviews.toLocaleString('tr-TR')}
            </div>
            {stats.trend && (
              <div className="mt-1 flex items-center gap-1">
                {(() => {
                  const trend = formatTrend(stats.trend.total);
                  const Icon = trend.icon;
                  return (
                    <>
                      <Icon className={`h-3 w-3 ${trend.color}`} />
                      <span className={`text-xs ${trend.color}`}>
                        %{trend.value.toFixed(1)} (30 gün)
                      </span>
                    </>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Average Rating */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Puan</CardTitle>
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating.toFixed(1)}
              <span className="ml-1 text-sm font-normal text-gray-500">
                / 5.0
              </span>
            </div>
            {stats.trend && (
              <div className="mt-1 flex items-center gap-1">
                {(() => {
                  const trend = formatTrend(stats.trend.rating);
                  const Icon = trend.icon;
                  return (
                    <>
                      <Icon className={`h-3 w-3 ${trend.color}`} />
                      <span className={`text-xs ${trend.color}`}>
                        %{trend.value.toFixed(1)} (30 gün)
                      </span>
                    </>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCount || 0}</div>
            <p className="mt-1 text-xs text-gray-500">Onay bekliyor</p>
          </CardContent>
        </Card>

        {/* Flagged Reviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Şikayetli</CardTitle>
            <Flag className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.flaggedCount || 0}</div>
            <p className="mt-1 text-xs text-gray-500">İnceleme gerekiyor</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detaylı İstatistikler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Status Distribution */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                Durum Dağılımı
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Onaylı</span>
                  </div>
                  <Badge variant="default">{stats.approvedCount || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Bekleyen</span>
                  </div>
                  <Badge variant="outline">{stats.pendingCount || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Reddedilen</span>
                  </div>
                  <Badge variant="destructive">
                    {stats.rejectedCount || 0}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                Puan Dağılımı
              </h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.ratingDistribution?.[rating] || 0;
                  const percentage =
                    stats.totalReviews > 0
                      ? Math.round((count / stats.totalReviews) * 100)
                      : 0;

                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <div className="flex w-12 items-center gap-1">
                        <span className="text-sm font-medium">{rating}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-yellow-400 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-xs text-gray-600">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Performans</h4>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Yanıt Oranı</span>
                    <span className="text-sm font-semibold">
                      {stats.responseRate?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${stats.responseRate || 0}%` }}
                    />
                  </div>
                  {stats.trend && (
                    <div className="mt-1 flex items-center gap-1">
                      {(() => {
                        const trend = formatTrend(stats.trend.responseRate);
                        const Icon = trend.icon;
                        return (
                          <>
                            <Icon className={`h-3 w-3 ${trend.color}`} />
                            <span className={`text-xs ${trend.color}`}>
                              %{trend.value.toFixed(1)}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Ort. Yanıt Süresi
                    </span>
                    <span className="text-sm font-semibold">
                      {stats.avgResponseTime?.toFixed(1) || 0} saat
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Kategori Ortalamaları
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">İletişim</span>
                      <span className="font-medium">
                        {stats.communicationAvg.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Kalite</span>
                      <span className="font-medium">
                        {stats.qualityAvg.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Teslimat</span>
                      <span className="font-medium">
                        {stats.deliveryAvg.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
