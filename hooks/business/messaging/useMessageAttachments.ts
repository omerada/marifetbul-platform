'use client';

import { useState } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';

export interface MessageAttachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
  uploadedAt: string;
}

export interface UploadFilesResponse {
  success: boolean;
  data: MessageAttachment[];
  message?: string;
}

/**
 * Hook for managing message file attachments
 * Handles file upload to backend before sending message
 */
export function useMessageAttachments() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Upload files to backend
   * Returns attachment metadata to be included in message
   */
  const uploadFiles = async (files: File[]): Promise<MessageAttachment[]> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Use fetch directly for multipart/form-data upload
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/attachments`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Dosya yüklenemedi');
      }

      const result: UploadFilesResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Dosya yüklenemedi');
      }

      // Simulate progress for better UX
      setUploadProgress(100);

      return result.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Dosya yüklenemedi');
      setError(error);
      logger.error('File upload failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  return {
    uploadFiles,
    isUploading,
    uploadProgress,
    error,
  };
}
