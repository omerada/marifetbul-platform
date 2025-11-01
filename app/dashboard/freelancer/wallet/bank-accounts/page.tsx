/**
 * ================================================
 * BANK ACCOUNT MANAGEMENT PAGE
 * ================================================
 * Manage saved bank accounts for payouts
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState } from 'react';
import { useBankAccounts } from '@/hooks/business/wallet/usePaymentMethods';
import {
  ChevronLeft,
  Plus,
  CreditCard,
  Check,
  Trash2,
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { AddBankAccountModal } from '@/components/domains/wallet';
import { formatIBAN } from '@/lib/shared/formatters';

// ================================================
// PAGE COMPONENT
// ================================================

export default function BankAccountsPage() {
  // ==================== HOOKS ====================

  const {
    bankAccounts,
    defaultPaymentMethod,
    isLoading,
    error,
    setAsDefault,
    remove,
    refresh,
  } = useBankAccounts();

  // ==================== STATE ====================

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ==================== HANDLERS ====================

  const handleSetDefault = async (id: string) => {
    try {
      await setAsDefault(id);
    } catch (error) {
      console.error('Failed to set default:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu banka hesabını silmek istediğinizden emin misiniz?')) {
      return;
    }

    setDeletingId(id);
    try {
      await remove(id);
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    refresh();
  };

  // ==================== RENDER ====================

  return (
    <>
      <div className="container mx-auto max-w-4xl px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <Link
              href="/dashboard/freelancer/wallet"
              className="rounded-lg p-2 transition-colors hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
              <Building2 className="text-primary h-8 w-8" />
              Banka Hesaplarım
            </h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Para çekme işlemleri için kayıtlı banka hesaplarınız
          </p>
        </div>

        {/* Add Button */}
        <div className="mb-6">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Banka Hesabı Ekle
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && bankAccounts.length === 0 && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 w-1/4 rounded bg-gray-200" />
                    <div className="h-6 w-2/3 rounded bg-gray-200" />
                    <div className="h-4 w-1/3 rounded bg-gray-200" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bank Accounts List */}
        {!isLoading && bankAccounts.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="bg-primary/10 mb-4 rounded-full p-4">
                <CreditCard className="text-primary h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Henüz banka hesabı eklemediniz
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Para çekme işlemleri için bir banka hesabı eklemeniz gerekiyor.
              </p>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                İlk Hesabı Ekle
              </Button>
            </CardContent>
          </Card>
        )}

        {bankAccounts.length > 0 && (
          <div className="space-y-4">
            {bankAccounts.map((account) => {
              const isDefault = account.id === defaultPaymentMethod?.id;
              const isDeleting = deletingId === account.id;

              return (
                <Card
                  key={account.id}
                  className={`transition-all ${
                    isDefault ? 'ring-primary ring-2' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Bank Name */}
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {account.bankName}
                            </h3>
                            {account.nickname && (
                              <p className="text-muted-foreground text-sm">
                                {account.nickname}
                              </p>
                            )}
                          </div>
                          {isDefault && (
                            <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                              Varsayılan
                            </span>
                          )}
                        </div>

                        {/* Account Details */}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground w-32">
                              IBAN:
                            </span>
                            <span className="font-mono font-medium text-gray-900">
                              {formatIBAN(
                                account.maskedIdentifier ||
                                  account.accountLastFour ||
                                  '',
                                true // mask=true
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground w-32">
                              Hesap Sahibi:
                            </span>
                            <span className="font-medium text-gray-900">
                              {account.nickname || 'Hesap Sahibi'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {!isDefault && (
                          <Button
                            onClick={() => handleSetDefault(account.id)}
                            variant="outline"
                            size="sm"
                            disabled={isDeleting}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Varsayılan Yap
                          </Button>
                        )}

                        <Button
                          onClick={() => handleDelete(account.id)}
                          variant="outline"
                          size="sm"
                          disabled={isDeleting || isDefault}
                          className={
                            isDeleting ? 'cursor-not-allowed opacity-50' : ''
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {isDeleting ? 'Siliniyor...' : 'Sil'}
                        </Button>
                      </div>
                    </div>

                    {/* Verification Status */}
                    {!account.isVerified && (
                      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <p className="text-xs text-amber-800">
                          ⚠️ Bu hesap henüz doğrulanmadı. İlk para çekme
                          işleminde doğrulama yapılacaktır.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <h3 className="text-lg font-semibold text-blue-900">
              💡 Banka Hesabı Hakkında
            </h3>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Sadece kendi adınıza kayıtlı hesaplar ekleyebilirsiniz</li>
              <li>• IBAN bilgisi doğru girilmelidir</li>
              <li>• Varsayılan hesap otomatik olarak kullanılır</li>
              <li>• Güvenliğiniz için hesap bilgileri şifrelenir</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Add Bank Account Modal */}
      <AddBankAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </>
  );
}
