import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AdminSettingsStore, PlatformSettings } from '@/types';

export const useAdminSettingsStore = create<AdminSettingsStore>()(
  devtools(
    immer((set) => ({
      // State
      settings: null,
      isLoading: false,
      error: null,
      lastUpdated: null, // Added required field
      pendingChanges: {}, // Added required field
      hasPendingChanges: false, // Added required field
      hasUnsavedChanges: false,

      // Actions
      fetchSettings: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch('/api/v1/admin/settings', {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Platform ayarları alınamadı');
          }

          const result = await response.json();

          set((state) => {
            state.settings = result.data;
            state.isLoading = false;
            state.hasUnsavedChanges = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Bilinmeyen hata';
            state.isLoading = false;
          });
        }
      },

      updateSettings: async (settings: Partial<PlatformSettings>) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch('/api/v1/admin/settings', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings),
          });

          if (!response.ok) {
            throw new Error('Platform ayarları güncellenemedi');
          }

          const result = await response.json();

          set((state) => {
            state.settings = result.data;
            state.isLoading = false;
            state.hasUnsavedChanges = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Bilinmeyen hata';
            state.isLoading = false;
          });
        }
      },

      resetSettings: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch('/api/v1/admin/settings/reset', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Platform ayarları sıfırlanamadı');
          }

          const result = await response.json();

          set((state) => {
            state.settings = result.data;
            state.isLoading = false;
            state.hasUnsavedChanges = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Bilinmeyen hata';
            state.isLoading = false;
          });
        }
      },

      exportSettings: async () => {
        try {
          const response = await fetch('/api/v1/admin/settings/export', {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Ayarlar dışa aktarılamadı');
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `platform-settings-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Bilinmeyen hata';
          });
        }
      },

      importSettings: async (settings: PlatformSettings) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch('/api/v1/admin/settings/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings),
          });

          if (!response.ok) {
            throw new Error('Ayarlar içe aktarılamadı');
          }

          const result = await response.json();

          set((state) => {
            state.settings = result.data;
            state.isLoading = false;
            state.hasUnsavedChanges = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Bilinmeyen hata';
            state.isLoading = false;
          });
        }
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },

      // Required missing methods
      savePendingChanges: async () => {
        const state = useAdminSettingsStore.getState();
        if (Object.keys(state.pendingChanges).length > 0) {
          await state.updateSettings(state.pendingChanges);
          set((draft) => {
            draft.pendingChanges = {};
            draft.hasPendingChanges = false;
          });
        }
      },

      discardPendingChanges: () => {
        set((state) => {
          state.pendingChanges = {};
          state.hasPendingChanges = false;
        });
      },

      updatePendingSetting: (key: string, value: unknown) => {
        set((state) => {
          state.pendingChanges = { ...state.pendingChanges, [key]: value };
          state.hasPendingChanges =
            Object.keys(state.pendingChanges).length > 0;
        });
      },
    })),
    {
      name: 'admin-settings',
    }
  )
);

// Helper function to mark settings as changed
export const useAdminSettingsActions = () => {
  const store = useAdminSettingsStore();

  const markAsChanged = () => {
    useAdminSettingsStore.setState((state) => {
      state.hasUnsavedChanges = true;
    });
  };

  const updateSettingsPartial = (
    partialSettings: Partial<PlatformSettings>
  ) => {
    useAdminSettingsStore.setState((state) => {
      if (state.settings) {
        state.settings = { ...state.settings, ...partialSettings };
        state.hasUnsavedChanges = true;
      }
    });
  };

  return {
    ...store,
    markAsChanged,
    updateSettingsPartial,
  };
};

// Selectors
export const useAdminSettingsSelectors = () => {
  const store = useAdminSettingsStore();

  return {
    // Basic selectors
    settings: store.settings,
    generalSettings: store.settings?.general,
    paymentSettings: store.settings?.payment,
    securitySettings: store.settings?.security,
    emailSettings: store.settings?.email,
    featureSettings: store.settings?.features,
    contentSettings: store.settings?.content,
    apiSettings: store.settings?.api,
    integrationSettings: store.settings?.integrations,
    maintenanceSettings: store.settings?.maintenance,

    // Computed selectors
    isMaintenanceMode: store.settings?.maintenance?.isMaintenanceMode || false,
    platformFee: store.settings?.payment?.platformFee || 0,
    siteName: store.settings?.general?.siteName || '',
    supportEmail: store.settings?.general?.supportEmail || '',
    isTwoFactorEnabled: store.settings?.security?.twoFactorAuth || false,
    isEmailVerificationRequired:
      store.settings?.features?.emailVerificationRequired || false,

    // State selectors
    isLoading: store.isLoading,
    error: store.error,
    hasUnsavedChanges: store.hasUnsavedChanges,
    hasData: !!store.settings,
  };
};

export default useAdminSettingsStore;
