/**
 * ================================================
 * ADMIN REFUNDS PAGE
 * ================================================
 * Main page for admin refund management
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 31, 2025
 */

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  RefundApprovalQueue,
  RefundDetailsModal,
  RefundStatisticsDashboard,
  BulkRefundActions,
} from '@/components/domains/admin/refunds';
import {
  refundAdminApi,
  type RefundFilters,
  type RefundDto,
  type PageResponse,
  type BulkApprovalResponse,
  RefundStatus,
} from '@/lib/api/admin/refund-admin-api';
import { StatCard } from '@/components/ui';
import { DollarSign, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// PAGE COMPONENT
// ================================================

export default function AdminRefundsPage() {
  // ==================== STATE ====================

  const [refunds, setRefunds] = useState<RefundDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<RefundFilters>({
    status: RefundStatus.PENDING,
  });

  // Modal states
  const [selectedRefund, setSelectedRefund] = useState<RefundDto | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Bulk selection
  const [selectedRefundIds, setSelectedRefundIds] = useState<Set<string>>(
    new Set()
  );

  // Stats
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalCompletedToday: 0,
    totalAmountPending: 0,
  });

  // ==================== API CALLS ====================

  const fetchRefunds = async () => {
    setIsLoading(true);
    try {
      const response: PageResponse<RefundDto> = await refundAdminApi.getRefunds(
        {
          ...filters,
          page: currentPage,
          size: 20,
          sort: 'createdAt,desc',
        }
      );
      setRefunds(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      logger.error(
        'Failed to fetch admin refunds list',
        error instanceof Error ? error : new Error(String(error)),
        {
          component: 'AdminRefundsPage',
          action: 'fetch-refunds',
          filters,
          currentPage,
        }
      );
      toast.error('İade talepleri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const statistics = await refundAdminApi.getRefundStatistics();
      setStats({
        totalPending: statistics.pendingCount,
        totalApproved: statistics.approvedCount,
        totalCompletedToday: statistics.completedCount,
        totalAmountPending: statistics.pendingAmount,
      });
    } catch (error) {
      logger.error(
        'Failed to fetch refund statistics',
        error instanceof Error ? error : new Error(String(error)),
        {
          component: 'AdminRefundsPage',
          action: 'fetch-statistics',
        }
      );
    }
  };

  // ==================== EFFECTS ====================

  useEffect(() => {
    fetchRefunds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  // ==================== HANDLERS ====================

  const handleApproveRefund = async (refundId: string, notes?: string) => {
    try {
      await refundAdminApi.approveRefund(refundId, { adminNotes: notes });
      toast.success('İade talebi onaylandı');
      fetchRefunds();
      fetchStatistics();
      setIsDetailModalOpen(false);
    } catch (error) {
      logger.error(
        'Failed to approve refund',
        error instanceof Error ? error : new Error(String(error)),
        {
          refundId,
          notes,
          component: 'AdminRefundsPage',
          action: 'approve-refund',
        }
      );
      toast.error('İade talebi onaylanamadı');
    }
  };

  const handleRejectRefund = async (
    refundId: string,
    reason: string,
    notes?: string
  ) => {
    try {
      await refundAdminApi.rejectRefund(refundId, {
        rejectionReason: reason,
        adminNotes: notes,
      });
      toast.success('İade talebi reddedildi');
      fetchRefunds();
      fetchStatistics();
      setIsDetailModalOpen(false);
    } catch (error) {
      logger.error(
        'Failed to reject refund',
        error instanceof Error ? error : new Error(String(error)),
        {
          refundId,
          reason,
          notes,
          component: 'AdminRefundsPage',
          action: 'reject-refund',
        }
      );
      toast.error('İade talebi reddedilemedi');
    }
  };

  const handleBulkApprove = async (
    notes?: string
  ): Promise<BulkApprovalResponse> => {
    if (selectedRefundIds.size === 0) {
      toast.error('Lütfen en az bir iade talebi seçin');
      throw new Error('No refunds selected');
    }

    try {
      const response = await refundAdminApi.bulkApproveRefunds({
        refundIds: Array.from(selectedRefundIds),
        notes,
      });

      // Clear selection and refresh
      setSelectedRefundIds(new Set());
      fetchRefunds();
      fetchStatistics();

      // Return response for BulkRefundActions component to handle
      return response;
    } catch (error) {
      logger.error(
        'Failed to bulk approve refunds',
        error instanceof Error ? error : new Error(String(error)),
        {
          selectedCount: selectedRefundIds.size,
          notes,
          component: 'AdminRefundsPage',
          action: 'bulk-approve',
        }
      );
      throw error; // Re-throw for component to handle
    }
  };

  const handleProcessRefund = async (refundId: string) => {
    try {
      await refundAdminApi.processRefund(refundId);
      toast.success('İade işleme alındı');
      fetchRefunds();
      fetchStatistics();
      setIsDetailModalOpen(false);
    } catch (error) {
      logger.error(
        'Failed to process refund',
        error instanceof Error ? error : new Error(String(error)),
        {
          refundId,
          component: 'AdminRefundsPage',
          action: 'process-refund',
        }
      );
      toast.error('İade işleme alınamadı');
    }
  };

  const handleRefundClick = (refund: RefundDto) => {
    setSelectedRefund(refund);
    setIsDetailModalOpen(true);
  };

  const handleFiltersChange = (newFilters: RefundFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  const handleSelectRefund = (refundId: string, selected: boolean) => {
    const newSelection = new Set(selectedRefundIds);
    if (selected) {
      newSelection.add(refundId);
    } else {
      newSelection.delete(refundId);
    }
    setSelectedRefundIds(newSelection);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRefundIds(new Set(refunds.map((r) => r.id)));
    } else {
      setSelectedRefundIds(new Set());
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">İade Yönetimi</h1>
        <p className="text-muted-foreground mt-2">
          İade taleplerini inceleyin, onaylayın veya reddedin
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Bekleyen Talepler"
          value={stats.totalPending}
          icon={<Clock className="h-6 w-6" />}
          color="yellow"
          testId="stat-card-pending"
        />
        <StatCard
          label="Onaylanan"
          value={stats.totalApproved}
          icon={<CheckCircle2 className="h-6 w-6" />}
          color="green"
          testId="stat-card-approved"
        />
        <StatCard
          label="Bugün Tamamlanan"
          value={stats.totalCompletedToday}
          icon={<TrendingUp className="h-6 w-6" />}
          color="blue"
          testId="stat-card-completed"
        />
        <StatCard
          label="Bekleyen Tutar"
          value={`₺${stats.totalAmountPending.toLocaleString('tr-TR')}`}
          icon={<DollarSign className="h-6 w-6" />}
          color="purple"
          testId="stat-card-amount"
        />
      </div>

      {/* Bulk Actions */}
      {selectedRefundIds.size > 0 && (
        <BulkRefundActions
          selectedCount={selectedRefundIds.size}
          onBulkApprove={handleBulkApprove}
          onClearSelection={() => setSelectedRefundIds(new Set())}
        />
      )}

      {/* Refund Queue Table */}
      <RefundApprovalQueue
        refunds={refunds}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        filters={filters}
        selectedRefundIds={selectedRefundIds}
        onRefundClick={handleRefundClick}
        onPageChange={setCurrentPage}
        onFiltersChange={handleFiltersChange}
        onSelectRefund={handleSelectRefund}
        onSelectAll={handleSelectAll}
      />

      {/* Refund Detail Modal */}
      {selectedRefund && (
        <RefundDetailsModal
          refund={selectedRefund}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedRefund(null);
          }}
          onApprove={handleApproveRefund}
          onReject={handleRejectRefund}
          onProcess={handleProcessRefund}
        />
      )}

      {/* Statistics Dashboard (collapsed by default) */}
      <RefundStatisticsDashboard />
    </div>
  );
}

// StatCard component now imported from @/components/ui
