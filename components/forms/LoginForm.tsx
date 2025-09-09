'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';

import { Button, Input } from '@/components/ui';
import useAuthStore from '@/lib/store/auth';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

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
      await login(data.email, data.password);

      // Redirect to dashboard on successful login
      router.push('/dashboard');
    } catch {
      setError('root', {
        message: 'Giriş sırasında bir hata oluştu',
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Hesabına Giriş Yap
        </h1>
        <p className="text-gray-600">
          Marifeto hesabına giriş yaparak devam et
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
    </div>
  );
}
