'use client';

import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  description?: string;
}

export function ErrorFallback({
  error,
  resetError,
  title = 'Bir hata oluştu',
  description = 'Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.',
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>

      <h2 className="mb-2 text-xl font-semibold text-gray-900">{title}</h2>

      <p className="mb-6 max-w-md text-gray-600">{description}</p>

      {error && process.env.NODE_ENV === 'development' && (
        <details className="mb-6 max-w-lg rounded-lg border border-red-200 bg-red-50 p-4 text-left">
          <summary className="cursor-pointer font-medium text-red-800">
            Hata Detayları (Geliştirici Modu)
          </summary>
          <pre className="mt-2 text-xs whitespace-pre-wrap text-red-700">
            {error.message}
            {error.stack && '\n\nStack Trace:\n' + error.stack}
          </pre>
        </details>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        {resetError && (
          <Button onClick={resetError} variant="primary">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Tekrar Dene
          </Button>
        )}

        <Button onClick={() => window.location.reload()} variant="outline">
          Sayfayı Yenile
        </Button>
      </div>
    </div>
  );
}
