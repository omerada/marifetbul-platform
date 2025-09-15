'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthState } from '@/hooks/shared/useAuth';
import { Card, CardContent } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Loader2, AlertTriangle, RefreshCw, ShieldX } from 'lucide-react';

// ================================================
// TYPES
// ================================================

export interface AuthLayoutWrapperProps {
  children: ReactNode;
  /** Redirect URL after successful authentication */
  redirectTo?: string;
  /** Show loading indicator during auth check */
  showLoadingIndicator?: boolean;
  /** Custom loading message */
  loadingMessage?: string;
}

export interface ProtectedRouteProps {
  children: ReactNode;
  /** Required user role for access */
  requiredRole?: 'freelancer' | 'employer' | 'admin';
  /** Redirect URL if user doesn't have required role */
  unauthorizedRedirect?: string;
  /** Show unauthorized message instead of redirect */
  showUnauthorizedMessage?: boolean;
  /** Fallback component when unauthorized */
  fallback?: ReactNode;
}

export interface AuthErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export interface AuthLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

// ================================================
// AUTH ERROR DISPLAY COMPONENT
// ================================================

function AuthErrorDisplay({ error, onRetry, onGoHome }: AuthErrorDisplayProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Kimlik Doğrulama Hatası
            </h3>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <div className="mt-6 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              {onRetry && (
                <Button onClick={onRetry} variant="outline" className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tekrar Dene
                </Button>
              )}
              {onGoHome && (
                <Button onClick={onGoHome} className="flex-1">
                  Ana Sayfa&apos;ya Git
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ================================================
// AUTH LOADING COMPONENT
// ================================================

function AuthLoading({
  message = 'Kimlik doğrulanıyor...',
  size = 'md',
}: AuthLoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ================================================
// UNAUTHORIZED ACCESS COMPONENT
// ================================================

function UnauthorizedAccess() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <ShieldX className="mx-auto h-12 w-12 text-orange-500" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Yetkisiz Erişim
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Bu sayfaya erişim yetkiniz bulunmamaktadır. Lütfen uygun hesap
              türü ile giriş yapın.
            </p>
            <div className="mt-6 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button
                onClick={() => router.push('/login')}
                variant="outline"
                className="flex-1"
              >
                Giriş Yap
              </Button>
              <Button onClick={() => router.push('/')} className="flex-1">
                Ana Sayfa
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ================================================
// AUTH LAYOUT WRAPPER
// ================================================

export function AuthLayoutWrapper({
  children,
  redirectTo = '/dashboard',
  showLoadingIndicator = true,
  loadingMessage,
}: AuthLayoutWrapperProps) {
  const { isAuthenticated, isLoading, error } = useAuthState();
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Handle authentication redirect
  useEffect(() => {
    if (isHydrated && !isLoading && isAuthenticated) {
      // Check if there's a redirect parameter in URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectParam = urlParams.get('redirect');

      // Redirect to specified URL or default dashboard
      const targetUrl = redirectParam || redirectTo;

      // Avoid infinite redirects by checking current path
      if (pathname !== targetUrl) {
        router.push(targetUrl);
      }
    }
  }, [isHydrated, isAuthenticated, isLoading, redirectTo, router, pathname]);

  // Handle retry authentication
  const handleRetry = () => {
    // Force re-authentication check
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  // Show loading state during SSR or while hydrating
  if (!isHydrated || (isLoading && showLoadingIndicator)) {
    return <AuthLoading message={loadingMessage} />;
  }

  // Show error state
  if (error && !isLoading) {
    return (
      <AuthErrorDisplay
        error={
          typeof error === 'string'
            ? error
            : (error as Error)?.message || 'Bilinmeyen bir hata oluştu'
        }
        onRetry={handleRetry}
        onGoHome={handleGoHome}
      />
    );
  }

  // Show children (login/register forms)
  return <>{children}</>;
}

// ================================================
// PROTECTED ROUTE COMPONENT
// ================================================

export function ProtectedRoute({
  children,
  requiredRole,
  unauthorizedRedirect = '/login',
  showUnauthorizedMessage = false,
  fallback,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, error } = useAuthState();
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication and role access
  useEffect(() => {
    if (!isLoading) {
      setAuthChecked(true);

      // Not authenticated - redirect to login with return URL
      if (!isAuthenticated) {
        const loginUrl = new URL(unauthorizedRedirect, window.location.origin);
        loginUrl.searchParams.set('redirect', pathname);
        router.push(loginUrl.toString().replace(window.location.origin, ''));
        return;
      }

      // Authenticated but wrong role
      if (requiredRole && user?.role !== requiredRole) {
        if (showUnauthorizedMessage) {
          // Will show unauthorized component below
          return;
        }

        // Redirect based on user role
        const roleRedirects: Record<string, string> = {
          freelancer: '/dashboard/freelancer',
          client: '/dashboard/employer',
          admin: '/admin',
        };

        const redirectPath = user?.role
          ? roleRedirects[user.role]
          : '/dashboard';
        router.push(redirectPath);
        return;
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    requiredRole,
    router,
    pathname,
    unauthorizedRedirect,
    showUnauthorizedMessage,
  ]);

  // Show loading while checking auth
  if (isLoading || !authChecked) {
    return <AuthLoading message="Erişim yetkileri kontrol ediliyor..." />;
  }

  // Show error if authentication failed
  if (error) {
    return (
      <AuthErrorDisplay
        error="Kimlik doğrulama sırasında bir hata oluştu."
        onRetry={() => window.location.reload()}
        onGoHome={() => router.push('/')}
      />
    );
  }

  // Show unauthorized message if required
  if (
    isAuthenticated &&
    requiredRole &&
    user?.role !== requiredRole &&
    showUnauthorizedMessage
  ) {
    return fallback || <UnauthorizedAccess />;
  }

  // Show content if all checks pass
  if (isAuthenticated && (!requiredRole || user?.role === requiredRole)) {
    return <>{children}</>;
  }

  // Fallback loading state
  return <AuthLoading message="Yönlendiriliyor..." />;
}

// ================================================
// UTILITY HOOKS
// ================================================

/**
 * Hook for getting current authentication state
 */
export function useAuthLayoutState() {
  const authState = useAuthState();

  return {
    ...authState,
    isReady: !authState.isLoading,
    canAccess: (role?: string) => {
      if (!authState.isAuthenticated || !authState.user) return false;
      if (!role) return true;
      return authState.user.role === role;
    },
  };
}

/**
 * Hook for handling authentication redirects
 */
export function useAuthRedirect() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthState();

  const redirectToLogin = (returnUrl?: string) => {
    const loginUrl = new URL('/login', window.location.origin);
    if (returnUrl) {
      loginUrl.searchParams.set('redirect', returnUrl);
    }
    router.push(loginUrl.toString().replace(window.location.origin, ''));
  };

  const redirectToDashboard = () => {
    if (!user) return;

    const roleRedirects: Record<string, string> = {
      freelancer: '/dashboard/freelancer',
      client: '/dashboard/employer',
      admin: '/admin',
    };

    const redirectPath = roleRedirects[user?.role || ''] || '/dashboard';
    router.push(redirectPath);
  };

  return {
    redirectToLogin,
    redirectToDashboard,
    isAuthenticated,
    user,
  };
}
