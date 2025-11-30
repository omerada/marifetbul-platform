'use client';

import { useState, useRef, useCallback } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { useUIStore } from '@/lib/core/store/domains/ui/uiStore';
import logger from '@/lib/infrastructure/monitoring/logger';
import Image from 'next/image';
import {
  Upload,
  X,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from 'lucide-react';

interface AvatarUploadProps {
  currentAvatar?: string;
  userId: string;
  onAvatarUpdate: (avatarUrl: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isEditable?: boolean;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  userId,
  onAvatarUpdate,
  size = 'lg',
  isEditable = true,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewRotation, setPreviewRotation] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useUIStore();

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const iconSizes = {
    sm: { width: 48, height: 48 },
    md: { width: 64, height: 64 },
    lg: { width: 96, height: 96 },
    xl: { width: 128, height: 128 },
  };

  // Dosya validasyonu
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Dosya tipi kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Sadece JPEG, PNG ve WebP formatları desteklenir',
      };
    }

    // Dosya boyutu kontrolü (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: "Dosya boyutu 5MB'dan küçük olmalıdır",
      };
    }

    return { valid: true };
  };

  // Görüntü boyutlarını kontrol etme
  const validateImageDimensions = (
    file: File
  ): Promise<{ valid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        // Minimum boyut kontrolü (100x100)
        if (img.width < 100 || img.height < 100) {
          resolve({
            valid: false,
            error: 'Görüntü en az 100x100 piksel boyutunda olmalıdır',
          });
          return;
        }

        // Maksimum boyut kontrolü (2000x2000)
        if (img.width > 2000 || img.height > 2000) {
          resolve({
            valid: false,
            error: 'Görüntü en fazla 2000x2000 piksel boyutunda olmalıdır',
          });
          return;
        }

        resolve({ valid: true });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          valid: false,
          error: 'Geçersiz görüntü dosyası',
        });
      };

      img.src = url;
    });
  };

  // Dosya yükleme işlemi
  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('type', 'avatar');

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Yükleme başarısız');
      }

      const data = await response.json();
      return data.url;
    },
    [userId]
  );

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploadError(null);

      // Dosya validasyonu
      const fileValidation = validateFile(file);
      if (!fileValidation.valid) {
        setUploadError(fileValidation.error!);
        addToast({
          type: 'error',
          title: 'Geçersiz Dosya',
          description: fileValidation.error,
          duration: 5000,
        });
        return;
      }

      // Görüntü boyut validasyonu
      const dimensionValidation = await validateImageDimensions(file);
      if (!dimensionValidation.valid) {
        setUploadError(dimensionValidation.error!);
        addToast({
          type: 'error',
          title: 'Geçersiz Boyut',
          description: dimensionValidation.error,
          duration: 5000,
        });
        return;
      }

      // Preview oluştur
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setShowPreviewModal(true);

      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const avatarUrl = await uploadFile(file);

        clearInterval(progressInterval);
        setUploadProgress(100);

        onAvatarUpdate(avatarUrl);

        addToast({
          type: 'success',
          title: 'Başarılı',
          description: 'Profil fotoğrafı güncellendi!',
          duration: 3000,
        });

        setPreviewUrl(null);
        setShowPreviewModal(false);

        logger.info('Avatar uploaded successfully', { userId, url: avatarUrl });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Yükleme başarısız';
        setUploadError(errorMessage);

        addToast({
          type: 'error',
          title: 'Hata',
          description: errorMessage,
          duration: 5000,
        });

        setPreviewUrl(null);
        setShowPreviewModal(false);

        logger.error(
          'Avatar upload failed',
          err instanceof Error ? err : new Error(errorMessage)
        );
      } finally {
        setIsUploading(false);
        setUploadProgress(0);

        // Input'u temizle
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onAvatarUpdate, uploadFile, userId, addToast]
  );

  const handleClick = () => {
    if (isEditable && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveAvatar = async () => {
    if (isUploading) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await fetch(`/api/upload/avatar/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Silme işlemi başarısız');
      }

      onAvatarUpdate('');

      addToast({
        type: 'success',
        title: 'Başarılı',
        description: 'Profil fotoğrafı kaldırıldı',
        duration: 3000,
      });

      logger.info('Avatar removed', { userId });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Silme işlemi başarısız';
      setUploadError(errorMessage);

      addToast({
        type: 'error',
        title: 'Hata',
        description: errorMessage,
        duration: 5000,
      });

      logger.error(
        'Avatar removal failed',
        err instanceof Error ? err : new Error(errorMessage)
      );
    } finally {
      setIsUploading(false);
    }
  };

  const avatarSrc = previewUrl || currentAvatar;
  const hasAvatar = Boolean(avatarSrc);

  return (
    <>
      <div className="flex flex-col items-center space-y-4">
        {/* Avatar Display */}
        <div className="group relative">
          <div
            className={`${sizeClasses[size]} overflow-hidden rounded-full border-2 ${
              uploadError ? 'border-red-300' : 'border-gray-200'
            } ${isEditable && !isUploading ? 'cursor-pointer hover:border-blue-400' : ''} ${
              isUploading ? 'opacity-70' : ''
            } relative flex items-center justify-center bg-gray-100`}
            onClick={handleClick}
          >
            {hasAvatar ? (
              <Image
                src={avatarSrc!}
                alt="Profile Avatar"
                width={iconSizes[size].width}
                height={iconSizes[size].height}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-2xl text-gray-400">👤</div>
            )}

            {/* Loading Overlay with Progress */}
            {isUploading && (
              <div className="bg-opacity-50 absolute inset-0 flex flex-col items-center justify-center bg-black">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                {uploadProgress > 0 && (
                  <p className="mt-2 text-xs font-medium text-white">
                    {uploadProgress}%
                  </p>
                )}
              </div>
            )}

            {/* Edit Overlay */}
            {isEditable && !isUploading && (
              <div className="bg-opacity-0 group-hover:bg-opacity-40 absolute inset-0 flex items-center justify-center bg-black transition-all duration-200">
                <Upload className="h-6 w-6 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={!isEditable || isUploading}
          />
        </div>

        {/* Error Message */}
        {uploadError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
            <p className="text-red-800">{uploadError}</p>
          </div>
        )}

        {/* Action Buttons */}
        {isEditable && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClick}
              disabled={isUploading}
            >
              {hasAvatar ? 'Değiştir' : 'Fotoğraf Ekle'}
            </Button>

            {hasAvatar && !isUploading && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveAvatar}
                className="text-red-600 hover:text-red-700"
              >
                <X className="mr-1 h-4 w-4" />
                Kaldır
              </Button>
            )}
          </div>
        )}

        {/* Upload Guidelines */}
        {isEditable && size === 'lg' && !uploadError && (
          <div className="max-w-xs text-center text-xs text-gray-500">
            <p>• JPEG, PNG veya WebP formatında</p>
            <p>• Maksimum 5MB boyutunda</p>
            <p>• En az 100x100 piksel</p>
            <p>• Kare formatı önerilir</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && previewUrl && (
        <div className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-lg bg-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Fotoğraf Önizleme
              </h3>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewZoom(1);
                  setPreviewRotation(0);
                }}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex flex-col items-center p-6">
              <div
                className="relative mb-4 h-64 w-64 overflow-hidden rounded-lg bg-gray-100"
                style={{
                  transform: `scale(${previewZoom}) rotate(${previewRotation}deg)`,
                  transition: 'transform 0.3s ease',
                }}
              >
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Preview Controls */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPreviewZoom((prev) => Math.max(0.5, prev - 0.1))
                  }
                  disabled={previewZoom <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  {Math.round(previewZoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPreviewZoom((prev) => Math.min(2, prev + 0.1))
                  }
                  disabled={previewZoom >= 2}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <div className="mx-2 h-6 w-px bg-gray-300"></div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPreviewRotation((prev) => (prev + 90) % 360)
                  }
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-4 w-full">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-700">Yükleniyor...</span>
                    <span className="font-medium text-blue-600">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
