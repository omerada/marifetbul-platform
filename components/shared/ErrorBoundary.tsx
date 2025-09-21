'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // TODO: Integrate with error tracking service (Sentry, Bugsnag, etc.)
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Example: Send to your error tracking service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport),
      // });

      console.log('Error report prepared:', errorReport);
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  };

  private handleRefresh = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public override render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
          <div className="mx-auto max-w-max">
            <main className="sm:flex">
              <div className="flex items-center justify-center">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <div className="sm:ml-6">
                <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                    Bir hata oluştu
                  </h1>
                  <p className="mt-4 text-base text-gray-500">
                    Beklenmeyen bir hata oluştu. Lütfen sayfayı yenilemeyi
                    deneyin.
                  </p>

                  {process.env.NODE_ENV === 'development' &&
                    this.state.error && (
                      <details className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                        <summary className="cursor-pointer font-medium text-red-800">
                          Hata Detayları (Development)
                        </summary>
                        <div className="mt-2 text-sm text-red-700">
                          <p>
                            <strong>Hata:</strong> {this.state.error.message}
                          </p>
                          {this.state.error.stack && (
                            <pre className="mt-2 overflow-auto text-xs whitespace-pre-wrap">
                              {this.state.error.stack}
                            </pre>
                          )}
                          {this.state.errorInfo?.componentStack && (
                            <pre className="mt-2 overflow-auto text-xs whitespace-pre-wrap">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          )}
                        </div>
                      </details>
                    )}

                  <div className="mt-6 flex space-x-4">
                    <button
                      onClick={this.handleRefresh}
                      className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sayfayı Yenile
                    </button>
                    <button
                      onClick={this.handleGoHome}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Ana Sayfaya Dön
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for easier usage
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}

// Hook for functional components to trigger error boundary
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}

export default ErrorBoundary;
