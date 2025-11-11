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
  RefundStatus,
} from '@/lib/api/admin/refund-admin-api';
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
        error,
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
        error,
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
        error,
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
        error,
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

  const handleBulkApprove = async (notes?: string) => {
    if (selectedRefundIds.size === 0) {
      toast.error('Lütfen en az bir iade talebi seçin');
      return;
    }

    try {
      const count = await refundAdminApi.bulkApproveRefunds({
        refundIds: Array.from(selectedRefundIds),
        adminNotes: notes,
      });
      toast.success(`${count} iade talebi toplu olarak onaylandı`);
      setSelectedRefundIds(new Set());
      fetchRefunds();
      fetchStatistics();
    } catch (error) {
      logger.error(
        'Failed to bulk approve refunds',
        error,
        {
          selectedCount: selectedRefundIds.size,
          notes,
          component: 'AdminRefundsPage',
          action: 'bulk-approve',
        }
      );
      toast.error('Toplu onaylama işlemi başarısız oldu');
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
        error,
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
          title="Bekleyen Talepler"
          value={stats.totalPending}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Onaylanan"
          value={stats.totalApproved}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Bugün Tamamlanan"
          value={stats.totalCompletedToday}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Bekleyen Tutar"
          value={`₺${stats.totalAmountPending.toLocaleString('tr-TR')}`}
          icon={DollarSign}
          color="purple"
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

// ================================================
// STAT CARD COMPONENT
// ================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'yellow' | 'green' | 'blue' | 'purple';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    yellow: 'bg-yellow-500/10 text-yellow-600',
    green: 'bg-green-500/10 text-green-600',
    blue: 'bg-blue-500/10 text-blue-600',
    purple: 'bg-purple-500/10 text-purple-600',
  };

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
