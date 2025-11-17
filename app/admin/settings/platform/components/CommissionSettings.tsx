'use client';

import { Control, useController } from 'react-hook-form';
import { Input, Label } from '@/components/ui';
import type { PlatformConfig } from '../page';

interface CommissionSettingsProps {
  control: Control<PlatformConfig>;
}

export function CommissionSettings({ control }: CommissionSettingsProps) {
  const {
    field: defaultRateField,
    fieldState: { error },
  } = useController({
    control,
    name: 'commission.defaultRate',
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Komisyon Ayarları</h3>
        <p className="text-muted-foreground mb-6 text-sm">
          Platform komisyon oranlarını yapılandırın.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultRate">Varsayılan Komisyon Oranı (%)</Label>
        <Input
          id="defaultRate"
          type="number"
          min={0}
          max={100}
          step={0.1}
          placeholder="Örn: 15.5"
          {...defaultRateField}
          onChange={(e) =>
            defaultRateField.onChange(parseFloat(e.target.value))
          }
        />
        {error && <p className="text-sm text-red-600">{error.message}</p>}
        <p className="text-muted-foreground text-sm">
          Tüm siparişler için uygulanacak varsayılan komisyon oranı. Kategori
          bazlı özel oranlar tanımlanmadıysa bu oran kullanılır.
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <p className="mb-2 text-sm font-medium">📊 Komisyon Hesaplama:</p>
        <ul className="text-muted-foreground ml-4 list-disc space-y-1 text-sm">
          <li>Komisyon = Sipariş Tutarı × (Komisyon Oranı / 100)</li>
          <li>
            Örnek: 1.000 TL sipariş × (%
            {defaultRateField.value?.toFixed(1) || '15.0'}) ={' '}
            {((1000 * (defaultRateField.value || 15)) / 100).toFixed(2)} TL
            komisyon
          </li>
          <li>
            Satıcı kazancı: 1.000 TL -{' '}
            {((1000 * (defaultRateField.value || 15)) / 100).toFixed(2)} TL ={' '}
            {(1000 - (1000 * (defaultRateField.value || 15)) / 100).toFixed(2)}{' '}
            TL
          </li>
        </ul>
      </div>

      <div className="border-t pt-6">
        <h4 className="mb-3 font-medium">
          Kategori Bazlı Komisyon Oranları (Gelecekte)
        </h4>
        <p className="text-muted-foreground text-sm">
          Kategori bazlı özel komisyon oranları yakında eklenecektir. Şu anda
          tüm kategoriler için varsayılan oran kullanılmaktadır.
        </p>
      </div>
    </div>
  );
}
