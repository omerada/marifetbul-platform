'use client';

/**
 * ================================================
 * BANK ACCOUNT VERIFICATION TABLE - UNIFIED VERSION
 * ================================================
 * Sprint 2 - Migration to UnifiedDataTable
 * 450+ lines → ~140 lines (-69%)
 */

import React, { useMemo, useState } from 'react';
import { UnifiedDataTable } from '@/lib/components/unified/UnifiedDataTable';
import type { Column, RowAction } from '@/lib/components/unified/UnifiedDataTable';
import { CheckCircle, XCircle, Eye, User, Building2, Clock } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface BankAccount {
  id: string;
  userId: string;
  iban: string;
  formattedIban?: string;
  bankCode: string;
  bankName: string;
  accountHolder: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface BankAccountVerificationTableProps {
  accounts: BankAccount[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onVerify: (accountId: string) => Promise<void>;
  onReject: (accountId: string, reason: string) => Promise<void>;
  onViewDetails: (account: BankAccount) => void;
  onViewUser?: (userId: string) => void;
}

export const BankAccountVerificationTable: React.FC<
  BankAccountVerificationTableProps
> = ({
  accounts,
  isLoading,
  currentPage,
  totalElements,
  onPageChange,
  onVerify,
  onReject,
  onViewDetails,
  onViewUser,
}) => {
  const [_processingId, setProcessingId] = useState<string | null>(null);

  const columns = useMemo<Column<BankAccount>[]>(
    () => [
      {
        id: 'accountHolder',
        header: 'Hesap Sahibi',
        render: (_, account) => (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 rounded-full bg-blue-100 p-2">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {account.accountHolder}
              </div>
              {onViewUser && (
                <button
                  onClick={() => onViewUser(account.userId)}
                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Kullanıcı Profili →
                </button>
              )}
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        id: 'bank',
        header: 'Banka',
        render: (_, account) => (
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900">{account.bankName}</div>
              <div className="text-xs text-gray-500">{account.bankCode}</div>
            </div>
          </div>
        ),
      },
      {
        id: 'iban',
        header: 'IBAN',
        render: (_, account) => (
          <code className="font-mono text-sm text-gray-700">
            {account.formattedIban || account.iban}
          </code>
        ),
      },
      {
        id: 'status',
        header: 'Durum',
        accessor: 'status',
        render: (value) => (
          <StatusBadge
            type="BANK_ACCOUNT"
            status={value as 'PENDING' | 'VERIFIED' | 'REJECTED'}
          />
        ),
        sortable: true,
      },
      {
        id: 'createdAt',
        header: 'Talep Tarihi',
        accessor: 'createdAt',
        render: (value) => (
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{new Date(value as string).toLocaleString('tr-TR')}</span>
          </div>
        ),
        sortable: true,
      },
    ],
    [onViewUser]
  );

  const rowActions = useMemo<RowAction<BankAccount>[]>(
    () => [
      {
        id: 'verify',
        label: 'Onayla',
        icon: CheckCircle,
        variant: 'success',
        show: (account) => account.status === 'PENDING',
        onClick: async (account) => {
          if (
            confirm(
              `Bu banka hesabını onaylamak istediğinizden emin misiniz?\n\nHesap Sahibi: ${account.accountHolder}`
            )
          ) {
            setProcessingId(account.id);
            try {
              await onVerify(account.id);
            } finally {
              setProcessingId(null);
            }
          }
        },
      },
      {
        id: 'reject',
        label: 'Reddet',
        icon: XCircle,
        variant: 'danger',
        show: (account) => account.status === 'PENDING',
        onClick: async (account) => {
          const reason = prompt(
            'Lütfen ret nedenini girin (minimum 10 karakter):\n\nÖrnekler:\n- IBAN hesap sahibi ile kullanıcı adı eşleşmiyor\n- IBAN formatı hatalı\n- Banka bilgileri doğrulanamadı'
          );
          if (reason && reason.length >= 10) {
            setProcessingId(account.id);
            try {
              await onReject(account.id, reason);
            } finally {
              setProcessingId(null);
            }
          } else if (reason !== null) {
            alert('Ret nedeni en az 10 karakter uzunluğunda olmalıdır.');
          }
        },
      },
      {
        id: 'view',
        label: 'Detay',
        icon: Eye,
        onClick: (account) => onViewDetails(account),
      },
    ],
    [onVerify, onReject, onViewDetails]
  );

  return (
    <UnifiedDataTable<BankAccount>
      data={accounts}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="Tüm banka hesapları işlenmiş durumda."
      rowActions={rowActions}
      pagination={{
        enabled: true,
        currentPage,
        pageSize: 10,
        totalItems: totalElements,
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
