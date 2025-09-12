'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw, Home, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  enableReporting?: boolean;
  resetOnPropsChange?: boolean;
  level?: 'page' | 'component' | 'global';
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
  eventId: string | null;
  level: 'page' | 'component' | 'global';
  showDetails?: boolean;
  enableReporting?: boolean;
}

type ComponentType<P = Record<string, unknown>> = React.ComponentType<P>;

// Main Error Boundary Class
export class ErrorBoundaryFallback extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique event ID for error tracking
    const eventId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      eventId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Report to error tracking service (e.g., Sentry)
    if (this.props.enableReporting && process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, children } = this.props;
    const { hasError } = this.state;

    // Auto-reset when props change (useful for route changes)
    if (hasError && prevProps.children !== children && resetOnPropsChange) {
      this.resetError();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Here you would integrate with your error reporting service
    // For example: Sentry, LogRocket, Bugsnag, etc.
    try {
      // Log error details in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error Boundary Details:', { error, errorInfo });
      }

      // Example Sentry integration:
      // Sentry.withScope((scope) => {
      //   scope.setTag('component', 'ErrorBoundary');
      //   scope.setLevel('error');
      //   scope.setContext('errorInfo', errorInfo);
      //   scope.setContext('errorBoundary', {
      //     level: this.props.level,
      //   });
      //   Sentry.captureException(error);
      // });

      console.warn('Error reporting not configured. Error:', error);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  handleRetry = () => {
    this.resetError();
    // Trigger a re-render of the component tree
    this.forceUpdate();
  };

  render() {
    const { hasError, error, errorInfo, eventId } = this.state;
    const {
      children,
      fallback: CustomFallback,
      level = 'component',
      showDetails = false,
      enableReporting = false,
    } = this.props;

    if (hasError) {
      const fallbackProps: ErrorFallbackProps = {
        error,
        errorInfo,
        resetError: this.resetError,
        eventId,
        level,
        showDetails,
        enableReporting,
      };

      // Use custom fallback if provided
      if (CustomFallback) {
        return <CustomFallback {...fallbackProps} />;
      }

      // Use default fallback based on level
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

// Global Error Fallback (Full page error)
function GlobalErrorFallback({
  error,
  resetError,
  eventId,
  showDetails,
  enableReporting,
}: ErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  const handleReportError = () => {
    // This could open a modal or redirect to a feedback form
    const errorDetails = {
      message: error?.message,
      stack: error?.stack,
      eventId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    console.log('Error details to report:', errorDetails);
    // You could integrate with a feedback system here
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <h1 className="mb-2 text-xl font-semibold text-gray-900">
          Beklenmeyen Bir Hata Oluştu
        </h1>

        <p className="mb-6 text-gray-600">
          Üzgünüz, bir şeyler ters gitti. Lütfen sayfayı yenileyin veya daha
          sonra tekrar deneyin.
        </p>

        {showDetails && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Teknik Detaylar
            </summary>
            <div className="mt-2 max-h-32 overflow-auto rounded border bg-gray-100 p-3 text-xs">
              <div className="font-mono break-all">{error.message}</div>
              {eventId && (
                <div className="mt-2 text-gray-500">Hata ID: {eventId}</div>
              )}
            </div>
          </details>
        )}

        <div className="space-y-3">
          <Button onClick={handleReload} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sayfayı Yenile
          </Button>

          <Button variant="outline" onClick={resetError} className="w-full">
            <Home className="mr-2 h-4 w-4" />
            Ana Sayfaya Dön
          </Button>

          {enableReporting && (
            <Button
              variant="ghost"
              onClick={handleReportError}
              className="w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              Hatayı Bildir
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

// Page Error Fallback (Page level error)
function PageErrorFallback({
  error,
  resetError,
  eventId,
  showDetails,
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-96 items-center justify-center p-8">
      <Card className="w-full max-w-lg p-6 text-center">
        <div className="mb-4">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        </div>

        <h2 className="mb-2 text-lg font-semibold text-gray-900">
          Sayfa Yüklenemedi
        </h2>

        <p className="mb-4 text-gray-600">
          Bu sayfayı yüklerken bir hata oluştu. Lütfen tekrar deneyin.
        </p>

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
          <Button onClick={resetError} variant="primary" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tekrar Dene
          </Button>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="sm"
          >
            Geri Dön
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Component Error Fallback (Component level error)
function ComponentErrorFallback({
  error,
  resetError,
  showDetails,
}: ErrorFallbackProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start">
        <AlertCircle className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-red-400" />
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

          <div className="mt-3">
            <Button
              onClick={resetError}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Tekrar Dene
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundaryFallback {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundaryFallback>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Provider for global error handling configuration
interface ErrorBoundaryConfigContextType {
  showDetails: boolean;
  enableReporting: boolean;
  level: 'page' | 'component' | 'global';
}

const ErrorBoundaryConfigContext =
  React.createContext<ErrorBoundaryConfigContextType>({
    showDetails: process.env.NODE_ENV === 'development',
    enableReporting: process.env.NODE_ENV === 'production',
    level: 'component',
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
