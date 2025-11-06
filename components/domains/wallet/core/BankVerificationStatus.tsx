/**
 * ================================================
 * BANK VERIFICATION STATUS WIDGET
 * ================================================
 * Shows verification status and pending count to users
 *
 * Features:
 * - Display verification status badge
 * - Show pending verification count
 * - Link to bank accounts page
 * - Rejection reason display
 * - Compact and informative
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 5, 2025
 * @sprint Sprint 1 - Week 1 - Day 2-3: Bank Account Verification
 */

'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import { Alert } from '@/components/ui/Alert';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  ArrowRight,
  XCircle,
} from 'lucide-react';
import {
  getBankAccounts,
  type BankAccountResponse,
  BankAccountStatus,
} from '@/lib/api/bank-accounts';
import { logger } from '@/lib/shared/utils/logger';
import Link from 'next/link';

// ================================================
// TYPES
// ================================================

export interface BankVerificationStatusProps {
  showFullDetails?: boolean;
  onAddAccount?: () => void;
  className?: string;
}

interface VerificationStats {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
}

// ================================================
// COMPONENT
// ================================================

export const BankVerificationStatus: React.FC<BankVerificationStatusProps> = ({
  showFullDetails = false,
  onAddAccount,
  className = '',
}) => {
  const [accounts, setAccounts] = useState<BankAccountResponse[]>([]);
  const [stats, setStats] = useState<VerificationStats>({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

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

      // Calculate stats
      const newStats: VerificationStats = {
        total: data.length,
        verified: data.filter((a) => a.status === BankAccountStatus.VERIFIED)
          .length,
        pending: data.filter((a) => a.status === BankAccountStatus.PENDING)
          .length,
        rejected: data.filter((a) => a.status === BankAccountStatus.REJECTED)
          .length,
      };
      setStats(newStats);
    } catch (error) {
      logger.error('Failed to load bank accounts', error as Error);
      toast.error('Hata', {
        description: 'Banka hesapları yüklenirken bir hata oluştu',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== RENDER ====================

  // Loading state
  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Yükleniyor...</p>
        </div>
      </Card>
    );
  }

  // No accounts
  if (stats.total === 0) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-gray-100 p-2">
            <Building2 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              Henüz Banka Hesabı Eklemediniz
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Ödeme alabilmek için banka hesabı eklemelisiniz
            </p>
            {onAddAccount ? (
              <Button
                onClick={onAddAccount}
                variant="primary"
                size="sm"
                className="mt-3"
              >
                <Building2 className="mr-2 h-4 w-4" />
                Hesap Ekle
              </Button>
            ) : (
              <Link href="/dashboard/wallet/bank-accounts">
                <Button variant="primary" size="sm" className="mt-3">
                  <Building2 className="mr-2 h-4 w-4" />
                  Hesap Ekle
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Compact view
  if (!showFullDetails) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 p-2">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Banka Hesapları
              </p>
              <div className="mt-1 flex items-center gap-2">
                {stats.verified > 0 && (
                  <Badge variant="success" className="text-xs">
                    {stats.verified} Doğrulandı
                  </Badge>
                )}
                {stats.pending > 0 && (
                  <Badge variant="warning" className="text-xs">
                    {stats.pending} Bekliyor
                  </Badge>
                )}
                {stats.rejected > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {stats.rejected} Reddedildi
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Link href="/dashboard/wallet/bank-accounts">
            <Button variant="ghost" size="sm">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  // Full details view
  const pendingAccounts = accounts.filter(
    (a) => a.status === BankAccountStatus.PENDING
  );
  const rejectedAccounts = accounts.filter(
    (a) => a.status === BankAccountStatus.REJECTED
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Stats Card */}
      <Card className="p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 p-3">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Banka Hesabı Durumu
            </h3>
            <p className="text-sm text-gray-600">
              {stats.total} hesap - {stats.verified} doğrulandı
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {stats.verified}
            </p>
            <p className="text-xs text-gray-600">Doğrulandı</p>
          </div>

          <div className="text-center">
            <div className="mb-1 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
            <p className="text-xs text-gray-600">Bekliyor</p>
          </div>

          <div className="text-center">
            <div className="mb-1 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-xs text-gray-600">Reddedildi</p>
          </div>
        </div>

        <Link href="/dashboard/wallet/bank-accounts">
          <Button variant="outline" className="mt-4 w-full">
            Tüm Hesapları Yönet
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </Card>

      {/* Pending Alert */}
      {stats.pending > 0 && (
        <Alert variant="warning" className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-yellow-600" />
          <div className="flex-1 text-sm text-yellow-900">
            <p className="font-medium">Onay Bekleniyor</p>
            <p className="mt-1 text-yellow-700">
              {stats.pending} banka hesabınız admin onayı bekliyor. Onay süreci
              genellikle 24 saat içinde tamamlanır.
            </p>
            {pendingAccounts.length > 0 && (
              <ul className="mt-2 space-y-1">
                {pendingAccounts.map((account) => (
                  <li key={account.id} className="text-xs">
                    • {account.bankName} - {account.maskedIban}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Alert>
      )}

      {/* Rejected Alert */}
      {stats.rejected > 0 && (
        <Alert variant="destructive" className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div className="flex-1 text-sm text-red-900">
            <p className="font-medium">Reddedilen Hesaplar</p>
            <p className="mt-1 text-red-700">
              {stats.rejected} banka hesabınız reddedildi. Lütfen bilgileri
              kontrol edip tekrar ekleyin.
            </p>
            {rejectedAccounts.length > 0 && (
              <ul className="mt-2 space-y-2">
                {rejectedAccounts.map((account) => (
                  <li key={account.id} className="text-xs">
                    <span className="font-medium">
                      • {account.bankName} - {account.maskedIban}
                    </span>
                    {account.rejectionReason && (
                      <span className="ml-1 text-red-600">
                        ({account.rejectionReason})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Alert>
      )}

      {/* Success Message */}
      {stats.verified > 0 && stats.pending === 0 && stats.rejected === 0 && (
        <Alert variant="success" className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div className="text-sm text-green-900">
            <p className="font-medium">Tüm Hesaplar Doğrulandı</p>
            <p className="mt-1 text-green-700">
              Banka hesaplarınız onaylandı. Artık ödeme talep edebilirsiniz.
            </p>
          </div>
        </Alert>
      )}
    </div>
  );
};

export default BankVerificationStatus;
