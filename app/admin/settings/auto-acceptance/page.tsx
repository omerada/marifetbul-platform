'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * ================================================
 * AUTO-ACCEPTANCE CONFIGURATION PAGE
 * ================================================
 * Sprint 1 - Story 2.2: Auto-Acceptance Configuration
 *
 * Admin panel for configuring milestone auto-acceptance settings:
 * - Enable/disable auto-acceptance globally
 * - Set delay days before auto-acceptance
 * - Configure alert thresholds
 * - Real-time config updates
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Story 2.2 (November 13, 2025)
 */

interface AutoAcceptanceConfig {
  enabled: boolean;
  delayDays: number;
  alertEnabled: boolean;
  highRateThreshold: number;
}

interface SystemConfigItem {
  key: string;
  value: string;
  valueType: string;
  description: string;
  category: string;
}

export default function AutoAcceptanceSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<AutoAcceptanceConfig>({
    enabled: true,
    delayDays: 7,
    alertEnabled: true,
    highRateThreshold: 20.0,
  });
  const [originalConfig, setOriginalConfig] =
    useState<AutoAcceptanceConfig | null>(null);

  // Load current configuration
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);

      // Load all ORDER category configs
      const response = await fetch('/api/v1/admin/config/category/ORDER', {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to load configuration');

      const data = await response.json();
      const configs: SystemConfigItem[] = data.data || [];

      // Parse config values
      const loadedConfig: AutoAcceptanceConfig = {
        enabled:
          configs.find((c) => c.key === 'MILESTONE_AUTO_ACCEPT_ENABLED')
            ?.value === 'true' || true,
        delayDays:
          parseInt(
            configs.find((c) => c.key === 'MILESTONE_AUTO_ACCEPT_DAYS')
              ?.value || '7'
          ) || 7,
        alertEnabled:
          configs.find((c) => c.key === 'MILESTONE_AUTO_ACCEPT_ALERT_ENABLED')
            ?.value === 'true' || true,
        highRateThreshold:
          parseFloat(
            configs.find(
              (c) => c.key === 'MILESTONE_AUTO_ACCEPT_HIGH_RATE_THRESHOLD'
            )?.value || '20.0'
          ) || 20.0,
      };

      setConfig(loadedConfig);
      setOriginalConfig(loadedConfig);
    } catch (_error) {
      // Error handled
      toast.error('Ayarlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate
      if (config.delayDays < 1 || config.delayDays > 30) {
        toast.error('Otomatik onay süresi 1-30 gün arası olmalıdır');
        return;
      }

      if (config.highRateThreshold < 5 || config.highRateThreshold > 50) {
        toast.error('Yüksek oran eşiği %5-%50 arası olmalıdır');
        return;
      }

      // Update each config via API
      const updates = [
        {
          key: 'MILESTONE_AUTO_ACCEPT_ENABLED',
          value: config.enabled.toString(),
        },
        {
          key: 'MILESTONE_AUTO_ACCEPT_DAYS',
          value: config.delayDays.toString(),
        },
        {
          key: 'MILESTONE_AUTO_ACCEPT_ALERT_ENABLED',
          value: config.alertEnabled.toString(),
        },
        {
          key: 'MILESTONE_AUTO_ACCEPT_HIGH_RATE_THRESHOLD',
          value: config.highRateThreshold.toString(),
        },
      ];

      for (const update of updates) {
        const response = await fetch(`/api/v1/admin/config/${update.key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ value: update.value }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update ${update.key}`);
        }
      }

      setOriginalConfig(config);
      toast.success('Ayarlar başarıyla kaydedildi');
    } catch (_error) {
      // Error handled
      toast.error('Ayarlar kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalConfig) {
      setConfig(originalConfig);
      toast.info('Değişiklikler geri alındı');
    }
  };

  const hasChanges = () => {
    if (!originalConfig) return false;
    return (
      config.enabled !== originalConfig.enabled ||
      config.delayDays !== originalConfig.delayDays ||
      config.alertEnabled !== originalConfig.alertEnabled ||
      config.highRateThreshold !== originalConfig.highRateThreshold
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Otomatik Kabul Ayarları</h1>
        <p className="text-muted-foreground">
          Milestone otomatik kabul sistemini yapılandırın ve izleyin
        </p>
      </div>

      <div className="grid gap-6">
        {/* Main Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Otomatik Kabul Sistemi
            </CardTitle>
            <p className="text-muted-foreground mt-2 text-sm">
              Teslim edilen milestone&apos;ların otomatik olarak kabul edilmesi
              için temel ayarlar
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex-1">
                <Label htmlFor="enabled" className="text-base font-medium">
                  Otomatik Kabul Sistemi
                </Label>
                <p className="text-muted-foreground mt-1 text-sm">
                  Milestone&apos;ların otomatik olarak kabul edilmesini
                  etkinleştirin
                </p>
              </div>
              <Switch
                id="enabled"
                checked={config.enabled}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, enabled: checked }))
                }
              />
            </div>

            {/* Delay Days */}
            <div className="space-y-2">
              <Label htmlFor="delayDays">
                Otomatik Kabul Süresi (Gün)
                <Badge variant="outline" className="ml-2">
                  {config.delayDays} gün
                </Badge>
              </Label>
              <Input
                id="delayDays"
                type="number"
                min={1}
                max={30}
                value={config.delayDays}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    delayDays: parseInt(e.target.value) || 7,
                  }))
                }
                className="max-w-xs"
              />
              <p className="text-muted-foreground text-sm">
                Teslimat sonrası kaç gün bekleneceği (1-30 gün arası)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Alert Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Uyarı Ayarları
            </CardTitle>
            <p className="text-muted-foreground mt-2 text-sm">
              Yüksek otomatik kabul oranı tespitinde bildirim ayarları
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Alert Enable/Disable */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex-1">
                <Label htmlFor="alertEnabled" className="text-base font-medium">
                  Admin Uyarıları
                </Label>
                <p className="text-muted-foreground mt-1 text-sm">
                  Otomatik kabul olayları için admin bildirimlerini
                  etkinleştirin
                </p>
              </div>
              <Switch
                id="alertEnabled"
                checked={config.alertEnabled}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, alertEnabled: checked }))
                }
              />
            </div>

            {/* High Rate Threshold */}
            <div className="space-y-2">
              <Label htmlFor="highRateThreshold">
                Yüksek Oran Eşiği (%)
                <Badge variant="outline" className="ml-2">
                  %{config.highRateThreshold}
                </Badge>
              </Label>
              <Input
                id="highRateThreshold"
                type="number"
                min={5}
                max={50}
                step={0.1}
                value={config.highRateThreshold}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    highRateThreshold: parseFloat(e.target.value) || 20.0,
                  }))
                }
                className="max-w-xs"
              />
              <p className="text-muted-foreground text-sm">
                Bu oranın üzerinde otomatik kabul gerçekleşirse uyarı gönderilir
                (%5-%50 arası)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Current Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sistem Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-muted-foreground mb-1 text-sm">
                  Otomatik Kabul
                </p>
                <p className="text-lg font-semibold">
                  {config.enabled ? (
                    <span className="text-green-600">Aktif</span>
                  ) : (
                    <span className="text-red-600">Kapalı</span>
                  )}
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-muted-foreground mb-1 text-sm">
                  Bekleme Süresi
                </p>
                <p className="text-lg font-semibold">{config.delayDays} Gün</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-muted-foreground mb-1 text-sm">
                  Uyarı Sistemi
                </p>
                <p className="text-lg font-semibold">
                  {config.alertEnabled ? (
                    <span className="text-green-600">Aktif</span>
                  ) : (
                    <span className="text-gray-600">Kapalı</span>
                  )}
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-muted-foreground mb-1 text-sm">
                  Uyarı Eşiği
                </p>
                <p className="text-lg font-semibold">
                  %{config.highRateThreshold}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges() || saving}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Geri Al
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges() || saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Değişiklikleri Kaydet
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
