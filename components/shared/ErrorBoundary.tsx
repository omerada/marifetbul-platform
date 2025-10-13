'use client';

/**
 * Global Error Boundary Component
 *
 * Catches React errors and reports them to monitoring systems
 * Provides fallback UI for better user experience
 *
 * Features:
 * - Automatic error capture
 * - Sentry integration
 * - User context tracking
 * - Custom error messages
 * - Recovery actions
 */

import React, { Component, ReactNode } from 'react';
import Link from 'next/link';
import { captureSentryError } from '@/lib/infrastructure/monitoring';
import logger from '@/lib/infrastructure/monitoring/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches errors in child components and provides fallback UI
 */
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
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to monitoring systems
    logger.error('React Error Boundary caught error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Capture in Sentry with component stack
    captureSentryError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 text-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-16 w-16"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>

              <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                Bir Hata Oluştu
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Üzgünüz, bir şeyler yanlış gitti. Teknik ekibimiz
                bilgilendirildi.
              </p>

              {this.props.showDetails && this.state.error && (
                <div className="mt-4 rounded-lg bg-red-50 p-4 text-left">
                  <p className="text-sm font-medium text-red-800">
                    Hata Detayı:
                  </p>
                  <pre className="mt-2 overflow-auto text-xs text-red-700">
                    {this.state.error.message}
                  </pre>

                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-medium text-red-800">
                        Component Stack
                      </summary>
                      <pre className="mt-2 max-h-40 overflow-auto text-xs text-red-700">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={this.handleReset}
                  className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-600 inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  Tekrar Dene
                </button>

                <Link
                  href="/"
                  className="focus:ring-primary-600 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  Ana Sayfaya Dön
                </Link>
              </div>

              <div className="mt-6">
                <p className="text-xs text-gray-500">
                  Sorun devam ederse{' '}
                  <a
                    href="/support"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    destek ekibimizle
                  </a>{' '}
                  iletişime geçin.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Simple Error Fallback Component
 */
export function SimpleErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError?: () => void;
}): JSX.Element {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">Bir hata oluştu</h3>
          <p className="mt-1 text-sm text-red-700">{error.message}</p>
          {resetError && (
            <button
              onClick={resetError}
              className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
            >
              Tekrar dene →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
