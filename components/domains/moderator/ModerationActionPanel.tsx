'use client';

/**
 * ================================================
 * MODERATION ACTIONS PANEL
 * ================================================
 * Quick action panel for approving/rejecting/marking as spam
 *
 * Sprint: Moderator System Completion - Day 1
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @updated November 1, 2025
 */

'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Textarea } from '@/components/ui/Textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

interface ModerationActionPanelProps {
  itemId: string;
  itemType: string;
  onApprove: (itemId: string) => Promise<void>;
  onReject: (itemId: string, reason?: string) => Promise<void>;
  onSpam?: (itemId: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ModerationActionPanel({
  itemId,
  itemType,
  onApprove,
  onReject,
  onSpam,
  disabled = false,
  className = '',
}: ModerationActionPanelProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isMarkingSpam, setIsMarkingSpam] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Handle approve
  const handleApprove = async () => {
    if (isApproving || disabled) return;

    try {
      setIsApproving(true);
      await onApprove(itemId);
      toast.success('İçerik onaylandı');
      logger.info(`Approved ${itemType}:`, itemId);
    } catch (error) {
      logger.error(`Failed to approve ${itemType}:`, error instanceof Error ? error : new Error(String(error)));
      toast.error('Onaylama başarısız oldu');
    } finally {
      setIsApproving(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (isRejecting || disabled) return;

    if (!rejectReason.trim()) {
      toast.error('Lütfen ret sebebi belirtin');
      return;
    }

    try {
      setIsRejecting(true);
      await onReject(itemId, rejectReason);
      toast.success('İçerik reddedildi');
      logger.info(`Rejected ${itemType}:`, { itemId, rejectReason });
      setShowRejectDialog(false);
      setRejectReason('');
    } catch (error) {
      logger.error(`Failed to reject ${itemType}:`, error instanceof Error ? error : new Error(String(error)));
      toast.error('Reddetme başarısız oldu');
    } finally {
      setIsRejecting(false);
    }
  };

  // Handle spam
  const handleSpam = async () => {
    if (!onSpam || isMarkingSpam || disabled) return;

    try {
      setIsMarkingSpam(true);
      await onSpam(itemId);
      toast.success('İçerik spam olarak işaretlendi');
      logger.info(`Marked ${itemType} as spam:`, itemId);
    } catch (error) {
      logger.error(`Failed to mark ${itemType} as spam:`, error instanceof Error ? error : new Error(String(error)));
      toast.error('Spam işaretleme başarısız oldu');
    } finally {
      setIsMarkingSpam(false);
    }
  };

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        {/* Approve Button */}
        <Button
          variant="success"
          size="sm"
          onClick={handleApprove}
          disabled={disabled || isApproving || isRejecting || isMarkingSpam}
          className="flex-1"
        >
          {isApproving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <CheckCircle className="mr-1 h-4 w-4" />
              Onayla
            </>
          )}
        </Button>

        {/* Reject Button */}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowRejectDialog(true)}
          disabled={disabled || isApproving || isRejecting || isMarkingSpam}
          className="flex-1"
        >
          {isRejecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <XCircle className="mr-1 h-4 w-4" />
              Reddet
            </>
          )}
        </Button>

        {/* Spam Button (Optional) */}
        {onSpam && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSpam}
            disabled={disabled || isApproving || isRejecting || isMarkingSpam}
            className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            {isMarkingSpam ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <AlertTriangle className="mr-1 h-4 w-4" />
                Spam
              </>
            )}
          </Button>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İçeriği Reddet</DialogTitle>
            <DialogDescription>
              Bu içeriği neden reddettiğinizi açıklayın. Bu bilgi yalnızca
              moderatörler tarafından görülebilir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Ret Sebebi *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Örn: İçerik topluluk kurallarına aykırı..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason('');
              }}
              disabled={isRejecting}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting || !rejectReason.trim()}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reddediliyor...
                </>
              ) : (
                'Reddet'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ModerationActionPanel;
