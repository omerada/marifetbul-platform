/**
 * ================================================
 * COMMENT BULK ACTIONS COMPONENT
 * ================================================
 * Component for performing bulk moderation actions
 * Provides confirmation dialogs and progress tracking
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Info,
  Flag,
} from 'lucide-react';

// ================================================
// TYPES
// ================================================

export interface BulkActionResult {
  success: number;
  failed: number;
  total: number;
  errors?: string[];
}

export interface CommentBulkActionsProps {
  selectedCount: number;
  onApprove: () => Promise<BulkActionResult>;
  onReject: () => Promise<BulkActionResult>;
  onSpam: () => Promise<BulkActionResult>;
  onEscalate?: () => Promise<BulkActionResult>;
  onCancel: () => void;
  disabled?: boolean;
}

// ================================================
// COMPONENT
// ================================================

export function CommentBulkActions({
  selectedCount,
  onApprove,
  onReject,
  onSpam,
  onEscalate,
  onCancel,
  disabled = false,
}: CommentBulkActionsProps) {
  // ================================================
  // STATE
  // ================================================

  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState<
    'approve' | 'reject' | 'spam' | 'escalate' | null
  >(null);
  const [result, setResult] = useState<BulkActionResult | null>(null);

  // ================================================
  // HANDLERS
  // ================================================

  const handleAction = async (
    action: 'approve' | 'reject' | 'spam' | 'escalate'
  ) => {
    setIsProcessing(true);
    setResult(null);

    try {
      let actionResult: BulkActionResult;

      switch (action) {
        case 'approve':
          actionResult = await onApprove();
          break;
        case 'reject':
          actionResult = await onReject();
          break;
        case 'spam':
          actionResult = await onSpam();
          break;
        case 'escalate':
          if (onEscalate) {
            actionResult = await onEscalate();
          } else {
            throw new Error('Escalate handler not provided');
          }
          break;
      }

      setResult(actionResult);

      // Auto-close after success (if all succeeded)
      if (actionResult.failed === 0) {
        setTimeout(() => {
          setShowConfirm(null);
          setResult(null);
        }, 2000);
      }
    } catch (_error) {
      setResult({
        success: 0,
        failed: selectedCount,
        total: selectedCount,
        errors: ['İşlem sırasında bir hata oluştu'],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = (
    action: 'approve' | 'reject' | 'spam' | 'escalate'
  ) => {
    setShowConfirm(action);
    setResult(null);
  };

  const handleConfirmAction = () => {
    if (showConfirm) {
      handleAction(showConfirm);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirm(null);
    setResult(null);
  };

  // ================================================
  // RENDER - Confirmation Dialog
  // ================================================

  if (showConfirm) {
    const actionText =
      showConfirm === 'approve'
        ? 'onaylamak'
        : showConfirm === 'reject'
          ? 'reddetmek'
          : showConfirm === 'spam'
            ? 'spam olarak işaretlemek'
            : 'yükseltmek';

    const actionColor =
      showConfirm === 'approve'
        ? 'green'
        : showConfirm === 'reject'
          ? 'red'
          : showConfirm === 'escalate'
            ? 'purple'
            : 'gray';

    return (
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
        {/* Confirmation Message */}
        {!result && !isProcessing && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">
                  {selectedCount} yorumu {actionText} istediğinize emin misiniz?
                </p>
                <p className="mt-1 text-sm text-blue-700">
                  Bu işlem geri alınamaz ve tüm seçili yorumlara uygulanacaktır.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelConfirm}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmAction}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                  actionColor === 'green'
                    ? 'bg-green-600 hover:bg-green-700'
                    : actionColor === 'red'
                      ? 'bg-red-600 hover:bg-red-700'
                      : actionColor === 'purple'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                Evet, {actionText}
              </button>
            </div>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">İşleniyor...</p>
              <p className="text-sm text-blue-700">
                {selectedCount} yorum işleniyor, lütfen bekleyin.
              </p>
            </div>
          </div>
        )}

        {/* Result State */}
        {result && (
          <div className="space-y-4">
            {/* Success */}
            {result.failed === 0 && (
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">İşlem başarılı!</p>
                  <p className="text-sm text-green-700">
                    {result.success} yorum başarıyla {actionText} işlendi.
                  </p>
                </div>
              </div>
            )}

            {/* Partial Success */}
            {result.failed > 0 && result.success > 0 && (
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Kısmi başarı</p>
                  <p className="text-sm text-yellow-700">
                    {result.success} yorum başarılı, {result.failed} yorum
                    başarısız.
                  </p>
                  {result.errors && result.errors.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                      {result.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* All Failed */}
            {result.failed === result.total && (
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">İşlem başarısız</p>
                  <p className="text-sm text-red-700">
                    {result.failed} yorumun hiçbiri işlenemedi.
                  </p>
                  {result.errors && result.errors.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm text-red-700">
                      {result.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={handleCancelConfirm}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================================================
  // RENDER - Action Buttons
  // ================================================

  return (
    <div className="flex items-center gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <p className="text-sm font-medium text-blue-900">
        {selectedCount} yorum seçildi
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleConfirm('approve')}
          disabled={disabled || isProcessing}
          className="flex items-center gap-1 rounded-lg border border-green-600 bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Onayla</span>
        </button>

        <button
          onClick={() => handleConfirm('reject')}
          disabled={disabled || isProcessing}
          className="flex items-center gap-1 rounded-lg border border-red-600 bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <XCircle className="h-4 w-4" />
          <span>Reddet</span>
        </button>

        <button
          onClick={() => handleConfirm('spam')}
          disabled={disabled || isProcessing}
          className="flex items-center gap-1 rounded-lg border border-gray-600 bg-gray-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Spam</span>
        </button>

        {onEscalate && (
          <button
            onClick={() => handleConfirm('escalate')}
            disabled={disabled || isProcessing}
            className="flex items-center gap-1 rounded-lg border border-purple-600 bg-purple-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Flag className="h-4 w-4" />
            <span>Yükselt</span>
          </button>
        )}

        <button
          onClick={onCancel}
          disabled={disabled || isProcessing}
          className="ml-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Seçimi kaldır
        </button>
      </div>
    </div>
  );
}

export default CommentBulkActions;
