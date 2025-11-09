/**
 * ============================================================================
 * USE USER PREFERENCES HOOK - Language & Timezone Management
 * ============================================================================
 * React hook for managing user localization preferences
 *
 * Features:
 * - Fetch current preferences
 * - Update language (TR/EN)
 * - Update timezone
 * - Auto-detect browser settings
 * - Apply preferences to UI
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created December 2024
 * @sprint Security & Settings Sprint - Story 3
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import {
  userPreferencesApi,
  type UserPreferences,
  type SupportedLanguage,
  type BrowserSettings,
} from '@/lib/api/user-preferences';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface UseUserPreferencesReturn {
  // State
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
  browserSettings: BrowserSettings | null;

  // Actions
  fetchPreferences: () => Promise<void>;
  updateLanguage: (language: SupportedLanguage) => Promise<boolean>;
  updateTimezone: (timezone: string) => Promise<boolean>;
  updateAllPreferences: (updates: Partial<UserPreferences>) => Promise<boolean>;
  detectAndApplyBrowserSettings: () => Promise<boolean>;
  refreshPreferences: () => Promise<void>;

  // Computed
  currentLanguage: SupportedLanguage;
  currentTimezone: string;
  isUsingBrowserSettings: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * React hook for user preferences management
 *
 * @example
 * ```tsx
 * function SettingsPage() {
 *   const {
 *     preferences,
 *     updateLanguage,
 *     updateTimezone,
 *     browserSettings
 *   } = useUserPreferences();
 *
 *   return (
 *     <div>
 *       <LanguageSelector
 *         value={preferences?.language}
 *         onChange={updateLanguage}
 *       />
 *       <TimezoneSelector
 *         value={preferences?.timezone}
 *         onChange={updateTimezone}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function useUserPreferences(): UseUserPreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [browserSettings, setBrowserSettings] =
    useState<BrowserSettings | null>(null);

  // ============================================================================
  // DETECT BROWSER SETTINGS
  // ============================================================================

  useEffect(() => {
    const detected = userPreferencesApi.detectBrowserSettings();
    setBrowserSettings(detected);

    logger.debug('useUserPreferences: Browser settings detected', {
      language: detected.language,
      timezone: detected.timezone,
    });
  }, []);

  // ============================================================================
  // FETCH PREFERENCES
  // ============================================================================

  const fetchPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      logger.debug('useUserPreferences.fetchPreferences: Fetching');

      const data = await userPreferencesApi.getPreferences();

      setPreferences(data);

      logger.info('useUserPreferences.fetchPreferences: Success', {
        language: data.language,
        timezone: data.timezone,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch preferences';

      logger.error('useUserPreferences.fetchPreferences: Failed', err as Error);

      setError(errorMessage);

      toast.error('Tercihler yüklenemedi', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================================
  // UPDATE LANGUAGE
  // ============================================================================

  const updateLanguage = useCallback(
    async (language: SupportedLanguage): Promise<boolean> => {
      try {
        setIsLoading(true);

        logger.debug('useUserPreferences.updateLanguage: Updating', {
          language,
        });

        const result = await userPreferencesApi.updatePreferences({
          language,
        });

        setPreferences(result.preferences);

        logger.info('useUserPreferences.updateLanguage: Success', {
          language,
        });

        const langName = userPreferencesApi.getLanguageName(language);
        toast.success('Dil tercihi güncellendi', {
          description: `Dil ${langName} olarak ayarlandı`,
        });

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update language';

        logger.error('useUserPreferences.updateLanguage: Failed', err as Error);

        toast.error('Dil güncellenemedi', {
          description: errorMessage,
        });

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ============================================================================
  // UPDATE TIMEZONE
  // ============================================================================

  const updateTimezone = useCallback(
    async (timezone: string): Promise<boolean> => {
      try {
        setIsLoading(true);

        // Validate timezone
        if (!userPreferencesApi.isValidTimezone(timezone)) {
          toast.error('Geçersiz saat dilimi', {
            description: 'Lütfen geçerli bir saat dilimi seçin',
          });
          return false;
        }

        logger.debug('useUserPreferences.updateTimezone: Updating', {
          timezone,
        });

        const result = await userPreferencesApi.updatePreferences({
          timezone,
        });

        setPreferences(result.preferences);

        logger.info('useUserPreferences.updateTimezone: Success', {
          timezone,
        });

        toast.success('Saat dilimi güncellendi', {
          description: `Saat dilimi ${timezone} olarak ayarlandı`,
        });

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update timezone';

        logger.error('useUserPreferences.updateTimezone: Failed', err as Error);

        toast.error('Saat dilimi güncellenemedi', {
          description: errorMessage,
        });

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ============================================================================
  // UPDATE ALL PREFERENCES
  // ============================================================================

  const updateAllPreferences = useCallback(
    async (updates: Partial<UserPreferences>): Promise<boolean> => {
      try {
        setIsLoading(true);

        logger.debug('useUserPreferences.updateAllPreferences: Updating', {
          updates,
        });

        const result = await userPreferencesApi.updatePreferences(updates);

        setPreferences(result.preferences);

        logger.info('useUserPreferences.updateAllPreferences: Success');

        toast.success('Tercihler güncellendi', {
          description: 'Değişiklikler başarıyla kaydedildi',
        });

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update preferences';

        logger.error(
          'useUserPreferences.updateAllPreferences: Failed',
          err as Error
        );

        toast.error('Tercihler güncellenemedi', {
          description: errorMessage,
        });

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ============================================================================
  // AUTO-DETECT AND APPLY BROWSER SETTINGS
  // ============================================================================

  const detectAndApplyBrowserSettings =
    useCallback(async (): Promise<boolean> => {
      try {
        if (!browserSettings) {
          toast.error('Tarayıcı ayarları algılanamadı');
          return false;
        }

        setIsLoading(true);

        logger.debug(
          'useUserPreferences.detectAndApplyBrowserSettings: Applying',
          {
            language: browserSettings.language,
            timezone: browserSettings.timezone,
          }
        );

        const result = await userPreferencesApi.updatePreferences({
          language: browserSettings.language,
          timezone: browserSettings.timezone,
        });

        setPreferences(result.preferences);

        logger.info(
          'useUserPreferences.detectAndApplyBrowserSettings: Success',
          {
            language: browserSettings.language,
            timezone: browserSettings.timezone,
          }
        );

        toast.success('Tarayıcı ayarları uygulandı', {
          description: `Dil ve saat dilimi otomatik olarak ayarlandı`,
        });

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to apply browser settings';

        logger.error(
          'useUserPreferences.detectAndApplyBrowserSettings: Failed',
          err as Error
        );

        toast.error('Tarayıcı ayarları uygulanamadı', {
          description: errorMessage,
        });

        return false;
      } finally {
        setIsLoading(false);
      }
    }, [browserSettings]);

  // ============================================================================
  // REFRESH PREFERENCES
  // ============================================================================

  const refreshPreferences = useCallback(async () => {
    await fetchPreferences();
  }, [fetchPreferences]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const currentLanguage: SupportedLanguage = preferences?.language || 'tr';

  const currentTimezone: string = preferences?.timezone || 'Europe/Istanbul';

  const isUsingBrowserSettings =
    preferences?.language === browserSettings?.language &&
    preferences?.timezone === browserSettings?.timezone;

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    preferences,
    isLoading,
    error,
    browserSettings,

    // Actions
    fetchPreferences,
    updateLanguage,
    updateTimezone,
    updateAllPreferences,
    detectAndApplyBrowserSettings,
    refreshPreferences,

    // Computed
    currentLanguage,
    currentTimezone,
    isUsingBrowserSettings,
  };
}
