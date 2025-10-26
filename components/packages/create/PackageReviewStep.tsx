'use client';

/**
 * Package Review Step - Step 5
 */

import { useFormContext } from 'react-hook-form';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { CreatePackageFormData } from '@/lib/validation/package';

export function PackageReviewStep() {
  const { watch } = useFormContext<CreatePackageFormData>();

  const formData = watch();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          İnceleme ve Yayınlama
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Paketinizi yayınlamadan önce tüm bilgileri kontrol edin.
        </p>
      </div>

      {/* Basic Info Summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Temel Bilgiler
        </h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Başlık:</strong> {formData.title}
          </div>
          <div>
            <strong>Açıklama:</strong> {formData.description?.substring(0, 150)}
            ...
          </div>
          <div>
            <strong>Kategori:</strong> {formData.categoryId}
          </div>
          <div>
            <strong>Anahtar Kelimeler:</strong> {formData.keywords?.join(', ')}
          </div>
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Fiyatlandırma
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Basic */}
          <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold text-blue-900">Basic</span>
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {formData.basicTier?.price} TL
            </div>
            <div className="mt-2 space-y-1 text-xs text-blue-700">
              <div>{formData.basicTier?.deliveryDays} gün teslimat</div>
              <div>{formData.basicTier?.revisionCount} revizyon</div>
              <div>{formData.basicTier?.features?.length || 0} özellik</div>
            </div>
          </div>

          {/* Standard */}
          {formData.standardTier && (
            <div className="rounded-lg border-2 border-purple-500 bg-purple-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-purple-900">Standard</span>
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {formData.standardTier.price} TL
              </div>
              <div className="mt-2 space-y-1 text-xs text-purple-700">
                <div>{formData.standardTier.deliveryDays} gün teslimat</div>
                <div>{formData.standardTier.revisionCount} revizyon</div>
                <div>{formData.standardTier.features?.length || 0} özellik</div>
              </div>
            </div>
          )}

          {/* Premium */}
          {formData.premiumTier && (
            <div className="rounded-lg border-2 border-amber-500 bg-amber-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-amber-900">Premium</span>
                <CheckCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-amber-900">
                {formData.premiumTier.price} TL
              </div>
              <div className="mt-2 space-y-1 text-xs text-amber-700">
                <div>{formData.premiumTier.deliveryDays} gün teslimat</div>
                <div>{formData.premiumTier.revisionCount} revizyon</div>
                <div>{formData.premiumTier.features?.length || 0} özellik</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Özellikler</h3>
        <div className="space-y-3 text-sm">
          <div>
            <strong>Öne Çıkanlar:</strong>
            <ul className="mt-1 list-inside list-disc text-gray-600">
              {formData.highlights?.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Teslim Edilecekler:</strong>
            <ul className="mt-1 list-inside list-disc text-gray-600">
              {formData.deliverables?.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Media Summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Medya</h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Görseller:</strong> {formData.images?.length || 0} adet
          </div>
          {formData.videoUrl && (
            <div>
              <strong>Video:</strong> Eklendi ✓
            </div>
          )}
        </div>
      </div>

      {/* Publish Info */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-start">
          <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0 text-green-600" />
          <div className="text-sm text-green-800">
            <p className="font-semibold">Yayınlama Sonrası:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Paketiniz &ldquo;Aktif&rdquo; durumunda yayınlanacak</li>
              <li>Müşteriler paketinizi görüntüleyip sipariş verebilecek</li>
              <li>İstediğiniz zaman düzenleyebilir veya duraklatabilirsiniz</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
