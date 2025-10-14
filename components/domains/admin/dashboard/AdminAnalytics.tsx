'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/shared/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingCart,
  Eye,
  Download,
  RefreshCw,
} from 'lucide-react';

interface AnalyticsData {
  userAnalytics: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    churnRate: number;
    growthRate: number;
    usersByType: {
      freelancer: number;
      employer: number;
    };
    usersByStatus: {
      active: number;
      suspended: number;
      banned: number;
      pending: number;
    };
  };
  revenueAnalytics: {
    totalRevenue: number;
    monthlyRevenue: number;
    growth: number;
    averageOrderValue: number;
    topCategories: Array<{
      category: string;
      revenue: number;
      percentage: number;
    }>;
  };
}

export function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30d');

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Production note: Auth token retrieved from cookie (auth_token).
      const authHeader = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1];

      const [userResponse, revenueResponse] = await Promise.all([
        fetch(`/api/v1/admin/analytics/users?period=${period}`, {
          headers: {
            ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }),
        fetch(`/api/v1/admin/analytics/revenue?period=${period}`, {
          headers: {
            ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }),
      ]);

      if (!userResponse.ok || !revenueResponse.ok) {
        throw new Error('Analytics data alınamadı');
      }

      const [userData, revenueData] = await Promise.all([
        userResponse.json(),
        revenueResponse.json(),
      ]);

      setAnalytics({
        userAnalytics: userData.data,
        revenueAnalytics: revenueData.data,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setIsLoading(false);
    }
  }, [period]); // Only depend on period, not isLoading to avoid circular dependency

  // Separate useEffect to avoid circular dependency
  useEffect(() => {
    let mounted = true;

    const loadAnalytics = async () => {
      if (!mounted) return;

      setIsLoading(true);
      setError(null);

      try {
        // Production note: Auth token retrieved from cookie (auth_token).
        const authHeader = document.cookie
          .split('; ')
          .find((row) => row.startsWith('auth_token='))
          ?.split('=')[1];

        const [userResponse, revenueResponse] = await Promise.all([
          fetch(`/api/v1/admin/analytics/users?period=${period}`, {
            headers: {
              ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }),
          fetch(`/api/v1/admin/analytics/revenue?period=${period}`, {
            headers: {
              ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }),
        ]);

        if (!userResponse.ok || !revenueResponse.ok) {
          throw new Error('Analytics data alınamadı');
        }

        const [userData, revenueData] = await Promise.all([
          userResponse.json(),
          revenueResponse.json(),
        ]);

        logger.debug('📊 User Analytics Data:', userData);
        logger.debug('💰 Revenue Analytics Data:', revenueData);

        // Also log to Next.js server console
        if (typeof window === 'undefined') {
          logger.debug('🖥️ Server-side User Analytics Data:', userData);
          logger.debug('🖥️ Server-side Revenue Analytics Data:', revenueData);
        }

        if (
          mounted &&
          userData?.success &&
          userData?.data &&
          revenueData?.success &&
          revenueData?.data
        ) {
          logger.debug('✅ Setting analytics data:', {
            userAnalytics: userData.data,
            revenueAnalytics: revenueData.data,
          });
          setAnalytics({
            userAnalytics: userData.data,
            revenueAnalytics: revenueData.data,
          });
        } else {
          logger.warn('❌ Data validation failed:', {
            mounted,
            userDataSuccess: userData?.success,
            userDataExists: !!userData?.data,
            userDataStructure: userData?.data
              ? Object.keys(userData.data)
              : 'null',
            revenueDataSuccess: revenueData?.success,
            revenueDataExists: !!revenueData?.data,
            revenueDataStructure: revenueData?.data
              ? Object.keys(revenueData.data)
              : 'null',
          });
          throw new Error('Data validation failed - check console for details');
        }
      } catch (err) {
        if (mounted) {
          console.error('Analytics fetch error:', err);
          setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      mounted = false;
    };
  }, [period]);

  if (isLoading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg bg-gray-200"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <Button onClick={fetchAnalytics} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Yeniden Dene
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center text-red-800">Error: {error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics || !analytics.userAnalytics || !analytics.revenueAnalytics) {
    return null;
  }

  const { userAnalytics, revenueAnalytics } = analytics;

  logger.debug('🔍 Analytics validation check:', {
    userAnalytics: !!userAnalytics,
    usersByType: !!userAnalytics?.usersByType,
    usersByStatus: !!userAnalytics?.usersByStatus,
    revenueAnalytics: !!revenueAnalytics,
    topCategories: !!revenueAnalytics?.topCategories,
  });

  // Additional safety checks - more lenient
  if (
    !userAnalytics ||
    typeof userAnalytics !== 'object' ||
    !revenueAnalytics ||
    typeof revenueAnalytics !== 'object'
  ) {
    logger.warn('❌ Basic analytics validation failed');
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center text-red-800">
              Analytics verileri henüz yüklenemedi. Lütfen sayfayı yenileyin.
              <br />
              <small>Debug: Basic data structure validation failed</small>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Platform performansı ve kullanıcı analitikleri
          </p>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="7d">Son 7 Gün</option>
            <option value="30d">Son 30 Gün</option>
            <option value="90d">Son 90 Gün</option>
            <option value="1y">Son 1 Yıl</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={fetchAnalytics}
            disabled={isLoading}
            variant="primary"
            size="sm"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Yenile
          </Button>
        </div>
      </div>

      {/* User Analytics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Toplam Kullanıcı
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {new Intl.NumberFormat('tr-TR').format(
                    userAnalytics?.totalUsers || 0
                  )}
                </p>
                <div className="mt-2 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="ml-1 text-sm font-medium text-green-600">
                    +{userAnalytics?.growthRate || '0'}%
                  </span>
                  <span className="ml-1 text-sm text-gray-500">
                    son{' '}
                    {period === '7d'
                      ? '7 gün'
                      : period === '30d'
                        ? '30 gün'
                        : period === '90d'
                          ? '90 gün'
                          : 'yıl'}
                  </span>
                </div>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  Aktif Kullanıcı
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {new Intl.NumberFormat('tr-TR').format(
                    userAnalytics?.activeUsers || 0
                  )}
                </p>
                <div className="mt-2 flex items-center">
                  <span className="text-sm text-gray-500">
                    {Math.round(
                      userAnalytics?.activeUsers && userAnalytics?.totalUsers
                        ? (userAnalytics.activeUsers /
                            userAnalytics.totalUsers) *
                            100
                        : 0
                    )}
                    % aktif
                  </span>
                </div>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  Toplam Gelir
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  ₺
                  {new Intl.NumberFormat('tr-TR').format(
                    revenueAnalytics?.totalRevenue || 0
                  )}
                </p>
                <div className="mt-2 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="ml-1 text-sm font-medium text-green-600">
                    +{revenueAnalytics?.growth || '0'}%
                  </span>
                </div>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">
                  Ortalama Sipariş
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  ₺
                  {new Intl.NumberFormat('tr-TR').format(
                    revenueAnalytics?.averageOrderValue || 0
                  )}
                </p>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">per order</span>
                </div>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Kullanıcı Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* User Type Distribution */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-gray-700">
                  Kullanıcı Tipi
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Freelancer</span>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-24 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{
                            width: `${
                              userAnalytics.usersByType?.freelancer &&
                              userAnalytics.totalUsers
                                ? (userAnalytics.usersByType.freelancer /
                                    userAnalytics.totalUsers) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {new Intl.NumberFormat('tr-TR').format(
                          userAnalytics.usersByType?.freelancer || 0
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Employer</span>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-24 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{
                            width: `${
                              userAnalytics.usersByType?.employer &&
                              userAnalytics.totalUsers
                                ? (userAnalytics.usersByType.employer /
                                    userAnalytics.totalUsers) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {new Intl.NumberFormat('tr-TR').format(
                          userAnalytics.usersByType?.employer || 0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Status Distribution */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-gray-700">
                  Hesap Durumu
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {new Intl.NumberFormat('tr-TR').format(
                        userAnalytics.usersByStatus?.active || 0
                      )}
                    </div>
                    <div className="text-xs text-gray-500">Aktif</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-600">
                      {new Intl.NumberFormat('tr-TR').format(
                        userAnalytics.usersByStatus?.pending || 0
                      )}
                    </div>
                    <div className="text-xs text-gray-500">Beklemede</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">
                      {new Intl.NumberFormat('tr-TR').format(
                        userAnalytics.usersByStatus?.suspended || 0
                      )}
                    </div>
                    <div className="text-xs text-gray-500">Askıya Alınmış</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {new Intl.NumberFormat('tr-TR').format(
                        userAnalytics.usersByStatus?.banned || 0
                      )}
                    </div>
                    <div className="text-xs text-gray-500">Yasaklı</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>En Popüler Kategoriler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(revenueAnalytics?.topCategories || []).map(
                (category, index) => (
                  <div
                    key={category.category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {category?.category || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ₺
                          {new Intl.NumberFormat('tr-TR').format(
                            category?.revenue || 0
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {category?.percentage || 0}%
                    </Badge>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performans Metrikleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {userAnalytics.churnRate}%
              </div>
              <div className="text-sm text-gray-500">Churn Rate</div>
              <div className="mt-1 flex items-center justify-center">
                {userAnalytics.churnRate < 5 ? (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {userAnalytics.growthRate}%
              </div>
              <div className="text-sm text-gray-500">Büyüme Oranı</div>
              <div className="mt-1 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                ₺
                {new Intl.NumberFormat('tr-TR').format(
                  revenueAnalytics?.monthlyRevenue || 0
                )}
              </div>
              <div className="text-sm text-gray-500">Aylık Gelir</div>
              <div className="mt-1">
                <Badge
                  variant="success"
                  className="bg-green-100 text-green-800"
                >
                  +{revenueAnalytics?.growth || '0'}%
                </Badge>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(
                  userAnalytics?.activeUsers && userAnalytics?.totalUsers
                    ? (userAnalytics.activeUsers / userAnalytics.totalUsers) *
                        100
                    : 0
                )}
                %
              </div>
              <div className="text-sm text-gray-500">Aktivite Oranı</div>
              <div className="mt-1">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  Yüksek
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminAnalytics;
