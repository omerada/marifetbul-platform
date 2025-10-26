'use client';

/**
 * ================================================
 * PACKAGE BASIC INFO STEP
 * ================================================
 * Step 1: Title, Description, Category, Keywords
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useFormContext } from 'react-hook-form';
import { Info } from 'lucide-react';

import { Input, Textarea } from '@/components/ui';
import type { CreatePackageFormData } from '@/lib/validation/package';

// Mock categories - replace with API call
const CATEGORIES = [
  { id: '1', name: 'Grafik Tasarım' },
  { id: '2', name: 'Yazılım Geliştirme' },
  { id: '3', name: 'Dijital Pazarlama' },
  { id: '4', name: 'İçerik Yazarlığı' },
  { id: '5', name: 'Video Düzenleme' },
  { id: '6', name: 'Ses Düzenleme' },
  { id: '7', name: 'Çeviri' },
  { id: '8', name: 'Danışmanlık' },
];

export function PackageBasicInfoStep() {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext<CreatePackageFormData>();

  const title = watch('title');
  const description = watch('description');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Temel Bilgiler</h2>
        <p className="mt-1 text-sm text-gray-600">
          Paketinizin temel bilgilerini girin. Bu bilgiler müşterilerin
          paketinizi bulmasına yardımcı olur.
        </p>
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium text-gray-900"
        >
          Paket Başlığı <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Örn: Profesyonel Logo Tasarımı"
          error={errors.title?.message}
          maxLength={200}
        />
        <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
          <span>Net ve açıklayıcı bir başlık kullanın</span>
          <span>{title?.length || 0} / 200</span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-gray-900"
        >
          Paket Açıklaması <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Paketinizle ilgili detaylı açıklama yazın. Müşterilere ne sunduğunuzu, nasıl çalıştığınızı ve neden sizi seçmeleri gerektiğini anlatın..."
          rows={8}
          maxLength={5000}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
        <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
          <span>Detaylı ve ikna edici bir açıklama yazın</span>
          <span>{description?.length || 0} / 5000</span>
        </div>
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="categoryId"
          className="mb-2 block text-sm font-medium text-gray-900"
        >
          Kategori <span className="text-red-500">*</span>
        </label>
        <select
          id="categoryId"
          {...register('categoryId')}
          className={`w-full rounded-md border ${errors.categoryId ? 'border-red-500' : 'border-gray-300'} bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
        >
          <option value="">Kategori seçin</option>
          {CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600">
            {errors.categoryId.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Paketinizin hangi kategoriye ait olduğunu seçin
        </p>
      </div>

      {/* Keywords */}
      <div>
        <label
          htmlFor="keywords"
          className="mb-2 block text-sm font-medium text-gray-900"
        >
          Anahtar Kelimeler <span className="text-red-500">*</span>
        </label>
        <Input
          id="keywords"
          {...register('keywords')}
          placeholder="logo, tasarım, branding, kurumsal kimlik (virgülle ayırın)"
          error={errors.keywords?.message}
        />
        <p className="mt-1 text-xs text-gray-500">
          Paketinizin bulunmasını kolaylaştıracak anahtar kelimeleri virgülle
          ayırarak girin (en fazla 10)
        </p>
      </div>

      {/* Help Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start">
          <Info className="mr-3 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold">İpucu:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Başlığınız kısa, öz ve arama dostu olmalı</li>
              <li>Açıklamanızda sunduğunuz değeri vurgulayın</li>
              <li>Müşterilerin sıkça aradığı anahtar kelimeleri kullanın</li>
              <li>Doğru kategori seçimi paketinizin görünürlüğünü artırır</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
