'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Button } from '@/components/ui';
import { Loader2 } from 'lucide-react';
import {
  CommissionSettings,
  PaymentSettings,
  ModerationSettings,
  NotificationSettings,
} from './components';
import logger from '@/lib/infrastructure/monitoring/logger';

// ==================== TYPES & VALIDATION ====================

const platformConfigSchema = z.object({
  commission: z.object({
    defaultRate: z
      .number()
      .min(0, "Komisyon oranı 0'dan küçük olamaz")
      .max(100, "Komisyon oranı 100'den büyük olamaz"),
    categoryRates: z.record(z.string(), z.number().min(0).max(100)).optional(),
  }),
  payment: z.object({
    maxRetryAttempts: z
      .number()
      .int('Tam sayı olmalıdır')
      .min(1, 'En az 1 deneme olmalıdır')
      .max(5, 'En fazla 5 deneme olabilir'),
    retryCooldownMinutes: z
      .number()
      .int('Tam sayı olmalıdır')
      .min(1, 'En az 1 dakika olmalıdır')
      .max(60, 'En fazla 60 dakika olabilir'),
    autoAcceptTimeoutHours: z
      .number()
      .int('Tam sayı olmalıdır')
      .min(1, 'En az 1 saat olmalıdır')
      .max(168, 'En fazla 168 saat (7 gün) olabilir'),
  }),
  moderation: z.object({
    autoFlagThreshold: z
      .number()
      .int('Tam sayı olmalıdır')
      .min(1, 'En az 1 olmalıdır')
      .max(10, 'En fazla 10 olabilir'),
    autoRejectThreshold: z
      .number()
      .int('Tam sayı olmalıdır')
      .min(1, 'En az 1 olmalıdır')
      .max(20, 'En fazla 20 olabilir'),
  }),
  notifications: z.object({
    emailTemplates: z.record(z.string(), z.string()).optional(),
  }),
});

export type PlatformConfig = z.infer<typeof platformConfigSchema>;

// ==================== API FUNCTIONS ====================

const platformConfigApi = {
  getConfig: async (): Promise<PlatformConfig> => {
    try {
      const response = await fetch('/api/v1/admin/settings/platform');
      if (!response.ok) throw new Error('Failed to fetch config');
      return await response.json();
    } catch (error) {
      logger.error('Failed to fetch platform config', error as Error, {
        endpoint: '/admin/settings/platform',
      });
      throw error;
    }
  },

  updateConfig: async (config: PlatformConfig): Promise<PlatformConfig> => {
    try {
      const response = await fetch('/api/v1/admin/settings/platform', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Failed to update config');
      const data = await response.json();
      logger.info('Platform config updated successfully', { config });
      return data;
    } catch (error) {
      logger.error('Failed to update platform config', error as Error, {
        config,
      });
      throw error;
    }
  },
};

// ==================== MAIN COMPONENT ====================

export default function PlatformSettingsPage() {
  const [activeTab, setActiveTab] = useState('commission');
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoadingConfig(true);
        const data = await platformConfigApi.getConfig();
        setConfig(data);
      } catch (err) {
        setConfigError(err as Error);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    loadConfig();
  }, []);

  // Form setup
  const form = useForm<PlatformConfig>({
    resolver: zodResolver(platformConfigSchema),
    values: config || undefined,
  });

  // Form submit
  const onSubmit = async (data: PlatformConfig) => {
    setIsSaving(true);
    try {
      const updated = await platformConfigApi.updateConfig(data);
      setConfig(updated);
      toast.success('✅ Platform Ayarları Güncellendi', {
        description: 'Değişiklikler başarıyla kaydedildi.',
      });
      logger.info('Platform config saved successfully');
    } catch (error) {
      const err = error as { message?: string };
      const message = err.message || 'Ayarlar güncellenirken hata oluştu';
      toast.error('❌ Güncelleme Hatası', {
        description: message,
      });
      logger.error('Failed to save platform config', error as Error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form to initial values
  const handleReset = () => {
    if (config) {
      form.reset(config);
      toast.info('🔄 Form Sıfırlandı', {
        description: 'Değişiklikler geri alındı.',
      });
    }
  };

  // Loading state
  if (isLoadingConfig) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">
              Platform ayarları yükleniyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (configError) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="mb-2 font-semibold">❌ Ayarlar Yüklenemedi</p>
              <p className="text-muted-foreground text-sm">
                {(configError as Error).message || 'Bilinmeyen bir hata oluştu'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main UI
  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Platform Ayarları</h1>
        <p className="text-muted-foreground mt-2">
          Sistem genelindeki yapılandırmaları yönetin.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Genel Yapılandırma</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="commission">Komisyon</TabsTrigger>
                <TabsTrigger value="payment">Ödeme</TabsTrigger>
                <TabsTrigger value="moderation">Moderasyon</TabsTrigger>
                <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="commission" className="space-y-4">
                  <CommissionSettings control={form.control} />
                </TabsContent>

                <TabsContent value="payment" className="space-y-4">
                  <PaymentSettings control={form.control} />
                </TabsContent>

                <TabsContent value="moderation" className="space-y-4">
                  <ModerationSettings control={form.control} />
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                  <NotificationSettings control={form.control} />
                </TabsContent>
              </div>
            </Tabs>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSaving || !form.formState.isDirty}
              >
                Sıfırla
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !form.formState.isDirty}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kaydet
              </Button>
            </div>

            {/* Form Status */}
            {form.formState.isDirty && (
              <p className="flex items-center gap-2 text-sm text-amber-600">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-600" />
                Kaydedilmemiş değişiklikler var
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-muted-foreground space-y-2 text-sm">
            <p className="text-foreground font-semibold">ℹ️ Bilgi:</p>
            <ul className="ml-2 list-inside list-disc space-y-1">
              <li>Değişiklikler hemen uygulanır</li>
              <li>Tüm ayarlar veritabanında güvenli şekilde saklanır</li>
              <li>Değişiklik geçmişi audit log&apos;da tutulur</li>
              <li>
                Yanlış bir ayar durumunda sistem yöneticisiyle iletişime geçin
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
