import { useCallback, useEffect, useState } from 'react';
import {
  useAdminSettingsStore,
  useAdminSettingsSelectors,
  useAdminSettingsActions,
} from '@/lib/core/store/admin-settings';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { PlatformSettings } from '@/types';

/**
 * Hook for platform settings management
 */
export function usePlatformSettings() {
  const {
    fetchSettings,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    clearError,
  } = useAdminSettingsStore();

  const { markAsChanged, updateSettingsPartial } = useAdminSettingsActions();
  const selectors = useAdminSettingsSelectors();
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Auto-fetch settings on mount
  useEffect(() => {
    if (!selectors.hasData && !selectors.isLoading) {
      fetchSettings();
    }
  }, [fetchSettings, selectors.hasData, selectors.isLoading]);

  const handleUpdateSettings = useCallback(
    async (settings: Partial<PlatformSettings>) => {
      setIsSaving(true);
      try {
        await updateSettings(settings);
      } catch (error) {
        logger.error('Settings update failed:', error instanceof Error ? error : new Error(String(error)));
      } finally {
        setIsSaving(false);
      }
    },
    [updateSettings]
  );

  const handlePartialUpdate = useCallback(
    (section: keyof PlatformSettings, data: unknown) => {
      updateSettingsPartial({ [section]: data });
    },
    [updateSettingsPartial]
  );

  const handleFieldUpdate = useCallback(
    (section: keyof PlatformSettings, field: string, value: unknown) => {
      if (selectors.settings?.[section]) {
        const updatedSection = {
          ...selectors.settings[section],
          [field]: value,
        };
        handlePartialUpdate(section, updatedSection);
      }
    },
    [selectors.settings, handlePartialUpdate]
  );

  const handleResetSettings = useCallback(async () => {
    setIsResetting(true);
    try {
      await resetSettings();
    } catch (error) {
      logger.error('Settings reset failed:', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsResetting(false);
    }
  }, [resetSettings]);

  const handleExportSettings = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportSettings();
    } catch (error) {
      logger.error('Settings export failed:', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsExporting(false);
    }
  }, [exportSettings]);

  const handleImportSettings = useCallback(
    async (settings: PlatformSettings) => {
      setIsSaving(true);
      try {
        await importSettings(settings);
      } catch (error) {
        logger.error('Settings import failed:', error instanceof Error ? error : new Error(String(error)));
      } finally {
        setIsSaving(false);
      }
    },
    [importSettings]
  );

  const handleSaveChanges = useCallback(async () => {
    if (selectors.settings && selectors.hasUnsavedChanges) {
      await handleUpdateSettings(selectors.settings);
    }
  }, [selectors.settings, selectors.hasUnsavedChanges, handleUpdateSettings]);

  const handleDiscardChanges = useCallback(async () => {
    await fetchSettings(); // Refresh from server
  }, [fetchSettings]);

  // Settings validation
  const validateSettings = useCallback(
    (settings: Partial<PlatformSettings>) => {
      const errors: string[] = [];

      if (settings.payment?.platformFee !== undefined) {
        if (
          settings.payment.platformFee < 0 ||
          settings.payment.platformFee > 1
        ) {
          errors.push('Platform fee must be between 0% and 100%');
        }
      }

      if (settings.security?.twoFactorAuth !== undefined) {
        // Basic security validation without sessionTimeout
      }

      if (settings.general?.maxFileUploadSize !== undefined) {
        if (
          settings.general.maxFileUploadSize < 1024 ||
          settings.general.maxFileUploadSize > 104857600
        ) {
          errors.push('File upload size must be between 1KB and 100MB');
        }
      }

      return errors;
    },
    []
  );

  // Feature toggles
  const toggleFeature = useCallback(
    (featureName: keyof PlatformSettings['features'], enabled: boolean) => {
      if (selectors.settings?.features) {
        const updatedFeatures = {
          ...selectors.settings.features,
          [featureName]: enabled,
        };
        handlePartialUpdate('features', updatedFeatures);
      }
    },
    [selectors.settings, handlePartialUpdate]
  );

  // Maintenance mode toggle
  const toggleMaintenanceMode = useCallback(
    (enabled: boolean, message?: string) => {
      if (selectors.settings?.maintenance) {
        const updatedMaintenance = {
          ...selectors.settings.maintenance,
          isMaintenanceMode: enabled,
          ...(message && { maintenanceMessage: message }),
        };
        handlePartialUpdate('maintenance', updatedMaintenance);
      }
    },
    [selectors.settings, handlePartialUpdate]
  );

  return {
    // Data
    ...selectors,

    // Loading states
    isSaving,
    isResetting,
    isExporting,

    // Actions
    updateSettings: handleUpdateSettings,
    updatePartial: handlePartialUpdate,
    updateField: handleFieldUpdate,
    resetSettings: handleResetSettings,
    exportSettings: handleExportSettings,
    importSettings: handleImportSettings,
    saveChanges: handleSaveChanges,
    discardChanges: handleDiscardChanges,

    // Utilities
    validateSettings,
    toggleFeature,
    toggleMaintenanceMode,
    markAsChanged,
    clearError,

    // Computed values
    isDirty: selectors.hasUnsavedChanges,
    canSave: selectors.hasUnsavedChanges && !isSaving,
    canReset: selectors.hasData && !isResetting,
    canExport: selectors.hasData && !isExporting,

    // Quick accessors for common settings
    platformFee: selectors.platformFee,
    isMaintenanceMode: selectors.isMaintenanceMode,
    siteName: selectors.siteName,
    supportEmail: selectors.supportEmail,
    isTwoFactorEnabled: selectors.isTwoFactorEnabled,
    isEmailVerificationRequired: selectors.isEmailVerificationRequired,

    // Settings categories
    categories: {
      general: selectors.generalSettings,
      payment: selectors.paymentSettings,
      security: selectors.securitySettings,
      email: selectors.emailSettings,
      features: selectors.featureSettings,
      content: selectors.contentSettings,
      api: selectors.apiSettings,
      integrations: selectors.integrationSettings,
      maintenance: selectors.maintenanceSettings,
    },
  };
}

export default usePlatformSettings;
