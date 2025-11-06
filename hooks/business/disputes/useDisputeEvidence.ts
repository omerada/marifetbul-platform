/**
 * useDisputeEvidence Hook
 * Handle evidence upload for disputes
 */

import { useState } from 'react';
import {
  uploadDisputeEvidence,
  uploadDisputeAttachment,
} from '@/lib/api/disputes';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';

export function useDisputeEvidence(disputeId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadEvidence = async (files: File[]): Promise<boolean> => {
    if (files.length === 0) {
      toast.error('Lütfen en az bir dosya seçin');
      return false;
    }

    // Validate file size (10MB per file)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalı");
      return false;
    }

    // Validate file types
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const invalidFiles = files.filter(
      (file) => !ALLOWED_TYPES.includes(file.type)
    );
    if (invalidFiles.length > 0) {
      toast.error(
        'Geçersiz dosya tipi. JPG, PNG, PDF veya DOC yükleyebilirsiniz'
      );
      return false;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Upload each file first, then create evidence records
      for (const file of files) {
        const uploadResult = await uploadDisputeAttachment(file);
        await uploadDisputeEvidence(disputeId, {
          fileUrl: uploadResult.fileUrl,
          fileType: uploadResult.fileType,
          fileName: uploadResult.fileName,
          fileSize: uploadResult.fileSize,
          description: `Uploaded evidence: ${file.name}`,
        });
      }
      logger.info('Evidence uploaded successfully', { disputeId, fileCountfileslength,  });
      toast.success(`${files.length} dosya başarıyla yüklendi`);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Dosyalar yüklenemedi';
      setUploadError(errorMessage);
      logger.error('Failed to upload evidence', { error: err });
      toast.error(errorMessage);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadEvidence,
    isUploading,
    uploadError,
  };
}
