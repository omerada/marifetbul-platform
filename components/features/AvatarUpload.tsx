'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import Image from 'next/image';

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

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

      // Dosya validasyonu
      const fileValidation = validateFile(file);
      if (!fileValidation.valid) {
        showToast(fileValidation.error!, 'error');
        return;
      }

      // Görüntü boyut validasyonu
      const dimensionValidation = await validateImageDimensions(file);
      if (!dimensionValidation.valid) {
        showToast(dimensionValidation.error!, 'error');
        return;
      }

      // Preview oluştur
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);

      setIsUploading(true);

      try {
        const avatarUrl = await uploadFile(file);
        onAvatarUpdate(avatarUrl);
        showToast('Profil fotoğrafı başarıyla güncellendi!', 'success');
        setPreviewUrl(null);
      } catch (error) {
        showToast(
          error instanceof Error ? error.message : 'Yükleme başarısız',
          'error'
        );
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
        // Input'u temizle
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onAvatarUpdate, showToast, uploadFile]
  );

  const handleClick = () => {
    if (isEditable && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploading(true);

    try {
      const response = await fetch(`/api/upload/avatar/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Silme işlemi başarısız');
      }

      onAvatarUpdate('');
      showToast('Profil fotoğrafı kaldırıldı', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Silme işlemi başarısız',
        'error'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const avatarSrc = previewUrl || currentAvatar;
  const hasAvatar = Boolean(avatarSrc);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Display */}
      <div className="group relative">
        <div
          className={` ${sizeClasses[size]} overflow-hidden rounded-full border-2 border-gray-200 ${isEditable ? 'cursor-pointer hover:border-blue-400' : ''} ${isUploading ? 'opacity-50' : ''} relative flex items-center justify-center bg-gray-100`}
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

          {/* Loading Overlay */}
          {isUploading && (
            <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            </div>
          )}

          {/* Edit Overlay */}
          {isEditable && !isUploading && (
            <div className="bg-opacity-0 group-hover:bg-opacity-40 absolute inset-0 flex items-center justify-center bg-black transition-all duration-200">
              <div className="text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                📷
              </div>
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

          {hasAvatar && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveAvatar}
              disabled={isUploading}
              className="text-red-600 hover:text-red-700"
            >
              Kaldır
            </Button>
          )}
        </div>
      )}

      {/* Upload Guidelines */}
      {isEditable && size === 'lg' && (
        <div className="max-w-xs text-center text-xs text-gray-500">
          <p>• JPEG, PNG veya WebP formatında</p>
          <p>• Maksimum 5MB boyutunda</p>
          <p>• En az 100x100 piksel</p>
          <p>• Kare formatı önerilir</p>
        </div>
      )}
    </div>
  );
};
