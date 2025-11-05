/**
 * ================================================
 * ADMIN BANK ACCOUNT VERIFICATIONS PAGE
 * ================================================
 * Admin page for reviewing and verifying bank accounts
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 5, 2025
 * @sprint Sprint 1 - Week 1 - Day 2-3: Bank Account Verification
 */

'use client';

import { BankAccountVerificationList } from '@/components/admin/BankAccountVerificationList';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Building2, Shield, CheckCircle2 } from 'lucide-react';
import { logger } from '@/lib/shared/utils/logger';

// ================================================
// PAGE COMPONENT
// ================================================

export default function BankAccountVerificationsPage() {
  const handleVerificationComplete = (accountId: string, approved: boolean) => {
    // Log for audit trail
    logger.info('Bank account verification completed', { accountId, approved });
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Page Header */}
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
        </div>
      </div>

      {/* Info Cards */}
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

      {/* Verification List */}
      <BankAccountVerificationList
        onVerificationComplete={handleVerificationComplete}
      />
    </div>
  );
}
