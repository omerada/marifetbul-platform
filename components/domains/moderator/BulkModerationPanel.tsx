'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface BulkModerationPanelProps {
  selectedCount: number;
  onBulkApprove: () => Promise<void>;
  onBulkReject: (reason: string) => Promise<void>;
  onBulkSpam: () => Promise<void>;
  onBulkDelete?: () => Promise<void>;
  onClearSelection: () => void;
  className?: string;
}

type BulkAction = 'approve' | 'reject' | 'spam' | 'delete' | null;

export function BulkModerationPanel({
  selectedCount,
  onBulkApprove,
  onBulkReject,
  onBulkSpam,
  onBulkDelete,
  onClearSelection,
  className = '',
}: BulkModerationPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [pendingAction, setPendingAction] = useState<BulkAction>(null);

  const handleBulkAction = async (action: BulkAction) => {
    if (action === 'reject') {
      setShowRejectDialog(true);
      return;
    }

    if (action === 'spam' || action === 'delete') {
      setPendingAction(action);
      setShowConfirmDialog(true);
      return;
    }

    if (action === 'approve') {
      await executeBulkAction('approve');
    }
  };

  const executeBulkAction = async (action: BulkAction) => {
    if (!action) return;

    setIsProcessing(true);
    try {
      switch (action) {
        case 'approve':
          await onBulkApprove();
          toast.success(`${selectedCount} öğe başarıyla onaylandı`);
          break;
        case 'reject':
          if (!rejectReason.trim()) {
            toast.error('Lütfen red nedeni belirtin');
            return;
          }
          await onBulkReject(rejectReason);
          toast.success(`${selectedCount} öğe başarıyla reddedildi`);
          setRejectReason('');
          setShowRejectDialog(false);
          break;
        case 'spam':
          await onBulkSpam();
          toast.success(`${selectedCount} öğe spam olarak işaretlendi`);
          setShowConfirmDialog(false);
          break;
        case 'delete':
          if (onBulkDelete) {
            await onBulkDelete();
            toast.success(`${selectedCount} öğe başarıyla silindi`);
            setShowConfirmDialog(false);
          }
          break;
      }
      onClearSelection();
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
      toast.error(
        `Toplu işlem başarısız oldu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );
    } finally {
      setIsProcessing(false);
      setPendingAction(null);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <Card className={`border-primary-500 bg-primary-50 p-4 ${className}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Selection Info */}
          <div className="flex items-center gap-3">
            <Badge className="bg-primary-500 px-3 py-1 text-white">
              {selectedCount} öğe seçildi
            </Badge>
            <UnifiedButton
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              disabled={isProcessing}
              leftIcon={<RotateCcw className="h-4 w-4" />}
              className="h-8"
            >
              Seçimi Temizle
            </UnifiedButton>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center gap-2">
            <UnifiedButton
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('approve')}
              disabled={isProcessing}
              leftIcon={
                isProcessing && pendingAction === 'approve' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )
              }
              className="h-9 border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Toplu Onayla
            </UnifiedButton>

            <UnifiedButton
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('reject')}
              disabled={isProcessing}
              leftIcon={<XCircle className="h-4 w-4" />}
              className="h-9 border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
            >
              Toplu Reddet
            </UnifiedButton>

            <UnifiedButton
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('spam')}
              disabled={isProcessing}
              leftIcon={<AlertTriangle className="h-4 w-4" />}
              className="h-9 border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100"
            >
              Spam İşaretle
            </UnifiedButton>

            {onBulkDelete && (
              <UnifiedButton
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                disabled={isProcessing}
                leftIcon={<Trash2 className="h-4 w-4" />}
                className="h-9 border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
              >
                Toplu Sil
              </UnifiedButton>
            )}
          </div>
        </div>
      </Card>

      {/* Reject Reason Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Toplu Reddetme Nedeni</DialogTitle>
            <DialogDescription>
              {selectedCount} öğeyi reddetmek için lütfen bir neden belirtin. Bu
              neden kullanıcılara gösterilecektir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rejectReason">Red Nedeni *</Label>
              <Textarea
                id="rejectReason"
                placeholder="Örn: İçerik topluluk kurallarına uygun değil..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <UnifiedButton
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason('');
              }}
              disabled={isProcessing}
            >
              İptal
            </UnifiedButton>
            <UnifiedButton
              onClick={() => executeBulkAction('reject')}
              disabled={isProcessing || !rejectReason.trim()}
              leftIcon={
                isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )
              }
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isProcessing ? 'İşleniyor...' : 'Reddet'}
            </UnifiedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === 'spam'
                ? 'Spam Olarak İşaretle'
                : 'Toplu Silme'}
            </DialogTitle>
            <DialogDescription>
              {pendingAction === 'spam' ? (
                <>
                  <strong>{selectedCount}</strong> öğeyi spam olarak işaretlemek
                  üzeresiniz. Bu işlem:
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    <li>İçerikleri spam olarak işaretleyecek</li>
                    <li>Kullanıcı spam skorunu artıracak</li>
                    <li>Otomatik spam filtreleme için kullanılacak</li>
                  </ul>
                </>
              ) : (
                <>
                  <strong className="text-red-600">{selectedCount}</strong>{' '}
                  öğeyi kalıcı olarak silmek üzeresiniz. Bu işlem{' '}
                  <strong>GERİ ALINAMAZ</strong>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <UnifiedButton
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setPendingAction(null);
              }}
              disabled={isProcessing}
            >
              İptal
            </UnifiedButton>
            <UnifiedButton
              onClick={() => executeBulkAction(pendingAction)}
              disabled={isProcessing}
              leftIcon={
                isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : pendingAction === 'spam' ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )
              }
              className={
                pendingAction === 'spam'
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }
            >
              {isProcessing
                ? 'İşleniyor...'
                : pendingAction === 'spam'
                  ? 'Spam İşaretle'
                  : 'Sil'}
            </UnifiedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BulkModerationPanel;
