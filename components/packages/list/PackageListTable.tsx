'use client';

/**
 * Package List Table Component
 * Displays seller's packages in table format with actions
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MoreVertical,
  Eye,
  Edit,
  Pause,
  Play,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import type {
  PackageSummary,
  PackageStatus,
} from '@/types/business/features/package';
import { Button } from '@/components/ui';

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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusToggle = async (
    packageId: string,
    currentStatus: PackageStatus
  ) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setLoadingId(packageId);
    try {
      await onStatusChange(packageId, newStatus);
    } finally {
      setLoadingId(null);
      setOpenMenuId(null);
    }
  };

  const handleDelete = async (packageId: string) => {
    if (confirm('Bu paketi silmek istediğinizden emin misiniz?')) {
      setLoadingId(packageId);
      try {
        await onDelete(packageId);
      } finally {
        setLoadingId(null);
        setOpenMenuId(null);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Paket
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Kategori
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Fiyat
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Durum
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              İstatistikler
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
          {packages.map((pkg) => {
            const statusConfig = STATUS_CONFIG[pkg.status];
            const StatusIcon = statusConfig.icon;

            return (
              <tr key={pkg.id} className="hover:bg-gray-50">
                {/* Package Info */}
                <td className="px-6 py-4">
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
                        href={`/dashboard/freelancer/packages/${pkg.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-purple-600"
                      >
                        {pkg.title}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {pkg.description.substring(0, 60)}...
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">
                    {pkg.categoryName}
                  </span>
                </td>

                {/* Pricing */}
                <td className="px-6 py-4">
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
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.color}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                  </span>
                </td>

                {/* Statistics */}
                <td className="px-6 py-4">
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
                </td>

                {/* Created Date */}
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {formatDate(pkg.createdAt)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="relative inline-block text-left">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === pkg.id ? null : pkg.id)
                      }
                      disabled={loadingId === pkg.id}
                      className="rounded-full p-1 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-600" />
                    </button>

                    {openMenuId === pkg.id && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        {/* Menu */}
                        <div className="ring-opacity-5 absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black">
                          <div className="py-1">
                            <Link
                              href={`/dashboard/freelancer/packages/${pkg.id}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Eye className="h-4 w-4" />
                              Görüntüle
                            </Link>
                            <Link
                              href={`/dashboard/freelancer/packages/${pkg.id}/edit`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Edit className="h-4 w-4" />
                              Düzenle
                            </Link>
                            <button
                              onClick={() =>
                                handleStatusToggle(pkg.id, pkg.status)
                              }
                              disabled={loadingId === pkg.id}
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                            >
                              {pkg.status === 'ACTIVE' ? (
                                <>
                                  <Pause className="h-4 w-4" />
                                  Duraklat
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4" />
                                  Aktif Et
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(pkg.id)}
                              disabled={loadingId === pkg.id}
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Sil
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {packages.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500">Henüz paket oluşturmadınız.</p>
          <Link href="/dashboard/freelancer/packages/create">
            <Button className="mt-4">İlk Paketinizi Oluşturun</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
