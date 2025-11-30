/**
 * ================================================
 * COOKIE CONSENT BANNER
 * ================================================
 * Sprint 1: Security & Compliance - Story 4
 *
 * GDPR/KVKK compliant cookie consent banner.
 *
 * Features:
 * - Essential, functional, analytics cookie categories
 * - Granular consent management
 * - Persistent storage
 * - Customizable settings
 * - Cookie policy link
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-26
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Switch } from '@/components/ui/Switch';
import {
  Cookie,
  Settings,
  X,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface CookieConsent {
  essential: boolean; // Always true, required for site functionality
  functional: boolean; // User preferences, saved states
  analytics: boolean; // Google Analytics, usage tracking
  marketing: boolean; // Marketing cookies (currently not used)
}

export interface CookieConsentBannerProps {
  /** Callback when consent is given */
  onConsentChange?: (consent: CookieConsent) => void;

  /** Cookie policy URL */
  policyUrl?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'marifetbul_cookie_consent';
const CONSENT_VERSION = '1.0';

const DEFAULT_CONSENT: CookieConsent = {
  essential: true,
  functional: false,
  analytics: false,
  marketing: false,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Load consent from localStorage
 */
function loadConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Check version to invalidate old consents
      if (data.version === CONSENT_VERSION) {
        return data.consent;
      }
    }
  } catch (error) {
    logger.error('[CookieConsent] Failed to load consent', error as Error);
  }

  return null;
}

/**
 * Save consent to localStorage
 */
function saveConsent(consent: CookieConsent): void {
  if (typeof window === 'undefined') return;

  try {
    const data = {
      version: CONSENT_VERSION,
      consent,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    logger.info('[CookieConsent] Consent saved', consent);
  } catch (error) {
    logger.error('[CookieConsent] Failed to save consent', error as Error);
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CookieConsentBanner Component
 *
 * GDPR/KVKK compliant cookie consent banner.
 *
 * @example
 * ```tsx
 * // In root layout
 * <CookieConsentBanner
 *   policyUrl="/legal/cookie-policy"
 *   onConsentChange={(consent) => console.log(consent)}
 * />
 * ```
 */
export function CookieConsentBanner({
  onConsentChange,
  policyUrl = '/legal/cookie-policy',
}: CookieConsentBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>(DEFAULT_CONSENT);

  /**
   * Load consent on mount
   */
  useEffect(() => {
    const savedConsent = loadConsent();

    if (savedConsent) {
      // User has already given consent
      setConsent(savedConsent);
      setShowBanner(false);

      if (onConsentChange) {
        onConsentChange(savedConsent);
      }
    } else {
      // Show banner for first-time visitors
      setShowBanner(true);
    }
  }, [onConsentChange]);

  /**
   * Accept all cookies
   */
  const handleAcceptAll = () => {
    const fullConsent: CookieConsent = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };

    setConsent(fullConsent);
    saveConsent(fullConsent);
    setShowBanner(false);

    if (onConsentChange) {
      onConsentChange(fullConsent);
    }

    logger.info('[CookieConsent] User accepted all cookies');
  };

  /**
   * Accept only essential cookies
   */
  const handleRejectAll = () => {
    const essentialOnly: CookieConsent = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    };

    setConsent(essentialOnly);
    saveConsent(essentialOnly);
    setShowBanner(false);

    if (onConsentChange) {
      onConsentChange(essentialOnly);
    }

    logger.info('[CookieConsent] User rejected optional cookies');
  };

  /**
   * Save custom preferences
   */
  const handleSavePreferences = () => {
    saveConsent(consent);
    setShowBanner(false);
    setShowSettings(false);

    if (onConsentChange) {
      onConsentChange(consent);
    }

    logger.info('[CookieConsent] User saved custom preferences', consent);
  };

  /**
   * Update individual consent
   */
  const updateConsent = (key: keyof CookieConsent, value: boolean) => {
    setConsent((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <Card className="mx-auto max-w-4xl border-2 border-blue-200 bg-white shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Cookie className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Çerez Kullanımı
                </h3>
                <p className="text-sm text-gray-600">
                  Web sitemizi geliştirmek için çerezler kullanıyoruz
                </p>
              </div>
            </div>
          </div>

          {/* Simple View */}
          {!showSettings && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-gray-700">
                Sitemizde size daha iyi bir deneyim sunmak için çerezler
                kullanıyoruz. Çerez tercihlerinizi özelleştirebilir veya tümünü
                kabul edebilirsiniz.{' '}
                <a
                  href={policyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Çerez Politikası
                </a>
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(true)}
                  className="flex-1"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Ayarları Özelleştir
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRejectAll}
                  className="flex-1"
                >
                  Sadece Gerekli
                </Button>
                <Button onClick={handleAcceptAll} className="flex-1">
                  Tümünü Kabul Et
                </Button>
              </div>
            </div>
          )}

          {/* Settings View */}
          {showSettings && (
            <div className="mt-4 space-y-4">
              {/* Essential Cookies */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-gray-700" />
                      <h4 className="font-semibold text-gray-900">
                        Gerekli Çerezler
                      </h4>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Sitenin çalışması için zorunlu çerezler. Devre dışı
                      bırakılamaz.
                    </p>
                  </div>
                  <Switch
                    checked={true}
                    disabled={true}
                    className="opacity-50"
                  />
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      İşlevsel Çerezler
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Tercihlerinizi hatırlar ve kişiselleştirilmiş deneyim
                      sunar.
                    </p>
                  </div>
                  <Switch
                    checked={consent.functional}
                    onCheckedChange={(checked) =>
                      updateConsent('functional', checked)
                    }
                  />
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      Analitik Çerezler
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Siteyi nasıl kullandığınızı anlamamıza ve iyileştirmemize
                      yardımcı olur.
                    </p>
                  </div>
                  <Switch
                    checked={consent.analytics}
                    onCheckedChange={(checked) =>
                      updateConsent('analytics', checked)
                    }
                  />
                </div>
              </div>

              {/* Marketing Cookies - Currently disabled */}
              {/* <div className="rounded-lg border border-gray-200 p-4 opacity-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      Pazarlama Çerezleri
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Size özel reklamlar göstermek için kullanılır. (Şu anda kullanılmıyor)
                    </p>
                  </div>
                  <Switch
                    checked={false}
                    disabled={true}
                  />
                </div>
              </div> */}

              {/* Settings Actions */}
              <div className="flex gap-2 border-t border-gray-200 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(false)}
                  className="flex-1"
                >
                  Geri
                </Button>
                <Button onClick={handleSavePreferences} className="flex-1">
                  Tercihleri Kaydet
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default CookieConsentBanner;
