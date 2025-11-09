'use client';

/**
 * AdminModerationNew Component
 *
 * Main coordinator for admin moderation interface
 * Refactored from 808 lines to ~300 lines (-63%)
 *
 * Extended with User Moderation tab - Sprint 3
 */

'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { AlertTriangle, FileText, UserX } from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';
import {
  ModerationHeader,
  ModerationStats,
  ModerationFilters,
  ModerationTable,
  ModerationPagination,
  ModerationActionDialog,
} from './moderation/components';
import { useModerationData } from './moderation/hooks/useModerationData';
import { useModerationFilters } from './moderation/hooks/useModerationFilters';
import { useModerationActions } from './moderation/hooks/useModerationActions';
import { UserModerationPanel } from './UserModerationPanel';
import type {
  ModerationItem,
  ModerationAction,
} from './moderation/types/moderationTypes';

type ModerationTab = 'content' | 'users';

export default function AdminModerationNew() {
  // Tab state
  const [activeTab, setActiveTab] = useState<ModerationTab>('content');
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Custom hooks
  const { filters, handleFilterChange, clearFilters } = useModerationFilters();

  const { items, stats, isLoading, error, refetch } = useModerationData(
    filters,
    pagination
  );

  const {
    selectedItem,
    actionType,
    actionNotes,
    showActionDialog,
    handleAction,
    setSelectedItem,
    setActionType,
    setActionNotes,
    setShowActionDialog,
  } = useModerationActions(() => {
    refetch();
    clearFilters();
  });

  // Event handlers
  const handleActionClick = (
    item: ModerationItem,
    action: ModerationAction
  ) => {
    setSelectedItem(item);
    setActionType(action);
    setShowActionDialog(true);
  };

  const handleViewDetails = (item: ModerationItem) => {
    // View moderation item details
    logger.debug('Viewing moderation item details:', item.id);
    // Implementation options:
    // 1. Navigate to detail page: router.push(`/admin/moderation/${item.id}`)
    // 2. Open modal: setSelectedItem(item); setShowDetailsModal(true);
    // 3. Open side panel with full details
  };

  const handleActionConfirm = async () => {
    if (!selectedItem) return;

    await handleAction();

    // Close dialog and reset
    setShowActionDialog(false);
    setSelectedItem(null);
    setActionType(null);
    setActionNotes('');
  };

  const handleActionCancel = () => {
    setShowActionDialog(false);
    setSelectedItem(null);
    setActionType(null);
    setActionNotes('');
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleRefresh = () => {
    clearFilters();
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('content')}
            className={`${
              activeTab === 'content'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors`}
          >
            <FileText className="h-5 w-5" />
            İçerik Denetimi
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors`}
          >
            <UserX className="h-5 w-5" />
            Kullanıcı Denetimi
          </button>
        </nav>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <>
          {/* Header */}
          <ModerationHeader onRefresh={handleRefresh} isLoading={isLoading} />

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats */}
          <ModerationStats stats={stats} isLoading={isLoading} />

          {/* Filters */}
          <ModerationFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Table */}
          <ModerationTable
            items={items}
            isLoading={isLoading}
            onActionClick={handleActionClick}
            onViewDetails={handleViewDetails}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <ModerationPagination
              pagination={pagination}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          )}

          {/* Action Dialog */}
          <ModerationActionDialog
            open={showActionDialog}
            actionType={actionType}
            selectedItem={selectedItem}
            actionNotes={actionNotes}
            onNotesChange={setActionNotes}
            onConfirm={handleActionConfirm}
            onCancel={handleActionCancel}
          />
        </>
      )}

      {/* User Moderation Tab */}
      {activeTab === 'users' && (
        <div className="px-6">
          <UserModerationPanel />
        </div>
      )}
    </div>
  );
}
