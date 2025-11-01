/**
 * ================================================
 * BULK ACTION MODAL
 * ================================================
 * Confirmation modal for bulk moderation actions
 * Displays action type, selected count, and confirmation
 *
 * Day 2 Story 2.2 - Sprint 2
 */

'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertOctagon,
  AlertTriangle,
} from 'lucide-react';

// Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';

/**
 * Bulk action types
 */
export type BulkActionType = 'approve' | 'reject' | 'spam';

/**
 * Props for BulkActionModal
 */
export interface BulkActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  actionType: BulkActionType;
  selectedCount: number;
  commentPreviews?: string[];
}

/**
 * Get action configuration (icon, color, title, message)
 */
const getActionConfig = (actionType: BulkActionType, count: number) => {
  const configs = {
    approve: {
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      title: `${count} Yorumu Onayla`,
      message:
        'Bu yorumlar onaylanacak ve blog yazısında görünür hale gelecektir.',
      actionLabel: 'Onayla',
      buttonVariant: 'success' as const,
      badge: { label: 'Onay', variant: 'success' as const },
    },
    reject: {
      icon: XCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      title: `${count} Yorumu Reddet`,
      message: 'Bu yorumlar reddedilecek ve yazarlar bilgilendirilecektir.',
      actionLabel: 'Reddet',
      buttonVariant: 'destructive' as const,
      badge: { label: 'Ret', variant: 'destructive' as const },
    },
    spam: {
      icon: AlertOctagon,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      title: `${count} Yorumu Spam İşaretle`,
      message: 'Bu yorumlar spam olarak işaretlenecek ve gizlenecektir.',
      actionLabel: 'Spam İşaretle',
      buttonVariant: 'warning' as const,
      badge: { label: 'Spam', variant: 'warning' as const },
    },
  };

  return configs[actionType];
};

/**
 * Bulk Action Modal Component
 */
export function BulkActionModal({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  selectedCount,
  commentPreviews = [],
}: BulkActionModalProps) {
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get action configuration
  const config = getActionConfig(actionType, selectedCount);
  const Icon = config.icon;

  /**
   * Handle confirmation
   */
  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);

      await onConfirm();

      onClose();
    } catch (err) {
      console.error('Bulk action failed:', err);
      setError(
        err instanceof Error ? err.message : 'İşlem sırasında bir hata oluştu'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Warning Banner */}
          <div
            className={`flex items-start gap-3 rounded-lg border p-4 ${config.bgColor} ${config.borderColor}`}
          >
            <Icon
              className={`mt-0.5 h-5 w-5 flex-shrink-0 ${config.iconColor}`}
            />
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${config.iconColor.replace('text-', 'text-opacity-90')}`}
              >
                {config.message}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-600">Toplam:</span>
                <Badge variant={config.badge.variant}>
                  {selectedCount} yorum
                </Badge>
              </div>
            </div>
          </div>

          {/* Comment Previews (show first 3) */}
          {commentPreviews.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">
                Seçili Yorumlar:
              </p>
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {commentPreviews.slice(0, 3).map((preview, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    <p className="line-clamp-2 text-sm text-gray-900">
                      {preview}
                    </p>
                  </div>
                ))}
                {commentPreviews.length > 3 && (
                  <p className="py-2 text-center text-xs text-gray-500">
                    ve {commentPreviews.length - 3} yorum daha...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Summary */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Bu işlem geri alınamaz
                </p>
                <p className="mt-1 text-sm text-blue-700">
                  {actionType === 'approve' &&
                    'Onaylanan yorumlar anında blog yazısında görünür olacaktır.'}
                  {actionType === 'reject' &&
                    'Reddedilen yorumlar yazar panelinde görüntülenebilir ancak yayından kaldırılır.'}
                  {actionType === 'spam' &&
                    'Spam olarak işaretlenen yorumlar gizlenir ve gelecekte otomatik filtrelenebilir.'}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
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
              type="button"
              variant={config.buttonVariant}
              onClick={handleConfirm}
              disabled={loading}
              className="min-w-[140px]"
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <Icon className="mr-2 h-4 w-4" />
                  {config.actionLabel}
                </>
              )}
            </UnifiedButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BulkActionModal;
