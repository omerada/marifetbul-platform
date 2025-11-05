/**
 * ================================================
 * ADMIN PAYOUTS PAGE
 * ================================================
 * Main page for admin payout management
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 26, 2025
 */

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  AdminPayoutTable,
  AdminPayoutFilters,
  AdminPayoutDetailModal,
  BulkPayoutActions,
} from '@/components/admin/payouts';
import { UnifiedAdminWalletModal } from '@/components/admin/wallet/UnifiedAdminWalletModal';
import {
  payoutAdminApi,
  type PayoutFilters,
  type PageResponse,
} from '@/lib/api/admin/payout-admin-api';
import type { Payout } from '@/types/business/features/wallet';
import { DollarSign, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

// ================================================
// PAGE COMPONENT
// ================================================

export default function AdminPayoutsPage() {
  // ==================== STATE ====================

  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<PayoutFilters>({});

  // Modal states
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Bulk selection
  const [selectedPayoutIds, setSelectedPayoutIds] = useState<Set<string>>(
    new Set()
  );

  // Stats
  const [stats, setStats] = useState({
    totalPending: 0,
    totalProcessing: 0,
    totalCompletedToday: 0,
    totalAmountPending: 0,
  });

  // ==================== API CALLS ====================

  const fetchPayouts = async () => {
    setIsLoading(true);
    try {
      const response: PageResponse<Payout> = await payoutAdminApi.getPayouts({
        ...filters,
        page: currentPage,
        size: 20,
      });
      setPayouts(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
      toast.error('Para çekme talepleri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await payoutAdminApi.getPayoutStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // ==================== EFFECTS ====================

  useEffect(() => {
    fetchPayouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  // ==================== HANDLERS ====================

  const handleProcess = async (payoutId: string) => {
    try {
      await payoutAdminApi.processPayout(payoutId);
      toast.success('Ödeme onaylandı ve işleme alındı');
      fetchPayouts();
      fetchStats();
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error('Failed to process payout:', error);
      toast.error('Ödeme onaylanamadı');
    }
  };

  const handleComplete = async (payoutId: string) => {
    try {
      await payoutAdminApi.completePayout(payoutId);
      toast.success('Ödeme tamamlandı olarak işaretlendi');
      fetchPayouts();
      fetchStats();
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error('Failed to complete payout:', error);
      toast.error('İşlem başarısız');
    }
  };

  const handleFail = async (payoutId: string, reason: string) => {
    try {
      await payoutAdminApi.failPayout(payoutId, reason);
      toast.success('Ödeme başarısız olarak işaretlendi');
      fetchPayouts();
      fetchStats();
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error('Failed to fail payout:', error);
      toast.error('İşlem başarısız');
    }
  };

  const handleCancel = async (payoutId: string) => {
    try {
      await payoutAdminApi.cancelPayout(payoutId);
      toast.success('Ödeme iptal edildi');
      fetchPayouts();
      fetchStats();
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error('Failed to cancel payout:', error);
      toast.error('İşlem başarısız');
    }
  };

  const handleViewDetails = (payout: Payout) => {
    setSelectedPayout(payout);
    setIsDetailModalOpen(true);
  };

  const handleViewUserWallet = (userId: string) => {
    setSelectedUserId(userId);
    setIsWalletModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==================== BULK OPERATIONS ====================

  const handleBulkApprove = async (payoutIds: string[]) => {
    // Process each payout sequentially
    const results = await Promise.allSettled(
      payoutIds.map((id) => payoutAdminApi.processPayout(id))
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failCount = results.filter((r) => r.status === 'rejected').length;

    if (successCount > 0) {
      fetchPayouts();
      fetchStats();
    }

    if (failCount > 0) {
      throw new Error(`${failCount} ödeme onaylanamadı`);
    }
  };

  const handleBulkReject = async (payoutIds: string[], reason: string) => {
    // Process each payout sequentially
    const results = await Promise.allSettled(
      payoutIds.map((id) => payoutAdminApi.failPayout(id, reason))
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failCount = results.filter((r) => r.status === 'rejected').length;

    if (successCount > 0) {
      fetchPayouts();
      fetchStats();
    }

    if (failCount > 0) {
      throw new Error(`${failCount} ödeme reddedilemedi`);
    }
  };

  const handleToggleSelection = (payoutId: string) => {
    setSelectedPayoutIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(payoutId)) {
        newSet.delete(payoutId);
      } else {
        newSet.add(payoutId);
      }
      return newSet;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedPayoutIds.size === payouts.length) {
      setSelectedPayoutIds(new Set());
    } else {
      setSelectedPayoutIds(new Set(payouts.map((p) => p.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedPayoutIds(new Set());
  };

  const getSelectedPayouts = () => {
    return payouts.filter((p) => selectedPayoutIds.has(p.id));
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Para Çekme Yönetimi
          </h1>
          <p className="mt-1 text-gray-600">
            Para çekme taleplerini görüntüleyin ve yönetin
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Pending */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Bekleyen</p>
                <p className="mt-1 text-2xl font-bold text-yellow-900">
                  {stats.totalPending}
                </p>
                <p className="mt-1 text-xs text-yellow-700">
                  ₺{stats.totalAmountPending.toLocaleString('tr-TR')}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Processing */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">İşleniyor</p>
                <p className="mt-1 text-2xl font-bold text-blue-900">
                  {stats.totalProcessing}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Completed Today */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">
                  Bugün Tamamlanan
                </p>
                <p className="mt-1 text-2xl font-bold text-green-900">
                  {stats.totalCompletedToday}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">
                  Toplam Bekleyen Tutar
                </p>
                <p className="mt-1 text-2xl font-bold text-purple-900">
                  ₺{stats.totalAmountPending.toLocaleString('tr-TR')}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <AdminPayoutFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClear={() => {
            setFilters({});
            setCurrentPage(0);
          }}
        />

        {/* Bulk Actions */}
        <BulkPayoutActions
          selectedPayouts={getSelectedPayouts()}
          onBulkApprove={handleBulkApprove}
          onBulkReject={handleBulkReject}
          onClearSelection={handleClearSelection}
          allPayouts={payouts}
        />

        {/* Table */}
        <AdminPayoutTable
          payouts={payouts}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onViewDetails={handleViewDetails}
          onProcess={handleProcess}
          onComplete={handleComplete}
          onFail={handleFail}
          onCancel={handleCancel}
          onViewUserWallet={handleViewUserWallet}
          selectedIds={selectedPayoutIds}
          onToggleSelection={handleToggleSelection}
          onToggleSelectAll={handleToggleSelectAll}
        />
      </div>

      {/* Modals */}
      <AdminPayoutDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPayout(null);
        }}
        payout={selectedPayout}
        onProcess={handleProcess}
        onComplete={handleComplete}
        onFail={handleFail}
        onCancel={handleCancel}
      />

      <UnifiedAdminWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => {
          setIsWalletModalOpen(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
        onRefresh={() => {
          fetchPayouts();
          fetchStats();
        }}
      />
    </div>
  );
}
