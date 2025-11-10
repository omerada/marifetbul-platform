'use client';

/**
 * ================================================
 * JOB STATUS MODALS COMPONENT
 * ================================================
 * Modals for job status changes (close/reopen)
 *
 * Features:
 * - Close job (with reason)
 * - Reopen job (confirmation)
 * - Status change history
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2: Job Management Workflow
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/Dialog';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Textarea } from '@/components/ui/Textarea';
import { XCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { closeJob, reopenJob } from '@/lib/api/jobs';
import type { JobResponse } from '@/types/backend-aligned';
import logger from '@/lib/infrastructure/monitoring/logger';
import { toast } from 'sonner';

// ================================================
// CLOSE JOB MODAL
// ================================================

export interface JobCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (job: JobResponse) => void;
  job: JobResponse;
}

export function JobCloseModal({
  isOpen,
  onClose,
  onSuccess,
  job,
}: JobCloseModalProps) {
  const [reason, setReason] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = async () => {
    if (!reason.trim()) {
      toast.error('Lütfen kapatma nedenini belirtin');
      return;
    }

    try {
      setIsClosing(true);
      logger.info('Closing job', { jobId: job.id, reason });

      const closedJob = await closeJob(job.id);

      toast.success('İş ilanı başarıyla kapatıldı');
      onSuccess(closedJob);
      onClose();
    } catch (error) {
      logger.error('Failed to close job', error as Error);
      toast.error(
        error instanceof Error ? error.message : 'İş ilanı kapatılamadı'
      );
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            İş İlanını Kapat
          </DialogTitle>
          <DialogDescription>
            İş ilanını kapattığınızda yeni teklifler alınmayacaktır. Bu işlem
            geri alınabilir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Kapatma Nedeni <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Örn: Uygun freelancer bulundu, İş iptal edildi, vb."
              rows={4}
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500">
              Bu bilgi sadece sizin tarafınızdan görülecektir.
            </p>
          </div>

          <div className="rounded-lg bg-yellow-50 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Dikkat:</p>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>Bekleyen teklifler otomatik reddedilecek</li>
                  <li>İlan listelerden kaldırılacak</li>
                  <li>İstediğiniz zaman yeniden açabilirsiniz</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isClosing}>
            İptal
          </Button>
          <Button
            variant="destructive"
            onClick={handleClose}
            isLoading={isClosing}
            disabled={isClosing || !reason.trim()}
          >
            İlanı Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ================================================
// REOPEN JOB MODAL
// ================================================

export interface JobReopenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (job: JobResponse) => void;
  job: JobResponse;
}

export function JobReopenModal({
  isOpen,
  onClose,
  onSuccess,
  job,
}: JobReopenModalProps) {
  const [isReopening, setIsReopening] = useState(false);

  const handleReopen = async () => {
    try {
      setIsReopening(true);
      logger.info('Reopening job', { jobId: job.id });

      const reopenedJob = await reopenJob(job.id);

      toast.success('İş ilanı başarıyla yeniden açıldı');
      onSuccess(reopenedJob);
      onClose();
    } catch (error) {
      logger.error('Failed to reopen job', error as Error);
      toast.error(
        error instanceof Error ? error.message : 'İş ilanı açılamadı'
      );
    } finally {
      setIsReopening(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            İş İlanını Yeniden Aç
          </DialogTitle>
          <DialogDescription>
            İş ilanını yeniden açtığınızda teklifler alınmaya devam edecektir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Yeniden açıldığında:</p>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>İlan listelerinde görünmeye başlayacak</li>
                  <li>Yeni teklifler alınabilecek</li>
                  <li>Arama sonuçlarında çıkacak</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isReopening}>
            İptal
          </Button>
          <Button
            variant="primary"
            onClick={handleReopen}
            isLoading={isReopening}
            disabled={isReopening}
          >
            Yeniden Aç
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
