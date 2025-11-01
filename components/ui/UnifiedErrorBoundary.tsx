/* eslint-disable no-console */
'use client';

import React, { Component, ReactNode, ErrorInfo, ComponentType } from 'react';
import { AlertCircle, RefreshCw, Home, Send, Bug } from 'lucide-react';
import { UnifiedButton } from './UnifiedButton';
import { Card } from './Card';
import { logger } from '@/lib/shared/utils/logger';

// ================================================
// UNIFIED ERROR BOUNDARY SYSTEM - PRODUCTION READY
// ================================================
// Single error boundary system to replace all duplicate implementations
// Replaces: ErrorBoundaryFallback, AdminErrorBoundary

// Error boundary state
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
  retryCount: number;
}

// Error boundary props
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo, eventId: string) => void;
  level?: 'global' | 'page' | 'component';
  showDetails?: boolean;
  enableReporting?: boolean;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

// Error fallback props
interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
  retry: () => void;
  eventId: string | null;
  level: 'global' | 'page' | 'component';
  showDetails?: boolean;
  enableReporting?: boolean;
  retryCount: number;
  maxRetries: number;
}

// Error types for better categorization
type ErrorCategory =
  | 'network'
  | 'validation'
  | 'permission'
  | 'not-found'
  | 'server'
  | 'unknown';

// ================================================
// MAIN ERROR BOUNDARY CLASS
// ================================================
export class UnifiedErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique event ID for error tracking
    const eventId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      eventId,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, enableReporting = true } = this.props;
    const { eventId } = this.state;

    this.setState({ errorInfo });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      logger.error('Error:', error);
      logger.error('Error Info:', errorInfo);
      logger.error('Event ID:', eventId);
      console.groupEnd();
    }

    // Call custom error handler
    if (onError && eventId) {
      onError(error, errorInfo, eventId);
    }

    // Report to error tracking service in production
    if (enableReporting && process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo, eventId);
    }
  }

  override componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error state when specific props change
    if (hasError && resetOnPropsChange && resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, idx) => prevProps.resetKeys?.[idx] !== key
      );

      if (hasResetKeyChanged) {
        this.resetError();
      }
    }
  }

  override componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private reportError = async (
    error: Error,
    errorInfo: ErrorInfo,
    eventId: string | null
  ) => {
    try {
      // In a real application, this would send to your error tracking service
      // e.g., Sentry, LogRocket, Bugsnag, etc.

      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        eventId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        level: this.props.level || 'component',
      };

      // Example API call (replace with your error reporting service)
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      });
    } catch (reportingError) {
      logger.error('Failed to report error:', reportingError);
    }
  };

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      retryCount: 0,
    });
  };

  private retryWithDelay = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      return;
    }

    this.setState((prevState) => ({
      retryCount: prevState.retryCount + 1,
    }));

    // Exponential backoff for retries
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);

    this.retryTimeoutId = window.setTimeout(() => {
      this.resetError();
    }, delay);
  };

  override render() {
    const { hasError, error, errorInfo, eventId, retryCount } = this.state;
    const {
      children,
      fallback: CustomFallback,
      level = 'component',
      showDetails = process.env.NODE_ENV === 'development',
      enableReporting = process.env.NODE_ENV === 'production',
      maxRetries = 3,
    } = this.props;

    if (hasError && error) {
      const fallbackProps: ErrorFallbackProps = {
        error,
        errorInfo,
        resetError: this.resetError,
        retry: this.retryWithDelay,
        eventId,
        level,
        showDetails,
        enableReporting,
        retryCount,
        maxRetries,
      };

      if (CustomFallback) {
        return <CustomFallback {...fallbackProps} />;
      }

      // Default fallback based on level
      switch (level) {
        case 'global':
          return <GlobalErrorFallback {...fallbackProps} />;
        case 'page':
          return <PageErrorFallback {...fallbackProps} />;
        case 'component':
        default:
          return <ComponentErrorFallback {...fallbackProps} />;
      }
    }

    return children;
  }
}

// ================================================
// ERROR FALLBACK COMPONENTS
// ================================================

// Categorize error for better UX
function categorizeError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();

  if (message.includes('network') || message.includes('fetch'))
    return 'network';
  if (message.includes('validation') || message.includes('invalid'))
    return 'validation';
  if (message.includes('permission') || message.includes('unauthorized'))
    return 'permission';
  if (message.includes('not found') || message.includes('404'))
    return 'not-found';
  if (message.includes('server') || message.includes('500')) return 'server';

  return 'unknown';
}

// Get user-friendly error message
function getUserFriendlyMessage(error: Error, category: ErrorCategory): string {
  switch (category) {
    case 'network':
      return 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
    case 'validation':
      return 'Girdiğiniz bilgilerde bir hata var. Lütfen kontrol edin.';
    case 'permission':
      return 'Bu işlem için yetkiniz bulunmamaktadır.';
    case 'not-found':
      return 'Aradığınız sayfa veya içerik bulunamadı.';
    case 'server':
      return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
    default:
      return 'Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.';
  }
}

