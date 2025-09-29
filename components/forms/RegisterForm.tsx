'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, User, Building } from 'lucide-react';

import { Button, Input, Card } from '@/components/ui';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import {
  registerSchema,
  type RegisterFormData,
} from '@/lib/core/validations/auth';

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register: registerUser,
    isLoading,
    error,
    clearError,
  } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const defaultUserType = searchParams.get('type') as
    | 'freelancer'
    | 'employer'
    | null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: defaultUserType || 'freelancer',
    },
  });

  const watchedUserType = watch('userType');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        userType: data.userType,
      });

      // Redirect to dashboard on successful registration
      router.push('/dashboard');
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Ücretsiz Hesap Oluştur
        </h1>
        <p className="text-gray-600">
          MarifetBul&apos;ya katılarak hemen başlayın
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* User Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Hesap Türü
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Card
              padding="sm"
              className={`cursor-pointer border-2 transition-colors ${
                watchedUserType === 'freelancer'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setValue('userType', 'freelancer')}
            >
              <div className="text-center">
                <User
                  className={`mx-auto mb-2 h-6 w-6 ${
                    watchedUserType === 'freelancer'
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`}
                />
                <div
                  className={`text-sm font-medium ${
                    watchedUserType === 'freelancer'
                      ? 'text-blue-900'
                      : 'text-gray-900'
                  }`}
                >
                  Freelancer
                </div>
                <div className="mt-1 text-xs text-gray-500">Hizmet sat</div>
              </div>
            </Card>

            <Card
              padding="sm"
              className={`cursor-pointer border-2 transition-colors ${
                watchedUserType === 'employer'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setValue('userType', 'employer')}
            >
              <div className="text-center">
                <Building
                  className={`mx-auto mb-2 h-6 w-6 ${
                    watchedUserType === 'employer'
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`}
                />
                <div
                  className={`text-sm font-medium ${
                    watchedUserType === 'employer'
                      ? 'text-blue-900'
                      : 'text-gray-900'
                  }`}
                >
                  İşveren
                </div>
                <div className="mt-1 text-xs text-gray-500">Hizmet al</div>
              </div>
            </Card>
          </div>
          <input type="hidden" {...register('userType')} />
          {errors.userType && (
            <p className="text-sm text-red-600">{errors.userType.message}</p>
          )}
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ad"
            placeholder="Adınız"
            error={errors.firstName?.message}
            {...register('firstName')}
            fullWidth
          />
          <Input
            label="Soyad"
            placeholder="Soyadınız"
            error={errors.lastName?.message}
            {...register('lastName')}
            fullWidth
          />
        </div>

        {/* Email Input */}
        <Input
          label="E-posta Adresi"
          type="email"
          placeholder="ornek@email.com"
          error={errors.email?.message}
          {...register('email')}
          fullWidth
        />

        {/* Password Fields */}
        <div className="space-y-4">
          <Input
            label="Şifre"
            type={showPassword ? 'text' : 'password'}
            placeholder="En az 6 karakter"
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

          <Input
            label="Şifre Onayı"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Şifrenizi tekrar giriniz"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            fullWidth
          />
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="agreeToTerms"
            {...register('agreeToTerms')}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
              Kullanım Şartları
            </Link>
            &apos;nı ve{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
              Gizlilik Politikası
            </Link>
            &apos;nı okudum, kabul ediyorum.
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" loading={isLoading} fullWidth size="lg">
          Hesap Oluştur
        </Button>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Zaten hesabın var mı?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Giriş Yap
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
