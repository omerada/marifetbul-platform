/**
 * Admin Orders Dashboard Page
 * ----------------------------
 * Main page for admin order management
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminOrderStats, AdminOrdersTable } from '@/components/domains/admin';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Search, Filter } from 'lucide-react';
import { useAdminOrders } from '@/hooks/business/admin/useAdminOrders';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const {
    orders,
    isLoading,
    forceComplete,
    forceCancel,
    loadPage,
    currentPage,
    totalPages,
  } = useAdminOrders({
    autoLoad: true,
    search: searchQuery,
    status: statusFilter,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already reactive via useAdminOrders
  };

  const handleForceComplete = async (orderId: string) => {
    const adminNote = prompt('Tamamlama nedeni (opsiyonel):');
    if (adminNote !== null) {
      await forceComplete(orderId, adminNote || 'Admin tarafından tamamlandı');
    }
  };

  const handleForceCancel = async (orderId: string) => {
    const reason = prompt('İptal nedeni:');
    if (reason) {
      await forceCancel(orderId, 'ADMIN_OVERRIDE', reason);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Sipariş Yönetimi</h1>
        <p className="text-muted-foreground">
          Tüm platform siparişlerini görüntüleyin ve yönetin
        </p>
      </div>

      {/* Stats */}
      <AdminOrderStats />

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Sipariş no, alıcı veya satıcı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="PAID">Ödendi</option>
            <option value="IN_PROGRESS">Devam Ediyor</option>
            <option value="DELIVERED">Teslim Edildi</option>
            <option value="COMPLETED">Tamamlandı</option>
            <option value="DISPUTED">Anlaşmazlık</option>
            <option value="CANCELED">İptal Edildi</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <AdminOrdersTable
        orders={orders}
        isLoading={isLoading}
        onForceComplete={handleForceComplete}
        onForceCancel={handleForceCancel}
        onViewDetails={(orderId) => router.push(`/admin/orders/${orderId}`)}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => loadPage(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Önceki
          </Button>
          <span className="text-sm text-gray-600">
            Sayfa {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => loadPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Sonraki
          </Button>
        </div>
      )}
    </div>
  );
}
