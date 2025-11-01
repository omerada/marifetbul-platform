/**
 * ================================================
 * PAYOUT APPROVAL MODAL
 * ================================================
 * Modal for approving or rejecting payout requests
 *
 * Features:
 * - Approve/Reject with confirmation
 * - Rejection reason textarea (required)
 * - User information display
 * - Bank details verification
 * - Amount confirmation
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Story 1.2 - Payout Approval UI
 */

'use client';

import { useState } from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Building2,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Payout } from '@/types/business/features/wallet';

// ================================================
// TYPES
// ================================================

export interface PayoutApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  payout: Payout | null;
  onApprove: (payoutId: string) => Promise<void>;
  onReject: (payoutId: string, reason: string) => Promise<void>;
}

type ModalMode = 'view' | 'approve' | 'reject';

// ================================================
// COMPONENT
// ================================================

export const PayoutApprovalModal: React.FC<PayoutApprovalModalProps> = ({
  isOpen,
  onClose,
  payout,
  onApprove,
  onReject,
}) => {
  const [mode, setMode] = useState<ModalMode>('view');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==================== HANDLERS ====================

  const handleClose = () => {
    setMode('view');
    setRejectionReason('');
    onClose();
  };

  const handleApproveClick = () => {
    setMode('approve');
  };

  const handleRejectClick = () => {
    setMode('reject');
    setRejectionReason('');
  };

  const handleConfirmApprove = async () => {
    if (!payout) return;

    setIsSubmitting(true);
    try {
      await onApprove(payout.id);
      toast.success('Ödeme başarıyla onaylandı');
      handleClose();
    } catch (error) {
      toast.error('Ödeme onaylanırken bir hata oluştu');
      console.error('Failed to approve payout:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!payout) return;

    if (!rejectionReason.trim()) {
      toast.error('Lütfen ret nedeni belirtin');
      return;
    }

    if (rejectionReason.trim().length < 10) {
      toast.error('Red nedeni en az 10 karakter olmalıdır');
      return;
    }

    setIsSubmitting(true);
    try {
      await onReject(payout.id, rejectionReason.trim());
      toast.success('Ödeme reddedildi');
      handleClose();
    } catch (error) {
      toast.error('Ödeme reddedilirken bir hata oluştu');
      console.error('Failed to reject payout:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToView = () => {
    setMode('view');
    setRejectionReason('');
  };

  // ==================== RENDER ====================

  if (!isOpen || !payout) return null;

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canApprove = payout.status === 'PENDING';
  const canReject =
    payout.status === 'PENDING' || payout.status === 'PROCESSING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'approve' && 'Ödemeyi Onayla'}
            {mode === 'reject' && 'Ödemeyi Reddet'}
            {mode === 'view' && 'Ödeme Detayları'}
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {mode === 'view' && (
            <div className="space-y-6">
              {/* Amount Card */}
              <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
                <p className="text-sm font-medium text-indigo-800">
                  Çekilecek Tutar
                </p>
                <p className="mt-1 text-3xl font-bold text-indigo-900">
                  ₺
                  {payout.amount.toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="mt-1 text-xs text-indigo-700">
                  {payout.method === 'BANK_TRANSFER' && 'Banka Havalesi'}
                  {payout.method === 'IYZICO_PAYOUT' && 'Iyzico'}
                  {payout.method === 'WALLET_TRANSFER' && 'Cüzdan Transferi'}
                </p>
              </div>

              {/* User Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-700">
                    Kullanıcı ID:
                  </span>
                  <span className="text-gray-900">{payout.userId}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-700">İşlem ID:</span>
                  <span className="font-mono text-xs text-gray-900">
                    {payout.id}
                  </span>
                </div>
              </div>

              {/* Bank Details */}
              {payout.method === 'BANK_TRANSFER' && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">
                      Banka Bilgileri
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Banka:</span>
                      <span className="font-medium text-gray-900">
                        {payout.description || 'Belirtilmemiş'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status & Dates */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Durum:</span>
                  <span
                    className={`font-medium ${
                      payout.status === 'PENDING'
                        ? 'text-yellow-600'
                        : payout.status === 'PROCESSING'
                          ? 'text-blue-600'
                          : payout.status === 'COMPLETED'
                            ? 'text-green-600'
                            : 'text-red-600'
                    }`}
                  >
                    {payout.status === 'PENDING' && 'Bekliyor'}
                    {payout.status === 'PROCESSING' && 'İşleniyor'}
                    {payout.status === 'COMPLETED' && 'Tamamlandı'}
                    {payout.status === 'FAILED' && 'Başarısız'}
                    {payout.status === 'CANCELLED' && 'İptal Edildi'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Talep Tarihi:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(payout.requestedAt)}
                  </span>
                </div>
                {payout.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tamamlanma Tarihi:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(payout.completedAt)}
                    </span>
                  </div>
                )}
              </div>

              {/* Failure Reason */}
              {payout.failureReason && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-red-900">Hata Nedeni</h3>
                  </div>
                  <p className="text-sm text-red-800">{payout.failureReason}</p>
                </div>
              )}
            </div>
          )}

          {mode === 'approve' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">
                    Ödemeyi Onaylıyor Musunuz?
                  </h3>
                </div>
                <p className="text-sm text-green-800">
                  Bu ödeme onaylandığında işleme alınacak ve kullanıcının
                  hesabına
                  <span className="mx-1 font-bold">
                    ₺
                    {payout.amount.toLocaleString('tr-TR', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  gönderilecektir.
                </p>
              </div>

              <div className="rounded-lg bg-yellow-50 p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Bu işlem geri alınamaz. Onaylamadan önce banka bilgilerini
                  ve tutarı kontrol edin.
                </p>
              </div>
            </div>
          )}

          {mode === 'reject' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <XCircle className="h-6 w-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">
                    Ödemeyi Reddediyor Musunuz?
                  </h3>
                </div>
                <p className="text-sm text-red-800">
                  Bu ödeme reddedildiğinde tutar kullanıcının cüzdanına iade
                  edilecektir.
                </p>
              </div>

              <div>
                <label
                  htmlFor="rejection-reason"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Red Nedeni <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ödemenin reddedilme nedenini açıklayın (en az 10 karakter)"
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  rows={4}
                  maxLength={500}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {rejectionReason.length}/500 karakter
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6">
          {mode === 'view' && (
            <>
              <button
                onClick={handleClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Kapat
              </button>
              {canReject && (
                <button
                  onClick={handleRejectClick}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  Reddet
                </button>
              )}
              {canApprove && (
                <button
                  onClick={handleApproveClick}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                >
                  Onayla
                </button>
              )}
            </>
          )}

          {mode === 'approve' && (
            <>
              <button
                onClick={handleBackToView}
                disabled={isSubmitting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Geri
              </button>
              <button
                onClick={handleConfirmApprove}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Onaylanıyor...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Evet, Onayla
                  </>
                )}
              </button>
            </>
          )}

          {mode === 'reject' && (
            <>
              <button
                onClick={handleBackToView}
                disabled={isSubmitting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Geri
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={
                  isSubmitting ||
                  !rejectionReason.trim() ||
                  rejectionReason.trim().length < 10
                }
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Reddediliyor...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Evet, Reddet
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

PayoutApprovalModal.displayName = 'PayoutApprovalModal';
