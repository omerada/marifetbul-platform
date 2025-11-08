/**
 * ================================================
 * ADMIN BANK ACCOUNT VERIFICATION TABLE
 * ================================================
 * Table component for bank account verification workflow
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created December 2024
 */

'use client';

import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Eye,
  User,
  Building2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';

// ================================================
// TYPES
// ================================================

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

// ================================================
// COMPONENT
// ================================================

export const BankAccountVerificationTable: React.FC<
  BankAccountVerificationTableProps
> = ({
  accounts,
  isLoading,
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
  onVerify,
  onReject,
  onViewDetails,
  onViewUser,
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  // ==================== HANDLERS ====================

  const handleVerify = async (accountId: string, accountHolder: string) => {
    if (
      !confirm(
        `Bu banka hesabını onaylamak istediğinizden emin misiniz?\n\nHesap Sahibi: ${accountHolder}`
      )
    ) {
      return;
    }

    setProcessingId(accountId);
    try {
      await onVerify(accountId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (accountId: string) => {
    const reason = prompt(
      'Lütfen ret nedenini girin (minimum 10 karakter):\n\nÖrnekler:\n- IBAN hesap sahibi ile kullanıcı adı eşleşmiyor\n- IBAN formatı hatalı\n- Banka bilgileri doğrulanamadı'
    );

    if (!reason) {
      return;
    }

    if (reason.length < 10) {
      alert('Ret nedeni en az 10 karakter uzunluğunda olmalıdır.');
      return;
    }

    setProcessingId(accountId);
    try {
      await onReject(accountId, reason);
    } finally {
      setProcessingId(null);
    }
  };

  // ==================== RENDER ====================

  if (isLoading && accounts.length === 0) {
    return <LoadingSkeleton />;
  }

  if (!isLoading && accounts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Hesap Sahibi
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Banka
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                IBAN
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Durum
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Talep Tarihi
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {accounts.map((account) => {
              const isProcessing = processingId === account.id;

              return (
                <tr
                  key={account.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  {/* Account Holder */}
                  <td className="px-4 py-4">
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
                  </td>

                  {/* Bank */}
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {account.bankName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {account.bankCode}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* IBAN */}
                  <td className="px-4 py-4">
                    <code className="font-mono text-sm text-gray-700">
                      {account.formattedIban || account.iban}
                    </code>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <StatusBadge type="BANK_ACCOUNT" status={account.status} />
                  </td>

                  {/* Created Date */}
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(account.createdAt)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {account.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() =>
                              handleVerify(account.id, account.accountHolder)
                            }
                            disabled={isProcessing}
                            className="inline-flex items-center space-x-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Onayla"
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                <span>Onayla</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleReject(account.id)}
                            disabled={isProcessing}
                            className="inline-flex items-center space-x-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Reddet"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reddet</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => onViewDetails(account)}
                        className="inline-flex items-center space-x-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        title="Detayları Gör"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Detay</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden">
        {accounts.map((account) => {
          const isProcessing = processingId === account.id;

          return (
            <div
              key={account.id}
              className="border-b border-gray-200 p-4 last:border-b-0"
            >
              {/* Header */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {account.accountHolder}
                    </div>
                    <div className="text-sm text-gray-500">
                      {account.bankName}
                    </div>
                  </div>
                </div>
                <StatusBadge type="BANK_ACCOUNT" status={account.status} />
              </div>

              {/* IBAN */}
              <div className="mb-3">
                <div className="mb-1 text-xs font-medium text-gray-500">
                  IBAN
                </div>
                <code className="font-mono text-sm text-gray-700">
                  {account.formattedIban || account.iban}
                </code>
              </div>

              {/* Date */}
              <div className="mb-3 flex items-center space-x-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{formatDate(account.createdAt)}</span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {account.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() =>
                        handleVerify(account.id, account.accountHolder)
                      }
                      disabled={isProcessing}
                      className="inline-flex flex-1 items-center justify-center space-x-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Onayla</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleReject(account.id)}
                      disabled={isProcessing}
                      className="inline-flex flex-1 items-center justify-center space-x-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reddet</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => onViewDetails(account)}
                  className="inline-flex flex-1 items-center justify-center space-x-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  <span>Detay</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Sayfa <span className="font-medium">{currentPage + 1}</span> /{' '}
              <span className="font-medium">{totalPages}</span> (
              <span className="font-medium">{totalElements}</span> kayıt)
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-1">Önceki</span>
              </button>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="mr-1">Sonraki</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ================================================
// LOADING SKELETON
// ================================================

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
};

// ================================================
// EMPTY STATE
// ================================================

const EmptyState: React.FC = () => {
  return (
    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
      <Building2 className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        Bekleyen Banka Hesabı Yok
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        Tüm banka hesapları işlenmiş durumda.
      </p>
    </div>
  );
};
