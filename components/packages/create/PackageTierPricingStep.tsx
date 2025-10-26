'use client';

// @ts-nocheck

/**
 * ================================================
 * PACKAGE TIER PRICING STEP
 * ================================================
 * Step 2: Three-tier pricing (Basic, Standard, Premium)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Info, Zap } from 'lucide-react';

import { Input, Button } from '@/components/ui';
import type { CreatePackageFormData } from '@/lib/validation/package';

export function PackageTierPricingStep() {
  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<CreatePackageFormData>();

  const [standardEnabled, setStandardEnabled] = useState(false);
  const [premiumEnabled, setPremiumEnabled] = useState(false);

  // Watch tier data for validation
  const basicTier = watch('basicTier');

  // Feature arrays for each tier
  const basicFeatures = useFieldArray({
    control,
    name: 'basicTier.features',
  });

  const standardFeatures = useFieldArray({
    control,
    name: 'standardTier.features',
  });

  const premiumFeatures = useFieldArray({
    control,
    name: 'premiumTier.features',
  });

  const handleStandardToggle = (enabled: boolean) => {
    setStandardEnabled(enabled);
    if (!enabled) {
      setValue('standardTier', null);
    } else {
      setValue('standardTier', {
        price: 0,
        deliveryDays: 5,
        revisionCount: 5,
        features: [],
      });
    }
  };

  const handlePremiumToggle = (enabled: boolean) => {
    setPremiumEnabled(enabled);
    if (!enabled) {
      setValue('premiumTier', null);
    } else {
      setValue('premiumTier', {
        price: 0,
        deliveryDays: 3,
        revisionCount: 10,
        features: [],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Fiyatlandırma Seviyeleri
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Paketiniz için 1-3 arasında seviye oluşturun. Her seviye farklı fiyat
          ve özellikler içerebilir.
        </p>
      </div>

      {/* Basic Tier (Required) */}
      <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-blue-900">Basic Paket</h3>
            <p className="text-sm text-blue-700">
              Zorunlu • Temel hizmet paketi
            </p>
          </div>
          <div className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
            ZORUNLU
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Price */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Fiyat (TL) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              {...register('basicTier.price', { valueAsNumber: true })}
              placeholder="500"
              error={errors.basicTier?.price?.message}
              min={50}
              max={50000}
              step={0.01}
            />
          </div>

          {/* Delivery Days */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Teslimat (Gün) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              {...register('basicTier.deliveryDays', { valueAsNumber: true })}
              placeholder="7"
              error={errors.basicTier?.deliveryDays?.message}
              min={1}
              max={90}
            />
          </div>

          {/* Revision Count */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Revizyon Sayısı <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              {...register('basicTier.revisionCount', { valueAsNumber: true })}
              placeholder="2"
              error={errors.basicTier?.revisionCount?.message}
              min={0}
              max={20}
            />
          </div>
        </div>

        {/* Features */}
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Özellikler <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {basicFeatures.fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  {...register(`basicTier.features.${index}` as const)}
                  placeholder="Özellik ekleyin..."
                  error={errors.basicTier?.features?.[index]?.message}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => basicFeatures.remove(index)}
                  className="px-3"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => basicFeatures.append('')}
              leftIcon={<Plus className="h-4 w-4" />}
              fullWidth
            >
              Özellik Ekle
            </Button>
          </div>
        </div>
      </div>

      {/* Standard Tier (Optional) */}
      <div
        className={`rounded-lg border-2 ${standardEnabled ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50'} p-6`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Standard Paket</h3>
            <p className="text-sm text-gray-600">
              İsteğe bağlı • Gelişmiş özellikler
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={standardEnabled}
              onChange={(e) => handleStandardToggle(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">Aktif</span>
          </label>
        </div>

        {standardEnabled && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Price */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Fiyat (TL) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  {...register('standardTier.price', { valueAsNumber: true })}
                  placeholder="1000"
                  error={errors.standardTier?.price?.message}
                  min={50}
                  max={50000}
                  step={0.01}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Basic ({basicTier?.price || 0} TL) dan yüksek olmalı
                </p>
              </div>

              {/* Delivery Days */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Teslimat (Gün) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  {...register('standardTier.deliveryDays', {
                    valueAsNumber: true,
                  })}
                  placeholder="5"
                  error={errors.standardTier?.deliveryDays?.message}
                  min={1}
                  max={90}
                />
              </div>

              {/* Revision Count */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Revizyon Sayısı <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  {...register('standardTier.revisionCount', {
                    valueAsNumber: true,
                  })}
                  placeholder="5"
                  error={errors.standardTier?.revisionCount?.message}
                  min={0}
                  max={20}
                />
              </div>
            </div>

            {/* Features */}
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Özellikler <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {standardFeatures.fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      {...register(`standardTier.features.${index}` as const)}
                      placeholder="Özellik açıklaması..."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => standardFeatures.remove(index)}
                      className="px-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => standardFeatures.append('')}
                  leftIcon={<Plus className="h-4 w-4" />}
                  fullWidth
                >
                  Özellik Ekle
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Premium Tier (Optional) */}
      <div
        className={`rounded-lg border-2 ${premiumEnabled ? 'border-amber-500 bg-amber-50' : 'border-gray-300 bg-gray-50'} p-6`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">Premium Paket</h3>
            <Zap className="h-5 w-5 text-amber-500" />
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={premiumEnabled}
              onChange={(e) => handlePremiumToggle(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-gray-700">Aktif</span>
          </label>
        </div>

        {premiumEnabled && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Price */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Fiyat (TL) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  {...register('premiumTier.price', { valueAsNumber: true })}
                  placeholder="2000"
                  error={errors.premiumTier?.price?.message}
                  min={50}
                  max={50000}
                  step={0.01}
                />
              </div>

              {/* Delivery Days */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Teslimat (Gün) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  {...register('premiumTier.deliveryDays', {
                    valueAsNumber: true,
                  })}
                  placeholder="3"
                  error={errors.premiumTier?.deliveryDays?.message}
                  min={1}
                  max={90}
                />
              </div>

              {/* Revision Count */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Revizyon Sayısı <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  {...register('premiumTier.revisionCount', {
                    valueAsNumber: true,
                  })}
                  placeholder="10"
                  error={errors.premiumTier?.revisionCount?.message}
                  min={0}
                  max={20}
                />
              </div>
            </div>

            {/* Features */}
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Özellikler <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {premiumFeatures.fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      {...register(`premiumTier.features.${index}` as const)}
                      placeholder="Özellik ekleyin..."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => premiumFeatures.remove(index)}
                      className="px-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => premiumFeatures.append('')}
                  leftIcon={<Plus className="h-4 w-4" />}
                  fullWidth
                >
                  Özellik Ekle
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Help Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start">
          <Info className="mr-3 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold">Fiyatlandırma İpuçları:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Her seviyenin fiyatı bir öncekinden yüksek olmalı</li>
              <li>
                Daha yüksek seviyeler daha hızlı teslimat ve daha fazla revizyon
                sunmalı
              </li>
              <li>Premium pakete özel özellikler ekleyerek değer katın</li>
              <li>Fiyatlarınızı piyasa araştırması yaparak belirleyin</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
