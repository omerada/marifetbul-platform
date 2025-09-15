'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuth } from '@/hooks';
import { useToast } from '@/hooks';
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
  const { user, isAuthenticated, login } = useAuth();
  const toast = useToast();

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        // Non-admin user tried to access admin area
        setError(
          'Admin yetkisine sahip değilsiniz. Lütfen admin hesabı ile giriş yapın.'
        );
      }
    }
  }, [isAuthenticated, user, router]);

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
      // Use regular login flow which will check via API
      await login({
        email: credentials.email,
        password: credentials.password,
      });

      toast.success('Admin paneline başarıyla giriş yapıldı');
      // Don't redirect here, let useEffect handle it after user is set
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Giriş yapılırken bir hata oluştu';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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
              Marifeto yönetim paneline erişim
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
                    placeholder="admin@marifeto.com"
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

              {/* Demo Credentials */}
              <div className="mt-6 rounded-lg bg-blue-50 p-4">
                <h4 className="mb-2 text-sm font-medium text-blue-900">
                  Demo Kimlik Bilgileri:
                </h4>
                <div className="space-y-1 text-xs text-blue-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Admin:</span>
                    <span>admin@marifeto.com / admin123</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Freelancer:</span>
                    <span>demo@example.com / demo123</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Employer:</span>
                    <span>employer@example.com / employer123</span>
                  </div>
                </div>
                <div className="mt-2 border-t border-blue-200 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCredentials({
                        email: 'admin@marifeto.com',
                        password: 'admin123',
                      })
                    }
                    className="text-xs text-blue-600 underline hover:text-blue-800"
                  >
                    Admin bilgilerini doldur
                  </button>
                </div>
              </div>

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
