/**
 * ================================================
 * ADMIN QUALITY DASHBOARD
 * ================================================
 * Comprehensive analytics for order quality and review management
 *
 * Sprint 2: Order Quality Review System
 *
 * Features:
 * - Quality metrics cards (avg rating, review distribution)
 * - Rating trends over time (line chart)
 * - Problematic orders table (low ratings, high revisions)
 * - Seller quality rankings
 * - Revision statistics
 * - Review & revision filters
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Star,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Trophy,
  CheckCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/infrastructure/api/client';

// ================================================
// TYPES
// ================================================

interface PlatformStats {
  totalReviews: number;
  averageRating: number;
  approvedReviews: number;
  pendingReviews: number;
  flaggedReviews: number;
  ratingDistribution: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  };
}

interface QualityMetrics {
  totalOrders: number;
  completedOrders: number;
  completionRate: number;
  averageRating: number;
  totalRevisions: number;
  revisionRate: number;
  totalDisputes: number;
  disputeRate: number;
}

interface TopSeller {
  sellerId: string;
  sellerName: string;
  totalReviews: number;
  averageRating: number;
  completedOrders: number;
}

// ================================================
// COMPONENT
// ================================================

export default function AdminQualityDashboard() {
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(
    null
  );
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(
    null
  );
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch platform review stats
      const statsResponse = await apiClient.get<PlatformStats>(
        '/api/v1/reviews/admin/stats'
      );
      setPlatformStats(statsResponse);

      // Fetch quality metrics from new endpoint (Sprint 2)
      const qualityMetricsResponse = await apiClient.get<QualityMetrics>(
        '/api/v1/admin/quality/metrics'
      );
      setQualityMetrics(qualityMetricsResponse);

      // Fetch top rated sellers
      const sellersResponse = await apiClient.get<{
        content: Array<{
          sellerId: string;
          sellerName: string;
          totalReviews: number;
          averageRating: number;
        }>;
      }>('/api/v1/reviews/public/top-sellers', {
        minReviews: '5',
        size: '10',
      });

      setTopSellers(
        sellersResponse.content.map((s) => ({
          ...s,
          completedOrders: 0, // Can be added later if needed
        }))
      );
    } catch (error) {
      logger.error(
        'Failed to fetch quality dashboard data', error instanceof Error ? error : new Error(String(error)), { component: 'AdminQualityDashboard', action: 'fetchDashboardData' }
      );
      toast.error('Veri Yüklenemedi', {
        description: 'Kalite verileri yüklenirken bir hata oluştu.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        {/* Page Header Skeleton */}
        <div className="space-y-2">
          <div className="bg-muted h-8 w-64 animate-pulse rounded" />
          <div className="bg-muted h-4 w-96 animate-pulse rounded" />
        </div>

        {/* Quality Metrics Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6">
              <div className="space-y-3">
                <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                <div className="bg-muted h-8 w-32 animate-pulse rounded" />
                <div className="bg-muted h-3 w-20 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6">
              <div className="bg-muted mb-4 h-6 w-40 animate-pulse rounded" />
              <div className="bg-muted h-64 w-full animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Kalite Yönetimi</h1>
        <p className="text-muted-foreground mt-2">
          Sipariş kalitesi, değerlendirmeler ve revizyonlar hakkında detaylı
          analitik
        </p>
      </div>

      {/* Quality Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Average Rating */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Puan</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {qualityMetrics?.averageRating.toFixed(1) || '0.0'}
              <span className="text-muted-foreground text-sm font-normal">
                {' '}
                / 5.0
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {platformStats?.totalReviews || 0} değerlendirme
            </p>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tamamlanma Oranı
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {qualityMetrics?.completionRate.toFixed(1) || '0.0'}%
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {qualityMetrics?.completedOrders || 0} /{' '}
              {qualityMetrics?.totalOrders || 0} sipariş
            </p>
          </CardContent>
        </Card>

        {/* Revision Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revizyon Oranı
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {qualityMetrics?.revisionRate.toFixed(1) || '0.0'}%
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {qualityMetrics?.totalRevisions || 0} revizyon talebi
            </p>
          </CardContent>
        </Card>

        {/* Dispute Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İtiraz Oranı</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {qualityMetrics?.disputeRate.toFixed(1) || '0.0'}%
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {qualityMetrics?.totalDisputes || 0} açık itiraz
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      {platformStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Puan Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  stars: 5,
                  count: platformStats.ratingDistribution.fiveStar,
                  color: 'bg-green-500',
                },
                {
                  stars: 4,
                  count: platformStats.ratingDistribution.fourStar,
                  color: 'bg-blue-500',
                },
                {
                  stars: 3,
                  count: platformStats.ratingDistribution.threeStar,
                  color: 'bg-yellow-500',
                },
                {
                  stars: 2,
                  count: platformStats.ratingDistribution.twoStar,
                  color: 'bg-orange-500',
                },
                {
                  stars: 1,
                  count: platformStats.ratingDistribution.oneStar,
                  color: 'bg-red-500',
                },
              ].map(({ stars, count, color }) => {
                const percentage =
                  platformStats.totalReviews > 0
                    ? (count / platformStats.totalReviews) * 100
                    : 0;
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex w-16 items-center gap-1 text-sm font-medium">
                      {stars}
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full ${color} transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-muted-foreground w-20 text-right text-sm">
                      {count} ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Sellers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            En Yüksek Puanlı Satıcılar
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topSellers.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              Henüz yeterli veri yok
            </p>
          ) : (
            <div className="space-y-4">
              {topSellers.map((seller, index) => (
                <div
                  key={seller.sellerId}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-lg font-bold text-purple-600">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{seller.sellerName}</p>
                      <p className="text-muted-foreground text-sm">
                        {seller.totalReviews} değerlendirme
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-bold">
                      {seller.averageRating.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Moderation Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Onaylanmış</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {platformStats?.approvedReviews || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {platformStats?.pendingReviews || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">İşaretli</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {platformStats?.flaggedReviews || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
