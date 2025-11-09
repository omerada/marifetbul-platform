/**
 * ============================================================================
 * USER PREFERENCES API - Language & Timezone Settings
 * ============================================================================
 * Handles user preference management for localization and regional settings
 *
 * Features:
 * - Get/update language preference (TR, EN)
 * - Get/update timezone preference
 * - Auto-detect browser settings
 * - Validate timezone support
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created December 2024
 * @sprint Security & Settings Sprint - Story 3
 */

'use client';

import { apiClient } from '@/lib/infrastructure/api/client';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Supported languages
 */
export type SupportedLanguage = 'tr' | 'en';

/**
 * User preferences data structure
 */
export interface UserPreferences {
  language: SupportedLanguage;
  timezone: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
}

/**
 * Request payload for updating preferences
 */
export interface UpdatePreferencesRequest {
  language?: SupportedLanguage;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
}

/**
 * Response from preferences operations
 */
export interface PreferencesResponse {
  success: boolean;
  preferences: UserPreferences;
  message?: string;
}

/**
 * Browser detected settings
 */
export interface BrowserSettings {
  language: SupportedLanguage;
  timezone: string;
  locale: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Language configurations
 */
export const LANGUAGES = [
  { code: 'tr' as const, name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
] as const;

/**
 * Common timezones for Turkey and international users
 */
export const COMMON_TIMEZONES = [
  { value: 'Europe/Istanbul', label: 'Istanbul (GMT+3)', offset: '+03:00' },
  { value: 'Europe/London', label: 'London (GMT+0)', offset: '+00:00' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1)', offset: '+01:00' },
  { value: 'Europe/Berlin', label: 'Berlin (GMT+1)', offset: '+01:00' },
  { value: 'America/New_York', label: 'New York (GMT-5)', offset: '-05:00' },
  {
    value: 'America/Los_Angeles',
    label: 'Los Angeles (GMT-8)',
    offset: '-08:00',
  },
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)', offset: '+04:00' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)', offset: '+08:00' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)', offset: '+09:00' },
  { value: 'Australia/Sydney', label: 'Sydney (GMT+10)', offset: '+10:00' },
] as const;

/**
 * Default preferences
 */
export const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'tr',
  timezone: 'Europe/Istanbul',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get user preferences
 *
 * @returns Promise<UserPreferences> - User's current preferences
 * @throws Error if request fails
 *
 * @example
 * ```ts
 * const prefs = await getPreferences();
 * console.log(`Language: ${prefs.language}`);
 * ```
 */
export async function getPreferences(): Promise<UserPreferences> {
  try {
    logger.debug('userPreferences.getPreferences: Fetching preferences');

    const data = await apiClient.get<UserPreferences>('/users/preferences');

    logger.info('userPreferences.getPreferences: Success', {
      language: data.language,
      timezone: data.timezone,
    });

    return data;
  } catch (error) {
    logger.error('userPreferences.getPreferences: Failed', error as Error);
    throw error;
  }
}

/**
 * Update user preferences
 *
 * @param request - Partial preferences to update
 * @returns Promise<PreferencesResponse> - Updated preferences
 * @throws Error if request fails or validation fails
 *
 * @example
 * ```ts
 * const result = await updatePreferences({
 *   language: 'en',
 *   timezone: 'America/New_York'
 * });
 * ```
 */
export async function updatePreferences(
  request: UpdatePreferencesRequest
): Promise<PreferencesResponse> {
  try {
    logger.debug('userPreferences.updatePreferences: Updating preferences', {
      updates: request,
    });

    const data = await apiClient.put<PreferencesResponse>(
      '/users/preferences',
      request
    );

    logger.info('userPreferences.updatePreferences: Success', {
      language: data.preferences.language,
      timezone: data.preferences.timezone,
    });

    return data;
  } catch (error) {
    logger.error('userPreferences.updatePreferences: Failed', error as Error);
    throw error;
  }
}

// ============================================================================
// BROWSER DETECTION HELPERS
// ============================================================================

/**
 * Detect browser language and map to supported language
 *
 * @returns SupportedLanguage - Detected or default language
 *
 * @example
 * ```ts
 * const lang = detectBrowserLanguage();
 * // Returns 'tr' for Turkish browsers, 'en' for others
 * ```
 */
