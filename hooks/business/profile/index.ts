// ================================================
// REFACTORED PROFILE HOOKS - RESPONSIBILITY SEPARATION
// ================================================
// Separated concerns for profile management functionality

import { useMemo, useCallback } from 'react';
import { createDataHook, createMutationHook } from '../../shared/base/patterns';
import { apiClient } from '@/lib/infrastructure/api/client';
import { useAuthState } from '../../shared/useAuth';
import type { User, Freelancer, Employer } from '@/types';

// ================================================
// PROFILE TYPES
// ================================================

interface UpdateProfileParams {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  skills?: string[];
  hourlyRate?: number;
  availability?: string;
  portfolio?: Array<{
    title: string;
    description: string;
    url: string;
    imageUrl?: string;
  }>;
}

interface AvatarUploadParams {
  file: File;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface ProfileCompleteness {
  score: number;
  maxScore: number;
  percentage: number;
  missingFields: string[];
  suggestions: string[];
}

// ================================================
// PROFILE DATA HOOKS - DATA FETCHING
// ================================================

/**
 * Hook for fetching user profile by ID
 * Responsibility: Fetch and cache profile data
 */
export function useProfile(userId?: string) {
  const { user: currentUser } = useAuthState();
  const targetUserId = userId || currentUser?.id;

  return createDataHook(
    async () => {
      if (!targetUserId) throw new Error('User ID is required');
      return await apiClient.get<User>(`/users/${targetUserId}/profile`);
    },
    {
      enabled: !!targetUserId,
      refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    }
  )();
}

/**
 * Hook for fetching freelancer-specific profile data
 * Responsibility: Fetch freelancer extended profile
 */
export function useFreelancerProfile(userId: string) {
  return createDataHook(
    async () => {
      return await apiClient.get<Freelancer>(`/freelancers/${userId}`);
    },
    {
      enabled: !!userId,
    }
  )();
}

/**
 * Hook for fetching employer-specific profile data
 * Responsibility: Fetch employer extended profile
 */
export function useEmployerProfile(userId: string) {
  return createDataHook(
    async () => {
      return await apiClient.get<Employer>(`/employers/${userId}`);
    },
    {
      enabled: !!userId,
    }
  )();
}

/**
 * Hook for calculating profile completeness
 * Responsibility: Analyze profile data and provide completeness metrics
 */
export function useProfileCompleteness(userId?: string) {
  const profileData = useProfile(userId);

  return useMemo((): ProfileCompleteness => {
    const profile = profileData.data;
    if (!profile) {
      return {
        score: 0,
        maxScore: 100,
        percentage: 0,
        missingFields: [],
        suggestions: [],
      };
    }

    const requiredFields = [
      { field: 'firstName', weight: 10, label: 'Ad' },
      { field: 'lastName', weight: 10, label: 'Soyad' },
      { field: 'email', weight: 15, label: 'E-posta' },
      { field: 'phone', weight: 10, label: 'Telefon' },
      { field: 'location', weight: 10, label: 'Konum' },
      { field: 'bio', weight: 15, label: 'Biyografi' },
      { field: 'avatar', weight: 10, label: 'Profil fotoğrafı' },
    ];

    const freelancerFields = [
      { field: 'skills', weight: 15, label: 'Yetenekler' },
      { field: 'hourlyRate', weight: 10, label: 'Saatlik ücret' },
      { field: 'portfolio', weight: 5, label: 'Portföy' },
    ];

    const employerFields = [
      { field: 'companyName', weight: 15, label: 'Şirket adı' },
      { field: 'companyDescription', weight: 10, label: 'Şirket açıklaması' },
    ];

    let fieldsToCheck = [...requiredFields];
    if (profile.userType === 'freelancer') {
      fieldsToCheck = [...fieldsToCheck, ...freelancerFields];
    } else if (profile.userType === 'employer') {
      fieldsToCheck = [...fieldsToCheck, ...employerFields];
    }

    let score = 0;
    const maxScore = fieldsToCheck.reduce(
      (sum, field) => sum + field.weight,
      0
    );
    const missingFields: string[] = [];
    const suggestions: string[] = [];

    fieldsToCheck.forEach(({ field, weight, label }) => {
      const value = (profile as unknown as Record<string, unknown>)[field];

      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          score += weight;
        } else if (!Array.isArray(value)) {
          score += weight;
        } else {
          missingFields.push(label);
        }
      } else {
        missingFields.push(label);
      }
    });

    // Generate suggestions based on missing fields
    if (missingFields.includes('Profil fotoğrafı')) {
      suggestions.push(
        'Güvenilirliğinizi artırmak için profil fotoğrafı ekleyin'
      );
    }
    if (missingFields.includes('Biyografi')) {
      suggestions.push('Kendinizi tanıtmak için biyografi yazın');
    }
    if (
      profile.userType === 'freelancer' &&
      missingFields.includes('Yetenekler')
    ) {
      suggestions.push(
        'Müşterilerin sizi bulması için yeteneklerinizi ekleyin'
      );
    }

    return {
      score,
      maxScore,
      percentage: Math.round((score / maxScore) * 100),
      missingFields,
      suggestions,
    };
  }, [profileData.data]);
}

