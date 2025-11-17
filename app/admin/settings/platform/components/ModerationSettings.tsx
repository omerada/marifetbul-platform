'use client';

import { Control, useController } from 'react-hook-form';
import { Input, Label } from '@/components/ui';
import type { PlatformConfig } from '../page';

interface ModerationSettingsProps {
  control: Control<PlatformConfig>;
}

export function ModerationSettings({ control }: ModerationSettingsProps) {
  const {
    field: autoFlagField,
    fieldState: { error: autoFlagError },
  } = useController({
    control,
    name: 'moderation.autoFlagThreshold',
  });

  const {
    field: autoRejectField,
    fieldState: { error: autoRejectError },
  } = useController({
    control,
    name: 'moderation.autoRejectThreshold',
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Moderasyon Ayarları</h3>
        <p className="text-muted-foreground mb-6 text-sm">
          Otomatik içerik moderasyon eşiklerini yapılandırın.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="autoFlagThreshold">Otomatik Bayrakla Eşiği</Label>
        <Input
          id="autoFlagThreshold"
          type="number"
          min={1}
          max={10}
          step={1}
          placeholder="Örn: 3"
          {...autoFlagField}
          onChange={(e) => autoFlagField.onChange(parseInt(e.target.value, 10))}
        />
        {autoFlagError && (
          <p className="text-sm text-red-600">{autoFlagError.message}</p>
        )}
        <p className="text-muted-foreground text-sm">
          Bir içerik kaç kullanıcı tarafından raporlanınca otomatik olarak
          bayraklanır ve moderatör incelemesine alınır.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="autoRejectThreshold">Otomatik Reddetme Eşiği</Label>
        <Input
          id="autoRejectThreshold"
          type="number"
          min={1}
          max={20}
          step={1}
          placeholder="Örn: 10"
          {...autoRejectField}
          onChange={(e) =>
            autoRejectField.onChange(parseInt(e.target.value, 10))
          }
        />
        {autoRejectError && (
          <p className="text-sm text-red-600">{autoRejectError.message}</p>
        )}
        <p className="text-muted-foreground text-sm">
          Bir içerik kaç kullanıcı tarafından raporlanınca otomatik olarak
          reddedilir ve yayından kaldırılır. (Ciddi ihlaller için)
        </p>
      </div>

      <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-950">
        <p className="mb-2 text-sm font-medium text-amber-900 dark:text-amber-100">
          ⚠️ Moderasyon Akışı:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-sm text-amber-800 dark:text-amber-200">
          <li>
            1-{autoFlagField.value} rapor: Normal görünüm (kullanıcılar içeriği
            görebilir)
          </li>
          <li>
            {autoFlagField.value + 1} rapor: Bayraklanır → Moderatör incelemesi
            gerekir
          </li>
          <li>
            {autoRejectField.value} rapor: Otomatik reddedilir → Yayından kalkar
          </li>
          <li>Tüm otomatik işlemler audit log&apos;da kaydedilir</li>
        </ul>
      </div>

      <div className="border-t pt-6">
        <h4 className="mb-3 font-medium">
          Moderasyon Kategorileri (Gelecekte)
        </h4>
        <p className="text-muted-foreground mb-3 text-sm">
          Farklı rapor kategorileri için özel eşikler tanımlanabilecektir:
        </p>
        <ul className="text-muted-foreground ml-4 list-disc space-y-1 text-sm">
          <li>Spam: Düşük eşik (örn: 2 rapor)</li>
          <li>Uygunsuz İçerik: Orta eşik (örn: 5 rapor)</li>
          <li>Dolandırıcılık: Yüksek öncelik (örn: 1 rapor = bayraklanma)</li>
          <li>Telif İhlali: Özel işlem (yasal inceleme)</li>
        </ul>
      </div>
    </div>
  );
}
