'use client';

/**
 * ================================================
 * COMMENT ESCALATION MODAL
 * ================================================
 * Modal for escalating comments to admin/senior moderator
 * Single and bulk escalation support
 *
 * Sprint 1: Comment Moderation UI Completion
 * Backend API: POST /api/v1/blog/admin/comments/{id}/escalate
 *              POST /api/v1/blog/admin/comments/bulk/escalate
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since December 2, 2025
 */

'use client';

import React, { useState } from 'react';
import { X, ArrowUpCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { escalateComment, bulkEscalateComments } from '@/lib/api/blog';
import type { BulkCommentActionResponse } from '@/lib/api/blog';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

export type EscalationPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface EscalationData {
  reason: string;
  priority: EscalationPriority;
  notes?: string;
}

export interface CommentEscalationModalProps {
  // Single comment escalation
  commentId?: number;
  commentContent?: string;

  // Bulk escalation
  commentIds?: number[];
  bulkMode?: boolean;

  // Modal state
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ================================================
// PRIORITY OPTIONS
// ================================================

const PRIORITY_OPTIONS: Array<{
  value: EscalationPriority;
  label: string;
  description: string;
  color: string;
}> = [
  {
    value: 'LOW',
    label: 'Düşük',
    description: 'Normal inceleme gerekiyor',
    color: 'text-green-600',
  },
  {
    value: 'MEDIUM',
    label: 'Orta',
    description: 'Önemli, yakında incelenmeli',
    color: 'text-yellow-600',
  },
  {
    value: 'HIGH',
    label: 'Yüksek',
    description: 'Acil, hemen incelenmeli',
    color: 'text-red-600',
  },
];

// ================================================
// COMPONENT
// ================================================

export function CommentEscalationModal({
  commentId,
  commentContent,
  commentIds = [],
  bulkMode = false,
  isOpen,
  onClose,
  onSuccess,
}: CommentEscalationModalProps) {
  // ================================================
  // STATE
  // ================================================

  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<EscalationPriority>('MEDIUM');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBulk = bulkMode && commentIds.length > 0;
  const count = isBulk ? commentIds.length : 1;

  // ================================================
  // VALIDATION
  // ================================================

  const isValid = reason.trim().length >= 10;

  // ================================================
  // HANDLERS
  // ================================================

  const handleEscalate = async () => {
    if (!isValid) {
      toast.error('Lütfen yeterli detay sağlayın (en az 10 karakter)');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isBulk) {
        // Bulk escalation
        const response: BulkCommentActionResponse = await bulkEscalateComments(
          commentIds,
          reason,
          priority
        );

        logger.info('Bulk comment escalation completed', {
          total: response.totalProcessed,
          successful: response.successCount,
          failed: response.failureCount,
        });

        // Show toast based on results
        if (response.failureCount === 0) {
          toast.success(
            `${response.successCount} yorum başarıyla yönlendirildi`
          );
        } else {
          toast.warning(
            `${response.successCount} yorum yönlendirildi, ${response.failureCount} başarısız`
          );
        }
      } else if (commentId) {
        // Single escalation
        await escalateComment(commentId, reason, priority);

        logger.info('Comment escalated to admin', {
          commentId,
          priority,
        });

        toast.success('Yorum admin ekibine yönlendirildi');
      }

      // Success callback
      onSuccess?.();

      // Reset and close
      handleClose();
    } catch (error) {
      logger.error('Comment escalation failed', error as Error, {
        commentId,
        commentIds,
        bulkMode: isBulk,
      });

      toast.error('Yorum yönlendirilemedi. Lütfen tekrar deneyin.', {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      setPriority('MEDIUM');
      setNotes('');
      onClose();
    }
  };

  // ================================================
  // RENDER
  // ================================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2">
              <ArrowUpCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isBulk
                  ? `Yorumları Yönetici Ekibine Yönlendir`
                  : 'Yorumu Yönetici Ekibine Yönlendir'}
              </h3>
              <p className="text-sm text-gray-500">
                {isBulk
                  ? `${count} yorum seçildi`
                  : 'Karmaşık veya belirsiz durumlar için'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 px-6 py-4">
          {/* Comment Preview (Single mode only) */}
          {!isBulk && commentContent && (
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="line-clamp-3 text-sm text-gray-600">
                {commentContent}
              </p>
            </div>
          )}

          {/* Priority Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Öncelik Seviyesi <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {PRIORITY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-all ${
                    priority === option.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={option.value}
                    checked={priority === option.value}
                    onChange={(e) =>
                      setPriority(e.target.value as EscalationPriority)
                    }
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${option.color}`}>
                        {option.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Reason (Required) */}
          <div>
            <label
              htmlFor="reason"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Yönlendirme Nedeni <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              placeholder="Neden bu yorumu yönetici ekibine yönlendiriyorsunuz? Detaylı açıklama sağlayın..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:bg-gray-50"
              rows={4}
              minLength={10}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              En az 10 karakter ({reason.length}/10)
            </p>
          </div>

          {/* Additional Notes (Optional) */}
          <div>
            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Ek Notlar (İsteğe Bağlı)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              placeholder="Varsa ek bilgiler veya bağlam..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:bg-gray-50"
              rows={2}
            />
          </div>

          {/* Warning */}
          <div className="flex gap-2 rounded-lg bg-amber-50 p-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Dikkat</p>
              <p className="mt-1">
                Bu yorum yönetici ekibine iletilecektir. Yalnızca karmaşık veya
                belirsiz durumlar için kullanın.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            İptal
          </button>
          <button
            onClick={handleEscalate}
            disabled={!isValid || isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Yönlendiriliyor...
              </>
            ) : (
              <>
                <ArrowUpCircle className="h-4 w-4" />
                {isBulk ? `${count} Yorumu Yönlendir` : 'Yönlendir'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentEscalationModal;
