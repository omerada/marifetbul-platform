/**
 * ================================================
 * BULK PAYOUT ACTIONS
 * ================================================
 * Bulk operations for payout management
 *
 * Features:
 * - Bulk selection with checkboxes
 * - Bulk approve (max 50 at once)
 * - Bulk reject with reason
 * - Excel export functionality
 * - Selection count display
 * - Clear selection
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Story 1.2 - Payout Approval UI
 */

'use client';

import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Download,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Payout } from '@/types/business/features/wallet';

// ================================================
// TYPES
// ================================================

export interface BulkPayoutActionsProps {
  selectedPayouts: Payout[];
  onBulkApprove: (payoutIds: string[]) => Promise<void>;
  onBulkReject: (payoutIds: string[], reason: string) => Promise<void>;
  onClearSelection: () => void;
  allPayouts: Payout[]; // For export functionality
}

type BulkAction = 'none' | 'approve' | 'reject';

const MAX_BULK_SELECTION = 50;

// ================================================
// COMPONENT
// ================================================

export const BulkPayoutActions: React.FC<BulkPayoutActionsProps> = ({
  selectedPayouts,
  onBulkApprove,
  onBulkReject,
  onClearSelection,
  allPayouts,
}) => {
  const [bulkAction, setBulkAction] = useState<BulkAction>('none');
  const [bulkRejectionReason, setBulkRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedCount = selectedPayouts.length;
  const hasSelection = selectedCount > 0;
  const exceedsLimit = selectedCount > MAX_BULK_SELECTION;

  // ==================== HANDLERS ====================

  const handleBulkApproveClick = () => {
    if (exceedsLimit) {
      toast.error(
        `En fazla ${MAX_BULK_SELECTION} ödeme aynı anda onaylanabilir`
      );
      return;
    }

    const pendingPayouts = selectedPayouts.filter(
      (p) => p.status === 'PENDING'
    );
    if (pendingPayouts.length === 0) {
      toast.error('Seçili ödemeler arasında onaylanabilir ödeme yok');
      return;
    }

    setBulkAction('approve');
  };

  const handleBulkRejectClick = () => {
    if (exceedsLimit) {
      toast.error(
        `En fazla ${MAX_BULK_SELECTION} ödeme aynı anda reddedilebilir`
      );
      return;
    }

    const rejectablePayouts = selectedPayouts.filter(
      (p) => p.status === 'PENDING' || p.status === 'PROCESSING'
    );
    if (rejectablePayouts.length === 0) {
      toast.error('Seçili ödemeler arasında reddedilebilir ödeme yok');
      return;
    }

    setBulkAction('reject');
    setBulkRejectionReason('');
  };

  const handleConfirmBulkApprove = async () => {
    const pendingPayouts = selectedPayouts.filter(
      (p) => p.status === 'PENDING'
    );
    const payoutIds = pendingPayouts.map((p) => p.id);

    if (payoutIds.length === 0) {
      toast.error('Onaylanabilir ödeme bulunamadı');
      return;
    }

    setIsProcessing(true);
    try {
      await onBulkApprove(payoutIds);
      toast.success(`${payoutIds.length} ödeme başarıyla onaylandı`);
      setBulkAction('none');
      onClearSelection();
    } catch (error) {
      toast.error('Toplu onaylama sırasında bir hata oluştu');
      console.error('Bulk approve failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmBulkReject = async () => {
    if (!bulkRejectionReason.trim()) {
      toast.error('Lütfen ret nedeni belirtin');
      return;
    }

    if (bulkRejectionReason.trim().length < 10) {
      toast.error('Red nedeni en az 10 karakter olmalıdır');
      return;
    }

    const rejectablePayouts = selectedPayouts.filter(
      (p) => p.status === 'PENDING' || p.status === 'PROCESSING'
    );
    const payoutIds = rejectablePayouts.map((p) => p.id);

    if (payoutIds.length === 0) {
      toast.error('Reddedilebilir ödeme bulunamadı');
      return;
    }

    setIsProcessing(true);
    try {
      await onBulkReject(payoutIds, bulkRejectionReason.trim());
      toast.success(`${payoutIds.length} ödeme reddedildi`);
      setBulkAction('none');
      setBulkRejectionReason('');
      onClearSelection();
    } catch (error) {
      toast.error('Toplu reddetme sırasında bir hata oluştu');
      console.error('Bulk reject failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportToExcel = () => {
    try {
      const dataToExport = (
        selectedCount > 0 ? selectedPayouts : allPayouts
      ).map((payout) => ({
        ID: payout.id,
        'Kullanıcı ID': payout.userId,
        Tutar: payout.amount,
        'Para Birimi': payout.currency,
        Yöntem:
          payout.method === 'BANK_TRANSFER'
            ? 'Banka Havalesi'
            : payout.method === 'PAYPAL'
              ? 'PayPal'
              : 'Stripe',
        Durum:
          payout.status === 'PENDING'
            ? 'Bekliyor'
            : payout.status === 'PROCESSING'
              ? 'İşleniyor'
              : payout.status === 'COMPLETED'
                ? 'Tamamlandı'
                : payout.status === 'FAILED'
                  ? 'Başarısız'
                  : 'İptal Edildi',
        'Talep Tarihi': new Date(payout.requestedAt).toLocaleString('tr-TR'),
        'Tamamlanma Tarihi': payout.completedAt
          ? new Date(payout.completedAt).toLocaleString('tr-TR')
          : '-',
        Açıklama: payout.description || '-',
        'Hata Nedeni': payout.failureReason || '-',
      }));

      // Convert to CSV
      const headers = Object.keys(dataToExport[0]);
      const csvContent = [
        headers.join(','),
        ...dataToExport.map((row) =>
          headers
            .map((header) => {
              const value = String(row[header as keyof typeof row] || '');
              // Escape commas and quotes in values
              return value.includes(',') || value.includes('"')
                ? `"${value.replace(/"/g, '""')}"`
                : value;
            })
            .join(',')
        ),
      ].join('\n');

      // Add BOM for Excel UTF-8 support
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], {
        type: 'text/csv;charset=utf-8;',
      });

      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const fileName = `odemeler_${new Date().toISOString().split('T')[0]}_${selectedCount > 0 ? 'secili' : 'tum'}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(
        selectedCount > 0
          ? `${selectedCount} seçili ödeme CSV dosyasına aktarıldı`
          : `${allPayouts.length} ödeme CSV dosyasına aktarıldı`
      );
    } catch (error) {
      toast.error('Dosya oluşturulurken bir hata oluştu');
      console.error('Export failed:', error);
    }
  };

  const handleCancel = () => {
    setBulkAction('none');
    setBulkRejectionReason('');
  };

  // ==================== RENDER ====================

  if (!hasSelection && bulkAction === 'none') {
    return (
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <CheckCircle className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Toplu İşlemler</p>
            <p className="text-xs text-gray-500">
              Ödemeleri seçerek toplu işlem yapabilirsiniz
            </p>
          </div>
        </div>

        <button
          onClick={handleExportToExcel}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Download className="h-4 w-4" />
          Tümünü CSV&apos;ye Aktar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection Bar */}
      {hasSelection && bulkAction === 'none' && (
        <div className="flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white">
              <span className="text-sm font-bold">{selectedCount}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-900">
                {selectedCount} ödeme seçildi
              </p>
              {exceedsLimit && (
                <p className="mt-0.5 text-xs text-red-600">
                  ⚠️ Toplu işlem için en fazla {MAX_BULK_SELECTION} ödeme
                  seçebilirsiniz
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearSelection}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Trash2 className="h-4 w-4" />
              Seçimi Temizle
            </button>

            <button
              onClick={handleExportToExcel}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Seçilenleri Aktar
            </button>

            <button
              onClick={handleBulkRejectClick}
              disabled={exceedsLimit}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Toplu Reddet
            </button>

            <button
              onClick={handleBulkApproveClick}
              disabled={exceedsLimit}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Toplu Onayla
            </button>
          </div>
        </div>
      )}

      {/* Bulk Approve Confirmation */}
      {bulkAction === 'approve' && (
        <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6 shadow-lg">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-600">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900">
                {selectedPayouts.filter((p) => p.status === 'PENDING').length}{' '}
                Ödemeyi Onaylıyor Musunuz?
              </h3>
              <p className="mt-1 text-sm text-green-800">
                Seçili ödemeler onaylandığında işleme alınacak ve kullanıcıların
                hesaplarına gönderilecektir.
              </p>
              <div className="mt-3 rounded-lg bg-yellow-100 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-700" />
                  <p className="text-xs text-yellow-800">
                    Bu işlem geri alınamaz. Onaylamadan önce ödeme bilgilerini
                    kontrol edin.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              İptal
            </button>
            <button
              onClick={handleConfirmBulkApprove}
              disabled={isProcessing}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Evet, Toplu Onayla
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Bulk Reject Confirmation */}
      {bulkAction === 'reject' && (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6 shadow-lg">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-600">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900">
                {
                  selectedPayouts.filter(
                    (p) => p.status === 'PENDING' || p.status === 'PROCESSING'
                  ).length
                }{' '}
                Ödemeyi Reddediyor Musunuz?
              </h3>
              <p className="mt-1 text-sm text-red-800">
                Seçili ödemeler reddedildiğinde tutarlar kullanıcıların
                cüzdanlarına iade edilecektir.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="bulk-rejection-reason"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Red Nedeni <span className="text-red-600">*</span>
            </label>
            <textarea
              id="bulk-rejection-reason"
              value={bulkRejectionReason}
              onChange={(e) => setBulkRejectionReason(e.target.value)}
              placeholder="Ödemelerin toplu olarak reddedilme nedenini açıklayın (en az 10 karakter)"
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
              rows={4}
              maxLength={500}
              required
            />
            <p className="mt-1 text-xs text-gray-600">
              {bulkRejectionReason.length}/500 karakter
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              İptal
            </button>
            <button
              onClick={handleConfirmBulkReject}
              disabled={
                isProcessing ||
                !bulkRejectionReason.trim() ||
                bulkRejectionReason.trim().length < 10
              }
              className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Evet, Toplu Reddet
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

BulkPayoutActions.displayName = 'BulkPayoutActions';
