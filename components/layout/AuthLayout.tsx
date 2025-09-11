'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';

interface AuthLayoutWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component for authentication pages
 * Handles redirection if user is already authenticated
 */
export function AuthLayoutWrapper({ children }: AuthLayoutWrapperProps) {
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuth();
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirectTo = new URLSearchParams(window.location.search).get(
        'redirect'
      );
      router.push(redirectTo || '/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <p className="text-sm text-gray-600">Kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  // Don't render children if user is authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Protected route wrapper for authenticated pages
 */
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'employer' | 'freelancer';
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading, checkAuthStatus } = useAuth();
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      const redirectTo = encodeURIComponent(currentPath);
      router.push(`/login?redirect=${redirectTo}`);
    }
  }, [isAuthenticated, isLoading, router]);

  // Check role-based access
  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      requiredRole &&
      user?.userType !== requiredRole
    ) {
      // Redirect to appropriate dashboard or unauthorized page
      if (user?.userType === 'employer') {
        router.push('/dashboard');
      } else if (user?.userType === 'freelancer') {
        router.push('/dashboard');
      } else {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRole, router]);

  // Show loading state
  if (isLoading || !isAuthenticated) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      )
    );
  }

  // Check role access
  if (requiredRole && user?.userType !== requiredRole) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
