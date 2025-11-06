/**
 * ================================================
 * TRANSACTION DISPLAY ERROR BOUNDARY
 * ================================================
 * Error boundary wrapper for TransactionDisplay component
 * Catches and handles runtime errors gracefully
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1 Task 1.3
 */

'use client';

import { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Fallback UI to render on error */
  fallback?: ReactNode;
  /** Called when error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Show retry button */
  showRetry?: boolean;
  /** Custom error message */
  errorMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// ============================================================================
// COMPONENT
// ============================================================================

export class TransactionDisplayErrorBoundary extends Component<
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
    logger.error('TransactionDisplay Error Boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context: 'TransactionDisplay',
    });

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  override render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, showRetry = true, errorMessage } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <Card className="border-red-200 bg-red-50 p-8">
          <div className="flex flex-col items-center text-center">
            {/* Error Icon */}
            <div className="mb-4 rounded-full bg-red-100 p-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>

            {/* Error Title */}
            <h3 className="mb-2 text-lg font-semibold text-red-900">
              İşlem Görüntüleme Hatası
            </h3>

            {/* Error Message */}
            <p className="mb-4 max-w-md text-sm text-red-700">
              {errorMessage ||
                'İşlemler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.'}
            </p>

            {/* Technical Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mb-4 w-full max-w-2xl">
                <summary className="cursor-pointer text-sm font-medium text-red-800 hover:text-red-900">
                  Teknik Detaylar (Geliştirici Modu)
                </summary>
                <div className="mt-2 rounded-lg bg-red-100 p-4 text-left">
                  <p className="mb-2 font-mono text-xs text-red-900">
                    <strong>Hata:</strong> {error.message}
                  </p>
                  {error.stack && (
                    <pre className="overflow-auto text-xs text-red-800">
                      {error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {showRetry && (
                <Button
                  onClick={this.handleRetry}
                  variant="primary"
                  size="md"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tekrar Dene
                </Button>
              )}

              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="md"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Sayfayı Yenile
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    return children;
  }
}

// ============================================================================
// CONVENIENCE WRAPPER
// ============================================================================

/**
 * Higher-order component to wrap any component with error boundary
 * Usage: const SafeComponent = withErrorBoundary(MyComponent);
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const ComponentWithErrorBoundary = (props: P) => (
    <TransactionDisplayErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </TransactionDisplayErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return ComponentWithErrorBoundary;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default TransactionDisplayErrorBoundary;
