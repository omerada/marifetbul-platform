'use client';

/**
 * ================================================
 * DELETE JOB MODAL
 * ================================================
 * Confirmation modal for deleting jobs with safety checks
 *
 * Sprint 3 - Story 3.1: Job Deletion Implementation
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 24, 2025
 */

import React, { useState, useCallback } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import type { JobResponse } from '@/types/backend-aligned';
import { deleteJob } from '@/lib/api/jobs';
import { useToast } from '@/hooks';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface DeleteJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobResponse;
  onSuccess?: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if job can be deleted based on status and proposals
 */
function canDeleteJob(job: JobResponse): {
  canDelete: boolean;
  reason?: string;
} {
  // Cannot delete IN_PROGRESS jobs
  if (job.status === 'IN_PROGRESS') {
    return {
      canDelete: false,
      reason:
        'Devam eden işler silinemez. İşi tamamlamanız veya iptal etmeniz gerekiyor.',
    };
  }

  // Cannot delete if has active proposals
  if (job.proposalCount && job.proposalCount > 0) {
    return {
      canDelete: false,
      reason:
        'Aktif teklifleri olan işler silinemez. Önce teklifleri reddetmeniz gerekiyor.',
    };
  }

  return { canDelete: true };
}

/**
 * Get warning message based on job status
 */
function getWarningMessage(job: JobResponse): string {
  if (job.status === 'DRAFT') {
    return 'Bu taslak iş kalıcı olarak silinecektir.';
  }

  if (job.status === 'OPEN') {
    return "Bu iş ilanı kalıcı olarak silinecektir. Freelancer'lar artık bu işi göremeyecek.";
  }

  if (job.status === 'COMPLETED') {
    return 'Bu tamamlanmış iş arşivden silinecektir.';
  }

  return 'Bu iş kalıcı olarak silinecektir.';
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * DeleteJobModal Component
 *
 * Features:
 * - Status-based validation
 * - Proposal count check
 * - Warning messages
 * - Confirmation requirement
 * - Error handling
 * - Success callback
 *
 * @example
 * ```tsx
 * <DeleteJobModal
 *   isOpen={showDeleteModal}
 *   onClose={() => setShowDeleteModal(false)}
 *   job={selectedJob}
 *   onSuccess={() => {
 *     refetchJobs();
 *     toast.success('İş başarıyla silindi');
 *   }}
 * />
 * ```
 */
export function DeleteJobModal({
  isOpen,
  onClose,
  job,
  onSuccess,
}: DeleteJobModalProps) {
  const { success: showSuccess, error: showError } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if job can be deleted
  const { canDelete, reason: blockReason } = canDeleteJob(job);
  const warningMessage = getWarningMessage(job);

  /**
   * Handle delete confirmation
   */
  const handleDelete = useCallback(async () => {
    if (!canDelete) {
      showError('İşlem Yapılamıyor', blockReason || 'Bu iş silinemez');
      return;
    }

    setIsDeleting(true);

    try {
      logger.info('Deleting job', {
        component: 'DeleteJobModal',
        jobId: job.id,
        jobTitle: job.title,
        status: job.status,
      });

      await deleteJob(job.id);

      logger.info('Job deleted successfully', {
        component: 'DeleteJobModal',
        jobId: job.id,
      });

      showSuccess('Başarılı', 'İş başarıyla silindi');

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onClose();
    } catch (error) {
      logger.error(
        'Failed to delete job',
        error instanceof Error ? error : new Error(String(error)),
        {
          component: 'DeleteJobModal',
          jobId: job.id,
        }
      );

      showError(
        'Hata',
        error instanceof Error
          ? error.message
          : 'İş silinirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setIsDeleting(false);
    }
  }, [
    canDelete,
    blockReason,
    job.id,
    job.title,
    job.status,
    onSuccess,
    onClose,
    showSuccess,
    showError,
  ]);

  /**
   * Handle modal close
   */
  const handleClose = useCallback(() => {
    if (!isDeleting) {
      onClose();
    }
  }, [isDeleting, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="text-destructive h-5 w-5" />
            İşi Sil
          </DialogTitle>
          <DialogDescription>
            Bu işlemi geri alamazsınız. Devam etmek istediğinizden emin misiniz?
          </DialogDescription>
        </DialogHeader>

        {/* Job Info */}
        <div className="border-muted rounded-lg border p-4">
          <div className="mb-2 flex items-start justify-between">
            <h4 className="font-medium">{job.title}</h4>
            <Badge variant={job.status === 'DRAFT' ? 'secondary' : 'outline'}>
              {job.status}
            </Badge>
          </div>
          {job.proposalCount !== undefined && job.proposalCount > 0 && (
            <p className="text-muted-foreground text-sm">
              {job.proposalCount} teklif alındı
            </p>
          )}
        </div>

        {/* Cannot Delete Alert */}
        {!canDelete && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{blockReason}</AlertDescription>
          </Alert>
        )}

        {/* Warning Alert */}
        {canDelete && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Uyarı:</strong> {warningMessage} Bu işlem geri alınamaz.
            </AlertDescription>
          </Alert>
        )}

        {/* Footer */}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            İptal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
            loading={isDeleting}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteJobModal;
