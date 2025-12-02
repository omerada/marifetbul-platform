/**
 * ================================================
 * ERROR BOUNDARY COMPONENTS
 * ================================================
 * Production-ready error boundary system
 * Provides graceful error handling at different levels
 *
 * @module components/ui/ErrorBoundary
 * @version 1.0.0
 * @production-ready ✅
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: unknown[];
  level?: 'page' | 'section' | 'component';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ============================================================================
// BASE ERROR BOUNDARY
// ============================================================================

class BaseErrorBoundary extends Component<
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

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, level = 'component' } = this.props;

    // Log to monitoring system
    logger.error(`Error boundary caught error at ${level} level`, error, {
      componentStack: errorInfo.componentStack,
      level,
    });

    // Call custom error handler if provided
    onError?.(error, errorInfo);
  }

  override componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    if (
      hasError &&
      resetKeys &&
      prevProps.resetKeys &&
      resetKeys.some((key, index) => key !== prevProps.resetKeys![index])
    ) {
      this.resetError();
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  override render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, level = 'component' } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      // Default fallback based on level
      return this.renderDefaultFallback(error!, level);
    }

    return children;
  }

  private renderDefaultFallback(
    error: Error,
    level: 'page' | 'section' | 'component'
  ): ReactNode {
    if (level === 'page') {
      return <PageErrorFallback error={error} onReset={this.resetError} />;
    }

    if (level === 'section') {
      return <SectionErrorFallback error={error} onReset={this.resetError} />;
    }

    return <ComponentErrorFallback error={error} onReset={this.resetError} />;
  }
}

// ============================================================================
// ERROR FALLBACK COMPONENTS
// ============================================================================

interface ErrorFallbackProps {
  error: Error;
  onReset: () => void;
}

function PageErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Bir Hata Oluştu
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          {error.message || 'Beklenmeyen bir hata oluştu'}
        </p>
        <div className="space-y-3">
          <button
            onClick={onReset}
            className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <RefreshCw className="h-4 w-4" />
            Tekrar Dene
          </button>
          <a
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Home className="h-4 w-4" />
            Ana Sayfaya Dön
          </a>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              Hata Detayları (Dev)
            </summary>
            <pre className="mt-2 overflow-auto rounded-lg bg-gray-100 p-4 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

function SectionErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-red-100 p-2 dark:bg-red-900">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
            Bu Bölüm Yüklenemedi
          </h3>
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            {error.message || 'Beklenmeyen bir hata oluştu'}
          </p>
          <button
            onClick={onReset}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 inline-flex items-center gap-2 text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Tekrar Dene
          </button>
        </div>
      </div>
    </div>
  );
}

function ComponentErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="rounded border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-200">
        <AlertTriangle className="h-4 w-4" />
        <span>Hata: {error.message || 'Yükleme başarısız'}</span>
        <button
          onClick={onReset}
          className="ml-auto text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// SPECIALIZED ERROR BOUNDARIES
// ============================================================================

export function PageErrorBoundary({
  children,
  ...props
}: Omit<ErrorBoundaryProps, 'level'>) {
  return (
    <BaseErrorBoundary level="page" {...props}>
      {children}
    </BaseErrorBoundary>
  );
}

export function SectionErrorBoundary({
  children,
  ...props
}: Omit<ErrorBoundaryProps, 'level'>) {
  return (
    <BaseErrorBoundary level="section" {...props}>
      {children}
    </BaseErrorBoundary>
  );
}

export function ComponentErrorBoundary({
  children,
  ...props
}: Omit<ErrorBoundaryProps, 'level'>) {
  return (
    <BaseErrorBoundary level="component" {...props}>
      {children}
    </BaseErrorBoundary>
  );
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default PageErrorBoundary;
