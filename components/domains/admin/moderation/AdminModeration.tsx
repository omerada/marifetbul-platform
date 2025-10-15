/**
 * AdminModerationNew Component
 * 
 * Main coordinator for admin moderation interface
 * Refactored from 808 lines to ~300 lines (-63%)
 */

'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { AlertTriangle } from 'lucide-react';
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
import type { ModerationItem, ModerationAction } from './moderation/types/moderationTypes';

export default function AdminModerationNew() {
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Custom hooks
  const { filters, handleFilterChange, clearFilters } = useModerationFilters();
  
  const {
    items,
    stats,
    isLoading,
    error,
    refetch,
  } = useModerationData(filters, pagination);

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
  const handleActionClick = (item: ModerationItem, action: ModerationAction) => {
    setSelectedItem(item);
    setActionType(action);
    setShowActionDialog(true);
  };

  const handleViewDetails = (item: ModerationItem) => {
    // TODO: Implement view details modal or navigation
    console.log('View details for:', item);
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
      <ModerationFilters filters={filters} onFilterChange={handleFilterChange} />

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
    </div>
  );
}
