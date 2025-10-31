'use client';

/**
 * Package List Page Container
 * Main page for seller's package management
 */

import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { packageApi } from '@/lib/api/packages';
import {
  PackageListTable,
  PackageListFilters,
  PackageListStats,
} from '@/components/packages/list';
import { Button } from '@/components/ui';
import type {
  PackageSummary,
  PackageStatus,
  PackageSortBy,
} from '@/types/business/features/package';
import { transformServicePackagesToSummaries } from '@/lib/transformers/package.transformer';

export function PackageListContainer() {
  const [packages, setPackages] = useState<PackageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PackageStatus | 'ALL'>(
    'ALL'
  );
  const [sortBy, setSortBy] = useState<PackageSortBy>('CREATED_AT');

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    totalPackages: 0,
    activePackages: 0,
    totalViews: 0,
    totalOrders: 0,
    averageRating: 0,
  });

  // Fetch packages
  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string> = {
        page: page.toString(),
        size: '20',
        sort: sortBy,
      };

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      // getUserPackages accepts (page, limit) - sortBy handled by backend default
      const response = await packageApi.getUserPackages(page, 20);

      // Transform ServicePackage[] to PackageSummary[]
      const transformedPackages = transformServicePackagesToSummaries(
        response.data
      );
      setPackages(transformedPackages);
      setTotalPages(response.pagination?.totalPages || 1);

      // Stats - using pagination.total instead of totalItems
      setStats({
        totalPackages: response.pagination?.total || 0,
        activePackages:
          transformedPackages.filter((p) => p.status === 'ACTIVE').length || 0,
        totalViews: 0,
        totalOrders: 0,
        averageRating: 0,
      });
    } catch (err) {
      setError('Paketler yüklenirken bir hata oluştu');
      console.error('Failed to fetch packages:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sortBy, page, searchQuery]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleSearch = () => {
    setPage(0);
    fetchPackages();
  };

  const handleStatusChange = async (
    packageId: string,
    newStatus: PackageStatus
  ) => {
    try {
      if (newStatus === 'ACTIVE') {
        await packageApi.activatePackage(packageId);
      } else if (newStatus === 'PAUSED') {
        await packageApi.pausePackage(packageId);
      }
      fetchPackages();
    } catch (err) {
      alert('Durum değiştirilemedi');
      console.error('Failed to change status:', err);
    }
  };

  const handleDelete = async (packageId: string) => {
    try {
      await packageApi.deletePackage(packageId);
      fetchPackages();
    } catch (err) {
      alert('Paket silinemedi');
      console.error('Failed to delete package:', err);
    }
  };

  if (loading && packages.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paketlerim</h1>
          <p className="mt-1 text-gray-600">Hizmet paketlerinizi yönetin</p>
        </div>
        <Link href="/dashboard/freelancer/packages/create">
          <Button leftIcon={<Plus className="h-5 w-5" />}>
            Yeni Paket Oluştur
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <PackageListStats {...stats} />

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <PackageListFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSearch} variant="outline" size="sm">
            Ara
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <PackageListTable
          packages={packages}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
          >
            Önceki
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-700">
            Sayfa {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
          >
            Sonraki
          </Button>
        </div>
      )}
    </div>
  );
}
