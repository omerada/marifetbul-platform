/**
 * ================================================
 * NOTIFICATION PREFERENCES COMPONENT
 * ================================================
 * User preferences for moderation notifications
 * Controls WebSocket, browser, and sound notifications
 *
 * Sprint 2 - Day 3 Story 3.3
 * @author MarifetBul Development Team
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Volume2, VolumeX, Monitor } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { UnifiedButton } from '@/components/ui';
import { useBrowserNotifications } from '@/hooks/shared/useBrowserNotifications';
import { logger } from '@/lib/shared/utils/logger';

// ==================== TYPES ====================

/**
 * Notification preference settings
 */
export interface NotificationPreferences {
  /** Enable WebSocket real-time notifications */
  enableWebSocket: boolean;
  /** Enable browser/desktop notifications */
  enableBrowser: boolean;
  /** Enable sound alerts */
  enableSound: boolean;
  /** Show toast notifications */
  showToasts: boolean;
}

/**
 * Component props
 */
export interface NotificationPreferencesProps {
  /** Initial preferences */
  initialPreferences?: Partial<NotificationPreferences>;
  /** Callback when preferences change */
  onChange?: (preferences: NotificationPreferences) => void;
  /** Save preferences to backend */
  onSave?: (preferences: NotificationPreferences) => Promise<void>;
  /** Show save button */
  showSaveButton?: boolean;
}

// ==================== CONSTANTS ====================

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enableWebSocket: true,
  enableBrowser: false,
  enableSound: false,
  showToasts: true,
};

const STORAGE_KEY = 'moderation_notification_preferences';

// ==================== COMPONENT ====================

/**
 * NotificationPreferences Component
 *
 * Manage notification settings for moderation
 *
 * @example
 * ```tsx
 * <NotificationPreferences
 *   initialPreferences={userPreferences}
 *   onSave={async (prefs) => {
 *     await savePreferencesToBackend(prefs);
 *   }}
 *   showSaveButton={true}
 * />
 * ```
 */
