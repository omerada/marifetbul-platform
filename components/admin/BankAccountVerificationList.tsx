/**
 * ================================================
 * BANK ACCOUNT VERIFICATION LIST (ADMIN)
 * ================================================
 * Admin component for reviewing and verifying pending bank accounts
 *
 * Features:
 * - List pending bank accounts
 * - View account details (IBAN, holder name, bank)
 * - Verify accounts with optional notes
 * - Reject accounts with reason
 * - Pagination support
 * - Bulk actions (future)
 * - Search and filter
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 5, 2025
 * @sprint Sprint 1 - Week 1 - Day 2-3: Bank Account Verification
 */

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import {
  Building2,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  CreditCard,
  Eye,
  Search,
  AlertCircle,
} from 'lucide-react';
import {
  getPendingBankAccounts,
  verifyBankAccount,
  rejectBankAccount,
  type BankAccountResponse,
} from '@/lib/api/bank-accounts';
import { maskIBAN } from '@/lib/services/bank-info-service';
import { logger } from '@/lib/shared/utils/logger';

// ================================================
// TYPES
// ================================================

export interface BankAccountVerificationListProps {
  onVerificationComplete?: (accountId: string, approved: boolean) => void;
  className?: string;
}

interface VerificationAction {
  type: 'verify' | 'reject';
  account: BankAccountResponse;
}

// ================================================
// COMPONENT
// ================================================

export const BankAccountVerificationList: React.FC<
  BankAccountVerificationListProps
