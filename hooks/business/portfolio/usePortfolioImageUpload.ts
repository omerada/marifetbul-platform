/**
 * Portfolio Image Upload Hook
 * Sprint 17: Portfolio Management System
 *
 * Handles portfolio image uploads with progress tracking
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import {
  uploadPortfolioImage as uploadImageApi,
  deletePortfolioImage as deleteImageApi,
  type PortfolioImageResponse,
} from '@/lib/api/portfolio';
import { useAuthState } from '@/hooks/shared/useAuth';
import { logger } from '@/lib/shared/utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

export interface UsePortfolioImageUploadReturn {
  // Upload single image
  uploadImage: (
    portfolioId: string,
    file: File,
    isPrimary?: boolean
  ) => Promise<PortfolioImageResponse | null>;

  // Upload multiple images
  uploadMultipleImages: (
    portfolioId: string,
    files: File[]
  ) => Promise<PortfolioImageResponse[]>;

  // Delete image
  deleteImage: (portfolioId: string, imageId: string) => Promise<boolean>;

  // State
  isUploading: boolean;
  uploadProgress: Map<string, UploadProgress>;
}

// ============================================================================
// HOOK
// ============================================================================

export function usePortfolioImageUpload(): UsePortfolioImageUploadReturn {
  const { user } = useAuthState();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<
    Map<string, UploadProgress>
  >(new Map());

  /**
   * Update progress for a file
   */
  const updateProgress = useCallback(
    (fileName: string, update: Partial<UploadProgress>) => {
      setUploadProgress((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(fileName) || {
          fileName,
          progress: 0,
          status: 'idle',
        };
        newMap.set(fileName, { ...existing, ...update });
        return newMap;
      });
    },
    []
  );

  /**
   * Upload single image
   */
  const uploadImage = useCallback(
    async (
      portfolioId: string,
      file: File,
      isPrimary: boolean = false
    ): Promise<PortfolioImageResponse | null> => {
      if (!user?.id) {
        toast.error('Lütfen giriş yapınız');
        return null;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Sadece resim dosyaları yüklenebilir');
        return null;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error("Resim boyutu 10MB'dan küçük olmalıdır");
        return null;
      }

      setIsUploading(true);
      updateProgress(file.name, { status: 'uploading', progress: 0 });

      try {
        logger.info('[usePortfolioImageUpload] Uploading image', {
          portfolioId,
          fileName: file.name,
          isPrimary,
        });

        const uploadedImage = await uploadImageApi(
          portfolioId,
          file,
          isPrimary
        );

        updateProgress(file.name, { status: 'success', progress: 100 });
        toast.success('Resim başarıyla yüklendi! 📸');

        // Refresh portfolio data
        await mutate(`/portfolios/user/${user.id}`);

        logger.info('[usePortfolioImageUpload] Image uploaded', {
          imageId: uploadedImage.id,
        });

        return uploadedImage;
      } catch (err) {
        logger.error('[usePortfolioImageUpload] Upload failed', err);
        updateProgress(file.name, {
          status: 'error',
          error: err instanceof Error ? err.message : 'Upload failed',
        });
        toast.error('Resim yüklenemedi. Lütfen tekrar deneyin.');
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [user?.id, updateProgress]
  );

  /**
   * Upload multiple images
   */
  const uploadMultipleImages = useCallback(
    async (
      portfolioId: string,
      files: File[]
    ): Promise<PortfolioImageResponse[]> => {
      if (!user?.id) {
        toast.error('Lütfen giriş yapınız');
        return [];
      }

      if (files.length === 0) {
        return [];
      }

      if (files.length > 10) {
        toast.error('Maksimum 10 resim yükleyebilirsiniz');
        return [];
      }

      setIsUploading(true);

      const results: PortfolioImageResponse[] = [];

      try {
        logger.info('[usePortfolioImageUpload] Uploading multiple images', {
          portfolioId,
          count: files.length,
        });

        // Upload files sequentially (to avoid overwhelming the server)
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const isPrimary = i === 0; // First image is primary

          const result = await uploadImage(portfolioId, file, isPrimary);
          if (result) {
            results.push(result);
          }
        }

        if (results.length > 0) {
          toast.success(`${results.length} resim başarıyla yüklendi! 🎉`);
        }

        return results;
      } catch (err) {
        logger.error('[usePortfolioImageUpload] Bulk upload failed', err);
        toast.error('Bazı resimler yüklenemedi');
        return results;
      } finally {
        setIsUploading(false);
      }
    },
    [user?.id, uploadImage]
  );

  /**
   * Delete image
   */
  const deleteImage = useCallback(
    async (portfolioId: string, imageId: string): Promise<boolean> => {
      if (!user?.id) {
        toast.error('Lütfen giriş yapınız');
        return false;
      }

      try {
        logger.info('[usePortfolioImageUpload] Deleting image', {
          portfolioId,
          imageId,
        });

        await deleteImageApi(portfolioId, imageId);

        toast.success('Resim başarıyla silindi! 🗑️');

        // Refresh portfolio data
        await mutate(`/portfolios/user/${user.id}`);

        logger.info('[usePortfolioImageUpload] Image deleted', { imageId });

        return true;
      } catch (err) {
        logger.error('[usePortfolioImageUpload] Delete image failed', err);
        toast.error('Resim silinemedi. Lütfen tekrar deneyin.');
        return false;
      }
    },
    [user?.id]
  );

  return {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    isUploading,
    uploadProgress,
  };
}

export default usePortfolioImageUpload;
