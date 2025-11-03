/**
 * ================================================
 * ADMIN BANK ACCOUNT VERIFICATION PAGE
 * ================================================
 * Admin interface for verifying user bank accounts
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created December 2024
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks';
import {
  BankAccountVerificationTable,
  BankAccountStatistics,
  type BankAccountStats,
} from '@/components/admin/wallet';
import {
  getPendingBankAccounts,
  verifyBankAccount,
  rejectBankAccount,
  getBankAccountStatistics,
} from '@/lib/api/bank-accounts';
import { Building2, RefreshCw } from 'lucide-react';

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

// ================================================
// COMPONENT
// ================================================

export default function AdminBankAccountVerificationPage() {
  const { success, error: showError } = useToast();

  // State
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [stats, setStats] = useState<BankAccountStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // ==================== DATA FETCHING ====================

  const fetchPendingAccounts = useCallback(
    async (page: number = 0) => {
      try {
        setIsLoading(true);

        const response = await getPendingBankAccounts({
          page,
          size: 20,
          sortBy: 'createdAt',
          sortDirection: 'ASC', // Oldest first
        });

        setAccounts(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        setCurrentPage(response.number);
      } catch (error) {
        console.error('Error fetching pending accounts:', error);
        showError('Hata', 'Bekleyen hesaplar yüklenirken hata oluştu');
      } finally {
        setIsLoading(false);
      }
    },
    [showError]
  );

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await getBankAccountStatistics();
      setStats(response);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchPendingAccounts(currentPage), fetchStatistics()]);
    setIsRefreshing(false);
  };

  // Initial load
  useEffect(() => {
    fetchPendingAccounts(0);
    fetchStatistics();
  }, [fetchPendingAccounts, fetchStatistics]);

  // ==================== HANDLERS ====================

  const handleVerify = async (accountId: string) => {
    try {
      await verifyBankAccount(accountId);
      success('Başarılı', 'Banka hesabı onaylandı');
      await refreshData();
    } catch (error) {
      console.error('Error verifying account:', error);
      showError('Hata', 'Hesap onaylanırken hata oluştu');
    }
  };

  const handleReject = async (accountId: string, reason: string) => {
    try {
      await rejectBankAccount(accountId, reason);
      success('Başarılı', 'Banka hesabı reddedildi');
      await refreshData();
    } catch (error) {
      console.error('Error rejecting account:', error);
      showError('Hata', 'Hesap reddedilirken hata oluştu');
    }
  };

  const handleViewDetails = (_account: BankAccount) => {
    // TODO: Open detail modal
  };

  const handlePageChange = (page: number) => {
    fetchPendingAccounts(page);
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-blue-600 p-3">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Banka Hesabı Doğrulama
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Kullanıcıların banka hesaplarını inceleyin ve onaylayın
                </p>
              </div>
            </div>

            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="inline-flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>Yenile</span>
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <BankAccountStatistics stats={stats} isLoading={!stats} />
        </div>

        {/* Pending Queue */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Bekleyen Hesaplar
              </h2>
              <p className="text-sm text-gray-500">
                Onay bekleyen {totalElements} banka hesabı
              </p>
            </div>
          </div>

          <BankAccountVerificationTable
            accounts={accounts}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={handlePageChange}
            onVerify={handleVerify}
            onReject={handleReject}
            onViewDetails={handleViewDetails}
          />
        </div>

        {/* Help Text */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-2 font-medium text-blue-900">Doğrulama İpuçları</h3>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>
              • Hesap sahibi adının kullanıcı adı ile eşleştiğinden emin olun
            </li>
            <li>• IBAN formatının doğru olduğunu kontrol edin</li>
            <li>
              • Şüpheli durumlarda hesabı reddedin ve açık bir neden belirtin
            </li>
            <li>
              • Onaylanan hesaplar kullanıcılar tarafından ödeme talebi için
              kullanılabilir
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
