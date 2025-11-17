'use client';

import { Control, useController } from 'react-hook-form';
import { Input, Label } from '@/components/ui';
import type { PlatformConfig } from '../page';

interface PaymentSettingsProps {
  control: Control<PlatformConfig>;
}

export function PaymentSettings({ control }: PaymentSettingsProps) {
  const {
    field: maxRetryField,
    fieldState: { error: maxRetryError },
  } = useController({
    control,
    name: 'payment.maxRetryAttempts',
  });

  const {
    field: cooldownField,
    fieldState: { error: cooldownError },
  } = useController({
    control,
    name: 'payment.retryCooldownMinutes',
  });

  const {
    field: autoAcceptField,
    fieldState: { error: autoAcceptError },
  } = useController({
    control,
    name: 'payment.autoAcceptTimeoutHours',
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Ödeme Ayarları</h3>
        <p className="text-muted-foreground mb-6 text-sm">
          Ödeme retry mekanizması ve otomatik kabul sürelerini yapılandırın.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxRetryAttempts">Maksimum Retry Deneme Sayısı</Label>
        <Input
          id="maxRetryAttempts"
          type="number"
          min={1}
          max={5}
          step={1}
          placeholder="Örn: 3"
          {...maxRetryField}
          onChange={(e) => maxRetryField.onChange(parseInt(e.target.value, 10))}
        />
        {maxRetryError && (
          <p className="text-sm text-red-600">{maxRetryError.message}</p>
        )}
        <p className="text-muted-foreground text-sm">
          Başarısız bir ödeme kaç kez tekrar denenebilir. Önerilen değer: 3-5
          arası.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="retryCooldownMinutes">
          Retry Cooldown Süresi (Dakika)
        </Label>
        <Input
          id="retryCooldownMinutes"
          type="number"
          min={1}
          max={60}
          step={1}
          placeholder="Örn: 5"
          {...cooldownField}
          onChange={(e) => cooldownField.onChange(parseInt(e.target.value, 10))}
        />
        {cooldownError && (
          <p className="text-sm text-red-600">{cooldownError.message}</p>
        )}
        <p className="text-muted-foreground text-sm">
          Her başarısız denemeden sonra kullanıcının retry butonuna basmadan
          önce beklemesi gereken süre. Spam önleme için kullanılır.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="autoAcceptTimeoutHours">
          Otomatik Kabul Zaman Aşımı (Saat)
        </Label>
        <Input
          id="autoAcceptTimeoutHours"
          type="number"
          min={1}
          max={168}
          step={1}
          placeholder="Örn: 72"
          {...autoAcceptField}
          onChange={(e) =>
            autoAcceptField.onChange(parseInt(e.target.value, 10))
          }
        />
        {autoAcceptError && (
          <p className="text-sm text-red-600">{autoAcceptError.message}</p>
        )}
        <p className="text-muted-foreground text-sm">
          Satıcı sipariş tamamlama işlemini bu süre içinde yapmazsa otomatik
          olarak kabul edilir ve ödeme serbest bırakılır. (1 saat - 7 gün arası)
        </p>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
        <p className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">
          💡 Retry Akışı:
        </p>
        <ol className="ml-4 list-decimal space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>Ödeme başarısız olur</li>
          <li>Sistem retry kaydı oluşturur</li>
          <li>Cooldown süresi başlar (örn: 5 dakika)</li>
          <li>
            Süre dolunca kullanıcı &quot;Tekrar Dene&quot; butonuna basabilir
          </li>
          <li>Maksimum deneme sayısına ulaşılınca retry devre dışı kalır</li>
        </ol>
      </div>

      <div className="border-t pt-6">
        <h4 className="mb-3 font-medium">Ödeme Hatırlatıcıları (Gelecekte)</h4>
        <p className="text-muted-foreground text-sm">
          Başarısız ödemeler için otomatik email/SMS hatırlatıcı sistemi yakında
          eklenecektir.
        </p>
      </div>
    </div>
  );
}
