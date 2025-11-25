'use client';

/**
 * ================================================
 * PACKAGE LIST TABLE - UNIFIED VERSION
 * ================================================
 * Sprint 2 - Migration to UnifiedDataTable
 * 280+ lines → ~130 lines (-54%)
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UnifiedDataTable } from '@/lib/components/unified/UnifiedDataTable';
import type {
  Column,
  RowAction,
} from '@/lib/components/unified/UnifiedDataTable';
import type {
  PackageSummary,
  PackageStatus,
} from '@/types/business/features/package';
import { Eye, Edit, Pause, Play, Trash2, TrendingUp } from 'lucide-react';

interface PackageListTableProps {
  packages: PackageSummary[];
  onStatusChange: (
    packageId: string,
    newStatus: PackageStatus
  ) => Promise<void>;
  onDelete: (packageId: string) => Promise<void>;
}

const STATUS_CONFIG = {
  ACTIVE: { label: 'Aktif', color: 'bg-green-100 text-green-800', icon: Play },
  PAUSED: {
    label: 'Duraklatıldı',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Pause,
  },
  DRAFT: { label: 'Taslak', color: 'bg-gray-100 text-gray-800', icon: Edit },
  INACTIVE: { label: 'İnaktif', color: 'bg-red-100 text-red-800', icon: Pause },
} as const;

export function PackageListTable({
  packages,
  onStatusChange,
  onDelete,
}: PackageListTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const columns = useMemo<Column<PackageSummary>[]>(
    () => [
      {
        id: 'package',
        header: 'Paket',
        render: (_, pkg) => (
          <div className="flex items-center">
            <Image
              src={pkg.coverImage}
              alt={pkg.title}
              width={48}
              height={48}
              className="rounded-lg object-cover"
            />
            <div className="ml-4">
              <Link
                href={`/marketplace/packages/${pkg.id}`}
                className="text-sm font-medium text-gray-900 hover:text-purple-600"
              >
                {pkg.title}
              </Link>
              <p className="text-xs text-gray-500">
                {pkg.description.substring(0, 60)}...
              </p>
            </div>
          </div>
        ),
      },
      {
        id: 'category',
        header: 'Kategori',
        accessor: 'categoryName',
        sortable: true,
      },
      {
        id: 'pricing',
        header: 'Fiyat',
        render: (_, pkg) => {
          const formatPrice = (price: number) =>
            new Intl.NumberFormat('tr-TR', {
              style: 'currency',
              currency: 'TRY',
            }).format(price);

          return (
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {formatPrice(pkg.basicPrice)}
              </div>
              {pkg.premiumPrice && (
                <div className="text-xs text-gray-500">
                  - {formatPrice(pkg.premiumPrice)}
                </div>
              )}
            </div>
          );
        },
        sortable: true,
      },
      {
        id: 'status',
        header: 'Durum',
        accessor: 'status',
        render: (value) => {
          const statusConfig = STATUS_CONFIG[value as PackageStatus];
          const StatusIcon = statusConfig.icon;
          return (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.color}`}
            >
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </span>
          );
        },
        sortable: true,
      },
      {
        id: 'statistics',
        header: 'İstatistikler',
        render: (_, pkg) => (
          <div className="text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {pkg.views} görüntülenme
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {pkg.orders} sipariş
            </div>
            {pkg.rating && (
              <div>
                ⭐ {pkg.rating.toFixed(1)} ({pkg.reviewCount})
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'createdAt',
        header: 'Oluşturulma',
        accessor: 'createdAt',
        formatter: 'date',
        sortable: true,
      },
    ],
    []
  );

  const rowActions = useMemo<RowAction<PackageSummary>[]>(
    () => [
      {
        id: 'view',
        label: 'Görüntüle',
        icon: Eye,
        onClick: (pkg) => {
          window.location.href = `/marketplace/packages/${pkg.id}`;
        },
      },
      {
        id: 'edit',
        label: 'Düzenle',
        icon: Edit,
        onClick: (pkg) => {
          window.location.href = `/marketplace/packages/${pkg.id}/edit`;
        },
      },
      {
        id: 'pause',
        label: 'Duraklat',
        icon: Pause,
        show: (pkg) => pkg.status === 'ACTIVE',
        onClick: async (pkg) => {
          setLoadingId(pkg.id);
          try {
            await onStatusChange(pkg.id, 'PAUSED');
          } finally {
            setLoadingId(null);
          }
        },
      },
      {
        id: 'activate',
        label: 'Aktif Et',
        icon: Play,
        show: (pkg) => pkg.status !== 'ACTIVE',
        onClick: async (pkg) => {
          setLoadingId(pkg.id);
          try {
            await onStatusChange(pkg.id, 'ACTIVE');
          } finally {
            setLoadingId(null);
          }
        },
      },
      {
        id: 'delete',
        label: 'Sil',
        icon: Trash2,
        variant: 'danger',
        onClick: async (pkg) => {
          if (confirm('Bu paketi silmek istediğinizden emin misiniz?')) {
            setLoadingId(pkg.id);
            try {
              await onDelete(pkg.id);
            } finally {
              setLoadingId(null);
            }
          }
        },
      },
    ],
    [onStatusChange, onDelete]
  );

  return (
    <UnifiedDataTable<PackageSummary>
      data={packages}
      columns={columns}
      isLoading={loadingId !== null}
      emptyMessage="Henüz paket oluşturmadınız."
      rowActions={rowActions}
      sorting={{
        enabled: true,
        serverSide: false,
      }}
      hoverable
      className="overflow-x-auto"
    />
  );
}
