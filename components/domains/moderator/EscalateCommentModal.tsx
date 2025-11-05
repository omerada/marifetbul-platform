/**
 * ================================================
 * ESCALATE COMMENT MODAL
 * ================================================
 * Sprint 1 - Task 6: Comment Escalation Feature
 * Modal for escalating comments to admin/senior moderator
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 5, 2025
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Textarea } from '@/components/ui/Textarea';
import { AlertTriangle } from 'lucide-react';

// ================================================
// TYPES
// ================================================

export interface EscalateCommentModalProps {
  /** Is modal open */
  isOpen: boolean;
  /** Close modal handler */
  onClose: () => void;
  /** Escalate handler */
  onEscalate: (reason: string) => Promise<void> | void;
  /** Number of comments to escalate */
  commentCount?: number;
  /** Is escalation in progress */
  isLoading?: boolean;
}

// ================================================
// COMPONENT
// ================================================

export function EscalateCommentModal({
  isOpen,
  onClose,
  onEscalate,
  commentCount = 1,
  isLoading = false,
}: EscalateCommentModalProps) {
  const [reason, setReason] = useState('');

  const handleEscalate = async () => {
    if (!reason.trim()) return;

    await onEscalate(reason);
    setReason(''); // Reset form
  };

  const handleClose = () => {
    if (isLoading) return; // Prevent closing during operation
    setReason('');
    onClose();
  };

  const isSingleComment = commentCount === 1;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <DialogTitle>Yorumu Yükselt</DialogTitle>
              <DialogDescription>
                {isSingleComment
                  ? 'Yorumu üst otoriteye ileterek inceleme talebinde bulunun'
                  : `${commentCount} yorumu üst otoriteye ileterek inceleme talebinde bulunun`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Reason Textarea */}
          <div className="space-y-2">
            <label
              htmlFor="escalation-reason"
              className="text-sm font-medium text-gray-700"
            >
              Yükseltme Nedeni *
            </label>
            <Textarea
              id="escalation-reason"
              placeholder="Örn: Şiddet içerikli, kullanıcı taciz ediyor, karmaşık durum..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              disabled={isLoading}
              className="resize-none"
              required
            />
            <p className="text-xs text-gray-500">
              Bu yorum neden üst otoriteye iletilmeli? Detaylı açıklama yapın.
            </p>
          </div>

          {/* Info Box */}
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
            <p className="text-sm text-orange-800">
              <strong>Not:</strong> Yükseltilen yorumlar admin panelinde
              &quot;Escalated Items&quot; bölümünde görüntülenecek ve üst düzey
              moderatör veya admin tarafından değerlendirilecektir.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            type="button"
          >
            İptal
          </Button>
          <Button
            variant="primary"
            onClick={handleEscalate}
            disabled={!reason.trim() || isLoading}
            loading={isLoading}
            type="submit"
          >
            {isLoading
              ? 'Yükseltiliyor...'
              : isSingleComment
                ? 'Yorumu Yükselt'
                : `${commentCount} Yorumu Yükselt`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
