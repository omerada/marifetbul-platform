/**
 * ================================================
 * SEARCH ANALYTICS WIDGET - REFACTORED
 * ================================================
 * Dashboard widget displaying search analytics metrics
 * Refactored to use shared dashboard components
 *
 * Sprint 1 - Story 4: Component Architecture Refactor
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 (Refactored)
 * @since 2025-10-30
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  MousePointerClick,
  ShoppingCart,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import {
  DashboardWidgetCard,
  MetricCard,
  formatPercentage,
} from '@/components/shared/dashboard';
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
  /** Number of days to look back for metrics */
  days?: number;
  /** Compact mode for smaller displays */
  compact?: boolean;
  /** Auto-refresh interval in milliseconds (0 to disable) */
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
// HELPER FUNCTIONS
// ================================================

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('tr-TR').format(num);
};

// ================================================
// SUB-COMPONENTS
// ================================================

/**
 * Top Queries List Component
 */
function TopQueriesList({ queries }: { queries: TopQueries | null }) {
  if (!queries || Object.keys(queries).length === 0) {
    return <p className="text-muted-foreground text-sm">No search data yet</p>;
  }

  return (
    <div className="space-y-2">
      {Object.entries(queries)
        .slice(0, 5)
        .map(([query, count], index) => (
          <div
            key={query}
            className="bg-muted hover:bg-muted/80 flex items-center justify-between rounded-lg p-3 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold">
                {index + 1}
              </span>
              <span className="text-sm font-medium">{query}</span>
            </div>
            <Badge variant="secondary">{formatNumber(count)}</Badge>
          </div>
        ))}
    </div>
  );
}

/**
 * Zero Result Queries Component
 */
function ZeroResultQueriesList({ queries }: { queries: TopQueries | null }) {
  if (!queries || Object.keys(queries).length === 0) {
    return null;
  }

  return (
    <>
      <div className="border-t pt-4" />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          <h3 className="font-semibold">Zero Result Queries</h3>
        </div>

        <div className="space-y-2">
          {Object.entries(queries)
            .slice(0, 3)
            .map(([query, count]) => (
              <div
                key={query}
                className="flex items-center justify-between rounded-lg bg-orange-50 p-3"
              >
                <span className="text-sm">{query}</span>
                <Badge variant="destructive" className="bg-orange-500">
                  {formatNumber(count)}
                </Badge>
              </div>
            ))}
        </div>

        <p className="text-muted-foreground text-xs">
          💡 Consider adding content or packages for these searches
        </p>
      </div>
    </>
  );
}

// ================================================
// MAIN COMPONENT
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
  // DERIVED DATA
  // ================================================

  const { metrics } = state;

  const zeroResultRate = metrics
    ? metrics.totalSearches > 0
      ? (metrics.zeroResultSearches / metrics.totalSearches) * 100
      : 0
    : 0;

  // ================================================
  // RENDER
  // ================================================

  return (
    <DashboardWidgetCard
      title="Search Analytics"
      subtitle={
        state.lastUpdated
          ? `Last updated: ${state.lastUpdated.toLocaleTimeString('tr-TR')}`
          : undefined
      }
      loading={state.isLoading && !metrics}
      error={state.error}
      onRefresh={fetchMetrics}
      showRefreshButton
      actions={<Badge variant="secondary">{days} days</Badge>}
    >
      {metrics && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Searches"
              value={metrics.totalSearches}
              icon={Search}
              iconColor="text-blue-600"
              description={`${formatNumber(metrics.uniqueUsers)} unique users`}
            />

            <MetricCard
              label="Click-Through Rate"
              value={formatPercentage(metrics.clickThroughRate)}
              icon={MousePointerClick}
              iconColor="text-green-600"
              trend={metrics.clickThroughRate >= 30 ? 'up' : 'down'}
              isPositiveTrendGood
            />

            <MetricCard
              label="Conversion Rate"
              value={formatPercentage(metrics.conversionRate)}
              icon={ShoppingCart}
              iconColor="text-purple-600"
              trend={metrics.conversionRate >= 5 ? 'up' : 'down'}
              isPositiveTrendGood
              description="Search to order"
            />

            <MetricCard
              label="Zero Results"
              value={formatPercentage(zeroResultRate)}
              icon={AlertCircle}
              iconColor={zeroResultRate > 10 ? 'text-red-600' : 'text-gray-600'}
              trend={
                zeroResultRate > 10
                  ? 'up'
                  : zeroResultRate < 5
                    ? 'down'
                    : 'stable'
              }
              isPositiveTrendGood={false}
              description={`${formatNumber(metrics.zeroResultSearches)} searches`}
            />
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Top Queries Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-muted-foreground h-4 w-4" />
              <h3 className="font-semibold">Top Search Queries</h3>
            </div>
            <TopQueriesList queries={state.topQueries} />
          </div>

          {/* Zero Result Queries */}
          <ZeroResultQueriesList queries={state.zeroResultQueries} />
        </div>
      )}
    </DashboardWidgetCard>
  );
}

export default SearchAnalyticsWidget;
