'use client';

import { useEffect } from 'react';
import useProfileStore from '@/lib/core/store/profile';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { Freelancer, Employer } from '@/types';

export function useProfile(userId?: string) {
  const store = useProfileStore();
  const { user } = useAuthStore();

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId && targetUserId !== store.currentProfile?.id) {
      store.fetchProfile(targetUserId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId, store.currentProfile?.id]);

  // Auto-save functionality
  useEffect(() => {
    if (!store.isDirty) return;

    const autoSaveTimer = setTimeout(() => {
      store.autoSave();
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isDirty]);

  const isOwnProfile = user?.id === store.currentProfile?.id;

  return {
    ...store,
    isOwnProfile,
    canEdit: isOwnProfile,
    profile: store.currentProfile,
  };
}

export function useAvatarUpload() {
  const { uploadAvatar, uploadProgress, error, isUpdating } = useProfileStore();

  return {
    uploadAvatar,
    isUploading: isUpdating,
    uploadProgress,
    error,
  };
}
