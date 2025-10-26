'use client';

/**
 * Package Media Step - Step 4
 */

import { useFormContext } from 'react-hook-form';
import { Info } from 'lucide-react';
import { Input } from '@/components/ui';
import { ImageUpload } from '@/components/shared/ImageUpload';
import type { CreatePackageFormData } from '@/lib/validation/package';
import type { UploadedImage } from '@/components/shared/ImageUpload';

export function PackageMediaStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreatePackageFormData>();

  const images = watch('images') || [];

  const handleImagesChange = (uploadedImages: UploadedImage[]) => {
    // Extract URLs from uploaded images
    const imageUrls = uploadedImages.map((img) => img.url);
    setValue('images', imageUrls, { shouldValidate: true });
  };

  // Convert string URLs to UploadedImage format for ImageUpload component
  const uploadedImages: UploadedImage[] = images.map((url, index) => ({
    id: `image-${index}`,
    url,
    thumbnailUrl: url,
    publicId: '',
    fileName: `image-${index}`,
    size: 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Görseller ve Medya</h2>
        <p className="mt-1 text-sm text-gray-600">
          Paketinizi tanıtan görseller ve isteğe bağlı tanıtım videosu ekleyin.
        </p>
      </div>

      {/* Images */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">
          Paket Görselleri <span className="text-red-500">*</span>
        </label>

        <ImageUpload
          maxImages={8}
          maxFileSize={5 * 1024 * 1024}
          value={uploadedImages}
          onChange={handleImagesChange}
          uploadPreset="marifetbul_packages"
          folder="marifetbul/packages"
          showPreview={true}
        />

        {errors.images && (
          <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>
        )}
      </div>

      {/* Video URL */}
      <div>
        <label
          htmlFor="videoUrl"
          className="mb-2 block text-sm font-medium text-gray-900"
        >
          Tanıtım Videosu (İsteğe bağlı)
        </label>
        <Input
          id="videoUrl"
          {...register('videoUrl')}
          placeholder="https://youtube.com/watch?v=..."
          error={errors.videoUrl?.message}
        />
        <p className="mt-1 text-xs text-gray-500">
          YouTube veya Vimeo video linki ekleyebilirsiniz
        </p>
      </div>

      {/* Help Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start">
          <Info className="mr-3 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold">Görsel İpuçları:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Yüksek kaliteli (en az 1200x800px) görseller kullanın</li>
              <li>İlk görsel kapak resmi olacaktır</li>
              <li>Önceki işlerinizden örnekler ekleyin</li>
              <li>Video eklemek dönüşüm oranını %30 artırabilir</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
