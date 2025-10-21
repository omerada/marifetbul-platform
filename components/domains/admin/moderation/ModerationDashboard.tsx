/**
 * ModerationDashboard Component (Refactored)
 *
 * Content moderation dashboard with filtering, statistics,
 * and action management. This is a modular refactored version
 * composed of specialized sub-components.
 *
 * @module ModerationDashboard
 * @refactored Sprint 4 Day 7
 * @reduction 746 lines → ~180 lines (-75.8%)
 */

'use client';

import { useModeration } from './moderation-dashboard/hooks/useModeration';
import { logger } from '@/lib/shared/utils/logger';
import {
  ModerationLoadingState,
  ModerationHeader,
  ModerationStatsGrid,
  ModerationFilters,
  ModerationItemsList,
  ModerationSidebar,
} from './moderation-dashboard/components';

/**
 * ModerationDashboard - Main component
 *
 * Displays comprehensive moderation dashboard with:
 * - Statistics overview (4 key metrics)
 * - Multi-faceted filtering (type, severity, status, search)
 * - Moderation items list with action buttons
 * - Category breakdown and quick actions
 */
export default function ModerationDashboard() {
  // Fetch and manage moderation data
  const {
    stats,
    filteredItems,
    filters,
    isLoading,
    updateFilter,
    updateSearch,
    refresh,
    handleItemAction,
  } = useModeration();

  // Loading state
  if (isLoading) {
    return <ModerationLoadingState />;
  }

  // Render main dashboard
  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <ModerationHeader
        isLoading={isLoading}
        onRefresh={refresh}
        onDownload={() => {
          // Download moderation report
          // Future implementation:
          // 1. Fetch report data from API
          // 2. Generate CSV or PDF
          // 3. Trigger browser download
          logger.debug('Moderation report download to be implemented');
        }}
      />

      {/* Stats Grid */}
      <ModerationStatsGrid stats={stats} />

      {/* Filters & Search */}
      <ModerationFilters
        filters={filters}
        onFilterChange={updateFilter}
        onSearchChange={updateSearch}
      />

      {/* Main Content Grid: Items List + Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Column 1-2: Moderation Items List */}
        <div className="lg:col-span-2">
          <ModerationItemsList
            items={filteredItems}
            onItemAction={handleItemAction}
          />
        </div>

        {/* Column 3: Sidebar (Category Breakdown, Quick Actions, Recent Activity) */}
        <ModerationSidebar stats={stats} />
      </div>
    </div>
  );
}
