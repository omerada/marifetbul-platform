/**
 * Analytics Header Component
 *
 * Header section with title, filters, and action buttons for analytics.
 */

import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { RefreshCw, Download } from 'lucide-react';
import type {
  AnalyticsFilters,
  DateRangeType,
} from '../types/moderationAnalytics';
import {
  DATE_RANGE_OPTIONS,
  REFRESH_INTERVAL_OPTIONS,
} from '../constants/analyticsConstants';

interface AnalyticsHeaderProps {
  filters: AnalyticsFilters;
  onFilterChange: <K extends keyof AnalyticsFilters>(
    key: K,
    value: AnalyticsFilters[K]
  ) => void;
  onRefresh: () => void;
  onExport: () => void;
  isLoading?: boolean;
  refreshInterval: number | null;
  onRefreshIntervalChange: (interval: number | null) => void;
}

export function AnalyticsHeader({
  filters,
  onFilterChange,
  onRefresh,
  onExport,
  isLoading = false,
  refreshInterval,
  onRefreshIntervalChange,
}: AnalyticsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Title Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Moderasyon Analitikleri
        </h1>
        <p className="text-gray-600">
          Detaylı moderasyon performansı ve trend analizi
        </p>
      </div>

      {/* Controls Section */}
      <div className="flex flex-wrap gap-2">
        {/* Date Range Selector */}
        <select
          value={filters.dateRange}
          onChange={(e) =>
            onFilterChange('dateRange', e.target.value as DateRangeType)
          }
          className="rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          disabled={isLoading}
        >
          {DATE_RANGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Refresh Interval Selector */}
        <select
          value={refreshInterval || ''}
          onChange={(e) =>
            onRefreshIntervalChange(
              e.target.value ? parseInt(e.target.value) : null
            )
          }
          className="rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          disabled={isLoading}
        >
          {REFRESH_INTERVAL_OPTIONS.map((option) => (
            <option key={option.label} value={option.value || ''}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Refresh Button */}
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>

        {/* Export Button */}
        <Button
          variant="outline"
          onClick={onExport}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Dışa Aktar
        </Button>
      </div>
    </div>
  );
}