export function detectBrowserLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES.language;
  }

  try {
    const browserLang = navigator.language || navigator.languages?.[0] || 'tr';
    const langCode = browserLang.toLowerCase().split('-')[0];

    logger.debug('userPreferences.detectBrowserLanguage', {
      browserLang,
      detected: langCode,
    });

    // Map to supported language
    if (langCode === 'tr') return 'tr';
    if (langCode === 'en') return 'en';

    // Default to Turkish for unsupported languages
    return 'tr';
  } catch {
    logger.warn('userPreferences.detectBrowserLanguage: Detection failed');
    return DEFAULT_PREFERENCES.language;
  }
}

/**
 * Detect browser timezone
 *
 * @returns string - IANA timezone identifier
 *
 * @example
 * ```ts
 * const tz = detectBrowserTimezone();
 * // Returns 'Europe/Istanbul' if in Turkey
 * ```
 */
export function detectBrowserTimezone(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES.timezone;
  }

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    logger.debug('userPreferences.detectBrowserTimezone', { timezone });

    // Validate timezone is in our common list or valid IANA timezone
    if (timezone && isValidTimezone(timezone)) {
      return timezone;
    }

    return DEFAULT_PREFERENCES.timezone;
  } catch {
    logger.warn('userPreferences.detectBrowserTimezone: Detection failed');
    return DEFAULT_PREFERENCES.timezone;
  }
}

/**
 * Get complete browser settings (language + timezone)
 *
 * @returns BrowserSettings - Detected browser settings
 *
 * @example
 * ```ts
 * const settings = detectBrowserSettings();
 * console.log(settings.language); // 'tr'
 * console.log(settings.timezone); // 'Europe/Istanbul'
 * ```
 */
export function detectBrowserSettings(): BrowserSettings {
  const language = detectBrowserLanguage();
  const timezone = detectBrowserTimezone();
  const locale = typeof window !== 'undefined' ? navigator.language : 'tr-TR';

  return {
    language,
    timezone,
    locale,
  };
}

/**
 * Validate if timezone is a valid IANA timezone
 *
 * @param timezone - Timezone string to validate
 * @returns boolean - True if valid
 *
 * @example
 * ```ts
 * isValidTimezone('Europe/Istanbul'); // true
 * isValidTimezone('Invalid/Zone'); // false
 * ```
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    // Try to create a formatter with the timezone
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get timezone offset in hours
 *
 * @param timezone - IANA timezone identifier
 * @returns number - Offset in hours (e.g., 3 for GMT+3)
 *
 * @example
 * ```ts
 * getTimezoneOffset('Europe/Istanbul'); // 3
 * getTimezoneOffset('America/New_York'); // -5
 * ```
 */
export function getTimezoneOffset(timezone: string): number {
  try {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(
      now.toLocaleString('en-US', { timeZone: timezone })
    );
    const offset = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
    return offset;
  } catch {
    return 0;
  }
}

/**
 * Format timezone display name with offset
 *
 * @param timezone - IANA timezone identifier
 * @returns string - Formatted display name
 *
 * @example
 * ```ts
 * formatTimezoneDisplay('Europe/Istanbul');
 * // Returns "Europe/Istanbul (GMT+3)"
 * ```
 */
export function formatTimezoneDisplay(timezone: string): string {
  const offset = getTimezoneOffset(timezone);
  const sign = offset >= 0 ? '+' : '';
  return `${timezone} (GMT${sign}${offset})`;
}

/**
 * Get language name by code
 *
 * @param code - Language code
 * @returns string - Language display name
 *
 * @example
 * ```ts
 * getLanguageName('tr'); // "Türkçe"
 * getLanguageName('en'); // "English"
 * ```
 */
export function getLanguageName(code: SupportedLanguage): string {
  const lang = LANGUAGES.find((l) => l.code === code);
  return lang?.name || 'Unknown';
}

/**
 * Get language flag emoji
 *
 * @param code - Language code
 * @returns string - Flag emoji
 *
 * @example
 * ```ts
 * getLanguageFlag('tr'); // "🇹🇷"
 * getLanguageFlag('en'); // "🇬🇧"
 * ```
 */
export function getLanguageFlag(code: SupportedLanguage): string {
  const lang = LANGUAGES.find((l) => l.code === code);
  return lang?.flag || '🌐';
}

// ============================================================================
// EXPORTS
// ============================================================================

export const userPreferencesApi = {
  getPreferences,
  updatePreferences,
  detectBrowserLanguage,
  detectBrowserTimezone,
  detectBrowserSettings,
  isValidTimezone,
  getTimezoneOffset,
  formatTimezoneDisplay,
  getLanguageName,
  getLanguageFlag,
};

export default userPreferencesApi;
