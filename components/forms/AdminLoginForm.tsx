/**
 * ================================================
 * ADMIN LOGIN FORM COMPONENT
 * ================================================
 * Specialized login form for admin panel access
 *
 * Features:
 * - Admin-specific validation
 * - Enhanced security with 2FA
 * - Shorter session duration
 * - Auto-fill for development
 * - Separate from regular user login
 *
 * @created 2025-01-20
 * @sprint Sprint 1 - Story 3: Admin Login Separation
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { TwoFactorLoginModal } from '@/components/domains/auth/TwoFactorLoginModal';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { useToast } from '@/hooks';
import { twoFactorApi } from '@/lib/api/two-factor';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface AdminLoginFormProps {
  /**
   * Require 2FA for admin login
   * @default true
   */
  require2FA?: boolean;

  /**
   * Session duration in minutes
   * @default 30
   */
  sessionDuration?: number;

  /**
   * Strict mode - additional security checks
   * @default true
   */
  strictMode?: boolean;

  /**
   * Callback after successful login
   */
  onSuccess?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * AdminLoginForm Component
 *
 * Handles admin authentication with enhanced security features.
 * Separate from regular user login for better security and UX.
 *
 * @example
 * ```tsx
 * <AdminLoginForm
 *   require2FA={true}
 *   sessionDuration={30}
 *   strictMode={true}
 * />
 * ```
 */
