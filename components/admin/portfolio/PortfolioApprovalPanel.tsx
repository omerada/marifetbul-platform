/**
 * ================================================
 * PORTFOLIO APPROVAL PANEL
 * ================================================
 * Admin component for approving/rejecting portfolio items
 *
 * Sprint 2: Admin Panel Completion
 *
 * Features:
 * - Bulk approve/reject
 * - Individual portfolio moderation
 * - Rejection reason input
 * - Quick approval actions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Textarea } from '@/components/ui/Textarea';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';
import { portfolioAdminApi } from '@/lib/api/portfolio-admin';

interface PortfolioApprovalPanelProps {
  portfolioId: string;
  onApproved?: () => void;
  onRejected?: () => void;
}

export function PortfolioApprovalPanel({
  portfolioId,
  onApproved,
  onRejected,
}: PortfolioApprovalPanelProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [moderationNotes, setModerationNotes] = useState('');

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await portfolioAdminApi.approvePortfolio(portfolioId);
      toast.success('Portfolyo onaylandı');
      onApproved?.();
    } catch (error) {
      logger.error('Portfolio approval failed', error as Error);
      toast.error('Portfolyo onaylanırken bir hata oluştu');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Lütfen reddetme sebebini belirtin');
      return;
    }

    if (rejectionReason.length < 10) {
      toast.error('Reddetme sebebi en az 10 karakter olmalıdır');
      return;
    }

    setIsRejecting(true);
    try {
      await portfolioAdminApi.rejectPortfolio(portfolioId, {
        reason: rejectionReason,
        moderationNotes: moderationNotes.trim() || undefined,
      });
      toast.success('Portfolyo reddedildi');
      setShowRejectForm(false);
      setRejectionReason('');
      setModerationNotes('');
      onRejected?.();
    } catch (error) {
      logger.error('Portfolio rejection failed', error as Error);
      toast.error('Portfolyo reddedilirken bir hata oluştu');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        <h3 className="font-semibold text-gray-900">Moderasyon İşlemleri</h3>
      </div>

      {!showRejectForm ? (
        <div className="flex gap-2">
          <Button
            onClick={handleApprove}
            disabled={isApproving}
            variant="primary"
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {isApproving ? 'Onaylanıyor...' : 'Onayla'}
          </Button>

          <Button
            onClick={() => setShowRejectForm(true)}
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reddet
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Reddetme Sebebi <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Portfolyo neden reddedildi? (kullanıcıya bildirilecek, min. 10 karakter)"
              rows={3}
              className="w-full"
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-500">
              {rejectionReason.length}/500 karakter
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Moderasyon Notları (İç Kullanım)
            </label>
            <Textarea
              value={moderationNotes}
              onChange={(e) => setModerationNotes(e.target.value)}
              placeholder="İç notlarınız (opsiyonel, kullanıcıya gösterilmez)"
              rows={2}
              className="w-full"
              maxLength={1000}
            />
            <p className="mt-1 text-xs text-gray-500">
              {moderationNotes.length}/1000 karakter
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleReject}
              disabled={
                isRejecting ||
                !rejectionReason.trim() ||
                rejectionReason.length < 10
              }
              variant="primary"
              className="bg-red-600 hover:bg-red-700"
            >
              {isRejecting ? 'Reddediliyor...' : 'Reddet'}
            </Button>

            <Button
              onClick={() => {
                setShowRejectForm(false);
                setRejectionReason('');
                setModerationNotes('');
              }}
              variant="outline"
              className="flex-1"
            >
              İptal
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        * Onaylanan portfolyolar kullanıcı profilinde herkese açık olarak
        görüntülenecektir.
      </p>
    </div>
  );
}
