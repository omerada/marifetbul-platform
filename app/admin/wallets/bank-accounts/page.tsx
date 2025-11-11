/**
 * ================================================
 * ADMIN BANK ACCOUNT VERIFICATION PAGE
 * ================================================
 * Admin interface for verifying user bank accounts
 * 
 * Route: /admin/wallets/bank-accounts
 *
 * Sprint 1 - Day 1: Wallet Route Consolidation
 * - Merged /admin/wallet/bank-verifications with /admin/wallets/bank-accounts
 * - Unified best features from both implementations
 * - Clean, production-ready code
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 1 Consolidated
 * @updated November 7, 2025
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
import {
  Building2,
  RefreshCw,
  Shield,
  CheckCircle2,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import logger from '@/lib/infrastructure/monitoring/logger';

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
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(
    null
  );

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
        logger.error(
          'Failed to fetch pending bank accounts',
          error,
          { component: 'AdminBankAccountVerificationPage', action: 'fetchPendingAccounts', page }
        );
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
      logger.error(
        'Failed to fetch bank account statistics',
        error,
        { component: 'AdminBankAccountVerificationPage', action: 'fetchStatistics' }
      );
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
      logger.error(
        'Failed to verify bank account',
        error,
        { component: 'AdminBankAccountVerificationPage', action: 'handleVerify', accountId }
      );
      showError('Hata', 'Hesap onaylanırken hata oluştu');
    }
  };

  const handleReject = async (accountId: string, reason: string) => {
    try {
      await rejectBankAccount(accountId, reason);
      success('Başarılı', 'Banka hesabı reddedildi');
      await refreshData();
    } catch (error) {
      logger.error(
        'Failed to reject bank account',
        error,
        { component: 'AdminBankAccountVerificationPage', action: 'handleReject', accountId, reason }
      );
      showError('Hata', 'Hesap reddedilirken hata oluştu');
    }
  };

  const handleViewDetails = (account: BankAccount) => {
    setSelectedAccount(account);
  };

  const handlePageChange = (page: number) => {
    fetchPendingAccounts(page);
  };

  // ==================== RENDER ====================

  const handleVerificationComplete = (accountId: string, approved: boolean) => {
    // Audit log for compliance
    logger.info('Bank account verification completed', { 
      accountId, 
      approved,
      adminUser: 'current-admin-id' // TODO: Get from auth context
    });
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Page Header - Enhanced Design */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-4 shadow-lg">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                Banka Hesabı Onayları
              </h1>
              <Badge variant="warning" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Admin
              </Badge>
            </div>
            <p className="mt-1 text-gray-600">
              Kullanıcıların eklediği banka hesaplarını inceleyin ve onaylayın
            </p>
          </div>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="inline-flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>Yenile</span>
          </button>
        </div>
      </div>

      {/* Info Cards - Best Practice Guidance */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-600 p-2">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Güvenlik Kontrolü
              </p>
              <p className="mt-1 text-xs text-blue-700">
                IBAN formatı ve hesap sahibi bilgilerini doğrulayın
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-green-600 p-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-900">Hızlı Onay</p>
              <p className="mt-1 text-xs text-green-700">
                Tek tıkla onaylama ve red işlemleri
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-purple-200 bg-purple-50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-purple-600 p-2">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900">
                Detaylı Bilgi
              </p>
              <p className="mt-1 text-xs text-purple-700">
                Tam IBAN ve kullanıcı bilgilerine erişim
              </p>
            </div>
          </div>
        </Card>
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

        {/* Bank Account Detail Modal */}
        <Dialog
          open={!!selectedAccount}
          onOpenChange={(open) => !open && setSelectedAccount(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Banka Hesabı Detayları</DialogTitle>
                <button
                  onClick={() => setSelectedAccount(null)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </DialogHeader>

            {selectedAccount && (
              <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-center">
                  {selectedAccount.status === 'PENDING' && (
                    <div className="inline-flex items-center space-x-2 rounded-full bg-yellow-100 px-4 py-2 text-yellow-800">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-600" />
                      <span className="font-medium">Onay Bekliyor</span>
                    </div>
                  )}
                  {selectedAccount.status === 'VERIFIED' && (
                    <div className="inline-flex items-center space-x-2 rounded-full bg-green-100 px-4 py-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Onaylandı</span>
                    </div>
                  )}
                  {selectedAccount.status === 'REJECTED' && (
                    <div className="inline-flex items-center space-x-2 rounded-full bg-red-100 px-4 py-2 text-red-800">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">Reddedildi</span>
                    </div>
                  )}
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Account Holder */}
                    <div className="col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        <User className="mb-1 inline h-4 w-4" /> Hesap Sahibi
                      </label>
                      <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 font-medium text-gray-900">
                        {selectedAccount.accountHolder}
                      </div>
                    </div>

                    {/* Bank Name */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        <Building2 className="mb-1 inline h-4 w-4" /> Banka Adı
                      </label>
                      <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900">
                        {selectedAccount.bankName}
                      </div>
                    </div>

                    {/* Bank Code */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Banka Kodu
                      </label>
                      <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-gray-900">
                        {selectedAccount.bankCode}
                      </div>
                    </div>

                    {/* IBAN */}
                    <div className="col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        IBAN
                      </label>
                      <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-gray-900">
                        {selectedAccount.formattedIban || selectedAccount.iban}
                      </div>
                    </div>

                    {/* Created Date */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        <Calendar className="mb-1 inline h-4 w-4" /> Oluşturma
                        Tarihi
                      </label>
                      <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900">
                        {new Date(selectedAccount.createdAt).toLocaleString(
                          'tr-TR'
                        )}
                      </div>
                    </div>

                    {/* Verified Date */}
                    {selectedAccount.verifiedAt && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          <CheckCircle className="mb-1 inline h-4 w-4" /> Onay
                          Tarihi
                        </label>
                        <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900">
                          {new Date(selectedAccount.verifiedAt).toLocaleString(
                            'tr-TR'
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {selectedAccount.rejectionReason && (
                      <div className="col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          <XCircle className="mb-1 inline h-4 w-4" /> Ret Nedeni
                        </label>
                        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900">
                          {selectedAccount.rejectionReason}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedAccount.status === 'PENDING' && (
                  <div className="flex items-center justify-end space-x-3 border-t border-gray-200 pt-4">
                    <button
                      onClick={() => {
                        handleReject(selectedAccount.id, '');
                        setSelectedAccount(null);
                      }}
                      className="inline-flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reddet</span>
                    </button>
                    <button
                      onClick={() => {
                        handleVerify(selectedAccount.id);
                        setSelectedAccount(null);
                      }}
                      className="inline-flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Onayla</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

