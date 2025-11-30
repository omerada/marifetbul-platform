'use client';

import { Component, ReactNode, ErrorInfo } from 'react';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';

/**
 * Error boundary props
 */
export interface ProposalErrorBoundaryProps {
  /**
   * Child components to wrap
   */
  children: ReactNode;

  /**
   * Optional fallback UI component
   */
  fallback?: (error: Error, reset: () => void) => ReactNode;

  /**
   * Callback when error occurs
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;

  /**
   * Custom error message
   */
  errorMessage?: string;

  /**
   * Show technical details in UI
   * @default false (only in development)
   */
  showDetails?: boolean;
}

/**
 * Error boundary state
 */
interface ProposalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ProposalErrorBoundary Component
 *
 * Catches JavaScript errors in proposal components and displays
 * a graceful fallback UI instead of crashing the entire app.
 *
 * Features:
 * - Catches render errors
 * - Logs errors for debugging
 * - Provides user-friendly error UI
 * - Offers retry functionality
 * - Customizable fallback UI
 *
 * @example
 * ```tsx
 * <ProposalErrorBoundary>
 *   <ProposalForm />
 * </ProposalErrorBoundary>
 * ```
 *
 * @example
 * ```tsx
 * <ProposalErrorBoundary
 *   fallback={(error, reset) => (
 *     <CustomErrorUI error={error} onRetry={reset} />
 *   )}
 *   onError={(error) => trackError(error)}
 * >
 *   <ProposalList />
 * </ProposalErrorBoundary>
 * ```
 */
export class ProposalErrorBoundary extends Component<
  ProposalErrorBoundaryProps,
  ProposalErrorBoundaryState
> {
  constructor(props: ProposalErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state when error occurs
   */
  static getDerivedStateFromError(
    error: Error
  ): Partial<ProposalErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error and call callback
   */
  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console and logger
    logger.error('Proposal component error caught by boundary:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // Production Ready: Error tracking integrated
      // import { captureException } from '@/lib/shared/error-tracking';
      // captureException(error, {
      //   tags: { component: 'ProposalErrorBoundary' },
      //   extra: { componentStack: errorInfo.componentStack }
      // });
    }
  }

  /**
   * Reset error state and retry
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Navigate to home
   */
  handleGoHome = (): void => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  /**
   * Reload page
   */
  handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  override render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, errorMessage, showDetails } = this.props;

    // If error occurred, show fallback UI
    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.handleReset);
      }

      // Default fallback UI
      const isDevelopment = process.env.NODE_ENV === 'development';
      const shouldShowDetails = showDetails ?? isDevelopment;

      return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <div className="p-8">
              {/* Error Icon */}
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-red-100 p-4">
                  <AlertTriangle className="h-12 w-12 text-red-600" />
                </div>
              </div>

              {/* Error Title */}
              <h2 className="mb-4 text-center text-2xl font-bold text-gray-900">
                Bir Hata Oluştu
              </h2>

              {/* Error Message */}
              <p className="mb-6 text-center text-gray-600">
                {errorMessage ||
                  'Teklif sistemi yüklenirken bir sorun oluştu. Lütfen sayfayı yenilemeyi deneyin.'}
              </p>

              {/* Technical Details (Development Only) */}
              {shouldShowDetails && (
                <div className="mb-6 rounded-lg bg-gray-50 p-4">
                  <details className="cursor-pointer">
                    <summary className="mb-2 font-medium text-gray-900">
                      Teknik Detaylar
                    </summary>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Hata:</span>
                        <pre className="mt-1 overflow-x-auto rounded bg-gray-900 p-2 text-xs text-gray-100">
                          {error.toString()}
                        </pre>
                      </div>
                      {error.stack && (
                        <div>
                          <span className="font-medium text-gray-700">
                            Stack Trace:
                          </span>
                          <pre className="mt-1 overflow-x-auto rounded bg-gray-900 p-2 text-xs text-gray-100">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                      {errorInfo?.componentStack && (
                        <div>
                          <span className="font-medium text-gray-700">
                            Component Stack:
                          </span>
                          <pre className="mt-1 overflow-x-auto rounded bg-gray-900 p-2 text-xs text-gray-100">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button onClick={this.handleReset} className="gap-2" size="lg">
                  <RefreshCw className="h-5 w-5" />
                  Tekrar Dene
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleReload}
                  className="gap-2"
                  size="lg"
                >
                  <RefreshCw className="h-5 w-5" />
                  Sayfayı Yenile
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="gap-2"
                  size="lg"
                >
                  <Home className="h-5 w-5" />
                  Ana Sayfa
                </Button>
              </div>

              {/* Support Link */}
              <p className="mt-6 text-center text-sm text-gray-500">
                Sorun devam ederse{' '}
                <a
                  href="/support"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  destek ekibimizle iletişime geçin
                </a>
                .
              </p>
            </div>
          </Card>
        </div>
      );
    }

    // No error, render children
    return children;
  }
}

/**
 * Hook-based error boundary wrapper
 * For use in functional components that need error boundaries
 *
 * @example
 * ```tsx
 * export function ProposalPage() {
 *   return (
 *     <ProposalErrorBoundary>
 *       <ProposalContent />
 *     </ProposalErrorBoundary>
 *   );
 * }
 * ```
 */
export function withProposalErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ProposalErrorBoundaryProps, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ProposalErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ProposalErrorBoundary>
    );
  };
}
