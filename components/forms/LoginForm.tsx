'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';

import { Button, Input, Checkbox } from '@/components/ui';
import { useUnifiedAuthStore as useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { loginSchema, type LoginFormData } from '@/lib/core/validations/auth';
import { TwoFactorLoginModal } from '@/components/domains/auth/TwoFactorLoginModal';
import logger from '@/lib/infrastructure/monitoring/logger';

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState(''); // Store password for 2FA retry

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();

      // Store credentials for 2FA retry
      setUserEmail(data.email);
      setUserPassword(data.password);

      const response = await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      // Check if 2FA is required
      if (response?.twoFactorRequired) {
        logger.debug('[Login] 2FA required, showing modal');
        setShow2FAModal(true);
        return;
      }

      // Redirect to dashboard on successful login
      router.push('/dashboard');
    } catch {
      setError('root', {
        message: 'Giriş sırasında bir hata oluştu',
      });
    }
  };

  const handle2FAVerification = async (code: string) => {
    try {
      setIs2FALoading(true);
      logger.debug('[Login] Re-attempting login with 2FA code');

      // Re-attempt login with 2FA code
      const response = await login({
        email: userEmail,
        password: userPassword,
        rememberMe: true,
        twoFactorCode: code, // Include 2FA code
      });

      if (response?.success !== false) {
        logger.info('[Login] 2FA verification successful');
        setShow2FAModal(false);

        // Clear stored password from memory
        setUserPassword('');

        router.push('/dashboard');
      } else {
        throw new Error(response?.message || '2FA verification failed');
      }
    } catch (err) {
      logger.error(
        '[Login] 2FA verification failed',
        err instanceof Error ? err : new Error(String(err))
      );
      throw err; // Let modal handle the error
    } finally {
      setIs2FALoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Hesabına Giriş Yap
        </h1>
        <p className="text-gray-600">
          MarifetBul hesabına giriş yaparak devam et
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Input */}
        <Input
          label="E-posta Adresi"
          type="email"
          placeholder="ornek@email.com"
          error={errors.email?.message}
          {...register('email')}
          fullWidth
        />

        {/* Password Input */}
        <div className="space-y-1">
          <Input
            label="Şifre"
            type={showPassword ? 'text' : 'password'}
            placeholder="Şifrenizi giriniz"
            error={errors.password?.message}
            {...register('password')}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            fullWidth
          />
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Şifremi Unuttum
            </Link>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <Checkbox
          {...register('rememberMe')}
          label="Beni hatırla"
          description="Bir sonraki sefere otomatik giriş yap"
        />

        {/* Error Message */}
        {(error || errors.root) && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">
              {error || errors.root?.message}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" loading={isLoading} fullWidth size="lg">
          Giriş Yap
        </Button>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Hesabın yok mu?{' '}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Ücretsiz Üye Ol
            </Link>
          </p>
        </div>
      </form>

      {/* 2FA Verification Modal */}
      <TwoFactorLoginModal
        isOpen={show2FAModal}
        onSuccess={handle2FAVerification}
        onClose={() => setShow2FAModal(false)}
        isLoading={is2FALoading}
        userEmail={userEmail}
      />
    </div>
  );
}
