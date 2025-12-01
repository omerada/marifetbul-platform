'use client';

/**
 * ================================================
 * BULK ACTION TOOLBAR COMPONENT
 * ================================================
 * Toolbar for bulk moderation actions on comments
 * Displays when multiple comments are selected
 * Provides approve, reject, and spam actions
 *
 * Sprint 1 - EPIC 2.1: Bulk Comment Actions
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
import { Button } from '@/components/ui';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';
import {
  bulkApproveComments,
  bulkRejectComments,
  bulkMarkAsSpam,
} from '@/lib/api/blog';
import type { BulkCommentActionResponse } from '@/types/blog';

// ================================================
// TYPES
// ================================================

export interface BulkActionToolbarProps {
  selectedIds: number[];
  onActionComplete: () => void;
  onClearSelection: () => void;
  onEscalate?: (ids: number[]) => Promise<void>;
}

// ================================================
// COMPONENT
// ================================================

export function BulkActionToolbar({
  selectedIds,
  onActionComplete,
  onClearSelection,
  onEscalate,
}: BulkActionToolbarProps) {
  const [loading, setLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // ================================================
  // HANDLERS
  // ================================================

  const handleBulkEscalate = async () => {
    if (selectedIds.length === 0 || !onEscalate) return;

    // Confirm action
    if (
      !confirm(
        `${selectedIds.length} yorumu yöneticilere yükseltmek istediğinizden emin misiniz?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await onEscalate(selectedIds);
      toast.success(`${selectedIds.length} yorum başarıyla yükseltildi`);
      onActionComplete();
      onClearSelection();
    } catch (error) {
      logger.error(
        'Bulk escalate error:',
        error instanceof Error ? error : new Error(String(error))
      );
      toast.error('Yükseltme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;

    setLoading(true);
    try {
      const response: BulkCommentActionResponse =
        await bulkApproveComments(selectedIds);

      // Show success/failure summary
      if (response.successCount > 0) {
        toast.success(`${response.successCount} yorum başarıyla onaylandı`, {
          description:
            response.failureCount > 0
              ? `${response.failureCount} yorum onaylanamadı`
              : undefined,
        });
      }

      if (response.failureCount > 0) {
        toast.error(`${response.failureCount} yorum onaylanamadı`, {
          description: 'Detaylar için loglara bakın',
        });
        logger.error(
          'Failed comment approvals:',
          new Error(`${response.failureCount} failures`),
          { failures: response.failures }
        );
      }

      onActionComplete();
      onClearSelection();
    } catch (error) {
      logger.error(
        'Bulk approve error:',
        error instanceof Error ? error : new Error(String(error))
      );
      toast.error('Toplu onaylama sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;

    setLoading(true);
    try {
      const response: BulkCommentActionResponse = await bulkRejectComments(
        selectedIds,
        rejectReason || 'Toplu reddetme'
      );

      if (response.successCount > 0) {
        toast.success(`${response.successCount} yorum başarıyla reddedildi`, {
          description:
            response.failureCount > 0
              ? `${response.failureCount} yorum reddedilemedi`
              : undefined,
        });
      }

      if (response.failureCount > 0) {
        toast.error(`${response.failureCount} yorum reddedilemedi`);
        logger.error(
          'Failed comment rejections',
          new Error(`${response.failureCount} failures`),
          { failures: response.failures }
        );
      }

      setShowRejectDialog(false);
      setRejectReason('');
      onActionComplete();
      onClearSelection();
    } catch (error) {
      logger.error(
        'Bulk reject error:',
        error instanceof Error ? error : new Error(String(error))
      );
      toast.error('Toplu reddetme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSpam = async () => {
    if (selectedIds.length === 0) return;

    // Confirm action
    if (
      !confirm(
        `${selectedIds.length} yorumu spam olarak işaretlemek istediğinizden emin misiniz?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response: BulkCommentActionResponse =
        await bulkMarkAsSpam(selectedIds);

      if (response.successCount > 0) {
        toast.success(
          `${response.successCount} yorum spam olarak işaretlendi`,
          {
            description:
              response.failureCount > 0
                ? `${response.failureCount} yorum işaretlenemedi`
                : undefined,
          }
        );
      }

      if (response.failureCount > 0) {
        toast.error(`${response.failureCount} yorum işaretlenemedi`);
        logger.error(
          'Failed spam marking',
          new Error(`${response.failureCount} failures`),
          { failures: response.failures }
        );
      }

      onActionComplete();
      onClearSelection();
    } catch (error) {
      logger.error(
        'Bulk spam error:',
        error instanceof Error ? error : new Error(String(error))
      );
      toast.error('Spam işaretleme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // RENDER - Empty State
  // ================================================

  if (selectedIds.length === 0) {
    return null;
  }

  // ================================================
  // RENDER - Reject Dialog
  // ================================================

  if (showRejectDialog) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Yorumları Reddet
          </h3>

          <p className="mb-4 text-sm text-gray-600">
            {selectedIds.length} yorum reddedilecek. İsteğe bağlı bir sebep
            girebilirsiniz:
          </p>

          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reddetme sebebi (opsiyonel)"
            className="mb-4 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            rows={3}
          />

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason('');
              }}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkReject}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reddediliyor...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reddet
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ================================================
  // RENDER - Main Toolbar
  // ================================================

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transform">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
        {/* Selection Info */}
        <div className="mb-3 flex items-center gap-2 border-b border-gray-200 pb-3">
          <Info className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-900">
            {selectedIds.length} yorum seçildi
          </span>
          <button
            onClick={onClearSelection}
            className="ml-auto text-sm text-gray-600 hover:text-gray-900"
            disabled={loading}
          >
            Seçimi Temizle
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={handleBulkApprove}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Onayla ({selectedIds.length})
          </Button>

          <Button
            variant="destructive"
            onClick={() => setShowRejectDialog(true)}
            disabled={loading}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reddet ({selectedIds.length})
          </Button>

          <Button
            variant="outline"
            onClick={handleBulkSpam}
            disabled={loading}
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Spam ({selectedIds.length})
          </Button>

          {onEscalate && (
            <Button
              variant="outline"
              onClick={handleBulkEscalate}
              disabled={loading}
              className="border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              <Flag className="mr-2 h-4 w-4" />
              Yükselt ({selectedIds.length})
            </Button>
          )}
        </div>

        {/* Loading State Overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>İşlem yapılıyor...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BulkActionToolbar;
