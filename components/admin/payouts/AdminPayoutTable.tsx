'use client';

/**
 * ================================================
 * ADMIN PAYOUT TABLE
 * ================================================
 * Main table component for displaying payout requests
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 26, 2025
 */

'use client';

import { useState } from 'react';
import type { Payout } from '@/types/business/features/wallet';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Ban,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { maskIBAN } from '@/lib/api/admin/payout-admin-api';
import { formatCurrency, formatDate } from '@/lib/shared/formatters'; // Sprint 2: Use canonical formatters
import { Skeleton } from '@/components/ui/UnifiedSkeleton';

// ================================================
// TYPES
// ================================================

export interface AdminPayoutTableProps {
  payouts: Payout[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetails: (payout: Payout) => void;
  onProcess: (payoutId: string) => void;
  onComplete: (payoutId: string) => void;
  onFail: (payoutId: string, reason: string) => void;
  onCancel: (payoutId: string) => void;
  onViewUserWallet: (userId: string) => void;
  selectedIds?: Set<string>;
  onToggleSelection?: (payoutId: string) => void;
  onToggleSelectAll?: () => void;
}

// ================================================
// COMPONENT
// ================================================

export const AdminPayoutTable: React.FC<AdminPayoutTableProps> = ({
  payouts,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onViewDetails,
  onProcess,
  onComplete,
  onFail,
  onCancel,
  onViewUserWallet,
  selectedIds = new Set(),
  onToggleSelection,
  onToggleSelectAll,
}) => {
  const [actionDropdownOpen, setActionDropdownOpen] = useState<string | null>(
    null
  );
  const [processingId, setProcessingId] = useState<string | null>(null);

  // ==================== HANDLERS ====================

  const handleAction = async (
    action: () => Promise<void>,
    payoutId: string
  ) => {
    setProcessingId(payoutId);
    setActionDropdownOpen(null);
    try {
      await action();
    } finally {
      setProcessingId(null);
    }
  };

  const handleFailWithReason = (payoutId: string) => {
    const reason = prompt('Başarısız nedeni girin (minimum 10 karakter):');
    if (reason && reason.length >= 10) {
      handleAction(() => Promise.resolve(onFail(payoutId, reason)), payoutId);
    } else if (reason !== null) {
      alert('Lütfen en az 10 karakter uzunluğunda bir neden girin.');
    }
  };

  const handleCancelWithConfirm = (payoutId: string) => {
    if (
      confirm(
        'Bu ödemeyi iptal etmek ve kullanıcının cüzdanına iade etmek istiyor musunuz?'
      )
    ) {
      handleAction(() => Promise.resolve(onCancel(payoutId)), payoutId);
    }
  };

  const handleProcessWithConfirm = (payoutId: string, amount: number) => {
    if (
      confirm(
        `Bu ödemeyi onaylıyor musunuz?\nMiktar: ${formatCurrency(amount)}`
      )
    ) {
      handleAction(() => Promise.resolve(onProcess(payoutId)), payoutId);
    }
  };

  const handleCompleteWithConfirm = (payoutId: string) => {
    if (confirm('Banka transferi tamamlandı mı?')) {
      handleAction(() => Promise.resolve(onComplete(payoutId)), payoutId);
    }
  };

  // ==================== RENDER ====================

  if (isLoading && payouts.length === 0) {
    return <LoadingSkeleton />;
  }

  if (!isLoading && payouts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              {onToggleSelectAll && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size === payouts.length && payouts.length > 0
                    }
                    onChange={onToggleSelectAll}
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-700 uppercase">
                Kullanıcı
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-700 uppercase">
                Tutar
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-700 uppercase">
                Banka Hesabı
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-700 uppercase">
                Durum
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-700 uppercase">
                Talep Tarihi
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-700 uppercase">
                Güncelleme
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium tracking-wide text-gray-700 uppercase">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payouts.map((payout) => (
              <tr
                key={payout.id}
                className="transition-colors hover:bg-gray-50"
              >
                {/* Checkbox */}
                {onToggleSelection && (
                  <td className="w-12 px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(payout.id)}
                      onChange={() => onToggleSelection(payout.id)}
                      className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}

                {/* User */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Kullanıcı {payout.userId.substring(0, 8)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {payout.userId.substring(0, 13)}...
                      </div>
                    </div>
                  </div>
                </td>

                {/* Amount */}
                <td className="px-4 py-4">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(payout.amount)}
                  </div>
                </td>

                {/* Bank Account */}
                <td className="px-4 py-4">
                  <div className="text-sm">
                    <div className="font-mono text-gray-900">
                      {maskIBAN(payout.bankAccountInfo?.iban || '')}
                    </div>
                    <div className="text-gray-500">
                      {payout.bankAccountInfo?.accountHolder}
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <StatusBadge
                    type="PAYOUT"
                    status={payout.status as any}
                    size="md"
                    showIcon
                  />
                </td>

                {/* Request Date */}
                <td className="px-4 py-4 text-sm text-gray-900">
                  {formatDate(payout.requestedAt)}
                </td>

                {/* Updated Date */}
                <td className="px-4 py-4 text-sm text-gray-900">
                  {formatDate(
                    payout.processedAt ||
                      payout.completedAt ||
                      payout.requestedAt
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-4 text-right">
                  <div className="relative inline-block text-left">
                    <button
                      onClick={() =>
                        setActionDropdownOpen(
                          actionDropdownOpen === payout.id ? null : payout.id
                        )
                      }
                      disabled={processingId === payout.id}
                      className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                    >
                      {processingId === payout.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <MoreVertical className="h-5 w-5" />
                      )}
                    </button>

                    {actionDropdownOpen === payout.id && (
                      <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md border border-gray-200 bg-white shadow-lg">
                        <div className="py-1">
                          {/* View Details */}
                          <button
                            onClick={() => {
                              onViewDetails(payout);
                              setActionDropdownOpen(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4" />
                            Detayları Görüntüle
                          </button>

                          {/* View User Wallet */}
                          <button
                            onClick={() => {
                              onViewUserWallet(payout.userId);
                              setActionDropdownOpen(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Wallet className="h-4 w-4" />
                            Cüzdan Görüntüle
                          </button>

                          <div className="my-1 border-t border-gray-100" />

                          {/* Status-based actions */}
                          {payout.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() =>
                                  handleProcessWithConfirm(
                                    payout.id,
                                    payout.amount
                                  )
                                }
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Onayla ve İşle
                              </button>
                              <button
                                onClick={() =>
                                  handleCancelWithConfirm(payout.id)
                                }
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Ban className="h-4 w-4" />
                                İptal Et
                              </button>
                            </>
                          )}

                          {payout.status === 'PROCESSING' && (
                            <>
                              <button
                                onClick={() =>
                                  handleCompleteWithConfirm(payout.id)
                                }
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Tamamlandı Olarak İşaretle
                              </button>
                              <button
                                onClick={() => handleFailWithReason(payout.id)}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4" />
                                Başarısız Olarak İşaretle
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="divide-y divide-gray-200 lg:hidden">
        {payouts.map((payout) => (
          <div key={payout.id} className="p-4">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    Kullanıcı {payout.userId.substring(0, 8)}
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {payout.userId.substring(0, 13)}...
                  </div>
                </div>
              </div>
              <StatusBadge
                type="PAYOUT"
                status={payout.status as any}
                size="sm"
                showIcon
              />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tutar:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(payout.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IBAN:</span>
                <span className="font-mono text-gray-900">
                  {maskIBAN(payout.bankAccountInfo?.iban || '')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Talep:</span>
                <span className="text-gray-900">
                  {formatDate(payout.requestedAt)}
                </span>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => onViewDetails(payout)}
                className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Detaylar
              </button>
              {payout.status === 'PENDING' && (
                <button
                  onClick={() =>
                    handleProcessWithConfirm(payout.id, payout.amount)
                  }
                  disabled={processingId === payout.id}
                  className="flex-1 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {processingId === payout.id ? 'İşleniyor...' : 'Onayla'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <div className="text-sm text-gray-700">
            Sayfa {currentPage + 1} / {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Önceki
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Sonraki
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ================================================
// LOADING SKELETON
// ================================================

const LoadingSkeleton = () => (
  <div className="rounded-lg border border-gray-200 bg-white p-4">
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      ))}
    </div>
  </div>
);

// ================================================
// EMPTY STATE
// ================================================

const EmptyState = () => (
  <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
    <Wallet className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-4 text-lg font-medium text-gray-900">
      Para Çekme Talebi Yok
    </h3>
    <p className="mt-2 text-sm text-gray-600">
      Henüz hiçbir para çekme talebi bulunmuyor.
    </p>
  </div>
);

AdminPayoutTable.displayName = 'AdminPayoutTable';
