'use client';

/**
 * Package Features Step - Step 3
 */

import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Info } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import type { CreatePackageFormData } from '@/lib/validation/package';

export function PackageFeaturesStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreatePackageFormData>();

  // @ts-expect-error - useFieldArray typing limitation
  const highlights = useFieldArray({ control, name: 'highlights' });
  // @ts-expect-error - useFieldArray typing limitation
  const deliverables = useFieldArray({ control, name: 'deliverables' });
  // @ts-expect-error - useFieldArray typing limitation
  const requirements = useFieldArray({ control, name: 'requirements' });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Özellikler ve Çıktılar
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Paketinizin öne çıkan özelliklerini ve müşterilere teslim edeceğiniz
          çıktıları belirtin.
        </p>
      </div>

      {/* Highlights */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">
          Öne Çıkan Özellikler <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {highlights.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                {...register(`highlights.${index}`)}
                placeholder="Hızlı teslimat, profesyonel tasarım..."
                error={errors.highlights?.[index]?.message}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => highlights.remove(index)}
                className="px-3"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {highlights.fields.length < 5 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => highlights.append('')}
              leftIcon={<Plus className="h-4 w-4" />}
              fullWidth
            >
              Özellik Ekle (Maks. 5)
            </Button>
          )}
        </div>
      </div>

      {/* Deliverables */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">
          Teslim Edilecek Çıktılar <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {deliverables.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                {...register(`deliverables.${index}`)}
                placeholder="5 Logo konsepti, Kaynak dosyalar..."
                error={errors.deliverables?.[index]?.message}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => deliverables.remove(index)}
                className="px-3"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {deliverables.fields.length < 10 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => deliverables.append('')}
              leftIcon={<Plus className="h-4 w-4" />}
              fullWidth
            >
              Çıktı Ekle (Maks. 10)
            </Button>
          )}
        </div>
      </div>

      {/* Requirements */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">
          Müşteriden Gerekenler (İsteğe bağlı)
        </label>
        <div className="space-y-2">
          {requirements.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                {...register(`requirements.${index}`)}
                placeholder="Şirket logosu, marka renkleri..."
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => requirements.remove(index)}
                className="px-3"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {requirements.fields.length < 10 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => requirements.append('')}
              leftIcon={<Plus className="h-4 w-4" />}
              fullWidth
            >
              Gereksinim Ekle (Maks. 10)
            </Button>
          )}
        </div>
      </div>

      {/* Help Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start">
          <Info className="mr-3 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold">İpuçları:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Öne çıkan özelliklerde değer önerinizi vurgulayın</li>
              <li>Çıktıları net ve ölçülebilir şekilde tanımlayın</li>
              <li>
                Müşteriden ihtiyaç duyduğunuz materyalleri açıkça belirtin
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