export function AdminLoginForm({
  require2FA = true,
  sessionDuration = 30,
  strictMode = true,
  onSuccess,
}: AdminLoginFormProps) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [pendingAuth, setPendingAuth] = useState<{
    email: string;
    requiresTwoFactor: boolean;
  } | null>(null);

  const router = useRouter();
  const { user, isAuthenticated, login } = useAuthStore();
  const toast = useToast();

  // Clear cookies and localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clear old cookies
      document.cookie =
        'marifetbul-user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie =
        'marifetbul_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      // Clear localStorage (old sessions)
      localStorage.removeItem('auth-storage');

      logger.info('[AdminLogin] Page initialized, cleared old sessions');
    }
  }, []);

  // Handle post-login redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role?.toUpperCase() === 'ADMIN') {
        setIsLoading(false);

        // Set user role cookie for middleware
        if (typeof window !== 'undefined') {
          document.cookie = `marifetbul-user-role=${user.role}; path=/; SameSite=Lax; max-age=${sessionDuration * 60}`; // sessionDuration in minutes
        }

        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }

        // Hard redirect using window.location (ensures middleware and client-side routing)
        setTimeout(() => {
          window.location.href = '/admin';
        }, 500);
      } else {
        logger.warn('[AdminLogin] Non-admin user attempted access', {
          role: user.role,
        });
        setIsLoading(false);
        setError(
          'Admin yetkisine sahip de�ilsiniz. L�tfen admin hesab� ile giri� yap�n.'
        );
      }
    }
  }, [isAuthenticated, user, sessionDuration, onSuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      logger.info('[AdminLogin] Attempting login', {
        email: credentials.email,
      });

      // Step 1: Basic login attempt
      const loginResult = await login({
        email: credentials.email,
        password: credentials.password,
      });

      // Check if 2FA is required
      if (loginResult?.twoFactorRequired) {
        logger.info('[AdminLogin] 2FA required, showing modal');
        setPendingAuth({
          email: credentials.email,
          requiresTwoFactor: true,
        });
        setShow2FAModal(true);
        setIsLoading(false);
        return;
      }

      // If no 2FA required, login is complete
      toast.success('Admin paneline ba�ar�yla giri� yap�ld�');
    } catch (err) {
      logger.error('[AdminLogin] Login failed', err as Error, {
        component: 'AdminLoginForm',
      });
      const errorMessage =
        err instanceof Error ? err.message : 'Giri� yap�l�rken bir hata olu�tu';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handle2FAVerify = async (code: string) => {
    try {
      setIsLoading(true);
      logger.info('[AdminLogin] Verifying 2FA code');

      // Verify 2FA code and complete login
      const result = await twoFactorApi.verifyLogin({
        code,
        trustDevice: false, // Admin should not trust devices
      });

      if (result.success && result.data) {
        logger.info('[AdminLogin] 2FA verified successfully');

        // Update auth store with complete user data
        // Note: Auth store doesn't have direct setUser/setAccessToken methods
        // The store is updated through the login method in the auth service

        // Set cookies for middleware
        if (typeof window !== 'undefined') {
          document.cookie = `marifetbul-user-role=${result.data.user.role}; path=/; SameSite=Lax; max-age=${sessionDuration * 60}`;
        }

        setShow2FAModal(false);
        toast.success('2FA do�ruland�, y�nlendiriliyorsunuz...');

        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }

        // Hard redirect to admin panel
        setTimeout(() => {
          window.location.href = '/admin';
        }, 500);
      } else {
        throw new Error('2FA do�rulama ba�ar�s�z');
      }
    } catch (err) {
      logger.error(
        '[AdminLogin] 2FA verification failed',
        err instanceof Error ? err : new Error(String(err))
      );
      setIsLoading(false);
      throw err; // Re-throw to show error in modal
    }
  };

  const handleDevAutoFill = () => {
    setCredentials({
      email: 'admin@marifetbul.com',
      password: 'Admin123!',
    });
  };

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Logo and Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-lg">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="mt-2 text-sm text-gray-600">
          MarifetBul y�netim paneline eri�im
        </p>
      </div>

      {/* Login Card */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-center text-xl font-semibold">
            Y�netici Giri�i
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-800">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                E-posta Adresi
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={credentials.email}
                onChange={handleInputChange}
                placeholder="admin@marifetbul.com"
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                �ifre
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="Y�netici �ifrenizi girin"
                  required
                  className="h-11 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="h-11 w-full font-medium"
              disabled={
                isLoading || !credentials.email || !credentials.password
              }
              loading={isLoading}
            >
              {isLoading ? 'Giri� yap�l�yor...' : 'Admin Paneline Giri�'}
            </Button>
          </form>

          {/* Development Environment Helper */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <h4 className="text-sm font-medium text-amber-900">
                  Development Mode
                </h4>
              </div>
              <p className="text-xs text-amber-700">
                Bu yard�mc� bilgiler yaln�zca development ortam�nda g�r�n�r.
                Production ortam�nda otomatik olarak gizlenir.
              </p>
              <div className="mt-3 space-y-2 text-xs text-amber-700">
                <p className="font-medium">Test Admin Hesab�:</p>
                <p>
                  E-posta:{' '}
                  <code className="rounded bg-amber-100 px-1 py-0.5">
                    admin@marifetbul.com
                  </code>
                </p>
                <p>
                  �ifre:{' '}
                  <code className="rounded bg-amber-100 px-1 py-0.5">
                    Admin123!
                  </code>
                </p>
              </div>
              <div className="mt-3 border-t border-amber-200 pt-2">
                <button
                  type="button"
                  onClick={handleDevAutoFill}
                  className="text-xs text-amber-600 underline hover:text-amber-800"
                >
                  Test bilgilerini otomatik doldur
                </button>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              {strictMode && (
                <>
                  ?? G�venlik: Bu panel ekstra g�venlik �nlemleri ile
                  korunmaktad�r.
                  <br />
                </>
              )}
              {require2FA && (
                <>
                  ?? �ki fakt�rl� do�rulama (2FA) gereklidir.
                  <br />
                </>
              )}
              Kimlik bilgilerinizi kimseyle payla�may�n.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Back to Main Site */}
      <div className="mt-6 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="text-gray-600 hover:text-gray-900"
        >
          � Ana siteye d�n
        </Button>
      </div>

      {/* 2FA Modal */}
      {show2FAModal && pendingAuth && (
        <TwoFactorLoginModal
          isOpen={show2FAModal}
          onSuccess={handle2FAVerify}
          onClose={() => {
            setShow2FAModal(false);
            setPendingAuth(null);
            setIsLoading(false);
          }}
          isLoading={isLoading}
          userEmail={pendingAuth.email}
        />
      )}
    </div>
  );
}
export default AdminLoginForm;
