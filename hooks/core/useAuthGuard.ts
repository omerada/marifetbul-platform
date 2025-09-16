import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState as useAuth } from '../../shared/useAuth';

/**
 * Custom hook for route protection and role-based access control
 * Redirects users to appropriate pages based on authentication status and roles
 */
export function useAuthGuard(requiredRole?: 'employer' | 'freelancer') {
  const { isAuthenticated, user, isLoading } = useAuth();
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
      // Redirect to unauthorized page or appropriate dashboard
      if (user?.userType === 'employer') {
        router.push('/dashboard/employer');
      } else if (user?.userType === 'freelancer') {
        router.push('/dashboard/freelancer');
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
  const { user, isAuthenticated } = useAuth();

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