> = ({ onVerificationComplete, className = '' }) => {
  // State
  const [accounts, setAccounts] = useState<BankAccountResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Action state
  const [selectedAction, setSelectedAction] =
    useState<VerificationAction | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Details modal
  const [viewingAccount, setViewingAccount] =
    useState<BankAccountResponse | null>(null);

  // ==================== EFFECTS ====================

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await getPendingBankAccounts({
          page: currentPage,
          size: 10,
        });

        // Filter by search query on client side
        let filteredContent = response.content;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredContent = filteredContent.filter(
            (account) =>
              account.iban.toLowerCase().includes(query) ||
              account.accountHolder.toLowerCase().includes(query) ||
              account.bankName.toLowerCase().includes(query)
          );
        }

        setAccounts(filteredContent);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (error) {
        logger.error('Failed to load pending bank accounts', error as Error);
        toast.error('Hata', {
          description: 'Bekleyen hesaplar yüklenirken bir hata oluştu',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPage, searchQuery]);

  // ==================== HANDLERS ====================

  const handleVerifyClick = (account: BankAccountResponse) => {
    setSelectedAction({ type: 'verify', account });
    setActionNotes('');
  };

  const handleRejectClick = (account: BankAccountResponse) => {
    setSelectedAction({ type: 'reject', account });
    setRejectionReason('');
  };

  const handleConfirmAction = async () => {
    if (!selectedAction) return;

    const { type, account } = selectedAction;

    // Validation
    if (type === 'reject' && !rejectionReason.trim()) {
      toast.error('Uyarı', {
        description: 'Red nedeni girmeniz zorunludur',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (type === 'verify') {
        await verifyBankAccount(account.id, actionNotes || undefined);
        toast.success('Onaylandı', {
          description: `${account.bankName} hesabı onaylandı`,
        });
      } else {
        await rejectBankAccount(account.id, rejectionReason);
        toast.error('Reddedildi', {
          description: `${account.bankName} hesabı reddedildi`,
        });
      }

      // Remove from list
      setAccounts((prev) => prev.filter((a) => a.id !== account.id));
      setTotalElements((prev) => prev - 1);

      // Close modal
      setSelectedAction(null);

      // Callback
      if (onVerificationComplete) {
        onVerificationComplete(account.id, type === 'verify');
      }
    } catch (error) {
      logger.error(
        'Failed to process bank account verification',
        error as Error
      );
      toast.error('Hata', {
        description: 'İşlem sırasında bir hata oluştu',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAction = () => {
    setSelectedAction(null);
    setActionNotes('');
    setRejectionReason('');
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(0); // Reset to first page
  };

  // ==================== RENDER HELPERS ====================

  const renderAccountCard = (account: BankAccountResponse) => {
    return (
      <Card key={account.id} className="p-4 transition-all hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Account Info */}
          <div className="flex flex-1 items-start gap-3">
            <div className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 p-3 text-white shadow-lg">
              <Building2 className="h-6 w-6" />
            </div>

            <div className="flex-1">
              {/* Bank Name */}
              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                {account.bankName}
              </h3>

              {/* User Info */}
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{account.accountHolder}</span>
              </div>

              {/* Masked IBAN */}
              <div className="mb-2 flex items-center gap-2 font-mono text-sm text-gray-800">
                <CreditCard className="h-4 w-4 text-gray-400" />
                {maskIBAN(account.iban)}
              </div>

              {/* Created Date */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                Talep Tarihi:{' '}
                {new Date(account.createdAt).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>

              {/* Status Badge */}
              <div className="mt-2">
                <Badge
                  variant="warning"
                  className="flex w-fit items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                  Onay Bekliyor
                </Badge>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewingAccount(account)}
              className="whitespace-nowrap"
            >
              <Eye className="mr-1 h-3 w-3" />
              Detay
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleVerifyClick(account)}
              className="bg-green-600 whitespace-nowrap text-white hover:bg-green-700"
            >
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Onayla
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRejectClick(account)}
              className="whitespace-nowrap"
            >
              <XCircle className="mr-1 h-3 w-3" />
              Reddet
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  // ==================== RENDER ====================

  // Loading state
  if (isLoading && accounts.length === 0) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-gray-600">Bekleyen hesaplar yükleniyor...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Search */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Onay Bekleyen Banka Hesapları
            </h2>
            <p className="text-sm text-gray-600">
              Toplam {totalElements} hesap onay bekliyor
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="IBAN, hesap sahibi veya banka ara..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Empty State */}
      {accounts.length === 0 && !isLoading && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-gray-100 p-6">
              <CheckCircle2 className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Onay Bekleyen Hesap Yok
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? 'Arama kriterlerinize uygun bekleyen hesap bulunamadı'
                  : 'Tüm banka hesapları onaylandı'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Account Cards */}
      {accounts.length > 0 && (
        <div className="space-y-3">{accounts.map(renderAccountCard)}</div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0 || isLoading}
            >
              Önceki
            </Button>

            <span className="text-sm text-gray-600">
              Sayfa {currentPage + 1} / {totalPages}
            </span>

            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              disabled={currentPage >= totalPages - 1 || isLoading}
            >
              Sonraki
            </Button>
          </div>
        </Card>
      )}

      {/* Verification Action Modal */}
      <Dialog
        open={selectedAction !== null}
        onOpenChange={(open) => !open && handleCancelAction()}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedAction?.type === 'verify'
                ? 'Banka Hesabını Onayla'
                : 'Banka Hesabını Reddet'}
            </DialogTitle>
          </DialogHeader>

          {selectedAction && (
            <div className="space-y-4 py-4">
              {/* Account Info Summary */}
              <Card className="border-gray-200 bg-gray-50 p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Banka:</span>
                    <span className="text-gray-900">
                      {selectedAction.account.bankName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Hesap Sahibi:
                    </span>
                    <span className="text-gray-900">
                      {selectedAction.account.accountHolder}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="font-medium text-gray-600">IBAN:</span>
                    <span className="text-gray-900">
                      {maskIBAN(selectedAction.account.iban)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Verification Notes (for approve) */}
              {selectedAction.type === 'verify' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Not (İsteğe Bağlı)
                  </label>
                  <Textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Onay ile ilgili notlarınız..."
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* Rejection Reason (for reject) */}
              {selectedAction.type === 'reject' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-red-700">
                    Red Nedeni <span className="text-red-600">*</span>
                  </label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Hesabın neden reddedildiğini açıklayın (kullanıcıya gösterilecek)"
                    rows={4}
                    disabled={isSubmitting}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-600">
                    Bu mesaj hesap sahibine gösterilecektir
                  </p>
                </div>
              )}

              {/* Warning */}
              <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Dikkat</p>
                    <p className="mt-1">
                      {selectedAction.type === 'verify'
                        ? 'Onayladığınız hesap kullanıcının para çekme işlemlerinde kullanılabilecektir.'
                        : 'Reddettiğiniz hesap kullanıcı tarafından tekrar eklenebilir.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelAction}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              variant={
                selectedAction?.type === 'verify' ? 'primary' : 'destructive'
              }
              onClick={handleConfirmAction}
              disabled={
                isSubmitting ||
                (selectedAction?.type === 'reject' && !rejectionReason.trim())
              }
              className={
                selectedAction?.type === 'verify'
                  ? 'bg-green-600 hover:bg-green-700'
                  : ''
              }
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  İşleniyor...
                </>
              ) : selectedAction?.type === 'verify' ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Onayla
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reddet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Details Modal */}
      <Dialog
        open={viewingAccount !== null}
        onOpenChange={(open) => !open && setViewingAccount(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Banka Hesabı Detayları</DialogTitle>
          </DialogHeader>

          {viewingAccount && (
            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Banka
                  </label>
                  <p className="text-gray-900">{viewingAccount.bankName}</p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Banka Kodu
                  </label>
                  <p className="font-mono text-gray-900">
                    {viewingAccount.bankCode}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Hesap Sahibi
                  </label>
                  <p className="text-gray-900">
                    {viewingAccount.accountHolder}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    IBAN Numarası
                  </label>
                  <p className="font-mono break-all text-gray-900">
                    {viewingAccount.iban}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Maskeli: {viewingAccount.maskedIban}
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Kullanıcı ID
                  </label>
                  <p className="font-mono text-sm text-gray-900">
                    {viewingAccount.userId}
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Hesap ID
                  </label>
                  <p className="font-mono text-sm text-gray-900">
                    {viewingAccount.id}
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Oluşturulma Tarihi
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(viewingAccount.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Durum
                  </label>
                  <Badge variant="warning">Onay Bekliyor</Badge>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setViewingAccount(null)}>Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BankAccountVerificationList;
