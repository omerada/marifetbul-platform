/**
 * useAdminSettings Hook
 *
 * Custom hook for managing platform settings in admin panel.
 * Handles fetching, updating, and persisting settings.
 */

import { useState, useCallback, useEffect } from 'react';

export interface PlatformSettings {
  general: {
    siteName: string;
    siteDescription: string;
    supportEmail: string;
    maxFileUploadSize: number;
    allowedFileTypes: string[];
    defaultLanguage: string;
    supportedLanguages: string[];
    timezone: string;
    currency: string;
    supportedCurrencies: string[];
    termsOfServiceUrl: string;
    privacyPolicyUrl: string;
    cookiePolicyUrl: string;
  };
  payment: {
    platformFee: number;
    minimumWithdrawal: number;
    withdrawalFee: number;
    escrowPeriod: number;
    automaticRelease: boolean;
    supportedPaymentMethods: string[];
    taxCalculation: boolean;
    invoiceGeneration: boolean;
    refundPolicy: {
      allowRefunds: boolean;
      refundPeriod: number;
      partialRefunds: boolean;
      automaticRefunds: boolean;
      refundFee: number;
    };
  };
  security: {
    twoFactorAuth: boolean;
    passwordRequirements: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      preventCommonPasswords: boolean;
    };
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    ipWhitelist: string[];
    ipBlacklist: string[];
    enableCaptcha: boolean;
    dataRetentionPeriod: number;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
    enableEmailVerification: boolean;
    emailTemplates: Array<{
      id: string;
      name: string;
      subject: string;
      template: string;
      variables: string[];
      isActive: boolean;
    }>;
  };
  features: {
    userRegistration: boolean;
    emailVerificationRequired: boolean;
    profileVerification: boolean;
    servicePackages: boolean;
    jobPosting: boolean;
    directMessaging: boolean;
    videoChat: boolean;
    mobileApp: boolean;
    apiAccess: boolean;
    affiliateProgram: boolean;
  };
  content: {
    contentModeration: boolean;
    autoModeration: boolean;
    userGeneratedContent: boolean;
    allowUserProfiles: boolean;
    allowPortfolio: boolean;
    allowCustomCategories: boolean;
    profanityFilter: boolean;
    spamDetection: boolean;
  };
  maintenance: {
    isMaintenanceMode: boolean;
    maintenanceMessage: string;
    allowedIps: string[];
    scheduledMaintenance: {
      enabled: boolean;
      startTime: string;
      endTime: string;
      notifyUsers: boolean;
    };
  };
}

interface UseAdminSettingsReturn {
  settings: PlatformSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasChanges: boolean;
  fetchSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  updateSetting: <S extends keyof PlatformSettings>(
    section: S,
    field: keyof PlatformSettings[S],
    value: PlatformSettings[S][keyof PlatformSettings[S]]
  ) => void;
  updateNestedSetting: <S extends keyof PlatformSettings>(
    section: S,
    nestedField: keyof PlatformSettings[S],
    field: string,
    value: string | number | boolean
  ) => void;
  resetChanges: () => void;
}

export function useAdminSettings(): UseAdminSettingsReturn {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [originalSettings, setOriginalSettings] =
    useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const response = await fetch('/api/v1/admin/settings', {
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Ayarlar alınamadı');
      }

      const data = await response.json();
      setSettings(data.data);
      setOriginalSettings(data.data);
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings to API
  const saveSettings = useCallback(async () => {
    if (!settings) return;

    setIsSaving(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const response = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Ayarlar kaydedilemedi');
      }

      setOriginalSettings(settings);
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      throw err; // Re-throw for component to handle
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  // Update a setting field
  const updateSetting = useCallback(
    <S extends keyof PlatformSettings>(
      section: S,
      field: keyof PlatformSettings[S],
      value: PlatformSettings[S][keyof PlatformSettings[S]]
    ) => {
      setSettings((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value,
          },
        };
      });
      setHasChanges(true);
    },
    []
  );

  // Update a nested setting field
  const updateNestedSetting = useCallback(
    <S extends keyof PlatformSettings>(
      section: S,
      nestedField: keyof PlatformSettings[S],
      field: string,
      value: string | number | boolean
    ) => {
      setSettings((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          [section]: {
            ...prev[section],
            [nestedField]: {
              ...((prev[section] as Record<string, unknown>)[
                nestedField as string
              ] as object),
              [field]: value,
            },
          },
        };
      });
      setHasChanges(true);
    },
    []
  );

  // Reset changes to original
  const resetChanges = useCallback(() => {
    if (originalSettings) {
      setSettings(originalSettings);
      setHasChanges(false);
    }
  }, [originalSettings]);

  // Fetch on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    isSaving,
    error,
    hasChanges,
    fetchSettings,
    saveSettings,
    updateSetting,
    updateNestedSetting,
    resetChanges,
  };
}
