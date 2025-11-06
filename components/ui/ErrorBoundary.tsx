/**
 * ERROR BOUNDARY COMPONENT
 * ================================================
 * React Error Boundary for graceful error handling
 * Sprint EPIC 4 - Story 4.3: Error Boundaries Implementation
 *
 * Features:
 * - Catch React component errors
 * - Display fallback UI
 * - Error logging integration
 * - Recovery actions
 * - Development vs Production modes
 * - Page-level and section-level variants
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Fallback UI to render on error */
  fallback?:
    | ReactNode
    | ((error: Error, errorInfo: React.ErrorInfo) => ReactNode);
  /** Callback fired when error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Show reset button */
  showReset?: boolean;
  /** Custom reset action */
  onReset?: () => void;
  /** Boundary level for styling */
  level?: 'page' | 'section' | 'component';
  /** Custom error title */
  errorTitle?: string;
  /** Custom error message */
  errorMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// ============================================================================
// ERROR BOUNDARY CLASS
// ============================================================================

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to monitoring service
    logger.error(error.message, error);

    // Update state
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  override render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, errorInfo!);
        }
        return fallback;
      }

      // Use default fallback based on level
      return this.renderDefaultFallback();
    }

    return children;
  }

  renderDefaultFallback(): ReactNode {
    const { error } = this.state;
    const { level, showReset = true, errorTitle, errorMessage } = this.props;
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Page-level error (full screen)
    if (level === 'page') {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-100 p-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">
                  {errorTitle || 'Bir Hata Oluştu'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {errorMessage ||
                  'Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.'}
              </p>

              {isDevelopment && error && (
                <div className="rounded-lg bg-gray-100 p-4">
                  <p className="mb-2 text-sm font-semibold text-gray-700">
                    Geliştirici Bilgisi:
                  </p>
                  <pre className="overflow-x-auto text-xs text-gray-600">
                    {error.message}
                  </pre>
                </div>
              )}

              <div className="flex gap-3">
                {showReset && (
                  <Button
                    onClick={this.handleReset}
                    className="flex-1"
                    variant="primary"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tekrar Dene
                  </Button>
                )}
                <Button
                  onClick={() => (window.location.href = '/')}
                  className="flex-1"
                  variant="outline"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ana Sayfa
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Section-level error (card)
    if (level === 'section') {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {errorTitle || 'Bu Bölüm Yüklenemedi'}
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">
              {errorMessage || 'Bir hata oluştu. Lütfen sayfayı yenileyin.'}
            </p>

            {isDevelopment && error && (
              <div className="mx-auto mb-4 max-w-md rounded-lg bg-white p-3 text-left">
                <p className="mb-2 text-xs font-semibold text-gray-700">
                  Hata:
                </p>
                <pre className="overflow-x-auto text-xs text-gray-600">
                  {error.message}
                </pre>
              </div>
            )}

            {showReset && (
              <Button onClick={this.handleReset} size="sm" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Tekrar Dene
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    // Component-level error (inline)
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {errorTitle || 'Yükleme hatası'}
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {errorMessage || 'Bu bileşen yüklenemedi.'}
            </p>
            {isDevelopment && error && (
              <pre className="mt-2 overflow-x-auto text-xs text-gray-500">
                {error.message}
              </pre>
            )}
          </div>
          {showReset && (
            <button
              onClick={this.handleReset}
              className="text-sm text-red-600 hover:text-red-700"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
}

// ============================================================================
// FUNCTIONAL ERROR BOUNDARY (Hook-based wrapper)
// ============================================================================

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}

// ============================================================================
// PRE-CONFIGURED ERROR BOUNDARIES
// ============================================================================

export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      level="page"
      showReset={true}
      errorTitle="Sayfa Yüklenemedi"
      errorMessage="Bu sayfayı yüklerken bir sorun oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin."
    >
      {children}
    </ErrorBoundary>
  );
}

export function SectionErrorBoundary({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <ErrorBoundary
      level="section"
      showReset={true}
      errorTitle={title || 'Bölüm Yüklenemedi'}
    >
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary level="component" showReset={false}>
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
