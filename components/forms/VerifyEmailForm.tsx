'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui';
import { unifiedAuthService } from '@/lib/core/auth/unifiedAuthService';

type VerificationStatus = 'verifying' | 'success' | 'error' | 'missing-token';

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [error, setError] = useState<string>('');
  const [isResending, setIsResending] = useState(false);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setStatus('verifying');
      setError('');

      await unifiedAuthService.verifyEmail({ token: verificationToken });

      setStatus('success');
      toast.success('E-posta adresiniz başarıyla doğrulandı!');

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const errorMessage =
        error.message ||
        'E-posta doğrulama başarısız. Token geçersiz veya süresi dolmuş olabilir.';

      setStatus('error');
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (!token) {
      setStatus('missing-token');
      return;
    }

    verifyEmail(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleResendVerification = async () => {
    if (!token) return;

    try {
      setIsResending(true);
      setError('');

      // Extract email from token or use current user's email
      // Note: Backend endpoint requires authentication for resend
      await unifiedAuthService.resendVerificationEmail({ email: '' });

      toast.success('Doğrulama e-postası tekrar gönderildi');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const errorMessage =
        error.message ||
        'Doğrulama e-postası gönderilemedi. Lütfen tekrar deneyin.';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  // Missing Token State
  if (status === 'missing-token') {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Geçersiz Doğrulama Bağlantısı
          </h2>

          <p className="mb-4 text-gray-600">
            E-posta doğrulama bağlantısı geçersiz. Lütfen e-postanızdaki
            bağlantıyı kullandığınızdan emin olun.
          </p>

          <div className="space-y-3">
            <Link href="/dashboard">
              <Button fullWidth>Kontrol Paneline Git</Button>
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

  // Verifying State
  if (status === 'verifying') {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-blue-100 p-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          </div>

          <h2 className="mb-2 text-xl font-bold text-gray-900">
            E-posta Doğrulanıyor...
          </h2>

          <p className="text-gray-600">
            Lütfen bekleyin, e-posta adresiniz doğrulanıyor.
          </p>
        </div>
      </div>
    );
  }

  // Success State
  if (status === 'success') {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <h2 className="mb-2 text-xl font-bold text-gray-900">
            E-posta Doğrulandı!
          </h2>

          <p className="mb-4 text-gray-600">
            E-posta adresiniz başarıyla doğrulandı. Artık tüm özelliklere
            erişebilirsiniz. Kontrol paneline yönlendiriliyorsunuz...
          </p>

          <Link href="/dashboard">
            <Button fullWidth>Hemen Kontrol Paneline Git</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Error State
  if (status === 'error') {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Doğrulama Başarısız
          </h2>

          <p className="mb-4 text-gray-600">{error}</p>

          <div className="space-y-3">
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
              <p className="mb-2 text-sm font-medium text-blue-900">
                <Mail className="mb-1 inline h-4 w-4" /> Yeni Doğrulama
                E-postası
              </p>
              <p className="mb-3 text-sm text-blue-700">
                Token süresi dolmuş olabilir. Yeni bir doğrulama e-postası
                gönderebilirsiniz.
              </p>
              <Button
                onClick={handleResendVerification}
                loading={isResending}
                variant="outline"
                fullWidth
                size="sm"
              >
                Doğrulama E-postası Gönder
              </Button>
            </div>

            <Link href="/dashboard">
              <Button fullWidth variant="secondary">
                Kontrol Paneline Git
              </Button>
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

  return null;
}