// ================================================
// PROFILE ACTION HOOKS - MUTATIONS
// ================================================

/**
 * Hook for updating profile information
 * Responsibility: Handle profile update mutations
 */
export function useUpdateProfile() {
  return createMutationHook(
    async (params: UpdateProfileParams) => {
      return await apiClient.put<User>('/profile', params);
    },
    {
      onSuccess: () => {
        // Profile updated successfully
      },
      onError: (error: Error) => {
        console.error('Failed to update profile:', error.message);
      },
    }
  )();
}

/**
 * Hook for uploading avatar
 * Responsibility: Handle avatar upload and processing
 */
export function useAvatarUpload() {
  return createMutationHook(
    async (params: AvatarUploadParams) => {
      const { file, cropData } = params;

      const formData = new FormData();
      formData.append('avatar', file);

      if (cropData) {
        formData.append('cropData', JSON.stringify(cropData));
      }

      return await apiClient.post<{ avatarUrl: string; thumbnailUrl: string }>(
        '/profile/avatar',
        formData
      );
    },
    {
      onSuccess: () => {
        // Avatar uploaded successfully
      },
      onError: (error: Error) => {
        console.error('Failed to upload avatar:', error.message);
      },
    }
  )();
}

/**
 * Hook for deleting avatar
 * Responsibility: Handle avatar removal
 */
export function useDeleteAvatar() {
  return createMutationHook(
    async () => {
      return await apiClient.delete<{ success: boolean }>('/profile/avatar');
    },
    {
      onSuccess: () => {
        // Avatar deleted successfully
      },
      onError: (error: Error) => {
        console.error('Failed to delete avatar:', error.message);
      },
    }
  )();
}

/**
 * Hook for updating freelancer-specific data
 * Responsibility: Handle freelancer profile updates
 */
export function useUpdateFreelancerProfile() {
  return createMutationHook(
    async (params: {
      skills?: string[];
      hourlyRate?: number;
      availability?: string;
      portfolio?: Array<{
        title: string;
        description: string;
        url: string;
        imageUrl?: string;
      }>;
    }) => {
      return await apiClient.put<Freelancer>('/freelancer/profile', params);
    },
    {
      onSuccess: () => {
        // Freelancer profile updated
      },
      onError: (error: Error) => {
        console.error('Failed to update freelancer profile:', error.message);
      },
    }
  )();
}

/**
 * Hook for updating employer-specific data
 * Responsibility: Handle employer profile updates
 */
