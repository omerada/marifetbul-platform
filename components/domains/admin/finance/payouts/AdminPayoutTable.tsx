'use client';

/**
 * ================================================
 * ADMIN PAYOUT TABLE - UNIFIED VERSION
 * ================================================
 * Sprint 2 - Migration to UnifiedDataTable
 * 500+ lines → ~150 lines (-70%)
 */

import React, { useMemo, useState } from 'react';
import { UnifiedDataTable } from '@/lib/components/unified/UnifiedDataTable';
import type { Column, RowAction } from '@/lib/components/unified/UnifiedDataTable';
import type { Payout } from '@/types/business/features/wallet';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Wallet, CheckCircle, XCircle, Ban, Eye } from 'lucide-react';
import { maskIBAN } from '@/lib/api/admin/payout-admin-api';

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
  selectedIds,
  onToggleSelection,
}) => {
  const [_processingId, setProcessingId] = useState<string | null>(null);

  const columns = useMemo<Column<Payout>[]>(
    () => [
      {
        id: 'user',
        header: 'Kullanıcı',
        render: (_, payout) => (
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
        ),
      },
      {
        id: 'amount',
        header: 'Tutar',
        accessor: 'amount',
        formatter: 'currency',
        align: 'right',
        sortable: true,
      },
      {
        id: 'bankAccount',
        header: 'Banka Hesabı',
        render: (_, payout) => (
          <div className="text-sm">
            <div className="font-mono text-gray-900">
              {maskIBAN(payout.bankAccountInfo?.iban || '')}
            </div>
            <div className="text-gray-500">
              {payout.bankAccountInfo?.accountHolder}
            </div>
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Durum',
        accessor: 'status',
        render: (value) => (
          <StatusBadge
            type="PAYOUT"
            status={value as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'}
            size="md"
            showIcon
          />
        ),
        sortable: true,
      },
      {
        id: 'requestedAt',
        header: 'Talep Tarihi',
        accessor: 'requestedAt',
        formatter: 'date',
        sortable: true,
      },
      {
        id: 'updatedAt',
        header: 'Güncelleme',
        render: (_, payout) => (
          <span className="text-sm text-gray-900">
            {new Date(
              payout.processedAt || payout.completedAt || payout.requestedAt
            ).toLocaleDateString('tr-TR')}
          </span>
        ),
      },
    ],
    []
  );

  const rowActions = useMemo<RowAction<Payout>[]>(
    () => [
      {
        id: 'view',
        label: 'Detayları Görüntüle',
        icon: Eye,
        onClick: (payout) => onViewDetails(payout),
      },
      {
        id: 'viewWallet',
        label: 'Cüzdan Görüntüle',
        icon: Wallet,
        onClick: (payout) => onViewUserWallet(payout.userId),
      },
      {
        id: 'process',
        label: 'Onayla ve İşle',
        icon: CheckCircle,
        variant: 'success',
        show: (payout) => payout.status === 'PENDING',
        onClick: async (payout) => {
          if (
            confirm(
              `Bu ödemeyi onaylıyor musunuz?\nMiktar: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(payout.amount)}`
            )
          ) {
            setProcessingId(payout.id);
            try {
              await onProcess(payout.id);
            } finally {
              setProcessingId(null);
            }
          }
        },
      },
      {
        id: 'cancel',
        label: 'İptal Et',
        icon: Ban,
        variant: 'warning',
        show: (payout) => payout.status === 'PENDING',
        onClick: async (payout) => {
          if (
            confirm(
              'Bu ödemeyi iptal etmek ve kullanıcının cüzdanına iade etmek istiyor musunuz?'
            )
          ) {
            setProcessingId(payout.id);
            try {
              await onCancel(payout.id);
            } finally {
              setProcessingId(null);
            }
          }
        },
      },
      {
        id: 'complete',
        label: 'Tamamlandı Olarak İşaretle',
        icon: CheckCircle,
        variant: 'success',
        show: (payout) => payout.status === 'PROCESSING',
        onClick: async (payout) => {
          if (confirm('Banka transferi tamamlandı mı?')) {
            setProcessingId(payout.id);
            try {
              await onComplete(payout.id);
            } finally {
              setProcessingId(null);
            }
          }
        },
      },
      {
        id: 'fail',
        label: 'Başarısız Olarak İşaretle',
        icon: XCircle,
        variant: 'danger',
        show: (payout) => payout.status === 'PROCESSING',
        onClick: async (payout) => {
          const reason = prompt(
            'Başarısız nedeni girin (minimum 10 karakter):'
          );
          if (reason && reason.length >= 10) {
            setProcessingId(payout.id);
            try {
              await onFail(payout.id, reason);
            } finally {
              setProcessingId(null);
            }
          } else if (reason !== null) {
            alert('Lütfen en az 10 karakter uzunluğunda bir neden girin.');
          }
        },
      },
    ],
    [onViewDetails, onViewUserWallet, onProcess, onCancel, onComplete, onFail]
  );

  return (
    <UnifiedDataTable<Payout>
      data={payouts}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="Henüz hiçbir para çekme talebi bulunmuyor."
      rowActions={rowActions}
      selection={
        onToggleSelection
          ? {
              enabled: true,
              rowIdAccessor: 'id',
              selectedIds: Array.from(selectedIds || []),
              onSelectionChange: (ids) => {
                ids.forEach((id) => onToggleSelection(id));
              },
            }
          : undefined
      }
      pagination={{
        enabled: true,
        currentPage,
        pageSize: 10,
        totalItems: totalPages * 10,
        onPageChange,
      }}
      sorting={{
        enabled: true,
        serverSide: false,
      }}
      hoverable
      className="rounded-lg border border-gray-200 bg-white"
    />
  );
};

AdminPayoutTable.displayName = 'AdminPayoutTable';
