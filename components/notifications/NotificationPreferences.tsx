'use client';

/**
 * Notification Preferences Component
 *
 * Settings UI for managing notification preferences:
 * - Email notifications (per type)
 * - Push notifications (per type)
 * - Do Not Disturb mode with time range
 * - Reset to defaults
 *
 * @sprint Sprint 4 - Notifications System
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  RefreshCw,
  Clock,
  Bell,
  Mail,
  Smartphone,
  Moon,
} from 'lucide-react';
import {
  NotificationPreferencesResponse,
  UpdateNotificationPreferencesRequest,
  getNotificationPreferences,
  updateNotificationPreferences,
  resetNotificationPreferences,
  setDoNotDisturb,
} from '@/lib/api/notifications';
import logger from '@/lib/infrastructure/monitoring/logger';

// ==================== TYPES ====================

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  emailKey: keyof NotificationPreferencesResponse;
  pushKey: keyof NotificationPreferencesResponse;
}

// ==================== CONSTANTS ====================

const NOTIFICATION_TYPES: NotificationPreference[] = [
  {
    id: 'message',
    label: 'Mesajlar',
    description: 'Yeni mesaj alındığında',
    emailKey: 'messageEmail',
    pushKey: 'messagePush',
  },
  {
    id: 'job',
    label: 'İş İlanları',
    description: 'Takip ettiğin kategorilerde yeni iş ilanı yayınlandığında',
    emailKey: 'jobEmail',
    pushKey: 'jobPush',
  },
  {
    id: 'proposal',
    label: 'Teklifler',
    description: 'Teklif durumu değiştiğinde',
    emailKey: 'proposalEmail',
    pushKey: 'proposalPush',
  },
  {
    id: 'order',
    label: 'Siparişler',
    description: 'Sipariş durumu güncellendiğinde',
    emailKey: 'orderEmail',
    pushKey: 'orderPush',
  },
  {
    id: 'payment',
    label: 'Ödemeler',
    description: 'Ödeme alındığında veya gönderildiğinde',
    emailKey: 'paymentEmail',
    pushKey: 'paymentPush',
  },
  {
    id: 'review',
    label: 'Değerlendirmeler',
    description: 'Profiline yorum yazıldığında',
    emailKey: 'reviewEmail',
    pushKey: 'reviewPush',
  },
  {
    id: 'system',
    label: 'Sistem Duyuruları',
    description: 'Önemli sistem bildirimleri',
    emailKey: 'systemEmail',
    pushKey: 'systemPush',
  },
];

// ==================== COMPONENT ====================

export default function NotificationPreferences() {
  const [preferences, setPreferences] =
    useState<NotificationPreferencesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // DND State
  const [dndEnabled, setDndEnabled] = useState(false);
  const [dndStartTime, setDndStartTime] = useState('22:00');
  const [dndEndTime, setDndEndTime] = useState('08:00');

  // ==================== FETCH PREFERENCES ====================

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getNotificationPreferences();
      setPreferences(data);

      // Set DND state
      setDndEnabled(data.doNotDisturb);
      if (data.dndStartTime) setDndStartTime(data.dndStartTime);
      if (data.dndEndTime) setDndEndTime(data.dndEndTime);

      logger.debug(
        'NotificationPreferences',
        'Preferences fetched successfully'
      );
    } catch (err) {
      logger.error('NotificationPreferences: Failed to fetch preferences', undefined, {
        err,
      });
      setError('Bildirim tercihleri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  // ==================== HANDLERS ====================

  const handleToggle = (key: keyof NotificationPreferencesResponse) => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });

    // Auto-save after toggle
    savePreferences({
      [key]: !preferences[key],
    });
  };

  const savePreferences = async (
    updates: UpdateNotificationPreferencesRequest
  ) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const updated = await updateNotificationPreferences(updates);
      setPreferences(updated);

      setSuccessMessage('Tercihler kaydedildi.');
      setTimeout(() => setSuccessMessage(null), 3000);

      logger.info(
        'NotificationPreferences',
        'Preferences updated successfully'
      );
    } catch (err) {
      logger.error('NotificationPreferences: Failed to update preferences', undefined, {
        err,
      });
      setError('Tercihler kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (
      !confirm(
        'Tüm bildirim tercihlerini varsayılan ayarlara sıfırlamak istediğinizden emin misiniz?'
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const defaults = await resetNotificationPreferences();
      setPreferences(defaults);

      setDndEnabled(defaults.doNotDisturb);
      if (defaults.dndStartTime) setDndStartTime(defaults.dndStartTime);
      if (defaults.dndEndTime) setDndEndTime(defaults.dndEndTime);

      setSuccessMessage('Tercihler varsayılan ayarlara sıfırlandı.');
      setTimeout(() => setSuccessMessage(null), 3000);

      logger.info('NotificationPreferences', 'Preferences reset to defaults');
    } catch (err) {
      logger.error('NotificationPreferences: Failed to reset preferences', undefined, {
        err,
      });
      setError('Tercihler sıfırlanırken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDndToggle = async () => {
    const newEnabled = !dndEnabled;

    try {
      setSaving(true);
      setError(null);

      await setDoNotDisturb(
        newEnabled,
        newEnabled ? dndStartTime : undefined,
        newEnabled ? dndEndTime : undefined
      );

      setDndEnabled(newEnabled);

      setSuccessMessage(
        newEnabled
          ? `Rahatsız Etme Modu aktif (${dndStartTime} - ${dndEndTime})`
          : 'Rahatsız Etme Modu kapatıldı'
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      logger.info(
        'NotificationPreferences',
        `DND ${newEnabled ? 'enabled' : 'disabled'}`
      );
    } catch (err) {
      logger.error('NotificationPreferences: Failed to toggle DND', undefined, { err });
      setError('Rahatsız Etme Modu ayarlanırken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDndTimeChange = async () => {
    if (!dndEnabled) return;

    try {
      setSaving(true);
      setError(null);

      await setDoNotDisturb(true, dndStartTime, dndEndTime);

      setSuccessMessage(
        `Rahatsız Etme Modu saatleri güncellendi (${dndStartTime} - ${dndEndTime})`
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      logger.info('NotificationPreferences', 'DND times updated');
    } catch (err) {
      logger.error('NotificationPreferences: Failed to update DND times', undefined, {
        err,
      });
      setError('Saatler güncellenirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-1/3 rounded bg-gray-200" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg border bg-gray-50 p-6">
            <div className="h-6 w-1/4 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
            <div className="flex gap-4">
              <div className="h-6 w-24 rounded bg-gray-200" />
              <div className="h-6 w-24 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && !preferences) {
    return (
      <div className="py-12 text-center">
        <Bell className="mx-auto mb-4 h-12 w-12 text-red-400" />
        <p className="mb-4 font-medium text-red-600">{error}</p>
        <button
          onClick={fetchPreferences}
          className="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 text-white"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!preferences) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Bildirim Tercihleri
          </h2>
          <p className="mt-1 text-gray-600">
            Hangi bildirimleri almak istediğinizi yönetin
          </p>
        </div>

        <button
          onClick={handleResetToDefaults}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          Varsayılana Sıfırla
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Do Not Disturb Mode */}
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <Moon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Rahatsız Etme Modu
              </h3>
              <p className="mt-0.5 text-sm text-gray-600">
                Belirtilen saatler arasında bildirim almayın (Yüksek öncelikli
                bildirimler hariç)
              </p>
            </div>
          </div>

          <button
            onClick={handleDndToggle}
            disabled={saving}
            className={`relative h-6 w-12 rounded-full transition-colors disabled:opacity-50 ${dndEnabled ? 'bg-purple-600' : 'bg-gray-300'} `}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${dndEnabled ? 'translate-x-6' : 'translate-x-0.5'} `}
            />
          </button>
        </div>

        {dndEnabled && (
          <div className="mt-4 flex items-end gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <Clock className="mr-1 inline h-4 w-4" />
                Başlangıç Saati
              </label>
              <input
                type="time"
                value={dndStartTime}
                onChange={(e) => setDndStartTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <Clock className="mr-1 inline h-4 w-4" />
                Bitiş Saati
              </label>
              <input
                type="time"
                value={dndEndTime}
                onChange={(e) => setDndEndTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={handleDndTimeChange}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Kaydet
            </button>
          </div>
        )}
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Bildirim Türleri
        </h3>

        {NOTIFICATION_TYPES.map((type) => (
          <div
            key={type.id}
            className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900">{type.label}</h4>
              <p className="mt-1 text-sm text-gray-600">{type.description}</p>
            </div>

            <div className="flex items-center gap-6">
              {/* Email Toggle */}
              <label className="flex cursor-pointer items-center gap-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-medium">E-posta</span>
                </div>
                <button
                  onClick={() => handleToggle(type.emailKey)}
                  disabled={saving}
                  className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${preferences[type.emailKey] ? 'bg-green-600' : 'bg-gray-300'} `}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${preferences[type.emailKey] ? 'translate-x-5' : 'translate-x-0.5'} `}
                  />
                </button>
              </label>

              {/* Push Toggle */}
              <label className="flex cursor-pointer items-center gap-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Smartphone className="h-4 w-4" />
                  <span className="text-sm font-medium">Anlık</span>
                </div>
                <button
                  onClick={() => handleToggle(type.pushKey)}
                  disabled={saving}
                  className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${preferences[type.pushKey] ? 'bg-green-600' : 'bg-gray-300'} `}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${preferences[type.pushKey] ? 'translate-x-5' : 'translate-x-0.5'} `}
                  />
                </button>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Saving Indicator */}
      {saving && (
        <div className="fixed right-4 bottom-4 flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-white shadow-lg">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Kaydediliyor...
        </div>
      )}
    </div>
  );
}
