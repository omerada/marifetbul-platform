/**
 * ================================================
 * COMMISSION SETTINGS FORM
 * ================================================
 * Form for editing platform-wide commission settings
 *
 * Sprint: Admin Commission Management
 * Story: Commission Settings Management (5 SP)
 *
 * Features:
 * - Default commission rate slider (0-50%)
 * - Min/max commission amount inputs
 * - Category rates toggle
 * - Real-time validation
 * - Preview rate changes
 * - Audit trail (update reason required)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint Day 2
 */

'use client';

import { useState } from 'react';
import { Percent, DollarSign, Info, AlertCircle } from 'lucide-react';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Alert, AlertDescription } from '@/components/ui';
import { useCommissionSettings } from '@/hooks';
import type { CommissionSettings } from '@/lib/api/admin/types';

// ========== Form Data Type ==========

interface FormData {
  defaultRate: number;
  minCommissionAmount: number;
  maxCommissionAmount: number | null;
  categoryRatesEnabled: boolean;
  updateReason: string;
}

// ========== Component ==========

interface CommissionSettingsFormProps {
  settings: CommissionSettings;
  onSuccess?: () => void;
}

export function CommissionSettingsForm({
  settings,
  onSuccess,
}: CommissionSettingsFormProps) {
  const { updateSettings, isUpdating } = useCommissionSettings();

  const [formData, setFormData] = useState<FormData>({
    defaultRate: settings.defaultRate,
    minCommissionAmount: settings.minCommissionAmount,
    maxCommissionAmount: settings.maxCommissionAmount,
    categoryRatesEnabled: settings.categoryRatesEnabled,
    updateReason: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (formData.defaultRate < 0 || formData.defaultRate > 50) {
      newErrors.defaultRate = 'Komisyon oranı 0-50% arasında olmalıdır';
    }
    if (formData.minCommissionAmount < 0) {
      newErrors.minCommissionAmount = 'Minimum tutar negatif olamaz';
    }
    if (
      formData.maxCommissionAmount !== null &&
      formData.maxCommissionAmount < 0
    ) {
      newErrors.maxCommissionAmount = 'Maksimum tutar negatif olamaz';
    }
    if (hasChanges && formData.updateReason.length < 10) {
      newErrors.updateReason = 'Güncelleme nedeni en az 10 karakter olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    updateSettings(formData, {
      onSuccess: () => {
        setFormData({ ...formData, updateReason: '' });
        onSuccess?.();
      },
    });
  };

  const handleReset = () => {
    setFormData({
      defaultRate: settings.defaultRate,
      minCommissionAmount: settings.minCommissionAmount,
      maxCommissionAmount: settings.maxCommissionAmount,
      categoryRatesEnabled: settings.categoryRatesEnabled,
      updateReason: '',
    });
    setErrors({});
  };

  const hasChanges =
    formData.defaultRate !== settings.defaultRate ||
    formData.minCommissionAmount !== settings.minCommissionAmount ||
    formData.maxCommissionAmount !== settings.maxCommissionAmount ||
    formData.categoryRatesEnabled !== settings.categoryRatesEnabled;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Varsayılan Komisyon Oranı</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default Rate Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Percent className="h-4 w-4" />
                Komisyon Oranı
              </label>
              <span className="text-primary text-2xl font-bold">
                %{formData.defaultRate.toFixed(2)}
              </span>
            </div>
            <Slider
              min={0}
              max={50}
              step={0.25}
              value={[formData.defaultRate, formData.defaultRate]}
              onValueChange={([value]) =>
                setFormData({ ...formData, defaultRate: value })
              }
              className="py-4"
            />
            <p className="text-muted-foreground text-sm">
              Her işlemden alınacak komisyon yüzdesi (0% - 50%)
            </p>
            {errors.defaultRate && (
              <p className="text-destructive text-sm">{errors.defaultRate}</p>
            )}
          </div>

          {/* Min Commission Amount */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4" />
              Minimum Komisyon Tutarı
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="10.00"
              value={formData.minCommissionAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minCommissionAmount: parseFloat(e.target.value) || 0,
                })
              }
            />
            <p className="text-muted-foreground text-sm">
              Her işlemden alınacak minimum komisyon miktarı (TRY)
            </p>
            {errors.minCommissionAmount && (
              <p className="text-destructive text-sm">
                {errors.minCommissionAmount}
              </p>
            )}
          </div>

          {/* Max Commission Amount */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4" />
              Maksimum Komisyon Tutarı
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="Sınırsız (boş bırakın)"
              value={formData.maxCommissionAmount ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  maxCommissionAmount: value === '' ? null : parseFloat(value),
                });
              }}
            />
            <p className="text-muted-foreground text-sm">
              Her işlemden alınacak maksimum komisyon miktarı (opsiyonel)
            </p>
            {errors.maxCommissionAmount && (
              <p className="text-destructive text-sm">
                {errors.maxCommissionAmount}
              </p>
            )}
          </div>

          {/* Category Rates Toggle */}
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <label className="text-base font-medium">
                Kategori Bazlı Oranlar
              </label>
              <p className="text-muted-foreground text-sm">
                Her kategori için farklı komisyon oranı belirleyin
              </p>
            </div>
            <Switch
              checked={formData.categoryRatesEnabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, categoryRatesEnabled: checked })
              }
            />
          </div>

          {/* Preview Warning */}
          {hasChanges && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Değişiklikler yürütülen tüm yeni işlemlere uygulanacaktır.
                Mevcut siparişler etkilenmez.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Update Reason */}
      {hasChanges && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Güncelleme Nedeni
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea
                placeholder="Örn: Pazar rekabeti nedeniyle komisyon oranı düşürüldü"
                className="min-h-[100px]"
                value={formData.updateReason}
                onChange={(e) =>
                  setFormData({ ...formData, updateReason: e.target.value })
                }
              />
              <p className="text-muted-foreground text-sm">
                En az 10 karakter (maksimum 500 karakter)
              </p>
              {errors.updateReason && (
                <p className="text-destructive text-sm">
                  {errors.updateReason}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <UnifiedButton
          type="button"
          variant="secondary"
          onClick={handleReset}
          disabled={!hasChanges || isUpdating}
        >
          İptal
        </UnifiedButton>
        <UnifiedButton
          type="submit"
          variant="primary"
          disabled={!hasChanges || isUpdating}
          loading={isUpdating}
        >
          {isUpdating ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </UnifiedButton>
      </div>
    </form>
  );
}
