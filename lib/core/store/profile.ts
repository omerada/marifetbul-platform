import { create } from 'zustand';
import { User, FreelancerProfile, PortfolioItem } from '@/types';
import { useAuthStore } from './domains/auth/authStore';
import { logger } from '@/lib/shared/utils/logger';

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ProfileStore {
  // State properties
  currentProfile: User | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  uploadProgress: number;
  isDirty: boolean;
  lastSaved: Date | null;

  // Actions
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  uploadAvatar: (file: File, cropData?: CropData) => Promise<void>;
  addPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => Promise<void>;
  updatePortfolioItem: (
    id: string,
    item: Partial<PortfolioItem>
  ) => Promise<void>;
  removePortfolioItem: (id: string) => Promise<void>;
  clearError: () => void;
  setDirty: (dirty: boolean) => void;
  resetProfile: () => void;
  autoSave: () => Promise<void>;
}

const useProfileStore = create<ProfileStore>((set, get) => ({
  // Initial state
  currentProfile: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  uploadProgress: 0,
  isDirty: false,
  lastSaved: null,

  // Fetch profile data
  fetchProfile: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        set({
          currentProfile: data.data,
          isLoading: false,
          isDirty: false,
          error: null,
        });
      } else {
        set({
          error: data.error || 'Profil yüklenemedi',
          isLoading: false,
        });
      }
    } catch (error) {
      logger.error(
        'Profile fetch error',
        error instanceof Error ? error : new Error(String(error))
      );
      set({
        error: 'Profil yüklenirken bir hata oluştu',
        isLoading: false,
      });
    }
  },

  // Update profile
  updateProfile: async (userData: Partial<User>) => {
    set({ isUpdating: true, error: null });

    try {
      const currentProfile = get().currentProfile;
      if (!currentProfile) {
        throw new Error('Güncellenecek profil bulunamadı');
      }

      const response = await fetch(`/api/users/${currentProfile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        const updatedProfile = {
          ...currentProfile,
          ...userData,
          updatedAt: new Date().toISOString(),
        };

        set({
          currentProfile: updatedProfile,
          isUpdating: false,
          isDirty: false,
          lastSaved: new Date(),
          error: null,
        });

        // Update auth store if this is the current user
        const authStore = useAuthStore.getState();
        if (authStore.user?.id === currentProfile.id) {
          authStore.updateUser(updatedProfile);
        }

        return data.data;
      } else {
        set({
          error: data.error || 'Profil güncellenemedi',
          isUpdating: false,
        });
        throw new Error(data.error);
      }
    } catch (error) {
      logger.error(
        'Profile update error',
        error instanceof Error ? error : new Error(String(error))
      );
      set({
        error: 'Profil güncellenirken bir hata oluştu',
        isUpdating: false,
      });
      throw error;
    }
  },

  // Upload avatar
  uploadAvatar: async (file: File, cropData?: CropData) => {
    set({ uploadProgress: 0, error: null });

    try {
      const currentProfile = get().currentProfile;
      if (!currentProfile) {
        throw new Error('Profil bulunamadı');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', currentProfile.id);
      if (cropData) {
        formData.append('cropData', JSON.stringify(cropData));
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        set((state) => ({
          uploadProgress: Math.min(state.uploadProgress + 10, 90),
        }));
      }, 200);

      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (data.success) {
        const updatedProfile = {
          ...currentProfile,
          avatar: data.data.url,
          updatedAt: new Date().toISOString(),
        };

        set({
          currentProfile: updatedProfile,
          uploadProgress: 100,
          error: null,
        });

        // Update auth store
        const authStore = useAuthStore.getState();
        if (authStore.user?.id === currentProfile.id) {
          authStore.updateUser(updatedProfile);
        }

        // Reset progress after delay
        setTimeout(() => set({ uploadProgress: 0 }), 2000);

        return data.data;
      } else {
        set({
          error: data.error || 'Avatar yüklenemedi',
          uploadProgress: 0,
        });
        throw new Error(data.error);
      }
    } catch (error) {
      logger.error(
        'Avatar upload error',
        error instanceof Error ? error : new Error(String(error))
      );
      set({
        error: 'Avatar yüklenirken bir hata oluştu',
        uploadProgress: 0,
      });
      throw error;
    }
  },

  // Add portfolio item (for freelancers)
  addPortfolioItem: async (item: Omit<PortfolioItem, 'id'>) => {
    const currentProfile = get().currentProfile;
    if (!currentProfile || currentProfile.userType !== 'freelancer') {
      throw new Error('Freelancer profili gerekli');
    }

    if (!currentProfile || currentProfile.userType !== 'freelancer') {
      throw new Error('Freelancer profili bulunamadı');
    }

    // Safely handle the profile type - use partial types for incomplete profiles
    const freelancerProfile = {
      ...currentProfile,
      skills: 'skills' in currentProfile ? currentProfile.skills : [],
      hourlyRate:
        'hourlyRate' in currentProfile ? currentProfile.hourlyRate : 0,
      certifications:
        'certifications' in currentProfile ? currentProfile.certifications : [],
      languages: 'languages' in currentProfile ? currentProfile.languages : [],
      availability:
        'availability' in currentProfile ? currentProfile.availability : false,
      portfolio: 'portfolio' in currentProfile ? currentProfile.portfolio : [],
    } as FreelancerProfile;

    const newItem: PortfolioItem = {
      ...item,
      id: `portfolio-${Date.now()}`,
    };

    const updatedPortfolio = [...(freelancerProfile.portfolio || []), newItem];

    try {
      await get().updateProfile({
        portfolio: updatedPortfolio,
      } as Partial<FreelancerProfile>);
    } catch (error) {
      logger.error(
        'Portfolio add error',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  },

  // Update portfolio item
  updatePortfolioItem: async (id: string, item: Partial<PortfolioItem>) => {
    const currentProfile = get().currentProfile;
    if (!currentProfile || currentProfile.userType !== 'freelancer') {
      throw new Error('Freelancer profili gerekli');
    }

    const freelancerProfile = {
      ...currentProfile,
      skills: 'skills' in currentProfile ? currentProfile.skills : [],
      hourlyRate:
        'hourlyRate' in currentProfile ? currentProfile.hourlyRate : 0,
      certifications:
        'certifications' in currentProfile ? currentProfile.certifications : [],
      languages: 'languages' in currentProfile ? currentProfile.languages : [],
      availability:
        'availability' in currentProfile ? currentProfile.availability : false,
      portfolio: 'portfolio' in currentProfile ? currentProfile.portfolio : [],
    } as FreelancerProfile;
    const updatedPortfolio = (freelancerProfile.portfolio || []).map(
      (portfolioItem) =>
        portfolioItem.id === id ? { ...portfolioItem, ...item } : portfolioItem
    );

    try {
      await get().updateProfile({
        portfolio: updatedPortfolio,
      } as Partial<FreelancerProfile>);
    } catch (error) {
      logger.error(
        'Portfolio update error',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  },

  // Remove portfolio item
  removePortfolioItem: async (id: string) => {
    const currentProfile = get().currentProfile;
    if (!currentProfile || currentProfile.userType !== 'freelancer') {
      throw new Error('Freelancer profili gerekli');
    }

    const freelancerProfile = {
      ...currentProfile,
      skills: 'skills' in currentProfile ? currentProfile.skills : [],
      hourlyRate:
        'hourlyRate' in currentProfile ? currentProfile.hourlyRate : 0,
      certifications:
        'certifications' in currentProfile ? currentProfile.certifications : [],
      languages: 'languages' in currentProfile ? currentProfile.languages : [],
      availability:
        'availability' in currentProfile ? currentProfile.availability : false,
      portfolio: 'portfolio' in currentProfile ? currentProfile.portfolio : [],
    } as FreelancerProfile;
    const updatedPortfolio = (freelancerProfile.portfolio || []).filter(
      (item) => item.id !== id
    );

    try {
      await get().updateProfile({
        portfolio: updatedPortfolio,
      } as Partial<FreelancerProfile>);
    } catch (error) {
      logger.error(
        'Portfolio remove error',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  },

  // Auto-save functionality
  autoSave: async () => {
    const { isDirty, currentProfile, isUpdating } = get();

    if (!isDirty || !currentProfile || isUpdating) {
      return;
    }

    try {
      // This would save pending changes
      // For now, just mark as saved
      set({
        isDirty: false,
        lastSaved: new Date(),
      });
    } catch (error) {
      logger.error(
        'Auto-save error',
        error instanceof Error ? error : new Error(String(error))
      );
      // Don't show error for auto-save failures
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Set dirty state
  setDirty: (dirty: boolean) => {
    set({ isDirty: dirty });
  },

  // Reset profile state
  resetProfile: () => {
    set({
      currentProfile: null,
      isLoading: false,
      isUpdating: false,
      error: null,
      uploadProgress: 0,
      isDirty: false,
      lastSaved: null,
    });
  },
}));

export default useProfileStore;
