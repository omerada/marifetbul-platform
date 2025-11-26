'use client';

// ================================================
// REFACTORED PROFILE HOOKS - RESPONSIBILITY SEPARATION
// ================================================
// Separated concerns for profile management functionality

import { useMemo, useCallback } from 'react';
import { createDataHook, createMutationHook } from '../../shared/base/patterns';
import { apiClient } from '@/lib/infrastructure/api/client';
import { authSelectors } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import type { User, Freelancer, Employer } from '@/types';
import logger from '@/lib/infrastructure/monitoring/logger';

// Import the new production-ready profile completion hook
export { useProfileCompletion } from './useProfileCompletion';

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

// ProfileCompleteness interface removed - use ProfileCompletionData from './useProfileCompletion' instead

// ================================================
// PROFILE DATA HOOKS - DATA FETCHING
// ================================================

/**
 * Hook for fetching user profile by ID
 * Responsibility: Fetch and cache profile data
 */
export function useProfile(userId?: string) {
  const currentUser = authSelectors.useUser();
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

// useProfileCompleteness removed - use useProfileCompletion from './useProfileCompletion' instead

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
        logger.error('Failed to update profile', error);
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
        logger.error('Failed to upload avatar', error);
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
        logger.error('Failed to delete avatar', error);
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
        logger.error('Failed to update freelancer profile', error);
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
        logger.error('Failed to update employer profile', error);
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
  const currentUser = authSelectors.useUser();
  const isAuthenticated = authSelectors.useIsAuthenticated();

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
// HOOK EXPORTS WITH CLEAR RESPONSIBILITIES
// ================================================

export const ProfileHooks = {
  // Data fetching
  useProfile,
  useFreelancerProfile,
  useEmployerProfile,

  // Actions/Mutations
  useUpdateProfile,
  useAvatarUpload,
  useDeleteAvatar,
  useUpdateFreelancerProfile,
  useUpdateEmployerProfile,

  // Business logic
  useProfilePermissions,
  useProfileDisplay,
};

export default ProfileHooks;
