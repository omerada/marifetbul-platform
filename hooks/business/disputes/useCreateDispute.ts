/**
 * useCreateDispute Hook
 * Handle dispute creation with validation and loading states
 */

import { useState } from 'react';
import {
  raiseDispute,
  uploadDisputeEvidence,
  uploadDisputeAttachment,
} from '@/lib/api/disputes';
import type { DisputeRequest, DisputeResponse } from '@/types/dispute';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';

export function useCreateDispute() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDispute = async (
    request: DisputeRequest,
    evidenceFiles?: File[]
  ): Promise<DisputeResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create dispute
      const dispute = await raiseDispute(request);
      logger.info('Dispute created', { disputeId: dispute.id });

      // Step 2: Upload evidence files if provided
      if (evidenceFiles && evidenceFiles.length > 0) {
        try {
          // Upload each file first, then create evidence records
          for (const file of evidenceFiles) {
            const uploadResult = await uploadDisputeAttachment(file);
            await uploadDisputeEvidence(dispute.id, {
              fileUrl: uploadResult.fileUrl,
              fileType: uploadResult.fileType,
              fileName: uploadResult.fileName,
              fileSize: uploadResult.fileSize,
              description: `Uploaded evidence: ${file.name}`,
            });
          }
          logger.info('Evidence uploaded', { disputeIddisputeid, fileCountevidenceFileslength,  });
        } catch (uploadError) {
          logger.error('Failed to upload evidence', { error: uploadError });
          toast.warning('İtiraz oluşturuldu ancak deliller yüklenemedi');
        }
      }

      toast.success('İtiraz başarıyla oluşturuldu');
      return dispute;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'İtiraz oluşturulamadı';
      setError(errorMessage);
      logger.error('Failed to create dispute', { error: err });
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createDispute,
    isLoading,
    error,
  };
}
