'use client';

/**
 * Moderation Analytics Component
 *
 * Main coordinator for moderation analytics system.
 * Refactored: 890 lines → 120 lines (-86.5%)
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { RefreshCw, BarChart3, AlertCircle } from 'lucide-react';
import { useModerationAnalytics } from './analytics/hooks/useModerationAnalytics';
import {
  AnalyticsHeader,
  AnalyticsCards,
  TabNavigation,
  OverviewTab,
  ModeratorsTab,
  AutomationTab,
  RiskAnalysisTab,
  ReportsTab,
} from './analytics/components';
import type { TabType } from './analytics/types/moderationAnalytics';

export default function ModerationAnalytics() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const {
    analytics,
    isLoading,
    error,
    filters,
    refreshInterval,
    setFilter,
    setRefreshInterval,
    refreshData,
    exportData,
  } = useModerationAnalytics();

  const handleExport = async () => {
    await exportData('xlsx');
  };

  // Loading State
  if (isLoading && !analytics) {
    return (
      <div className="p-6">
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2">Analitik veriler yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !analytics) {
    return (
      <div className="p-6">
        <Card className="border-red-300 bg-red-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No Data State
  if (!analytics) {
    return (
      <div className="p-6">
        <div className="py-8 text-center">
          <BarChart3 className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <p className="text-gray-500">Analitik veriler yüklenemedi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <AnalyticsHeader
        filters={filters}
        onFilterChange={setFilter}
        onRefresh={refreshData}
        onExport={handleExport}
        isLoading={isLoading}
        refreshInterval={refreshInterval}
        onRefreshIntervalChange={setRefreshInterval}
      />

      {/* Error Message (non-blocking) */}
      {error && analytics && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      <AnalyticsCards overview={analytics.overview} />

      {/* Main Content */}
      <Card>
        <CardContent className="p-0">
          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab analytics={analytics} />}
            {activeTab === 'moderators' && (
              <ModeratorsTab moderators={analytics.moderatorPerformance} />
            )}
            {activeTab === 'automation' && (
              <AutomationTab automation={analytics.automationMetrics} />
            )}
            {activeTab === 'risk' && (
              <RiskAnalysisTab risk={analytics.riskAnalysis} />
            )}
            {activeTab === 'reports' && (
              <ReportsTab reporting={analytics.reportingData} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
