'use client';

/**
 * ================================================
 * BANK ACCOUNT LIST COMPONENT
 * ================================================
 * Display and manage user's bank accounts
 *
 * Features:
 * - List all bank accounts with masked IBAN
 * - Show verification status
 * - Set default account
 * - Delete account with confirmation
 * - Empty state
 * - Loading states
 * - Responsive design
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 5, 2025
 * @sprint Sprint 1 - Week 1 - Day 1-2: Bank Account Management
 */

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui';
import {
  Building2,
  Star,
  StarOff,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Plus,
} from 'lucide-react';
import {
  getBankAccounts,
  removeBankAccount,
  setDefaultBankAccount,
  type BankAccountResponse,
  BankAccountStatus,
} from '@/lib/api/bank-accounts';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

export interface BankAccountListProps {
  onAddNew?: () => void;
  onAccountDeleted?: (accountId: string) => void;
  onDefaultChanged?: (accountId: string) => void;
  className?: string;
}

// ================================================
// COMPONENT
// ================================================

export const BankAccountList: React.FC<BankAccountListProps> = ({
  onAddNew,
  onAccountDeleted,
  onDefaultChanged,
  className = '',
}) => {
  // State
  const [accounts, setAccounts] = useState<BankAccountResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<{
    accountId: string;
    action: 'delete' | 'default';
  } | null>(null);

  // ==================== EFFECTS ====================

  useEffect(() => {
    loadAccounts();
  }, []);

  // ==================== DATA LOADING ====================

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await getBankAccounts();
      setAccounts(data);
    } catch (error) {
      logger.error('Failed to load bank accounts', error as Error);
      toast.error('Hata', {
        description: 'Banka hesapları yüklenirken bir hata oluştu',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== HANDLERS ====================

  const handleSetDefault = async (accountId: string) => {
    setLoadingAction({ accountId, action: 'default' });

    try {
      await setDefaultBankAccount(accountId);

      // Update local state
      setAccounts((prev) =>
        prev.map((acc) => ({
          ...acc,
          isDefault: acc.id === accountId,
        }))
      );

      toast.success('Başarılı', {
        description: 'Varsayılan hesap güncellendi',
      });

      if (onDefaultChanged) {
        onDefaultChanged(accountId);
      }
    } catch (error) {
      logger.error('Failed to set default bank account', error as Error);
      toast.error('Hata', {
        description: 'Varsayılan hesap ayarlanırken bir hata oluştu',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async (account: BankAccountResponse) => {
    // Confirmation
    if (
      !window.confirm(
        `${account.bankName} hesabınızı silmek istediğinize emin misiniz?\n\nMaskeli IBAN: ${account.maskedIban}`
      )
    ) {
      return;
    }

    // Prevent deleting default account if there are others
    if (account.isDefault && accounts.length > 1) {
      toast.error('Uyarı', {
        description:
          'Varsayılan hesap silinemez. Önce başka bir hesabı varsayılan yapın.',
      });
      return;
    }

    setLoadingAction({ accountId: account.id, action: 'delete' });

    try {
      await removeBankAccount(account.id);

      // Update local state
      setAccounts((prev) => prev.filter((acc) => acc.id !== account.id));

      toast.success('Başarılı', {
        description: 'Banka hesabı silindi',
      });

      if (onAccountDeleted) {
        onAccountDeleted(account.id);
      }
    } catch (error) {
      logger.error('Failed to delete bank account', error as Error);
      toast.error('Hata', {
        description: 'Banka hesabı silinirken bir hata oluştu',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  // ==================== RENDER HELPERS ====================

  const getStatusBadge = (status: BankAccountStatus) => {
    switch (status) {
      case BankAccountStatus.VERIFIED:
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Doğrulandı
          </Badge>
        );
      case BankAccountStatus.PENDING:
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Beklemede
          </Badge>
        );
      case BankAccountStatus.REJECTED:
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Reddedildi
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderAccountCard = (account: BankAccountResponse) => {
    const isActionLoading = loadingAction?.accountId === account.id;
    const isDeleting = isActionLoading && loadingAction?.action === 'delete';
    const isSettingDefault =
      isActionLoading && loadingAction?.action === 'default';

    return (
      <Card
        key={account.id}
        className={`p-4 transition-all ${
          account.isDefault
            ? 'border-2 border-purple-600 bg-purple-50'
            : 'hover:border-gray-300'
        } ${isActionLoading ? 'opacity-50' : ''}`}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left: Bank Info */}
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 p-3 text-white shadow-lg">
              <Building2 className="h-6 w-6" />
            </div>

            <div className="flex-1">
              {/* Bank Name */}
              <div className="mb-1 flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {account.bankName}
                </h3>
                {account.isDefault && (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                )}
              </div>

              {/* Account Holder */}
              <p className="mb-2 text-sm text-gray-600">
                {account.accountHolder}
              </p>

              {/* Masked IBAN */}
              <div className="mb-2 flex items-center gap-2 font-mono text-sm text-gray-800">
                <CreditCard className="h-4 w-4 text-gray-400" />
                {account.maskedIban}
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {getStatusBadge(account.status)}
                {account.status === BankAccountStatus.REJECTED &&
                  account.rejectionReason && (
                    <span className="text-xs text-red-600">
                      ({account.rejectionReason})
                    </span>
                  )}
              </div>

              {/* Verification Info */}
              {account.verifiedAt && (
                <p className="mt-2 text-xs text-gray-500">
                  Doğrulama:{' '}
                  {new Date(account.verifiedAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-2">
            {/* Set as Default Button */}
            {!account.isDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSetDefault(account.id)}
                disabled={isActionLoading}
                className="whitespace-nowrap"
              >
                {isSettingDefault ? (
                  <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                ) : (
                  <StarOff className="mr-1 h-3 w-3" />
                )}
                Varsayılan Yap
              </Button>
            )}

            {/* Delete Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(account)}
              disabled={isActionLoading}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              {isDeleting ? (
                <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
              ) : (
                <Trash2 className="mr-1 h-3 w-3" />
              )}
              Sil
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  // ==================== RENDER ====================

  // Loading state
  if (isLoading) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          <p className="text-gray-600">Banka hesapları yükleniyor...</p>
        </div>
      </Card>
    );
  }

  // Empty state
  if (accounts.length === 0) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-gray-100 p-6">
            <Building2 className="h-12 w-12 text-gray-400" />
          </div>
          <div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Henüz Banka Hesabı Eklemediniz
            </h3>
            <p className="mb-6 text-gray-600">
              Ödeme alabilmek için en az bir banka hesabı eklemeniz gerekiyor
            </p>
          </div>
          {onAddNew && (
            <Button onClick={onAddNew} variant="primary" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              İlk Hesabını Ekle
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // List view
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Banka Hesaplarım</h2>
          <p className="text-gray-600">
            {accounts.length} hesap -{' '}
            {
              accounts.filter((a) => a.status === BankAccountStatus.VERIFIED)
                .length
            }{' '}
            doğrulandı
          </p>
        </div>
        {onAddNew && (
          <Button onClick={onAddNew} variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Hesap Ekle
          </Button>
        )}
      </div>

      {/* Info Alert - if there are unverified accounts */}
      {accounts.some((a) => a.status === BankAccountStatus.PENDING) && (
        <Alert variant="warning" className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-yellow-600" />
          <div className="text-sm text-yellow-900">
            <p className="font-medium">Doğrulama Bekleniyor</p>
            <p className="mt-1 text-yellow-700">
              Yeni eklediğiniz banka hesapları admin onayından sonra aktif
              olacaktır. İlk ödeme talebi için en az bir doğrulanmış hesabınız
              olmalıdır.
            </p>
          </div>
        </Alert>
      )}

      {/* Account Cards */}
      <div className="space-y-3">
        {accounts
          .sort((a, b) => {
            // Default account first
            if (a.isDefault) return -1;
            if (b.isDefault) return 1;
            // Then by verification status
            if (a.status === BankAccountStatus.VERIFIED) return -1;
            if (b.status === BankAccountStatus.VERIFIED) return 1;
            // Then by creation date (newest first)
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          })
          .map(renderAccountCard)}
      </div>

      {/* Footer Note */}
      <Alert variant="default" className="border-blue-200 bg-blue-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">Güvenlik Bilgisi</p>
            <p className="mt-1 text-blue-700">
              IBAN numaralarınız güvenlik amacıyla maskeli olarak
              gösterilmektedir. Sadece son 4 hane görünür durumdadır.
            </p>
          </div>
        </div>
      </Alert>
    </div>
  );
};

export default BankAccountList;