export function useUpdateEmployerProfile() {
  return createMutationHook(
    async (params: {
      companyName?: string;
      companyDescription?: string;
      companySize?: string;
      industry?: string;
      website?: string;
    }) => {
      return await apiClient.put<Employer>('/employer/profile', params);
    },
    {
      onSuccess: () => {
        // Employer profile updated
      },
      onError: (error: Error) => {
        console.error('Failed to update employer profile:', error.message);
      },
    }
  )();
}

// ================================================
// PROFILE BUSINESS LOGIC HOOKS
// ================================================

/**
 * Hook for profile ownership and permissions
 * Responsibility: Handle profile access control logic
 */
export function useProfilePermissions(profileUserId?: string) {
  const { user: currentUser, isAuthenticated } = useAuthState();

  const isOwnProfile = useMemo(() => {
    return isAuthenticated && currentUser?.id === profileUserId;
  }, [isAuthenticated, currentUser?.id, profileUserId]);

  const canEdit = useMemo(() => {
    return isOwnProfile;
  }, [isOwnProfile]);

  const canView = useMemo(() => {
    // All profiles are viewable, but some information might be restricted
    return true;
  }, []);

  const canContact = useMemo(() => {
    return isAuthenticated && !isOwnProfile;
  }, [isAuthenticated, isOwnProfile]);

  return {
    isOwnProfile,
    canEdit,
    canView,
    canContact,
  };
}

/**
 * Hook for profile display utilities
 * Responsibility: Handle profile data formatting and display logic
 */
export function useProfileDisplay(userId?: string) {
  const profileData = useProfile(userId);
  const profile = profileData.data;

  const displayName = useMemo(() => {
    if (!profile) return '';
    return `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  }, [profile]);

  const initials = useMemo(() => {
    if (!profile) return '';
    const first = profile.firstName?.[0] || '';
    const last = profile.lastName?.[0] || '';
    return (first + last).toUpperCase();
  }, [profile]);

  const avatarUrl = useMemo(() => {
    if (profile?.avatar) return profile.avatar;
    const userType = profile?.userType || 'user';
    return `/avatars/default-${userType}.svg`;
  }, [profile]);

  const profileUrl = useMemo(() => {
    if (!profile?.id) return '';
    return `/profile/${profile.id}`;
  }, [profile?.id]);

  const getSkillsDisplay = useCallback(() => {
    if (profile?.userType !== 'freelancer') return [];
    return (profile as Freelancer).skills || [];
  }, [profile]);

  const getLocationDisplay = useCallback(() => {
    return profile?.location || 'Konum belirtilmemiş';
  }, [profile?.location]);

  const getBioDisplay = useCallback(() => {
    return profile?.bio || 'Henüz biyografi eklenmemiş';
  }, [profile?.bio]);

  return {
    profile,
    displayName,
    initials,
    avatarUrl,
    profileUrl,
    getSkillsDisplay,
    getLocationDisplay,
    getBioDisplay,
    isLoading: profileData.isLoading,
    error: profileData.error,
  };
}

// ================================================
// LEGACY COMPATIBILITY HOOKS
// ================================================

/**
 * Legacy profile validation hook
 * Responsibility: Provide validation utilities for profile forms
 */
export function useProfileValidation(userId?: string) {
  const completeness = useProfileCompleteness(userId);

  return {
    completeness: completeness.percentage,
    missingFields: completeness.missingFields,
    suggestions: completeness.suggestions,
    isComplete: completeness.percentage === 100,
    needsAttention: completeness.percentage < 70,
  };
}

// ================================================
// HOOK EXPORTS WITH CLEAR RESPONSIBILITIES
// ================================================

export const ProfileHooks = {
  // Data fetching
  useProfile,
  useFreelancerProfile,
  useEmployerProfile,
  useProfileCompleteness,

  // Actions/Mutations
  useUpdateProfile,
  useAvatarUpload,
  useDeleteAvatar,
  useUpdateFreelancerProfile,
  useUpdateEmployerProfile,

  // Business logic
  useProfilePermissions,
  useProfileDisplay,

  // Legacy compatibility
  useProfileValidation,
};

export default ProfileHooks;
