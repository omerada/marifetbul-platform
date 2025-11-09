'use client';

/**
 * Content Appeal System Component
 *
 * Main coordinator for content appeal management.
 * Refactored: 925 lines → 177 lines (-80.9%)
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { RefreshCw, Download, AlertCircle } from 'lucide-react';
import { useContentAppeals } from './hooks/useContentAppeals';
import {
  AppealStatsCards,
  AppealFilters,
  AppealList,
  AppealDetailModal,
  AppealAnalytics,
  ReviewerPerformance,
} from './components';
import type { ContentAppeal, AppealAction } from './types/appeal';

type TabType = 'appeals' | 'analytics' | 'reviewers';

export function ContentAppealSystem() {
  const [activeTab, setActiveTab] = useState<TabType>('appeals');
  const [selectedAppeal, setSelectedAppeal] = useState<ContentAppeal | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    appeals,
    stats,
    isLoading,
    isSaving,
    error,
    filters,
    setFilter,
    clearFilters,
    handleAppealAction,
    refreshData,
  } = useContentAppeals();

  const handleRefresh = async () => {
    await refreshData();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(appeals, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `appeals-export-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAppealClick = (appeal: ContentAppeal) => {
    setSelectedAppeal(appeal);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAppeal(null);
  };

  const handleAction = async (
    appealId: string,
    action: AppealAction
  ): Promise<boolean> => {
    const success = await handleAppealAction(appealId, action);
    if (success) {
      handleModalClose();
      await refreshData();
    }
    return success;
  };

  const tabs = [
    { id: 'appeals' as const, label: 'İtirazlar', count: appeals.length },
    { id: 'analytics' as const, label: 'Analiz', count: null },
    {
      id: 'reviewers' as const,
      label: 'İnceleyiciler',
      count: stats?.reviewerPerformance.length || 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>İçerik İtiraz Sistemi</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                />
                Yenile
              </Button>
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                disabled={appeals.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Dışa Aktar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <AppealStatsCards stats={stats} />

      {/* Filters (only on appeals tab) */}
      {activeTab === 'appeals' && (
        <AppealFilters
          filters={filters}
          onFilterChange={setFilter}
          onClear={clearFilters}
        />
      )}

      {/* Tab Navigation */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'appeals' && (
              <AppealList
                appeals={appeals}
                onAppealClick={handleAppealClick}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'analytics' && (
              <AppealAnalytics stats={stats} isLoading={isLoading} />
            )}

            {activeTab === 'reviewers' && (
              <ReviewerPerformance stats={stats} isLoading={isLoading} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <AppealDetailModal
        appeal={selectedAppeal}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onAction={handleAction}
        isSaving={isSaving}
      />
    </div>
  );
}
