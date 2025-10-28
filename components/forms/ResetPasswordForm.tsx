'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

import { Button, Input } from '@/components/ui';
import { AuthService } from '@/lib/infrastructure/services/api/authService';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/lib/core/validations/auth';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Geçersiz şifre sıfırlama bağlantısı');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const success = await AuthService.resetPassword(token, data.password);

      if (success) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(
          'Şifre sıfırlama başarısız. Bağlantı geçersiz veya süresi dolmuş olabilir.'
        );
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Token validation
  if (!token) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Geçersiz Bağlantı
          </h2>

          <p className="mb-4 text-gray-600">
            Şifre sıfırlama bağlantısı geçersiz. Lütfen yeni bir şifre sıfırlama
            talebi oluşturun.
          </p>

          <div className="space-y-3">
            <Link href="/forgot-password">
              <Button fullWidth>Şifre Sıfırlama Talebi Oluştur</Button>
            </Link>

            <Link
              href="/login"
              className="block text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Şifre Başarıyla Değiştirildi
          </h2>

          <p className="mb-4 text-gray-600">
            Şifreniz başarıyla güncellendi. Giriş sayfasına
            yönlendiriliyorsunuz...
          </p>

          <Link href="/login">
            <Button fullWidth>Hemen Giriş Yap</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-blue-100 p-3">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Yeni Şifre Belirle
        </h1>
        <p className="text-gray-600">Hesabınız için yeni bir şifre oluşturun</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Password Input */}
        <Input
          label="Yeni Şifre"
          type={showPassword ? 'text' : 'password'}
          placeholder="En az 8 karakter"
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
          autoFocus
        />

        {/* Confirm Password Input */}
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

        {/* Error Message */}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Password Requirements */}
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
          <p className="mb-2 text-sm font-medium text-gray-700">
            Şifre gereksinimleri:
          </p>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• En az 8 karakter uzunluğunda</li>
            <li>• En az bir büyük harf içermeli</li>
            <li>• En az bir küçük harf içermeli</li>
            <li>• En az bir rakam içermeli</li>
            <li>• En az bir özel karakter içermeli (@$!%*?&)</li>
          </ul>
        </div>

        {/* Submit Button */}
        <Button type="submit" loading={isLoading} fullWidth size="lg">
          Şifreyi Güncelle
        </Button>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Giriş sayfasına dön
          </Link>
        </div>
      </form>
    </div>
  );
}