// Global Error Fallback (Full page error)
function GlobalErrorFallback({
  error,
  resetError,
  retry,
  eventId,
  showDetails,
  enableReporting,
  retryCount,
  maxRetries,
}: ErrorFallbackProps) {
  const category = error ? categorizeError(error) : 'unknown';
  const userMessage = error
    ? getUserFriendlyMessage(error, category)
    : 'Bilinmeyen hata';

  const handleReportError = () => {
    if (enableReporting && eventId) {
      // Copy error details to clipboard for easy reporting
      const errorDetails = `Hata ID: ${eventId}\nHata: ${error?.message}\nZaman: ${new Date().toLocaleString()}`;
      navigator.clipboard.writeText(errorDetails);

      // In a real app, this might open a support form or email
      alert(
        'Hata detayları panoya kopyalandı. Destek ekibiyle paylaşabilirsiniz.'
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
        </div>

        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Bir Şeyler Ters Gitti
        </h1>

        <p className="mb-6 text-gray-600">{userMessage}</p>

        {showDetails && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-500">
              Teknik Detaylar
            </summary>
            <div className="mt-2 rounded bg-gray-50 p-3 text-xs text-gray-700">
              <div className="mb-2 font-mono">{error.message}</div>
              {eventId && (
                <div className="text-xs text-gray-500">ID: {eventId}</div>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <UnifiedButton
            onClick={resetError}
            variant="primary"
            className="flex-1"
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Tekrar Dene
          </UnifiedButton>

          {retryCount < maxRetries && (
            <UnifiedButton
              onClick={retry}
              variant="outline"
              className="flex-1"
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Otomatik Yenile ({maxRetries - retryCount})
            </UnifiedButton>
          )}

          <UnifiedButton
            onClick={() => (window.location.href = '/')}
            variant="ghost"
            className="flex-1"
            leftIcon={<Home className="h-4 w-4" />}
          >
            Ana Sayfa
          </UnifiedButton>
        </div>

        {enableReporting && (
          <UnifiedButton
            onClick={handleReportError}
            variant="ghost"
            size="sm"
            className="mt-4"
            leftIcon={<Send className="h-4 w-4" />}
          >
            Hatayı Bildir
          </UnifiedButton>
        )}
      </Card>
    </div>
  );
}

// Page Error Fallback (Page level error)
function PageErrorFallback({
  error,
  resetError,
  retry,
  eventId,
  showDetails,
  retryCount,
  maxRetries,
}: ErrorFallbackProps) {
  const category = error ? categorizeError(error) : 'unknown';
  const userMessage = error
    ? getUserFriendlyMessage(error, category)
    : 'Bilinmeyen hata';

  return (
    <div className="flex min-h-96 items-center justify-center p-8">
      <Card className="w-full max-w-lg p-6 text-center">
        <div className="mb-4">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        </div>

        <h2 className="mb-2 text-lg font-semibold text-gray-900">
          Sayfa Yüklenemedi
        </h2>

        <p className="mb-4 text-gray-600">{userMessage}</p>

        {showDetails && error && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              Hata Detayları
            </summary>
            <div className="mt-2 rounded bg-gray-50 p-2 text-xs text-gray-700">
              {error.message}
              {eventId && <div className="mt-1">ID: {eventId}</div>}
            </div>
          </details>
        )}

        <div className="flex gap-2">
          <UnifiedButton
            onClick={resetError}
            variant="primary"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Tekrar Dene
          </UnifiedButton>

          {retryCount < maxRetries && (
            <UnifiedButton
              onClick={retry}
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Otomatik ({maxRetries - retryCount})
            </UnifiedButton>
          )}

          <UnifiedButton
            onClick={() => window.history.back()}
            variant="ghost"
            size="sm"
          >
            Geri Dön
          </UnifiedButton>
        </div>
      </Card>
    </div>
  );
}

// Component Error Fallback (Component level error)
function ComponentErrorFallback({
  error,
  resetError,
  retry,
  showDetails,
  retryCount,
  maxRetries,
}: ErrorFallbackProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start">
        <Bug className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-red-400" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">Bileşen Hatası</h3>
          <p className="mt-1 text-sm text-red-700">
            Bu bileşen yüklenirken bir hata oluştu.
          </p>

          {showDetails && error && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-red-600">
                Detayları Göster
              </summary>
              <div className="mt-1 font-mono text-xs text-red-600">
                {error.message}
              </div>
            </details>
          )}

          <div className="mt-3 flex gap-2">
            <UnifiedButton
              onClick={resetError}
              variant="outline"
              size="xs"
              className="border-red-300 text-red-700 hover:bg-red-100"
              leftIcon={<RefreshCw className="h-3 w-3" />}
            >
              Tekrar Dene
            </UnifiedButton>

            {retryCount < maxRetries && (
              <UnifiedButton
                onClick={retry}
                variant="ghost"
                size="xs"
                className="text-red-600 hover:bg-red-100"
              >
                Otomatik ({maxRetries - retryCount})
              </UnifiedButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================
// HOOKS AND UTILITIES
// ================================================

// Hook for using error boundary programmatically
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const throwError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  // Throw error to be caught by error boundary
  if (error) {
    throw error;
  }

  return { throwError, clearError };
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <UnifiedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </UnifiedErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Error boundary configuration context
interface ErrorBoundaryConfigContextType {
  showDetails: boolean;
  enableReporting: boolean;
  level: 'page' | 'component' | 'global';
  maxRetries: number;
}

const ErrorBoundaryConfigContext =
  React.createContext<ErrorBoundaryConfigContextType>({
    showDetails: process.env.NODE_ENV === 'development',
    enableReporting: process.env.NODE_ENV === 'production',
    level: 'component',
    maxRetries: 3,
  });

export function ErrorBoundaryConfigProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: Partial<ErrorBoundaryConfigContextType>;
}) {
  const value: ErrorBoundaryConfigContextType = {
    showDetails: process.env.NODE_ENV === 'development',
    enableReporting: process.env.NODE_ENV === 'production',
    level: 'component',
    maxRetries: 3,
    ...config,
  };

  return (
    <ErrorBoundaryConfigContext.Provider value={value}>
      {children}
    </ErrorBoundaryConfigContext.Provider>
  );
}

export function useErrorBoundaryConfig() {
  return React.useContext(ErrorBoundaryConfigContext);
}

// Default export
export default UnifiedErrorBoundary;
