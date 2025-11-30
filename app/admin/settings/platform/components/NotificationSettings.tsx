'use client';

import { Control } from 'react-hook-form';
import { Alert, AlertDescription } from '@/components/ui';
import { InfoIcon } from 'lucide-react';
import type { PlatformConfig } from '../page';

interface NotificationSettingsProps {
  control: Control<PlatformConfig>;
}

export function NotificationSettings({
  control: _control,
}: NotificationSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Bildirim Ayarları</h3>
        <p className="text-muted-foreground mb-6 text-sm">
          Email şablonları ve bildirim tercihlerini yapılandırın.
        </p>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Email şablon düzenleme özelliği şu anda geliştirme aşamasındadır. Bu
          bölüm yakında kullanıma açılacaktır.
        </AlertDescription>
      </Alert>

      <div className="bg-muted/50 rounded-lg border p-4">
        <h4 className="mb-3 font-medium">Planlanan Özellikler:</h4>
        <ul className="text-muted-foreground ml-4 list-disc space-y-2 text-sm">
          <li>
            <span className="text-foreground font-medium">
              Email Şablonları:
            </span>
            <ul className="mt-1 ml-4 space-y-1">
              <li>Hoş geldin emaili</li>
              <li>Sipariş onayı</li>
              <li>Ödeme başarısız bildirimi</li>
              <li>Fatura emaili</li>
              <li>Sipariş tamamlanma bildirimi</li>
            </ul>
          </li>
          <li>
            <span className="text-foreground font-medium">
              Bildirim Kanalları:
            </span>
            <ul className="mt-1 ml-4 space-y-1">
              <li>Email (SendGrid)</li>
              <li>SMS (gelecekte)</li>
              <li>Push notifications (gelecekte)</li>
              <li>In-app notifications (mevcut)</li>
            </ul>
          </li>
          <li>
            <span className="text-foreground font-medium">
              Kullanıcı Tercihleri:
            </span>
            <ul className="mt-1 ml-4 space-y-1">
              <li>Hangi bildirimleri almak istedikleri</li>
              <li>Bildirim sıklığı (anlık / günlük özet)</li>
              <li>Tercih edilen kanal (email / SMS)</li>
            </ul>
          </li>
          <li>
            <span className="text-foreground font-medium">
              Email Template Editor:
            </span>
            <ul className="mt-1 ml-4 space-y-1">
              <li>WYSIWYG editor ile şablon düzenleme</li>
              <li>
                Değişken placeholder&apos;ları (&#123;userName&#125;,
                &#123;orderNumber&#125;)
              </li>
              <li>Önizleme özelliği</li>
              <li>A/B testing desteği</li>
            </ul>
          </li>
        </ul>
      </div>

      <div className="border-t pt-6">
        <h4 className="mb-3 font-medium">Mevcut Email Altyapısı:</h4>
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
          <ul className="ml-4 list-disc space-y-1 text-sm text-green-800 dark:text-green-200">
            <li>✅ SendGrid entegrasyonu aktif</li>
            <li>✅ Transactional email gönderimi çalışıyor</li>
            <li>✅ Email delivery tracking mevcut</li>
            <li>✅ Temel şablonlar tanımlı (backend&apos;de)</li>
            <li>🔄 Frontend admin paneli geliştirme aşamasında</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
