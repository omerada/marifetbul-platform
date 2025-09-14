'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  BarChart3,
  TrendingUp,
  Search,
  Clock,
  Target,
  Filter,
  Eye,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchAnalytics {
  totalSearches: number;
  averageResultsPerSearch: number;
  topSearchTerms: Array<{ term: string; count: number }>;
  popularFilters: Array<{ filter: string; usage: number }>;
  conversionRate: number;
  searchTrends: Array<{ date: string; searches: number }>;
  performanceMetrics: {
    averageSearchTime: number;
    errorRate: number;
    successRate: number;
  };
}

interface SearchAnalyticsDashboardProps {
  className?: string;
  refreshInterval?: number;
  showTrends?: boolean;
  showPerformance?: boolean;
  showTopTerms?: boolean;
  showFilters?: boolean;
}

export function SearchAnalyticsDashboard({
  className,
  refreshInterval = 30000,
  showTrends = true,
  showPerformance = true,
  showTopTerms = true,
  showFilters = true,
}: SearchAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch analytics data
  const fetchAnalytics = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await fetch('/api/search/analytics');
      const data = await response.json();
      setAnalytics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch search analytics:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load and auto-refresh
  useEffect(() => {
    fetchAnalytics();

    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchAnalytics(true);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  if (isLoading && !analytics) {
    return (
      <div className={cn('search-analytics-dashboard', className)}>
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-3/4 rounded bg-gray-200"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return (num * 100).toFixed(1) + '%';
  };

  return (
    <div className={cn('search-analytics-dashboard space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Arama Analitikleri</h2>
          {lastUpdated && (
            <p className="text-sm text-gray-600">
              Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchAnalytics(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
          />
          Yenile
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Searches */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Arama</CardTitle>
            <Search className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analytics.totalSearches)}
            </div>
            <p className="text-muted-foreground text-xs">Bu ay toplam</p>
          </CardContent>
        </Card>

        {/* Average Results */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ortalama Sonuç
            </CardTitle>
            <BarChart3 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageResultsPerSearch.toFixed(1)}
            </div>
            <p className="text-muted-foreground text-xs">Arama başına</p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dönüşüm Oranı</CardTitle>
            <Target className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(analytics.conversionRate)}
            </div>
            <p className="text-muted-foreground text-xs">İletişim kuranlar</p>
          </CardContent>
        </Card>

        {/* Average Search Time */}
        {showPerformance && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ortalama Süre
              </CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.performanceMetrics.averageSearchTime.toFixed(3)}s
              </div>
              <p className="text-muted-foreground text-xs">Arama süresi</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Metrics */}
      {showPerformance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performans Metrikleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {formatPercentage(analytics.performanceMetrics.successRate)}
                </div>
                <p className="text-sm text-gray-600">Başarı Oranı</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-red-600">
                  {formatPercentage(analytics.performanceMetrics.errorRate)}
                </div>
                <p className="text-sm text-gray-600">Hata Oranı</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {analytics.performanceMetrics.averageSearchTime.toFixed(3)}s
                </div>
                <p className="text-sm text-gray-600">Ortalama Yanıt Süresi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Search Terms */}
        {showTopTerms && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Popüler Arama Terimleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topSearchTerms.map((term, index) => (
                  <div
                    key={term.term}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{term.term}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {formatNumber(term.count)}
                      </span>
                      <div className="h-2 w-20 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{
                            width: `${(term.count / analytics.topSearchTerms[0].count) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Popular Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Popüler Filtreler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.popularFilters.map((filter, index) => (
                  <div
                    key={filter.filter}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{filter.filter}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {filter.usage}%
                      </span>
                      <div className="h-2 w-20 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${filter.usage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search Trends */}
      {showTrends && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Arama Trendleri (Son 30 Gün)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Tarih</span>
                <span>Arama Sayısı</span>
              </div>
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {analytics.searchTrends.slice(-7).map((trend) => {
                  const maxSearches = Math.max(
                    ...analytics.searchTrends.map((t) => t.searches)
                  );
                  const percentage = (trend.searches / maxSearches) * 100;

                  return (
                    <div
                      key={trend.date}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="font-mono text-sm">
                        {new Date(trend.date).toLocaleDateString('tr-TR', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <div className="ml-4 flex flex-1 items-center gap-2">
                        <div className="h-4 flex-1 rounded-full bg-gray-200">
                          <div
                            className="h-4 rounded-full bg-blue-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-sm">
                          {formatNumber(trend.searches)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
            <span>Canlı veri akışı aktif</span>
            <span>•</span>
            <span>
              Her {Math.round(refreshInterval / 1000)} saniyede güncellenir
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
