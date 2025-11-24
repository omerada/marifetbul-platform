'use client';

/**
 * ================================================
 * BULK VERIFICATION MODAL
 * ================================================
 * Modal for bulk bank account verification with progress tracking
 *
 * Features:
 * - Sequential verification with progress bar
 * - Error handling per account
 * - Success/failure summary
 * - Cancel ability
 *
 * Sprint 1 - Story 1.3: Bank Account Verification Flow
 * @version 1.0.0
 * @author MarifetBul Development Team
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui';
import { Progress } from '@/components/ui/Progress';
import { CheckCircle2, XCircle, AlertCircle, Loader2, X } from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface BulkVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountIds: string[];
  onVerify: (accountId: string) => Promise<void>;
  accountNames: Map<string, string>; // accountId -> accountHolder name
}

interface VerificationResult {
  accountId: string;
  accountName: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  error?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BulkVerificationModal({
  isOpen,
  onClose,
  accountIds,
  onVerify,
  accountNames,
}: BulkVerificationModalProps) {
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize results when modal opens
  useEffect(() => {
    if (isOpen && accountIds.length > 0) {
      setResults(
        accountIds.map((id) => ({
          accountId: id,
          accountName: accountNames.get(id) || 'Bilinmeyen',
          status: 'pending',
        }))
      );
      setCurrentIndex(0);
      setIsCancelled(false);
    }
  }, [isOpen, accountIds, accountNames]);

  // Process verifications sequentially
  useEffect(() => {
    if (!isProcessing || isCancelled) return;

    const processNext = async () => {
      if (currentIndex >= results.length) {
        setIsProcessing(false);
        return;
      }

      const current = results[currentIndex];

      // Update to processing
      setResults((prev) =>
        prev.map((r, idx) =>
          idx === currentIndex ? { ...r, status: 'processing' } : r
        )
      );

      try {
        await onVerify(current.accountId);

        // Update to success
        setResults((prev) =>
          prev.map((r, idx) =>
            idx === currentIndex ? { ...r, status: 'success' } : r
          )
        );
      } catch (error) {
        logger.error('Bulk verification failed for account', error as Error, {
          accountId: current.accountId,
        });

        // Update to failed
        setResults((prev) =>
          prev.map((r, idx) =>
            idx === currentIndex
              ? {
                  ...r,
                  status: 'failed',
                  error:
                    error instanceof Error ? error.message : 'Bilinmeyen hata',
                }
              : r
          )
        );
      }

      // Move to next
      setCurrentIndex((prev) => prev + 1);
    };

    processNext();
  }, [isProcessing, currentIndex, results, onVerify, isCancelled]);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleStart = () => {
    setIsProcessing(true);
    setCurrentIndex(0);
  };

  const handleCancel = () => {
    setIsCancelled(true);
    setIsProcessing(false);
  };

  const handleClose = () => {
    if (isProcessing) {
      const confirm = window.confirm(
        'İşlem devam ediyor. Çıkmak istediğinizden emin misiniz?'
      );
      if (!confirm) return;
      setIsCancelled(true);
      setIsProcessing(false);
    }
    onClose();
  };

  // ========================================================================
  // STATS
  // ========================================================================

  const stats = {
    total: results.length,
    completed: results.filter((r) => r.status === 'success').length,
    failed: results.filter((r) => r.status === 'failed').length,
    pending: results.filter(
      (r) => r.status === 'pending' || r.status === 'processing'
    ).length,
    progress:
      results.length > 0
        ? Math.round((currentIndex / results.length) * 100)
        : 0,
  };

  const isComplete = currentIndex >= results.length && isProcessing === false;

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Toplu Hesap Onaylama
            </DialogTitle>
            <button
              onClick={handleClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              disabled={isProcessing}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  İşleniyor: {currentIndex + 1} / {stats.total}
                </span>
                <span className="font-semibold text-blue-600">
                  %{stats.progress}
                </span>
              </div>
              <Progress value={stats.progress} className="h-2" />
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Toplam</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {stats.completed}
              </p>
              <p className="text-sm text-green-700">Başarılı</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              <p className="text-sm text-red-700">Başarısız</p>
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-4">
            {results.map((result, index) => (
              <div
                key={result.accountId}
                className={`flex items-center justify-between rounded-lg p-3 ${
                  result.status === 'success'
                    ? 'bg-green-50'
                    : result.status === 'failed'
                      ? 'bg-red-50'
                      : result.status === 'processing'
                        ? 'bg-blue-50'
                        : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-medium text-gray-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {result.accountName}
                    </p>
                    {result.error && (
                      <p className="text-xs text-red-600">{result.error}</p>
                    )}
                  </div>
                </div>

                <div>
                  {result.status === 'success' && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {result.status === 'failed' && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  {result.status === 'processing' && (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  )}
                  {result.status === 'pending' && (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Warning */}
          {!isProcessing && !isComplete && (
            <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Dikkat!</p>
                <p className="mt-1">
                  {stats.total} banka hesabını onaylamak üzeresiniz. Bu işlem
                  geri alınamaz ve kullanıcılara email bildirimi
                  gönderilecektir.
                </p>
              </div>
            </div>
          )}

          {/* Completion Message */}
          {isComplete && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    Toplu Onaylama Tamamlandı
                  </p>
                  <p className="mt-1 text-sm text-green-700">
                    {stats.completed} hesap başarıyla onaylandı
                    {stats.failed > 0 &&
                      `, ${stats.failed} hesap başarısız oldu`}
                    .
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cancelled Message */}
          {isCancelled && !isComplete && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-900">
                    İşlem İptal Edildi
                  </p>
                  <p className="mt-1 text-sm text-orange-700">
                    {stats.completed} hesap onaylandı, kalan işlemler iptal
                    edildi.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!isProcessing && !isComplete && (
            <>
              <Button variant="outline" onClick={handleClose}>
                İptal
              </Button>
              <Button
                variant="primary"
                onClick={handleStart}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Onaylamaya Başla
              </Button>
            </>
          )}

          {isProcessing && !isComplete && (
            <Button variant="destructive" onClick={handleCancel}>
              <XCircle className="mr-2 h-4 w-4" />
              İşlemi Durdur
            </Button>
          )}

          {isComplete && (
            <Button variant="primary" onClick={handleClose}>
              Kapat
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BulkVerificationModal;
