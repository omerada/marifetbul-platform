import { useEffect } from 'react';
import useProfileStore from '@/lib/core/store/profile';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
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

export function useProfileValidation() {
  const { currentProfile } = useProfileStore();

  const getProfileCompleteness = () => {
    if (!currentProfile) return 0;

    const requiredFields = ['firstName', 'lastName', 'bio', 'avatar'];
    const completedFields = requiredFields.filter((field) => {
      const value = currentProfile[field as keyof typeof currentProfile];
      return value && value !== '';
    });

    let percentage = (completedFields.length / requiredFields.length) * 100;

    // Additional checks for freelancers
    if (currentProfile.userType === 'freelancer') {
      const freelancerProfile = currentProfile as Freelancer;
      const freelancerFields = ['title', 'skills', 'hourlyRate'];
      const completedFreelancerFields = freelancerFields.filter((field) => {
        const value = freelancerProfile[field as keyof Freelancer];
        return value && (Array.isArray(value) ? value.length > 0 : true);
      });

      const freelancerPercentage =
        (completedFreelancerFields.length / freelancerFields.length) * 100;
      percentage = (percentage + freelancerPercentage) / 2;
    }

    // Additional checks for employers
    if (currentProfile.userType === 'employer') {
      const employerProfile = currentProfile as Employer;
      const employerFields = ['companyName', 'industry'];
      const completedEmployerFields = employerFields.filter((field) => {
        const value = employerProfile[field as keyof Employer];
        return value && value !== '';
      });

      const employerPercentage =
        (completedEmployerFields.length / employerFields.length) * 100;
      percentage = (percentage + employerPercentage) / 2;
    }

    return Math.round(percentage);
  };

  const getMissingFields = () => {
    if (!currentProfile) return [];

    const missingFields: string[] = [];

    // Basic fields
    if (!currentProfile.firstName) missingFields.push('Ad');
    if (!currentProfile.lastName) missingFields.push('Soyad');
    if (!currentProfile.bio) missingFields.push('Biyografi');
    if (!currentProfile.avatar) missingFields.push('Profil Fotoğrafı');

    // Freelancer specific fields
    if (currentProfile.userType === 'freelancer') {
      const freelancerProfile = currentProfile as Freelancer;
      if (!freelancerProfile.title) missingFields.push('Başlık/Uzmanlık');
      if (!freelancerProfile.skills || freelancerProfile.skills.length === 0) {
        missingFields.push('Beceriler');
      }
      if (!freelancerProfile.hourlyRate) missingFields.push('Saatlik Ücret');
    }

    // Employer specific fields
    if (currentProfile.userType === 'employer') {
      const employerProfile = currentProfile as Employer;
      if (!employerProfile.companyName) missingFields.push('Şirket Adı');
      if (!employerProfile.industry) missingFields.push('Sektör');
    }

    return missingFields;
  };

  return {
    completeness: getProfileCompleteness(),
    missingFields: getMissingFields(),
    isComplete: getProfileCompleteness() >= 90,
  };
}
