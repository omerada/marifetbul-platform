'use client';

/**
 * ================================================
 * REJECT COMMENT MODAL
 * ================================================
 * Modal for rejecting blog comments with reason selection
 * Provides predefined reasons and optional message field
 *
 * Day 2 Story 2.1 - Sprint 2
 */

'use client';

import React, { useState } from 'react';
import { XCircle, AlertCircle } from 'lucide-react';

// Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';

// API
import { REJECTION_REASONS } from '@/lib/shared/constants/moderation';

/**
 * Props for RejectCommentModal
 */
export interface RejectCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, message?: string) => Promise<void>;
  _commentId: number;
  commentPreview: string;
  isBulk?: boolean;
  bulkCount?: number;
}

/**
 * Reject Comment Modal Component
 */
export function RejectCommentModal({
  isOpen,
  onClose,
  onConfirm,
  _commentId,
  commentPreview,
  isBulk = false,
  bulkCount = 1,
}: RejectCommentModalProps) {
  // State
  const [selectedReason, setSelectedReason] = useState<string>('INAPPROPRIATE');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      setError('Lütfen bir reddetme nedeni seçin');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await onConfirm(selectedReason, message || undefined);

      // Reset form
      setSelectedReason('INAPPROPRIATE');
      setMessage('');
      onClose();
    } catch (err) {
      console.error('Failed to reject comment:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Yorum reddedilirken bir hata oluştu'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    setSelectedReason('INAPPROPRIATE');
    setMessage('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isBulk ? `${bulkCount} Yorumu Reddet` : 'Yorumu Reddet'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* Warning Banner */}
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">
                {isBulk
                  ? `${bulkCount} yorum reddedilecek`
                  : 'Bu yorum reddedilecek'}
              </p>
              <p className="mt-1 text-sm text-red-700">
                Reddedilen yorumlar blog yazısında görünmeyecek ve yazar
                bilgilendirilecektir.
              </p>
            </div>
          </div>

          {/* Comment Preview (for single reject) */}
          {!isBulk && commentPreview && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 text-xs font-medium text-gray-700">
                Reddedilecek Yorum:
              </p>
              <p className="line-clamp-3 text-sm text-gray-900">
                {commentPreview}
              </p>
            </div>
          )}

          {/* Reason Selection */}
          <div className="space-y-2">
            <label
              htmlFor="rejection-reason"
              className="block text-sm font-medium text-gray-700"
            >
              Reddetme Nedeni <span className="text-red-500">*</span>
            </label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger className="w-full" placeholder="Bir neden seçin" />
              <SelectContent>
                {REJECTION_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Reddetme nedeni yazar&apos;a bildirilecektir
            </p>
          </div>

          {/* Optional Message */}
          <div className="space-y-2">
            <label
              htmlFor="rejection-message"
              className="block text-sm font-medium text-gray-700"
            >
              Ek Açıklama (İsteğe Bağlı)
            </label>
            <Textarea
              id="rejection-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Yazara göndermek istediğiniz ek açıklama..."
              rows={4}
              maxLength={500}
              className="w-full resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Yorumun neden reddedildiğini detaylı açıklayabilirsiniz
              </p>
              <span className="text-xs text-gray-400">
                {message.length}/500
              </span>
            </div>
          </div>

          {/* Selected Reason Badge */}
          {selectedReason && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Seçili Neden:</span>
              <Badge variant="destructive">
                {REJECTION_REASONS.find((r) => r.value === selectedReason)
                  ?.label || selectedReason}
              </Badge>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <UnifiedButton
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={loading}
            >
              İptal
            </UnifiedButton>
            <UnifiedButton
              type="submit"
              variant="destructive"
              disabled={loading || !selectedReason}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Reddediliyor...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  {isBulk ? `${bulkCount} Yorumu Reddet` : 'Reddet'}
                </>
              )}
            </UnifiedButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RejectCommentModal;
