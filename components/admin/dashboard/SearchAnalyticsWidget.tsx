/**
 * ================================================
 * SEARCH ANALYTICS WIDGET COMPONENT
 * ================================================
 * Dashboard widget displaying search analytics metrics
 * Shows: total searches, CTR, conversion rate, top queries
 *
 * Sprint 1: Search Analytics Implementation
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-10-29
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  MousePointerClick,
  ShoppingCart,
  AlertCircle,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import {
  getSearchMetrics,
  getTopQueries,
  getZeroResultQueries,
  type SearchMetrics,
  type TopQueries,
} from '@/lib/api/search-analytics';

// ================================================
// TYPES
// ================================================

export interface SearchAnalyticsWidgetProps {
  /**
   * Number of days to look back for metrics
   * @default 30
   */
  days?: number;

  /**
   * Compact mode for smaller displays
   * @default false
   */
  compact?: boolean;

  /**
   * Auto-refresh interval in milliseconds
   * Set to 0 to disable auto-refresh
   * @default 0
   */
  refreshInterval?: number;
}

interface MetricsState {
  metrics: SearchMetrics | null;
  topQueries: TopQueries | null;
  zeroResultQueries: TopQueries | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// ================================================
// COMPONENT
// ================================================

export function SearchAnalyticsWidget({
  days = 30,
  compact: _compact = false,
  refreshInterval = 0,
}: SearchAnalyticsWidgetProps) {
  const [state, setState] = useState<MetricsState>({
    metrics: null,
    topQueries: null,
    zeroResultQueries: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  // ================================================
  // DATA FETCHING
  // ================================================

  const fetchMetrics = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [metricsData, topQueriesData, zeroResultData] = await Promise.all([
        getSearchMetrics(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        ),
        getTopQueries(5, days),
        getZeroResultQueries(5, days),
      ]);

      setState({
        metrics: metricsData,
        topQueries: topQueriesData,
        zeroResultQueries: zeroResultData,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Failed to load metrics',
      }));
    }
  };

  useEffect(() => {
    fetchMetrics();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, refreshInterval]);

  // ================================================
  // RENDER - Loading State
  // ================================================

  if (state.isLoading && !state.metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 w-24 rounded bg-gray-200"></div>
                <div className="mt-2 h-8 w-32 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ================================================
  // RENDER - Error State
  // ================================================

  if (state.error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            Search Analytics Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{state.error}</p>
          <Button
            onClick={fetchMetrics}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ================================================
  // RENDER - No Data
  // ================================================

  if (!state.metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No search data available</p>
        </CardContent>
      </Card>
    );
  }

  // ================================================
  // HELPER FUNCTIONS
  // ================================================

  const { metrics, topQueries, zeroResultQueries } = state;

  const zeroResultRate =
    metrics.totalSearches > 0
      ? (metrics.zeroResultSearches / metrics.totalSearches) * 100
      : 0;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`;
  };

  // ================================================
  // RENDER - Main Content
  // ================================================

  return (
    <Card>
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Search className="h-5 w-5 text-blue-600" />
          Search Analytics
          <Badge variant="secondary" className="ml-2">
            {days} days
          </Badge>
        </CardTitle>
        <Button
          onClick={fetchMetrics}
          variant="ghost"
          size="sm"
          disabled={state.isLoading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw
            className={`h-4 w-4 ${state.isLoading ? 'animate-spin' : ''}`}
          />
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Total Searches */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Total Searches</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(metrics.totalSearches)}
            </p>
            <p className="text-xs text-gray-400">
              {formatNumber(metrics.uniqueUsers)} unique users
            </p>
          </div>

          {/* Click-Through Rate */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">CTR</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-blue-600">
                {formatPercentage(metrics.clickThroughRate)}
              </p>
              {metrics.clickThroughRate >= 30 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-orange-500" />
              )}
            </div>
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <MousePointerClick className="h-3 w-3" />
              Click-through rate
            </p>
          </div>

          {/* Conversion Rate */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Conversion</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-green-600">
                {formatPercentage(metrics.conversionRate)}
              </p>
              {metrics.conversionRate >= 5 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-orange-500" />
              )}
            </div>
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <ShoppingCart className="h-3 w-3" />
              Search to order
            </p>
          </div>

          {/* Zero Results */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Zero Results</p>
            <div className="flex items-baseline gap-2">
              <p
                className={`text-2xl font-bold ${
                  zeroResultRate > 10 ? 'text-red-600' : 'text-gray-900'
                }`}
              >
                {formatPercentage(zeroResultRate)}
              </p>
              {zeroResultRate > 10 && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="text-xs text-gray-400">
              {formatNumber(metrics.zeroResultSearches)} searches
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Top Queries Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold text-gray-700">Top Search Queries</h3>
          </div>

          {topQueries && Object.keys(topQueries).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(topQueries)
                .slice(0, 5)
                .map(([query, count], index) => (
                  <div
                    key={query}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {query}
                      </span>
                    </div>
                    <Badge variant="secondary">{formatNumber(count)}</Badge>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No search data yet</p>
          )}
        </div>

        {/* Zero Result Queries Section */}
        {zeroResultQueries && Object.keys(zeroResultQueries).length > 0 && (
          <>
            <div className="border-t border-gray-200" />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <h3 className="font-semibold text-gray-700">
                  Zero Result Queries
                </h3>
              </div>

              <div className="space-y-2">
                {Object.entries(zeroResultQueries)
                  .slice(0, 3)
                  .map(([query, count]) => (
                    <div
                      key={query}
                      className="flex items-center justify-between rounded-lg bg-orange-50 p-3"
                    >
                      <span className="text-sm text-gray-700">{query}</span>
                      <Badge variant="destructive" className="bg-orange-500">
                        {formatNumber(count)}
                      </Badge>
                    </div>
                  ))}
              </div>

              <p className="text-xs text-gray-500">
                💡 Consider adding content or packages for these searches
              </p>
            </div>
          </>
        )}

        {/* Footer - Last Updated */}
        {state.lastUpdated && (
          <div className="border-t border-gray-200 pt-3">
            <p className="text-xs text-gray-400">
              Last updated: {state.lastUpdated.toLocaleTimeString('tr-TR')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SearchAnalyticsWidget;
