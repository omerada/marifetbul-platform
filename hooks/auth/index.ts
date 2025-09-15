/**
 * Auth hook for business logic
 */

'use client';

import { useCallback } from 'react';
import { useAuth as useBaseAuth } from '../shared/useAuth';

export function useAuthState() {
  const auth = useBaseAuth();

  const checkPermission = useCallback(
    (permission: string) => {
      if (!auth.user) return false;

      // Basic permission check based on role
      switch (permission) {
        case 'admin':
          return auth.isAdmin;
        case 'freelancer':
          return auth.isFreelancer;
        case 'employer':
          return auth.isEmployer;
        default:
          return true;
      }
    },
    [auth.user, auth.isAdmin, auth.isFreelancer, auth.isEmployer]
  );

  const getDisplayName = useCallback(() => {
    if (!auth.user) return 'Guest';
    return `${auth.user.firstName} ${auth.user.lastName}`.trim();
  }, [auth.user]);

  const getAvatarUrl = useCallback(() => {
    return auth.user?.avatar || '/default-avatar.png';
  }, [auth.user]);

  return {
    ...auth,
    checkPermission,
    getDisplayName,
    getAvatarUrl,
    hasProfile: !!auth.user?.firstName && !!auth.user?.lastName,
  };
}

export default useAuthState;
