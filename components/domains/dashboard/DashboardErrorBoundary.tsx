/**
 * Dashboard Error Boundary
 * Catches and handles errors in dashboard components
 * Sprint 1 - Epic 1.3: Error Boundaries
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui';
import { Alert } from '@/components/ui';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service
    logger.error('Dashboard Error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // You can also log to an error reporting service here
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  override render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
          <Card className="w-full max-w-2xl p-8">
            <div className="space-y-6 text-center">
              {/* Error Icon */}
              <div className="flex justify-center">
                <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/20">
                  <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
                </div>
              </div>

              {/* Error Message */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Bir Hata Oluştu
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Dashboard yüklenirken beklenmeyen bir hata oluştu. Lütfen
                  sayfayı yenilemeyi deneyin.
                </p>
              </div>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert variant="destructive" className="text-left">
                  <div className="space-y-2">
                    <p className="font-semibold">Hata Detayları:</p>
                    <p className="font-mono text-sm">
                      {this.state.error.message}
                    </p>
                    {this.state.errorInfo && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-semibold">
                          Component Stack
                        </summary>
                        <pre className="mt-2 max-h-40 overflow-auto text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <UnifiedButton
                  onClick={this.handleReset}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tekrar Dene
                </UnifiedButton>
                <UnifiedButton
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Ana Sayfaya Dön
                </UnifiedButton>
              </div>

              {/* Help Text */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sorun devam ederse, lütfen{' '}
                <a
                  href="/support"
                  className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  destek ekibimizle
                </a>{' '}
                iletişime geçin.
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional wrapper for easier usage
 */
export function withDashboardErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <DashboardErrorBoundary fallback={fallback}>
        <Component {...props} />
      </DashboardErrorBoundary>
    );
  };
}

/**
 * Compact error display for smaller contexts
 */
export function DashboardErrorCompact({
  error,
  onRetry,
}: {
  error: Error;
  onRetry?: () => void;
}) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <div className="ml-2 flex-1">
        <p className="font-semibold">Dashboard yüklenemedi</p>
        <p className="mt-1 text-sm">{error.message}</p>
        {onRetry && (
          <UnifiedButton
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Tekrar Dene
          </UnifiedButton>
        )}
      </div>
    </Alert>
  );
}
