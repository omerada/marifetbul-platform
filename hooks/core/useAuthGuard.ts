'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authSelectors } from '@/lib/core/store/domains/auth/unifiedAuthStore';

/**
 * Custom hook for route protection and role-based access control
 * Redirects users to appropriate pages based on authentication status and roles
 */
export function useAuthGuard(requiredRole?: 'employer' | 'freelancer') {
  const isAuthenticated = authSelectors.useIsAuthenticated();
  const user = authSelectors.useUser();
  const isLoading = authSelectors.useIsLoading();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      const searchParams = window.location.search;
      const redirectTo = encodeURIComponent(currentPath + searchParams);
      router.push(`/login?redirect=${redirectTo}`);
      return;
    }

    // Check role-based access
    if (requiredRole && user?.userType !== requiredRole) {
      // Redirect to unified dashboard or unauthorized page
      if (user?.userType === 'employer' || user?.userType === 'freelancer') {
        router.push('/dashboard');
      } else {
        router.push('/unauthorized');
      }
      return;
    }
  }, [isAuthenticated, user, isLoading, requiredRole, router]);

  return {
    isLoading: isLoading || (!isAuthenticated && !isLoading),
    hasAccess:
      isAuthenticated && (!requiredRole || user?.userType === requiredRole),
  };
}

/**
 * Hook for checking if user has access to specific features
 */
export function usePermissions() {
  const user = authSelectors.useUser();
  const isAuthenticated = authSelectors.useIsAuthenticated();

  const canPostJobs = isAuthenticated && user?.userType === 'employer';
  const canCreatePackages = isAuthenticated && user?.userType === 'freelancer';
  const canApplyToJobs = isAuthenticated && user?.userType === 'freelancer';
  const canHireFreelancers = isAuthenticated && user?.userType === 'employer';
  const canManageProfile = isAuthenticated;
  const canAccessMessages = isAuthenticated;
  const canAccessDashboard = isAuthenticated;

  return {
    canPostJobs,
    canCreatePackages,
    canApplyToJobs,
    canHireFreelancers,
    canManageProfile,
    canAccessMessages,
    canAccessDashboard,
  };
}
