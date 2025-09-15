import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

// ================================================
// ERROR STATE COMPONENT
// ================================================

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
  variant?: 'default' | 'minimal' | 'full';
  showHomeButton?: boolean;
}

export function ErrorState({
  title = 'Bir hata oluştu',
  message = 'İşlem sırasında bir sorun meydana geldi. Lütfen tekrar deneyin.',
  error,
  onRetry,
  onGoHome,
  className,
  variant = 'default',
  showHomeButton = true,
}: ErrorStateProps) {
  if (variant === 'minimal') {
    return (
      <div
        className={cn('text-muted-foreground text-center text-sm', className)}
      >
        <p>{message}</p>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="mt-2">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tekrar Dene
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-4 p-8 text-center',
        variant === 'full' ? 'min-h-[400px]' : 'py-12',
        className
      )}
    >
      <div className="rounded-full bg-red-100 p-3">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="max-w-md text-sm text-gray-600">{message}</p>
        {error && (
          <details className="mt-4">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
              Teknik detaylar
            </summary>
            <pre className="mt-2 max-w-md overflow-auto rounded bg-gray-50 p-2 text-left text-xs text-gray-400">
              {error}
            </pre>
          </details>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {onRetry && (
          <Button onClick={onRetry} variant="primary">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tekrar Dene
          </Button>
        )}

        {showHomeButton && onGoHome && (
          <Button onClick={onGoHome} variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Ana Sayfaya Dön
          </Button>
        )}
      </div>
    </div>
  );
}

// Preset error states
export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Bağlantı sorunu"
      message="İnternet bağlantınızı kontrol edin ve tekrar deneyin."
      onRetry={onRetry}
    />
  );
}

export function NotFoundErrorState({ onGoHome }: { onGoHome?: () => void }) {
  return (
    <ErrorState
      title="Sayfa bulunamadı"
      message="Aradığınız sayfa mevcut değil veya taşınmış olabilir."
      onGoHome={onGoHome}
      showHomeButton={true}
    />
  );
}

export function UnauthorizedErrorState({
  onGoHome,
}: {
  onGoHome?: () => void;
}) {
  return (
    <ErrorState
      title="Yetkisiz erişim"
      message="Bu sayfaya erişim yetkiniz bulunmuyor."
      onGoHome={onGoHome}
      showHomeButton={true}
    />
  );
}
