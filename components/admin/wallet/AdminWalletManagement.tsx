/**
 * ================================================
 * ADMIN WALLET MANAGEMENT COMPONENT
 * ================================================
 * Comprehensive wallet management interface for admins
 *
 * Features:
 * - List all user wallets
 * - Search and filter wallets
 * - View wallet details
 * - Manual balance adjustment
 * - Freeze/unfreeze wallets
 * - Transaction history
 * - Statistics overview
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 30, 2025
 * @sprint Sprint 1 - Story 1.1
 */

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  walletAdminApi,
  formatCurrency,
  formatDate,
  getWalletStatusColor,
  getWalletStatusLabel,
  type WalletFilters,
  type AdminWalletDetail,
  type PageResponse,
} from '@/lib/api/admin/wallet-admin-api';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';
import {
  Wallet,
  Users,
  TrendingUp,
  Filter,
  Eye,
  Lock,
  Unlock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { UnifiedAdminWalletModal } from './UnifiedAdminWalletModal';
import { AdminWalletFilters } from './AdminWalletFilters';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

interface WalletStats {
  totalWallets: number;
  activeWallets: number;
  suspendedWallets: number;
  totalBalance: number;
  totalPendingBalance: number;
  averageBalance: number;
}

// ================================================
// COMPONENT
// ================================================

export const AdminWalletManagement: React.FC = () => {
  // ==================== STATE ====================

  const [wallets, setWallets] = useState<AdminWalletDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<WalletFilters>({});

  // Modal states
  const [selectedWallet, setSelectedWallet] =
    useState<AdminWalletDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Stats
  const [stats, setStats] = useState<WalletStats>({
    totalWallets: 0,
    activeWallets: 0,
    suspendedWallets: 0,
    totalBalance: 0,
    totalPendingBalance: 0,
    averageBalance: 0,
  });

  // ==================== API CALLS ====================

  const fetchWallets = async () => {
    setIsLoading(true);
    try {
      const response: PageResponse<AdminWalletDetail> =
        await walletAdminApi.getWallets({
          ...filters,
          page: currentPage,
          size: 20,
        });
      setWallets(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      logger.error(
        'Failed to fetch wallets:',
        error instanceof Error ? error : undefined
      );
      toast.error('Cüzdanlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await walletAdminApi.getWalletStats();
      setStats(data);
    } catch (error) {
      logger.error(
        'Failed to fetch stats:',
        error instanceof Error ? error : undefined
      );
    }
  };

  // ==================== EFFECTS ====================

  useEffect(() => {
    fetchWallets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  // ==================== HANDLERS ====================

  const handleViewDetails = (wallet: AdminWalletDetail) => {
    setSelectedWallet(wallet);
    setIsDetailModalOpen(true);
  };

  const handleRefresh = () => {
    fetchWallets();
    fetchStats();
    toast.success('Veriler güncellendi');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFreezeWallet = async (userId: string, reason: string) => {
    try {
      await walletAdminApi.freezeWallet(userId, { reason });
      toast.success('Cüzdan donduruldu');
      fetchWallets();
      fetchStats();
    } catch (error) {
      logger.error(
        'Failed to freeze wallet:',
        error instanceof Error ? error : undefined
      );
      toast.error('Cüzdan dondurulamadı');
    }
  };

  const handleUnfreezeWallet = async (userId: string) => {
    try {
      await walletAdminApi.unfreezeWallet(userId);
      toast.success('Cüzdan aktif edildi');
      fetchWallets();
      fetchStats();
    } catch (error) {
      logger.error(
        'Failed to unfreeze wallet:',
        error instanceof Error ? error : undefined
      );
      toast.error('İşlem başarısız');
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cüzdan Yönetimi</h2>
          <p className="mt-1 text-sm text-gray-600">
            Kullanıcı cüzdanlarını görüntüleyin ve yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtrele
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Wallets */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Cüzdan</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.totalWallets}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {stats.activeWallets} aktif, {stats.suspendedWallets} askıda
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Total Balance */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Bakiye</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {formatCurrency(stats.totalBalance)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {formatCurrency(stats.totalPendingBalance)} beklemede
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Average Balance */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Ortalama Bakiye
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {formatCurrency(stats.averageBalance)}
              </p>
              <p className="mt-1 text-xs text-gray-500">Kullanıcı başına</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <AdminWalletFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClear={() => {
            setFilters({});
            setCurrentPage(0);
          }}
        />
      )}

      {/* Wallets Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Bakiye
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Bekleyen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Oluşturulma
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-8 w-20" />
                    </td>
                  </tr>
                ))
              ) : wallets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Wallet className="mb-2 h-12 w-12 text-gray-400" />
                      <p className="text-gray-600">Cüzdan bulunamadı</p>
                    </div>
                  </td>
                </tr>
              ) : (
                wallets.map((wallet) => (
                  <tr
                    key={wallet.wallet.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    {/* User Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {wallet.user.avatarUrl ? (
                            <Image
                              src={wallet.user.avatarUrl}
                              alt={wallet.user.fullName}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                              <Users className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {wallet.user.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {wallet.user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Balance */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(wallet.wallet.currentBalance)}
                      </div>
                    </td>

                    {/* Pending Balance */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {formatCurrency(wallet.wallet.pendingBalance)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={getWalletStatusColor(wallet.wallet.status)}
                      >
                        {getWalletStatusLabel(wallet.wallet.status)}
                      </Badge>
                    </td>

                    {/* Created At */}
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {formatDate(wallet.wallet.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(wallet)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {wallet.wallet.status === 'ACTIVE' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const reason = prompt(
                                'Dondurma nedeni (minimum 10 karakter):'
                              );
                              if (reason && reason.length >= 10) {
                                handleFreezeWallet(wallet.user.id, reason);
                              }
                            }}
                          >
                            <Lock className="h-4 w-4 text-red-600" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnfreezeWallet(wallet.user.id)}
                          >
                            <Unlock className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-4">
            <div className="text-sm text-gray-700">
              Sayfa {currentPage + 1} / {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <UnifiedAdminWalletModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedWallet(null);
        }}
        wallet={selectedWallet}
        onRefresh={fetchWallets}
      />
    </div>
  );
};

export default AdminWalletManagement;
