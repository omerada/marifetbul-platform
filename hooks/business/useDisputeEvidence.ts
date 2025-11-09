/**
 * ============================================================================
 * USE DISPUTE EVIDENCE HOOK - Evidence Upload Management
 * ============================================================================
 * React hook for managing dispute evidence uploads
 *
 * Features:
 * - Upload single/multiple files
 * - Progress tracking
 * - File validation
 * - Evidence list management
 * - Delete evidence
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created December 2024
 * @sprint Security & Settings Sprint - Story 4
 */

'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  disputeEvidenceApi,
  type EvidenceUploadRequest,
} from '@/lib/api/dispute-evidence';
import type { DisputeEvidence } from '@/types/dispute';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export interface UseDisputeEvidenceReturn {
  // State
  evidenceList: DisputeEvidence[];
  uploadProgress: UploadProgress[];
  isUploading: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  uploadEvidence: (
    disputeId: string,
    request: EvidenceUploadRequest
  ) => Promise<boolean>;
  uploadMultipleEvidence: (
    disputeId: string,
    requests: EvidenceUploadRequest[]
  ) => Promise<boolean>;
  fetchEvidence: (disputeId: string) => Promise<void>;
  deleteEvidence: (disputeId: string, evidenceId: string) => Promise<boolean>;
  clearProgress: () => void;

  // Computed
  totalFiles: number;
  completedFiles: number;
  hasErrors: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * React hook for dispute evidence management
 *
 * @example
 * ```tsx
 * function DisputePage({ disputeId }) {
 *   const {
 *     uploadEvidence,
 *     uploadProgress,
 *     evidenceList,
 *     isUploading
 *   } = useDisputeEvidence();
 *
 *   const handleUpload = async (file: File) => {
 *     await uploadEvidence(disputeId, { file });
 *   };
 *
 *   return (
 *     <div>
 *       {uploadProgress.map(item => (
 *         <ProgressBar key={item.fileId} {...item} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDisputeEvidence(): UseDisputeEvidenceReturn {
  const [evidenceList, setEvidenceList] = useState<DisputeEvidence[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // UPLOAD SINGLE EVIDENCE
  // ============================================================================

  const uploadEvidence = useCallback(
    async (
      disputeId: string,
      request: EvidenceUploadRequest
    ): Promise<boolean> => {
      const fileId = `${Date.now()}-${request.file.name}`;

      try {
        setIsUploading(true);
        setError(null);

        // Validate file
        const validation = disputeEvidenceApi.validateEvidenceFile(
          request.file
        );
        if (!validation.valid) {
          toast.error('Geçersiz dosya', {
            description: validation.error,
          });
          return false;
        }

        // Add to progress tracker
        setUploadProgress((prev) => [
          ...prev,
          {
            fileId,
            fileName: request.file.name,
            progress: 0,
            status: 'pending',
          },
        ]);

        logger.debug('useDisputeEvidence.uploadEvidence: Starting', {
          disputeId,
          fileName: request.file.name,
        });

        // Update status to uploading
        setUploadProgress((prev) =>
          prev.map((item) =>
            item.fileId === fileId ? { ...item, status: 'uploading' } : item
          )
        );

        // Upload with progress tracking
        const evidence = await disputeEvidenceApi.uploadAndSubmitEvidence(
          disputeId,
          request,
          (progress) => {
            setUploadProgress((prev) =>
              prev.map((item) =>
                item.fileId === fileId ? { ...item, progress } : item
              )
            );
          }
        );

        // Update status to success
        setUploadProgress((prev) =>
          prev.map((item) =>
            item.fileId === fileId
              ? { ...item, status: 'success', progress: 100 }
              : item
          )
        );

        // Add to evidence list
        setEvidenceList((prev) => [...prev, evidence]);

        logger.info('useDisputeEvidence.uploadEvidence: Success', {
          disputeId,
          evidenceId: evidence.id,
        });

        toast.success('Kanıt yüklendi', {
          description: `${request.file.name} başarıyla eklendi`,
        });

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Upload failed';

        logger.error('useDisputeEvidence.uploadEvidence: Failed', err as Error);

        // Update status to error
        setUploadProgress((prev) =>
          prev.map((item) =>
            item.fileId === fileId
              ? { ...item, status: 'error', error: errorMessage }
              : item
          )
        );

        setError(errorMessage);

        toast.error('Kanıt yüklenemedi', {
          description: errorMessage,
        });

        return false;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  // ============================================================================
  // UPLOAD MULTIPLE EVIDENCE
  // ============================================================================

  const uploadMultipleEvidence = useCallback(
    async (
      disputeId: string,
      requests: EvidenceUploadRequest[]
    ): Promise<boolean> => {
      try {
        setIsUploading(true);
        setError(null);

        logger.debug('useDisputeEvidence.uploadMultipleEvidence: Starting', {
          disputeId,
          fileCount: requests.length,
        });

        let successCount = 0;
        let failCount = 0;

        // Upload files sequentially to avoid overwhelming Cloudinary
        for (const request of requests) {
          const success = await uploadEvidence(disputeId, request);
          if (success) {
            successCount++;
          } else {
            failCount++;
          }
        }

        logger.info('useDisputeEvidence.uploadMultipleEvidence: Complete', {
          disputeId,
          successCount,
          failCount,
        });

        if (failCount > 0) {
          toast.warning('Bazı dosyalar yüklenemedi', {
            description: `${successCount} başarılı, ${failCount} başarısız`,
          });
        } else {
          toast.success('Tüm kanıtlar yüklendi', {
            description: `${successCount} dosya başarıyla eklendi`,
          });
        }

        return failCount === 0;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Multiple upload failed';

        logger.error(
          'useDisputeEvidence.uploadMultipleEvidence: Failed',
          err as Error
        );

        setError(errorMessage);

        toast.error('Yükleme başarısız', {
          description: errorMessage,
        });

        return false;
      } finally {
        setIsUploading(false);
      }
    },
    [uploadEvidence]
  );

  // ============================================================================
  // FETCH EVIDENCE
  // ============================================================================

  const fetchEvidence = useCallback(async (disputeId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      logger.debug('useDisputeEvidence.fetchEvidence: Fetching', {
        disputeId,
      });

      const data = await disputeEvidenceApi.getDisputeEvidence(disputeId);

      setEvidenceList(data);

      logger.info('useDisputeEvidence.fetchEvidence: Success', {
        disputeId,
        count: data.length,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch evidence';

      logger.error('useDisputeEvidence.fetchEvidence: Failed', err as Error);

      setError(errorMessage);

      toast.error('Kanıtlar yüklenemedi', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================================
  // DELETE EVIDENCE
  // ============================================================================

  const deleteEvidence = useCallback(
    async (disputeId: string, evidenceId: string): Promise<boolean> => {
      try {
        logger.debug('useDisputeEvidence.deleteEvidence: Deleting', {
          disputeId,
          evidenceId,
        });

        await disputeEvidenceApi.deleteEvidence(disputeId, evidenceId);

        // Remove from local state
        setEvidenceList((prev) => prev.filter((e) => e.id !== evidenceId));

        logger.info('useDisputeEvidence.deleteEvidence: Success', {
          disputeId,
          evidenceId,
        });

        toast.success('Kanıt silindi');

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete evidence';

        logger.error('useDisputeEvidence.deleteEvidence: Failed', err as Error);

        toast.error('Kanıt silinemedi', {
          description: errorMessage,
        });

        return false;
      }
    },
    []
  );

  // ============================================================================
  // CLEAR PROGRESS
  // ============================================================================

  const clearProgress = useCallback(() => {
    setUploadProgress([]);
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const totalFiles = uploadProgress.length;
  const completedFiles = uploadProgress.filter(
    (item) => item.status === 'success' || item.status === 'error'
  ).length;
  const hasErrors = uploadProgress.some((item) => item.status === 'error');

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    evidenceList,
    uploadProgress,
    isUploading,
    isLoading,
    error,

    // Actions
    uploadEvidence,
    uploadMultipleEvidence,
    fetchEvidence,
    deleteEvidence,
    clearProgress,

    // Computed
    totalFiles,
    completedFiles,
    hasErrors,
  };
}
