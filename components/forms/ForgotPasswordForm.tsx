'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

import { Button, Input } from '@/components/ui';
import { AuthService } from '@/lib/infrastructure/services/api/authService';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/lib/core/validations/auth';

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError('');

      const success = await AuthService.requestPasswordReset(data.email);

      if (success) {
        setIsSuccess(true);
      } else {
        setError(
          'Şifre sıfırlama isteği gönderilemedi. Lütfen tekrar deneyin.'
        );
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

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
            E-posta Gönderildi
          </h2>

          <p className="mb-4 text-gray-600">
            <span className="font-medium">{getValues('email')}</span> adresine
            şifre sıfırlama bağlantısı gönderdik. Lütfen e-postanızı kontrol
            edin.
          </p>

          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              E-postayı görmüyorsanız spam/önemsiz klasörünü kontrol edin.
            </p>

            <Link
              href="/login"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Giriş sayfasına dön
        </Link>
      </div>

      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-blue-100 p-3">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Şifremi Unuttum
        </h1>
        <p className="text-gray-600">
          E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
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
          leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
          fullWidth
          autoFocus
        />

        {/* Error Message */}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Info Message */}
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-700">
            Kayıtlı e-posta adresinize şifre sıfırlama bağlantısı
            gönderilecektir. Bağlantı 1 saat geçerli olacaktır.
          </p>
        </div>

        {/* Submit Button */}
        <Button type="submit" loading={isLoading} fullWidth size="lg">
          Şifre Sıfırlama Bağlantısı Gönder
        </Button>

        {/* Additional Links */}
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
