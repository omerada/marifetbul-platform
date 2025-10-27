'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { useToast } from '@/hooks';
import { logger } from '@/lib/shared/utils/logger';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { user, isAuthenticated, login } = useAuthStore();
  const toast = useToast();

  // Sayfa yüklendiğinde eski cookie'leri ve localStorage'ı temizle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Eski cookie'leri temizle
      document.cookie =
        'marifetbul-user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie =
        'marifetbul_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      // LocalStorage'daki auth state'ini de temizle (eski session'ları temizlemek için)
      localStorage.removeItem('auth-storage');

      logger.debug(
        'Admin login: Cleared old cookies and localStorage to prevent redirect loop'
      );
    }
  }, []); // Sadece component mount olduğunda çalışır

  // Login sonrası yönlendirme kontrolü
  useEffect(() => {
    if (isAuthenticated && user) {
      logger.debug('Admin login: User authenticated', {
        role: user.role,
      });

      if (user.role?.toUpperCase() === 'ADMIN') {
        logger.debug('Admin login: Admin role confirmed, redirecting');
        // Loading state'ini kapat
        setIsLoading(false);

        // Set user role cookie for middleware
        if (typeof window !== 'undefined') {
          document.cookie = `marifetbul-user-role=${user.role}; path=/; SameSite=Lax; max-age=2592000`; // 30 days
          logger.debug('Admin login: User role cookie set');

          // Check if backend token cookie exists
          const hasBackendToken = document.cookie.includes('marifetbul_token');
          logger.debug('Admin login: Backend token cookie status', {
            hasBackendToken,
          });
        }

        // Hard redirect için window.location kullan - middleware ve client-side routing sorunlarını çözer
        setTimeout(() => {
          logger.debug('Admin login: Executing hard redirect to /admin');
          window.location.href = '/admin';
        }, 500); // Increased timeout to ensure cookies are set
      } else {
        logger.warn('Admin login: User is not admin', { role: user.role });
        setIsLoading(false);
        setError(
          'Admin yetkisine sahip değilsiniz. Lütfen admin hesabı ile giriş yapın.'
        );
      }
    }
  }, [isAuthenticated, user]);

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
      logger.debug('Admin login: Starting login process');
      await login({
        email: credentials.email,
        password: credentials.password,
      });

      logger.debug(
        'Admin login: Login successful, waiting for useEffect to handle redirect'
      );
      // Login başarılı, state güncellendi
      // useEffect otomatik olarak isLoading'i kapatacak ve yönlendirme yapacak
      toast.success('Admin paneline başarıyla giriş yapıldı');
    } catch (err) {
      logger.error('Admin login failed', { error: err });
      const errorMessage =
        err instanceof Error ? err.message : 'Giriş yapılırken bir hata oluştu';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false); // Hata durumunda loading'i kapat
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="mt-2 text-sm text-gray-600">
              MarifetBul yönetim paneline erişim
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-center text-xl font-semibold">
                Yönetici Girişi
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
                    Şifre
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={credentials.password}
                      onChange={handleInputChange}
                      placeholder="Yönetici şifrenizi girin"
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
                  {isLoading ? 'Giriş yapılıyor...' : 'Admin Paneline Giriş'}
                </Button>
              </form>

              {/* Development Environment Helper - Only visible in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <h4 className="text-sm font-medium text-amber-900">
                      Development Mode
                    </h4>
                  </div>
                  <p className="text-xs text-amber-700">
                    Bu yardımcı bilgiler yalnızca development ortamında görünür.
                    Production ortamında otomatik olarak gizlenir.
                  </p>
                  <div className="mt-3 space-y-2 text-xs text-amber-700">
                    <p className="font-medium">Test Admin Hesabı:</p>
                    <p>
                      E-posta:{' '}
                      <code className="rounded bg-amber-100 px-1 py-0.5">
                        admin@marifetbul.com
                      </code>
                    </p>
                    <p>
                      Şifre:{' '}
                      <code className="rounded bg-amber-100 px-1 py-0.5">
                        Admin123!
                      </code>
                    </p>
                  </div>
                  <div className="mt-3 border-t border-amber-200 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCredentials({
                          email: 'admin@marifetbul.com',
                          password: 'Admin123!',
                        })
                      }
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
                  Bu yönetici paneli güvenli bağlantı ile korunmaktadır.
                  <br />
                  Kimlik bilgilerinizi kimseyle paylaşmayın.
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
              ← Ana siteye dön
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
