'use client';

/**
 * SEARCH ANALYTICS WIDGET v5.0.0
 * Sprint 2: Refactored to use StatsCard instead of deprecated MetricCard
 * Now uses useAdminDashboard hook - no local state or API calls
 */

'use client';

import React, { useMemo, memo } from 'react';
import {
  Search,
  MousePointerClick,
  ShoppingCart,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { DashboardWidgetCard } from '@/components/shared/dashboard';
import { StatsCard } from '@/components/domains/dashboard/widgets/StatsCard';
import { useAdminDashboard } from '@/hooks';
import {
  formatPercentage,
  formatNumber as canonicalFormatNumber,
} from '@/lib/shared/formatters';
import logger from '@/lib/infrastructure/monitoring/logger';

// Sprint 1 Cleanup: Local formatPercentage and formatNumber removed - using canonical formatters

export interface SearchAnalyticsWidgetProps {
  days?: number;
  compact?: boolean;
  refreshInterval?: number; // Deprecated - kept for backward compatibility
}

// Sprint 1: formatNumber wrapper for backward compatibility
const formatNumber = (num: number) => canonicalFormatNumber(num);

const TopQueriesList = memo(function TopQueriesList({
  keywords,
}: {
  keywords: string[];
}) {
  if (!keywords || keywords.length === 0) {
    return <p className="text-muted-foreground text-sm">No search data yet</p>;
  }

  return (
    <div className="space-y-2">
      {keywords.slice(0, 5).map((keyword, index) => (
        <div
          key={keyword}
          className="bg-muted hover:bg-muted/80 flex items-center justify-between rounded-lg p-3 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold">
              {index + 1}
            </span>
            <span className="text-sm font-medium">{keyword}</span>
          </div>
          <Badge variant="secondary">Top {index + 1}</Badge>
        </div>
      ))}
    </div>
  );
});

const ZeroResultQueriesList = memo(function ZeroResultQueriesList({
  keywords,
}: {
  keywords: string[];
}) {
  if (!keywords || keywords.length === 0) return null;

  return (
    <>
      <div className="border-t pt-4" />
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          <h3 className="font-semibold">Zero Result Queries</h3>
        </div>
        <div className="space-y-2">
          {keywords.slice(0, 3).map((keyword) => (
            <div
              key={keyword}
              className="flex items-center justify-between rounded-lg bg-orange-50 p-3"
            >
              <span className="text-sm">{keyword}</span>
              <Badge variant="destructive" className="bg-orange-500">
                No results
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
});

export function SearchAnalyticsWidget({
  days = 30,
  compact: _compact = false,
  refreshInterval: _refreshInterval = 0,
}: SearchAnalyticsWidgetProps) {
  const {
    searchMetrics,
    hasSearchData,
    isLoading,
    error,
    lastUpdated,
    refresh,
  } = useAdminDashboard();

  useMemo(() => {
    if (searchMetrics) {
      logger.debug('SearchAnalyticsWidget: Data from store', {
        totalSearches: searchMetrics.totalSearches,
        hasKeywords: searchMetrics.topKeywords.length > 0,
      });
    }
  }, [searchMetrics]);

  const displayMetrics = useMemo(() => {
    if (!searchMetrics) return null;
    return {
      totalSearches: searchMetrics.totalSearches,
      uniqueUsers: searchMetrics.uniqueSearchers,
      clickThroughRate: searchMetrics.clickThroughRate,
      conversionRate: searchMetrics.searchToOrderConversionRate,
      zeroResultSearches: searchMetrics.zeroResultSearches,
      zeroResultRate: searchMetrics.zeroResultRate,
      topKeywords: searchMetrics.topKeywords || [],
      zeroResultKeywords: searchMetrics.zeroResultKeywords || [],
    };
  }, [searchMetrics]);

  const lastUpdateTime = useMemo(() => {
    if (!lastUpdated) return undefined;
    return new Date(lastUpdated).toLocaleTimeString('tr-TR');
  }, [lastUpdated]);

  return (
    <DashboardWidgetCard
      title="Search Analytics"
      subtitle={lastUpdateTime ? `Last updated: ${lastUpdateTime}` : undefined}
      loading={isLoading && !hasSearchData}
      error={error}
      onRefresh={refresh}
      showRefreshButton
      actions={<Badge variant="secondary">{days} days</Badge>}
    >
      {displayMetrics ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              data={{
                id: 'total-searches',
                title: 'Total Searches',
                value: displayMetrics.totalSearches.toString(),
                subtitle: `${formatNumber(displayMetrics.uniqueUsers)} unique users`,
                icon: Search,
                iconColor: 'blue',
              }}
            />
            <StatsCard
              data={{
                id: 'click-through-rate',
                title: 'Click-Through Rate',
                value: formatPercentage(displayMetrics.clickThroughRate / 100),
                icon: MousePointerClick,
                iconColor: 'green',
                trend: {
                  percentage: displayMetrics.clickThroughRate,
                  direction:
                    displayMetrics.clickThroughRate >= 30 ? 'up' : 'down',
                  isPositive: true,
                },
              }}
            />
            <StatsCard
              data={{
                id: 'conversion-rate',
                title: 'Conversion Rate',
                value: formatPercentage(displayMetrics.conversionRate / 100),
                subtitle: 'Search to order',
                icon: ShoppingCart,
                iconColor: 'purple',
                trend: {
                  percentage: displayMetrics.conversionRate,
                  direction: displayMetrics.conversionRate >= 5 ? 'up' : 'down',
                  isPositive: true,
                },
              }}
            />
            <StatsCard
              data={{
                id: 'zero-results',
                title: 'Zero Results',
                value: formatPercentage(displayMetrics.zeroResultRate / 100),
                subtitle: `${formatNumber(displayMetrics.zeroResultSearches)} searches`,
                icon: AlertCircle,
                iconColor: displayMetrics.zeroResultRate > 10 ? 'red' : 'gray',
                trend: {
                  percentage: displayMetrics.zeroResultRate,
                  direction:
                    displayMetrics.zeroResultRate > 10
                      ? 'up'
                      : displayMetrics.zeroResultRate < 5
                        ? 'down'
                        : 'neutral',
                  isPositive: false, // Lower is better for zero results
                },
              }}
            />
          </div>
          <div className="border-t" />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-muted-foreground h-4 w-4" />
              <h3 className="font-semibold">Top Search Queries</h3>
            </div>
            <TopQueriesList keywords={displayMetrics.topKeywords} />
          </div>
          <ZeroResultQueriesList keywords={displayMetrics.zeroResultKeywords} />
        </div>
      ) : !isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">No Search Data</h3>
          <p className="text-muted-foreground text-sm">
            Search analytics will appear here once users start searching.
          </p>
        </div>
      ) : null}
    </DashboardWidgetCard>
  );
}

export default SearchAnalyticsWidget;
