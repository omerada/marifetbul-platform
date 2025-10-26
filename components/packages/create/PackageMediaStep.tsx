'use client';

/**
 * Package Media Step - Step 4
 */

import { useFormContext } from 'react-hook-form';
import { Upload, X, Info } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui';
import type { CreatePackageFormData } from '@/lib/validation/package';

export function PackageMediaStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreatePackageFormData>();

  const images = watch('images') || [];

  const handleImageRemove = (index: number) => {
    setValue(
      'images',
      images.filter((_, i) => i !== index)
    );
  };

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

        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200"
            >
              <Image
                src={url}
                alt={`Package image ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleImageRemove(index)}
                className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {images.length < 8 && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Görsel yüklemek için tıklayın veya sürükleyin
            </p>
            <p className="text-xs text-gray-500">
              {images.length} / 8 görsel yüklendi
            </p>
          </div>
        )}

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
