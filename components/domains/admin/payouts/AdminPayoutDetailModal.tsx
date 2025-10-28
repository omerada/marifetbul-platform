/**
 * ================================================
 * ADMIN PAYOUT DETAIL MODAL
 * ================================================
 * Modal for viewing detailed payout information
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 26, 2025
 */

'use client';

import { useState } from 'react';
import type { Payout } from '@/types/business/features/wallet';
import { AdminPayoutStatusBadge } from './AdminPayoutStatusBadge';
import {
  X,
  User,
  DollarSign,
  Calendar,
  Building2,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Ban,
  Wallet,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/api/admin/payout-admin-api';
import { UnifiedButton } from '@/components/ui/UnifiedButton';

// ================================================
// TYPES
// ================================================

export interface AdminPayoutDetailModalProps {
  payout: Payout | null;
  isOpen: boolean;
  onClose: () => void;
  onProcess?: (payoutId: string) => void;
  onComplete?: (payoutId: string) => void;
  onFail?: (payoutId: string, reason: string) => void;
  onCancel?: (payoutId: string) => void;
  onViewUserWallet?: (userId: string) => void;
}

// ================================================
// COMPONENT
// ================================================

export const AdminPayoutDetailModal: React.FC<AdminPayoutDetailModalProps> = ({
  payout,
  isOpen,
  onClose,
  onProcess,
  onComplete,
  onFail,
  onCancel,
  onViewUserWallet,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // ==================== HANDLERS ====================

  const handleAction = async (action: () => Promise<void>) => {
    setIsProcessing(true);
    try {
      await action();
      onClose();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcess = () => {
    if (payout && onProcess) {
      if (
        confirm(
          `Bu ödemeyi onaylıyor musunuz?\nMiktar: ${formatCurrency(payout.amount)}`
        )
      ) {
        handleAction(() => Promise.resolve(onProcess(payout.id)));
      }
    }
  };

  const handleComplete = () => {
    if (payout && onComplete) {
      if (confirm('Banka transferi tamamlandı mı?')) {
        handleAction(() => Promise.resolve(onComplete(payout.id)));
      }
    }
  };

  const handleFail = () => {
    if (payout && onFail) {
      const reason = prompt('Başarısız nedeni girin (minimum 10 karakter):');
      if (reason && reason.length >= 10) {
        handleAction(() => Promise.resolve(onFail(payout.id, reason)));
      } else if (reason !== null) {
        alert('Lütfen en az 10 karakter uzunluğunda bir neden girin.');
      }
    }
  };

  const handleCancel = () => {
    if (payout && onCancel) {
      if (
        confirm(
          'Bu ödemeyi iptal etmek ve kullanıcının cüzdanına iade etmek istiyor musunuz?'
        )
      ) {
        handleAction(() => Promise.resolve(onCancel(payout.id)));
      }
    }
  };

  // ==================== RENDER ====================

  if (!isOpen || !payout) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="bg-opacity-50 fixed inset-0 bg-black transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Para Çekme Detayları
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[calc(100vh-16rem)] overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {/* User Info */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-700 uppercase">
                  <User className="h-4 w-4" />
                  Kullanıcı Bilgileri
                </h3>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Kullanıcı ID</p>
                        <p className="mt-1 font-mono text-sm font-medium text-gray-900">
                          {payout.userId}
                        </p>
                      </div>
                      {onViewUserWallet && (
                        <UnifiedButton
                          variant="outline"
                          size="sm"
                          onClick={() => onViewUserWallet(payout.userId)}
                        >
                          <Wallet className="mr-1 h-3 w-3" />
                          Cüzdan Görüntüle
                        </UnifiedButton>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payout Info */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-700 uppercase">
                  <DollarSign className="h-4 w-4" />
                  Ödeme Bilgileri
                </h3>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tutar</p>
                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        {formatCurrency(payout.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Durum</p>
                      <div className="mt-1">
                        <AdminPayoutStatusBadge
                          status={payout.status}
                          size="lg"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ödeme Yöntemi</p>
                      <p className="mt-1 font-medium text-gray-900">
                        {payout.method === 'BANK_TRANSFER'
                          ? 'Banka Transferi'
                          : 'Stripe'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Para Birimi</p>
                      <p className="mt-1 font-medium text-gray-900">
                        {payout.currency}
                      </p>
                    </div>
                  </div>

                  {payout.description && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <p className="text-sm text-gray-600">Açıklama</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {payout.description}
                      </p>
                    </div>
                  )}

                  {payout.failureReason && (
                    <div className="mt-4 rounded-md bg-red-50 p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            Başarısız Nedeni
                          </p>
                          <p className="mt-1 text-sm text-red-700">
                            {payout.failureReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bank Account Info */}
              {payout.bankAccountInfo && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-700 uppercase">
                    <Building2 className="h-4 w-4" />
                    Banka Hesap Bilgileri
                  </h3>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CreditCard className="mt-1 h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">IBAN</p>
                          <p className="mt-1 font-mono text-sm font-medium text-gray-900">
                            {payout.bankAccountInfo.iban}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User className="mt-1 h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Hesap Sahibi</p>
                          <p className="mt-1 font-medium text-gray-900">
                            {payout.bankAccountInfo.accountHolder}
                          </p>
                        </div>
                      </div>

                      {payout.bankAccountInfo.bankName && (
                        <div className="flex items-start gap-3">
                          <Building2 className="mt-1 h-5 w-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">Banka</p>
                            <p className="mt-1 font-medium text-gray-900">
                              {payout.bankAccountInfo.bankName}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-700 uppercase">
                  <Calendar className="h-4 w-4" />
                  İşlem Geçmişi
                </h3>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Talep Oluşturuldu
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(payout.requestedAt)}
                        </p>
                      </div>
                    </div>

                    {payout.processedAt && (
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Onaylandı ve İşleme Alındı
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(payout.processedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {payout.completedAt && (
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Tamamlandı
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(payout.completedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {payout.cancelledAt && (
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                          <Ban className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            İptal Edildi
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(payout.cancelledAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {payout.estimatedArrival && (
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                          <Calendar className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Tahmini Varış
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(payout.estimatedArrival)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <UnifiedButton
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Kapat
            </UnifiedButton>

            {/* Status-based actions */}
            {payout.status === 'PENDING' && (
              <>
                {onCancel && (
                  <UnifiedButton
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isProcessing}
                  >
                    <Ban className="mr-1 h-4 w-4" />
                    İptal Et
                  </UnifiedButton>
                )}
                {onProcess && (
                  <UnifiedButton
                    variant="primary"
                    onClick={handleProcess}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    {isProcessing ? 'İşleniyor...' : 'Onayla ve İşle'}
                  </UnifiedButton>
                )}
              </>
            )}

            {payout.status === 'PROCESSING' && (
              <>
                {onFail && (
                  <UnifiedButton
                    variant="destructive"
                    onClick={handleFail}
                    disabled={isProcessing}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Başarısız
                  </UnifiedButton>
                )}
                {onComplete && (
                  <UnifiedButton
                    variant="primary"
                    onClick={handleComplete}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    {isProcessing
                      ? 'İşleniyor...'
                      : 'Tamamlandı Olarak İşaretle'}
                  </UnifiedButton>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

AdminPayoutDetailModal.displayName = 'AdminPayoutDetailModal';
