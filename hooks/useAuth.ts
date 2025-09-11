import { useMemo } from 'react';
import useAuthStore from '@/lib/store/auth';

/**
 * Custom hook for authentication state and actions
 * Provides easy access to user data and authentication status
 */
export function useAuth() {
  const store = useAuthStore();

  // Computed values for user roles
  const isEmployer = useMemo(
    () => store.user?.userType === 'employer',
    [store.user]
  );

  const isFreelancer = useMemo(
    () => store.user?.userType === 'freelancer',
    [store.user]
  );

  // User display name
  const displayName = useMemo(() => {
    if (!store.user) return '';
    return `${store.user.firstName} ${store.user.lastName}`.trim();
  }, [store.user]);

  // Avatar URL with fallback
  const avatarUrl = useMemo(() => {
    if (store.user?.avatar) return store.user.avatar;
    const userType = store.user?.userType || 'user';
    return `/avatars/default-${userType}.jpg`;
  }, [store.user]);

  return {
    // State
    ...store,

    // Computed values
    isEmployer,
    isFreelancer,
    displayName,
    avatarUrl,
  };
}
