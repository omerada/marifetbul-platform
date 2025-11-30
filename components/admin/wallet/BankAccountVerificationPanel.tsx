'use client';

/**
 * ================================================
 * BANK ACCOUNT VERIFICATION PANEL
 * ================================================
 * Enhanced verification panel for admin bank account review
 *
 * Features:
 * - Pending accounts queue with priority sorting
 * - Quick approve/reject actions
 * - Bulk selection and verification
 * - Detailed account view modal
 * - Real-time stats and filters
 *
 * Sprint 1 - Story 1.3: Bank Account Verification Flow
 * @version 1.0.0
 * @author MarifetBul Development Team
 */

import { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import {
  Building2,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  Clock,
  Shield,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { formatIBAN } from '@/lib/shared/formatters';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { BankAccountResponse } from '@/lib/api/bank-accounts';

// ============================================================================
// TYPES
// ============================================================================

export interface BankAccountVerificationPanelProps {
  accounts: BankAccountResponse[];
  isLoading: boolean;
  onVerify: (accountId: string) => Promise<void>;
  onReject: (accountId: string, reason: string) => Promise<void>;
  onBulkVerify: (accountIds: string[]) => Promise<void>;
  onViewDetails: (account: BankAccountResponse) => void;
  className?: string;
}

interface SortConfig {
  field: 'createdAt' | 'accountHolder' | 'bankName';
  direction: 'asc' | 'desc';
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BankAccountVerificationPanel({
  accounts,
  isLoading,
  onVerify,
  onReject,
  onBulkVerify,
  onViewDetails,
  className = '',
}: BankAccountVerificationPanelProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortConfig] = useState<SortConfig>({
    field: 'createdAt',
    direction: 'asc', // Oldest first (FIFO)
  });
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // ========================================================================
  // SORTING
  // ========================================================================

  const sortedAccounts = useMemo(() => {
    const sorted = [...accounts].sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case 'createdAt':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'accountHolder':
          comparison = a.accountHolder.localeCompare(b.accountHolder, 'tr');
          break;
        case 'bankName':
          comparison = a.bankName.localeCompare(b.bankName, 'tr');
          break;
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [accounts, sortConfig]);

  // ========================================================================
  // SELECTION HANDLERS
  // ========================================================================

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === sortedAccounts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedAccounts.map((a) => a.id)));
    }
  }, [selectedIds.size, sortedAccounts]);

  const handleSelectOne = useCallback((accountId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // ========================================================================
  // ACTION HANDLERS
  // ========================================================================

  const handleVerifySingle = useCallback(
    async (accountId: string) => {
      try {
        setProcessingIds((prev) => new Set(prev).add(accountId));
        await onVerify(accountId);
        setSelectedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(accountId);
          return newSet;
        });
      } catch (error) {
        logger.error('Failed to verify bank account', error as Error, {
          accountId,
        });
      } finally {
        setProcessingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(accountId);
          return newSet;
        });
      }
    },
    [onVerify]
  );

  const handleRejectSingle = useCallback(
    async (accountId: string) => {
      const reason = prompt('Ret nedeni:');
      if (!reason?.trim()) return;

      try {
        setProcessingIds((prev) => new Set(prev).add(accountId));
        await onReject(accountId, reason);
        setSelectedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(accountId);
          return newSet;
        });
      } catch (error) {
        logger.error('Failed to reject bank account', error as Error, {
          accountId,
        });
      } finally {
        setProcessingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(accountId);
          return newSet;
        });
      }
    },
    [onReject]
  );

  const handleBulkVerify = useCallback(async () => {
    if (selectedIds.size === 0) return;

    const confirmed = window.confirm(
      `${selectedIds.size} hesabı toplu olarak onaylamak istediğinizden emin misiniz?`
    );
    if (!confirmed) return;

    try {
      await onBulkVerify(Array.from(selectedIds));
      clearSelection();
    } catch (error) {
      logger.error('Failed to bulk verify accounts', error as Error, {
        count: selectedIds.size,
      });
    }
  }, [selectedIds, onBulkVerify, clearSelection]);

  // ========================================================================
  // STATS
  // ========================================================================

  const stats = useMemo(
    () => ({
      total: accounts.length,
      selected: selectedIds.size,
      oldestWaitDays: Math.floor(
        (Date.now() -
          new Date(
            Math.min(...accounts.map((a) => new Date(a.createdAt).getTime()))
          ).getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    }),
    [accounts, selectedIds.size]
  );

  // ========================================================================
  // RENDER
  // ========================================================================

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card className={`p-12 text-center ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Tüm Hesaplar İncelendi
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Bekleyen banka hesabı bulunmuyor
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xs text-blue-700">Toplam Bekleyen</p>
              <p className="text-lg font-bold text-blue-900">{stats.total}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-blue-300" />
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-xs text-blue-700">En Eski Bekleme</p>
              <p className="text-lg font-bold text-blue-900">
                {stats.oldestWaitDays} gün
              </p>
            </div>
          </div>
          {selectedIds.size > 0 && (
            <>
              <div className="h-8 w-px bg-blue-300" />
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-blue-700">Seçili</p>
                  <p className="text-lg font-bold text-blue-900">
                    {stats.selected}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              className="border-gray-300"
            >
              Seçimi Temizle
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleBulkVerify}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              {selectedIds.size} Hesabı Onayla
            </Button>
          </div>
        )}
      </div>

      {/* Accounts List */}
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3">
          <input
            type="checkbox"
            checked={selectedIds.size === sortedAccounts.length}
            onChange={handleSelectAll}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            aria-label="Tümünü seç"
          />
          <div className="grid flex-1 grid-cols-12 gap-4 text-xs font-medium text-gray-700">
            <div className="col-span-3">Hesap Sahibi</div>
            <div className="col-span-3">Banka</div>
            <div className="col-span-3">IBAN</div>
            <div className="col-span-2">Oluşturma</div>
            <div className="col-span-1 text-right">İşlemler</div>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-200">
          {sortedAccounts.map((account) => {
            const isSelected = selectedIds.has(account.id);
            const isProcessing = processingIds.has(account.id);
            const waitDays = Math.floor(
              (Date.now() - new Date(account.createdAt).getTime()) /
                (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={account.id}
                className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                  isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                } ${isProcessing ? 'opacity-50' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelectOne(account.id)}
                  disabled={isProcessing}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  aria-label={`Seç: ${account.accountHolder}`}
                />

                <div className="grid flex-1 grid-cols-12 gap-4">
                  {/* Account Holder */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 rounded-full bg-blue-100 p-2">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">
                          {account.accountHolder}
                        </p>
                        {waitDays >= 3 && (
                          <Badge variant="warning" className="mt-1 text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            {waitDays} gün bekliyor
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bank */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {account.bankName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {account.bankCode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* IBAN */}
                  <div className="col-span-3">
                    <p className="font-mono text-sm text-gray-900">
                      {account.maskedIban || formatIBAN(account.iban)}
                    </p>
                  </div>

                  {/* Created Date */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {new Date(account.createdAt).toLocaleDateString(
                          'tr-TR'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewDetails(account)}
                      disabled={isProcessing}
                      className="rounded p-1 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                      title="Detaylar"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleVerifySingle(account.id)}
                      disabled={isProcessing}
                      className="rounded p-1 text-green-600 hover:bg-green-100 disabled:opacity-50"
                      title="Onayla"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRejectSingle(account.id)}
                      disabled={isProcessing}
                      className="rounded p-1 text-red-600 hover:bg-red-100 disabled:opacity-50"
                      title="Reddet"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Help Text */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="space-y-1 text-sm text-blue-700">
            <p className="font-medium">Doğrulama İpuçları:</p>
            <ul className="ml-4 list-disc space-y-0.5">
              <li>
                Hesap sahibi adının kullanıcı bilgileriyle eşleştiğini kontrol
                edin
              </li>
              <li>IBAN formatının doğru olduğunu onaylayın (TR + 24 hane)</li>
              <li>Toplu onay için checkbox ile seçim yapabilirsiniz</li>
              <li>Onaylanan hesaplar kullanıcılara email ile bildirilir</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BankAccountVerificationPanel;