export function NotificationPreferences({
  initialPreferences = {},
  onChange,
  onSave,
  showSaveButton = true,
}: NotificationPreferencesProps): React.ReactElement {
  // Load from localStorage or use defaults
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    () => {
      if (typeof window === 'undefined') {
        return { ...DEFAULT_PREFERENCES, ...initialPreferences };
      }

      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as NotificationPreferences;
          return { ...DEFAULT_PREFERENCES, ...parsed, ...initialPreferences };
        }
      } catch (error) {
        logger.error('NotificationPreferences', 'Failed to load preferences', {
          error,
        });
      }

      return { ...DEFAULT_PREFERENCES, ...initialPreferences };
    }
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Browser notifications hook
  const {
    permission,
    isGranted: browserPermissionGranted,
    isDenied: browserPermissionDenied,
    isSupported: browserNotificationSupported,
    requestPermission,
  } = useBrowserNotifications();

  // ==================== PERSISTENCE ====================

  /**
   * Save preferences to localStorage
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        logger.debug('NotificationPreferences', 'Saved to localStorage', {
          preferences,
        });
      } catch (error) {
        logger.error('NotificationPreferences', 'Failed to save preferences', {
          error,
        });
      }
    }

    // Notify parent
    onChange?.(preferences);
  }, [preferences, onChange]);

  // ==================== HANDLERS ====================

  /**
   * Toggle a preference
   */
  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaveSuccess(false);
  };

  /**
   * Request browser notification permission
   */
  const handleRequestBrowserPermission = async () => {
    try {
      const result = await requestPermission();

      if (result === 'granted') {
        setPreferences((prev) => ({
          ...prev,
          enableBrowser: true,
        }));
        logger.info(
          'NotificationPreferences',
          'Browser permission granted and enabled'
        );
      } else {
        logger.warn('NotificationPreferences', 'Browser permission denied', {
          result,
        });
      }
    } catch (error) {
      logger.error('NotificationPreferences', 'Failed to request permission', {
        error,
      });
    }
  };

  /**
   * Save preferences to backend
   */
  const handleSave = async () => {
    if (!onSave) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      await onSave(preferences);
      setSaveSuccess(true);
      logger.info('NotificationPreferences', 'Preferences saved to backend');

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      logger.error('NotificationPreferences', 'Failed to save preferences', {
        error,
      });
    } finally {
      setSaving(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <Card className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Bell className="h-5 w-5" />
          Bildirim Tercihleri
        </h3>
        <p className="text-sm text-gray-600">
          Moderasyon bildirimleri için tercihleri yönetin
        </p>
      </div>

      {/* Preference Options */}
      <div className="space-y-4">
        {/* Real-time Notifications */}
        <div className="flex items-start justify-between rounded-lg border p-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 font-medium">
              <Monitor className="h-4 w-4" />
              Gerçek Zamanlı Bildirimler
            </div>
            <p className="mt-1 text-sm text-gray-600">
              WebSocket üzerinden anlık moderasyon güncellemeleri alın
            </p>
          </div>
          <button
            onClick={() => handleToggle('enableWebSocket')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.enableWebSocket ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={preferences.enableWebSocket}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.enableWebSocket ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Browser Notifications */}
        <div className="flex items-start justify-between rounded-lg border p-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 font-medium">
              {preferences.enableBrowser ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
              Tarayıcı Bildirimleri
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Masaüstü bildirimleri ile acil öğeler için uyarı alın
            </p>
            {!browserNotificationSupported && (
              <p className="mt-1 text-xs text-orange-600">
                ⚠️ Tarayıcınız bildirimler desteklemiyor
              </p>
            )}
            {browserPermissionDenied && (
              <p className="mt-1 text-xs text-red-600">
                ⛔ Bildirim izni reddedildi. Tarayıcı ayarlarından
                etkinleştirin.
              </p>
            )}
            {permission === 'default' && browserNotificationSupported && (
              <UnifiedButton
                onClick={handleRequestBrowserPermission}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                İzin İste
              </UnifiedButton>
            )}
          </div>
          <button
            onClick={() => handleToggle('enableBrowser')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.enableBrowser && browserPermissionGranted
                ? 'bg-blue-600'
                : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={preferences.enableBrowser && browserPermissionGranted}
            disabled={!browserNotificationSupported || browserPermissionDenied}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.enableBrowser && browserPermissionGranted
                  ? 'translate-x-6'
                  : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Sound Notifications */}
        <div className="flex items-start justify-between rounded-lg border p-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 font-medium">
              {preferences.enableSound ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
              Ses Uyarıları
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Yeni öğeler geldiğinde ses çal
            </p>
          </div>
          <button
            onClick={() => handleToggle('enableSound')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.enableSound ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={preferences.enableSound}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.enableSound ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Toast Notifications */}
        <div className="flex items-start justify-between rounded-lg border p-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 font-medium">
              <Bell className="h-4 w-4" />
              Toast Bildirimleri
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Ekranın köşesinde küçük bildirimler göster
            </p>
          </div>
          <button
            onClick={() => handleToggle('showToasts')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.showToasts ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={preferences.showToasts}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.showToasts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save Button */}
      {showSaveButton && onSave && (
        <div className="flex items-center gap-3 border-t pt-4">
          <UnifiedButton
            onClick={handleSave}
            loading={saving}
            disabled={saving}
            variant="primary"
          >
            {saving ? 'Kaydediliyor...' : 'Tercihleri Kaydet'}
          </UnifiedButton>

          {saveSuccess && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              ✓ Kaydedildi
            </span>
          )}
        </div>
      )}

      {/* Info Note */}
      <div className="border-t pt-4 text-xs text-gray-500">
        💡 Tercihler tarayıcınızda saklanır ve tüm oturumlarda geçerlidir.
      </div>
    </Card>
  );
}

export default NotificationPreferences;
