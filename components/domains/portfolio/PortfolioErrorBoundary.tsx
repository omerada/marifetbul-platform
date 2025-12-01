/**
 * Portfolio Error Boundary
 * Sprint 2: Story 4.3 - Error Boundaries
 *
 * Robust error handling for portfolio components
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ============================================================================
// PORTFOLIO ERROR BOUNDARY
// ============================================================================

export class PortfolioErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    logger.error('Portfolio Error Boundary caught an error:', error, {
      component: 'PortfolioErrorBoundary',
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Here you can also send error to monitoring service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  override render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="w-full max-w-md text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Bir Şeyler Yanlış Gitti
            </h2>

            <p className="mb-6 text-sm text-gray-600">
              Portföy yüklenirken bir hata oluştu. Lütfen sayfayı yenilemeyi
              deneyin.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 rounded-lg bg-gray-100 p-4 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  Hata Detayları (Sadece geliştirme ortamında)
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-red-600">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              aria-label="Sayfayı yenile"
            >
              <RefreshCw className="h-4 w-4" />
              Tekrar Dene
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// ERROR FALLBACK COMPONENT
// ============================================================================

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
}

export function PortfolioErrorFallback({
  error,
  resetError,
  title = 'Bir Hata Oluştu',
  message = 'İçerik yüklenirken bir sorun oluştu.',
}: ErrorFallbackProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="mb-1 text-sm font-medium text-red-800">{title}</h3>
          <p className="mb-3 text-sm text-red-700">{message}</p>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="mb-3">
              <summary className="cursor-pointer text-xs text-red-600">
                Teknik Detaylar
              </summary>
              <pre className="mt-1 overflow-auto rounded bg-red-100 p-2 text-xs text-red-800">
                {error.toString()}
              </pre>
            </details>
          )}

          {resetError && (
            <button
              onClick={resetError}
              className="inline-flex items-center gap-1 text-sm font-medium text-red-700 hover:text-red-800"
            >
              <RefreshCw className="h-4 w-4" />
              Tekrar Dene
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPACT ERROR BOUNDARY (for smaller sections)
// ============================================================================

interface CompactErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
}

export class CompactErrorBoundary extends Component<
  CompactErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: CompactErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(
      `Error in ${this.props.componentName || 'component'}:`,
      error,
      { component: 'PortfolioErrorBoundary', errorInfo }
    );
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4" />
            <span>Yükleme hatası</span>
            <button
              onClick={this.handleReset}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
