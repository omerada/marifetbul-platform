'use client';

import { useState, useEffect } from 'react';
import {
  Eye,
  Globe,
  Search,
  Share2,
  MessageSquare,
  Shield,
  CheckCircle,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import {
  fetchPrivacySettings,
  updatePrivacySettings,
  resetPrivacySettings,
  PRIVACY_PRESETS,
  type PrivacySettings,
  type UpdatePrivacySettingsRequest,
} from '@/lib/api/privacy-settings';
import { logger } from '@/lib/shared/utils/logger';

export default function PrivacySettingsPage() {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await fetchPrivacySettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError('Gizlilik ayarları yüklenemedi');
      logger.error('Failed to load privacy settings', { error: err });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field: keyof UpdatePrivacySettingsRequest) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: !settings[field],
    });
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      const updated = await updatePrivacySettings(settings);
      setSettings(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Ayarlar kaydedilemedi');
      logger.error('Failed to save privacy settings', { error: err });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        'Tüm gizlilik ayarlarını varsayılana sıfırlamak istediğinize emin misiniz?'
      )
    )
      return;

    try {
      setSaving(true);
      setError(null);
      const updated = await resetPrivacySettings();
      setSettings(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Ayarlar sıfırlanamadı');
      logger.error('Failed to reset privacy settings', { error: err });
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPreset = async (preset: keyof typeof PRIVACY_PRESETS) => {
    if (
      !confirm(
        `"${PRIVACY_PRESETS[preset].name}" ayarlarını uygulamak istediğinize emin misiniz?`
      )
    )
      return;

    try {
      setSaving(true);
      setError(null);
      const updated = await updatePrivacySettings(
        PRIVACY_PRESETS[preset].settings
      );
      setSettings(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Preset uygulanamadı');
      logger.error('Failed to apply privacy preset', { preset, error: err });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-red-800">Gizlilik ayarları yüklenemedi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Gizlilik Ayarları
        </h1>
        <p className="text-gray-600">
          Profilinizin ve bilgilerinizin görünürlüğünü kontrol edin
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
          <p className="text-green-800">Ayarlar başarıyla kaydedildi</p>
        </div>
      )}

      {/* Quick Presets */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Shield className="h-5 w-5" />
          Hızlı Ayarlar
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(
            Object.keys(PRIVACY_PRESETS) as Array<keyof typeof PRIVACY_PRESETS>
          ).map((presetKey) => {
            const preset = PRIVACY_PRESETS[presetKey];
            return (
              <button
                key={presetKey}
                onClick={() => handleApplyPreset(presetKey)}
                disabled={saving}
                className="rounded-lg border border-gray-300 p-4 text-left transition-colors hover:border-blue-500 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <h3 className="mb-1 font-semibold text-gray-900">
                  {preset.name}
                </h3>
                <p className="text-sm text-gray-600">{preset.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Visibility */}
      <SettingsSection
        title="Profil Görünürlüğü"
        description="Profilinizde hangi bilgilerin gösterileceğini seçin"
        icon={<Eye className="h-5 w-5" />}
      >
        <ToggleItem
          label="Profil Görünür"
          description="Profiliniz diğer kullanıcılar tarafından görülebilir"
          checked={settings.profileVisible}
          onChange={() => handleToggle('profileVisible')}
        />
        <ToggleItem
          label="E-posta Göster"
          description="E-posta adresiniz profilinizde görünsün"
          checked={settings.showEmail}
          onChange={() => handleToggle('showEmail')}
        />
        <ToggleItem
          label="Telefon Göster"
          description="Telefon numaranız profilinizde görünsün"
          checked={settings.showPhone}
          onChange={() => handleToggle('showPhone')}
        />
        <ToggleItem
          label="Konum Göster"
          description="Şehir/bölge bilginiz profilinizde görünsün"
          checked={settings.showLocation}
          onChange={() => handleToggle('showLocation')}
        />
        <ToggleItem
          label="Portföy Göster"
          description="Portföy çalışmalarınız profilinizde görünsün"
          checked={settings.showPortfolio}
          onChange={() => handleToggle('showPortfolio')}
        />
        <ToggleItem
          label="Değerlendirmeleri Göster"
          description="Aldığınız değerlendirmeler profilinizde görünsün"
          checked={settings.showReviews}
          onChange={() => handleToggle('showReviews')}
        />
      </SettingsSection>

      {/* Search & Discovery */}
      <SettingsSection
        title="Arama ve Keşfet"
        description="Platformda nasıl bulunacağınızı kontrol edin"
        icon={<Search className="h-5 w-5" />}
      >
        <ToggleItem
          label="Aranabilir"
          description="Profiliniz arama sonuçlarında görünsün"
          checked={settings.searchable}
          onChange={() => handleToggle('searchable')}
        />
        <ToggleItem
          label="Önerilerde Göster"
          description="Önerilen freelancer'lar arasında yer alın"
          checked={settings.showInRecommendations}
          onChange={() => handleToggle('showInRecommendations')}
        />
        <ToggleItem
          label="Çevrimiçi Durumu Göster"
          description="Çevrimiçi olduğunuzda gösterge görünsün"
          checked={settings.showOnlineStatus}
          onChange={() => handleToggle('showOnlineStatus')}
        />
        <ToggleItem
          label="Son Aktif Zamanı Göster"
          description="En son ne zaman aktif olduğunuz görünsün"
          checked={settings.showLastActive}
          onChange={() => handleToggle('showLastActive')}
        />
      </SettingsSection>

      {/* Data Sharing */}
      <SettingsSection
        title="Veri Paylaşımı"
        description="Platform iyileştirmeleri için veri paylaşımı"
        icon={<Share2 className="h-5 w-5" />}
      >
        <ToggleItem
          label="İstatistikleri Paylaş"
          description="Anonim kullanım istatistiklerini paylaş"
          checked={settings.shareAnalytics}
          onChange={() => handleToggle('shareAnalytics')}
        />
        <ToggleItem
          label="Aktiviteleri Paylaş"
          description="Platform içi aktivitelerinizi paylaş"
          checked={settings.shareActivity}
          onChange={() => handleToggle('shareActivity')}
        />
        <ToggleItem
          label="Veri Toplama İzni"
          description="Platform geliştirme için veri toplanmasına izin ver"
          checked={settings.allowDataCollection}
          onChange={() => handleToggle('allowDataCollection')}
        />
      </SettingsSection>

      {/* Communication */}
      <SettingsSection
        title="İletişim Tercihleri"
        description="Kim sizinle iletişim kurabilir"
        icon={<MessageSquare className="h-5 w-5" />}
      >
        <ToggleItem
          label="Herkesten Mesaj Al"
          description="Tüm kullanıcılar size mesaj gönderebilir"
          checked={settings.allowMessagesFromAnyone}
          onChange={() => handleToggle('allowMessagesFromAnyone')}
        />
        <ToggleItem
          label="Bağlantı İsteklerine İzin Ver"
          description="Diğer kullanıcılar bağlantı isteği gönderebilir"
          checked={settings.allowConnectionRequests}
          onChange={() => handleToggle('allowConnectionRequests')}
        />
      </SettingsSection>

      {/* Public Profile */}
      <SettingsSection
        title="Genel Profil"
        description="Platformun dışından profilinize erişim"
        icon={<Globe className="h-5 w-5" />}
      >
        <ToggleItem
          label="Genel Profil Etkin"
          description="Profiliniz herkes tarafından görülebilir"
          checked={settings.publicProfileEnabled}
          onChange={() => handleToggle('publicProfileEnabled')}
        />
        <ToggleItem
          label="Arama Motorlarında İndekslen"
          description="Profiliniz Google gibi arama motorlarında görünsün"
          checked={settings.indexedBySearchEngines}
          onChange={() => handleToggle('indexedBySearchEngines')}
        />
      </SettingsSection>

      {/* Actions */}
      <div className="flex gap-3 border-t pt-6">
        <button
          onClick={handleReset}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" />
          Varsayılana Sıfırla
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </div>
    </div>
  );
}

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SettingsSection({
  title,
  description,
  icon,
  children,
}: SettingsSectionProps) {
  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-lg bg-blue-100 p-2 text-blue-600">{icon}</div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface ToggleItemProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleItem({
  label,
  description,
  checked,
  onChange,
}: ToggleItemProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
      <div className="flex-1 pr-4">
        <h3 className="font-medium text-gray-900">{label}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
